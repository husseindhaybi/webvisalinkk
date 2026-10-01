#!/usr/bin/env bash
# Deploys the site to a VPS that may already host other sites.
#
#   sudo bash deploy.sh visalinkklebanon.com www.visalinkklebanon.com
#
# It builds the site from GitHub, puts it in /var/www/visalinkk, and adds ONE
# site block for the given domains to the web server already on the machine
# (nginx or Caddy). Other sites' configs are never edited. Every config change
# is validated before reload and rolled back if the web server rejects it.
# Run it again at any time to publish the latest version.
#
# Env: BRANCH (default main), REPO (default the public GitHub repo),
#      HTTPS=0 to skip the Let's Encrypt certificate.
set -euo pipefail

REPO="${REPO:-https://github.com/husseindhaybi/webvisalinkk.git}"
BRANCH="${BRANCH:-main}"
HTTPS="${HTTPS:-1}"
NAME=visalinkk
SRC=/opt/$NAME/src
WEB=/var/www/$NAME

say() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
die() { printf '\n\033[1;31mERROR: %s\033[0m\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "run as root (sudo bash deploy.sh ...)"
[ $# -ge 1 ] || die "give at least one domain, e.g.: sudo bash deploy.sh visalinkklebanon.com www.visalinkklebanon.com"
DOMAINS=("$@")

# --- 1. Which web server owns port 80? -------------------------------------
say "Checking what is serving port 80"
LISTENER="$(ss -ltnpH 'sport = :80' 2>/dev/null || true)"
echo "${LISTENER:-nothing is listening on port 80}"
case "$LISTENER" in
  *'"nginx"'*) SERVER=nginx ;;
  *'"caddy"'*) SERVER=caddy ;;
  '') SERVER=none ;;
  *) die "port 80 belongs to something other than nginx or Caddy (see the line above: docker-proxy usually means Coolify, Dokploy or Traefik). Nothing was changed. Add the site through that panel instead, or send this output to your developer." ;;
esac
echo "Web server: $SERVER"

# --- 2. Tools: git and Node 22 ---------------------------------------------
export DEBIAN_FRONTEND=noninteractive
command -v apt-get >/dev/null || die "this script expects Ubuntu/Debian (apt-get)"
need_apt=()
command -v git  >/dev/null || need_apt+=(git)
command -v curl >/dev/null || need_apt+=(curl ca-certificates)
[ "$SERVER" = none ] && need_apt+=(nginx)
if [ ${#need_apt[@]} -gt 0 ]; then
  say "Installing: ${need_apt[*]}"
  apt-get update -qq && apt-get install -y -qq "${need_apt[@]}"
fi
[ "$SERVER" = none ] && { SERVER=nginx; systemctl enable --now nginx; }

node_major="$(node -v 2>/dev/null | sed 's/^v\([0-9]*\).*/\1/' || true)"
if [ -z "$node_major" ] || [ "$node_major" -lt 20 ]; then
  say "Installing Node.js 22 (needed only to build the site)"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y -qq nodejs
fi

# --- 3. Build ---------------------------------------------------------------
say "Fetching $BRANCH from $REPO"
if [ -d "$SRC/.git" ]; then
  git -C "$SRC" fetch --depth 1 origin "$BRANCH"
  git -C "$SRC" checkout -q -B "$BRANCH" FETCH_HEAD
else
  mkdir -p "$(dirname "$SRC")"
  git clone -q --depth 1 --branch "$BRANCH" "$REPO" "$SRC"
fi

say "Building"
(cd "$SRC" && npm ci --no-audit --no-fund --loglevel=error && npm run build)

# Each release goes in its own folder; "current" is switched in one step.
release="$WEB/releases/$(date +%Y%m%d%H%M%S)"
mkdir -p "$release"
cp -a "$SRC/dist/." "$release/"
ln -sfn "$release" "$WEB/current.tmp" && mv -Tf "$WEB/current.tmp" "$WEB/current"
ls -1dt "$WEB"/releases/* | tail -n +4 | xargs -r rm -rf   # keep the last 3
chmod -R a+rX "$WEB"

# --- 4. Web server config ----------------------------------------------------
if [ "$SERVER" = nginx ]; then
  if [ -d /etc/nginx/sites-available ]; then
    CONF=/etc/nginx/sites-available/$NAME
    LINK=/etc/nginx/sites-enabled/$NAME
  else
    CONF=/etc/nginx/conf.d/$NAME.conf
    LINK=
  fi
  # Keep the HTTPS lines certbot added on a previous run.
  if [ -f "$CONF" ] && grep -q 'managed by Certbot' "$CONF"; then
    say "nginx config already has HTTPS; updating server_name only"
    cp "$CONF" "$CONF.bak"
    sed -i -E "s|^(\s*server_name)\s.*;|\1 ${DOMAINS[*]};|" "$CONF"
  else
    say "Writing $CONF"
    [ -f "$CONF" ] && cp "$CONF" "$CONF.bak"
    cat > "$CONF" <<EOF
# VisaLinkk Lebanon — written by deploy/deploy.sh
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAINS[*]};

    root $WEB/current;
    index index.html;

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
    }
    location / {
        add_header Cache-Control "no-cache";
        try_files \$uri \$uri/ /index.html;
    }

    gzip on;
    gzip_types text/css application/javascript image/svg+xml application/json;
}
EOF
  fi
  [ -n "$LINK" ] && ln -sfn "$CONF" "$LINK"
  if ! nginx -t; then
    if [ -f "$CONF.bak" ]; then mv "$CONF.bak" "$CONF"; else rm -f "$CONF" ${LINK:+"$LINK"}; fi
    die "nginx rejected the config; it was rolled back and the server was NOT reloaded"
  fi
  rm -f "$CONF.bak"
  systemctl reload nginx

  if [ "$HTTPS" = 1 ]; then
    say "HTTPS certificate (Let's Encrypt)"
    command -v certbot >/dev/null || apt-get install -y -qq certbot python3-certbot-nginx
    args=(); for d in "${DOMAINS[@]}"; do args+=(-d "$d"); done
    if certbot --nginx --non-interactive --agree-tos --register-unsafely-without-email \
         --redirect --cert-name "$NAME" "${args[@]}"; then
      echo "HTTPS is on."
    else
      echo "Could not get a certificate yet. Usually the domain does not point to this server yet."
      echo "The site still works on http://. Once DNS is set, run this script again."
    fi
  fi

elif [ "$SERVER" = caddy ]; then
  CADDYFILE=/etc/caddy/Caddyfile
  say "Adding the site to $CADDYFILE (Caddy handles HTTPS itself)"
  cp "$CADDYFILE" "$CADDYFILE.bak"
  # Drop a block from an earlier run, then append the fresh one.
  sed -i '/^# BEGIN visalinkk$/,/^# END visalinkk$/d' "$CADDYFILE"
  {
    echo "# BEGIN visalinkk"
    echo "$(IFS=,; echo "${DOMAINS[*]}" | sed 's/,/, /g') {"
    echo "    root * $WEB/current"
    echo "    encode gzip"
    echo "    try_files {path} /index.html"
    echo "    file_server"
    echo "}"
    echo "# END visalinkk"
  } >> "$CADDYFILE"
  if ! caddy validate --config "$CADDYFILE" --adapter caddyfile >/dev/null; then
    mv "$CADDYFILE.bak" "$CADDYFILE"
    die "Caddy rejected the config; it was rolled back and Caddy was NOT reloaded"
  fi
  systemctl reload caddy
fi

say "Done. The site is live at:"
for d in "${DOMAINS[@]}"; do echo "   http://$d"; done
