export default function createGradientBg() {
  return `
    <svg width="1200" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1F2041" />
          <stop offset="50%" stop-color="#2A2A5A" />
          <stop offset="100%" stop-color="#353570" />
        </linearGradient>
        <pattern id="pattern" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M0 0h60v60H0z" fill="url(#bgGradient)" />
          <path d="M30 30m-25 0a25,25 0 1,0 50,0a25,25 0 1,0 -50,0" fill="none" stroke="#ffffff" stroke-width="0.5" stroke-opacity="0.1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#bgGradient)" />
      <rect width="100%" height="100%" fill="url(#pattern)" opacity="0.5" />
    </svg>
  `;
}
