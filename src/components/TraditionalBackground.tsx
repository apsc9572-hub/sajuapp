"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PointMaterial, Points, Sparkles } from "@react-three/drei";

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
      <PointMaterial transparent color="#2A365F" size={0.03} sizeAttenuation={true} depthWrite={false} opacity={0.4} blending={1} />
    </Points>
  );
}

export default function TraditionalBackground() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      {/* 생성된 한복 수묵화 배경 이미지 - 선명하게 보이도록 수정 */}
      <div 
        style={{ 
          position: "absolute", 
          inset: 0, 
          backgroundImage: "url('/hanbok_bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.9, // 투명도를 대폭 높임 (0.12 -> 0.9)
          filter: "saturate(1.2) contrast(1.1)", // 색감과 대비를 살짝 보정
        }} 
      />
      
      {/* 3D 오버레이 Canvas - 은은하게 입자 효과만 부여 */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.4 }}>
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={1.5} />
          <InkMist />
          <Sparkles count={30} scale={15} size={1.2} speed={0.2} opacity={0.3} color="white" />
        </Canvas>
      </div>
      
      {/* 아주 얇은 비네팅 효과만 부여 (이미지 부각) */}
      <div 
        style={{ 
          position: "absolute", 
          inset: 0, 
          background: "radial-gradient(circle, transparent 30%, rgba(250, 249, 245, 0.4) 100%)", 
          pointerEvents: "none" 
        }} 
      />
    </div>
  );
}
