"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, Copy, Download, ArrowUp, Home, Zap, ShieldCheck, ArrowLeft, Star, Quote, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// --- Helper Functions & Constants ---

const stemsHanja: Record<string, string> = {
  "갑": "甲", "을": "乙", "병": "丙", "정": "丁", "무": "戊",
  "기": "己", "경": "庚", "신": "辛", "임": "壬", "계": "癸"
};
const branchesHanja: Record<string, string> = {
  "자": "子", "축": "丑", "인": "寅", "묘": "卯", "진": "辰", "사": "巳",
  "오": "午", "미": "未", "신": "申", "유": "酉", "술": "戌", "해": "亥"
};

const getElementColor = (char: string) => {
  if (!char) return 'var(--text-primary)';
  const c = char.toLowerCase();
  // Premium Color Palette: Deep Emerald, Vibrant Coral, Rich Earth, Golden Bronze, Slate Indigo
  if (['목', '甲', '乙', '寅', '묘', '卯', 'wood'].some(v => c.includes(v))) return '#2d6a4f';
  if (['화', '丙', '정', '丁', '사', '巳', '오', '午', 'fire'].some(v => c.includes(v))) return '#bc4749';
  if (['토', '무', '기', '戊', '己', '진', '술', '축', '미', '辰', '戌', '丑', '미', 'earth'].some(v => c.includes(v))) return '#7f4f24';
  if (['금', '경', '신', '庚', '辛', '申', '유', '酉', 'metal'].some(v => c.includes(v))) return '#b08d57';
  if (['수', '임', '계', '壬', '癸', '해', '자', '亥', '자', 'water'].some(v => c.includes(v))) return '#1d3557';
  return 'var(--text-primary)';
};

// --- Sub-components ---

