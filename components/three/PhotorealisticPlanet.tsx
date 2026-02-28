'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PhotorealisticPlanetProps {
  position: [number, number, number];
  radius: number;
  type: 'earth' | 'mars';
  sunPosition: [number, number, number];
  rotationSpeed?: number;
}

const PhotorealisticPlanet: React.FC<PhotorealisticPlanetProps> = ({ 
  position, 
  radius, 
  type, 
  sunPosition, 
  rotationSpeed = 0.0002 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Create procedural planet material
  const planetMaterial = useMemo(() => {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        sunPosition: { value: new THREE.Vector3(...sunPosition) },
        planetType: { value: type === 'earth' ? 0.0 : 1.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform vec3 sunPosition;
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 sunPosition;
        uniform float planetType;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        // Noise functions for terrain
        float noise(vec2 p) {
          return sin(p.x * 8.0) * cos(p.y * 6.0) * 0.5 + 0.5;
        }
        
        float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for(int i = 0; i < 4; i++) {
            value += amplitude * noise(p);
            p *= 2.0;
            amplitude *= 0.5;
          }
          return value;
        }
        
        void main() {
          vec2 uv = vUv;
          
          // Calculate lighting from sun
          vec3 lightDir = normalize(sunPosition - vPosition);
          float NdotL = max(dot(vNormal, lightDir), 0.0);
          
          vec3 color;
          
          if (planetType < 0.5) {
            // Earth colors
            float terrain = fbm(uv * 4.0 + vec2(time * 0.01, 0.0));
            vec3 ocean = vec3(0.1, 0.3, 0.6);
            vec3 land = vec3(0.2, 0.5, 0.1);
            vec3 clouds = vec3(0.9, 0.9, 0.95);
            
            // Mix ocean and land based on terrain
            color = mix(ocean, land, smoothstep(0.4, 0.6, terrain));
            
            // Add cloud layer
            float cloudPattern = fbm(uv * 6.0 + vec2(time * 0.02, 0.0));
            color = mix(color, clouds, cloudPattern * 0.3);
            
            // Atmospheric scattering
            float atmosphere = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
            color = mix(color, vec3(0.4, 0.7, 1.0), atmosphere * 0.2);
            
          } else {
            // Enhanced Mars colors for screenshot match - more vibrant red glow
            float terrain = fbm(uv * 3.0);
            vec3 mars1 = vec3(1.0, 0.2, 0.1); // Bright red - glowing
            vec3 mars2 = vec3(0.8, 0.15, 0.05); // Deep red
            vec3 mars3 = vec3(1.2, 0.3, 0.15); // Bright orange-red
            
            color = mix(mars1, mars2, terrain);
            color = mix(color, mars3, smoothstep(0.6, 0.8, terrain));
            
            // Enhanced dust storms for more glow
            float dust = fbm(uv * 8.0 + vec2(time * 0.03, 0.0));
            color = mix(color, vec3(1.0, 0.4, 0.2), dust * 0.3);
            
            // Add inner glow effect
            float innerGlow = 1.0 - dist * 1.5;
            color += vec3(0.8, 0.2, 0.1) * innerGlow * 0.3;
            
            // Boost brightness for bloom effect
            color *= 1.8;
          }
          
          // Apply lighting
          color *= (NdotL * 0.8 + 0.2); // Ambient + diffuse
          
          // Add terminator line (day/night boundary)
          float terminator = smoothstep(-0.1, 0.1, NdotL);
          color *= terminator * 0.8 + 0.2;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.FrontSide
    });

    return material;
  }, [type, sunPosition]);

  useFrame((state) => {
    if (planetMaterial.uniforms) {
      planetMaterial.uniforms.time.value = state.clock.elapsedTime;
      planetMaterial.uniforms.sunPosition.value.set(...sunPosition);
    }

    // Planet rotation
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 32, 32]} />
        <primitive object={planetMaterial} />
      </mesh>
      
      {/* Atmospheric glow for Earth */}
      {type === 'earth' && (
        <mesh scale={[1.05, 1.05, 1.05]}>
          <sphereGeometry args={[radius, 16, 16]} />
          <meshBasicMaterial
            color={new THREE.Color(0.4, 0.7, 1.0)}
            transparent={true}
            opacity={0.1}
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
          />
        </mesh>
      )}
      
      {/* Enhanced glow for Mars matching screenshot */}
      {type === 'mars' && (
        <>
          <mesh scale={[1.08, 1.08, 1.08]}>
            <sphereGeometry args={[radius, 16, 16]} />
            <meshBasicMaterial
              color={new THREE.Color(1.0, 0.3, 0.1)}
              transparent={true}
              opacity={0.2}
              blending={THREE.AdditiveBlending}
              side={THREE.BackSide}
            />
          </mesh>
          <mesh scale={[1.15, 1.15, 1.15]}>
            <sphereGeometry args={[radius, 16, 16]} />
            <meshBasicMaterial
              color={new THREE.Color(0.8, 0.2, 0.05)}
              transparent={true}
              opacity={0.1}
              blending={THREE.AdditiveBlending}
              side={THREE.BackSide}
            />
          </mesh>
        </>
      )}
    </group>
  );
};

export default PhotorealisticPlanet;