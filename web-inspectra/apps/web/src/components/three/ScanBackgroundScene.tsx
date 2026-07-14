"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotionPreference } from "@/hooks/useReducedMotionPreference";

const PARTICLE_COUNT = 260;

function ScanParticleField() {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const array = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      array[i * 3] = (Math.random() - 0.5) * 12;
      array[i * 3 + 1] = (Math.random() - 0.5) * 7;
      array[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return array;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.05;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#4cd9e0" transparent opacity={0.55} sizeAttenuation />
    </points>
  );
}

/**
 * Lightweight ambient particle field evoking scan-line telemetry. Skipped
 * entirely when the user prefers reduced motion, in favor of a static
 * gradient handled by the parent.
 */
export function ScanBackgroundScene() {
  const prefersReducedMotion = useReducedMotionPreference();
  if (prefersReducedMotion) return null;

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      className="!absolute inset-0"
    >
      <ScanParticleField />
    </Canvas>
  );
}
