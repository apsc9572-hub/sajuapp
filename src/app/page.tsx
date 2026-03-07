"use client";

import { motion } from "framer-motion";
import { Sparkles, MoonStar, BookOpen, Scroll, Navigation } from "lucide-react";
import Link from "next/link";
import { Canvas, useFrame } from "@react-three/fiber";
import { PointMaterial, Points } from "@react-three/drei";
import { useRef, useMemo } from "react";
import Disclaimer from "@/components/Disclaimer";
import TraditionalBackground from "@/components/TraditionalBackground";

export default function Home() {
  const menus = [
    { title: "오늘의 운세", desc: "어제, 오늘, 내일의 기운 흐름", icon: <Sparkles className="w-7 h-7" />, color: "var(--accent-red)", link: "/fortune?type=daily" },
    { title: "월간 운세", desc: "전월, 이번 달, 다음 달의 방향성", icon: <MoonStar className="w-7 h-7" />, color: "var(--accent-wood)", link: "/fortune?type=monthly" },
    { title: "년간 운세", desc: "작년, 올해, 내년의 거시적 판도", icon: <Scroll className="w-7 h-7" />, color: "var(--accent-gold)", link: "/fortune?type=yearly" },
    { title: "정통 사주팔자", desc: "정통 명리학 기반의 심층 분석", icon: <BookOpen className="w-7 h-7" />, color: "var(--text-primary)", link: "/saju" },
  ];

  return (
    <main style={{ width: "100%", minHeight: "100vh", position: "relative", overflow: "hidden", background: "var(--bg-primary)" }}>
      <Disclaimer />
      
      <TraditionalBackground />

      {/* 포그라운드 UI 컨텐츠 */}
      <div style={{ position: "relative", zIndex: 10, minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div className="container" style={{ paddingTop: "60px", paddingBottom: "60px" }}>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-center"
            style={{ marginBottom: "60px" }}
          >
            <div className="animate-float" style={{ display: "inline-block", marginBottom: "20px" }}>
              <Navigation className="text-gradient w-14 h-14" style={{ transform: "rotate(45deg)" }} />
            </div>
            <h1 className="text-gradient" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", marginBottom: "16px" }}>
              운명의 결을 읽다
            </h1>
            <p style={{ fontSize: "1.2rem", color: "var(--text-secondary)", maxWidth: "500px", margin: "0 auto", lineHeight: 1.6 }}>
              AI와 고대의 역법이 빚어낸 거울. 당신이 태어난 순간의 우주와 무의식을 한곳에서 마주하세요.
            </p>
          </motion.div>

          <div 
            style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", 
              gap: "20px",
              maxWidth: "1100px",
              margin: "0 auto"
            }}
          >
            {menus.map((menu, index) => (
              <Link href={menu.link} key={menu.title} style={{ textDecoration: "none" }}>
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.3 + index * 0.15, ease: "easeOut" }}
                  className="glass-panel"
                  style={{ 
                    cursor: "pointer", 
                    position: "relative",
                    overflow: "hidden",
                    padding: "30px 24px",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center"
                  }}
                  whileHover={{ 
                    y: -8, 
                    borderColor: `${menu.color}60`,
                    boxShadow: `0 15px 30px ${menu.color}25`
                  }}
                >
                  <div 
                    style={{
                      position: "absolute",
                      top: "-20%", left: "50%",
                      transform: "translateX(-50%)",
                      width: "150px", height: "150px",
                      background: `radial-gradient(circle, ${menu.color}20, transparent 70%)`,
                      zIndex: 0,
                      transition: "all 0.4s ease"
                    }}
                  />
                  
                  <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div 
                      style={{
                        color: menu.color,
                        marginBottom: "16px",
                        filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.1))`
                      }}
                    >
                      {menu.icon}
                    </div>
                    <h2 style={{ fontSize: "1.4rem", marginBottom: "12px", color: "var(--text-primary)" }}>{menu.title}</h2>
                    <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{menu.desc}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </main>
  );
}
