'use client';

import React, { useState, useRef, MouseEvent, TouchEvent } from 'react';

interface PresetSliderProps {
  beforeImage: string;
  afterImage: string;
  labelBefore?: string;
  labelAfter?: string;
}

export const PresetSlider: React.FC<PresetSliderProps> = ({
  beforeImage,
  afterImage,
  labelBefore = 'Original',
  labelAfter = 'Lola Workia Preset',
}) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPos(percentage);
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      style={{
        position: 'relative',
        width: '100%',
        height: '340px',
        overflow: 'hidden',
        borderRadius: 'var(--radius-md)',
        cursor: 'ew-resize',
        userSelect: 'none',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {/* After Image (Background - Presets Grade) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${afterImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: beforeImage === afterImage ? 'contrast(1.14) brightness(1.05) saturate(1.25) sepia(0.12) hue-rotate(-5deg)' : undefined,
        }}
      >
        <span
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            background: 'rgba(212, 175, 55, 0.85)',
            color: '#090a0f',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.2rem 0.6rem',
            borderRadius: 'var(--radius-full)',
          }}
        >
          {labelAfter}
        </span>
      </div>

      {/* Before Image (Clipped overlay) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: `${sliderPos}%`,
          backgroundImage: `url(${beforeImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          overflow: 'hidden',
          borderRight: '2px solid var(--accent-gold)',
        }}
      >
        <span
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'var(--text-primary)',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.2rem 0.6rem',
            borderRadius: 'var(--radius-full)',
          }}
        >
          {labelBefore}
        </span>
      </div>

      {/* Slider Line & Handle */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${sliderPos}%`,
          transform: 'translateX(-50%)',
          width: '2px',
          background: 'var(--accent-gold)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'var(--accent-gold)',
            color: '#090a0f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.8rem',
            boxShadow: '0 0 15px rgba(0, 0, 0, 0.5)',
          }}
        >
          ↔
        </div>
      </div>
    </div>
  );
};
