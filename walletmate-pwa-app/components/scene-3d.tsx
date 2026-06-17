"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useRef, useEffect } from "react";
import * as THREE from "three";

function SceneContent() {
  const wireframeRef = useRef<THREE.Mesh>(null);
  const { invalidate } = useThree();
  const { resolvedTheme } = useTheme();

  useFrame((_, delta) => {
    if (wireframeRef.current) {
      wireframeRef.current.rotation.y += delta * 0.15;
      wireframeRef.current.rotation.x += delta * 0.05;
    }
    invalidate();
  });

  return (
    <>
      {/* Wireframe sphere - centered, subtle background element */}
      <mesh ref={wireframeRef} position={[0, 0, 0]}>
        <icosahedronGeometry args={[0.7, 1]} />
        <meshBasicMaterial
          color={resolvedTheme === "light" ? "#4f6df5" : "#ffffff"}
          wireframe
          transparent
          opacity={resolvedTheme === "light" ? 0.15 : 0.06}
        />
      </mesh>
    </>
  );
}

function VisibilityController() {
  const { setFrameloop, gl } = useThree();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFrameloop("demand");
        } else {
          setFrameloop("never");
        }
      },
      { threshold: 0 },
    );

    observer.observe(gl.domElement);
    return () => observer.disconnect();
  }, [gl, setFrameloop]);

  return null;
}

function Scene3DInner() {
  return (
    <Canvas
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
      }}
      frameloop="demand"
      dpr={[1, 1.5]}
      events={undefined}
      camera={{ position: [0, 0, 5], fov: 50 }}
    >
      <VisibilityController />
      <SceneContent />
    </Canvas>
  );
}

// Dynamic import to disable SSR for WebGL
const Scene3D = dynamic(() => Promise.resolve(Scene3DInner), {
  ssr: false,
  loading: () => null,
});

export default Scene3D;
