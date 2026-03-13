"use client";

import { motion } from "framer-motion";
import { Sparkles, MoonStar, BookOpen, Scroll, Navigation, Coins, Briefcase, Activity, Heart } from "lucide-react";
import Link from "next/link";
import Disclaimer from "@/components/Disclaimer";
import TraditionalBackground from "@/components/TraditionalBackground";

export default function Home() {
  const menus = [
    { title: "오늘의 흐름", icon: <Sparkles className="w-8 h-8" strokeWidth={1.2} />, color: "var(--accent-indigo)", link: "/fortune?type=daily" },
    { title: "이달의 흐름", icon: <MoonStar className="w-8 h-8" strokeWidth={1.2} />, color: "var(--accent-indigo)", link: "/fortune?type=monthly" },
    { title: "올해의 흐름", icon: <Scroll className="w-8 h-8" strokeWidth={1.2} />, color: "var(--accent-indigo)", link: "/fortune?type=yearly" },
    { title: "전통 사주", icon: <BookOpen className="w-8 h-8" strokeWidth={1.2} />, color: "var(--accent-indigo)", link: "/saju" },
    { title: "재물운", icon: <Coins className="w-8 h-8" strokeWidth={1.2} />, color: "var(--accent-gold)", link: "/fortune?type=wealth" },
    { title: "사업운", icon: <Briefcase className="w-8 h-8" strokeWidth={1.2} />, color: "var(--accent-gold)", link: "/fortune?type=business" },
    { title: "건강운", icon: <Activity className="w-8 h-8" strokeWidth={1.2} />, color: "#81b29a", link: "/fortune?type=health" },
    { title: "애정운", icon: <Heart className="w-8 h-8" strokeWidth={1.2} />, color: "var(--accent-cherry)", link: "/fortune?type=love" },
  ];

  return (
    <main style={{ width: "100%", minHeight: "100vh", position: "relative", overflow: "hidden", background: "var(--bg-primary)" }}>
      <Disclaimer />
      
      <TraditionalBackground />

      {/* 포그라운드 UI 컨텐츠 - 투명도를 높여(0.45 -> 0.7) 배경 위에서 글자가 더 잘 보이게 함 */}
      <div style={{ 
        position: "relative", 
        zIndex: 10, 
        height: "100%", 
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "center", 
        alignItems: "center",
        background: "rgba(255, 255, 255, 0.75)", // 대비 향상을 위해 불투명도 증가
        padding: "10px 0",
        overflow: "hidden" // 스크롤 원천 차단
      }}>
        <div className="container" style={{ width: "100%", padding: "20px 0" }}>
          
          <motion.div 
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "50px" }}
          >
            <div style={{ position: "relative", marginBottom: "20px" }}>
              <motion.div
                animate={{ 
                  y: [0, -5, 0],
                  scale: [1, 1.02, 1]
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                style={{
                  width: "clamp(100px, 25vw, 130px)",
                  height: "clamp(100px, 25vw, 130px)",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.98)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 2,
                  boxShadow: "0 10px 40px rgba(42, 54, 95, 0.12)",
                  border: "2px solid rgba(248, 215, 218, 0.5)",
                  overflow: "hidden"
                }}
              >
                <img 
                  src="/cheong_a_mae_dang_final_logo.png" 
                  alt="청아매당 로고" 
                  style={{ 
                    width: "100%", 
                    height: "100%", 
                    objectFit: "contain"
                  }} 
                />
              </motion.div>
              {/* Soft Ambient Glow */}
              <div style={{ 
                position: "absolute", 
                top: "50%", 
                left: "50%", 
                transform: "translate(-50%, -50%)", 
                width: "200px", 
                height: "200px", 
                background: "radial-gradient(circle, rgba(248, 215, 218, 0.4) 0%, transparent 70%)", 
                opacity: 0.5, 
                zIndex: 1 
              }}></div>
            </div>

            <div style={{ position: "relative", textAlign: "center", marginBottom: "32px", zIndex: 5 }}>
              <h1 className="traditional-title" style={{ 
                fontSize: "clamp(2.4rem, 7vw, 3.2rem)", 
                fontWeight: "900",
                color: "var(--accent-indigo)", 
                letterSpacing: "0.25em",
                margin: "0 0 12px 0",
                position: "relative",
                zIndex: 2,
                fontFamily: "'Nanum Myeongjo', serif",
                textShadow: "0 2px 15px rgba(255, 255, 255, 1), 0 0 30px rgba(255, 255, 255, 1)" // 글자 뒤 광운 효과로 가독성 확보
              }}>
                청아매당
              </h1>
              {/* More Dramatic Ink Wash Style Underline */}
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "130%", opacity: 0.9 }} // 불투명도 높임
                transition={{ delay: 0.5, duration: 2, ease: "easeOut" }}
                style={{ 
                  position: "absolute",
                  bottom: "15px",
                  left: "-15%",
                  height: "20px",
                  background: "radial-gradient(ellipse at center, var(--accent-cherry) 0%, transparent 80%)",
                  filter: "blur(15px)",
                  zIndex: 1,
                  transform: "rotate(-1.5deg)"
                }}
              />
              <p style={{ 
                fontSize: "0.95rem",
                color: "var(--accent-indigo)",
                letterSpacing: "0.1em",
                margin: "12px 0 0 0",
                opacity: 0.95, // 텍스트 진하게
                fontFamily: "'Nanum Myeongjo', serif",
                fontWeight: "700", // 더 굵게
                textAlign: "center"
              }}>
                전통의 지혜로 당신의 길을 비추다
              </p>
            </div>
          </motion.div>

            <motion.div 
              style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(4, 1fr)", 
                gap: "16px 8px", 
                maxWidth: "480px", 
                margin: "0 auto",
                padding: "0 10px",
                perspective: "1000px" 
              }}
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              initial="hidden"
              animate="show"
            >
              {menus.map((menu, index) => (
                <Link href={menu.link} key={menu.title} style={{ textDecoration: "none" }}>
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, scale: 0.8, y: 20 },
                      show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } }
                    }}
                    style={{ 
                      cursor: "pointer", 
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "10px",
                      textAlign: "center",
                      transformStyle: "preserve-3d"
                    }}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -8, 
                      rotateX: 5, 
                      rotateY: -5,
                      filter: "brightness(1.05)"
                    }}
                    whileTap={{ scale: 0.95, y: 0, rotateX: 0, rotateY: 0 }}
                  >
                    <motion.div 
                      style={{
                        width: "clamp(64px, 16vw, 76px)",
                        height: "clamp(64px, 16vw, 76px)",
                        borderRadius: "50%",
                        background: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: menu.color,
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)", // 더 강한 그림자
                        border: "1px solid rgba(42, 54, 95, 0.15)", // 더 진한 테두리
                        transition: "box-shadow 0.3s ease"
                      }}
                      whileHover={{
                        boxShadow: "0 20px 30px rgba(0,0,0,0.1), inset 0 2px 0 rgba(255,255,255,1), 0 0 15px rgba(255,255,255,0.8)"
                      }}
                    >
                      {menu.icon}
                    </motion.div>
                    <span style={{ 
                      fontSize: "0.8rem", 
                      fontWeight: 900, 
                      color: "var(--accent-indigo)", 
                      letterSpacing: "-0.4px",
                      marginTop: "4px",
                      textShadow: "0 2px 10px rgba(255, 255, 255, 1), 0 0 20px rgba(255, 255, 255, 1)" // 가독성을 위한 강한 화이트 쉐도우
                    }}>{menu.title}</span>
                  </motion.div>
                </Link>
              ))}
            </motion.div>

        </div>
      </div>
    </main>
  );
}
