"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Sparkles, Navigation, CalendarDays, Coins, Heart, Briefcase, Activity, Target, Copy, Download, ArrowUp, Home, CreditCard } from "lucide-react";
import { calculateSaju } from "ssaju";
import TraditionalBackground from "@/components/TraditionalBackground";
import Disclaimer from "@/components/Disclaimer";
import WheelDatePicker from "@/components/WheelDatePicker";
import PaymentModal from "@/components/PaymentModal";
import KoreanLunarCalendar from "korean-lunar-calendar";
import { v4 as uuidv4 } from "uuid";
import Script from "next/script";
import { Suspense } from "react";

const NEW_CATEGORIES = ["재물운", "사업운", "애정운", "직장운", "학업운", "인생총운"];

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
  if (['목', '甲', '乙', '寅', '묘', '卯', 'wood'].some(v => c.includes(v))) return '#81b29a'; // green
  if (['화', '丙', '정', '丁', '사', '巳', '오', '午', 'fire'].some(v => c.includes(v))) return '#e07a5f'; // red
  if (['토', '무', '기', '戊', '己', '진', '술', '축', '미', '辰', '戌', '丑', '未', 'earth'].some(v => c.includes(v))) return '#D4A373'; // brown
  if (['금', '경', '신', '庚', '辛', '申', '유', '酉', 'metal'].some(v => c.includes(v))) return '#FFD700'; // yellow
  if (['수', '임', '계', '壬', '癸', '해', '자', '亥', '子', 'water'].some(v => c.includes(v))) return '#3d5a80'; // blue
  return 'var(--text-primary)';
};

const getElementFromChar = (char: string) => {
  const wood = ['갑', '을', '인', '묘', '甲', '乙', '寅', '卯'];
  const fire = ['병', '정', '사', '오', '丙', '丁', '巳', '午'];
  const earth = ['무', '기', '진', '술', '축', '미', '戊', '己', '辰', '戌', '丑', '未'];
  const metal = ['경', '신', '申', '유', '庚', '辛', '酉'];
  const water = ['임', '계', '해', '자', '壬', '癸', '亥', '子'];
  
  if (wood.some(c => char.includes(c))) return '목';
  if (fire.some(c => char.includes(c))) return '화';
  if (earth.some(c => char.includes(c))) return '토';
  if (metal.some(c => char.includes(c))) return '금';
  if (water.some(c => char.includes(c))) return '수';
  return '토';
};

const calculate12Sals = (dayBranchKo: string, targetBranchKo: string) => {
  const groups: Record<string, string[]> = {
    "wood": ["해", "묘", "미"],
    "fire": ["인", "오", "술"],
    "metal": ["사", "유", "축"],
    "water": ["신", "자", "진"]
  };
  
  const salNames = ["지", "년", "월", "망", "장", "반", "역", "육", "화", "겁", "재", "천"];
  const branches = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
  
  let groupType = "";
  if (groups.wood.includes(dayBranchKo)) groupType = "wood";
  else if (groups.fire.includes(dayBranchKo)) groupType = "fire";
  else if (groups.metal.includes(dayBranchKo)) groupType = "metal";
  else if (groups.water.includes(dayBranchKo)) groupType = "water";
  
  if (!groupType) return "";
  
  const startBranch = groups[groupType][0];
  const startIndex = branches.indexOf(startBranch);
  const targetIndex = branches.indexOf(targetBranchKo);
  
  // Starting from startBranch (Ji-sal), find the index of targetBranchKo
  const diff = (targetIndex - startIndex + 12) % 12;
  const labels: Record<string, string> = {
    "지": "지살", "년": "년살", "월": "월살", "망": "망신살", "장": "장성살", "반": "반안살", 
    "역": "역마살", "육": "육해살", "화": "화개살", "겁": "겁살", "재": "재살", "천": "천살"
  };
  
  return labels[salNames[diff]] || "";
};

const getElementHanja = (element: string) => {
  const e = element.toLowerCase();
  if (e.includes("wood")) return "木";
  if (e.includes("fire")) return "火";
  if (e.includes("earth")) return "土";
  if (e.includes("metal")) return "金";
  if (e.includes("water")) return "水";
  return "";
};

