import React from 'react';

interface UniteXLogoProps {
  size?: number;
  className?: string;
  theme?: 'dark' | 'light';
}

export function UniteXLogo({ size = 200, className = '', theme = 'dark' }: UniteXLogoProps) {
  const isDark = theme === 'dark';
  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const accentColor = isDark ? '#FFFFFF' : '#3B82F6';
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* iOS-style rounded square background */}
      <rect
        width="1024"
        height="1024"
        rx="226"
        fill={bgColor}
      />
      
      {/* Main U Letter - bold and centered */}
      <path
        d="M 320 280 L 320 560 Q 320 720 512 720 Q 704 720 704 560 L 704 280"
        stroke={accentColor}
        strokeWidth="110"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Sharp X accent - more angular and prominent */}
      <g>
        {/* First diagonal - sharp edges */}
        <path
          d="M 560 320 L 660 420"
          stroke={accentColor}
          strokeWidth="55"
          strokeLinecap="square"
        />
        {/* Second diagonal - sharp edges */}
        <path
          d="M 660 320 L 560 420"
          stroke={accentColor}
          strokeWidth="55"
          strokeLinecap="square"
        />
        {/* Add subtle glow effect for light mode */}
        {!isDark && (
          <>
            <path
              d="M 560 320 L 660 420"
              stroke={accentColor}
              strokeWidth="70"
              strokeLinecap="square"
              opacity="0.15"
            />
            <path
              d="M 660 320 L 560 420"
              stroke={accentColor}
              strokeWidth="70"
              strokeLinecap="square"
              opacity="0.15"
            />
          </>
        )}
      </g>
    </svg>
  );
}
