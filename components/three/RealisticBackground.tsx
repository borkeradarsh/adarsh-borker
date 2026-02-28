'use client';

import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const RealisticBackground: React.FC = () => {
  // Create the background material with the exact same gradient as CSS
  const backgroundMaterial = useMemo(() => {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
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
        varying vec2 vUv;
        
        void main() {
          vec2 uv = vUv;
          
          // Deep space black background - matching CSS gradients exactly
          vec3 deepSpace = vec3(0.0313, 0.047, 0.078); // rgba(8, 12, 20)
          vec3 voidBlack = vec3(0.008, 0.016, 0.031); // rgba(2, 4, 8)
          vec3 absoluteBlack = vec3(0.0, 0.0, 0.0);
          
          // Radial gradients matching the CSS implementation
          float dist1 = distance(uv, vec2(0.15, 0.75));
          float gradient1 = smoothstep(0.7, 0.0, dist1);
          
          float dist2 = distance(uv, vec2(0.85, 0.25));
          float gradient2 = smoothstep(0.7, 0.0, dist2);
          
          // Mix the gradients
          vec3 color = absoluteBlack;
          color = mix(color, deepSpace, gradient1 * 0.6);
          color = mix(color, vec3(0.047, 0.031, 0.059), gradient2 * 0.5); // rgba(12, 8, 15)
          
          // Add subtle nebula-like variations
          float noise = sin(uv.x * 20.0 + time * 0.1) * cos(uv.y * 15.0 + time * 0.15) * 0.02;
          color += noise;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: false
    });

    return material;
  }, []);

  useFrame((state) => {
    if (backgroundMaterial.uniforms) {
      backgroundMaterial.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh position={[0, 0, -50]} scale={[100, 100, 1]}>
      <planeGeometry args={[1, 1]} />
      <primitive object={backgroundMaterial} />
    </mesh>
  );
};

export default RealisticBackground;