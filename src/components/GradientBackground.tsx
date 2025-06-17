'use client';

import { CSSProperties, useEffect, useState } from 'react';
import createGradientBg from '@/utils/gradientBackground';

export default function GradientBackground({ 
  className,
  style,
  children
}: { 
  className?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
}) {
  const [dataUrl, setDataUrl] = useState<string>('');
  
  useEffect(() => {
    // Create SVG and convert to data URL
    const svgContent = createGradientBg();
    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
    setDataUrl(dataUrl);
  }, []);
  
  return (
    <div 
      className={className} 
      style={{ 
        ...style,
        backgroundImage: dataUrl ? `url("${dataUrl}")` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white' // Ensure text is white as requested
      }}
    >
      {children}
    </div>
  );
}
