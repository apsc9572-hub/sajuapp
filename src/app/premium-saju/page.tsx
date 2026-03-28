"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Sparkles, Navigation, CalendarDays, Coins, Heart, Briefcase, Activity, Target, Copy, Download, ArrowUp, Home, CreditCard } from "lucide-react";
import { getUnifiedSaju } from "@/lib/unified-saju";
import TraditionalBackground from "@/components/TraditionalBackground";
import Disclaimer from "@/components/Disclaimer";
import WheelDatePicker from "@/components/WheelDatePicker";
import PaymentModal from "@/components/PaymentModal";
import KoreanLunarCalendar from "korean-lunar-calendar";
import { v4 as uuidv4 } from "uuid";
import Script from "next/script";
import { prepareAnalysisData, getElementFromChar, SAJU_DICTIONARY } from "@/lib/premium-saju-utils";
import SinsalGrid from "@/components/SinsalGrid";

const NEW_CATEGORIES = ["재물운", "사업운", "애정운", "직장운", "학업운", "인생총운"];

export const stemsHanja: Record<string, string> = {
  "갑": "甲", "을": "乙", "병": "丙", "정": "丁", "무": "戊",
  "기": "己", "경": "庚", "신": "辛", "임": "壬", "계": "癸"
};
export const branchesHanja: Record<string, string> = {
  "자": "子", "축": "丑", "인": "寅", "묘": "卯", "진": "辰", "사": "巳",
  "오": "午", "미": "未", "신": "申", "유": "酉", "술": "戌", "해": "亥"
};

export const getElementColor = (char: string) => {
  if (!char) return 'var(--text-primary)';
  const c = char.toLowerCase();
  if (['목', '甲', '乙', '寅', '묘', '卯', 'wood'].some(v => c.includes(v))) return '#81b29a'; // green
  if (['화', '丙', '정', '丁', '사', '巳', '오', '午', 'fire'].some(v => c.includes(v))) return '#e07a5f'; // red
  if (['토', '무', '기', '戊', '己', '진', '술', '축', '미', '辰', '戌', '丑', '未', 'earth'].some(v => c.includes(v))) return '#D4A373'; // brown
  if (['금', '경', '신', '庚', '辛', '申', '유', '酉', 'metal'].some(v => c.includes(v))) return '#FFD700'; // yellow
  if (['수', '임', '계', '壬', '癸', '해', '자', '亥', '子', 'water'].some(v => c.includes(v))) return '#3d5a80'; // blue
  return 'var(--text-primary)';
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

// 용어 가이드 툴팁 컴포넌트
const TermTooltip = ({ term, children }: { term: string, children: React.ReactNode }) => {
  const [show, setShow] = React.useState(false);
  const description = SAJU_DICTIONARY[term] || SAJU_DICTIONARY[term.replace(/Yang|Eum/g, '')];

  if (!description) return <>{children}</>;

  return (
    <div 
      style={{ position: 'relative', display: 'inline-block', cursor: 'help' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow(!show)}
    >
      {children}
      {show && (
        <div style={{
          position: 'absolute',
          bottom: '120%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '200px',
          background: 'rgba(42, 54, 95, 0.95)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '0.75rem',
          fontWeight: '400',
          lineHeight: '1.4',
          zIndex: 1000,
          boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
          pointerEvents: 'none',
          textAlign: 'center'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '2px' }}>{term}</div>
          {description}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            marginLeft: '-5px',
            borderWidth: '5px',
            borderStyle: 'solid',
            borderColor: 'rgba(42, 54, 95, 0.95) transparent transparent transparent'
          }} />
        </div>
      )}
    </div>
  );
};

