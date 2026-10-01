import { useLang } from '../lib/i18n'
import { anchorTo } from '../lib/scroll'
import { contact } from '../config'
import { useNavLinks } from './Nav'
import { LangToggle } from './LangToggle'
import './Footer.css'

const Maybe = ({ href, children }) => (href ? <a href={href}>{children}</a> : <span>{children}</span>)

export function Footer() {
  const { t, lang } = useLang()
  const links = useNavLinks()
  return (
    <footer className="footer on-dark">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src="/brand/logo-light.png" alt={t.footer.name} width="1400" height="648" loading="lazy" />
          </div>

          <dl className="footer-facts">
            <div>
              <dt className="caps">{t.footer.office}</dt>
              <dd>{contact.address[lang]}</dd>
            </div>
            <div>
              <dt className="caps">{t.footer.contact}</dt>
              <dd>
                <Maybe href={contact.phone.href}>{contact.phone.display}</Maybe>
                <span className="footer-dot" aria-hidden="true">·</span>
                <Maybe href={contact.email.href}>{contact.email.display}</Maybe>
              </dd>
            </div>
            <div>
              <dt className="caps">{t.footer.hours}</dt>
              <dd>{contact.hours[lang]}</dd>
            </div>
          </dl>

          <nav className="footer-nav" aria-label={t.footer.explore}>
            <p className="caps">{t.footer.explore}</p>
            <ul>
              {links.map((l) => (
                <li key={l.id}>
                  <a href={l.id === 'top' ? '#' : `#${l.id}`} onClick={anchorTo(l.id)}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="footer-disclaimer">{t.footer.disclaimer}</p>

        <div className="footer-base">
          <p>
            © {new Date().getFullYear()} {t.footer.name}. {t.footer.rights}
          </p>
          <LangToggle tone="paper" layoutId="lang-pill-footer" />
        </div>
      </div>
    </footer>
  )
}
