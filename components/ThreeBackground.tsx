'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

// Individual floating element component
interface FloatingElementProps {
  position: [number, number, number];
  size: [number, number];
  colors: [string, string];
  animationType: number;
  delay: number;
  duration: number;
}

const FloatingElement: React.FC<FloatingElementProps> = ({
  position,
  size,
  colors,
  animationType,
  delay,
  duration
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Create shader material for blurred gradient effect
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color(colors[0]) },
        color2: { value: new THREE.Color(colors[1]) },
        opacity: { value: 0.2 }
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
        uniform vec3 color1;
        uniform vec3 color2;
        uniform float opacity;
        varying vec2 vUv;
        
        void main() {
          vec2 uv = vUv - 0.5;
          float dist = length(uv);
          
          // Create radial gradient
          float gradient = 1.0 - smoothstep(0.0, 0.5, dist);
          
          // Mix colors
          vec3 color = mix(color1, color2, uv.x * 0.5 + 0.5);
          
          // Soft falloff for blur effect
          float alpha = gradient * opacity;
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide
    });
  }, [colors]);

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;

    const time = state.clock.elapsedTime + delay;
    
    // Update material time
    if (material.uniforms) {
      material.uniforms.time.value = time;
    }

    // Animate based on the original CSS keyframes
    const progress = (time / duration) % 1;
    let transform = { x: 0, y: 0, rotation: 0, scale: 1 };

    switch (animationType) {
      case 1: // animate-float-1
        if (progress < 0.25) {
          const t = progress / 0.25;
          transform = {
            x: 30 * t,
            y: -20 * t,
            rotation: 1 * t,
            scale: 1 + 0.1 * t
          };
        } else if (progress < 0.5) {
          const t = (progress - 0.25) / 0.25;
          transform = {
            x: 30 + (-50) * t,
            y: -20 + 50 * t,
            rotation: 1 + (-2) * t,
            scale: 1.1 + (-0.2) * t
          };
        } else if (progress < 0.75) {
          const t = (progress - 0.5) / 0.25;
          transform = {
            x: -20 + 40 * t,
            y: 30 + (-20) * t,
            rotation: -1 + 1.5 * t,
            scale: 0.9 + 0.15 * t
          };
        } else {
          const t = (progress - 0.75) / 0.25;
          transform = {
            x: 20 + (-20) * t,
            y: 10 + (-10) * t,
            rotation: 0.5 + (-0.5) * t,
            scale: 1.05 + (-0.05) * t
          };
        }
        break;

      case 2: // animate-float-2
        if (progress < 0.33) {
          const t = progress / 0.33;
          transform = {
            x: -25 * t,
            y: 20 * t,
            rotation: -0.5 * t,
            scale: 1 + 0.1 * t
          };
        } else if (progress < 0.66) {
          const t = (progress - 0.33) / 0.33;
          transform = {
            x: -25 + 40 * t,
            y: 20 + (-45) * t,
            rotation: -0.5 + 1.5 * t,
            scale: 1.1 + (-0.15) * t
          };
        } else {
          const t = (progress - 0.66) / 0.34;
          transform = {
            x: 15 + (-15) * t,
            y: -25 + 25 * t,
            rotation: 1 + (-1) * t,
            scale: 0.95 + 0.05 * t
          };
        }
        break;

      case 3: // animate-float-3
        const keyframes = [
          { x: 0, y: 0, rotation: 0, scale: 1 },
          { x: 15, y: -30, rotation: 0.5, scale: 1.05 },
          { x: -20, y: -10, rotation: -0.5, scale: 0.95 },
          { x: 25, y: 20, rotation: 1, scale: 1.1 },
          { x: -10, y: 15, rotation: -0.5, scale: 1.02 },
          { x: 0, y: 0, rotation: 0, scale: 1 }
        ];
        
        const segmentIndex = Math.floor(progress * 5);
        const segmentProgress = (progress * 5) % 1;
        const currentFrame = keyframes[segmentIndex];
        const nextFrame = keyframes[segmentIndex + 1] || keyframes[0];
        
        transform = {
          x: currentFrame.x + (nextFrame.x - currentFrame.x) * segmentProgress,
          y: currentFrame.y + (nextFrame.y - currentFrame.y) * segmentProgress,
          rotation: currentFrame.rotation + (nextFrame.rotation - currentFrame.rotation) * segmentProgress,
          scale: currentFrame.scale + (nextFrame.scale - currentFrame.scale) * segmentProgress
        };
        break;

      case 4: // animate-float-4
        if (progress < 0.5) {
          const t = progress / 0.5;
          transform = {
            x: -30 * t,
            y: 25 * t,
            rotation: -1 * t,
            scale: 1 + 0.08 * t
          };
        } else {
          const t = (progress - 0.5) / 0.5;
          transform = {
            x: -30 + 30 * t,
            y: 25 + (-25) * t,
            rotation: -1 + 1 * t,
            scale: 1.08 + (-0.08) * t
          };
        }
        break;

      case 5: // animate-float-5
        if (progress < 0.25) {
          const t = progress / 0.25;
          transform = {
            x: 20 * t,
            y: -15 * t,
            rotation: 0.5 * t,
            scale: 1 + (-0.02) * t
          };
        } else if (progress < 0.75) {
          const t = (progress - 0.25) / 0.5;
          transform = {
            x: 20 + (-35) * t,
            y: -15 + 35 * t,
            rotation: 0.5 + (-1) * t,
            scale: 0.98 + 0.05 * t
          };
        } else {
          const t = (progress - 0.75) / 0.25;
          transform = {
            x: -15 + 15 * t,
            y: 20 + (-20) * t,
            rotation: -0.5 + 0.5 * t,
            scale: 1.03 + (-0.03) * t
          };
        }
        break;
    }

    // Apply transformation - convert pixels to world units
    meshRef.current.position.x = position[0] + transform.x * 0.01; // Scale down pixel values
    meshRef.current.position.y = position[1] + transform.y * 0.01;
    meshRef.current.rotation.z = transform.rotation * (Math.PI / 180); // Convert degrees to radians
    meshRef.current.scale.setScalar(transform.scale);
  });

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[size[0], size[1]]} />
      <primitive object={material} ref={materialRef} />
    </mesh>
  );
};