// 프리미엄 8단 명식표 (포스텔러 스타일 고도화)
export const SajuPillarTable = ({ data, tenGods, stages12, sals }: { data: any, tenGods: any, stages12: any, sals: any }) => {
  if (!data) return null;

  const pillars = [
    { 
      label: "생시", 
      data: data.hour, 
      stage: data.hour.stage12 || stages12?.hour || "-", 
      topTen: data.hour.stemTenGod || data.hour.tenGodStem || tenGods?.hour?.stem || "-",
      bottomTen: data.hour.branchTenGod || data.hour.tenGodBranch || tenGods?.hour?.branch || "-",
      hidden: data.hour.hidden || data.hour.hiddenText || "-",
      stemSals: sals?.hour?.stem || [],
      branchSals: sals?.hour?.branch || []
    },
    { 
      label: "생일", 
      data: data.day, 
      stage: data.day.stage12 || stages12?.day || "-", 
      topTen: "비견", 
      bottomTen: data.day.branchTenGod || data.day.tenGodBranch || tenGods?.day?.branch || "-",
      hidden: data.day.hidden || data.day.hiddenText || "-",
      stemSals: sals?.day?.stem || [],
      branchSals: sals?.day?.branch || []
    },
    { 
      label: "생월", 
      data: data.month, 
      stage: data.month.stage12 || stages12?.month || "-", 
      topTen: data.month.stemTenGod || data.month.tenGodStem || tenGods?.month?.stem || "-",
      bottomTen: data.month.branchTenGod || data.month.tenGodBranch || tenGods?.month?.branch || "-",
      hidden: data.month.hidden || data.month.hiddenText || "-",
      stemSals: sals?.month?.stem || [],
      branchSals: sals?.month?.branch || []
    },
    { 
      label: "생년", 
      data: data.year, 
      stage: data.year.stage12 || stages12?.year || "-", 
      topTen: data.year.stemTenGod || data.year.tenGodStem || tenGods?.year?.stem || "-",
      bottomTen: data.year.branchTenGod || data.year.tenGodBranch || tenGods?.year?.branch || "-",
      hidden: data.year.hidden || data.year.hiddenText || "-",
      stemSals: sals?.year?.stem || [],
      branchSals: sals?.year?.branch || []
    }
  ];

  const rowLabels = ["천간", "십성", "지지", "십성", "지장간", "12운성", "12신살"];

  return (
    <div style={{ margin: "16px 0", background: "white", borderRadius: "20px", padding: "6px", border: "1.5px solid #eee", boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "50px 1fr 1fr 1fr 1fr", borderRadius: "14px", overflow: "hidden", border: "1px solid #f0f0f0" }}>
        {/* Header */}
        <div style={{ background: "#f8f9fa", padding: "10px 0", borderBottom: "1px solid #eee" }} />
        {pillars.map((p, i) => (
          <div key={i} style={{ background: "#f8f9fa", padding: "10px 0", borderBottom: "1px solid #eee", textAlign: "center", fontSize: "0.95rem", fontWeight: "800", color: "#666" }}>
            {p.label}
          </div>
        ))}

        {/* 1. 천간 */}
        <div style={{ background: "#fcfcfc", padding: "10px 0", borderBottom: "1px solid #eee", textAlign: "center", fontSize: "0.75rem", fontWeight: "800", color: "#999", display: "flex", alignItems: "center", justifyContent: "center" }}>천간</div>
        {pillars.map((p, i) => (
          <div key={i} style={{ padding: "12px 0", borderBottom: "1px solid #eee", textAlign: "center", position: "relative" }}>
            <div style={{ fontSize: '1.4rem', fontWeight: "900", color: getElementColor(p.data.element.stem), lineHeight: "1.2" }}>
              {p.data.stemKo}({stemsHanja[p.data.stemKo]})
            </div>
            <div style={{ position: "absolute", bottom: "4px", right: "4px", fontSize: "0.65rem", fontWeight: "700", opacity: 0.7, color: getElementColor(p.data.element.stem) }}>
              {p.data.element.stem.includes("Yang") ? "+" : "-"}{getElementHanja(p.data.element.stem)}
            </div>
          </div>
        ))}

        {/* 2. 십성 (천간) */}
        <div style={{ background: "#fcfcfc", padding: "8px 0", borderBottom: "1px solid #eee", textAlign: "center", fontSize: "0.75rem", fontWeight: "800", color: "#999", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <TermTooltip term="십성">십성</TermTooltip>
        </div>
        {pillars.map((p, i) => (
          <div key={i} style={{ padding: "8px 0", borderBottom: "1px solid #eee", textAlign: "center", fontSize: "1rem", fontWeight: "800", color: getElementColor(p.data.element.stem) }}>
            <TermTooltip term={p.topTen}>{p.topTen}</TermTooltip>
          </div>
        ))}

        {/* 3. 지지 */}
        <div style={{ background: "#fcfcfc", padding: "10px 0", borderBottom: "1px solid #eee", textAlign: "center", fontSize: "0.75rem", fontWeight: "800", color: "#999", display: "flex", alignItems: "center", justifyContent: "center" }}>지지</div>
        {pillars.map((p, i) => (
          <div key={i} style={{ padding: "12px 0", borderBottom: "1px solid #eee", textAlign: "center", position: "relative" }}>
            <div style={{ fontSize: '1.4rem', fontWeight: "900", color: getElementColor(p.data.element.branch), lineHeight: "1.2" }}>
              {p.data.branchKo}({branchesHanja[p.data.branchKo]})
            </div>
            <div style={{ position: "absolute", bottom: "4px", right: "4px", fontSize: "0.65rem", fontWeight: "700", opacity: 0.7, color: getElementColor(p.data.element.branch) }}>
              {p.data.element.branch.includes("Yang") ? "+" : "-"}{getElementHanja(p.data.element.branch)}
            </div>
          </div>
        ))}

        {/* 4. 십성 (지지) */}
        <div style={{ background: "#fcfcfc", padding: "8px 0", borderBottom: "1px solid #eee", textAlign: "center", fontSize: "0.75rem", fontWeight: "800", color: "#999", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <TermTooltip term="십성">십성</TermTooltip>
        </div>
        {pillars.map((p, i) => (
          <div key={i} style={{ padding: "8px 0", borderBottom: "1px solid #eee", textAlign: "center", fontSize: "1rem", fontWeight: "800", color: getElementColor(p.data.element.branch) }}>
            <TermTooltip term={p.bottomTen}>{p.bottomTen}</TermTooltip>
          </div>
        ))}

        {/* 5. 지장간 */}
        <div style={{ background: "#fcfcfc", padding: "8px 0", borderBottom: "1px solid #eee", textAlign: "center", fontSize: "0.7rem", fontWeight: "800", color: "#999", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <TermTooltip term="지장간">지장간</TermTooltip>
        </div>
        {pillars.map((p, i) => (
          <div key={i} style={{ padding: "8px 0", borderBottom: "1px solid #eee", textAlign: "center", fontSize: "0.85rem", color: "#666", fontWeight: "600" }}>
            {p.hidden}
          </div>
        ))}

        {/* 6. 12운성 */}
        <div style={{ background: "#fcfcfc", padding: "8px 0", textAlign: "center", fontSize: "0.7rem", fontWeight: "800", color: "#999", borderBottom: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <TermTooltip term="12운성">12운성</TermTooltip>
        </div>
        {pillars.map((p, i) => (
          <div key={i} style={{ padding: "8px 0", textAlign: "center", fontSize: "0.95rem", color: "#333", fontWeight: "700", borderBottom: "none" }}>
            {p.stage}
          </div>
        ))}
      </div>
    </div>
  );
};



// 세로형 오행 바 차트 (청아매당 독창적 수묵 디자인)
export const ElementBarChart = ({ data, strength }: { data: any, strength?: string }) => {
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

// 오행 순환 다이어그램 (포스텔러 스타일 Stargate 재해석)
export const StargateElementChart = ({ percentages }: { percentages: any }) => {
  const elements = [
    { key: "wood", label: "목", hanja: "木", color: "#81b29a", pos: { x: 100, y: 35 } },
    { key: "fire", label: "화", hanja: "火", color: "#e07a5f", pos: { x: 165, y: 85 } },
    { key: "earth", label: "토", hanja: "土", color: "#f2cc8f", pos: { x: 140, y: 165 } },
    { key: "metal", label: "금", hanja: "金", color: "#C9A050", pos: { x: 60, y: 165 } },
    { key: "water", label: "수", hanja: "水", color: "#3d5a80", pos: { x: 35, y: 85 } }
  ];

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "320px", margin: "20px auto", padding: "10px", background: "white", borderRadius: "30px", boxShadow: "0 10px 40px rgba(0,0,0,0.04)" }}>
      <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ display: "block" }}>
        <defs>
          <marker id="arrowhead-saeng" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6" fill="#3b82f6" opacity="0.6" />
          </marker>
          <marker id="arrowhead-geuk" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6" fill="#ef4444" opacity="0.6" />
          </marker>
        </defs>

        {/* 상극 화살표 (내부 별 모양) */}
        {elements.map((el, i) => {
          const target = elements[(i + 2) % 5];
          return (
            <line 
              key={`geuk-${i}`}
              x1={el.pos.x} y1={el.pos.y} x2={target.pos.x} y2={target.pos.y}
              stroke="#ef4444" strokeWidth="1.5" strokeOpacity="0.25"
              markerEnd="url(#arrowhead-geuk)"
            />
          );
        })}

        {/* 상생 화살표 (외부 순환) */}
        {elements.map((el, i) => {
          const next = elements[(i + 1) % 5];
          const midX = (el.pos.x + next.pos.x) / 2;
          const midY = (el.pos.y + next.pos.y) / 2;
          return (
            <path 
              key={`saeng-${i}`}
              d={`M ${el.pos.x} ${el.pos.y} Q ${midX + (midX-100)*0.2} ${midY + (midY-100)*0.2} ${next.pos.x} ${next.pos.y}`}
              fill="none" stroke="#3b82f6" strokeWidth="2" strokeOpacity="0.3"
              markerEnd="url(#arrowhead-saeng)"
            />
          );
        })}

        {/* 오행 노드 */}
        {elements.map((el, i) => {
          const val = percentages[el.key] || 0;
          return (
            <g key={i}>
              <circle cx={el.pos.x} cy={el.pos.y} r="26" fill="white" filter="drop-shadow(0 4px 12px rgba(0,0,0,0.06))" />
              <circle cx={el.pos.x} cy={el.pos.y} r="24" fill="none" stroke={el.color} strokeWidth="2.5" />
              <text x={el.pos.x} y={el.pos.y - 4} textAnchor="middle" fontSize="0.75rem" fontWeight="900" fill={el.color}>{el.label}({el.hanja})</text>
              <text x={el.pos.x} y={el.pos.y + 10} textAnchor="middle" fontSize="0.85rem" fontWeight="900" fill="#333">{val.toFixed(1)}%</text>
            </g>
          );
        })}
      </svg>
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "10px", paddingBottom: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.7rem", fontWeight: "700", color: "#3b82f6" }}>
          <div style={{ width: "12px", height: "2px", background: "#3b82f6", opacity: 0.6 }} /> 상생(도움)
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.7rem", fontWeight: "700", color: "#ef4444" }}>
          <div style={{ width: "12px", height: "2px", background: "#ef4444", opacity: 0.6 }} /> 상극(제어)
        </div>
      </div>
    </div>
  );
};

// 십성 도넛 차트 (신규)
export const SipsungDonutChart = ({ data }: { data: any }) => {
  if (!data) return null;
  const items = [
    { label: "식신", value: data.siksin || 0, color: "#81b29a" },
    { label: "상관", value: data.sanggwan || 0, color: "#81b29a" },
    { label: "편재", value: data.pyeonja || 0, color: "#e07a5f" },
    { label: "정재", value: data.jeongja || 0, color: "#e07a5f" },
    { label: "편관", value: data.pyeongwan || 0, color: "#f2cc8f" },
    { label: "정관", value: data.jeonggwan || 0, color: "#f2cc8f" },
    { label: "편인", value: data.pyeonin || 0, color: "#C9A050" },
    { label: "정인", value: data.jeongin || 0, color: "#C9A050" },
    { label: "비견", value: data.bigyeon || 0, color: "#3d5a80" },
    { label: "겁재", value: data.geobjae || 0, color: "#3d5a80" }
  ].filter(v => v.value > 0).sort((a,b) => b.value - a.value);

  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;
  let currentOffset = 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", background: "white", padding: "24px", borderRadius: "30px", boxShadow: "0 10px 40px rgba(0,0,0,0.04)" }}>
      <h3 style={{ fontSize: "1.1rem", fontWeight: "900", color: "#333", margin: 0 }}>십성 분포 분석</h3>
      <div style={{ display: "flex", alignItems: "center", gap: "30px", width: "100%" }}>
        <div style={{ position: "relative", width: "140px", height: "140px" }}>
          <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
            {items.map((item, i) => {
              const dashArray = (item.value / total) * 263.9;
              const offset = (currentOffset / total) * 263.9;
              currentOffset += item.value;
              return (
                <circle
                  key={i}
                  cx="50" cy="50" r="42"
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth="10"
                  strokeDasharray={`${dashArray} 263.9`}
                  strokeDashoffset={-offset}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", width: "100%" }}>
            <div style={{ fontSize: "0.75rem", color: "#999", fontWeight: "700" }}>대표 기운</div>
            <div style={{ fontSize: "1.1rem", color: "#333", fontWeight: "900", wordBreak: "keep-all" }}>{items[0]?.label || "순환"}</div>
          </div>
        </div>
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr", gap: "8px" }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color }} />
                <TermTooltip term={item.label}>
                  <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#666" }}>{item.label}</span>
                </TermTooltip>
              </div>
              <span style={{ fontSize: "0.85rem", fontWeight: "900", color: "#333" }}>{((item.value/total)*100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 주요 신살 및 길성 요약 (포스텔러 스타일)
export const MajorSinsalSummary = ({ sals }: { sals: any }) => {
  if (!sals) return null;

  const allSals = [
    ...sals.year.specialSals, ...sals.month.specialSals, 
    ...sals.day.specialSals, ...sals.hour.specialSals,
    sals.year.twelveSal, sals.month.twelveSal, 
    sals.day.twelveSal, sals.hour.twelveSal
  ].filter((s, i, a) => s && a.indexOf(s) === i);

  const majorSinsals = allSals.filter(s => s.includes("살")).slice(0, 4);
  const majorGilsungs = allSals.filter(s => s.includes("귀인") || s.includes("덕")).slice(0, 4);

  return (
    <div style={{ marginTop: "24px", padding: "24px", background: "white", borderRadius: "30px", boxShadow: "0 10px 40px rgba(0,0,0,0.04)", border: "1px solid rgba(236,72,153,0.1)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <Sparkles size={20} color="#ec4899" />
        <h3 style={{ fontSize: "1.1rem", fontWeight: "900", color: "#333", margin: 0 }}>나의 주요 신살과 길성</h3>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div style={{ background: "rgba(236,72,153,0.05)", padding: "16px", borderRadius: "20px" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "#ec4899", marginBottom: "8px" }}>핵심 신살(神殺)</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {majorSinsals.length > 0 ? majorSinsals.map((s, i) => (
              <TermTooltip key={i} term={s}>
                <span style={{ background: "white", color: "#ec4899", padding: "4px 10px", borderRadius: "10px", fontSize: "0.8rem", fontWeight: "700", border: "1px solid rgba(236,72,153,0.2)" }}>{s}</span>
              </TermTooltip>
            )) : <span style={{ color: "#ccc", fontSize: "0.8rem" }}>특이 신살 없음</span>}
          </div>
        </div>
        <div style={{ background: "rgba(201,160,80,0.05)", padding: "16px", borderRadius: "20px" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--accent-gold)", marginBottom: "8px" }}>핵심 길성(吉星)</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {majorGilsungs.length > 0 ? majorGilsungs.map((s, i) => (
              <TermTooltip key={i} term={s}>
                <span style={{ background: "white", color: "var(--accent-gold)", padding: "4px 10px", borderRadius: "10px", fontSize: "0.8rem", fontWeight: "700", border: "1px solid rgba(201,160,80,0.2)" }}>{s}</span>
              </TermTooltip>
            )) : <span style={{ color: "#ccc", fontSize: "0.8rem" }}>특이 길성 없음</span>}
          </div>
        </div>
      </div>
    </div>
  );
};



// 대운표 컴포넌트 (이미지 1 참고)
export const DaeunTable = ({ userName, startAge, cycles, direction, currentIndex }: { userName: string, startAge: number, cycles: any[], direction?: string, currentIndex?: number }) => {
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
              background: i === currentIndex ? "rgba(201,160,80,0.08)" : "white", 
              borderLeft: i > 0 ? "1px solid #eee" : "none",
              textAlign: "center",
              transform: i === currentIndex ? "scale(1.02)" : "none",
              boxShadow: i === currentIndex ? "inset 0 0 15px rgba(201,160,80,0.15)" : "none",
              zIndex: i === currentIndex ? 1 : 0
            }}>
              <div style={{ fontSize: "1rem", fontWeight: "900", color: getElementColor(c.ganji[0]), marginBottom: "2px" }}>
                {c.ganji[0]}({stemsHanja[c.ganji[0]] || ""})
              </div>
              <div style={{ fontSize: "1rem", fontWeight: "900", color: getElementColor(c.ganji[1]) }}>
                {c.ganji[1]}({branchesHanja[c.ganji[1]] || ""})
              </div>
              <div style={{ fontSize: "0.65rem", color: i === currentIndex ? "var(--accent-indigo)" : "#999", marginTop: "2px", fontWeight: "800" }}>{c.ganjiKo}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 신강/신약 지수 그래프 (포스텔러 스타일 고풍격 버전)
export const StrengthIndexGraph = ({ score, deuk }: { score: number, deuk: any }) => {
  const categories = ["극약", "태약", "신약", "중화신약", "중화신강", "신강", "태강", "극강"];
  const checkItems = [
    { label: "득령", status: deuk?.deuk_ryeong },
    { label: "득지", status: deuk?.deuk_ji },
    { label: "득시", status: deuk?.deuk_si },
    { label: "득세", status: deuk?.deuk_se }
  ];

  // score: 0-100
  const normalizedScore = Math.min(Math.max(score, 0), 100);

  return (
    <div style={{ background: "white", padding: "28px", borderRadius: "32px", boxShadow: "0 15px 45px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.04)", marginTop: "24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-20px", right: "-20px", opacity: 0.03, pointerEvents: "none" }}>
        <Activity size={120} color="var(--accent-indigo)" />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <div style={{ background: "rgba(42,54,95,0.06)", padding: "10px", borderRadius: "14px" }}>
          <Activity size={20} color="var(--accent-indigo)" />
        </div>
        <TermTooltip term="신강">
          <h3 style={{ fontSize: "1.15rem", fontWeight: "900", color: "#333", margin: 0, fontFamily: "'Nanum Myeongjo', serif" }}>신강/신약 지수 분석</h3>
        </TermTooltip>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "32px" }}>
        {checkItems.map((item, i) => (
          <div key={i} style={{ 
            display: "flex", alignItems: "center", gap: "8px", 
            background: item.status ? "rgba(42,54,95,0.05)" : "rgba(0,0,0,0.02)", 
            padding: "6px 14px", borderRadius: "12px",
            border: item.status ? "1px solid rgba(42,54,95,0.1)" : "1px solid transparent",
            transition: "all 0.3s"
          }}>
            <span style={{ fontSize: "0.8rem", fontWeight: "800", color: item.status ? "var(--accent-indigo)" : "#999" }}>{item.label}</span>
            <div style={{ 
              width: "18px", height: "18px", borderRadius: "50%", 
              background: item.status ? "var(--accent-indigo)" : "#ccc", 
              display: "flex", alignItems: "center", justifyContent: "center", 
              color: "white", fontSize: "0.65rem", fontWeight: "900",
              boxShadow: item.status ? "0 2px 5px rgba(42,54,95,0.2)" : "none"
            }}>
              {item.status ? "O" : "X"}
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{ fontSize: "0.85rem", color: "#888", marginBottom: "8px", fontWeight: "700" }}>에너지 밸런스 지수: <span style={{ color: "#333" }}>{normalizedScore.toFixed(1)}</span></div>
        <div style={{ fontSize: "1.2rem", color: "#333", fontWeight: "900", wordBreak: "keep-all" }}>
          님은 
          <TermTooltip term={normalizedScore >= 45 ? "신강" : "신약"}>
            <span style={{ color: "var(--accent-indigo)", borderBottom: "3px solid rgba(42,54,95,0.2)", paddingBottom: "2px", margin: "0 4px" }}>
              {normalizedScore >= 85 ? "태강한" : normalizedScore >= 65 ? "신강한" : normalizedScore >= 55 ? "약신강한" : normalizedScore >= 45 ? "중화된" : normalizedScore >= 35 ? "약신약한" : normalizedScore >= 15 ? "신약한" : "태약한"}
            </span>
          </TermTooltip>
          사주입니다.
        </div>
      </div>

      <div style={{ position: "relative", height: "140px", width: "100%", padding: "0 10px 40px" }}>
        <svg width="100%" height="80" viewBox="0 0 400 80" preserveAspectRatio="none" style={{ overflow: "visible" }}>
          <defs>
            <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f8f9fa" />
              <stop offset="50%" stopColor="rgba(42,54,95,0.1)" />
              <stop offset="100%" stopColor="#f8f9fa" />
            </linearGradient>
          </defs>
          <path 
            d="M0,70 Q50,70 100,50 Q150,20 200,10 Q250,20 300,50 Q350,70 400,70" 
            fill="url(#curveGradient)" stroke="#eee" strokeWidth="2" 
          />
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <line x1={normalizedScore * 4} y1="0" x2={normalizedScore * 4} y2="72" stroke="var(--accent-indigo)" strokeWidth="2.5" strokeDasharray="4 2" />
            <circle cx={normalizedScore * 4} cy="32" r="7" fill="white" stroke="var(--accent-indigo)" strokeWidth="3" />
            <text x={normalizedScore * 4} y="55" textAnchor="middle" fontSize="11" fontWeight="900" fill="var(--accent-indigo)">나</text>
          </motion.g>
        </svg>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", borderTop: "1px solid #f0f0f0", paddingTop: "8px" }}>
          {categories.map((cat, i) => (
            <div key={i} style={{ 
              fontSize: "0.6rem", fontWeight: "800", textAlign: "center", flex: 1,
              color: (i === Math.floor(normalizedScore / 12.5)) ? "var(--accent-indigo)" : "#999"
            }}>
              {cat}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const StrengthWeaknessMeter = ({ score }: { score: number }) => {
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  return (
    <div style={{ marginTop: "24px", padding: "20px", background: "white", borderRadius: "24px", border: "1px solid rgba(0,0,0,0.05)" }}>
      <div style={{ fontSize: "0.9rem", fontWeight: "800", color: "#333", marginBottom: "12px", textAlign: "center" }}>종합 에너지 강약 지수 ({normalizedScore.toFixed(1)})</div>
      <div style={{ height: "12px", background: "#eee", borderRadius: "6px", position: "relative", overflow: "hidden" }}>
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: `${normalizedScore}%` }} 
          style={{ height: "100%", background: "linear-gradient(to right, #3d5a80, #81b29a, #e07a5f)", borderRadius: "6px" }} 
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "0.7rem", color: "#999", fontWeight: "700" }}>
        <span>극약</span>
        <span>신약</span>
        <span>중화</span>
        <span>신강</span>
        <span>극강</span>
      </div>
    </div>
  );
};

export const YongsinDisplay = ({ yongsin }: { yongsin: any }) => {
  if (!yongsin) return null;
  return (
    <div style={{ background: "white", padding: "28px", borderRadius: "32px", boxShadow: "0 15px 45px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.04)", marginTop: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <div style={{ background: "rgba(201,160,80,0.08)", padding: "10px", borderRadius: "14px" }}>
          <Target size={20} color="var(--accent-gold)" />
        </div>
        <TermTooltip term="용신">
          <h3 style={{ fontSize: "1.15rem", fontWeight: "900", color: "#333", margin: 0, fontFamily: "'Nanum Myeongjo', serif" }}>나의 용신(用神) 처방</h3>
        </TermTooltip>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div style={{ background: "rgba(224, 122, 95, 0.04)", padding: "20px", borderRadius: "24px", border: "1.5px solid rgba(224, 122, 95, 0.1)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: "900", color: "#e07a5f", letterSpacing: "0.05em" }}>조후용신 [기후 조화]</div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1.30rem", fontWeight: "900", color: getElementColor(yongsin.johu) }}>
              {yongsin.johu}{yongsin.johu === '목' ? '(木)' : yongsin.johu === '화' ? '(火)' : yongsin.johu === '토' ? '(土)' : yongsin.johu === '금' ? '(金)' : '(水)'}
            </span>
            <span style={{ fontSize: "0.75rem", color: "#666", fontWeight: "700" }}>({yongsin.johuNote})</span>
          </div>
        </div>
        <div style={{ background: "rgba(61, 90, 128, 0.04)", padding: "20px", borderRadius: "24px", border: "1.5px solid rgba(61, 90, 128, 0.1)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: "900", color: "#3d5a80", letterSpacing: "0.05em" }}>억부용신 [에너지 균형]</div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1.30rem", fontWeight: "900", color: getElementColor(yongsin.eokbu) }}>
              {yongsin.eokbu}{yongsin.eokbu === '목' ? '(木)' : yongsin.eokbu === '화' ? '(火)' : yongsin.eokbu === '토' ? '(土)' : yongsin.eokbu === '금' ? '(金)' : '(水)'}
            </span>
            <span style={{ fontSize: "0.75rem", color: "#666", fontWeight: "700" }}>({yongsin.eokbuNote})</span>
          </div>
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
  
  // High quality cleaning
  return text
    .replace(/\b(Metal|Wood|Water|Fire|Earth|Yin|Yang)\b/gi, (match: string) => {
      const elementMap: Record<string, string> = {
        'Metal': '금(金)', 'Wood': '목(木)', 'Water': '수(水)', 'Fire': '화(火)', 'Earth': '토(土)',
        'Yin': '음(陰)', 'Yang': '양(陽)'
      };
      const normalized = match.charAt(0).toUpperCase() + match.slice(1).toLowerCase();
      return elementMap[normalized] || match;
    })
    .replace(/\*\*/g, '') 
    .replace(/^#+\s*/gm, '') 
    .replace(/\s올해\s/g, ' 2026년 ')
    .replace(/\(올해\)/g, '(2026년)')
    .trim();
};

const cityLmtOffsets: Record<string, number> = {
  "서울": -32, "부산": -24, "대구": -26, "인천": -33, "광주": -32, "대전": -30, "울산": -24, "제주": -34,
  "수원": -32, "성남": -32, "고양": -33, "용인": -31, "부천": -33, "안산": -33, "남양주": -31, "안양": -32,
  "화성": -33, "평택": -32, "의정부": -32, "파주": -33, "시흥": -33, "김포": -33, "광명": -32, "광주(경기)": -31,
  "군포": -32, "이천": -30, "오산": -32, "하남": -31, "양주": -32, "구리": -32, "안성": -31, "포천": -31,
  "의왕": -32, "여주": -30, "동두천": -32, "과천": -32, "가평": -30, "양평": -30, "연천": -32, "강릉": -24, "기타": -30,
};

function PremiumSajuContent() {
  const router = useRouter();
  const [kakaoReady, setKakaoReady] = useState(false);
  const [step, setStep] = useState(0); // 0: Birth Input, 1: Category Select, 1.5: Confirmation, 2: User Question, 3: Loading/Result
  const [selectedCategory, setSelectedCategory] = useState("");
  const [userQuestion, setUserQuestion] = useState("");

  // Input states
  const [date, setDate] = useState("1995-05-15");
  const [time, setTime] = useState("14:30");
  const [isLunar, setIsLunar] = useState(false);
  const [isLeap, setIsLeap] = useState(false);
  const [gender, setGender] = useState("M");
  const [birthCity, setBirthCity] = useState("서울");
  const [userEmail, setUserEmail] = useState("");
  const [emailId, setEmailId] = useState("");
  const [emailDomain, setEmailDomain] = useState("naver.com");
  const [deliveryMethod, setDeliveryMethod] = useState<"email" | "kakao">("kakao");
  const [kakaoToken, setKakaoToken] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [customerKey] = useState(() => uuidv4());
  const [activeTab, setActiveTab] = useState<'base' | 'corrected'>('corrected');
  const [bazi, setBazi] = useState<any>(null);

  // Reset analysis result when moving back to input steps (0, 1, 1.5, 2)
  useEffect(() => {
    if (step < 3) {
      setReading(null);
      setDetailedData(null);
    }
  }, [step]);
  
  const topRef = useRef<HTMLDivElement>(null);
  const [reading, setReading] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [detailedData, setDetailedData] = useState<any>(null);

  const resultRef = useRef<HTMLDivElement>(null);

  const [clickCount, setClickCount] = useState(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (emailId) {
      setUserEmail(`${emailId}@${emailDomain}`);
    } else {
      setUserEmail("");
    }
  }, [emailId, emailDomain]);

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
        if (parsed.phoneNumber) setPhoneNumber(parsed.phoneNumber);
        if (parsed.userEmail) {
          const email = parsed.userEmail as string;
          setUserEmail(email);
          if (email.includes("@")) {
            const [id, domain] = email.split("@");
            setEmailId(id);
            if (domain === "naver.com" || domain === "daum.net") {
              setEmailDomain(domain);
            }
          }
        }
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
    if (step === 2) setStep(1.5);
    else if (step === 1.5) setStep(1);
    else if (step === 1) setStep(0);
    else {
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
            console.log("Kakao SDK Initialized. Modules:", Object.keys(Kakao));
          } catch (e) {
            console.error("Kakao Init Error:", e);
          }
        }
        setKakaoReady(true);
      }
    };

    const timer = setInterval(() => {
      const Kakao = (window as any).Kakao;
      if (Kakao && Kakao.init) {
        initKakao();
        if (Kakao.Auth) {
          clearInterval(timer);
        }
      }
    }, 300);

    return () => clearInterval(timer);
  }, []);

  /* 
  // Kakao Login is removed as per user request to simplify to phone-only AlimTalk
  const handleKakaoSync = () => {
    const Kakao = (window as any).Kakao;

    if (!Kakao) {
      alert("카카오톡 SDK를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    if (!Kakao.Auth) {
      alert("카카오톡 인증 모듈을 불러오는 중입니다. 1~2초 후 다시 시도해주세요.");
      return;
    }

    // In v1 SDK, login is the standard popup method.
    Kakao.Auth.login({
      scope: 'profile_nickname, account_email, gender',
      success: function(authObj: any) {
        console.log("Kakao Login Success:", authObj);
        Kakao.API.request({
          url: '/v2/user/me',
          success: function(res: any) {
            const kakaoAccount = res.kakao_account;
            if (kakaoAccount) {
              if (kakaoAccount.gender) {
                setGender(kakaoAccount.gender === "male" ? "M" : "F");
              }
              if (kakaoAccount.email) {
                const email = kakaoAccount.email;
                setUserEmail(email);
                if (email.includes("@")) {
                  const [id, domain] = email.split("@");
                  setEmailId(id);
                  setEmailDomain(domain);
                }
              }
              if (authObj.access_token) {
                setKakaoToken(authObj.access_token);
                sessionStorage.setItem("kakao_access_token", authObj.access_token);
              }
              alert(`${res.properties?.nickname || "사용자"}님의 정보가 연동되었습니다.`);
            }
          },
          fail: function(error: any) {
            console.error("Kakao API Request Fail:", error);
            alert("카카오 정보를 불러오는데 실패했습니다.");
          }
        });
      },
      fail: function(err: any) {
        console.error("Kakao Auth Login Fail:", err);
        alert("카카오 로그인에 실패했습니다.");
      },
    });
  };
  */

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

    // In v1 SDK, Share is renamed to Link
    Kakao.Link.sendDefault({
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

  const getElementKeyFromChar = (char: string) => {
    if (['甲', '乙', '寅', '卯', '갑', '을', '인', '묘'].includes(char)) return 'wood';
    if (['丙', '丁', '巳', '午', '병', '정', '사', '오'].includes(char)) return 'fire';
    if (['戊', '己', '辰', '戌', '丑', '未', '무', '기', '진', '술', '축', '미'].includes(char)) return 'earth';
    if (['庚', '辛', '申', '酉', '경', '신', '유'].includes(char)) return 'metal';
    if (['壬', '癸', '亥', '子', '임', '계', '해', '자'].includes(char)) return 'water';
    return 'earth';
  };

  const calculateStrengthScore = (elementRatios: any, ilganElement: string) => {
    // ilganElement is assumed to be Korean or English.
    const ilganKey = getElementKeyFromChar(ilganElement);
    let supportingKey = '';

    if (ilganKey === 'wood') supportingKey = 'water';
    else if (ilganKey === 'fire') supportingKey = 'wood';
    else if (ilganKey === 'earth') supportingKey = 'fire';
    else if (ilganKey === 'metal') supportingKey = 'earth';
    else if (ilganKey === 'water') supportingKey = 'metal';

    return (elementRatios[ilganKey] || 0) + (elementRatios[supportingKey] || 0);
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

      let sajuRes = getUnifiedSaju({
        date,
        time,
        isLunar,
        isLeap,
        gender,
        birthCity
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
각 섹션은 전문가의 품격이 느껴지는 유려한 문체로 **매우 길고 상세하게(총합 6,500자 목표)** 작성하십시오. 특히, **"길흉화복의 가감 없는 전달"**을 원칙으로 삼아 좋은 점뿐만 아니라 **사용자가 직면할 수 있는 위험, 성격적 단점, 주의해야 할 흉운(凶運)**을 매우 구체적으로 경고하십시오.

1. **[인생의 형상: 귀하의 타고난 에너지 지도]** (분량: **1,200자 내외**)
   - "사방의 강력한 편관(土)이라는 사회적 규율과 압박을, 내면의 거대한 지하 수맥(水)의 힘으로 뚫고 나가는 위대한 혁신가"의 서술 기조를 유지하십시오.
   - 당신의 일간 '계수(癸水)'가 지닌 성격적 강점과 더불어, **내재된 예민함, 고립될 위험성, 감정적 기복 등 취약점**도 가감 없이 서술하십시오.

2. **[심층 솔루션: 운명의 처방전]** (분량: **2,800자 내외**)
   - 해당 카테고리 기운의 **생애 6단계 흐름(유년, 초년, 청년, 중년, 장년, 말년)**을 극도로 상세하게 분석하십시오.
   - **[유년 / 초년 / 청년 / 중년 / 장년 / 말년]** 각 단계별 시기(나이대)를 명확히 하고, **각 단계마다 성공의 기회뿐만 아니라 반드시 겪게 될 고난이나 실패의 위험 요소**를 상세히 문단화하십시오.

3. **[운명의 타이밍: 2026-2028 3개년 및 월별 정밀 분석]** (분량: **1,500자 내외**)
   - 2026년, 2027년, 2028년의 흐름을 **연도별로 명확히 구분하여 전개**하십시오. 
   - **【매우 중요】 특정 개월수(예: 4월~6월)나 문구를 섹션 내에서 3회 이상 반복 언급하는 것을 엄격히 금지합니다.** 한 번 언급한 시기적 특징은 다음 문단에서 다른 관점이나 다른 시기(다음 달 등)로 자연스럽게 넘어가야 합니다.
   - 2026년의 12개월 흐름을 모두 포함하되, 각 달의 특이사항을 중복 없이 서술하십시오.

4. **[개운의 비책: 운명을 바꾸는 고품격 시크릿]** (분량: **500자 이상**)
   - 부족한 기운을 보강하고 위험 요소를 완화할 수 있는 처방을 **"반드시 ~하십시오", "~를 착용하십시오"** 와 같은 **명확한 명령형(Imperative)** 문장으로 작성하십시오.
   - 무엇을 하지 말아야 할지에 대한 **'금기 사항'**도 명확히 포함하십시오.

### [Phase 3: 가독성 제약 및 금기 사항]
- **[태그 제약]**: **[major]...[/major]** 태그 외에 임의의 태그(예: [단호], [/단호], [속보] 등)를 생성하거나 본문에 포함하는 것을 **절대 금지**합니다.
- **[반복 금지]**: 동일한 단어나 문장 구조를 2회 이상 연속해서 사용하지 마십시오. 풍성한 어휘를 사용하여 독창적인 문장을 구성하십시오.
- **[메타 정보 금지]**: 결과 하단이나 본문에 "총 글자 수", "공백 포함" 등의 통계 정보나 인공지능의 코멘트를 절대 포함하지 마십시오.
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
  "luck_advice": "개운의 비책과 최종 조언 (500자 내외로 무엇을 해야 할지 단호하고 상세하게)"
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

      // Global getElementFromChar returns Korean names
      const ilganKo = (window as any).getElementFromChar ? (window as any).getElementFromChar(sajuRes.pillarDetails.day.stemKo) : getElementFromChar(sajuRes.pillarDetails.day.stemKo);
      
      const baseStrength = calculateStrengthScore(aiBasic, ilganKo);
      const correctedStrength = calculateStrengthScore(aiCorrected, ilganKo);

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

      const sipsungCounts: Record<string, number> = {
        siksin: 0, sanggwan: 0, pyeonja: 0, jeongja: 0, pyeongwan: 0, jeonggwan: 0, pyeonin: 0, jeongin: 0, bigyen: 0, geobjae: 0
      };

      const mapTenGodToKey = (tg: string) => {
        if (tg === "비견") return "bigyen";
        if (tg === "겁재") return "geobjae";
        if (tg === "식신") return "siksin";
        if (tg === "상관") return "sanggwan";
        if (tg === "편재") return "pyeonja";
        if (tg === "정재") return "jeongja";
        if (tg === "편관") return "pyeongwan";
        if (tg === "정관") return "jeonggwan";
        if (tg === "편인") return "pyeonin";
        if (tg === "정인") return "jeongin";
        return "";
      };

      [sajuRes.pillarDetails.year, sajuRes.pillarDetails.month, sajuRes.pillarDetails.day, sajuRes.pillarDetails.hour].forEach((p, idx) => {
        const sKey = mapTenGodToKey(p.stemTenGod || (idx === 2 ? "비견" : "-"));
        const bKey = mapTenGodToKey(p.branchTenGod || "-");
        if (sKey) sipsungCounts[sKey]++;
        if (bKey) sipsungCounts[bKey]++;
      });

      // --- 신규: 득령/득지/득시/득세 및 용신 판별 로직 ---
      const isSupporting = (iKo: string, tChar: string) => {
        const tEl = getElementFromChar(tChar); // Global Korean version
        const supportMap: Record<string, string[]> = {
          '목': ['수', '목'], '화': ['목', '화'], '토': ['화', '토'], '금': ['토', '금'], '수': ['금', '수']
        };
        return supportMap[iKo]?.includes(tEl) || false;
      };

      const deuk = {
        deuk_ryeong: isSupporting(ilganKo, sajuRes.pillarDetails.month.branchKo),
        deuk_ji: isSupporting(ilganKo, sajuRes.pillarDetails.day.branchKo),
        deuk_si: isSupporting(ilganKo, sajuRes.pillarDetails.hour.branchKo),
        deuk_se: [
          sajuRes.pillarDetails.year.stemKo, sajuRes.pillarDetails.year.branchKo,
          sajuRes.pillarDetails.month.stemKo, sajuRes.pillarDetails.hour.stemKo
        ].filter(c => isSupporting(ilganKo, c)).length >= 2
      };

      const calculateYongsin = () => {
        const mBr = sajuRes.pillarDetails.month.branchKo;
        let johu = "화";
        let johuNote = "조후 조율";
        if (['해', '자', '축'].includes(mBr)) { johu = "화"; johuNote = "한기 해소"; }
        else if (['사', '오', '미'].includes(mBr)) { johu = "수"; johuNote = "열기 식힘"; }
        else if (['인', '묘', '진'].includes(mBr)) { johu = "금"; johuNote = "성장 억제"; }
        else { johu = "목"; johuNote = "생기 보충"; }

        let eokbu = "토";
        let eokbuNote = "균형 조절";
        if (correctedStrength > 60) {
          // Strong -> Control/Drain
          if (ilganKo === '목') { eokbu = "금"; eokbuNote = "강한 목기 제어"; }
          else if (ilganKo === '화') { eokbu = "수"; eokbuNote = "넘치는 화기 억제"; }
          else if (ilganKo === '토') { eokbu = "목"; eokbuNote = "두터운 토기 소통"; }
          else if (ilganKo === '금') { eokbu = "화"; eokbuNote = "단단한 금기 제련"; }
          else { eokbu = "토"; eokbuNote = "강한 수기 제방"; }
        } else {
          // Weak -> Support
          if (ilganKo === '목') { eokbu = "수"; eokbuNote = "부족한 수기 보충"; }
          else if (ilganKo === '화') { eokbu = "목"; eokbuNote = "약한 화기 지원"; }
          else if (ilganKo === '토') { eokbu = "화"; eokbuNote = "차가운 토기 온난"; }
          else if (ilganKo === '금') { eokbu = "토"; eokbuNote = "약한 금기 생조"; }
          else { eokbu = "금"; eokbuNote = "약한 수기 근원"; }
        }
        return { johu, johuNote, eokbu, eokbuNote };
      };

      const yongsin = calculateYongsin();

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
        deuk,
        yongsin,
        johu_correction: aiReason,
        dominant: dominantKo,
        daeunCycles,
        currentDaeunIdx,
        relation: getElementRelation(dominantKo),
        ilganElement: getElementFromChar(sajuRes.pillarDetails.day.stemKo),
        elementCounts,
        sipsungCounts,
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
    // [[단어]] 및 [major]문장[/major] 태그를 더 유연하게 캡처
    const parts = para.split(/(\[\[.*?\]\]|\[major\].*?\[\/major\]|목\(木\)|화\(火\)|토\(土\)|금\(金\)|수\(水\))/g);
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
            // [[단어]] 태그 처리
            if (part.startsWith('[[') && part.endsWith(']]')) {
                const innerText = part.slice(2, -2).trim();
                return (
                    <strong key={j} style={{ 
                        color: "var(--accent-gold)", 
                        fontWeight: "900", 
                        fontSize: "1.05rem",
                        display: "inline",
                        background: isDarkBg ? "rgba(212,163,115,0.15)" : "rgba(42,54,95,0.05)",
                        padding: "0 2px",
                        borderRadius: "4px"
                    }}>
                        {innerText}
                    </strong>
                );
            }
            // [major]문장[/major] 태그 처리
            if (part.startsWith('[major]') && part.endsWith('[/major]')) {
                const innerText = part.slice(7, -8).trim();
                return (
                    <strong key={j} style={{ 
                        color: "var(--accent-gold)", 
                        fontWeight: "900", 
                        fontSize: "1.05rem", 
                        display: "inline",
                        borderBottom: isDarkBg ? "2px solid rgba(212,163,115,0.4)" : "2px solid rgba(212,163,115,0.2)",
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
      <WheelDatePicker isOpen={isDatePickerOpen} onClose={() => setIsDatePickerOpen(false)} initialDate={typeof date === 'string' ? date : "1991-01-13"} onConfirm={(y, m, d, lunar, leap) => { setDate(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`); setIsLunar(lunar); setIsLeap(leap); setIsDatePickerOpen(false); }} />
      
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
                    <div style={{ display: "flex", gap: "8px", marginBottom: "10px", background: "rgba(0,0,0,0.04)", padding: "4px", borderRadius: "14px" }}>
                      <button 
                        onClick={() => setDeliveryMethod("kakao")}
                        style={{ 
                          flex: 1, padding: "10px 0", borderRadius: "10px", border: "none", 
                          background: deliveryMethod === "kakao" ? "#FEE500" : "transparent", 
                          color: deliveryMethod === "kakao" ? "#3C1E1E" : "#999", 
                          fontWeight: "800", fontSize: "0.85rem", 
                          boxShadow: deliveryMethod === "kakao" ? "0 2px 10px rgba(254,229,0,0.3)" : "none", 
                          transition: "all 0.2s" 
                        }}
                      >
                        카카오톡으로 받기
                      </button>
                      <button 
                        onClick={() => setDeliveryMethod("email")}
                        style={{ 
                          flex: 1, padding: "10px 0", borderRadius: "10px", border: "none", 
                          background: deliveryMethod === "email" ? "white" : "transparent", 
                          color: deliveryMethod === "email" ? "var(--accent-indigo)" : "#999", 
                          fontWeight: "700", fontSize: "0.85rem", 
                          boxShadow: deliveryMethod === "email" ? "0 2px 8px rgba(0,0,0,0.1)" : "none", 
                          transition: "all 0.2s" 
                        }}
                      >
                        이메일로 받기
                      </button>
                    </div>

                    {deliveryMethod === "email" ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "4px" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--accent-indigo)", marginLeft: "4px" }}>결과를 받으실 이메일 (필수)</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <input 
                            type="text" 
                            value={emailId} 
                            onChange={(e) => setEmailId(e.target.value)} 
                            placeholder="아이디 입력"
                            style={{ 
                              flex: 3, padding: "12px 8px", borderRadius: "12px", background: "rgba(0,0,0,0.02)", 
                              border: "none", fontSize: "0.95rem", fontWeight: "600", outline: "none",
                              minWidth: "0" 
                            }} 
                          />
                          <span style={{ fontSize: "1rem", color: "#999", fontWeight: "600" }}>@</span>
                          <select 
                            value={emailDomain} 
                            onChange={(e) => setEmailDomain(e.target.value)}
                            style={{ 
                              flex: 2.5, padding: "12px 4px", borderRadius: "12px", background: "rgba(0,0,0,0.02)", 
                              border: "none", fontSize: "0.9rem", fontWeight: "600", outline: "none", cursor: "pointer",
                              appearance: "none", textAlign: "center", minWidth: "0"
                            }}
                          >
                            <option value="naver.com">naver.com</option>
                            <option value="daum.net">daum.net</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginBottom: "4px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--accent-indigo)", marginLeft: "4px" }}>알림톡 수신 번호 (필수)</span>
                          <input 
                            type="tel" 
                            value={phoneNumber} 
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, '');
                              if (val.length <= 11) setPhoneNumber(val);
                            }} 
                            placeholder="01012345678"
                            style={{ 
                              width: "100%", padding: "12px", borderRadius: "12px", background: "rgba(0,0,0,0.02)", 
                              border: "none", fontSize: "0.95rem", fontWeight: "600", outline: "none"
                            }} 
                          />
                          <p style={{ fontSize: '11px', color: '#999', margin: "2px 0 0 4px", lineHeight: "1.4" }}>
                            * 입력하신 번호로 사주풀이 결과가 카카오톡으로 발송됩니다.
                          </p>
                        </div>
                      </div>
                    )}
                    <div onClick={() => setIsDatePickerOpen(true)} className="glass-input" style={{ cursor: "pointer", padding: "12px", borderRadius: "12px", background: "rgba(0,0,0,0.02)", fontSize: "0.95rem", textAlign: "center", fontWeight: "600" }}>{date}</div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "rgba(0,0,0,0.02)", border: "none", fontSize: "0.95rem", fontWeight: "600", outline: "none", textAlign: "center" }} />
                      <div style={{ display: "flex", background: "rgba(0,0,0,0.04)", borderRadius: "12px", padding: "4px", gap: "4px" }}>
                        <button onClick={() => setIsLunar(false)} style={{ padding: "0 12px", borderRadius: "8px", border: "none", background: !isLunar ? "var(--accent-indigo)" : "transparent", fontWeight: "600", fontSize: "0.9rem", color: !isLunar ? "white" : "var(--text-secondary)", transition: "all 0.2s" }}>양력</button>
                        <button onClick={() => setIsLunar(true)} style={{ padding: "0 12px", borderRadius: "8px", border: "none", background: isLunar ? "var(--accent-indigo)" : "transparent", fontWeight: "600", fontSize: "0.9rem", color: isLunar ? "white" : "var(--text-secondary)", transition: "all 0.2s" }}>음력</button>
                        {isLunar && (
                          <button onClick={() => setIsLeap(!isLeap)} style={{ padding: "0 12px", borderRadius: "8px", border: "none", background: isLeap ? "var(--accent-indigo)" : "rgba(0,0,0,0.05)", fontWeight: "600", fontSize: "0.9rem", color: isLeap ? "white" : "#999", transition: "all 0.2s" }}>윤달</button>
                        )}
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
                <button 
                  onClick={() => setStep(1)} 
                  disabled={(deliveryMethod === "email" && !emailId) || (deliveryMethod === "kakao" && phoneNumber.length < 10)}
                  className="btn-primary" 
                  style={{ 
                    width: "100%", marginTop: "16px", padding: "14px", borderRadius: "16px", 
                    background: ((deliveryMethod === "email" && !emailId) || (deliveryMethod === "kakao" && phoneNumber.length < 10)) ? "#ccc" : "linear-gradient(135deg, var(--accent-indigo), #1A1C2C)", 
                    color: ((deliveryMethod === "email" && !emailId) || (deliveryMethod === "kakao" && phoneNumber.length < 10)) ? "#999" : "var(--accent-gold)", 
                    fontWeight: "700", fontSize: "1.05rem", border: "none", display: "flex", 
                    justifyContent: "center", alignItems: "center", gap: "8px", 
                    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                    cursor: ((deliveryMethod === "email" && !emailId) || (deliveryMethod === "kakao" && phoneNumber.length < 10)) ? "not-allowed" : "pointer"
                  }}
                >
                  심층 질문 시작하기 <ArrowRight size={18} />
                </button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
                  <div style={{ height: "4px", flex: 1, borderRadius: "2px", background: "var(--accent-gold)" }} />
                  <div style={{ height: "4px", flex: 1, borderRadius: "2px", background: "rgba(0,0,0,0.1)" }} />
                  <div style={{ height: "4px", flex: 1, borderRadius: "2px", background: "rgba(0,0,0,0.1)" }} />
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--accent-gold)", fontWeight: "700", marginBottom: "6px" }}>STEP 1 / 3</div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--accent-indigo)", marginBottom: "16px", lineHeight: "1.35", wordBreak: "keep-all" }}>
                  가장 정밀하게 풀이하고 싶은 영역을 선택해주세요.
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", width: "100%" }}>
                  {NEW_CATEGORIES.map((cat, i) => (
                    <motion.button 
                      key={i} 
                      whileHover={{ scale: 1.02, backgroundColor: "rgba(201, 160, 80, 0.05)" }} 
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setSelectedCategory(cat); setStep(1.5); }}
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

            {step === 1.5 && (
              <motion.div key="step1.5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
                  <div style={{ height: "4px", flex: 1, borderRadius: "2px", background: "var(--accent-gold)" }} />
                  <div style={{ height: "4px", flex: 1, borderRadius: "2px", background: "var(--accent-gold)" }} />
                  <div style={{ height: "4px", flex: 1, borderRadius: "2px", background: "rgba(0,0,0,0.1)" }} />
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--accent-gold)", fontWeight: "700", marginBottom: "6px" }}>STEP 2 / 3: 정보 확인</div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--accent-indigo)", marginBottom: "16px", lineHeight: "1.35", wordBreak: "keep-all" }}>
                  입력하신 정보가 맞는지<br/>확인해주세요.
                </h3>
                
                <div style={{ background: "white", padding: "20px", borderRadius: "20px", border: "1px solid var(--glass-border)", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f0f0f0", paddingBottom: "8px" }}>
                    <span style={{ fontSize: "0.85rem", color: "#999", fontWeight: "600" }}>생년월일</span>
                    <span style={{ fontSize: "0.95rem", color: "#333", fontWeight: "700" }}>{date} ({isLunar ? (isLeap ? "음력 윤달" : "음력") : "양력"})</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f0f0f0", paddingBottom: "8px" }}>
                    <span style={{ fontSize: "0.85rem", color: "#999", fontWeight: "600" }}>태어난 시간</span>
                    <span style={{ fontSize: "0.95rem", color: "#333", fontWeight: "700" }}>{time}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f0f0f0", paddingBottom: "8px" }}>
                    <span style={{ fontSize: "0.85rem", color: "#999", fontWeight: "600" }}>성별</span>
                    <span style={{ fontSize: "0.95rem", color: "#333", fontWeight: "700" }}>{gender === "M" ? "남성" : "여성"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f0f0f0", paddingBottom: "8px" }}>
                    <span style={{ fontSize: "0.85rem", color: "#999", fontWeight: "600" }}>태어난 도시</span>
                    <span style={{ fontSize: "0.95rem", color: "#333", fontWeight: "700" }}>{birthCity}</span>
                  </div>
                   <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.85rem", color: "#999", fontWeight: "600" }}>받으실 곳</span>
                    <span style={{ fontSize: "0.95rem", color: "var(--accent-indigo)", fontWeight: "700" }}>
                      {deliveryMethod === "email" ? userEmail : `${phoneNumber.slice(0,3)}-${phoneNumber.slice(3,7)}-${phoneNumber.slice(7)}`}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                  <button onClick={() => setStep(0)} style={{ flex: 1, padding: "14px", borderRadius: "16px", background: "#f8f9fa", color: "#666", fontWeight: "700", border: "1px solid #eee" }}>수정하기</button>
                  <button onClick={() => setStep(2)} style={{ flex: 2, padding: "14px", borderRadius: "16px", background: "linear-gradient(135deg, var(--accent-indigo), #1A1C2C)", color: "var(--accent-gold)", fontWeight: "800", border: "none" }}>네, 맞습니다</button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
                  <div style={{ height: "4px", flex: 1, borderRadius: "2px", background: "var(--accent-gold)" }} />
                  <div style={{ height: "4px", flex: 1, borderRadius: "2px", background: "var(--accent-gold)" }} />
                  <div style={{ height: "4px", flex: 1, borderRadius: "2px", background: "var(--accent-gold)" }} />
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--accent-gold)", fontWeight: "700", marginBottom: "6px" }}>STEP 3 / 3: {selectedCategory}</div>
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
                      date, time, isLunar, isLeap, birthCity, gender, 
                      selectedCategory, userQuestion, userEmail,
                      deliveryMethod, phoneNumber // Added
                    };
                    localStorage.setItem("premium_saju_data", JSON.stringify(paymentData));
                    // Also save profile for future use
                    localStorage.setItem("user_birth_profile", JSON.stringify({
                      date, time, isLunar, gender, birthCity, userEmail, phoneNumber
                    }));
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
                      <h2 style={{ fontSize: "1.5rem", color: "var(--accent-indigo)", fontWeight: "900", fontFamily: "'Nanum Myeongjo', serif" }}>귀하의 운명에 대한 심층 사주풀이</h2>
                    </div>

                    <SajuPillarTable 
                      data={detailedData.table} 
                      tenGods={detailedData.tenGods} 
                      stages12={detailedData.stages12} 
                      sals={detailedData.sals} 
                    />

                    <SinsalGrid data={detailedData.table} />

                    <MajorSinsalSummary 
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

                      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        {/* 1. Stargate Element Chart (Interactive Star) */}
                        <div style={{ padding: "10px 0" }}>
                          <div style={{ textAlign: "center", fontSize: "0.95rem", fontWeight: "900", color: "var(--accent-indigo)", marginBottom: "10px" }}>오행의 상생(生)과 상극(剋) 순환</div>
                          <StargateElementChart 
                            percentages={activeTab === 'base' ? detailedData.elements_ratio_base : detailedData.elements_ratio} 
                          />
                        </div>

                        {/* 2. Sipsung Donut Chart (Breakdown) */}
                        <SipsungDonutChart data={detailedData.sipsungCounts} />

                        {/* 3. Strength and Yongsin Analysis */}
                        <StrengthIndexGraph score={detailedData.strength_corrected} deuk={detailedData.deuk} />
                        <YongsinDisplay yongsin={detailedData.yongsin} />

                        {/* 4. Bar Chart (Strength Comparison) */}
                        <div style={{ background: "white", padding: "20px", borderRadius: "30px", boxShadow: "0 10px 40px rgba(0,0,0,0.04)" }}>
                          <div style={{ textAlign: "center", fontSize: "0.95rem", fontWeight: "900", color: "#333", marginBottom: "20px" }}>오행 강약 분석</div>
                          <ElementBarChart 
                            data={activeTab === 'base' ? detailedData.elements_ratio_base : detailedData.elements_ratio} 
                            strength={activeTab === 'base' ? detailedData.strength_base : detailedData.strength_corrected}
                          />
                        </div>

                        {/* 5. Correction Note */}
                        {activeTab === 'corrected' && (
                          <div style={{ padding: "16px", background: "rgba(201,160,80,0.05)", borderRadius: "16px", fontSize: "0.85rem", color: "#666", lineHeight: "1.7", border: "1px solid rgba(201,160,80,0.1)", position: "relative", marginTop: "10px" }}>
                            <div style={{ position: "absolute", top: "-10px", left: "20px", background: "var(--accent-gold)", color: "white", padding: "2px 10px", borderRadius: "10px", fontSize: "0.7rem", fontWeight: "800" }}>전문가 보정 의견</div>
                            <p style={{ margin: 0, wordBreak: "keep-all" }}>
                              {detailedData.johu_correction}
                            </p>
                          </div>
                        )}
                      </div>
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
                            <div style={{ fontSize: "1rem", lineHeight: "1.9", color: "rgba(255,255,255,0.9)", wordBreak: "keep-all", textAlign: "left" }}>
                              {renderHighlightedText(reading.analysis?.life_shape, true)}
                            </div>
                          </section>

                          <section>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                              <div style={{ width: "4px", height: "16px", background: "var(--accent-gold)", borderRadius: "2px" }} />
                              <h4 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--accent-gold)", margin: 0 }}>고민에 대한 해답</h4>
                            </div>
                            <div style={{ fontSize: "1rem", lineHeight: "1.9", color: "rgba(255,255,255,0.9)", wordBreak: "keep-all", textAlign: "left" }}>
                              {renderHighlightedText(reading.analysis?.solution, true)}
                            </div>
                          </section>

                          <section>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                              <div style={{ width: "4px", height: "16px", background: "var(--accent-gold)", borderRadius: "2px" }} />
                              <h4 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--accent-gold)", margin: 0 }}>핵심 성패 시기</h4>
                            </div>
                            <div style={{ fontSize: "1rem", lineHeight: "1.9", color: "rgba(255,255,255,0.9)", wordBreak: "keep-all", textAlign: "left" }}>
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

                    <div className="no-print" style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "32px", padding: "20px 0", borderTop: "1px solid var(--glass-border)" }}>
                      <Link href="/premium-saju" style={{ flex: 1, textDecoration: "none", minWidth: "200px" }}>
                        <button style={{ width: "100%", padding: "16px", borderRadius: "16px", background: "linear-gradient(135deg, var(--accent-indigo), #1A1C2C)", color: "var(--accent-gold)", fontWeight: "800", fontSize: "1rem", border: "1px solid var(--accent-gold)", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", cursor: "pointer", boxShadow: "0 8px 25px rgba(0,0,0,0.2)" }}>
                          명리 대가의 다른 조언 더 듣기 ➔
                        </button>
                      </Link>
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
