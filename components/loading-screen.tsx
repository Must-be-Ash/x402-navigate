'use client';

import { useState } from 'react';
import { XASCIIAnimation } from './ascii-animation';

export function LoadingScreen({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  const handleAnimationComplete = () => {
    // Fade out loading screen
    setTimeout(() => {
      setIsLoading(false);
      // Show content after fade out
      setTimeout(() => {
        setShowContent(true);
      }, 300);
    }, 200);
  };

  return (
    <>
      {/* Loading Screen */}
      {isLoading && (
        <div
          className="fixed inset-0 bg-background z-50 transition-opacity duration-300"
          style={{ opacity: isLoading ? 1 : 0 }}
        >
          <XASCIIAnimation onComplete={handleAnimationComplete} />
        </div>
      )}

      {/* Main Content */}
      <div
        className="transition-opacity duration-500"
        style={{ opacity: showContent ? 1 : 0 }}
      >
        {children}
      </div>
    </>
  );
}
