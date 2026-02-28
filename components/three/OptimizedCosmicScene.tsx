'use client';

import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ReactNode } from 'react';

interface OptimizedCosmicSceneProps {
  children: ReactNode;
  className?: string;
  enableAdaptivePerformance?: boolean;
  targetFPS?: number;
  onPerformanceChange?: (level: string) => void;
}

const OptimizedCosmicScene: React.FC<OptimizedCosmicSceneProps> = ({ 
  children, 
  className = '',
  enableAdaptivePerformance = true,
  targetFPS = 60,
  onPerformanceChange
}) => {
  const [performanceLevel, setPerformanceLevel] = useState('high');
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    if (!enableAdaptivePerformance) return;

    const checkPerformance = () => {
      frameCount.current++;
      const now = performance.now();
      
      if (frameCount.current % 60 === 0) { // Check every 60 frames
        const elapsed = now - lastTime.current;
        const currentFPS = 60000 / elapsed; // Calculate FPS
        
        let newLevel = performanceLevel;
        
        if (currentFPS < targetFPS * 0.7) {
          newLevel = 'low';
        } else if (currentFPS < targetFPS * 0.9) {
          newLevel = 'medium';
        } else {
          newLevel = 'high';
        }
        
        if (newLevel !== performanceLevel) {
          setPerformanceLevel(newLevel);
          onPerformanceChange?.(newLevel);
        }
        
        lastTime.current = now;
      }
      
      requestAnimationFrame(checkPerformance);
    };
    
    requestAnimationFrame(checkPerformance);
  }, [enableAdaptivePerformance, targetFPS, performanceLevel, onPerformanceChange]);

  const getDPR = (): [number, number] => {
    switch (performanceLevel) {
      case 'low': return [0.5, 1];
      case 'medium': return [0.75, 1.25];
      default: return [1, 2];
    }
  };

  return (
    <div className={className}>
      <Canvas
        dpr={getDPR()}
        performance={{ min: 0.3, max: 1 }}
        camera={{ position: [0, 0, 8], far: 100, fov: 45 }}
        gl={{
          antialias: performanceLevel === 'high',
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        frameloop="always"
        style={{ 
          background: 'transparent',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1
        }}
      >
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
};

export default OptimizedCosmicScene;