const StrengthGauge = ({ base, corrected }: { base: any, corrected: any }) => {
    return (
        <div style={{ padding: "20px", background: "white", borderRadius: "20px", border: "1.5px solid var(--accent-indigo)22", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", marginTop: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
                <ShieldCheck size={18} color="var(--accent-indigo)" />
                <span style={{ fontSize: "0.9rem", fontWeight: "900", color: "#333", whiteSpace: "nowrap" }}>타고난 기운의 강약 (신강/신약)</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <div style={{ padding: "12px", background: "#f8f9fa", borderRadius: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: "0.65rem", color: "#999", fontWeight: "800", marginBottom: "4px" }}>기본 오행</div>
                    <div style={{ fontSize: "1rem", fontWeight: "900", color: "#666" }}>{base?.label || "신약"}</div>
                    <div style={{ fontSize: "0.7rem", color: "#999", fontWeight: "600" }}>{base?.score || 0}점</div>
                </div>
                <div style={{ padding: "12px", background: "rgba(26,28,60,0.05)", borderRadius: "12px", textAlign: "center", border: "1px solid var(--accent-indigo)33" }}>
                    <div style={{ fontSize: "0.65rem", color: "var(--accent-indigo)", fontWeight: "800", marginBottom: "4px" }}>보정 오행</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "900", color: "var(--accent-indigo)" }}>{corrected?.label || "신강"}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--accent-indigo)aa", fontWeight: "700" }}>{corrected?.score || 0}점</div>
                </div>
            </div>

            <div style={{ position: "relative", height: "10px", background: "#f0f0f5", borderRadius: "10px", overflow: "visible" }}>
                <div style={{ position: "absolute", left: "50%", top: "-4px", bottom: "-4px", width: "1px", background: "rgba(0,0,0,0.1)", zIndex: 1 }} />
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${corrected?.score || 50}%` }}
                    style={{ height: "100%", borderRadius: "10px", background: "linear-gradient(90deg, #3d5a80, #81b29a, #e07a5f)" }} 
                />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "0.55rem", fontWeight: "700", color: "#bbb", letterSpacing: "1px" }}>
                <span>SHINYAK (Weak)</span>
                <span>NEUTRAL</span>
                <span>SHINGANG (Strong)</span>
            </div>
        </div>
    );
};

const YongsinBox = ({ yongsin, desc }: { yongsin: any, desc: string }) => {
    // Handle both old string format and new {johu, eokbu} format
    const eokbu = typeof yongsin === 'object' ? yongsin?.eokbu : yongsin;
    const johu = typeof yongsin === 'object' ? yongsin?.johu : null;
    
    const colorEokbu = getElementColor(eokbu?.split('(')[0] || "");
    const colorJohu = johu ? getElementColor(johu?.split('(')[0] || "") : null;

    return (
        <div style={{ padding: "24px 20px", background: "radial-gradient(circle at top left, #2A365F, #1A1C3C)", borderRadius: "24px", color: "white", boxShadow: "0 12px 40px rgba(26,28,60,0.25)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px", background: "rgba(212, 163, 115, 0.1)", borderRadius: "50%", filter: "blur(30px)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{ padding: "6px 12px", background: "linear-gradient(135deg, #D4A373, #B8860B)", borderRadius: "30px", fontSize: "0.65rem", fontWeight: "900", color: "white", letterSpacing: "0.05em", boxShadow: "0 4px 10px rgba(184,134,11,0.3)" }}>나의 인생 용신 (Life Key)</div>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", position: "relative", zIndex: 1 }}>
                {eokbu && (
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "80px", padding: "6px 0", background: colorEokbu, borderRadius: "10px", color: "white", fontSize: "0.75rem", fontWeight: "900", textAlign: "center", boxShadow: `0 4px 10px ${colorEokbu}33` }}>억부용신</div>
                        <div style={{ fontSize: "1.1rem", fontWeight: "900", color: "var(--accent-gold)" }}>{eokbu} <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: "600", fontSize: "0.85rem" }}>: 균형의 기운</span></div>
                    </div>
                )}
                {johu && (
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "80px", padding: "6px 0", background: colorJohu || "var(--accent-indigo)", borderRadius: "10px", color: "white", fontSize: "0.75rem", fontWeight: "900", textAlign: "center", boxShadow: `0 4px 10px ${colorJohu}33` }}>조후용신</div>
                        <div style={{ fontSize: "1.1rem", fontWeight: "900", color: "var(--accent-gold)" }}>{johu} <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: "600", fontSize: "0.85rem" }}>: 온도의 기운</span></div>
                    </div>
                )}
            </div>
            
            <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.8)", lineHeight: "1.6", margin: 0 }}>{desc}</p>
            </div>
        </div>
    );
};

const SajuPillarTable = ({ data, tenGods, stages12, sinsals }: { data: any, tenGods: any, stages12: any, sinsals: any }) => {
  if (!data) return null;
  const pillars = [
    { label: "시", data: data.hour, stage: stages12?.hour || "-", topTen: data.hour.stemTenGod || tenGods?.hour?.stem || "-", bottomTen: data.hour.branchTenGod || tenGods?.hour?.branch || "-", sinsal: Array.isArray(sinsals?.hour) ? sinsals.hour.join(', ') : (sinsals?.hour || "-") },
    { label: "일", data: data.day, stage: stages12?.day || "-", topTen: "비견", bottomTen: data.day.branchTenGod || tenGods?.day?.branch || "-", sinsal: Array.isArray(sinsals?.day) ? sinsals.day.join(', ') : (sinsals?.day || "-") },
    { label: "월", data: data.month, stage: stages12?.month || "-", topTen: data.month.stemTenGod || tenGods?.month?.stem || "-", bottomTen: data.month.branchTenGod || tenGods?.month?.branch || "-", sinsal: Array.isArray(sinsals?.month) ? sinsals.month.join(', ') : (sinsals?.month || "-") },
    { label: "년", data: data.year, stage: stages12?.year || "-", topTen: data.year.stemTenGod || tenGods?.year?.stem || "-", bottomTen: data.year.branchTenGod || tenGods?.year?.branch || "-", sinsal: Array.isArray(sinsals?.year) ? sinsals.year.join(', ') : (sinsals?.year || "-") }
  ];

  const headerStyle = { background: "#f8f9fa", borderBottom: "1px solid #eee", textAlign: "center" as const, fontSize: "0.8rem", fontWeight: "800", color: "#333", padding: "6px 0" };
  const labelColStyle = { background: "#fcfcfc", borderRight: "1px solid #eee", borderBottom: "1px solid #eee", textAlign: "center" as const, display: "flex", flexDirection: "column" as const, justifyContent: "center", fontSize: "0.7rem", fontWeight: "800", color: "#666" };
  const cellStyle = (isLast = false) => ({ borderBottom: "1px solid #eee", borderRight: isLast ? "none" : "1px solid #eee", textAlign: "center" as const, padding: "6px 0", fontSize: "0.8rem" });

  return (
    <div style={{ margin: "14px 0", background: "white", borderRadius: "24px", border: "1.5px solid #3d5a801a", boxShadow: "0 8px 30px rgba(0,0,0,0.04)", overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "55px 1fr 1fr 1fr 1fr", width: "100%" }}>
        <div style={headerStyle}></div>
        {pillars.map((p, i) => <div key={i} style={{ ...headerStyle, borderRight: i === 3 ? "none" : "1px solid #eee" }}>{p.label}</div>)}
        <div style={labelColStyle}>십성</div>
        {pillars.map((p, i) => <div key={`t1-${i}`} style={{ ...cellStyle(i === 3), fontWeight: "900", color: getElementColor(p.data.element.stem), background: "white" }}>{p.topTen}</div>)}
        <div style={labelColStyle}>천간</div>
        {pillars.map((p, i) => (
          <div key={`s-${i}`} style={{ ...cellStyle(i === 3), display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", background: "white" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: `linear-gradient(135deg, ${getElementColor(p.data.element.stem)}, #333)`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "1.3rem", fontWeight: "900", boxShadow: `0 4px 12px ${getElementColor(p.data.element.stem)}44`, textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>{stemsHanja[p.data.stemKo]}</div>
            <div style={{ fontSize: "0.55rem", fontWeight: "700", color: "#999" }}>{p.data.stemKo}</div>
          </div>
        ))}
        <div style={labelColStyle}>지지</div>
        {pillars.map((p, i) => (
          <div key={`b-${i}`} style={{ ...cellStyle(i === 3), display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", background: "white" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: `linear-gradient(135deg, ${getElementColor(p.data.element.branch)}, #444)`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "1.1rem", fontWeight: "900", boxShadow: `0 4px 12px ${getElementColor(p.data.element.branch)}33`, textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>{branchesHanja[p.data.branchKo]}</div>
            <div style={{ fontSize: "0.55rem", fontWeight: "700", color: "#999" }}>{p.data.branchKo}</div>
          </div>
        ))}
        <div style={labelColStyle}>십성</div>
        {pillars.map((p, i) => <div key={`t2-${i}`} style={{ ...cellStyle(i === 3), fontWeight: "900", color: getElementColor(p.data.element.branch), background: "#fdfbf7" }}>{p.bottomTen}</div>)}
        <div style={labelColStyle}>지장간</div>
        {pillars.map((p, i) => (
          <div key={`hj-${i}`} style={{ ...cellStyle(i === 3), fontSize: "0.6rem", color: "#666", lineHeight: "1.2", padding: "6px 0", background: "white" }}>
            {p.data.hiddenText ? p.data.hiddenText.split('').map((char: string, idx: number) => (
              <span key={idx} style={{ color: getElementColor(char), fontWeight: "800", marginRight: "1px" }}>{char}</span>
            )) : "-"}
          </div>
        ))}
        <div style={labelColStyle}>운성</div>
        {pillars.map((p, i) => (
          <div key={`st-${i}`} style={{ ...cellStyle(i === 3), fontSize: "0.68rem", fontWeight: "800", color: "#555", background: "white" }}>
            {p.stage}
          </div>
        ))}
      </div>
    </div>
  );
};

