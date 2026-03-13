"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PointMaterial, Points, Sparkles } from "@react-three/drei";

// 3D 매화 꽃잎 컴포넌트
function PetalParticles() {
  const ref = useRef<any>(null);
  const petalCount = 60; // 꽃잎 수 증가
  
  const [positions, rotations, speeds] = useMemo(() => {
    const pos = new Float32Array(petalCount * 3);
    const rot = new Float32Array(petalCount * 3);
    const spd = new Float32Array(petalCount);
    for (let i = 0; i < petalCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = Math.random() * 10 - 5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5;
      rot[i * 3] = Math.random() * Math.PI;
      rot[i * 3 + 1] = Math.random() * Math.PI;
      rot[i * 3 + 2] = Math.random() * Math.PI;
      spd[i] = 0.008 + Math.random() * 0.015; // 조금 더 천천히 우아하게
    }
    return [pos, rot, spd];
  }, [petalCount]);

  useFrame((state) => {
    if (ref.current) {
      const time = state.clock.elapsedTime;
      const positionsAttr = ref.current.geometry.attributes.position;

      for (let i = 0; i < petalCount; i++) {
        // Fall down
        positionsAttr.array[i * 3 + 1] -= speeds[i];
        // Swerve side to side (fluttering)
        positionsAttr.array[i * 3] += Math.sin(time + i) * 0.008;
        
        // Reset if out of bounds
        if (positionsAttr.array[i * 3 + 1] < -6) {
          positionsAttr.array[i * 3 + 1] = 6;
          positionsAttr.array[i * 3] = (Math.random() - 0.5) * 12;
        }
      }
      positionsAttr.needsUpdate = true;
      ref.current.rotation.y += 0.0005;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#FFB7C5" size={0.18} sizeAttenuation={true} depthWrite={false} opacity={0.7} blending={1} />
    </Points>
  );
}

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
      {/* 생성된 한복 수묵화 배경 이미지 */}
      <div 
        style={{ 
          position: "absolute", 
          inset: 0, 
          backgroundImage: "url('/hanbok_bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center 70%", // 인물을 아래로 내려 텍스트 가독성 확보
          opacity: 0.5, // 이미지 채도 및 투명도 조절하여 가로막는 느낌 제거
          filter: "saturate(0.9) contrast(1.1) blur(1px)",
        }} 
      />

      {/* 전통 한지(Hanji) 텍스처 오버레이 - 미세한 질감 부여 */}
      <div 
        style={{ 
          position: "absolute", 
          inset: 0, 
          backgroundImage: "url('https://www.transparenttextures.com/patterns/natural-paper.png')",
          opacity: 0.15,
          mixBlendMode: "multiply",
          pointerEvents: "none"
        }} 
      />
      
      {/* 3D 오버레이 Canvas - 꽃잎 및 안개 효과 */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.6 }}>
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={1.5} />
          <InkMist />
          <PetalParticles />
          <Sparkles count={20} scale={15} size={0.8} speed={0.1} opacity={0.2} color="#F8D7DA" />
        </Canvas>
      </div>
      
      {/* 비네팅 효과 (이미지 부각 및 차분한 분위기) */}
      <div 
        style={{ 
          position: "absolute", 
          inset: 0, 
          background: "radial-gradient(circle, transparent 40%, rgba(42, 54, 95, 0.15) 100%)", 
          pointerEvents: "none" 
        }} 
      />
    </div>
  );
}
