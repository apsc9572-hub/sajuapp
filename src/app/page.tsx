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
    { title: "오늘의 흐름", icon: <Sparkles className="w-8 h-8" strokeWidth={1.5} />, color: "var(--accent-red)", link: "/fortune?type=daily" },
    { title: "이달의 흐름", icon: <MoonStar className="w-8 h-8" strokeWidth={1.5} />, color: "var(--accent-wood)", link: "/fortune?type=monthly" },
    { title: "올해의 흐름", icon: <Scroll className="w-8 h-8" strokeWidth={1.5} />, color: "var(--accent-gold)", link: "/fortune?type=yearly" },
    { title: "나를 비추는 시간", icon: <BookOpen className="w-8 h-8" strokeWidth={1.5} />, color: "var(--text-primary)", link: "/saju" },
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
            className="text-center hero-glass"
            style={{ marginBottom: "clamp(30px, 8vw, 60px)", display: "flex", flexDirection: "column", alignItems: "center", justifySelf: "center", maxWidth: "600px", margin: "0 auto 60px auto" }}
          >
            <div className="animate-float" style={{ display: "inline-block", marginBottom: "clamp(12px, 3vw, 20px)" }}>
              <Navigation className="text-gradient w-12 h-12 md:w-14 md:h-14" style={{ transform: "rotate(45deg)", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))" }} />
            </div>
            <h1 className="title-glow" style={{ fontSize: "clamp(2.2rem, 8vw, 4.5rem)", lineHeight: 1.1, marginBottom: "16px" }}>
              운명의 결을 읽다
            </h1>
            <p style={{ fontSize: "clamp(1.05rem, 3.5vw, 1.25rem)", color: "var(--text-secondary)", fontWeight: 500, maxWidth: "550px", margin: "0 auto", lineHeight: 1.6 }}>
              태어난 시간을 바탕으로 나만의 고유한 흐름을 짚어봅니다.
            </p>
          </motion.div>

          <div className="menu-grid" style={{ maxWidth: "1100px", margin: "0 auto" }}>
            {menus.map((menu, index) => (
              <Link href={menu.link} key={menu.title} style={{ width: "100%", textDecoration: "none" }}>
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.3 + index * 0.15, ease: "easeOut" }}
                  className="glass-panel"
                  style={{ 
                    cursor: "pointer", 
                    position: "relative",
                    overflow: "hidden",
                    padding: "40px 24px",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    background: "transparent",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "20px",
                  }}
                  whileHover={{ 
                    y: -4, 
                    borderColor: `rgba(255, 255, 255, 0.3)`,
                    background: "rgba(255, 255, 255, 0.02)",
                    boxShadow: `0 10px 30px rgba(0,0,0,0.5)`
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
                        filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.3))`
                      }}
                    >
                      {menu.icon}
                    </div>
                    <h2 style={{ fontSize: "1.3rem", margin: 0, fontWeight: 500, color: "var(--text-primary)" }}>{menu.title}</h2>
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