const ElementDonutChart = ({ data, labels }: { data: any, labels?: any }) => {
  if (!data) return null;
  const elements = [
    { key: "wood", label: "목", color: "#81b29a" },
    { key: "fire", label: "화", color: "#e07a5f" },
    { key: "earth", label: "토", color: "#8B4513" },
    { key: "metal", label: "금", color: "#FFD700" },
    { key: "water", label: "수", color: "#3d5a80" }
  ];

  const total = Object.values(data).reduce((a: any, b: any) => a + b, 0) as number;
  let accumulatedPercent = 0;
  
  const radius = 40;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
      <div style={{ position: "relative", width: "160px", height: "160px" }}>
        <svg height="160" width="160" viewBox="0 0 100 100">
          {elements.map((el, i) => {
            const val = data[el.key] || 0;
            if (val <= 0) return null;
            const strokeDashoffset = circumference - (val / total) * circumference;
            const rotation = (accumulatedPercent / total) * 360;
            accumulatedPercent += val;
            return (
              <circle
                key={i}
                stroke={el.color}
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={`${circumference} ${circumference}`}
                style={{ strokeDashoffset, transform: `rotate(${rotation - 90}deg)`, transformOrigin: "50% 50%", transition: "all 1s ease" }}
                r={normalizedRadius}
                cx="50"
                cy="50"
              />
            );
          })}
          <circle cx="50" cy="50" r={radius - stroke} fill="white" />
        </svg>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", width: "100%" }}>
          <div style={{ fontSize: "0.6rem", color: "#999", fontWeight: "700", marginBottom: "2px" }}>주요 오행</div>
          <div style={{ fontSize: "1.1rem", fontWeight: "900", color: elements.reduce((a, b) => (data[a.key] || 0) > (data[b.key] || 0) ? a : b).color }}>
            {(() => {
              const dominant = elements.reduce((a, b) => (data[a.key] || 0) > (data[b.key] || 0) ? a : b);
              const hanjaMap: Record<string, string> = { "목": "木", "화": "火", "토": "土", "금": "金", "수": "水" };
              return `${dominant.label}(${hanjaMap[dominant.label]})`;
            })()}
          </div>
        </div>
      </div>

      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
        {elements.map((el, i) => {
          const val = data[el.key] || 0;
          const label = labels ? labels[el.key] : "";
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "#f8f9fa", borderRadius: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: el.color }} />
                <span style={{ fontSize: "0.85rem", fontWeight: "800", color: "#444" }}>{el.label}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#777" }}>{val.toFixed(1)}%</span>
                <span style={{ fontSize: "0.7rem", fontWeight: "900", color: el.color, background: `${el.color}15`, padding: "2px 6px", borderRadius: "4px" }}>{label || (val >= 40 ? "과다" : val >= 25 ? "발달" : val >= 10 ? "보통" : "부족")}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SinsalGilseongTable = ({ data, sinsals }: { data: any, sinsals: any }) => {
    if (!data || !sinsals) return null;
    
    const pillars = [
        { label: "생시", data: data.hour, stemsal: sinsals.hour_stem || [], branchsal: sinsals.hour || [] },
        { label: "생일", data: data.day, stemsal: sinsals.day_stem || [], branchsal: sinsals.day || [] },
        { label: "생월", data: data.month, stemsal: sinsals.month_stem || [], branchsal: sinsals.month || [] },
        { label: "생년", data: data.year, stemsal: sinsals.year_stem || [], branchsal: sinsals.year || [] }
    ];

    const labelStyle = { background: "#f8f9fa", borderRight: "1px solid #eee", borderBottom: "1px solid #eee", textAlign: "center" as const, fontSize: "0.75rem", color: "#666", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center" };
    const cellStyle = (isLast = false) => ({ borderBottom: "1px solid #eee", borderRight: isLast ? "none" : "1px solid #eee", textAlign: "center" as const, padding: "10px 4px", minHeight: "60px" });

    return (
        <div style={{ marginTop: "24px", background: "white", borderRadius: "24px", border: "1.5px solid #eee", overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
            <div style={{ padding: "14px", background: "#f8f9fa", textAlign: "center", borderBottom: "1px solid #eee" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: "900", color: "var(--accent-indigo)", margin: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                    <Star size={14} fill="var(--accent-gold)" color="var(--accent-gold)" /> 신살과 길성
                </h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 1fr 1fr" }}>
                <div style={labelStyle}>구분</div>
                {pillars.map((p, i) => <div key={`h-${i}`} style={{ ...labelStyle, borderRight: i === 3 ? "none" : "1px solid #eee", padding: "6px 0" }}>{p.label}</div>)}
                
                <div style={labelStyle}>천간</div>
                {pillars.map((p, i) => (
                    <div key={`ts-${i}`} style={{ ...cellStyle(i === 3), display: "flex", flexDirection: "column", gap: "2px", justifyContent: "center" }}>
                        <div style={{ fontSize: "1.1rem", fontWeight: "900", color: getElementColor(p.data.stemKo), marginBottom: "4px" }}>{stemsHanja[p.data.stemKo]}</div>
                        {p.stemsal?.length > 0 ? p.stemsal.map((s: string, idx: number) => (
                            <span key={idx} style={{ fontSize: "0.6rem", color: "#ec4899", fontWeight: "700" }}>{s}</span>
                        )) : <span style={{ fontSize: "0.7rem", color: "#ccc" }}>×</span>}
                    </div>
                ))}

                <div style={labelStyle}>지지</div>
                {pillars.map((p, i) => (
                    <div key={`bs-${i}`} style={{ ...cellStyle(i === 3), display: "flex", flexDirection: "column", gap: "2px", justifyContent: "center" }}>
                        <div style={{ fontSize: "1rem", fontWeight: "900", color: getElementColor(p.data.branchKo), marginBottom: "4px" }}>{branchesHanja[p.data.branchKo]}</div>
                        {p.branchsal?.length > 0 ? p.branchsal.map((s: string, idx: number) => (
                            <span key={idx} style={{ fontSize: "0.6rem", color: "#ec4899", fontWeight: "700" }}>{s}</span>
                        )) : <span style={{ fontSize: "0.7rem", color: "#ccc" }}>×</span>}
                    </div>
                ))}
            </div>
        </div>
    );
};

const SipsungDistributionTable = ({ tenGods, ilgan, type }: { tenGods: any, ilgan: string, type: 'base' | 'corrected' }) => {
    if (!tenGods || !ilgan) return null;

    const categories = [
        { key: "bigyeon", label: "비견", sub: "比肩", index: 0 },
        { key: "geobjae", label: "겁재", sub: "劫財", index: 0 },
        { key: "siksin", label: "식신", sub: "食神", index: 1 },
        { key: "sanggwan", label: "상관", sub: "傷官", index: 1 },
        { key: "pyeonja", label: "편재", sub: "偏財", index: 2 },
        { key: "jeongja", label: "정재", sub: "正財", index: 2 },
        { key: "pyeongwan", label: "편관", sub: "偏官", index: 3 },
        { key: "jeonggwan", label: "정관", sub: "正官", index: 3 },
        { key: "pyeonin", label: "편인", sub: "偏印", index: 4 },
        { key: "jeongin", label: "정인", sub: "正印", index: 4 }
    ];

    const ilganEl = ['갑', '을'].includes(ilgan) ? 'wood' : 
                    ['병', '정'].includes(ilgan) ? 'fire' : 
                    ['무', '기'].includes(ilgan) ? 'earth' : 
                    ['경', '신'].includes(ilgan) ? 'metal' : 'water';

    const cycle = ['wood', 'fire', 'earth', 'metal', 'water'];
    const startIdx = cycle.indexOf(ilganEl);
    
    // Sipsung cycle: Me (Bikyeop) -> Output (Siksnagal) -> Result (Jaeseong) -> Control (Gwanseong) -> Input (Inseong)
    const getCategoryColor = (index: number) => {
        // me (bikyeop=0), output (siksang=1), wealth (jaeseong=2), control (gwanseong=3), input (inseong=4)
        const el = cycle[(startIdx + index) % 5];
        if (el === 'wood') return '#81b29a';
        if (el === 'fire') return '#e07a5f';
        if (el === 'earth') return '#D4A373';
        if (el === 'metal') return '#FFD700';
        if (el === 'water') return '#3d5a80';
        return '#333';
    };

    return (
        <motion.div 
            key={type}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ padding: "24px", background: "linear-gradient(180deg, white, #fdfbf7)", borderRadius: "24px", border: "1.5px solid #eee", boxShadow: "0 4px 15px rgba(0,0,0,0.02)", marginTop: "24px" }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <Zap size={18} color={type === 'corrected' ? "var(--accent-gold)" : "#999"} />
                <span style={{ fontSize: "0.95rem", fontWeight: "900", color: "#333" }}>십성 상세 분포 ({type === 'corrected' ? '보정' : '기색'})</span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {categories
                    .filter(cat => (tenGods[cat.key] || 0) > 0)
                    .map((cat, idx) => {
                    const percent = tenGods[cat.key] || 0;
                    const color = getCategoryColor(cat.index);
                    
                    return (
                        <div key={cat.key} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            <div style={{ width: "52px", textAlign: "center", background: "#f8f9fa", padding: "6px 0", borderRadius: "10px", border: `1px solid ${color}11` }}>
                                <div style={{ fontSize: "0.85rem", fontWeight: "900", color }}>{cat.label}</div>
                                <div style={{ fontSize: "0.5rem", color: "#aaa", fontWeight: "700" }}>{cat.sub}</div>
                            </div>
                            
                            <div style={{ flex: 1, position: "relative" }}>
                                <div style={{ height: "12px", background: "#f0f0f5", borderRadius: "10px", overflow: "hidden" }}>
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percent}%` }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        style={{ height: "100%", background: `linear-gradient(90deg, ${color}dd, ${color})`, borderRadius: "10px" }} 
                                    />
                                </div>
                            </div>
                            
                            <div style={{ width: "42px", textAlign: "right", fontSize: "0.9rem", fontWeight: "900", color: percent > 0 ? "#333" : "#ddd" }}>
                                {percent}%
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
};

const ElementalCycleDiagram = ({ counts, type }: { counts: any, type: 'base' | 'corrected' }) => {
    const elements = [
      { key: "wood", label: "목", color: "#81b29a", pos: { x: 100, y: 30 } },
      { key: "fire", label: "화", color: "#e07a5f", pos: { x: 175, y: 85 } },
      { key: "earth", label: "토", color: "#8B4513", pos: { x: 150, y: 165 } },
      { key: "metal", label: "금", color: "#FFD700", pos: { x: 50, y: 165 } },
      { key: "water", label: "수", color: "#3d5a80", pos: { x: 25, y: 85 } }
    ];
    return (
      <div style={{ position: "relative", width: "240px", height: "240px", margin: "10px auto" }}>
        <svg width="240" height="240" viewBox="0 0 200 200">
          {elements.map((el, i) => {
            const next = elements[(i + 1) % 5];
            return <path key={`saeng-${i}`} d={`M ${el.pos.x} ${el.pos.y} A 85 85 0 0 1 ${next.pos.x} ${next.pos.y}`} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1" strokeDasharray="3,2" />;
          })}
          {elements.map((el, i) => {
            const target = elements[(i + 2) % 5];
            return <line key={`geuk-${i}`} x1={el.pos.x} y1={el.pos.y} x2={target.pos.x} y2={target.pos.y} stroke="rgba(212, 163, 115, 0.2)" strokeWidth="1.2" />;
          })}
          {elements.map((el, i) => (
            <g key={i}>
              <circle cx={el.pos.x} cy={el.pos.y} r="20" fill="white" />
              <circle cx={el.pos.x} cy={el.pos.y} r="18" fill="none" stroke={el.color} strokeWidth="1.5" />
              <text x={el.pos.x} y={el.pos.y - 2} textAnchor="middle" fontSize="0.85rem" fontWeight="900" fill={el.color}>{el.label}</text>
              <text x={el.pos.x} y={el.pos.y + 10} textAnchor="middle" fontSize="0.55rem" fontWeight="700" fill="#999">{counts[el.key] || 0}개</text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

const DaeunTable = ({ cycles, currentIndex }: { cycles: any[], currentIndex?: number }) => {
    if (!cycles || cycles.length === 0) return null;
    return (
      <div style={{ background: "white", border: "1.5px solid #3d5a80", borderRadius: "12px", padding: "12px 6px", width: "100%", marginTop: "10px" }}>
        <div style={{ textAlign: "center", marginBottom: "8px" }}>
            <h3 style={{ fontSize: "0.85rem", fontWeight: "900", color: "#333", margin: 0 }}>귀하의 대운표</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cycles.length}, 1fr)`, border: "1px solid #ddd", borderRadius: "10px", overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
          {cycles.map((c, i) => (
            <div key={`y-${i}`} style={{ padding: "8px 0", background: i === currentIndex ? "var(--accent-indigo)" : "#f8f9fa", color: i === currentIndex ? "white" : "#999", borderBottom: "1px solid #eee", borderLeft: i > 0 ? "1px solid #eee" : "none", fontSize: "0.6rem", fontWeight: "900", textAlign: "center" }}>{c.year}</div>
          ))}
          {cycles.map((c, i) => (
            <div key={`a-${i}`} style={{ padding: "8px 0", background: i === currentIndex ? "rgba(26,28,60,0.05)" : "white", borderLeft: i > 0 ? "1px solid #eee" : "none", fontSize: "0.75rem", fontWeight: "800", textAlign: "center", borderBottom: "1px solid #eee", whiteSpace: "nowrap", color: i === currentIndex ? "var(--accent-indigo)" : "#666" }}>{c.age}세</div>
          ))}
          {cycles.map((c, i) => (
            <div key={`g-${i}`} style={{ padding: "10px 0", background: i === currentIndex ? "rgba(212, 163, 115, 0.08)" : "white", borderLeft: i > 0 ? "1px solid #eee" : "none", textAlign: "center", position: "relative" }}>
              {i === currentIndex && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "var(--accent-gold)" }} />}
              <div style={{ fontSize: "1rem", fontWeight: "900", color: getElementColor(c.ganji[0]) }}>{stemsHanja[c.ganji[0]] || c.ganji[0]}</div>
              <div style={{ fontSize: "1rem", fontWeight: "900", color: getElementColor(c.ganji[1]) }}>{branchesHanja[c.ganji[1]] || c.ganji[1]}</div>
              <div style={{ fontSize: "0.6rem", color: "#999", marginTop: "2px", fontWeight: "700" }}>{c.ganjiKo}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

const renderHighlightedText = (rawText: string, isDarkBg = false) => {
    if (!rawText) return null;
    let text = rawText
      .replace(/&nbsp;/g, ' ') // Strip &nbsp; entities
      .replace(/<[^>]+>/g, '')
      .replace(/^\s*[\{\[\]\}]+\s*/gm, '')
      .trim();
    
    // Split by double line breaks first
    const paragraphs = text.split(/\n\s*\n/);
    return paragraphs.map((para, i) => {
      const trimmed = para.trim();
      const isHeader = /^[\d\s]*[📍📅🔍💡🎯🏆💎✨■]/.test(trimmed) || trimmed.startsWith('###') || trimmed.startsWith('##') || (trimmed.startsWith('【') && trimmed.endsWith('】'));
      
      const processSpans = (innerContent: string) => {
        // Handle both ★...★ and [major]...[/major] for backwards compatibility and consistency
        const segments = innerContent.split(/(★.*?★|\[major\].*?\[\/major\])/g);
        return segments.map((seg, idx) => {
          if (seg.startsWith('★') && seg.endsWith('★')) {
            const clean = seg.slice(1, -1);
            return <motion.span key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: "var(--accent-gold)", fontWeight: "800", borderBottom: "1.5px solid rgba(212,163,115,0.3)" }}>{clean}</motion.span>;
          }
          if (seg.startsWith('[major]') && seg.endsWith('[/major]')) {
            const clean = seg.slice(7, -8);
            return <motion.span key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: "var(--accent-gold)", fontWeight: "800", borderBottom: "1.5px solid rgba(212,163,115,0.3)" }}>{clean}</motion.span>;
          }
          // Cleanup any stray tag fragments like [/major] or [major] that might have survived split
          return seg.replace(/\[\/?major\]/g, "");
        });
      };

      return (
        <div key={i} style={{ marginBottom: isHeader ? "10px" : "12px", marginTop: isHeader && i > 0 ? "20px" : "0", lineHeight: "1.7", fontSize: isHeader ? "0.92rem" : "0.78rem", fontWeight: isHeader ? "700" : "400", color: isHeader ? (isDarkBg ? "var(--accent-gold)" : "var(--accent-indigo)") : (isDarkBg ? "rgba(255, 255, 255, 0.85)" : "var(--text-secondary)"), whiteSpace: "pre-wrap" }}>
          {processSpans(trimmed)}
        </div>
      );
    });
  };

export default function SajuResultView({ reading, detailedData, onCopy }: { reading: any, detailedData: any, onCopy: () => void }) {
  const resultRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<"base" | "corrected">("corrected");

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!reading || !detailedData) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Top Navigation */}
      <div style={{ display: "flex", justifyContent: "flex-start", padding: "10px 0" }}>
          <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", color: "var(--accent-indigo)", fontWeight: "800", fontSize: "0.85rem", cursor: "pointer" }}>
            <ChevronLeft size={20} /> 뒤로가기
          </button>
      </div>

      <div ref={resultRef} style={{ background: "white", padding: "16px" }}>
        {/* Premium Header */}
        <div style={{ textAlign: "center", marginBottom: "24px", paddingTop: "6px" }}>
            <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ fontSize: "0.6rem", color: "var(--accent-gold)", fontWeight: "900", letterSpacing: "0.2em", marginBottom: "8px" }}>
                <Star size={10} style={{ display: "inline-block", marginRight: "4px" }} fill="var(--accent-gold)" /> 
                PLAY&GET PREMIUM REPORT 
                <Star size={10} style={{ display: "inline-block", marginLeft: "4px" }} fill="var(--accent-gold)" />
            </motion.div>
            <h1 style={{ fontSize: "1.2rem", color: "var(--accent-indigo)", fontWeight: "900", lineHeight: "1.4", margin: "0 auto 10px", maxWidth: "290px" }}>
              귀하의 질문을 명리학적으로 풀어낸 답변입니다.
            </h1>
            <p style={{ fontSize: "0.75rem", color: "#888", fontWeight: "600", letterSpacing: "-0.01em" }}>{reading.subheadline}</p>
        </div>

        <SajuPillarTable data={detailedData.table} tenGods={detailedData.tenGods} stages12={detailedData.stages12} sinsals={detailedData.sinsals} />
        
        {/* New Sinsal & Gilseong Table */}
        <SinsalGilseongTable data={detailedData.table} sinsals={detailedData.sinsals} />

        {/* Core Prediction Box */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", margin: "16px 0" }}>
            <YongsinBox yongsin={reading.yongsin || detailedData.yongsin} desc={reading.yongsin_desc || detailedData.yongsin_desc || "데이터를 분석중입니다."} />
        </div>

        <DaeunTable cycles={detailedData.daeunCycles || []} currentIndex={detailedData.currentDaeunIdx} />

        {/* Energy Distribution Section */}
        <div style={{ margin: "16px 0", background: "white", padding: "16px 14px", borderRadius: "24px", border: "1px solid rgba(201,160,80,0.12)" }}>
            <div style={{ fontSize: "1rem", color: "#333", fontWeight: "900", marginBottom: "16px", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <Zap size={16} color="var(--accent-gold)" /> 나의 오행 에너지 분포
            </div>
            
            <div style={{ display: "flex", background: "#f5f5f7", padding: "4px", borderRadius: "12px", marginBottom: "20px" }}>
                <button onClick={() => setActiveTab("base")} style={{ flex: 1, padding: "8px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "800", border: "none", cursor: "pointer", background: activeTab === "base" ? "white" : "transparent", color: activeTab === "base" ? "#333" : "#999", boxShadow: activeTab === "base" ? "0 2px 8px rgba(0,0,0,0.05)" : "none" }}>기본 오행</button>
                <button onClick={() => setActiveTab("corrected")} style={{ flex: 1, padding: "8px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "800", border: "none", cursor: "pointer", background: activeTab === "corrected" ? "white" : "transparent", color: activeTab === "corrected" ? "var(--accent-indigo)" : "#999", boxShadow: activeTab === "corrected" ? "0 2px 8px rgba(0,0,0,0.05)" : "none" }}>보정 오행</button>
            </div>

            <div style={{ margin: "10px 0 24px" }}>
                {activeTab === "base" ? (
                  <>
                    <ElementDonutChart data={detailedData.elements_ratio_base} />
                    <ElementalCycleDiagram counts={detailedData.elementCounts_base || detailedData.elementCounts} type="base" />
                    <SipsungDistributionTable tenGods={detailedData.baseTenGods || detailedData.tenGods} ilgan={detailedData.table?.ilgan} type="base" />
                  </>
                ) : (
                  <>
                    <ElementDonutChart data={detailedData.elements_ratio} labels={detailedData.element_labels} />
                    <ElementalCycleDiagram counts={detailedData.elementCounts} type="corrected" />
                    <SipsungDistributionTable tenGods={detailedData.tenGods} ilgan={detailedData.table?.ilgan} type="corrected" />
                  </>
                )}
            </div>
        </div>

        <div style={{ padding: "0 10px", marginTop: "30px" }}>
            <div style={{ marginTop: "16px", padding: "12px", background: "rgba(0,0,0,0.03)", borderRadius: "10px", fontSize: "0.8rem", color: "#666", lineHeight: "1.4", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <div style={{ color: "var(--accent-indigo)", flexShrink: 0 }}>ℹ️</div>
                <div>
                    <b>기본 오행:</b> 사주 팔자 8글자의 단순 개수를 의미합니다.<br/>
                    <b>보정 오행:</b> 태어난 계절의 기운(지령)과 각 글자가 실제 주변 글자와 상호작용하며 발휘하는 실질적인 힘의 크기를 정밀하게 보정한 현대 명리학적 해석입니다.
                </div>
            </div>

            {/* Moved Strength Gauge here */}
            <StrengthGauge base={detailedData.strength?.base} corrected={detailedData.strength?.corrected} />
        </div>

        {/* Narrative Analysis */}
        <div style={{ background: "linear-gradient(145deg, #1A1C3C, #2A365F)", padding: "32px 18px", borderRadius: "32px", color: "white", marginTop: "24px", width: "calc(100% + 24px)", marginLeft: "-12px" }}>
            <div style={{ opacity: 0.2, marginBottom: "-20px" }}><Quote size={40} /></div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "900", color: "white", marginBottom: "20px", position: "relative", zIndex: 1 }}>{reading.analysis?.title}</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                <section>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                        <div style={{ width: "4px", height: "16px", background: "var(--accent-gold)", borderRadius: "2px" }} />
                        <h4 style={{ fontSize: "0.95rem", fontWeight: "900", color: "var(--accent-gold)" }}>인생의 형상</h4>
                    </div>
                    {renderHighlightedText(reading.analysis?.life_shape, true)}
                </section>
                
                <section>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                        <div style={{ width: "4px", height: "16px", background: "var(--accent-gold)", borderRadius: "2px" }} />
                        <h4 style={{ fontSize: "0.95rem", fontWeight: "900", color: "var(--accent-gold)" }}>영역별 집중 분석 & 해답</h4>
                    </div>
                    {renderHighlightedText(reading.analysis?.solution, true)}
                </section>

                {!(reading.isTotalFortune || reading.analysis?.isTotalFortune || reading.analysis?.detailed_fortune) && (
                  <section style={{ background: "rgba(255,255,255,0.04)", padding: "20px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                          <Sparkles size={16} color="var(--accent-gold)" />
                          <h4 style={{ fontSize: "0.95rem", fontWeight: "900", color: "var(--accent-gold)" }}>핵심 성패 시기 (2026-2028)</h4>
                      </div>
                      {renderHighlightedText(reading.analysis?.timing, true)}
                  </section>
                )}

                {reading.analysis?.detailed_fortune && (
                  <section style={{ background: "rgba(255,255,255,0.04)", padding: "20px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                          <Sparkles size={16} color="var(--accent-gold)" />
                          <h4 style={{ fontSize: "0.95rem", fontWeight: "900", color: "var(--accent-gold)" }}>분야별 상세 운세</h4>
                      </div>
                      {renderHighlightedText(reading.analysis?.detailed_fortune, true)}
                  </section>
                )}

                {reading.analysis?.turning_points && (
                  <section style={{ background: "rgba(255,255,255,0.04)", padding: "20px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.06)", marginTop: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                          <Sparkles size={16} color="var(--accent-gold)" />
                          <h4 style={{ fontSize: "0.95rem", fontWeight: "900", color: "var(--accent-gold)" }}>인생 주요 전환점 & 위험 시기</h4>
                      </div>
                      {renderHighlightedText(reading.analysis?.turning_points, true)}
                  </section>
                )}
                
                <section>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                        <div style={{ width: "4px", height: "16px", background: "var(--accent-gold)", borderRadius: "2px" }} />
                        <h4 style={{ fontSize: "0.95rem", fontWeight: "900", color: "var(--accent-gold)" }}>실전 개운 비책</h4>
                    </div>
                    {renderHighlightedText(reading.luck_advice || reading.analysis?.luck_advice, true)}
                </section>
            </div>
        </div>

        {/* Closing & Business Info */}
        <div style={{ marginTop: "40px", padding: "24px 10px", borderTop: "1px solid #eee", textAlign: "center" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: "900", color: "var(--accent-indigo)", marginBottom: "4px" }}>PLAY&GET PREMIUM</div>
            <p style={{ fontSize: "0.7rem", color: "#999", marginBottom: "24px" }}>귀하의 앞날에 눈부신 번영이 깃들기를 진심으로 기원합니다.</p>
            
            <div style={{ textAlign: "left", background: "#f8f9fa", padding: "16px", borderRadius: "12px", border: "1px solid #eee" }}>
                <p style={{ fontSize: "0.65rem", color: "#666", margin: "0 0 4px" }}><b>상호:</b> 플레이앤겟 | <b>대표자:</b> 박성철</p>
                <p style={{ fontSize: "0.65rem", color: "#666", margin: "0 0 4px" }}><b>사업자번호:</b> 170-53-00867 | <b>통신판매업:</b> 2026-인천계양-0283</p>
                <p style={{ fontSize: "0.65rem", color: "#666", margin: "0" }}><b>주소:</b> 인천광역시 계양구 용종로 124, 134동 1402호</p>
                <div style={{ marginTop: "12px", borderTop: "1px solid #eee", paddingTop: "8px", fontSize: "0.6rem", color: "#aaa" }}>
                    © 2026 청아매당. 본 리포트는 청아매당의 명리 엔진을 활용한 개인 맞춤형 분석 결과입니다.
                </div>
            </div>
        </div>
      </div>

      <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "24px", paddingBottom: "40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <button onClick={() => router.back()} style={{ padding: "14px", borderRadius: "14px", background: "white", border: "1px solid var(--glass-border)", fontSize: "0.9rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", color: "#333" }}>
                <ArrowLeft size={16} /> 뒤로가기
            </button>
            <Link href="/" style={{ padding: "14px", borderRadius: "14px", background: "white", border: "1px solid var(--glass-border)", fontSize: "0.9rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", color: "#333", textDecoration: "none" }}>
                <Home size={16} /> 홈으로
            </Link>
        </div>
        <button onClick={handleScrollTop} style={{ padding: "14px", borderRadius: "14px", background: "white", border: "1px solid var(--glass-border)", fontSize: "0.9rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", color: "#333" }}>
            <ArrowUp size={16} /> 맨위로
        </button>
        <button onClick={onCopy} style={{ padding: "18px", borderRadius: "18px", background: "var(--accent-indigo)", color: "white", fontWeight: "800", fontSize: "1.05rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", boxShadow: "0 4px 15px rgba(26,28,60,0.3)" }}>
            <Copy size={20} /> 전체 결과 복사
        </button>
      </div>
    </div>
  );
}
