export default function createGradientBg() {
  return `
    <svg width="1200" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2563eb" />
          <stop offset="30%" stop-color="#1e40af" />
          <stop offset="70%" stop-color="#1e3a8a" />
          <stop offset="100%" stop-color="#1d4ed8" />
        </linearGradient>
        
        <!-- Enhanced patterns for visual interest -->
        <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="1.5" fill="#ffffff" fill-opacity="0.08" />
        </pattern>
        
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" stroke-width="0.5" stroke-opacity="0.06" />
        </pattern>
        
        <pattern id="organic" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M30 10c10 10 20 20 0 30c-20 10 -10 20 0 30" fill="none" stroke="#ffffff" stroke-width="0.8" stroke-opacity="0.04" />
        </pattern>
        
        <!-- Subtle wave effect -->
        <filter id="wave" x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.03" numOctaves="3" seed="2" result="turbulence" />
          <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="25" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        
        <!-- Light overlay for better text contrast -->
        <linearGradient id="topGlow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.12" />
          <stop offset="40%" stop-color="#ffffff" stop-opacity="0.04" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </linearGradient>
        
        <!-- Bottom accent -->
        <linearGradient id="bottomAccent" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.3" />
          <stop offset="50%" stop-color="#2563eb" stop-opacity="0.1" />
          <stop offset="100%" stop-color="#0ea5e9" stop-opacity="0.2" />
        </linearGradient>
      </defs>
      
      <!-- Base gradient background -->
      <rect width="100%" height="100%" fill="url(#blueGradient)" />
      
      <!-- Pattern overlays for texture -->
      <rect width="100%" height="100%" fill="url(#dots)" opacity="1.0" />
      <rect width="100%" height="100%" fill="url(#grid)" opacity="0.7" />
      <rect width="100%" height="100%" fill="url(#organic)" opacity="0.5" />
      
      <!-- Subtle wave overlay for organic feel -->
      <rect width="100%" height="100%" fill="#ffffff" opacity="0.02" filter="url(#wave)" />
      
      <!-- Light gradient at the top for better text contrast -->
      <rect width="100%" height="100%" fill="url(#topGlow)" />
      
      <!-- Bottom accent for depth -->
      <rect width="100%" height="30%" y="70%" fill="url(#bottomAccent)" />
    </svg>
  `;
}
