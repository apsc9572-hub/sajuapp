"use client";

import { motion } from "framer-motion";
import { Sparkles, MoonStar, BookOpen, Scroll, Navigation, Coins, Briefcase, Activity, Heart } from "lucide-react";
import Link from "next/link";
import Disclaimer from "@/components/Disclaimer";
import TraditionalBackground from "@/components/TraditionalBackground";

export default function Home() {
  const menus = [
    { title: "오늘의 흐름", icon: <Sparkles className="w-8 h-8" strokeWidth={1.2} />, color: "var(--accent-red)", link: "/fortune?type=daily" },
    { title: "이달의 흐름", icon: <MoonStar className="w-8 h-8" strokeWidth={1.2} />, color: "var(--accent-wood)", link: "/fortune?type=monthly" },
    { title: "올해의 흐름", icon: <Scroll className="w-8 h-8" strokeWidth={1.2} />, color: "var(--accent-gold)", link: "/fortune?type=yearly" },
    { title: "전통 사주", icon: <BookOpen className="w-8 h-8" strokeWidth={1.2} />, color: "#8B5E3C", link: "/saju" },
    { title: "재물운", icon: <Coins className="w-8 h-8" strokeWidth={1.2} />, color: "#C9A050", link: "/fortune?type=wealth" },
    { title: "사업운", icon: <Briefcase className="w-8 h-8" strokeWidth={1.2} />, color: "#D4A373", link: "/fortune?type=business" },
    { title: "건강운", icon: <Activity className="w-8 h-8" strokeWidth={1.2} />, color: "#81B29A", link: "/fortune?type=health" },
    { title: "애정운", icon: <Heart className="w-8 h-8" strokeWidth={1.2} />, color: "#E07A5F", link: "/fortune?type=love" },
  ];

  return (
    <main style={{ width: "100%", minHeight: "100vh", position: "relative", overflow: "hidden", background: "#FAF9F7" }}>
      <Disclaimer />
      
      <TraditionalBackground />

      {/* 포그라운드 UI 컨텐츠 */}
      <div style={{ position: "relative", zIndex: 10, minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <div className="container" style={{ width: "100%", padding: "20px 0" }}>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.0, ease: "easeOut" }}
            style={{ display: "flex", justifyContent: "center", marginBottom: "50px" }}
          >
            <div className="animate-float" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255,255,255,0.5)", border: "1px solid rgba(212, 175, 55, 0.2)", boxShadow: "0 4px 12px rgba(212, 175, 55, 0.08)" }}>
              <Navigation size={18} color="var(--accent-gold)" style={{ transform: "rotate(45deg)", filter: "drop-shadow(0 2px 4px rgba(212,175,55,0.3))" }} />
            </div>
          </motion.div>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(3, 1fr)", 
            gap: "20px 12px", 
            maxWidth: "500px", 
            margin: "0 auto",
            padding: "0 20px" 
          }}>
            {menus.map((menu, index) => (
              <Link href={menu.link} key={menu.title} style={{ textDecoration: "none" }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  style={{ 
                    cursor: "pointer", 
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "10px",
                    textAlign: "center"
                  }}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div 
                    style={{
                      width: "clamp(60px, 15vw, 72px)",
                      height: "clamp(60px, 15vw, 72px)",
                      borderRadius: "50%",
                      background: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: menu.color,
                      boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
                      border: "1px solid rgba(0,0,0,0.02)",
                      transition: "all 0.3s ease"
                    }}
                  >
                    {menu.icon}
                  </div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.2px" }}>{menu.title}</span>
                </motion.div>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </main>
  );
}
