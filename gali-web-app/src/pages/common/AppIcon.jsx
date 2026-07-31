const iconPaths = {
  home:
    'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  sports_esports:
    'M6 13h4v-2H6v2zm8 0h4v-2h-4v2zm-4-2h4v2h-4v-2zm0 4h4v2h-4v-2zM4 6h16c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2h-5l-2 2h-2l-2-2H4c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2z',
  account_balance_wallet:
    'M21 7H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 8h-4v-2h4v2zM5 5h14v2H5V5z',
  stadia_controller:
    'M6 10h12c2.21 0 4 1.79 4 4 0 1.66-1.34 3-3 3-1.38 0-2.5-1.12-2.5-2.5V14h-9v.5C7.5 15.88 6.38 17 5 17c-1.66 0-3-1.34-3-3 0-2.21 1.79-4 4-4zm2 1v2h2v-2h2V9h-2V7H8v2H6v2h2zm9.5 2c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm-2 3c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z',
  person:
    'M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  history:
    'M13 3a9 9 0 1 0 8.95 10h-2.02A7 7 0 1 1 13 5c1.93 0 3.68.78 4.95 2.05L15 10h7V3l-2.62 2.62A8.96 8.96 0 0 0 13 3zm-1 5v6l5.25 3.15.75-1.23-4.5-2.67V8H12z',
  sports_score:
    'M3 5h18v14H3V5zm2 2v10h14V7H5zm1 4h2v2H6v-2zm10 0h2v2h-2v-2zm-5 0h2v2h-2v-2z',
  description:
    'M6 2h9l5 5v15c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2zm8 1.5V8h4.5L14 3.5zM8 12h8v-2H8v2zm0 4h8v-2H8v2z',
  group:
    'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.95 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
  chat:
    'M4 4h16c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H7l-5 4V6c0-1.1.9-2 2-2z',
  support_agent:
    'M12 1a9 9 0 0 0-9 9v4c0 1.1.9 2 2 2h2v-6H5v-1a7 7 0 1 1 14 0v1h-2v6h2a2 2 0 0 0 2-2v-4a9 9 0 0 0-9-9zm-3 14h6v2H9v-2z',
  logout:
    'M10 17v-2h4V9h-4V7h4c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2h-4zM8.09 16.59 3.5 12l4.59-4.59L9.5 8.82 7.32 11H14v2H7.32l2.18 2.18-1.41 1.41z',
  menu:
    'M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z',
  notifications:
    'M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22zm7-6V11a7 7 0 1 0-14 0v5L3 18v1h18v-1l-2-2z',
  close:
    'M18.3 5.71 12 12l6.3 6.29-1.42 1.42L10.59 13.4 4.29 19.71 2.88 18.3 9.17 12 2.88 5.71 4.29 4.29l6.3 6.3 6.29-6.3z',
}

function AppIcon({ name, className = '' }) {
  const path = iconPaths[name]
  if (!path) return null

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`app-icon ${className}`.trim()}
      focusable="false"
    >
      <path d={path} />
    </svg>
  )
}

export default AppIcon
