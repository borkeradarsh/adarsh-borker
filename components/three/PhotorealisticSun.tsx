'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PhotorealisticSunProps {
  position: [number, number, number];
  size?: number;
  intensity?: number;
}

const PhotorealisticSun: React.FC<PhotorealisticSunProps> = ({ 
  position, 
  size = 0.4, 
  intensity = 1.0 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  // Create enhanced sun material with proper glow for screenshot match
  const sunMaterial = useMemo(() => {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        intensity: { value: intensity }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float intensity;
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        // Enhanced noise for realistic solar surface
        float noise(vec2 p) {
          return sin(p.x * 12.0 + time * 2.0) * cos(p.y * 8.0 + time * 1.5) * 0.5 + 0.5;
        }
        
        void main() {
          vec2 uv = vUv - 0.5;
          float dist = length(uv);
          
          // Create solar disk with smooth edges
          float solar = 1.0 - smoothstep(0.0, 0.5, dist);
          if (solar < 0.01) discard;
          
          // Enhanced solar surface texture
          float granulation = noise(vUv * 8.0) * 0.3;
          granulation += noise(vUv * 16.0) * 0.2;
          granulation += noise(vUv * 32.0) * 0.1;
          
          // Better limb darkening for realism
          float limbDark = 1.0 - pow(dist * 2.0, 0.6);
          
          // Enhanced solar colors matching screenshot's yellow glow
          vec3 solarCore = vec3(1.0, 0.95, 0.6); // Bright warm yellow
          vec3 solarMid = vec3(1.0, 0.8, 0.3);   // Golden yellow
          vec3 solarEdge = vec3(1.0, 0.65, 0.2); // Orange edge
          
          // Multi-layer color mixing for depth
          vec3 color = mix(solarEdge, solarMid, limbDark);
          color = mix(color, solarCore, limbDark * limbDark);
          color += granulation * 0.3;
          color *= intensity;
          
          // Enhanced solar activity
          float flare = sin(time * 3.0) * 0.15 + 0.85;
          float pulse = sin(time * 5.0) * 0.05 + 0.95;
          color *= flare * pulse;
          
          // Make it glow more intensely for bloom effect
          color *= 2.0;
          
          gl_FragColor = vec4(color, solar);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });

    return material;
  }, [intensity]);

  useFrame((state) => {
    if (sunMaterial.uniforms) {
      sunMaterial.uniforms.time.value = state.clock.elapsedTime;
      sunMaterial.uniforms.intensity.value = intensity;
    }

    // Subtle rotation
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.001;
    }

    // Update light intensity
    if (lightRef.current) {
      lightRef.current.intensity = intensity * 2;
      lightRef.current.color.setRGB(1, 0.9, 0.7);
    }
  });

  return (
    <group position={position}>
      {/* Sun mesh */}
      <mesh ref={meshRef} scale={[size, size, size]}>
        <sphereGeometry args={[1, 32, 32]} />
        <primitive object={sunMaterial} />
      </mesh>
      
      {/* Point light for illumination */}
      <pointLight 
        ref={lightRef}
        intensity={intensity * 2}
        distance={20}
        decay={2}
        color={new THREE.Color(1, 0.9, 0.7)}
      />
      
      {/* Solar corona effect */}
      <mesh scale={[size * 1.5, size * 1.5, size * 1.5]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={new THREE.Color(1, 0.8, 0.4)}
          transparent={true}
          opacity={intensity * 0.1}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};

export default PhotorealisticSun;