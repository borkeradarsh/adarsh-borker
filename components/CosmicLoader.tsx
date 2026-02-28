'use client';

import { useState, useEffect, memo } from 'react';
import { usePathname } from 'next/navigation';
import CosmicScene from './three/CosmicScene';
import OrbitalLoader from './three/OrbitalLoader';
import { Html } from '@react-three/drei';

interface ThreeCosmicLoaderProps {
  onComplete?: () => void;
}

const ThreeCosmicLoader = ({ onComplete }: ThreeCosmicLoaderProps = {}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Reset for each navigation
    setIsVisible(true);
    setLoadingProgress(0);
    setIsTransitioning(false);

    // Don't show cosmic loader on mobile devices
    if (isMobile) {
      setTimeout(() => onComplete?.(), 0);
      return;
    }

    // Animate progress bar
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        const increment = Math.random() * 15 + 5;
        return Math.min(prev + increment, 90);
      });
    }, 150);

    // Complete loading after a reasonable time
    const completeTimer = setTimeout(() => {
      setLoadingProgress(100);
      
      // Start transition phase
      setTimeout(() => {
        setIsTransitioning(true);
        
        // Hide loader after transition
        setTimeout(() => {
          setIsVisible(false);
          onComplete?.();
        }, 1800);
      }, 1000);
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(completeTimer);
    };
  }, [pathname, isMobile, onComplete]);

  if (!isVisible || isMobile) return null;

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center"
      style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        opacity: isTransitioning ? 0 : 1,
        transition: 'opacity 1.2s ease-out'
      }}
    >
      <CosmicScene
        className="absolute inset-0"
        performance={true}
        adaptive={true}
        dpr={[0.5, 1.5]}
      >
        {/* Ambient lighting */}
        <ambientLight intensity={0.2} color="#1e1b4b" />
        
        {/* Main orbital loader */}
        <OrbitalLoader 
          isTransitioning={isTransitioning}
          loadingProgress={loadingProgress}
        />
        
        {/* Nebula background effects */}
        <mesh position={[3, 2, -5]} scale={[4, 3, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            color="#3b82f6"
            transparent={true}
            opacity={0.1}
            blending={2} // AdditiveBlending
          />
        </mesh>
        
        <mesh position={[-3, -2, -5]} scale={[3.5, 2.5, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            color="#8b5cf6"
            transparent={true}
            opacity={0.08}
            blending={2} // AdditiveBlending
          />
        </mesh>
        
        {/* Loading UI overlay */}
        <Html center>
          <div className="flex flex-col items-center justify-center">
            <div 
              className="text-center"
              style={{
                opacity: isTransitioning ? 0 : 1,
                transform: isTransitioning ? 'translateY(-20px)' : 'translateY(0)',
                transition: 'all 1s ease-out'
              }}
            >
              <h2 className="text-2xl font-light text-white/80 tracking-wider mb-4 mt-32">
                {isTransitioning ? 'WELCOME' : (loadingProgress >= 100 ? 'READY' : 'INITIALIZING')}
              </h2>
              
              {/* Progress bar */}
              <div className="w-48 h-0.5 bg-white/10 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(loadingProgress, 100)}%` }}
                />
              </div>
              
              {/* Progress percentage */}
              <p className="text-xs text-white/30 tracking-wide mb-2">
                {isTransitioning ? '' : `${Math.round(Math.min(loadingProgress, 100))}%`}
              </p>
              
              {/* Subtitle */}
              <p className="text-sm text-white/40 tracking-wide">
                {isTransitioning ? 'Experience awaits...' : 
                 (loadingProgress >= 100 ? 'Launching...' : 'Entering the cosmos...')}
              </p>
            </div>
          </div>
        </Html>
      </CosmicScene>
      
      {/* Cosmic gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-slate-900/50 pointer-events-none" />
    </div>
  );
};

ThreeCosmicLoader.displayName = 'ThreeCosmicLoader';

export default memo(ThreeCosmicLoader);