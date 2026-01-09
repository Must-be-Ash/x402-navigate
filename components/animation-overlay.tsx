'use client';

import { useEffect, useState } from 'react';
import { ExplosionAnimation } from './explosion-animation';

interface AnimationOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  originX?: number;
  originY?: number;
}

export function AnimationOverlay({ isVisible, onClose, originX, originY }: AnimationOverlayProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setShowContent(false);
    }
  }, [isVisible]);

  const handleAnimationComplete = () => {
    setShowContent(true);
    // Auto-close after animation completes
    setTimeout(() => {
      onClose();
    }, 500);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        opacity: showContent ? 0 : 1,
        transition: 'opacity 0.5s ease-out',
        pointerEvents: 'none',
      }}
    >
      <ExplosionAnimation onComplete={handleAnimationComplete} originX={originX} originY={originY} />
    </div>
  );
}