// Main Three.js Background component
const ThreeBackground: React.FC = () => {
  return (
    <Canvas
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -10,
        pointerEvents: 'none'
      }}
      camera={{ position: [0, 0, 10], fov: 50 }}
      gl={{ 
        alpha: true, 
        antialias: true,
        powerPreference: 'high-performance'
      }}
    >
      {/* Background gradient matching CSS */}
      <mesh position={[0, 0, -20]} scale={[50, 50, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial>
          <meshBasicMaterial
            color={new THREE.Color(0.047, 0.090, 0.165)} // slate-900
            transparent={false}
          />
        </meshBasicMaterial>
      </mesh>

      {/* Floating elements matching the original positions and animations */}
      
      {/* Element 1: top: "10%", left: "10%" - blue to purple */}
      <FloatingElement
        position={[-3, 2, 0]}
        size={[2, 2]}
        colors={['#3B82F6', '#9333EA']} // blue-500 to purple-600
        animationType={1}
        delay={0}
        duration={20}
      />

      {/* Element 2: top: "60%", right: "15%" - purple to cyan */}
      <FloatingElement
        position={[3, -1, 0]}
        size={[1.8, 1.8]}
        colors={['#A855F7', '#06B6D4']} // purple-500 to cyan-500
        animationType={2}
        delay={-5}
        duration={18}
      />

      {/* Element 3: bottom: "20%", left: "20%" - cyan to blue */}
      <FloatingElement
        position={[-2.5, -2, 0]}
        size={[1.6, 1.6]}
        colors={['#22D3EE', '#3B82F6']} // cyan-400 to blue-500
        animationType={3}
        delay={-10}
        duration={22}
      />

      {/* Element 4: top: "30%", right: "40%" - purple to pink */}
      <FloatingElement
        position={[1, 1, 0]}
        size={[1.4, 1.4]}
        colors={['#A78BFA', '#EC4899']} // purple-400 to pink-500
        animationType={4}
        delay={-15}
        duration={25}
      />

      {/* Element 5: bottom: "40%", right: "10%" - teal to blue */}
      <FloatingElement
        position={[3.5, -0.5, 0]}
        size={[1.9, 1.9]}
        colors={['#14B8A6', '#2563EB']} // teal-500 to blue-600
        animationType={5}
        delay={-8}
        duration={19}
      />

      {/* Black overlay */}
      <mesh position={[0, 0, 1]} scale={[50, 50, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          color={new THREE.Color(0, 0, 0)}
          transparent={true}
          opacity={0.1}
        />
      </mesh>
    </Canvas>
  );
};

export default ThreeBackground;