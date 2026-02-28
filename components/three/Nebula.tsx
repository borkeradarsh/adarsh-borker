'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface NebulaProps {
  position: [number, number, number];
  scale: [number, number, number];
  sunVisible: boolean;
  opacity?: number;
}

const Nebula: React.FC<NebulaProps> = ({ 
  position, 
  scale, 
  sunVisible, 
  opacity = 0.04 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Create procedural nebula material matching the CSS implementation
  const nebulaMaterial = useMemo(() => {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        sunVisible: { value: sunVisible ? 1.0 : 0.0 },
        baseOpacity: { value: opacity }
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
        uniform float sunVisible;
        uniform float baseOpacity;
        varying vec2 vUv;
        
        // Multiple octaves of noise for realistic nebula structure
        float noise(vec2 p) {
          return sin(p.x * 6.0 + time * 0.2) * cos(p.y * 4.0 + time * 0.15) * 0.5 + 0.5;
        }
        
        float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for(int i = 0; i < 6; i++) {
            value += amplitude * noise(p);
            p *= 2.0;
            amplitude *= 0.5;
          }
          return value;
        }
        
        void main() {
          vec2 uv = vUv;
          
          // Create complex nebula structure
          float nebula1 = fbm(uv * 2.0 + vec2(time * 0.02, 0.0));
          float nebula2 = fbm(uv * 3.0 + vec2(0.0, time * 0.015));
          float nebula3 = fbm(uv * 1.5 + vec2(time * 0.01, time * 0.01));
          
          // Combine noise layers
          float nebulaPattern = nebula1 * 0.5 + nebula2 * 0.3 + nebula3 * 0.2;
          
          // Enhanced nebula colors matching screenshot - more vibrant and glowing
          vec3 color1 = vec3(0.4, 0.2, 0.8); // Purple nebula - main color
          vec3 color2 = vec3(0.6, 0.15, 0.4); // Magenta nebula 
          vec3 color3 = vec3(0.2, 0.3, 0.9); // Blue nebula
          vec3 color4 = vec3(0.8, 0.3, 0.6); // Pink highlights
          
          // Mix colors based on position and noise for realistic nebula structure
          vec3 finalColor = color1;
          finalColor = mix(finalColor, color2, smoothstep(0.2, 0.8, uv.x + nebulaPattern * 0.4));
          finalColor = mix(finalColor, color3, smoothstep(0.1, 0.9, uv.y + nebulaPattern * 0.3));
          finalColor = mix(finalColor, color4, smoothstep(0.6, 1.0, nebulaPattern));
          
          // Create realistic nebula density falloff
          float density = nebulaPattern * smoothstep(1.0, 0.0, length(uv - 0.5));
          
          // Enhanced opacity and glow for screenshot match
          float finalOpacity = baseOpacity * density * 3.0; // Boost visibility
          if (sunVisible > 0.5) {
            finalOpacity *= 1.8; // More visible during day
          }
          
          // Enhanced brightness variations and glow
          float brightness = 1.2 + sin(time * 0.5 + uv.x * 10.0) * 0.2;
          finalColor *= brightness;
          
          // Add glow boost for bloom effect
          finalColor *= 2.5;
          
          gl_FragColor = vec4(finalColor, finalOpacity);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    return material;
  }, [opacity]);

  useFrame((state) => {
    if (nebulaMaterial.uniforms) {
      nebulaMaterial.uniforms.time.value = state.clock.elapsedTime;
      nebulaMaterial.uniforms.sunVisible.value = sunVisible ? 1.0 : 0.0;
      nebulaMaterial.uniforms.baseOpacity.value = opacity;
    }

    // Very subtle movement
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.0001;
      meshRef.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 0.1) * 0.01;
      meshRef.current.position.y = position[1] + Math.cos(state.clock.elapsedTime * 0.08) * 0.008;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <planeGeometry args={[1, 1]} />
      <primitive object={nebulaMaterial} />
    </mesh>
  );
};

export default Nebula;