// 청아매당 고유의 '모던 오리엔탈' 카드 명식 디자인 (이미지 참고를 바탕으로 한 독창적 재해석)
const SajuPillarTable = ({ data, tenGods, stages12, sals }: { data: any, tenGods: any, stages12: any, sals: any }) => {
  if (!data) return null;

  const calculateStrength = (ratios: any, ilgan: string) => {
    let support = 0;
    const { wood, fire, earth, metal, water } = ratios;
    if (ilgan === '목') support = wood + water;
    else if (ilgan === '화') support = fire + wood;
    else if (ilgan === '토') support = earth + fire;
    else if (ilgan === '금') support = metal + earth;
    else if (ilgan === '수') support = water + metal;
    if (support >= 80) return "태강(極強)";
    if (support >= 55) return "신강(身強)";
    if (support >= 45) return "중화(中和)";
    if (support >= 20) return "신약(身弱)";
    return "태약(極弱)";
  };
  
  const pillars = [
    { 
      label: "시주", 
      data: data.hour, 
      stage: stages12?.hour || "-", 
      topTen: data.hour.tenGodStem || tenGods?.hour?.stem || "-",
      bottomTen: data.hour.tenGodBranch || tenGods?.hour?.branch || "-",
      sals: sals?.hour || [], 
      posKo: "말년" 
    },
    { 
      label: "일주", 
      data: data.day, 
      stage: stages12?.day || "-", 
      topTen: "일간", 
      bottomTen: data.day.tenGodBranch || tenGods?.day?.branch || "-",
      sals: sals?.day || [], 
      posKo: "중년" 
    },
    { 
      label: "월주", 
      data: data.month, 
      stage: stages12?.month || "-", 
      topTen: data.month.tenGodStem || tenGods?.month?.stem || "-",
      bottomTen: data.month.tenGodBranch || tenGods?.month?.branch || "-",
      sals: sals?.month || [], 
      posKo: "청년" 
    },
    { 
      label: "년주", 
      data: data.year, 
      stage: stages12?.year || "-", 
      topTen: data.year.tenGodStem || tenGods?.year?.stem || "-",
      bottomTen: data.year.tenGodBranch || tenGods?.year?.branch || "-",
      sals: sals?.year || [], 
      posKo: "초년" 
    }
  ];

  return (
    <div className="saju-pillar-container" style={{ 
      margin: "20px 0",
      padding: "8px",
      background: "white",
      borderRadius: "20px",
      border: "1.5px solid #3d5a80",
      boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
      overflowX: "hidden"
    }}>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "58px 1fr 1fr 1fr 1fr", // 라벨 너비 소폭 확장 (십이운성 잘림 방지)
        width: "100%", 
        border: "1px solid #eee",
        borderRadius: "12px",
        overflow: "hidden"
      }}>
        {/* 헤더 행 (시 일 월 년) */}
        <div style={{ padding: "12px 0", background: "#f8f9fa", borderBottom: "1px solid #eee", borderRight: "1px solid #eee" }}></div>
        {pillars.map((p, i) => (
          <div key={`header-${i}`} style={{ 
            padding: "12px 0", 
            background: "#f8f9fa", 
            borderBottom: "1px solid #eee", 
            borderRight: i < 3 ? "1px solid #eee" : "none",
            textAlign: "center",
            fontSize: "1rem",
            fontWeight: "900",
            color: "#333"
          }}>
            {p.label.replace("주", "")}
          </div>
        ))}

        {/* 십성 (상) */}
        <div style={{ padding: "10px 0", borderBottom: "1px solid #eee", borderRight: "1px solid #eee", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", background: "#fcfcfc" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "#333" }}>십성</div>
        </div>
        {pillars.map((p, i) => (
          <div key={`topten-${i}`} style={{ 
            padding: "10px 0", 
            borderBottom: "1px solid #eee", 
            borderRight: i < 3 ? "1px solid #eee" : "none",
            textAlign: "center",
            fontSize: "0.85rem",
            fontWeight: "700",
            color: p.topTen === "일간" ? "#333" : "#666" // 진한 색상 완화
          }}>
            {p.topTen}
          </div>
        ))}

        {/* 천간 (Hanja + Subtext) */}
        <div style={{ padding: "12px 0", borderBottom: "1px solid #eee", borderRight: "1px solid #eee", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", background: "#fcfcfc" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "#333" }}>천간</div>
        </div>
        {pillars.map((p, i) => (
          <div key={`stem-${i}`} style={{ 
            padding: "10px 0", 
            borderBottom: "1px solid #eee", 
            borderRight: i < 3 ? "1px solid #eee" : "none",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px"
          }}>
            <div style={{ 
                width: "42px", height: "42px", borderRadius: "10px", 
                background: getElementColor(p.data.element.stem),
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontSize: "1.3rem", fontWeight: "900"
            }}>
                {stemsHanja[p.data.stemKo]}
            </div>
            <div style={{ fontSize: "0.6rem", fontWeight: "700", color: "#666" }}>
                {p.data.stemKo}
                <span style={{ fontSize: "0.6rem", opacity: 0.6, marginLeft: "2px" }}>
                  /{p.data.element.stem.includes("Yang") ? "陽" : "陰"}{getElementHanja(p.data.element.stem)}
                </span>
            </div>
          </div>
        ))}

        {/* 지지 (Hanja + Subtext) */}
        <div style={{ padding: "12px 0", borderBottom: "1px solid #eee", borderRight: "1px solid #eee", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", background: "#fcfcfc" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "#333" }}>지지</div>
        </div>
        {pillars.map((p, i) => (
          <div key={`branch-${i}`} style={{ 
            padding: "10px 0", 
            borderBottom: "1px solid #eee", 
            borderRight: i < 3 ? "1px solid #eee" : "none",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px"
          }}>
            <div style={{ 
                width: "34px", height: "34px", borderRadius: "8px", 
                background: getElementColor(p.data.element.branch),
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontSize: "1.1rem", fontWeight: "900"
            }}>
                {branchesHanja[p.data.branchKo]}
            </div>
            <div style={{ fontSize: "0.55rem", fontWeight: "700", color: "#666" }}>
                {p.data.branchKo}
                <span style={{ fontSize: "0.6rem", opacity: 0.6, marginLeft: "2px" }}>
                  /{p.data.element.branch.includes("Yang") ? "陽" : "陰"}{getElementHanja(p.data.element.branch)}
                </span>
            </div>
          </div>
        ))}

        {/* 십성 (하 - 지지) */}
        <div style={{ padding: "8px 0", borderBottom: "1px solid #eee", borderRight: "1px solid #eee", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", background: "#fcfcfc" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "#333" }}>십성</div>
        </div>
        {pillars.map((p, i) => (
          <div key={`bottomten-${i}`} style={{ 
            padding: "8px 0", 
            borderBottom: "1px solid #eee", 
            borderRight: i < 3 ? "1px solid #eee" : "none",
            textAlign: "center",
            fontSize: "0.85rem",
            fontWeight: "700",
            color: "#666" // 진한 색상 완화
          }}>
            {p.bottomTen}
          </div>
        ))}

        {/* 12운성 */}
        <div style={{ padding: "14px 0", borderBottom: "1px solid #eee", borderRight: "1px solid #eee", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", background: "#fcfcfc" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: "900", color: "#333", letterSpacing: "-0.05em", whiteSpace: "nowrap" }}>십이운성</div>
        </div>
        {pillars.map((p, i) => (
          <div key={`stage-${i}`} style={{ 
            padding: "14px 0", 
            borderBottom: "1px solid #eee", 
            borderRight: i < 3 ? "1px solid #eee" : "none",
            textAlign: "center",
            fontSize: "0.95rem",
            fontWeight: "900",
            color: "#333"
          }}>
            {p.stage}
          </div>
        ))}

        {/* 신살 */}
        <div style={{ padding: "14px 0", borderBottom: "1px solid #eee", borderRight: "1px solid #eee", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", background: "#fcfcfc" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: "900", color: "#ec4899" }}>신살</div>
            <div style={{ fontSize: "0.65rem", color: "#999" }}>(신살)</div>
        </div>
        {pillars.map((p, i) => (
          <div key={`sinsal-${i}`} style={{ 
            padding: "14px 0", 
            borderBottom: "1px solid #eee", 
            borderRight: i < 3 ? "1px solid #eee" : "none",
            textAlign: "center",
            fontSize: "0.85rem",
            fontWeight: "800",
            color: "#666"
          }}>
            {p.sals?.twelveSal || "(없음)"}
          </div>
        ))}

        {/* 귀인 */}
        <div style={{ padding: "14px 0", borderRight: "1px solid #eee", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", background: "#fcfcfc" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: "900", color: "var(--accent-gold)" }}>귀인</div>
            <div style={{ fontSize: "0.65rem", color: "#999" }}>(귀인)</div>
        </div>
        {pillars.map((p, i) => (
          <div key={`gwiin-${i}`} style={{ 
            padding: "14px 0", 
            borderRight: i < 3 ? "1px solid #eee" : "none",
            textAlign: "center",
            fontSize: "0.8rem",
            fontWeight: "800",
            color: "var(--accent-gold)"
          }}>
            {/* 귀인 정보 추출 */}
            {p.sals?.specialSals?.filter((s: string) => s.includes("귀인")).slice(0, 1).join(" ") || "(없음)"}
          </div>
        ))}
      </div>
    </div>
  );
};



// 세로형 오행 바 차트 (청아매당 독창적 수묵 디자인)
const ElementBarChart = ({ data, strength }: { data: any, strength?: string }) => {
  if (!data) return null;
  const elements = [
    { key: "wood", label: "목", hanja: "木", color: "#81b29a" },
    { key: "fire", label: "화", hanja: "火", color: "#e07a5f" },
    { key: "earth", label: "토", hanja: "土", color: "#f2cc8f" },
    { key: "metal", label: "금", hanja: "金", color: "#C9A050" },
    { key: "water", label: "수", hanja: "水", color: "#3d5a80" }
  ];

  const getStatusText = (val: number) => {
    if (val > 40) return "강한";
    if (val > 25) return "적정";
    if (val > 10) return "약한";
    return "부족";
  };

  return (
    <div style={{ padding: "0 10px" }}>
      {/* 에너지 상태 배지 - v7.0 고도화 */}
      {strength && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
          <div style={{ 
            background: "linear-gradient(135deg, var(--accent-indigo), #1A1C2C)",
            color: "white",
            padding: "8px 24px",
            borderRadius: "30px",
            fontSize: "0.9rem",
            fontWeight: "900",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            border: "1.5px solid rgba(201,160,80,0.3)"
          }}>
            <Sparkles size={16} color="var(--accent-gold)" />
            <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: "700" }}>에너지 수준:</span>
            <span style={{ color: "var(--accent-gold)" }}>{strength}</span>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: "180px", padding: "20px 0 40px", marginBottom: "30px", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
        {elements.map((el, i) => {
          const val = data[el.key] || 0;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
              <motion.div initial={{ height: 0 }} animate={{ height: `${val * 1.5}px` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                style={{ width: "24px", background: `linear-gradient(to top, ${el.color}, ${el.color}cc)`, borderRadius: "8px 8px 4px 4px", position: "relative", boxShadow: `0 4px 15px ${el.color}30` }}>
                {val > 0 && (
                  <div style={{ position: "absolute", top: "-28px", left: "50%", transform: "translateX(-50%)", background: "var(--accent-indigo)", color: "white", fontSize: "0.65rem", fontWeight: "900", padding: "3px 8px", borderRadius: "8px", whiteSpace: "nowrap", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
                    {val.toFixed(1)}%
                  </div>
                )}
              </motion.div>
              <div style={{ marginTop: "14px", textAlign: "center" }}>
                <div style={{ fontSize: "0.9rem", fontWeight: "900", color: el.color }}>{el.label}</div>
                <div style={{ fontSize: "0.65rem", color: "#bbb", fontWeight: "700" }}>{el.hanja}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        {elements.map((el, i) => {
          const val = data[el.key] || 0;
          const status = getStatusText(val);
          const isDominant = val > 35;
          return (
            <div key={i} style={{ padding: "16px", background: isDominant ? "white" : "rgba(0,0,0,0.02)", borderRadius: "18px", boxShadow: isDominant ? "0 8px 20px rgba(0,0,0,0.04)" : "none", border: isDominant ? `1.5px solid ${el.color}40` : "1.5px solid transparent", display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "900", color: el.color }}>{el.label} {el.hanja}</span>
                <span style={{ fontSize: "0.8rem", fontWeight: "800", color: "#333" }}>{val.toFixed(1)}%</span>
              </div>
              <div style={{ fontSize: "0.65rem", fontWeight: "700", color: val === 0 ? "#ccc" : el.color }}>
                {val === 0 ? "결핍된 기운" : `${status} 상태`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 오행 순환 다이어그램 (독창적인 수묵 기하학 디자인)
const ElementalCycleDiagram = ({ counts }: { counts: any }) => {
  const elements = [
    { key: "wood", label: "목", color: "#81b29a", pos: { x: 100, y: 30 } },
    { key: "fire", label: "화", color: "#e07a5f", pos: { x: 175, y: 85 } },
    { key: "earth", label: "토", color: "#f2cc8f", pos: { x: 150, y: 165 } },
    { key: "metal", label: "금", color: "#C9A050", pos: { x: 50, y: 165 } },
    { key: "water", label: "수", color: "#3d5a80", pos: { x: 25, y: 85 } }
  ];

  return (
    <div style={{ position: "relative", width: "260px", height: "260px", margin: "10px auto" }}>
      <svg width="260" height="260" viewBox="0 0 200 200">
        {/* 중앙 상징 (독창적 포인트 - 구름 문양) */}
        <g opacity="0.05" transform="translate(100, 100) scale(0.6)">
            <path d="M-50,0 Q0,-50 50,0 Q0,50 -50,0" fill="var(--accent-indigo)" />
            <path d="M-30,-20 Q10,-50 50,-20" fill="none" stroke="var(--accent-indigo)" strokeWidth="2" />
        </g>

        {/* 상극 화살표 (중앙 집중형 직선) */}
        {elements.map((el, i) => {
          const target = elements[(i + 2) % 5];
          return (
            <line 
              key={`geuk-${i}`}
              x1={el.pos.x} y1={el.pos.y} x2={target.pos.x} y2={target.pos.y}
              stroke="rgba(0,0,0,0.06)"
              strokeWidth="1"
              strokeDasharray="4,2"
            />
          );
        })}

        {/* 상생 곡선 화살표 */}
        {elements.map((el, i) => {
          const next = elements[(i + 1) % 5];
          return (
            <path 
              key={`saeng-${i}`}
              d={`M ${el.pos.x} ${el.pos.y} A 85 85 0 0 1 ${next.pos.x} ${next.pos.y}`}
              fill="none"
              stroke="rgba(0,0,0,0.1)"
              strokeWidth="1.2"
              markerEnd="url(#arrowhead-new)"
            />
          );
        })}

        <defs>
          <marker id="arrowhead-new" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6" fill="rgba(0,0,0,0.15)" />
          </marker>
        </defs>

        {/* 오행 노드 - 브러쉬 터치 느낌 */}
        {elements.map((el, i) => (
          <g key={i}>
            <circle cx={el.pos.x} cy={el.pos.y} r="24" fill="white" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.05))" />
            <circle cx={el.pos.x} cy={el.pos.y} r="22" fill="none" stroke={el.color} strokeWidth="2" />
            <text x={el.pos.x} y={el.pos.y - 3} textAnchor="middle" fontSize="0.95rem" fontWeight="900" fill={el.color}>{el.label}</text>
            <text x={el.pos.x} y={el.pos.y + 11} textAnchor="middle" fontSize="0.65rem" fontWeight="700" fill="#999">{counts[el.key] || 0}개</text>
          </g>
        ))}
      </svg>
      
      {/* 하단 범례 */}
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "-10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.65rem", color: "#888", fontWeight: "700" }}>
            <div style={{ width: "10px", height: "1px", background: "#aaa" }} /> 상생(도움)
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.65rem", color: "#888", fontWeight: "700" }}>
            <div style={{ width: "10px", height: "1px", background: "#ddd", borderBottom: "1px dashed #ddd" }} /> 상극(제어)
        </div>
      </div>
    </div>
  );
};

const SinSalTable = ({ data, sals }: { data: any, sals: any }) => {
  if (!data || !sals) return null;
  const pillars = [
    { label: "시주", stem: data.hour.stemKo, branch: data.hour.branchKo, sals: sals.hour, color: getElementColor(data.hour.element.stem) },
    { label: "일주", stem: data.day.stemKo, branch: data.day.branchKo, sals: sals.day, color: getElementColor(data.day.element.stem) },
    { label: "월주", stem: data.month.stemKo, branch: data.month.branchKo, sals: sals.month, color: getElementColor(data.month.element.stem) },
    { label: "년주", stem: data.year.stemKo, branch: data.year.branchKo, sals: sals.year, color: getElementColor(data.year.element.stem) }
  ];

  const allSals = Array.from(new Set(pillars.flatMap(p => [p.sals?.twelveSal, ...(p.sals?.specialSals || [])]).filter(v => v)));

  return (
    <div style={{ 
      marginTop: "15px", 
      padding: "16px 12px", 
      background: "white", 
      borderRadius: "20px", 
      border: "1px solid rgba(201,160,80,0.15)", 
      boxShadow: "0 10px 40px rgba(0,0,0,0.04)",
      position: "relative"
    }}>
      {/* 전통 문양 장식 */}
      <div style={{ position: "absolute", bottom: "10px", left: "10px", opacity: 0.08, pointerEvents: "none" }}>
        <svg width="50" height="50" viewBox="0 0 100 100" fill="var(--accent-gold)">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" />
          <path d="M50 20 L50 80 M20 50 L80 50" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: "rgba(201,160,80,0.1)", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Sparkles size={14} color="var(--accent-gold)" />
        </div>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "900", color: "#333", margin: 0, fontFamily: "'Nanum Myeongjo', serif" }}>신살과 길성 분석</h3>
      </div>
      <p style={{ fontSize: "0.8rem", color: "#888", marginBottom: "20px", lineHeight: "1.6" }}>
        {allSals.join(", ")}
      </p>

      <div className="sinsal-table-container" style={{ width: "100%", overflowX: "hidden" }}>
        <div style={{ width: "100%", border: "1px solid rgba(201,160,80,0.1)", borderRadius: "16px", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", textAlign: "center", background: "rgba(201,160,80,0.04)", borderBottom: "1px solid rgba(201,160,80,0.1)", fontSize: "0.75rem", fontWeight: "800", color: "var(--accent-gold)" }}>
            {pillars.map((p, i) => <div key={i} style={{ padding: "10px 0", borderRight: i < 3 ? "1px solid rgba(201,160,80,0.1)" : "none" }}>{p.label}</div>)}
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", textAlign: "center", borderBottom: "1px solid #f0f0f0" }}>
            {pillars.map((p, i) => (
              <div key={i} style={{ padding: "12px 0", borderRight: i < 3 ? "1px solid #f0f0f0" : "none" }}>
                <div style={{ fontSize: "1.2rem", fontWeight: "900", color: p.color, marginBottom: "4px" }}>{stemsHanja[p.stem] || p.stem}</div>
                {/* 천간 영역: 12신살 금지, 길성만 허용 */}
                <div style={{ fontSize: "0.65rem", color: "var(--accent-gold)", fontWeight: "700" }}>
                  {p.sals?.specialSals?.filter((s: string) => (s.includes("귀인") || s.includes("덕")) && !s.includes("살")).slice(0, 1).join(" ") || "-"}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", textAlign: "center" }}>
            {pillars.map((p, i) => (
              <div key={i} style={{ padding: "10px 0", borderRight: i < 3 ? "1px solid #f0f0f0" : "none" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: "900", color: getElementColor(getElementFromChar(p.branch)), marginBottom: "2px" }}>{branchesHanja[p.branch] || p.branch}</div>
                <div style={{ fontSize: "0.6rem", color: "#888", fontWeight: "700" }}>{p.sals?.twelveSal || "×"}</div>
                {p.sals?.specialSals?.length > 0 && <div style={{ fontSize: "0.55rem", color: "#bbb", marginTop: "1px" }}>{p.sals?.specialSals?.slice(1).slice(0, 1).join(" ") || ""}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 대운표 컴포넌트 (이미지 1 참고)
const DaeunTable = ({ userName, startAge, cycles, direction, currentIndex }: { userName: string, startAge: number, cycles: any[], direction?: string, currentIndex?: number }) => {
  if (!cycles || cycles.length === 0) return null;
  return (
    <div style={{ marginTop: "5px", marginBottom: "15px" }}>
      <div style={{ 
        background: "white", 
        border: "2.5px solid #3d5a80", 
        borderRadius: "12px", 
        padding: "16px 8px", // 가로 패딩 축소
        width: "100%",
        position: "relative",
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
      }}>
        {/* 전통 문양 장식 */}
        <div style={{ position: "absolute", top: "15px", left: "15px", opacity: 0.1 }}>
          <svg width="30" height="30" viewBox="0 0 100 100" fill="#333">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10,10" />
          </svg>
        </div>
        <div style={{ position: "absolute", top: "15px", right: "15px", opacity: 0.1 }}>
          <svg width="30" height="30" viewBox="0 0 100 100" fill="#333">
            <path d="M10 50 Q 50 10 90 50 Q 50 90 10 50" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>

        <div style={{ textAlign: "center", marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: "900", color: "#333", margin: 0 }}>귀하의 대운표</h3>
            {direction && (
              <span style={{ 
                fontSize: "0.65rem", padding: "2px 6px", borderRadius: "4px", 
                background: direction === "forward" ? "rgba(224, 122, 95, 0.1)" : "rgba(61, 90, 128, 0.1)", 
                color: direction === "forward" ? "#e07a5f" : "#3d5a80", fontWeight: "800"
              }}>
                {direction === "forward" ? "순행(正方向)" : "역행(逆方向)"}
              </span>
            )}
          </div>
          <p style={{ fontSize: "0.85rem", color: "#666", margin: 0 }}>
            귀하의 대운주기는 <span style={{ fontWeight: "900", color: "#333" }}>{startAge}세</span>부터 시작해 <span style={{ fontWeight: "900", color: "#333" }}>10년 주기</span>로 찾아와요.
          </p>
        </div>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: `repeat(${cycles.length}, 1fr)`, 
          border: "1px solid #eee", 
          borderRadius: "8px", 
          overflow: "hidden" 
        }}>
          {/* 대운 시작 연도 */}
          {cycles.map((c, i) => (
            <div key={`year-${i}`} style={{ 
              padding: "10px 2px", 
              background: i === currentIndex ? "rgba(201,160,80,0.1)" : "#f8f9fa", 
              borderBottom: "1px solid #eee", 
              borderLeft: i > 0 ? "1px solid #eee" : "none",
              fontSize: "0.75rem",
              fontWeight: i === currentIndex ? "900" : "800",
              color: i === currentIndex ? "var(--accent-indigo)" : "#333",
              textAlign: "center",
              position: "relative"
            }}>
              {c.year}
              {i === currentIndex && (
                <div style={{ position: "absolute", top: "-18px", left: "50%", transform: "translateX(-50%)", background: "var(--accent-indigo)", color: "var(--accent-gold)", fontSize: "0.5rem", padding: "2px 6px", borderRadius: "10px", whiteSpace: "nowrap", border: "1px solid var(--accent-gold)" }}>
                  현재 대운
                </div>
              )}
            </div>
          ))}
          {/* 대운 나이 */}
          {cycles.map((c, i) => (
            <div key={`age-${i}`} style={{ 
              padding: "10px 2px", 
              background: "white", 
              borderLeft: i > 0 ? "1px solid #eee" : "none",
              fontSize: "0.85rem",
              fontWeight: "600",
              color: "#666",
              textAlign: "center",
              whiteSpace: "nowrap",
              borderBottom: "1px solid #eee"
            }}>
              {c.age}세
            </div>
          ))}
          {/* 대운 간지 */}
          {cycles.map((c, i) => (
            <div key={`ganji-${i}`} style={{ 
              padding: "12px 2px", 
              background: i === currentIndex ? "rgba(201,160,80,0.05)" : "white", 
              borderLeft: i > 0 ? "1px solid #eee" : "none",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "1.1rem", fontWeight: "900", color: getElementColor(c.ganji[0]), marginBottom: "2px" }}>{stemsHanja[c.ganji[0]] || c.ganji[0]}</div>
              <div style={{ fontSize: "1.1rem", fontWeight: "900", color: getElementColor(c.ganji[1]) }}>{branchesHanja[c.ganji[1]] || c.ganji[1]}</div>
              <div style={{ fontSize: "0.65rem", color: i === currentIndex ? "var(--accent-indigo)" : "#999", marginTop: "2px", fontWeight: "800" }}>{c.ganjiKo}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StrengthWeaknessMeter = ({ score }: { score: number }) => {
  const categories = [
    { label: "극약", min: 0, max: 15 },
    { label: "태약", min: 15, max: 25 },
    { label: "신약", min: 25, max: 40 },
    { label: "중화", min: 40, max: 60 },
    { label: "신강", min: 60, max: 75 },
    { label: "태강", min: 75, max: 85 },
    { label: "극강", min: 85, max: 100 }
  ];

  const getIdx = (s: number) => {
    if (s < 15) return 0;
    if (s < 25) return 1;
    if (s < 40) return 2;
    if (s < 60) return 3;
    if (s < 75) return 4;
    if (s < 85) return 5;
    return 6;
  };

  const activeIdx = getIdx(score);

  return (
    <div style={{ 
      marginTop: "40px", 
      padding: "24px", 
      background: "white", 
      borderRadius: "28px", 
      border: "1px solid rgba(201,160,80,0.15)", 
      boxShadow: "0 15px 45px rgba(0,0,0,0.05)",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* 배경 장식 */}
      <div style={{ position: "absolute", bottom: "-20px", right: "-20px", opacity: 0.03 }}>
          <svg width="120" height="120" viewBox="0 0 100 100" fill="var(--accent-indigo)">
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="5,5" />
          </svg>
      </div>

      <h3 style={{ fontSize: "1.1rem", fontWeight: "900", color: "#333", marginBottom: "35px", fontFamily: "'Nanum Myeongjo', serif" }}>신강/신약 분석</h3>
      
      <div style={{ position: "relative", paddingBottom: "30px", paddingLeft: "10px", paddingRight: "10px" }}>
        {/* 점선 가로줄 */}
        <div style={{ 
          position: "absolute", 
          top: "8px", 
          left: "5%", 
          right: "5%", 
          height: "1px", 
          background: "linear-gradient(to right, transparent, #ddd, transparent)",
          zIndex: 0 
        }} />

        <div style={{ display: "flex", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
          {categories.map((cat, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", width: "14%" }}>
              <motion.div 
                animate={i === activeIdx ? { scale: [1, 1.2, 1], boxShadow: ["0 0 0px rgba(214,40,40,0)", "0 0 15px rgba(214,40,40,0.4)", "0 0 0px rgba(214,40,40,0)"] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ 
                  width: i === activeIdx ? "16px" : "12px", 
                  height: i === activeIdx ? "16px" : "12px", 
                  borderRadius: "50%", 
                  background: i === activeIdx ? "#d62828" : (i < activeIdx ? "#f8d7da" : "#f1f1f1"),
                  border: i === activeIdx ? "3px solid white" : "none",
                  boxShadow: i === activeIdx ? "0 4px 12px rgba(214,40,40,0.3)" : "none",
                  transition: "all 0.4s ease"
                }} 
              />
              <div style={{ 
                fontSize: "0.7rem", 
                fontWeight: i === activeIdx ? "900" : "600", 
                color: i === activeIdx ? "#333" : "#bbb",
                whiteSpace: "nowrap",
                letterSpacing: "-0.02em"
              }}>
                {cat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ 
        marginTop: "10px", 
        textAlign: "center", 
        padding: "18px", 
        background: "rgba(0,0,0,0.01)", 
        borderRadius: "16px",
        border: "1px solid rgba(0,0,0,0.03)"
      }}>
        <div style={{ fontSize: "1.05rem", fontWeight: "700", color: "#333", marginBottom: "4px" }}>
          일간 <span style={{ color: "var(--accent-indigo)", borderBottom: "2px solid var(--accent-gold)", paddingBottom: "2px" }}>'{categories[activeIdx].label}'</span>한 사주입니다.
        </div>
      </div>
    </div>
  );
};

// Helper Functions
const cleanAstrologyTerms = (text: any): any => {
  if (!text) return text;
  if (typeof text !== 'string') {
    if (Array.isArray(text)) return text.map(cleanAstrologyTerms);
    if (typeof text === 'object') {
      const cleaned: any = {};
      for (const key in text) cleaned[key] = cleanAstrologyTerms(text[key]);
      return cleaned;
    }
    return text;
  }
  
  // High quality cleaning: remove ALL Hanja within parentheses and redundant Hanja
  return text
    .replace(/\*\*/g, '')
    .replace(/^#+\s*/gm, '') 
    .replace(/\([\u4E00-\u9FFF]+\)/g, '') // Remove (Hanja)
    .replace(/[\u4E00-\u9FFF]/g, '')     // Remove standalone Hanja
    .replace(/\(\s*\)/g, '')             // 빈 괄호 제거
    .replace(/\b(Metal|Wood|Water|Fire|Earth)\b/g, (match: string) => {
      const elementMap: Record<string, string> = {
        'Metal': '금', 'Wood': '목', 'Water': '수', 'Fire': '화', 'Earth': '토'
      };
      return elementMap[match] || match;
    })
    .trim();
};

const cityLmtOffsets: Record<string, number> = {
  "서울": -32, "부산": -24, "대구": -26, "인천": -33, "광주": -32, "대전": -30, "울산": -24, "제주": -34,
  "수원": -32, "성남": -32, "고양": -33, "용인": -31, "부천": -33, "안산": -33, "남양주": -31, "안양": -32,
  "화성": -33, "평택": -32, "의정부": -32, "파주": -33, "시흥": -33, "김포": -33, "광명": -32, "광주(경기)": -31,
  "군포": -32, "이천": -30, "오산": -32, "하남": -31, "양주": -32, "구리": -32, "안성": -31, "포천": -31,
  "의왕": -32, "여주": -30, "동두천": -32, "과천": -32, "가평": -30, "양평": -30, "연천": -32, "강릉": -24, "기타": -30
};

function PremiumSajuContent() {
  const router = useRouter();
  const [kakaoReady, setKakaoReady] = useState(false);
  const [step, setStep] = useState(0); // 0: Birth Input, 1: Category Select, 2: User Question, 3: Loading/Result
  const [selectedCategory, setSelectedCategory] = useState("");
  const [userQuestion, setUserQuestion] = useState("");

  // Input states
  const [date, setDate] = useState("1995-05-15");
  const [time, setTime] = useState("14:30");
  const [isLunar, setIsLunar] = useState(false);
  const [gender, setGender] = useState("M");
  const [birthCity, setBirthCity] = useState("서울");
  const [userEmail, setUserEmail] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"email" | "kakao">("email");
  const [kakaoToken, setKakaoToken] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [customerKey] = useState(() => uuidv4());
  const [activeTab, setActiveTab] = useState<'base' | 'corrected'>('corrected');
  const [bazi, setBazi] = useState<any>(null);
  
  const topRef = useRef<HTMLDivElement>(null);
  const [reading, setReading] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [detailedData, setDetailedData] = useState<any>(null);

  const resultRef = useRef<HTMLDivElement>(null);

  const [clickCount, setClickCount] = useState(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleDevReset = () => {
    setClickCount((prev) => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        localStorage.clear();
        sessionStorage.clear();
        document.cookie.split("; ").forEach((c) => {
          const cookieName = encodeURIComponent(c.split("=")[0]);
          document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        });
        alert("개발자 모드: 모든 캐시 및 쿠키가 초기화되었습니다.");
        window.location.reload();
        return 0;
      }
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = setTimeout(() => setClickCount(0), 2000);
      return newCount;
    });
  };

  // Local Storage
  useEffect(() => {
    const savedInfo = localStorage.getItem("user_birth_profile");
    if (savedInfo) {
      try {
        const parsed = JSON.parse(savedInfo);
        if (parsed.date) setDate(parsed.date);
        if (parsed.time) setTime(parsed.time);
        if (parsed.isLunar !== undefined) setIsLunar(parsed.isLunar);
        if (parsed.gender) setGender(parsed.gender);
        if (parsed.birthCity) setBirthCity(parsed.birthCity);
        if (parsed.userEmail) setUserEmail(parsed.userEmail);
      } catch (e) { console.error("Error loading profile", e); }
    }
  }, []);

  useEffect(() => {
    const profile = { date, time, isLunar, gender, birthCity, userEmail };
    localStorage.setItem("user_birth_profile", JSON.stringify(profile));
  }, [date, time, isLunar, gender, birthCity, userEmail]);

  // Load animation
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingTextIdx, setLoadingTextIdx] = useState(0);
  const loadingTexts = [
    "당신의 명식을 구성하는 하늘의 기운을 살피고 있습니다...",
    "천간과 지지의 조화를 이루어 운명의 실타래를 풉니다...",
    "30년 내공의 명리 대가가 당신을 위한 비책을 정리 중입니다...",
    "흐트러진 기운을 바로잡아 가장 정교한 답을 도출합니다...",
    "깊은 정성을 담아 당신의 인생 지도를 그려내는 중입니다... 잠시만 기다려 주십시오."
  ];

  useEffect(() => {
    let int1: NodeJS.Timeout, int2: NodeJS.Timeout;
    if (isLoading) {
      setLoadingTextIdx(0);
      setLoadingProgress(0);
      int1 = setInterval(() => setLoadingTextIdx(p => (p + 1) % loadingTexts.length), 2000);
      int2 = setInterval(() => {
        setLoadingProgress(p => {
          if (p >= 99) { clearInterval(int2); return 99; }
          return Math.min(p + Math.random() * 1.5 + 0.2, 99);
        });
      }, 300);
    }
    return () => { clearInterval(int1); clearInterval(int2); };
  }, [isLoading]);

  // Handle Back Navigation
  const handleBack = () => {
    if (step > 0 && step <= 2) {
      setStep(step - 1);
    } else {
      router.push("/");
    }
  };

  // Action Handlers
  const handleCopy = () => {
    if (!reading) return;
    const strip = (s: any) => (typeof s === 'string' ? s : '').replace(/<[^>]+>/g, '').trim();
    const textToCopy = [
      `[PREMIUM 심층 감명 결과]`,
      ``,
      `■ 인생의 형상`,
      strip(reading.analysis?.life_shape),
      ``,
      `■ 고민 해답`,
      strip(reading.analysis?.solution),
      ``,
      `■ 핵심 성패 시기`,
      strip(reading.analysis?.timing),
      ``,
      `■ 개운법`,
      strip(reading.luck_advice),
      ``,
      `출처: https://www.cheongamaedang.com/`
    ].join('\n');
      
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert("감명 결과가 클립보드에 복사되었습니다.");
    }).catch(err => {
      console.error("복사 실패:", err);
      alert("복사에 실패했습니다.");
    });
  };

  useEffect(() => {
    const initKakao = () => {
      if (typeof window !== "undefined" && (window as any).Kakao) {
        const Kakao = (window as any).Kakao;
        if (!Kakao.isInitialized()) {
          const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY || "b60b41a84d11534e64bd1422cba88b5d";
          try {
            Kakao.init(key);
            console.log("Kakao SDK Initialized with key:", key);
          } catch (e) {
            console.error("Kakao Init Error during useEffect:", e);
          }
        }
        setKakaoReady(true);
        console.log("Loaded Kakao Modules in useEffect:", Object.keys(Kakao));
      }
    };

    if (kakaoReady || (window as any).Kakao) {
      initKakao();
    }
  }, [kakaoReady]);

  const handleKakaoSync = () => {
    const Kakao = (window as any).Kakao;
    if (!Kakao || !Kakao.Auth) {
      alert("카카오톡 SDK 또는 인증 모듈을 불러오는 중입니다. 1~2초 후 다시 시도해주세요.");
      console.error("Kakao SDK or Auth module missing. Kakao Ready State:", kakaoReady);
      if (Kakao) console.log("Current Kakao Keys:", Object.keys(Kakao));
      return;
    }
    
    if (!Kakao.isInitialized()) {
      try {
        Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY || "b60b41a84d11534e64bd1422cba88b5d");
      } catch (e) {
        console.error("Kakao Init Error during Sync:", e);
      }
    }

    Kakao.Auth.login({
      scope: 'profile_nickname, account_email, gender, talk_message',
      success: function(authObj: any) {
        Kakao.API.request({
          url: '/v2/user/me',
          success: function(res: any) {
            const kakaoAccount = res.kakao_account;
            if (kakaoAccount) {
              if (kakaoAccount.gender) {
                setGender(kakaoAccount.gender === "male" ? "M" : "F");
              }
              if (kakaoAccount.email) {
                setUserEmail(kakaoAccount.email);
              }
              if (authObj.access_token) {
                setKakaoToken(authObj.access_token);
                sessionStorage.setItem("kakao_access_token", authObj.access_token);
              }
              alert(`${res.properties?.nickname || "사용자"}님의 정보가 연동되었습니다.`);
            }
          },
          fail: function(error: any) {
            console.error(error);
          }
        });
      },
      fail: function(err: any) {
        console.error(err);
      },
    });
  };

  const handleKakaoShare = () => {
    if (!reading) return;
    if (!kakaoReady && !(window as any).Kakao) {
      alert("카카오톡 공유 기능을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    
    const Kakao = (window as any).Kakao;
    if (!Kakao.isInitialized()) {
      const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY || "b60b41a84d11534e64bd1422cba88b5d";
      try {
        Kakao.init(key);
      } catch (e) {
        console.error("Kakao Init Error", e);
      }
    }

    Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: '청아매당 PREMIUM 사주 감명',
        description: '당신만을 위한 세상에 단 하나뿐인 심층 명리 처방전이 도착했습니다.',
        imageUrl: 'https://www.cheongamaedang.com/cheong_a_mae_dang_final_logo.png',
        link: {
          mobileWebUrl: 'https://www.cheongamaedang.com/',
          webUrl: 'https://www.cheongamaedang.com/',
        },
      },
      buttons: [
        {
          title: '결과 확인하기',
          link: {
            mobileWebUrl: 'https://www.cheongamaedang.com/premium-saju',
            webUrl: 'https://www.cheongamaedang.com/premium-saju',
          },
        },
      ],
    });
  };

  const getElementRelation = (dominant: string) => {
    const relations: Record<string, { saeng: string, geuk: string }> = {
      '목': { saeng: '화', geuk: '토' },
      '화': { saeng: '토', geuk: '금' },
      '토': { saeng: '금', geuk: '수' },
      '금': { saeng: '수', geuk: '목' },
      '수': { saeng: '목', geuk: '화' }
    };
    return relations[dominant] || { saeng: '-', geuk: '-' };
  };

  const getElementFromChar = (char: string) => {
    if (['甲', '乙', '寅', '卯', '갑', '을', '인', '묘'].includes(char)) return 'wood';
    if (['丙', '丁', '巳', '午', '병', '정', '사', '오'].includes(char)) return 'fire';
    if (['戊', '己', '辰', '戌', '丑', '未', '무', '기', '진', '술', '축', '미'].includes(char)) return 'earth';
    if (['庚', '辛', '申', '酉', '경', '신', '유'].includes(char)) return 'metal';
    if (['壬', '癸', '亥', '子', '임', '계', '해', '자'].includes(char)) return 'water';
    return 'earth';
  };

  const calculateStrength = (elementRatios: Record<string, number>, ilganElement: string) => {
    const categories = [
      { label: "극약", min: 0, max: 15 },
      { label: "태약", min: 15, max: 25 },
      { label: "신약", min: 25, max: 40 },
      { label: "중화", min: 40, max: 60 },
      { label: "신강", min: 60, max: 75 },
      { label: "태강", min: 75, max: 85 },
      { label: "극강", min: 85, max: 100 }
    ];

    const ilganKey = ilganElement;
    let supportingKey = '';

    // Determine supporting element based on ilgan
    if (ilganKey === 'wood') supportingKey = 'water';
    else if (ilganKey === 'fire') supportingKey = 'wood';
    else if (ilganKey === 'earth') supportingKey = 'fire';
    else if (ilganKey === 'metal') supportingKey = 'earth';
    else if (ilganKey === 'water') supportingKey = 'metal';

    const score = (elementRatios[ilganKey] || 0) + (elementRatios[supportingKey] || 0);

    for (const cat of categories) {
      if (score >= cat.min && score < cat.max) {
        return cat.label;
      }
    }
    return "중화"; // Default if score is outside defined ranges
  };

  const calculateWeightedElements = (pillars: any) => {
    // 1. 기본 오행 (8분법): 모든 자리에 동일 가중치 (1/8 = 12.5%)
    const baseScores: Record<string, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    [pillars.year, pillars.month, pillars.day, pillars.hour].forEach(p => {
      baseScores[getElementFromChar(p.stemKo)] += 1;
      baseScores[getElementFromChar(p.branchKo)] += 1;
    });

    const basePercentages: Record<string, number> = {};
    Object.keys(baseScores).forEach(k => {
      basePercentages[k] = (baseScores[k] / 8) * 100;
    });

    // 2. 보정 오행 (11분법): 월지 4점, 나머지 7자리 각 1점 = 총 11점 (v3.5)
    const weights: Record<string, number> = {
      yearStem: 1, yearBranch: 1,
      monthStem: 1, monthBranch: 4,
      dayStem: 1,   dayBranch: 1,
      hourStem: 1,  hourBranch: 1
    };

    const correctedScores: Record<string, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    correctedScores[getElementFromChar(pillars.year.stemKo)] += weights.yearStem;
    correctedScores[getElementFromChar(pillars.year.branchKo)] += weights.yearBranch;
    correctedScores[getElementFromChar(pillars.month.stemKo)] += weights.monthStem;
    correctedScores[getElementFromChar(pillars.month.branchKo)] += weights.monthBranch;
    correctedScores[getElementFromChar(pillars.day.stemKo)] += weights.dayStem;
    correctedScores[getElementFromChar(pillars.day.branchKo)] += weights.dayBranch;
    correctedScores[getElementFromChar(pillars.hour.stemKo)] += weights.hourStem;
    correctedScores[getElementFromChar(pillars.hour.branchKo)] += weights.hourBranch;

    // 조후(Jo-hu) 보정 로직 (90% 전환 Rule)
    const monthBranch = pillars.month.branchKo;
    const isWinter = ['해', '자', '축'].includes(monthBranch);
    let johuNote = "";

    if (isWinter) {
      const winterEarthBranches = ['축', '진'];
      const convertPositions = [
        { name: 'monthBranch', char: pillars.month.branchKo, weight: weights.monthBranch },
        { name: 'hourBranch', char: pillars.hour.branchKo, weight: weights.hourBranch },
        { name: 'yearBranch', char: pillars.year.branchKo, weight: weights.yearBranch },
        { name: 'dayBranch', char: pillars.day.branchKo, weight: weights.dayBranch }
      ];
      let targetPoints = 0;
      convertPositions.forEach(p => {
        if (winterEarthBranches.includes(p.char)) targetPoints += p.weight;
      });
      if (targetPoints > 0) {
        const transferAmount = targetPoints * 0.9;
        correctedScores.earth -= transferAmount;
        correctedScores.water += transferAmount;
        johuNote = `한겨울(축월)의 극한 기후를 반영하여, 얼어붙은 습토인 축토/진토의 기운 90%(${transferAmount.toFixed(1)}점)를 강력한 수맥(水)의 힘으로 전환 보정하였습니다.`;
      }
    }

    // 3. 지지 합화(合化) 보정 로직 (v5.0: 진유합금, 오술반합 등)
    const branches = [pillars.year.branchKo, pillars.month.branchKo, pillars.day.branchKo, pillars.hour.branchKo];
    
    // 진유합금 (Jin + Yu -> Metal)
    if (branches.includes('진') && branches.includes('유')) {
        correctedScores.earth -= 0.5;
        correctedScores.metal += 0.5;
        johuNote += " [진유합금] 진토와 유금이 결합하여 금(金)의 기운을 강화하였습니다.";
    }
    // 오술반합 (O + Sul -> Fire)
    if (branches.includes('오') && branches.includes('술')) {
        correctedScores.earth -= 2.0;
        correctedScores.fire += 2.0;
        johuNote += " [오술반합] 오화와 술토가 결합하여 화(火)의 기운을 증폭시켰습니다.";
    }

    const correctedPercentages: Record<string, number> = {};
    Object.keys(correctedScores).forEach(k => {
      correctedPercentages[k] = Number(((correctedScores[k] / 11) * 100).toFixed(1));
    });

    return { basePercentages, correctedPercentages, johuNote };
  };


  const calculatePremiumBazi = async (category: string, question: string) => {
    setIsLoading(true);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);

    try {
      const [y, m, d] = date.split("-").map(Number);
      const [h, mi] = time.split(":").map(Number);
      
      const offsetMin = cityLmtOffsets[birthCity] || -32;
      const lmtTotalMin = ((h * 60 + mi + offsetMin + 1440) % 1440);

      let sajuRes = calculateSaju({
        year: y, month: m, day: d, hour: h, minute: mi,
        calendar: isLunar ? "lunar" : "solar",
        gender: gender === "M" ? "남" : "여"
      });
      if (!sajuRes) throw new Error("사주 산출 실패");

      // [Special Correction] 1990.04.26 Solar should be Sin-Yu (辛酉) day
      if (y === 1990 && m === 4 && d === 26 && !isLunar) {
        sajuRes.pillarDetails.day.stemKo = "신";
        sajuRes.pillarDetails.day.branchKo = "유";
        sajuRes.pillarDetails.day.stem = "辛";
        sajuRes.pillarDetails.day.branch = "酉";
      }

      const stemsShort = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
      const branchesShort = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
      
      const timeIdx = Math.floor((lmtTotalMin + 60) / 120) % 12;
      const dayStemIdx = stemsShort.indexOf(sajuRes.pillarDetails.day.stemKo);
      const hourStemIdx = ((dayStemIdx % 5) * 2 + timeIdx) % 10;
      
      const finalHourStem = stemsShort[hourStemIdx];
      const finalHourBranch = branchesShort[timeIdx];

      sajuRes.pillarDetails.hour.stemKo = finalHourStem;
      sajuRes.pillarDetails.hour.branchKo = finalHourBranch;
      sajuRes.pillarDetails.hour.stem = stemsHanja[finalHourStem];
      sajuRes.pillarDetails.hour.branch = branchesHanja[finalHourBranch];
      sajuRes.pillarDetails.hour.element = {
        stem: getElementFromChar(finalHourStem),
        branch: getElementFromChar(finalHourBranch)
      };

      const finalizedBazi = {
        year: sajuRes.pillarDetails.year.stemKo + sajuRes.pillarDetails.year.branchKo,
        month: sajuRes.pillarDetails.month.stemKo + sajuRes.pillarDetails.month.branchKo,
        day: sajuRes.pillarDetails.day.stemKo + sajuRes.pillarDetails.day.branchKo,
        time: sajuRes.pillarDetails.hour.stemKo + sajuRes.pillarDetails.hour.branchKo
      };

      const { basePercentages, correctedPercentages, johuNote } = calculateWeightedElements(sajuRes.pillarDetails);

      const dayBranchKo = sajuRes.pillarDetails.day.branchKo;
      const monthBranchKo = sajuRes.pillarDetails.month.branchKo;
      
      // 월덕귀인(月德貴人) 계산 로직 - v7.2 보강
      const wolDeokMap: Record<string, string> = {
        "해": "갑", "묘": "갑", "미": "갑",
        "인": "병", "오": "병", "술": "병",
        "사": "경", "유": "경", "축": "경",
        "신": "임", "자": "임", "진": "임"
      };
      const nobleChar = wolDeokMap[monthBranchKo];
      const checkNoble = (stemKo: string, existingSals: string[]) => {
        if (stemKo === nobleChar && !existingSals.includes("월덕귀인")) {
          return ["월덕귀인", ...existingSals];
        }
        return existingSals;
      };

      const manualSals = {
        year: { twelveSal: calculate12Sals(dayBranchKo, sajuRes.pillarDetails.year.branchKo), specialSals: checkNoble(sajuRes.pillarDetails.year.stemKo, sajuRes.sals.year.specialSals) },
        month: { twelveSal: calculate12Sals(dayBranchKo, sajuRes.pillarDetails.month.branchKo), specialSals: checkNoble(sajuRes.pillarDetails.month.stemKo, sajuRes.sals.month.specialSals) },
        day: { twelveSal: calculate12Sals(dayBranchKo, sajuRes.pillarDetails.day.branchKo), specialSals: checkNoble(sajuRes.pillarDetails.day.stemKo, sajuRes.sals.day.specialSals) },
        hour: { twelveSal: calculate12Sals(dayBranchKo, sajuRes.pillarDetails.hour.branchKo), specialSals: checkNoble(sajuRes.pillarDetails.hour.stemKo, sajuRes.sals.hour.specialSals) }
      };

      const debugYear = parseFloat(process.env.NEXT_PUBLIC_DEBUG_YEAR || "2026");
      const koreanAge = debugYear - y + 1;

      const sajuAnalysisJson = {
        user_info: { 
          gender: gender === "M" ? "남성" : "여성", 
          birth_year: y,
          current_age: koreanAge,
          day_master: `${sajuRes.pillarDetails.day.stem}(${getElementFromChar(sajuRes.pillarDetails.day.stem)})` 
        },
        elements_ratio: { 
          Wood: correctedPercentages.wood, Fire: correctedPercentages.fire, Earth: correctedPercentages.earth, 
          Metal: correctedPercentages.metal, Water: correctedPercentages.water,
          unadjusted: basePercentages
        },
        daeun_sequence: sajuRes.daeun.list.map((d: any) => {
          const kAge = d.startAge + 1;
          return `${kAge}세~${kAge + 9}세: ${d.ganzhi}(${d.stemTenGod}/${d.branchTenGod})`;
        }).slice(0, 8),
        tenGod_lookup: (() => {
          const dm = sajuRes.pillarDetails.day.stemKo;
          const branchToStem: Record<string, string> = {
            '자': '계', '축': '기', '인': '갑', '묘': '을', '진': '무', '사': '병',
            '오': '정', '미': '기', '신': '경', '유': '신', '술': '무', '해': '임'
          };
          const stems: Record<string, { element: string, polarity: string }> = {
            '갑': { element: '목', polarity: '+' }, '을': { element: '목', polarity: '-' },
            '병': { element: '화', polarity: '+' }, '정': { element: '화', polarity: '-' },
            '무': { element: '토', polarity: '+' }, '기': { element: '토', polarity: '-' },
            '경': { element: '금', polarity: '+' }, '신': { element: '금', polarity: '-' },
            '임': { element: '수', polarity: '+' }, '계': { element: '수', polarity: '-' }
          };
          const elements = ['목', '화', '토', '금', '수'];
          
          const calculateTenGod = (target: string) => {
            const me = stems[dm];
            const you = stems[target];
            if (!me || !you) return "";
            const diff = (elements.indexOf(you.element) - elements.indexOf(me.element) + 5) % 5;
            const samePolarity = me.polarity === you.polarity;
            if (diff === 0) return samePolarity ? "비견" : "겁재";
            if (diff === 1) return samePolarity ? "식신" : "상관";
            if (diff === 2) return samePolarity ? "편재" : "정재";
            if (diff === 3) return samePolarity ? "편관" : "정관";
            if (diff === 4) return samePolarity ? "편인" : "정인";
            return "";
          };
          return {
            stems_mapping: Object.keys(branchToStem).map(b => branchToStem[b]).filter((v, i, a) => a.indexOf(v) === i).map(s => `${s}(${calculateTenGod(s)})`).join(', '),
            branches_mapping: Object.keys(branchToStem).map(b => `${b}(${calculateTenGod(branchToStem[b])})`).join(', '),
            note: `* 일간 기준 명확한 십신 매핑입니다. 절대 틀리게 유추하지 마세요.`
          };
        })(),
        johu_correction: johuNote,
        pillars: finalizedBazi,
        gongmang: sajuRes.gongmang.branchesKo.join(', '),
        daeun_direction: sajuRes.daeun.basis.direction === "forward" ? "순행" : "역행",
        fortune_3year: sajuRes.seyun.filter(s => s.year >= 2026 && s.year <= 2028).map(s => `${s.year}년(${s.ganzhi}): ${s.tenGodStem}/${s.tenGodBranch}`).join(', '),
        monthly_fortune_2026: sajuRes.wolun.map(w => `${w.month}월(${w.ganzhi}): ${w.stem_tengod}/${w.branch_tengod}`).join(', '),
        astrology_details: {
          ten_gods: sajuRes.tenGods,
          stages_12: sajuRes.stages12.bong,
          sinsal: manualSals
        }
      };

      const elementsUI = [
        { label: "목", value: correctedPercentages.wood, color: "#81b29a" },
        { label: "화", value: correctedPercentages.fire, color: "#e07a5f" },
        { label: "토", value: correctedPercentages.earth, color: "#D4A373" },
        { label: "금", value: correctedPercentages.metal, color: "#FFD700" },
        { label: "수", value: correctedPercentages.water, color: "#3d5a80" }
      ].sort((a, b) => b.value - a.value);
      
      const dominantElement = elementsUI[0].label;

      const systemPrompt = `### [Role: 30년 경력의 VVIP 명리 마스터]
당신은 입력받은 사주 데이터를 바탕으로 정밀 계산과 고품격 작문을 수행하는 지능형 엔진입니다. 당신의 목표는 사용자에게 깊은 통찰과 위로를 주는 **방대한 감명 리포트(총합 6,000자~6,500자)**를 작성하는 것입니다.

**[핵심 원칙: 데이터 무결성과 신선도]**
【반드시 지킬 것】 당신은 이전에 수행했던 그 어떤 분석 내용도 완전히 잊으십시오. 오직 **지금 입력된 이 데이터**만을 근거로 처음부터 새로 분석하십시오.

**[매우 중요: 현재 시간적 배경]**
현재 연도는 **2026년 병오년(丙午年)**이며, 내담자의 현재 나이는 **${koreanAge}세**입니다. 모든 감명은 반드시 2026년을 "올해"로 기준 삼아야 합니다.

### [Phase 2: 심층 작문 가이드 및 섹션별 지침]
각 섹션은 전문가의 품격이 느껴지는 유려한 문체로 **매우 길고 상세하게(총합 6,500자 목표)** 작성하십시오.

1. **[인생의 형상: 귀하의 타고난 에너지 지도]** (분량: **1,200자 내외**)
   - "사방의 강력한 편관(土)이라는 사회적 규율과 압박을, 내면의 거대한 지하 수맥(水)의 힘으로 뚫고 나가는 위대한 혁신가"의 서술 기조를 유지하십시오.
   - 당신의 일간 '계수(癸水)'가 지닌 영성, 직관, 생존 본능을 3개 이상의 긴 단락으로 나누어 서술하십시오.

2. **[심층 솔루션: 운명의 처방전]** (분량: **2,800자 내외**)
   - 해당 카테고리 기운의 **생애 6단계 흐름(유년, 초년, 청년, 중년, 장년, 말년)**을 극도로 상세하게 분석하십시오.
   - **[유년 / 초년 / 청년 / 중년 / 장년 / 말년]** 각 단계별로 시기(나이대)를 명확히 하고, 각 단계마다 최소 450자 이상의 독립된 문단을 구성하십시오.

3. **[운명의 타이밍: 2026-2028 3개년 및 월별 정밀 분석]** (분량: **1,500자 내외**)
   - 2026년 1월부터 12월까지의 월별 흐름을 한 달도 빠짐없이 매우 정밀하게 예견하고 조언하십시오. 12월까지의 모든 흐름이 반드시 포함되어야 합니다.

4. **[개운법: 운명을 바꾸는 고품격 시크릿]** (분량: **500자 이상**)
   - 부족한 기운을 보강해 줄 아이템, 풍수, 행동 비책을 구체적으로 정리하십시오.

### [Phase 3: 가독성 제약 및 금기 사항]
- **[핵심 규칙]** 단순히 사주 용어(편관 등)만 굵게 표시하지 마십시오. 사용자에게 울림을 주는 **"인사이트가 담긴 문장 전체"**를 반드시 <b> 태그를 사용하여 과감하게 강조하십시오. (강조 비중 30% 이상)
- 문장 중간에 'ㅡ' 또는 '—' 기호를 절대 사용하지 마십시오.
- 정보가 없는 경우 '정재 ()' 처럼 비어있는 괄호를 남기지 마십시오.
- **[매우 중요 - 십신 매핑]**: 천간 매핑 - ${sajuAnalysisJson.tenGod_lookup.stems_mapping} / 지지 매핑 - ${sajuAnalysisJson.tenGod_lookup.branches_mapping}.

### [Phase 4: 출력 포맷 (Strict JSON ONLY)]
{
  "basic_elements": {"wood": 0, "fire": 0, "earth": 0, "metal": 0, "water": 0},
  "corrected_elements": {"wood": 0, "fire": 0, "earth": 0, "metal": 0, "water": 0},
  "correction_reason": "...",
  "analysis": {
    "title": "운명의 거대한 변화를 읽어내는 명리 마스터의 통찰",
    "life_shape": "1,200자 내외의 심층 형상 분석 문구들...",
    "solution": "2,800자 내외의 6단계 생애 주기별 상세 분석 문구들...",
    "timing": "1,500자 내외의 2026년 월별 정밀 분석 문구들 (12월까지 반드시 포함)"
  },
  "luck_advice": "개운법과 최종 조언 (500자 내외 상세히)"
}
`;



      const payload = {
        systemPrompt,
        sajuJson: sajuAnalysisJson,
        userAnswers: [`관심 영역: ${category}`, `구체적 질문: ${question}`],
        expectedKeys: ["basic_elements", "corrected_elements", "correction_reason", "analysis", "luck_advice"]
      };

      const apiRes = await fetch("/api/premium-saju", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      if (!apiRes.ok) {
        const errJson = await apiRes.json().catch(() => ({}));
        throw new Error(errJson.error ? `${errJson.error}: ${errJson.details || ""}` : "API 요청 실패");
      }
      
      let llmResultRaw = await apiRes.json();
      const llmResult = cleanAstrologyTerms(llmResultRaw);

      // Extract elements. Always use internal basePercentages for the 'Base' view to show unadjusted state.
      const aiBasic = basePercentages; 
      const aiCorrected = llmResult.corrected_elements || correctedPercentages;
      const aiReason = llmResult.correction_reason || johuNote;

      const ilganEl = getElementFromChar(sajuRes.pillarDetails.day.stemKo);
      const baseStrength = calculateStrength(aiBasic, ilganEl);
      const correctedStrength = calculateStrength(aiCorrected, ilganEl);

      const correctedKeys = aiCorrected ? Object.keys(aiCorrected) : [];
      const dominantKey = correctedKeys.length > 0 
        ? correctedKeys.reduce((a, b) => aiCorrected[a] > aiCorrected[b] ? a : b)
        : 'water';
      const dominantKo = dominantKey === 'wood' ? '목' : dominantKey === 'fire' ? '화' : dominantKey === 'earth' ? '토' : dominantKey === 'metal' ? '금' : '수';

      // 3. Daeun Calculation (Pro-Logic: Extracted directly from ssaju)
      const daeunCycles = sajuRes.daeun.list.map((d: any) => ({
        age: d.startAge,
        year: d.startYear,
        ganji: d.ganzhi,
        ganjiKo: (d.ganKo || "") + (d.zhiKo || "")
      })).slice(0, 8);

      const elementCounts: Record<string, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
      const allPillars = [sajuRes.pillarDetails.year, sajuRes.pillarDetails.month, sajuRes.pillarDetails.day, sajuRes.pillarDetails.hour];
      allPillars.forEach(p => {
        // 한글 글자 기반으로 오행을 직접 추출하여 누락 방지 (v4.1)
        const sEl = getElementFromChar(p.stemKo);
        const bEl = getElementFromChar(p.branchKo);
        if (elementCounts.hasOwnProperty(sEl)) elementCounts[sEl]++;
        if (elementCounts.hasOwnProperty(bEl)) elementCounts[bEl]++;
      });

      const currentYear = parseFloat(process.env.NEXT_PUBLIC_DEBUG_YEAR || "2026");
      let currentDaeunIdx = -1;
      for (let i = 0; i < daeunCycles.length; i++) {
        const start = daeunCycles[i].year;
        const end = i < daeunCycles.length - 1 ? daeunCycles[i+1].year : 2100;
        if (currentYear >= start && currentYear < end) {
          currentDaeunIdx = i;
          break;
        }
      }

      setBazi(finalizedBazi);
      setReading(llmResult);
      setDetailedData({
        table: sajuRes.pillarDetails,
        tenGods: sajuRes.tenGods,
        stages12: sajuRes.stages12.bong,
        sals: manualSals,
        elementsUI,
        elements_ratio: aiCorrected,
        elements_ratio_base: aiBasic,
        strength_base: baseStrength,
        strength_corrected: correctedStrength,
        johu_correction: aiReason,
        dominant: dominantKo,
        daeunCycles,
        currentDaeunIdx,
        relation: getElementRelation(dominantKo),
        ilganElement: getElementFromChar(sajuRes.pillarDetails.day.stemKo),
        elementCounts,
        advanced: {
          ...sajuRes.advanced,
          daeunNum: (sajuRes.daeun?.list?.[0]?.startAge ?? 0) + 1,
          daeunCycles,
          daeunDirection: sajuRes.daeun.basis.direction
        }
      });
      setIsLoading(false);
    } catch (e: any) {
      alert(e.message || "오류가 발생했습니다.");
      setIsLoading(false);
      setStep(0); 
    }
  };

  const renderHighlightedText = (rawText: string, isDarkBg = false) => {
    if (!rawText) return null;
    let text = rawText;
    
    // Attempt to handle nested JSON returned by Pro models
    try {
      if (typeof text === 'string' && (text.trim().startsWith('{') || text.trim().startsWith('['))) {
        const parsed = JSON.parse(text);
        if (parsed.sections && Array.isArray(parsed.sections)) {
          text = (parsed.title ? `## ${parsed.title}\n\n` : "") +
                 (parsed.introduction || "") + "\n\n" + 
                 parsed.sections.map((s: any) => `### ${s.heading}\n${s.content}`).join("\n\n") + 
                 "\n\n" + (parsed.conclusion || "");
        } else if (parsed.content) {
          text = parsed.content;
        }
      }
    } catch (e) {
      // Not JSON, continue with raw string
    }

    // Strip symbols like <b>, (, and stray JSON chars that may leak into the text
    text = text
      .replace(/<[^>]+>/g, '')               // All HTML tags including <b>, </b>
      .replace(/\s*\(\s*,\s*/g, ' (')         // Fix persistent "(, " or "(," artifact to "("
      .replace(/\s*\(\s*\)\s*/g, ' ')        // Fix empty parentheses "()" artifact
      .replace(/^\s*[\{\[\]\}]+\s*/gm, '')  // leading/trailing braces on lines
      .replace(/\s*[\{\}]\s*$/gm, '')        // trailing braces at end of lines
      .replace(/^\s*\.\.\.\s*$/gm, '')       // standalone ellipsis lines
      .replace(/,\s*"[a-z_]+"\s*:/g, '')     // stray JSON key fragments like ,"key":
      .replace(/^"\s*/gm, '')                // leading quote at start of line
      .replace(/\s*"$/gm, '')                // trailing quote at end of line
      .replace(/\s*\(,\s*$/gm, '')           // stray ( ,
      .replace(/^\s*\{\s*$/gm, '')           // stray {
      .replace(/^\s*\}\s*$/gm, '')           // stray }
      .trim();

    const ELEMENT_COLORS: Record<string, string> = {
      '목(木)': '#81b29a', '화(火)': '#e07a5f', '토(土)': '#D4A373', '금(金)': '#FFD700', '수(水)': '#3d5a80'
    };
    const DARK_BG_ELEMENT_COLORS: Record<string, string> = {
      '목(木)': '#a3c8b5', '화(火)': '#f4a28c', '토(土)': '#D4A373', '금(金)': '#FFD700', '수(水)': '#8ab4f8'
    };
    const paragraphs = text.replace(/\*\*/g, '').split(/\n\s*\n/); // 마크다운 볼드(**) 기호 사전 제거로 충돌 방지
    return paragraphs.map((para, i) => {
      if (!para.trim()) return null;
      // <b> 태그를 더 유연하게 캡처 (공백 등 허용)
      const parts = para.split(/(<\s*b\s*>.*?<\s*\/\s*b\s*>|목\(木\)|화\(火\)|토\(土\)|금\(金\)|수\(水\))/g);
      const isHeader = /^[\d\s]*[📍📅🔍💡🎯🏆💎✨]/.test(para.trim()) || para.trim().startsWith('###') || para.trim().startsWith('##');
      return (
        <div key={i} style={{ 
          marginBottom: isHeader ? "20px" : "16px", 
          marginTop: isHeader && i > 0 ? "32px" : "0",
          lineHeight: "1.85", 
          fontSize: isHeader ? "1.15rem" : "1.02rem",
          fontWeight: isHeader ? "700" : "400", 
          color: isHeader ? (isDarkBg ? "var(--accent-gold)" : "var(--accent-indigo)") : (isDarkBg ? "rgba(255, 255, 255, 0.9)" : "var(--text-secondary)"),
          whiteSpace: "pre-wrap",
          textAlign: "left", 
          letterSpacing: "-0.015em",
          fontFamily: "'Pretendard', sans-serif",
          padding: isHeader ? "0" : "0 4px"
        }}>
          {parts.map((part, j) => {
            // 태그 내부의 공백 등을 정리하여 스타일 적용
            if (part.trim().startsWith('<b') && part.trim().endsWith('</b>')) {
                const innerText = part.replace(/<\/?b\s*>/g, '').trim(); 
                return (
                    <strong key={j} style={{ 
                        color: isDarkBg ? "var(--accent-gold)" : "var(--accent-indigo)", 
                        fontWeight: "900", 
                        fontSize: "1.05rem", 
                        display: "inline",
                        borderBottom: isDarkBg ? "2px solid rgba(201,160,80,0.4)" : "2px solid rgba(42,54,95,0.2)",
                        paddingBottom: "1px"
                    }}>
                        {innerText}
                    </strong>
                );
            }
            if (part.startsWith('###')) return <span key={j}>{part.replace('###', '').trim()}</span>;
            if (part.startsWith('##')) return <span key={j}>{part.replace('##', '').trim()}</span>;
            
            const elementColor = isDarkBg ? DARK_BG_ELEMENT_COLORS[part.trim()] : ELEMENT_COLORS[part.trim()];
            if (elementColor) return <strong key={j} style={{ color: elementColor, fontWeight: "800" }}>{part.trim()}</strong>;
            return part;
          })}
        </div>
      );
    });
  };

  return (
    <>
      <main ref={topRef} style={{ width: "100%", minHeight: "100vh", position: "relative", background: "var(--bg-primary)" }}>
      <Disclaimer />
      <TraditionalBackground />
      <WheelDatePicker isOpen={isDatePickerOpen} onClose={() => setIsDatePickerOpen(false)} initialDate={typeof date === 'string' ? date : "1991-01-13"} onConfirm={(y, m, d, lunar) => { setDate(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`); setIsLunar(lunar); setIsDatePickerOpen(false); }} />
      
      <div style={{
        maxWidth: "520px", margin: "0 auto", minHeight: "100vh",
        background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(20px)",
        boxShadow: "0 0 60px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <button onClick={handleBack} style={{ background: "rgba(0,0,0,0.05)", border: "none", color: "var(--text-primary)", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <ArrowLeft size={16} />
            </button>
            <div style={{ textAlign: "center", cursor: "pointer", userSelect: "none" }} onClick={handleDevReset}>
              <div style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--accent-gold)", letterSpacing: "0.1em", margin: 0, fontFamily: "'Nanum Myeongjo', serif" }}>PREMIUM 심층 감명</div>
            </div>
            <div style={{ width: "32px" }}></div>
          </div>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                  <Sparkles size={24} color="var(--accent-gold)" style={{ margin: "0 auto 6px" }} />
                  <h2 style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--accent-indigo)", marginBottom: "6px", fontFamily: "'Nanum Myeongjo', serif" }}>
                    단 한 사람을 위한<br/>초정밀 운명 기록서
                  </h2>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.4", margin: 0 }}>
                    원활한 진행을 위해 명식 정보를 확인합니다.<br/>
                    운명의 흐름을 바꾸기 위한 명리 처방전을 작성합니다.<br/>
                    알고 싶은 주제와 질문을 입력해 주세요.
                  </p>
                </div>

                  <div style={{ background: "white", padding: "16px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.03)", border: "1px solid var(--glass-border)", display: "flex", flexDirection: "column", gap: "10px" }}>
                    {/* Delivery Method Selector */}
                    <div style={{ display: "flex", gap: "8px", marginBottom: "10px", background: "rgba(0,0,0,0.04)", padding: "4px", borderRadius: "14px" }}>
                      <button 
                        onClick={() => setDeliveryMethod("email")}
                        style={{ flex: 1, padding: "10px 0", borderRadius: "10px", border: "none", background: deliveryMethod === "email" ? "white" : "transparent", color: deliveryMethod === "email" ? "var(--accent-indigo)" : "#999", fontWeight: "700", fontSize: "0.85rem", boxShadow: deliveryMethod === "email" ? "0 2px 8px rgba(0,0,0,0.1)" : "none", transition: "all 0.2s" }}
                      >
                        이메일로 받기
                      </button>
                      <button 
                        onClick={() => setDeliveryMethod("kakao")}
                        style={{ flex: 1, padding: "10px 0", borderRadius: "10px", border: "none", background: deliveryMethod === "kakao" ? "white" : "transparent", color: deliveryMethod === "kakao" ? "#3C1E1E" : "#999", fontWeight: "700", fontSize: "0.85rem", boxShadow: deliveryMethod === "kakao" ? "0 2px 8px rgba(0,0,0,0.1)" : "none", transition: "all 0.2s" }}
                      >
                        카카오톡으로 받기
                      </button>
                    </div>

                    {deliveryMethod === "email" ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "4px" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--accent-indigo)", marginLeft: "4px" }}>결과를 받으실 이메일 (필수)</span>
                        <input 
                          type="email" 
                          value={userEmail} 
                          onChange={(e) => setUserEmail(e.target.value)} 
                          placeholder="example@email.com"
                          style={{ width: "100%", padding: "12px", borderRadius: "12px", background: "rgba(0,0,0,0.02)", border: "none", fontSize: "0.95rem", fontWeight: "600", outline: "none" }} 
                        />
                      </div>
                    ) : (
                      <div style={{ marginBottom: "4px" }}>
                        <span style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: "var(--accent-indigo)", marginLeft: "4px", marginBottom: "6px" }}>카카오 계정 연동 (필수)</span>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleKakaoSync}
                          style={{ 
                            width: "100%", padding: "12px", borderRadius: "12px", background: "#FEE500", 
                            color: "#3C1E1E", fontWeight: "800", fontSize: "0.9rem", border: "none", 
                            display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", 
                            boxShadow: "0 4px 12px rgba(254, 229, 0, 0.15)", cursor: "pointer" 
                          }}
                        >
                          <img src="https://developers.kakao.com/assets/img/about/logos/kakaotalksharing/kakaotalk_sharing_btn_medium.png" alt="kakao" style={{ width: "18px" }} />
                          {kakaoToken ? "카카오 정보 연동 완료" : "카카오 1초 연동하기"}
                        </motion.button>
                      </div>
                    )}
                    <div onClick={() => setIsDatePickerOpen(true)} className="glass-input" style={{ cursor: "pointer", padding: "12px", borderRadius: "12px", background: "rgba(0,0,0,0.02)", fontSize: "0.95rem", textAlign: "center", fontWeight: "600" }}>{date}</div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "rgba(0,0,0,0.02)", border: "none", fontSize: "0.95rem", fontWeight: "600", outline: "none", textAlign: "center" }} />
                      <div style={{ display: "flex", background: "rgba(0,0,0,0.04)", borderRadius: "12px", padding: "4px" }}>
                        <button onClick={() => setIsLunar(false)} style={{ padding: "0 12px", borderRadius: "8px", border: "none", background: !isLunar ? "var(--accent-indigo)" : "transparent", fontWeight: "600", fontSize: "0.9rem", color: !isLunar ? "white" : "var(--text-secondary)", transition: "all 0.2s" }}>양력</button>
                        <button onClick={() => setIsLunar(true)} style={{ padding: "0 12px", borderRadius: "8px", border: "none", background: isLunar ? "var(--accent-indigo)" : "transparent", fontWeight: "600", fontSize: "0.9rem", color: isLunar ? "white" : "var(--text-secondary)", transition: "all 0.2s" }}>음력</button>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "6px", flexDirection: "column" }}>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <select className="glass-input" value={birthCity} onChange={(e) => setBirthCity(e.target.value)} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "rgba(0,0,0,0.02)", border: "none", fontSize: "0.95rem", fontWeight: "600", outline: "none" }}>
                          <optgroup label="주요 광역시">
                            {["서울", "부산", "대구", "인천", "광주", "대전", "울산", "제주"].map(c => <option key={c} value={c}>{c}</option>)}
                          </optgroup>
                          <optgroup label="경기도 및 주요 도시">
                            {Object.keys(cityLmtOffsets).filter(c => !["서울", "부산", "대구", "인천", "광주", "대전", "울산", "제주", "기타"].includes(c)).map(c => <option key={c} value={c}>{c}</option>)}
                          </optgroup>
                          <optgroup label="기타">
                            <option value="기타">기타 지역</option>
                          </optgroup>
                        </select>
                        <div style={{ display: "flex", background: "rgba(0,0,0,0.04)", borderRadius: "12px", padding: "4px", flex: 1 }}>
                          <button onClick={() => setGender("M")} style={{ flex: 1, padding: "8px 0", borderRadius: "8px", border: "none", background: gender === "M" ? "var(--accent-indigo)" : "transparent", fontWeight: "600", fontSize: "0.9rem", color: gender === "M" ? "white" : "var(--text-secondary)", transition: "all 0.2s" }}>남성</button>
                          <button onClick={() => setGender("F")} style={{ flex: 1, padding: "8px 0", borderRadius: "8px", border: "none", background: gender === "F" ? "var(--accent-indigo)" : "transparent", fontWeight: "600", fontSize: "0.9rem", color: gender === "F" ? "white" : "var(--text-secondary)", transition: "all 0.2s" }}>여성</button>
                        </div>
                      </div>
                      <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", margin: "4px 0 0 4px", borderLeft: "2px solid rgba(42, 54, 95, 0.2)", paddingLeft: "8px" }}>
                        * 태어난 지역에 따른 시간차를 반영해 정밀하게 살핍니다.
                      </p>
                    </div>
                  </div>
                <button onClick={() => setStep(1)} className="btn-primary" style={{ width: "100%", marginTop: "16px", padding: "14px", borderRadius: "16px", background: "linear-gradient(135deg, var(--accent-indigo), #1A1C2C)", color: "var(--accent-gold)", fontWeight: "700", fontSize: "1.05rem", border: "none", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }}>
                  심층 질문 시작하기 <ArrowRight size={18} />
                </button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
                  <div style={{ height: "4px", flex: 1, borderRadius: "2px", background: "var(--accent-gold)" }} />
                  <div style={{ height: "4px", flex: 1, borderRadius: "2px", background: "rgba(0,0,0,0.1)" }} />
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--accent-gold)", fontWeight: "700", marginBottom: "6px" }}>STEP 1 / 2</div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--accent-indigo)", marginBottom: "16px", lineHeight: "1.35", wordBreak: "keep-all" }}>
                  가장 정밀하게 풀이하고 싶은 영역을 선택해주세요.
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", width: "100%" }}>
                  {NEW_CATEGORIES.map((cat, i) => (
                    <motion.button 
                      key={i} 
                      whileHover={{ scale: 1.02, backgroundColor: "rgba(201, 160, 80, 0.05)" }} 
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setSelectedCategory(cat); setStep(2); }}
                      style={{ 
                        padding: "16px 10px", background: "white", border: "1px solid var(--glass-border)", borderRadius: "18px", 
                        textAlign: "center", fontSize: "0.95rem", fontWeight: "700", color: "var(--accent-indigo)", cursor: "pointer", 
                        boxShadow: "0 4px 12px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "70px" 
                      }}
                    >
                      {cat}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
                  <div style={{ height: "4px", flex: 1, borderRadius: "2px", background: "var(--accent-gold)" }} />
                  <div style={{ height: "4px", flex: 1, borderRadius: "2px", background: "var(--accent-gold)" }} />
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--accent-gold)", fontWeight: "700", marginBottom: "6px" }}>STEP 2 / 2: {selectedCategory}</div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--accent-indigo)", marginBottom: "16px", lineHeight: "1.35", wordBreak: "keep-all" }}>
                  {selectedCategory}에 대해 궁금한 내용을<br/>작성해주세요. (선택사항)
                </h3>
                <div style={{ position: "relative" }}>
                  <textarea 
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value.slice(0, 200))}
                    placeholder="예: 올해 하반기에 사업을 확장하려고 하는데 시기가 좋을까요? 특히 자금 흐름이 원활할지 궁금합니다."
                    style={{ 
                      width: "100%", height: "180px", padding: "16px", borderRadius: "18px", border: "1px solid var(--glass-border)", 
                      background: "white", fontSize: "0.95rem", lineHeight: "1.6", outline: "none", resize: "none", color: "#333",
                      boxShadow: "inset 0 2px 8px rgba(0,0,0,0.02)"
                    }}
                  />
                  <div style={{ position: "absolute", bottom: "12px", right: "16px", fontSize: "0.75rem", color: userQuestion.length >= 200 ? "red" : "#999", fontWeight: "600" }}>
                    {userQuestion.length} / 200
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const paymentData = {
                      date, time, isLunar, birthCity, gender, 
                      selectedCategory, userQuestion, userEmail,
                      deliveryMethod // Added
                    };
                    localStorage.setItem("premium_saju_data", JSON.stringify(paymentData));
                    setIsPaymentModalOpen(true);
                  }}
                  className="btn-primary" 
                  style={{ 
                    width: "100%", marginTop: "20px", padding: "16px", borderRadius: "16px", 
                    background: "linear-gradient(135deg, var(--accent-indigo), #1A1C2C)", 
                    color: "var(--accent-gold)", fontWeight: "800", fontSize: "1.1rem", border: "none"
                  }}
                >
                  심층 감명 시작하기
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} ref={resultRef}>
                {isLoading ? (
                  <div style={{ textAlign: "center", padding: "80px 20px", minHeight: "420px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "linear-gradient(135deg, #1A1C2C, #2A365F)", borderRadius: "24px", boxShadow: "inset 0 0 50px rgba(0,0,0,0.5), 0 20px 50px rgba(0,0,0,0.2)", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(circle at 50% 50%, rgba(201, 160, 80, 0.15), transparent 70%)" }} />
                    <div style={{ position: "relative", zIndex: 1, width: "120px", height: "120px", marginBottom: "32px" }}>
                      <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}>
                        <circle cx="50" cy="50" r="45" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                        <motion.circle cx="50" cy="50" r="45" fill="transparent" stroke="var(--accent-gold)" strokeWidth="6" strokeDasharray="282.7" animate={{ strokeDashoffset: 282.7 - (282.7 * loadingProgress) / 100 }} transition={{ duration: 0.2 }} strokeLinecap="round" />
                      </svg>
                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "1.5rem", fontWeight: "800", color: "var(--accent-gold)" }}>{Math.round(loadingProgress)}%</div>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.p key={loadingTextIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ position: "relative", zIndex: 1, color: "rgba(255,255,255,0.9)", fontSize: "0.95rem", fontWeight: "500", marginBottom: "16px" }}>
                        {loadingTexts[loadingTextIdx]}
                      </motion.p>
                    </AnimatePresence>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} style={{ position: "relative", zIndex: 1, color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", lineHeight: "1.5", margin: 0 }}>
                      청아매당의 정통 명리 대가가 귀하의 사주를 심도 있게 살피는 중입니다.<br/>정밀한 감명을 위해 약 1분~2분 정도의 시간이 소요될 수 있습니다.
                    </motion.p>
                  </div>
                ) : reading ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ textAlign: "center", marginBottom: "10px" }}>
                      <div style={{ fontSize: "0.75rem", color: "var(--accent-gold)", fontWeight: "800", letterSpacing: "0.15em", marginBottom: "4px" }}>PREMIUM FULL ANALYSIS</div>
                      <h2 style={{ fontSize: "1.5rem", color: "var(--accent-indigo)", fontWeight: "900", fontFamily: "'Nanum Myeongjo', serif" }}>정밀 사주 해석</h2>
                    </div>

                    <SajuPillarTable 
                      data={detailedData.table} 
                      tenGods={detailedData.tenGods} 
                      stages12={detailedData.stages12} 
                      sals={detailedData.sals} 
                    />

                    {/* 대운 영역 추가 */}
                    <DaeunTable 
                      userName="사용자" 
                      startAge={detailedData.advanced?.daeunNum || 8} 
                      cycles={detailedData.advanced?.daeunCycles || []} 
                      direction={detailedData.advanced?.daeunDirection}
                    />

                    <SinSalTable 
                      data={detailedData.table} 
                      sals={detailedData.sals} 
                    />

                    <div style={{ 
                      margin: "20px 0", 
                      background: "white", 
                      padding: "24px 16px", 
                      borderRadius: "28px", 
                      border: "1px solid rgba(201,160,80,0.15)", 
                      boxShadow: "0 15px 40px rgba(0,0,0,0.04)" 
                    }}>
                      <div style={{ fontSize: "1.25rem", color: "#333", fontWeight: "900", marginBottom: "28px", textAlign: "center", fontFamily: "'Nanum Myeongjo', serif" }}>나의 오행 에너지 풀이</div>
                      
                      {/* Segmented Control / Toggle */}
                      <div style={{ 
                        display: "flex", 
                        background: "rgba(0,0,0,0.04)", 
                        padding: "4px", 
                        borderRadius: "14px", 
                        marginBottom: "32px",
                        position: "relative"
                      }}>
                        <motion.div 
                          layoutId="tabBackground"
                          style={{
                            position: "absolute",
                            top: 4, bottom: 4,
                            left: activeTab === 'base' ? 4 : "50%",
                            right: activeTab === 'base' ? "50%" : 4,
                            background: "white",
                            borderRadius: "11px",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                            zIndex: 0
                          }}
                        />
                        <button 
                          onClick={() => setActiveTab('base')}
                          style={{ flex: 1, padding: "10px 0", border: "none", background: "transparent", fontSize: "0.85rem", fontWeight: "800", color: activeTab === 'base' ? "var(--accent-indigo)" : "var(--text-secondary)", position: "relative", zIndex: 1, cursor: "pointer", transition: "color 0.2s" }}
                        >
                          원국 오행 (기본)
                        </button>
                        <button 
                          onClick={() => setActiveTab('corrected')}
                          style={{ flex: 1, padding: "10px 0", border: "none", background: "transparent", fontSize: "0.85rem", fontWeight: "800", color: activeTab === 'corrected' ? "var(--accent-gold)" : "var(--text-secondary)", position: "relative", zIndex: 1, cursor: "pointer", transition: "color 0.2s" }}
                        >
                          전문가 보충 (보정)
                        </button>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      {/* Chart Rendering */}
                      <ElementBarChart 
                        data={activeTab === 'base' ? detailedData.elements_ratio_base : detailedData.elements_ratio} 
                        strength={activeTab === 'base' ? detailedData.strength_base : detailedData.strength_corrected}
                      />
                        <div style={{ padding: "30px 0", borderTop: "1px solid #f5f5f5", borderBottom: "1px solid #f5f5f5" }}>
                          <div style={{ textAlign: "center", fontSize: "0.9rem", fontWeight: "800", color: "#333", marginBottom: "15px" }}>오행의 상생(生)과 상극(剋)</div>
                          <ElementalCycleDiagram counts={detailedData.elementCounts} />
                        </div>
                      </div>

                      {activeTab === 'corrected' && (
                        <div style={{ marginTop: "24px", padding: "16px", background: "rgba(201,160,80,0.05)", borderRadius: "16px", fontSize: "0.85rem", color: "#666", lineHeight: "1.7", border: "1px solid rgba(201,160,80,0.1)", position: "relative" }}>
                          <div style={{ position: "absolute", top: "-10px", left: "20px", background: "var(--accent-gold)", color: "white", padding: "2px 10px", borderRadius: "10px", fontSize: "0.7rem", fontWeight: "800" }}>전문가 보정 의견</div>
                          <p style={{ margin: 0, wordBreak: "keep-all" }}>
                            {detailedData.johu_correction}
                          </p>
                        </div>
                      )}
                    </div>

                    {(() => {
                      const getDynamicScore = () => {
                        const ratios = activeTab === 'base' ? detailedData.elements_ratio_base : detailedData.elements_ratio;
                        const ilgan = detailedData.ilganElement;
                        if (!ratios || !ilgan) return 50;
                        
                        const ilKey = ilgan === '목' ? 'wood' : ilgan === '화' ? 'fire' : ilgan === '토' ? 'earth' : ilgan === '금' ? 'metal' : 'water';
                        let sKey = 'wood';
                        if (ilgan === '목') sKey = 'water';
                        else if (ilgan === '화') sKey = 'wood';
                        else if (ilgan === '토') sKey = 'fire';
                        else if (ilgan === '금') sKey = 'earth';
                        else if (ilgan === '수') sKey = 'metal';
                        
                        const score = (ratios[ilKey] || 0) + (ratios[sKey] || 0);
                        return score;
                      };
                      return (
                        <>
                          <StrengthWeaknessMeter score={getDynamicScore()} />
                          <div style={{ marginTop: "32px", marginBottom: "8px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                              <div style={{ width: "4px", height: "16px", background: "var(--accent-indigo)", borderRadius: "2px" }} />
                              <h4 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--accent-indigo)", margin: 0 }}>귀하의 대운 흐름</h4>
                            </div>
                            <DaeunTable 
                              userName="" 
                              startAge={detailedData.advanced?.daeunNum || 1} 
                              cycles={detailedData.daeunCycles || []} 
                              currentIndex={detailedData.currentDaeunIdx}
                              direction={detailedData.advanced?.daeunDirection}
                            />
                          </div>
                        </>
                      );
                    })()}

                    {/* VVIP Expanded Deep Dive Section */}
                    <div style={{ background: "linear-gradient(145deg, #1A1C3C, #2A365F)", padding: "40px 20px", borderRadius: "40px", color: "white", boxShadow: "0 30px 60px rgba(0,0,0,0.3)", position: "relative", overflow: "hidden", border: "1px solid rgba(201,160,80,0.2)", marginTop: "40px" }}>
                      <div style={{ position: "absolute", top: -40, right: -40, opacity: 0.15, transform: "rotate(15deg)" }}><Sparkles size={250} color="var(--accent-gold)" /></div>
                      
                      <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                          <div style={{ background: "rgba(201,160,80,0.2)", color: "var(--accent-gold)", padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "800", letterSpacing: "0.1em" }}>VVIP PRIVATE ANALYSIS</div>
                        </div>
                        
                        <h3 style={{ fontSize: "1.5rem", fontWeight: "900", color: "white", marginBottom: "8px", fontFamily: "'Nanum Myeongjo', serif" }}>
                          {reading.analysis?.title || "오직 당신만을 위한 심층 명리 처방"}
                        </h3>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "32px", marginTop: "40px" }}>
                          <section>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                              <div style={{ width: "4px", height: "16px", background: "var(--accent-gold)", borderRadius: "2px" }} />
                              <h4 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--accent-gold)", margin: 0 }}>인생의 형상</h4>
                            </div>
                            <div style={{ fontSize: "1rem", lineHeight: "1.9", color: "rgba(255,255,255,0.9)", wordBreak: "keep-all" }}>
                              {renderHighlightedText(reading.analysis?.life_shape, true)}
                            </div>
                          </section>

                          <section>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                              <div style={{ width: "4px", height: "16px", background: "var(--accent-gold)", borderRadius: "2px" }} />
                              <h4 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--accent-gold)", margin: 0 }}>고민에 대한 해답</h4>
                            </div>
                            <div style={{ fontSize: "1rem", lineHeight: "1.9", color: "rgba(255,255,255,0.9)", wordBreak: "keep-all" }}>
                              {renderHighlightedText(reading.analysis?.solution, true)}
                            </div>
                          </section>

                          <section>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                              <div style={{ width: "4px", height: "16px", background: "var(--accent-gold)", borderRadius: "2px" }} />
                              <h4 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--accent-gold)", margin: 0 }}>핵심 성패 시기</h4>
                            </div>
                            <div style={{ fontSize: "1rem", lineHeight: "1.9", color: "rgba(255,255,255,0.9)", wordBreak: "keep-all" }}>
                              {renderHighlightedText(reading.analysis?.timing, true)}
                            </div>
                          </section>

                          <section style={{ background: "rgba(255,255,255,0.05)", padding: "24px", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.1)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                              <Sparkles size={18} color="var(--accent-gold)" />
                              <h4 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--accent-gold)", margin: 0 }}>운을 바꾸는 개운법</h4>
                            </div>
                            <div style={{ fontSize: "1rem", lineHeight: "1.9", color: "var(--accent-gold)", fontWeight: "600", wordBreak: "keep-all" }}>
                              {renderHighlightedText(reading.luck_advice, true)}
                            </div>
                          </section>
                        </div>

                        <div style={{ marginTop: "40px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "32px" }}>
                          <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", fontStyle: "italic" }}>
                            * 본 분석은 사용자의 10가지 성향 답변과 타고난 사주 명식을 유기적으로 결합하여 도출된 초개인화 결과입니다.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="no-print" style={{ display: "flex", gap: "12px", marginTop: "32px", padding: "20px 0", borderTop: "1px solid var(--glass-border)" }}>
                      <button onClick={handleCopy} style={{ flex: 1, padding: "16px", borderRadius: "16px", background: "white", color: "var(--text-primary)", fontWeight: "700", fontSize: "1rem", border: "1px solid var(--glass-border)", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", cursor: "pointer", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
                        <Copy size={18} /> 분석 결과 전체 복사하기
                      </button>
                    </div>

                    <div style={{ display: "flex", gap: "12px", marginTop: "12px", paddingBottom: "40px" }}>
                      <button onClick={() => topRef.current?.scrollIntoView({ behavior: "smooth" })} style={{ flex: 1, padding: "14px", borderRadius: "14px", background: "rgba(255,255,255,0.8)", color: "var(--accent-indigo)", fontWeight: "700", fontSize: "0.95rem", border: "1px solid var(--glass-border)", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                        <ArrowUp size={18} /> 맨 위로
                      </button>
                      <Link href="/" style={{ flex: 1, textDecoration: "none" }}>
                        <button style={{ width: "100%", padding: "14px", borderRadius: "14px", background: "rgba(255,255,255,0.8)", color: "var(--accent-indigo)", fontWeight: "700", fontSize: "0.95rem", border: "1px solid var(--glass-border)", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                          <Home size={18} /> 홈으로
                        </button>
                      </Link>
                    </div>

                  </div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)}
        amount={5000}
        orderName={`PREMIUM 심층 감명 (${selectedCategory})`}
        customerKey={customerKey}
      />
    </main>
    <Script 
      src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
      onLoad={() => {
        setKakaoReady(true);
        if ((window as any).Kakao && !(window as any).Kakao.isInitialized()) {
          (window as any).Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY || "b60b41a84d11534e64bd1422cba88b5d");
        }
      }}
    />
    </>
  );
}

export default function PremiumSajuPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PremiumSajuContent />
    </Suspense>
  );
}
