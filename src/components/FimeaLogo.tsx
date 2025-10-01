import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  color?: string;
}

export const FimeaLogo: React.FC<LogoProps> = ({ 
  size = 32, 
  className = "", 
  color = "#ec4899" 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="32" height="32" rx="8" fill={color}/>
      <path 
        d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4c0 1.33-.65 2.51-1.65 3.24L16 24l1.65-8.76C16.65 14.51 16 13.33 16 12c0-2.21 1.79-4 4-4s4 1.79 4 4c0 1.33-.65 2.51-1.65 3.24L24 24H8l1.65-8.76C8.65 14.51 8 13.33 8 12z" 
        fill="white"
      />
    </svg>
  );
};

export default FimeaLogo;