'use client';

import { useState, useEffect } from 'react';
import { XASCIIAnimation } from './ascii-animation';

export function LoadingScreen({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    // Show animation only on first visit (once per browser tab session)
    const hasSeenAnimation = sessionStorage.getItem('hasSeenAnimation');

    if (hasSeenAnimation) {
      // Skip animation - already shown in this session
      setIsLoading(false);
      setShowContent(true);
    } else {
      // First visit - show animation
      setShouldAnimate(true);
      sessionStorage.setItem('hasSeenAnimation', 'true');
    }
  }, []);

  const handleAnimationComplete = () => {
    // Immediately start showing content
    setShowContent(true);
    // Quick fade out of loading screen
    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  };

  return (
    <>
      {/* Loading Screen */}
      {isLoading && shouldAnimate && (
        <div
          className="fixed inset-0 bg-background z-50 transition-opacity duration-500"
          style={{ opacity: isLoading ? 1 : 0 }}
        >
          <XASCIIAnimation onComplete={handleAnimationComplete} />
        </div>
      )}

      {/* Main Content */}
      <div
        className="transition-opacity duration-700"
        style={{ opacity: showContent ? 1 : 0 }}
      >
        {children}
      </div>
    </>
  );
}
