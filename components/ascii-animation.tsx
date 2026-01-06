'use client';
import React, { useEffect, useRef, useState } from 'react';

const CELL_SIZE = 60;

interface CellData {
  content: string;
  fontSize: number;
  opacity: number;
}

export function XASCIIAnimation({ onComplete }: { onComplete?: () => void }) {
  const [cells, setCells] = useState<Map<number, CellData>>(new Map());
  const canvasRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const gridDimensionsRef = useRef({ cols: 0, rows: 0 });
  const startTimeRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const updateDimensions = () => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const cols = Math.floor(rect.width / CELL_SIZE);
      const rows = Math.floor(rect.height / CELL_SIZE);
      gridDimensionsRef.current = { cols, rows };
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Generate simple, clean pattern for a cell using X, 4, 0, 2
  const generateCellContent = (numChars: number, fontSize: number) => {
    const chars = ['X', '4', '0', '2'];
    const patterns = [
      // Single character
      [chars[Math.floor(Math.random() * chars.length)]],
      // Two characters
      ['X4', '40', '02', 'X2', '4X', '0X'],
      // Three characters
      ['X40', '402', 'X42', '4X2', 'X 4', '4 0', '0 2'],
      // Four characters
      ['X402', '4 0 2', 'X 4 2', 'X 4 0']
    ];

    const patternSet = patterns[Math.min(numChars - 1, patterns.length - 1)];
    return patternSet[Math.floor(Math.random() * patternSet.length)];
  };

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const { cols, rows } = gridDimensionsRef.current;

      if (cols === 0 || rows === 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const elapsed = timestamp - startTimeRef.current;
      const duration = 2000;
      const progress = Math.min(elapsed / duration, 1);

      const totalCells = cols * rows;
      const newCells = new Map<number, CellData>();

      // Create a gentle wave from center outward
      const centerX = cols / 2;
      const centerY = rows / 2;

      for (let i = 0; i < totalCells; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);

        // Calculate distance from center
        const dx = (col - centerX) / centerX;
        const dy = (row - centerY) / centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Wave propagates outward from center
        const wavePosition = progress * 2; // 0 to 2
        const waveWidth = 0.5;

        // Calculate if this cell should be visible based on wave
        const cellProgress = Math.abs(distance - wavePosition);

        if (cellProgress < waveWidth) {
          // Smooth fade in/out
          const fadeProgress = cellProgress / waveWidth;
          const opacity = Math.sin((1 - fadeProgress) * Math.PI) * 0.5;

          if (opacity > 0.05) {
            // Only show some cells, not all (60% chance)
            if (Math.random() > 0.4) {
              // Consistent, professional sizing
              const fontSize = 10 + Math.floor(Math.random() * 3) * 2; // 10, 12, or 14
              const numX = Math.floor(Math.random() * 3) + 1; // 1-3 X's

              newCells.set(i, {
                content: generateCellContent(numX, fontSize),
                fontSize,
                opacity
              });
            }
          }
        }
      }

      setCells(newCells);

      // Complete after animation - call immediately for faster transition
      if (progress >= 0.95 && onCompleteRef.current && !hasCompletedRef.current) {
        hasCompletedRef.current = true;
        onCompleteRef.current?.();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const getTilePosition = (index: number) => {
    const { cols } = gridDimensionsRef.current;
    const col = index % cols;
    const row = Math.floor(index / cols);
    return { col, row };
  };

  return (
    <div
      ref={canvasRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridDimensionsRef.current.cols}, ${CELL_SIZE}px)`,
        gridTemplateRows: `repeat(${gridDimensionsRef.current.rows}, ${CELL_SIZE}px)`,
        gap: 0,
      }}
    >
      {Array.from(cells.entries()).map(([cellIndex, cellData]) => {
        const { col, row } = getTilePosition(cellIndex);

        return (
          <div
            key={cellIndex}
            className="select-none pointer-events-none"
            style={{
              gridColumn: col + 1,
              gridRow: row + 1,
              width: `${CELL_SIZE}px`,
              height: `${CELL_SIZE}px`,
              fontFamily: 'Monaco, "Cascadia Code", "Fira Code", Consolas, monospace',
              fontSize: `${cellData.fontSize}px`,
              fontWeight: 'bold',
              lineHeight: '1.2',
              color: 'hsl(var(--foreground) / 0.5)',
              whiteSpace: 'pre',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: cellData.opacity,
              transition: 'opacity 0.2s ease-out',
            }}
          >
            {cellData.content}
          </div>
        );
      })}
    </div>
  );
}
