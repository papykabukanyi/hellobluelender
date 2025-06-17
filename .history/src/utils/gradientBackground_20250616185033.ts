export default function createGradientBg() {
  return `
    <svg width="1200" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1F2041" />
          <stop offset="30%" stop-color="#2A2A5A" />
          <stop offset="70%" stop-color="#353570" />
          <stop offset="100%" stop-color="#4B4B94" />
        </linearGradient>
        
        <!-- Patterns for visual interest -->
        <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="1.5" fill="#ffffff" fill-opacity="0.1" />
        </pattern>
        
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" stroke-width="0.5" stroke-opacity="0.05" />
        </pattern>
        
        <!-- Animated wave effect -->
        <filter id="wave" x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox">
          <feTurbulence type="fractalNoise" baseFrequency="0.01 0.05" numOctaves="2" seed="1" result="turbulence" />
          <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="30" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      
      <!-- Base gradient background -->
      <rect width="100%" height="100%" fill="url(#bgGradient)" />
      
      <!-- Pattern overlays -->
      <rect width="100%" height="100%" fill="url(#dots)" opacity="1.0" />
      <rect width="100%" height="100%" fill="url(#grid)" opacity="0.8" />
      
      <!-- Subtle wave overlay -->
      <rect width="100%" height="100%" fill="#ffffff" opacity="0.03" filter="url(#wave)" />
        <!-- Light gradient at the top for better text contrast -->
      <linearGradient id="topGlow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.1" />
        <stop offset="30%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>
      <rect width="100%" height="100%" fill="url(#topGlow)" />
    </svg>
  `;
}
}
}
