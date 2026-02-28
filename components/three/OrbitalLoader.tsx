'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface OrbitalLoaderProps {
  isTransitioning: boolean;
  loadingProgress: number;
}

const OrbitalLoader: React.FC<OrbitalLoaderProps> = ({ 
  isTransitioning, 
  loadingProgress 
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Create orbital rings material
  const ringMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        progress: { value: 0 },
        isTransitioning: { value: 0 }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 customColor;
        varying vec3 vColor;
        varying float vSize;
        uniform float time;
        uniform float progress;
        
        void main() {
          vColor = customColor;
          vSize = size;
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vSize;
        uniform float time;
        uniform float progress;
        uniform float isTransitioning;
        
        void main() {
          float distanceToCenter = length(gl_PointCoord - vec2(0.5));
          float alpha = 1.0 - smoothstep(0.2, 0.5, distanceToCenter);
          
          // Pulse effect
          float pulse = sin(time * 3.0) * 0.3 + 0.7;
          alpha *= pulse;
          
          // Progress glow
          float progressGlow = smoothstep(0.0, progress / 100.0, gl_PointCoord.x) * 0.5 + 0.5;
          
          // Transition fade
          alpha *= (1.0 - isTransitioning * 0.8);
          
          gl_FragColor = vec4(vColor * progressGlow, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      vertexColors: true
    });
  }, []);

  // Create particle geometry for orbital rings
  const particleGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];

    // Create 3 orbital rings
    for (let ring = 0; ring < 3; ring++) {
      const radius = 1.5 + ring * 0.5;
      const particleCount = 50 + ring * 20;
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const z = (Math.random() - 0.5) * 0.2;
        
        positions.push(x, y, z);
        
        // Cyan to blue gradient like the original loader
        const hue = 0.5 + ring * 0.1;
        const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
        colors.push(color.r, color.g, color.b);
        
        sizes.push(2 + Math.random() * 3);
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('customColor', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    return geometry;
  }, []);

  // Central core geometry
  const coreGeometry = useMemo(() => new THREE.SphereGeometry(0.3, 16, 16), []);
  const coreMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        progress: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float progress;
        varying vec2 vUv;
        
        void main() {
          vec2 uv = vUv - 0.5;
          float dist = length(uv);
          
          // Core glow effect
          float glow = 1.0 - smoothstep(0.0, 0.5, dist);
          float pulse = sin(time * 4.0) * 0.3 + 0.7;
          
          vec3 coreColor = vec3(0.2, 0.8, 1.0); // Cyan core
          vec3 finalColor = coreColor * glow * pulse;
          
          // Progress intensity
          float intensity = progress / 100.0 * 0.5 + 0.5;
          finalColor *= intensity;
          
          gl_FragColor = vec4(finalColor, glow);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Update uniforms
    if (ringMaterial.uniforms) {
      ringMaterial.uniforms.time.value = time;
      ringMaterial.uniforms.progress.value = loadingProgress;
      ringMaterial.uniforms.isTransitioning.value = isTransitioning ? 1.0 : 0.0;
    }

    if (coreMaterial.uniforms) {
      coreMaterial.uniforms.time.value = time;
      coreMaterial.uniforms.progress.value = loadingProgress;
    }

    // Rotate orbital rings
    if (ringsRef.current) {
      ringsRef.current.rotation.z = time * 0.5;
      ringsRef.current.rotation.x = Math.sin(time * 0.3) * 0.1;
      ringsRef.current.rotation.y = Math.cos(time * 0.2) * 0.1;
    }

    // Scale based on progress and transition
    if (groupRef.current) {
      const scale = isTransitioning ? 
        1.0 + Math.sin(time * 5.0) * 0.2 : 
        1.0 + (loadingProgress / 100.0) * 0.1;
      groupRef.current.scale.setScalar(scale);
      
      // Gentle floating motion
      groupRef.current.position.y = Math.sin(time * 0.8) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Central core */}
      <mesh geometry={coreGeometry} material={coreMaterial} />
      
      {/* Orbital rings */}
      <group ref={ringsRef}>
        <points 
          ref={particlesRef}
          geometry={particleGeometry} 
          material={ringMaterial} 
        />
      </group>
      
      {/* Energy field */}
      <mesh scale={[2, 2, 2]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={new THREE.Color(0.1, 0.4, 0.8)}
          transparent={true}
          opacity={isTransitioning ? 0.1 : 0.05}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};

export default OrbitalLoader;