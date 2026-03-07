"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PointMaterial, Points } from "@react-three/drei";

// 3D 먹물 안개/입자 컴포넌트
function InkMist() {
  const ref = useRef<any>(null);
  const particleCount = 800;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, [particleCount]);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.04;
      ref.current.rotation.x += delta * 0.02;
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.15;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#2C2C2C" size={0.025} sizeAttenuation={true} depthWrite={false} opacity={0.25} blending={2} />
    </Points>
  );
}

export default function TraditionalBackground() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      {/* 생성된 수묵화 배경 이미지 */}
      <div 
        style={{ 
          position: "absolute", 
          inset: "-5%", 
          backgroundImage: "url('/C:/Users/COM/.gemini/antigravity/brain/92549ef9-626d-47c9-a1e8-93d19eeb9b2c/traditional_korean_ink_wash_bg_1772884043955.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.5,
          filter: "sepia(0.1) contrast(1.05)",
        }} 
      />
      
      {/* 3D 오버레이 Canvas */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.8 }}>
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <InkMist />
        </Canvas>
      </div>
      
      {/* 부드러운 그라데이션 오버레이 (가독성 확보) */}
      <div 
        style={{ 
          position: "absolute", 
          inset: 0, 
          background: "radial-gradient(circle at 50% 50%, transparent 30%, rgba(253,248,240,0.5) 100%)", 
          pointerEvents: "none" 
        }} 
      />
    </div>
  );
}
