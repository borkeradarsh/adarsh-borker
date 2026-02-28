'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Stars, Environment } from '@react-three/drei';
import { BlendFunction } from 'postprocessing';
import { ReactNode } from 'react';

interface CosmicSceneProps {
  children: ReactNode;
  className?: string;
  performance?: boolean;
  adaptive?: boolean;
  dpr?: [number, number];
  enablePostprocessing?: boolean;
}

const CosmicScene: React.FC<CosmicSceneProps> = ({ 
  children, 
  className = '', 
  performance = false,
  adaptive = false,
  dpr = [1, 2],
  enablePostprocessing = true
}) => {
  return (
    <div className={className}>
      <Canvas
        dpr={dpr}
        performance={{ min: 0.5, max: 1 }}
        camera={{ position: [0, 0, 5], far: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
          toneMapping: 1, // ACESFilmicToneMapping
        }}
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
          {/* Cosmic environment */}
          <Stars 
            radius={300} 
            depth={60} 
            count={1000} 
            factor={2} 
            saturation={0.1} 
            fade={true}
            speed={0.3}
          />
          
          {/* Subtle environment lighting */}
          <Environment preset="night" />
          
          {children}
          
          {/* Post-processing effects for glow and bloom */}
          {enablePostprocessing && (
            <EffectComposer>
              <Bloom
                intensity={0.8}
                kernelSize={3}
                luminanceThreshold={0.1}  
                luminanceSmoothing={0.7}
                mipmapBlur={true}
                blendFunction={BlendFunction.ADD}
              />
              <Vignette
                eskil={false}
                offset={0.1}
                darkness={0.3}
              />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
};

export default CosmicScene;