'use client';

import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import CosmicScene from './three/CosmicScene';
import Nebula from './three/Nebula';
import RealisticBackground from './three/RealisticBackground';
import PhotorealisticPlanet from './three/PhotorealisticPlanet';
import PhotorealisticSun from './three/PhotorealisticSun';
import OptimizedCosmicScene from './three/OptimizedCosmicScene';
import * as THREE from 'three';

interface SunPosition {
  x: number;
  y: number;
  isVisible: boolean;
  angle: number;
}

const ThreeAnimatedBackground = memo(() => {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  // Optimized interaction handlers
  const handleStart = useCallback(() => {
    setIsInteracting(true);
  }, []);
  
  const handleEnd = useCallback(() => {
    const timeout = setTimeout(() => {
      setIsInteracting(false);
    }, 150);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Initialize time on client side only
    setCurrentTime(new Date());

    // Update time every minute for performance
    let animationId: number;
    let lastUpdate = Date.now();
    
    const updateTime = () => {
      const now = Date.now();
      if (now - lastUpdate >= 60000) {
        setCurrentTime(new Date());
        lastUpdate = now;
      }
      
      if (!isInteracting) {
        animationId = requestAnimationFrame(updateTime);
      }
    };
    
    if (!isInteracting) {
      animationId = requestAnimationFrame(updateTime);
    }

    // Interaction event listeners
    const events = ['pointerdown', 'touchstart', 'mousedown', 'keydown'] as const;
    const endEvents = ['pointerup', 'touchend', 'mouseup', 'keyup'] as const;
    
    events.forEach(event => document.addEventListener(event, handleStart, { passive: true }));
    endEvents.forEach(event => document.addEventListener(event, handleEnd, { passive: true }));

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      window.removeEventListener('resize', checkMobile);
      events.forEach(event => document.removeEventListener(event, handleStart));
      endEvents.forEach(event => document.removeEventListener(event, handleEnd));
    };
  }, [handleStart, handleEnd, isInteracting]);

  // Calculate sun position based on time
  const getSunPosition = useCallback((): SunPosition => {
    if (!currentTime) {
      return { x: 50, y: 15, isVisible: true, angle: 90 };
    }
    
    const hours = Math.max(0, Math.min(23, currentTime.getHours()));
    const minutes = Math.max(0, Math.min(59, currentTime.getMinutes()));
    const totalMinutes = Math.max(0, hours * 60 + minutes);
    
    let sunAngle;
    let isVisible;
    
    if (totalMinutes >= 360 && totalMinutes <= 1080) { // 6 AM to 6 PM
      sunAngle = ((totalMinutes - 360) / 720) * 180;
      isVisible = true;
    } else {
      isVisible = false;
      const nightAngle = totalMinutes < 360 ? 
        180 + ((totalMinutes + 720) / 720) * 180 : 
        180 + ((totalMinutes - 1080) / 720) * 180;
      sunAngle = nightAngle;
    }
    
    const x = 50 + Math.cos((sunAngle - 90) * Math.PI / 180) * 45;
    const y = 50 - Math.sin((sunAngle - 90) * Math.PI / 180) * 35;
    
    return { 
      x: Math.max(5, Math.min(95, x)), 
      y: Math.max(15, Math.min(85, y)), 
      isVisible, 
      angle: sunAngle 
    };
  }, [currentTime]);

  const sunPosition = getSunPosition();

  // Convert screen positions to 3D world coordinates
  const convert2DTo3D = useCallback((x: number, y: number, z: number = 0): [number, number, number] => {
    // Convert percentage positions to world coordinates
    const worldX = (x - 50) * 0.1; // Scale down for 3D scene
    const worldY = (50 - y) * 0.1; // Invert Y axis for 3D
    return [worldX, worldY, z];
  }, []);

  // Memoized positions for performance
  const positions = useMemo(() => ({
    sun: convert2DTo3D(sunPosition.x, sunPosition.y, -2),
    mars: convert2DTo3D(75, 20, -3),
    earth: convert2DTo3D(12, 80, -3),
    nebula: convert2DTo3D(18, 55, -5),
    galaxy: convert2DTo3D(85, 35, -8)
  }), [sunPosition.x, sunPosition.y, convert2DTo3D]);

  return (
    <OptimizedCosmicScene
      className="fixed inset-0 -z-10"
      enableAdaptivePerformance={true}
      targetFPS={60}
      onPerformanceChange={(level) => {
        console.log(`Performance level changed to: ${level}`);
      }}
    >
      {/* Realistic deep space background matching original CSS */}
      <RealisticBackground />
      
      {/* Very subtle ambient lighting */}
      <ambientLight intensity={0.05} color={new THREE.Color(0.05, 0.05, 0.1)} />
      
      {/* Photorealistic Sun with procedural solar surface */}
      <PhotorealisticSun
        position={positions.sun}
        size={0.4}
        intensity={sunPosition.isVisible ? 1.0 : 0.3}
      />
      
      {/* Photorealistic Mars with procedural surface texture */}
      <PhotorealisticPlanet
        position={[positions.mars[0] * 0.8, positions.mars[1] * 0.8, positions.mars[2] - 3]} 
        radius={0.5}
        type="mars"
        sunPosition={[sunPosition.x, sunPosition.y, -3]}
        rotationSpeed={0.0002}
      />
      
      {/* Photorealistic Earth with procedural continents and oceans */}
      <PhotorealisticPlanet
        position={[positions.earth[0] * 0.7, positions.earth[1] * 0.7, positions.earth[2] - 1.5]} 
        radius={0.6}
        type="earth"
        sunPosition={[sunPosition.x, sunPosition.y, -3]}
        rotationSpeed={0.0003}
      />
      
      {/* Remove floating elements for pure cosmic realism */}
      
      {/* Extremely subtle nebula - like distant Hubble imagery */}
      <Nebula
        position={[positions.nebula[0], positions.nebula[1], positions.nebula[2] - 5]} // Much further back
        scale={[8, 6, 1]} // Larger but much more transparent
        sunVisible={sunPosition.isVisible}
        opacity={0.04} // Barely visible like real deep space nebulae
      />
      
      {/* No cosmic dust - real space is clean and clear */}
      
      {/* Distant galaxy cluster with subtle motion */}
      <mesh position={positions.galaxy}>
        <planeGeometry args={[3, 1.8]} />
        <meshBasicMaterial
          color={new THREE.Color(0.1, 0.08, 0.12)}
          transparent={true}
          opacity={sunPosition.isVisible ? 0.15 : 0.25}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Nebula Clouds - matching original CSS implementation */}
      <group>
        <mesh position={[-5, 2, -7]} scale={[9, 6, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            color={new THREE.Color(0.235, 0.118, 0.059)} // rgba(60, 30, 15, ...)
            transparent={true}
            opacity={sunPosition.isVisible ? 0.12 : 0.08}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh position={[5, -2, -7]} scale={[7, 5, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            color={new THREE.Color(0.157, 0.078, 0.235)} // rgba(40, 20, 60, ...)
            transparent={true}
            opacity={sunPosition.isVisible ? 0.10 : 0.06}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh position={[1, 1.5, -7]} scale={[6, 4, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            color={new THREE.Color(0.078, 0.157, 0.235)} // rgba(20, 40, 60, ...)
            transparent={true}
            opacity={sunPosition.isVisible ? 0.08 : 0.05}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
      
      {/* Interstellar medium with subtle motion */}
      <group>
        <mesh position={[-6, 3, -8]} scale={[12, 6, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            color={new THREE.Color(0.059, 0.039, 0.031)} // rgba(15, 10, 8, ...)
            transparent={true}
            opacity={0.12}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh position={[6, -1.5, -8]} scale={[9, 4, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            color={new THREE.Color(0.047, 0.031, 0.059)} // rgba(12, 8, 15, ...)
            transparent={true}
            opacity={0.10}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
      
      {/* Camera controller for subtle movement */}
      <group>
        {/* This group can be animated for camera-like effects if needed */}
      </group>
    </OptimizedCosmicScene>
  );
});

ThreeAnimatedBackground.displayName = 'ThreeAnimatedBackground';

export default ThreeAnimatedBackground;