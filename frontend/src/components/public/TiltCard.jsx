import React, { useRef, useState, useEffect } from 'react';

/**
 * 3D Tilt Card component
 * Provides smooth 3D mouse tracking tilt and lighting glare.
 * Strictly respects prefers-reduced-motion.
 */
export default function TiltCard({ children, className = '', maxTilt = 12, scale = 1.02 }) {
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0, isHovered: false });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handleMouseMove = (e) => {
    if (reducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const tiltX = ((y - centerY) / centerY) * -maxTilt;
    const tiltY = ((x - centerX) / centerX) * maxTilt;

    setCoords({ x: tiltX, y: tiltY, isHovered: true });
  };

  const handleMouseLeave = () => {
    setCoords({ x: 0, y: 0, isHovered: false });
  };

  const transformStyle = reducedMotion
    ? {}
    : {
        transform: coords.isHovered
          ? `perspective(1000px) rotateX(${coords.x}deg) rotateY(${coords.y}deg) scale3d(${scale}, ${scale}, ${scale})`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transition: coords.isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-in-out'
      };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={transformStyle}
      className={`relative will-change-transform transform-gpu ${className}`}
    >
      {children}
    </div>
  );
}
