'use client';
import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
  rotation: number;
  rotationSpeed: number;
  fontSize: number;
  opacity: number;
  life: number;
}

interface ExplosionAnimationProps {
  onComplete?: () => void;
  originX?: number;
  originY?: number;
}

export function ExplosionAnimation({ onComplete, originX, originY }: ExplosionAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size to full viewport
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Get text color from CSS variable
    const textColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--foreground')
      .trim();
    const fillColor = textColor ? `hsl(${textColor} / 0.6)` : 'rgba(0, 0, 0, 0.6)';

    // Initialize particles
    const chars = ['X', '4', '0', '2', 'X4', '40', '02', 'X402'];
    const particleCount = 60; // Can handle more with canvas rendering
    const particles: Particle[] = [];

    const centerX = originX ?? window.innerWidth / 2;
    const centerY = originY ?? window.innerHeight / 2;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const speed = 3 + Math.random() * 5;

      particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        char: chars[Math.floor(Math.random() * chars.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        fontSize: 14 + Math.floor(Math.random() * 3) * 4,
        opacity: 1,
        life: 1,
      });
    }

    particlesRef.current = particles;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const duration = 2500;
      const progress = Math.min(elapsed / duration, 1);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current.forEach((particle) => {
        // Apply gravity
        particle.vy += 0.2;

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Update rotation
        particle.rotation += particle.rotationSpeed;

        // Fade out
        particle.opacity = 1 - progress;

        // Draw particle
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        ctx.globalAlpha = particle.opacity;
        ctx.font = `bold ${particle.fontSize}px Monaco, monospace`;
        ctx.fillStyle = fillColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(particle.char, 0, 0);
        ctx.restore();
      });

      // Complete callback at 70%
      if (progress >= 0.7 && onComplete) {
        onComplete();
        // Clear callback to prevent multiple calls
        onComplete = undefined;
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [originX, originY, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
    />
  );
}
