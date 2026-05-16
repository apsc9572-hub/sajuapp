"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Sparkles,
  ShieldCheck, Target, Zap, CheckCircle2, X, Check
} from "lucide-react";

export default function PremiumInfoPage() {
  const features = [
    { icon: <Target size={16} />, title: "조후·궁성 정밀 보정" },
    { icon: <Zap size={16} />, title: "5,000자 심층 분석" },
    { icon: <ShieldCheck size={16} />, title: "30년 내공 개운 처방" },
    { icon: <CheckCircle2 size={16} />, title: "로그인 없이 즉시 확인" },
  ];

  const comparisons = [
    { label: "분석 분량",  general: "수백 자",      premium: "5,000자+"   },
    { label: "정밀 보정",  general: "없음",          premium: "조후·궁성"  },
    { label: "대운·세운",  general: "단순 나열",     premium: "흐름 해석"  },
    { label: "개운 처방",  general: "없음",          premium: "맞춤 제시"  },
    { label: "신살 분석",  general: "없음",          premium: "정밀 적용"  },
    { label: "로그인",     general: "필요",          premium: "불필요"     },
    { label: "가격",       general: "10,000원 이상", premium: "5,000원"   },
  ];

  return (
    <main style={{
      width: "100%", height: "100vh", overflow: "hidden", position: "relative",
      /* 메인 페이지와 동일한 딥 인디고 계열 */
      background: "linear-gradient(160deg, #1A1D35 0%, #12182E 60%, #1A1D35 100%)",
      fontFamily: "'Nanum Myeongjo', serif",
    }}>
      {/* ── 배경 광채 ── */}
      <div style={{
        position: "absolute", top: "-80px", left: "50%", transform: "translateX(-50%)",
        width: "360px", height: "320px",
        background: "radial-gradient(ellipse, rgba(100,130,220,0.15) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "60px", right: "-40px",
        width: "220px", height: "220px",
        background: "radial-gradient(circle, rgba(201,160,80,0.1) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{
        maxWidth: "520px", margin: "0 auto", height: "100vh",
        display: "flex", flexDirection: "column", overflow: "hidden",
        position: "relative", zIndex: 1,
      }}>

        {/* ── 헤더 ── */}
        <div style={{ padding: "11px 18px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Link href="/">
            <div style={{
              background: "rgba(201,160,80,0.1)", padding: "6px", borderRadius: "50%",
              border: "1px solid rgba(201,160,80,0.25)", cursor: "pointer",
            }}>
              <ArrowLeft size={14} color="#C9A050" />
            </div>
          </Link>
          <Sparkles size={12} color="#C9A050" />
          <span style={{
            fontSize: "0.68rem", fontWeight: "800", letterSpacing: "0.16em",
            color: "rgba(201,160,80,0.75)", textTransform: "uppercase",
          }}>Premium Service</span>
        </div>

        {/* ── 히어로 ── */}
        <div style={{ padding: "2px 20px 0", textAlign: "center" }}>
          {/* 가로 구분선 */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px", justifyContent: "center" }}>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, transparent, rgba(201,160,80,0.45))" }} />
            <span style={{ fontSize: "0.58rem", color: "rgba(201,160,80,0.65)", letterSpacing: "0.2em", fontWeight: "700" }}>청아매당</span>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(to left, transparent, rgba(201,160,80,0.45))" }} />
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            style={{ fontSize: "1.22rem", fontWeight: "900", lineHeight: "1.3", marginBottom: "5px", wordBreak: "keep-all" }}
          >
            <span style={{
              background: "linear-gradient(135deg, #C9A050 0%, #F0D080 50%, #C9A050 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>청아매당 프리미엄</span>
            <span style={{ color: "rgba(230,235,255,0.92)" }}>을<br/>사용해야 하는 이유</span>
          </motion.h1>

          <p style={{ fontSize: "0.7rem", color: "rgba(180,195,235,0.65)", lineHeight: "1.4", margin: 0 }}>
            무료 사주가 놓치는 디테일,{" "}
            <em style={{ color: "rgba(201,160,80,0.85)", fontStyle: "normal", fontWeight: "700" }}>청아매당</em>은
            {" "}한 끗 차이로 운명을 읽습니다.
          </p>
        </div>

        {/* ── 특징 2×2 그리드 ── */}
        <div style={{ padding: "8px 16px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" }}>
            {features.map((f, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "9px",
                padding: "10px 12px", borderRadius: "11px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(201,160,80,0.15)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
              }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "7px", flexShrink: 0,
                  background: "rgba(201,160,80,0.12)",
                  border: "1px solid rgba(201,160,80,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#C9A050",
                }}>
                  {f.icon}
                </div>
                <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "rgba(220,228,255,0.88)", lineHeight: "1.2" }}>
                  {f.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 비교표 ── */}
        <div style={{ padding: "7px 16px 0" }}>
          <div style={{
            borderRadius: "14px", overflow: "hidden",
            border: "1px solid rgba(201,160,80,0.18)",
            background: "rgba(255,255,255,0.035)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.07)",
          }}>
            {/* 표 헤더 */}
            <div style={{
              display: "grid", gridTemplateColumns: "1.1fr 1fr 1fr",
              padding: "7px 14px",
              borderBottom: "1px solid rgba(201,160,80,0.12)",
              background: "linear-gradient(90deg, rgba(100,120,200,0.1), rgba(201,160,80,0.08))",
            }}>
              <span style={{ fontSize: "0.7rem", color: "rgba(180,195,235,0.55)", fontWeight: "700", letterSpacing: "0.05em" }}>구분</span>
              <span style={{ fontSize: "0.7rem", color: "rgba(180,195,235,0.55)", textAlign: "center", fontWeight: "700" }}>일반 사주</span>
              <span style={{ fontSize: "0.7rem", color: "#C9A050", textAlign: "center", fontWeight: "900", letterSpacing: "0.03em" }}>청아매당</span>
            </div>
            {comparisons.map((row, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "1.1fr 1fr 1fr",
                padding: "5px 14px", alignItems: "center",
                borderBottom: i < comparisons.length - 1 ? "1px solid rgba(255,255,255,0.045)" : "none",
                background: i % 2 === 0 ? "transparent" : "rgba(100,120,200,0.03)",
              }}>
                <span style={{ fontSize: "0.76rem", fontWeight: "700", color: "rgba(210,220,255,0.85)" }}>{row.label}</span>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                  <X size={11} color="#5A6080" strokeWidth={2.5} />
                  <span style={{ fontSize: "0.7rem", color: "rgba(150,160,200,0.5)" }}>{row.general}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                  <Check size={11} color="#C9A050" strokeWidth={2.5} />
                  <span style={{ fontSize: "0.7rem", color: "#C9A050", fontWeight: "800" }}>{row.premium}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA 버튼 ── 비교표 바로 아래 */}
        <div style={{ padding: "12px 16px" }}>
          <Link href="/premium-saju" style={{ textDecoration: "none" }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: "100%", padding: "15px", borderRadius: "14px",
                background: "linear-gradient(135deg, #C9A050 0%, #F0D080 50%, #C9A050 100%)",
                color: "#12182E", fontWeight: "900", fontSize: "1.02rem",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                boxShadow: "0 6px 28px rgba(201,160,80,0.38), 0 2px 8px rgba(0,0,0,0.3)",
                letterSpacing: "0.02em", fontFamily: "'Nanum Myeongjo', serif",
              }}
            >
              지금 프리미엄 감명 시작하기 <ArrowRight size={17} />
            </motion.button>
          </Link>
        </div>

      </div>
    </main>
  );
}
