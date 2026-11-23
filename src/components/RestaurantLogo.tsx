import React from 'react';

interface RestaurantLogoProps {
  size?: number;
}

export const RestaurantLogo: React.FC<RestaurantLogoProps> = ({ size = 44 }) => {
  const borderRadius = Math.max(4, Math.round(size * 0.25));
  const borderWidth = Math.max(1, Math.round(size * 0.04));

  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: `${borderRadius}px`,
      background: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 50%, #f59e0b 100%)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: size > 28 ? '0 6px 20px rgba(234, 88, 12, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.4)' : '0 2px 6px rgba(0,0,0,0.3)',
      border: `${borderWidth}px solid rgba(245, 158, 11, 0.6)`,
      position: 'relative',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* Metallic Shine Overlay */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, height: '50%',
        background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.25), transparent)',
      }} />

      {/* Realistic Chef Crest & Crossed Utensils Icon */}
      <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L14.5 4.5L12 7L9.5 4.5L12 2Z" fill="#FFF" opacity="0.9" />
        <path d="M6 9C6 7.89543 6.89543 7 8 7H16C17.1046 7 18 7.89543 18 9V11H6V9Z" fill="#FFF" fillOpacity="0.95" />
        <path d="M7 13V21M10 13V21M14 13V21M17 13V21" stroke="#FFF" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="12" r="10" stroke="#FFF" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
      </svg>
    </div>
  );
};
