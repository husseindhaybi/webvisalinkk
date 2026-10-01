const line = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function ArrowIcon(props) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" {...props}>
      <path d="M3.5 10h12.2M11 4.8l5.2 5.2-5.2 5.2" {...line} strokeWidth={1.8} />
    </svg>
  )
}

export function ArrowSwap() {
  return (
    <span className="arrow-swap" aria-hidden="true">
      <ArrowIcon />
      <ArrowIcon />
    </span>
  )
}

export function WhatsAppIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.42.25-.69.25-1.29.18-1.41-.08-.13-.27-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.81 11.81 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.69 1.45h.01c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 0 0-3.48-8.41Z"
      />
    </svg>
  )
}

export function CloseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M6 6l12 12M18 6L6 18" {...line} strokeWidth={1.8} />
    </svg>
  )
}

// Line icons for "Why choose VisaLinkk?", drawn on one 28px grid with one stroke weight.
export function WhyIcon({ name }) {
  const common = { viewBox: '0 0 28 28', 'aria-hidden': true, className: 'why-icon' }
  switch (name) {
    case 'person':
      return (
        <svg {...common}>
          <circle cx="14" cy="9.5" r="4.2" {...line} />
          <path d="M5.5 23.5c.9-4.6 4.3-7.3 8.5-7.3s7.6 2.7 8.5 7.3" {...line} />
        </svg>
      )
    case 'languages':
      return (
        <svg {...common}>
          <path d="M3.5 6.5h12.5v8.5H9.2L5.6 18v-3H3.5z" {...line} />
          <path d="M19 10.5h5.5V19h-2.1v3l-3.6-3h-6.3v-2" {...line} />
          <path d="M7.4 12.6l2.3-4.6 2.3 4.6M8.2 11.2h3" {...line} strokeWidth={1.3} />
        </svg>
      )
    case 'fees':
      return (
        <svg {...common}>
          <path d="M7 3.5h14v21l-2.35-1.6-2.35 1.6-2.3-1.6-2.35 1.6-2.3-1.6L7 24.5z" {...line} />
          <path d="M10.5 9h7M10.5 13h7M10.5 17h4" {...line} />
        </svg>
      )
    case 'folder':
      return (
        <svg {...common}>
          <path d="M3.5 8V21.5a1 1 0 0 0 1 1h19a1 1 0 0 0 1-1V10.5a1 1 0 0 0-1-1H13.2l-2.4-3H4.5a1 1 0 0 0-1 1z" {...line} />
          <path d="M3.5 12.5h21" {...line} />
        </svg>
      )
    case 'link':
      return (
        <svg {...common}>
          <path d="M12 16a5 5 0 0 0 7.1 0l3.4-3.4a5 5 0 0 0-7.1-7.1l-1.6 1.6" {...line} />
          <path d="M16 12a5 5 0 0 0-7.1 0l-3.4 3.4a5 5 0 0 0 7.1 7.1l1.6-1.6" {...line} />
        </svg>
      )
    default:
      return null
  }
}
