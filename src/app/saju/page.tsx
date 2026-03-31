"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowUp, BookOpen, Clock, CalendarDays, Sparkles, MapPin, Coins, Heart, Briefcase, Activity, User, Star, Scroll, Copy, Check } from "lucide-react";
import { getUnifiedSaju } from "@/lib/unified-saju";
import TraditionalBackground from "@/components/TraditionalBackground";
import Disclaimer from "@/components/Disclaimer";
import WheelDatePicker from "@/components/WheelDatePicker";
import PremiumPromo from "@/components/PremiumPromo";
import FakeReviews from "@/components/FakeReviews";
import { SAJU_DICTIONARY } from "@/lib/premium-saju-utils";

// Global Helpers
const stemsHanja: Record<string, string> = { "갑": "甲", "을": "乙", "병": "丙", "정": "丁", "무": "戊", "기": "己", "경": "庚", "신": "辛", "임": "壬", "계": "癸" };
const branchesHanja: Record<string, string> = { "자": "子", "축": "丑", "인": "寅", "묘": "卯", "진": "辰", "사": "巳", "오": "午", "미": "未", "신": "申", "유": "酉", "술": "戌", "해": "亥" };

const getElementColor = (char: string) => {
  if (!char) return 'var(--text-primary)';
  const c = char.toLowerCase();
  if (['목', '甲', '乙', '寅', '묘', '卯', 'wood'].some(v => c.includes(v))) return '#81b29a'; // green
  if (['화', '丙', '정', '丁', '사', '巳', '오', '午', 'fire'].some(v => c.includes(v))) return '#e07a5f'; // red
  if (['토', '무', '기', '戊', '己', '진', '술', '축', '미', '辰', '戌', '축', '미', 'earth'].some(v => c.includes(v))) return '#D4A373'; // brown
  if (['금', '경', '신', '庚', '辛', '申', '유', '酉', 'metal'].some(v => c.includes(v))) return '#FFD700'; // yellow
  if (['수', '임', '계', '壬', '癸', '해', '자', '亥', '子', 'water'].some(v => c.includes(v))) return '#3d5a80'; // blue
  return 'var(--text-primary)';
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
    const [show, setShow] = useState(false);
    const description = SAJU_DICTIONARY[term] || SAJU_DICTIONARY[term.replace(/Yang|Eum/g, '')] || "";
  
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
  
  // 프리미엄 8단 명식표
  const SajuPillarTable = ({ data, tenGods, stages12, sals }: { data: any, tenGods: any, stages12: any, sals: any }) => {
    if (!data) return null;
  
    const pillars = [
      { 
        label: "생시", 
        data: data.hour, 
        stage: data.hour.stage12 || stages12?.hour || "-", 
        topTen: data.hour.stemTenGod || data.hour.tenGodStem || tenGods?.hour?.stem || "-",
        bottomTen: data.hour.branchTenGod || data.hour.tenGodBranch || tenGods?.hour?.branch || "-",
        hidden: data.hour.hiddenText || data.hour.hidden || "-",
        stemSals: sals?.hour?.stem || [],
        branchSals: sals?.hour?.branch || []
      },
      { 
        label: "생일", 
        data: data.day, 
        stage: data.day.stage12 || stages12?.day || "-", 
        topTen: "비견", 
        bottomTen: data.day.branchTenGod || data.day.tenGodBranch || tenGods?.day?.branch || "-",
        hidden: data.day.hiddenText || data.day.hidden || "-",
        stemSals: sals?.day?.stem || [],
        branchSals: sals?.day?.branch || []
      },
      { 
        label: "생월", 
        data: data.month, 
        stage: data.month.stage12 || stages12?.month || "-", 
        topTen: data.month.stemTenGod || data.month.tenGodStem || tenGods?.month?.stem || "-",
        bottomTen: data.month.branchTenGod || data.month.tenGodBranch || tenGods?.month?.branch || "-",
        hidden: data.month.hiddenText || data.month.hidden || "-",
        stemSals: sals?.month?.stem || [],
        branchSals: sals?.month?.branch || []
      },
      { 
        label: "생년", 
        data: data.year, 
        stage: data.year.stage12 || stages12?.year || "-", 
        topTen: data.year.stemTenGod || data.year.tenGodStem || tenGods?.year?.stem || "-",
        bottomTen: data.year.branchTenGod || data.year.tenGodBranch || tenGods?.year?.branch || "-",
        hidden: data.year.hiddenText || data.year.hidden || "-",
        stemSals: sals?.year?.stem || [],
        branchSals: sals?.year?.branch || []
      }
    ];
  
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
  
  return text
    .replace(/\*\*/g, '')
    .replace(/\(\s*\)/g, '')         // 빈 괄호 제거
    .replace(/\b(Metal|Wood|Water|Fire|Earth)\b/g, (match) => {
      const elementMap: Record<string, string> = {
        'Metal': '금(金)', 'Wood': '목(木)', 'Water': '수(水)', 'Fire': '화(火)', 'Earth': '토(土)'
      };
      return elementMap[match] || match;
    })
    .replace(/(목|화|토|금|수|갑|을|병|정|무|기|경|신|임|계|자|축|인|묘|진|사|오|미|신|유|술|해)((?:\s*[\(（]?\s*[木火土金수甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]\s*[\)）\]]?)+)?/g, (match, kr, extras) => {
      const elements = ['목', '화', '토', '금', '수'];
      const map: Record<string, string> = { '목': '木', '화': '火', '토': '土', '금': '金', '수': '水' };
      if (!extras) return match;
      if (elements.includes(kr)) return `${kr}(${map[kr]})`;
      return kr;
    });
};

const DaeunTable = ({ cycles, currentIndex }: { cycles: any[], currentIndex?: number }) => {
    if (!cycles || cycles.length === 0) return null;
    return (
      <div style={{ background: "white", border: "1.5px solid #3d5a801a", borderRadius: "20px", padding: "16px 10px", width: "100%", marginTop: "24px", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
        <div style={{ textAlign: "center", marginBottom: "12px" }}>
            <h3 style={{ fontSize: "0.85rem", fontWeight: "900", color: "#333", margin: 0 }}>나의 대운표 (10년 주기 운세)</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cycles.length}, 1fr)`, border: "1px solid #eee", borderRadius: "12px", overflow: "hidden" }}>
          {cycles.map((c, i) => (
            <div key={`y-${i}`} style={{ padding: "8px 0", background: i === currentIndex ? "var(--accent-indigo)" : "#f8f9fa", color: i === currentIndex ? "white" : "#999", borderBottom: "1px solid #eee", borderLeft: i > 0 ? "1px solid #eee" : "none", fontSize: "0.6rem", fontWeight: "900", textAlign: "center" }}>{c.year || ''}</div>
          ))}
          {cycles.map((c, i) => (
            <div key={`a-${i}`} style={{ padding: "8px 0", background: i === currentIndex ? "rgba(42,54,95,0.05)" : "white", borderLeft: i > 0 ? "1px solid #eee" : "none", fontSize: "0.75rem", fontWeight: "800", textAlign: "center", borderBottom: "1px solid #eee", whiteSpace: "nowrap", color: i === currentIndex ? "var(--accent-indigo)" : "#666" }}>{c.startAge}세</div>
          ))}
          {cycles.map((c, i) => {
            const gz = c.ganzhi || "";
            return (
              <div key={`g-${i}`} style={{ padding: "10px 0", background: i === currentIndex ? "rgba(212, 163, 115, 0.08)" : "white", borderLeft: i > 0 ? "1px solid #eee" : "none", textAlign: "center", position: "relative" }}>
                {i === currentIndex && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "var(--accent-gold)" }} />}
                <div style={{ fontSize: "1rem", fontWeight: "900", color: gz[0] ? getElementColor(gz[0]) : "#ccc" }}>{gz[0] ? (stemsHanja[gz[0]] || gz[0]) : "-"}</div>
                <div style={{ fontSize: "1rem", fontWeight: "900", color: gz[1] ? getElementColor(gz[1]) : "#ccc" }}>{gz[1] ? (branchesHanja[gz[1]] || gz[1]) : "-"}</div>
                <div style={{ fontSize: "0.6rem", color: "#999", marginTop: "2px", fontWeight: "700" }}>{gz}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
};

function FiveElementsDonut({ elements }: { elements: any[] }) {
  const total = elements.reduce((sum, el) => sum + el.value, 0) || 1;
  let currentOffset = 0;

  return (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "24px", width: "100%", marginBottom: "32px", padding: "0 8px" }}>
      <div style={{ flex: "0 0 45%", position: "relative", maxWidth: "160px", aspectRatio: "1/1" }}>
        <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}>
          {elements.map((el, i) => {
            if (el.value === 0) return null;
            const strokeDasharray = `${(el.value / total) * 251.2} 251.2`;
            const strokeDashoffset = -currentOffset;
            currentOffset += (el.value / total) * 251.2;
            return (
              <motion.circle key={i} cx="50" cy="50" r="40" fill="transparent" stroke={el.color} strokeWidth="12" initial={{ strokeDasharray: "0 251.2" }} animate={{ strokeDasharray }} strokeDashoffset={strokeDashoffset} transition={{ duration: 1.5, ease: "easeOut" }} />
            );
          })}
        </svg>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", width: "100%" }}>
          <div style={{ fontSize: "0.6rem", color: "var(--text-secondary)" }}>나의 기운</div>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--accent-gold)" }}>오행</motion.div>
        </div>
      </div>
      <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "8px" }}>
        {elements.map((el, i) => (
          <motion.div key={i} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.02)", padding: "6px 10px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: el.color }}></div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-primary)", fontWeight: "500" }}>{el.label}</span>
            </div>
            <span style={{ fontSize: "0.75rem", color: el.color, fontWeight: "bold" }}>{Math.round(el.value)}%</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function AnimatedGauge({ label, value, color, icon }: { label: string, value: number, color: string, icon: any }) {
  return (
    <div style={{ textAlign: "center", padding: "16px", background: "rgba(0,0,0,0.02)", borderRadius: "16px", overflow: "hidden" }}>
      <div style={{ color, marginBottom: "8px", display: "flex", justifyContent: "center" }}>{icon}</div>
      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontSize: "1.2rem", fontWeight: "bold", color, position: "relative", height: "1.5rem" }}>
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{Math.round(value)}%</motion.span>
      </div>
      <div style={{ width: "100%", height: "4px", background: "rgba(0,0,0,0.05)", borderRadius: "2px", marginTop: "8px" }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1, ease: "easeOut" }} style={{ height: "100%", background: color, borderRadius: "2px" }} />
      </div>
    </div>
  );
}

const renderHighlightedText = (input: any) => {
  if (!input) return null;
  
  let text = "";
  if (typeof input === 'string') {
      text = input;
  } else if (typeof input === 'object' && input !== null) {
      text = Object.entries(input)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n\n');
  } else {
      text = String(input);
  }

  return text.split('\n\n').map((para, i) => {
    if (!para.trim()) return null;
    const isHeader = /^[\d\s]*[📍📅🔍💡🎯🏆💎✨]/.test(para.trim());
    return (
      <div key={i} style={{ 
        marginBottom: isHeader ? "12px" : "8px", 
        marginTop: isHeader && i > 0 ? "16px" : "0",
        lineHeight: "1.6", fontSize: isHeader ? "1.05rem" : "0.92rem", fontWeight: isHeader ? "600" : "400",
        color: isHeader ? "var(--accent-indigo)" : "var(--text-secondary)", background: isHeader ? "transparent" : "rgba(255, 255, 255, 0.4)",
        padding: isHeader ? "0" : "10px 14px", borderRadius: "14px", border: isHeader ? "none" : "1px solid rgba(42, 54, 95, 0.04)", wordBreak: "keep-all"
      }}>
        {para}
      </div>
    );
  });
};

function SajuContent() {
  const [date, setDate] = useState("1991-01-13");
  const [time, setTime] = useState("03:10");
  const [isLunar, setIsLunar] = useState(false);
  const [gender, setGender] = useState("M");
  const [birthCity, setBirthCity] = useState("서울");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [bazi, setBazi] = useState<any>(null);
  const [reading, setReading] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [wisdomIdx, setWisdomIdx] = useState(0);
  const wisdomQuotes = ["하늘의 기운을 살피고 있습니다...", "당신만의 특별한 운명의 명식을 분석 중입니다...", "어제와 오늘, 내일의 흐름을 읽고 있습니다...", "명식의 기운을 정성껏 정리 중입니다...", "거의 다 되었습니다. 잠시만 기다려주세요..."];
  const resultRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const cityDataMap: Record<string, any> = { 
    "서울": { longitude: 127.0, lmtOffset: -32 }, 
    "인천": { longitude: 126.7, lmtOffset: -33 }, 
    "대구": { longitude: 128.6, lmtOffset: -26 }, 
    "부산": { longitude: 129.0, lmtOffset: -24 }, 
    "광주": { longitude: 126.9, lmtOffset: -32 }, 
    "대전": { longitude: 127.4, lmtOffset: -30 }, 
    "울산": { longitude: 129.3, lmtOffset: -23 }, 
    "기타": { longitude: 127.5, lmtOffset: -30 } 
  };

  const handleDevReset = () => { localStorage.clear(); window.location.reload(); };

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const saved = localStorage.getItem("user_birth_profile");
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p.date) setDate(p.date);
        if (p.time) setTime(p.time);
        if (p.isLunar !== undefined) setIsLunar(p.isLunar);
        if (p.gender) setGender(p.gender);
        if (p.birthCity) setBirthCity(p.birthCity);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (isLoading) {
      const pInt = setInterval(() => setLoadingProgress(prev => prev >= 99 ? 99 : prev + (Math.random() > 0.8 ? 2 : 1)), 150);
      const wInt = setInterval(() => setWisdomIdx(prev => (prev + 1) % wisdomQuotes.length), 3500);
      return () => { clearInterval(pInt); clearInterval(wInt); };
    }
  }, [isLoading]);

  const calculateBazi = async () => {
    setIsLoading(true); setBazi(null); setReading(null);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);

    try {
        const sajuRes = getUnifiedSaju({ date, time, isLunar, gender, birthCity });
        if (!sajuRes) throw new Error("사주 산출 실패");

        const HANJA_TO_KR: Record<string, string> = { '甲':'갑','乙':'을','丙':'병','丁':'정','戊':'무','己':'기','庚':'경','辛':'신','壬':'임','癸':'계','子':'자','丑':'축','寅':'인','卯':'묘','辰':'진','巳':'사','午':'오','미':'미','申':'신','酉':'유','戌':'술','亥':'해' };
        const toKr = (s: string) => s.split('').map(c => HANJA_TO_KR[c] ?? c).join('');

        const baziData = {
          year: toKr(sajuRes.pillarDetails.year.stem + sajuRes.pillarDetails.year.branch),
          month: toKr(sajuRes.pillarDetails.month.stem + sajuRes.pillarDetails.month.branch),
          day: toKr(sajuRes.pillarDetails.day.stem + sajuRes.pillarDetails.day.branch),
          time: toKr(sajuRes.pillarDetails.hour.stem + sajuRes.pillarDetails.hour.branch)
        };

        const pillarSummary = `${baziData.year}(${sajuRes.pillarDetails.year.stem}${sajuRes.pillarDetails.year.branch})년 ` +
                             `${baziData.month}(${sajuRes.pillarDetails.month.stem}${sajuRes.pillarDetails.month.branch})월 ` +
                             `${baziData.day}(${sajuRes.pillarDetails.day.stem}${sajuRes.pillarDetails.day.branch})일 ` +
                             `${baziData.time}(${sajuRes.pillarDetails.hour.stem}${sajuRes.pillarDetails.hour.branch})시`;

        const [y] = date.split('-').map(Number);
        const age = 2026 - y + 1;

        // Cache Check
        const cacheKey = `saju_cache_v13_${date}_${time}_${isLunar}_${gender}_${birthCity}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            const now = Date.now();
            const sixMonths = 6 * 30 * 24 * 60 * 60 * 1000;
            if (now - parsed.timestamp < sixMonths) {
              setBazi(baziData);
              setReading(parsed.data);
              setIsLoading(false);
              return;
            }
          } catch (e) {
            localStorage.removeItem(cacheKey);
          }
        }

        const payload = {
          systemPrompt: `전통 사주 전문가로서 ${age}세 사용자인 '귀하'의 인생 전체를 관통하는 명리학적 풀이를 제공하세요.
당신은 '청아매당'의 최고 권위자입니다. 귀하의 명식을 살펴 인생의 큰 흐름을 날카롭고 깊이 있게 분석하십시오.

[사용자 사주 명식 요약 (최우선 참조 데이터)]
- 명식: ${pillarSummary} (이 데이터는 정밀 천문 계산 결과이므로, 연도 기반의 일반적 추측보다 이 명식을 절대적으로 우선하여 분석하십시오.)
- 성별: ${gender === 'M' ? '남성' : '여성'}
- 현재 나이: ${age}세

[JSON 구조 및 세부 지침]
다음의 키를 가진 JSON 객체로만 응답하십시오:
- "general": 전체적인 인생의 격국과 그릇 분석 (1000자 내외)
- "early": 초년운 (0세 ~ 19세): 성장 배경, 유아기 분석 (600자 내외)
- "adolescence": 청소년운 (13세 ~ 18세): 감수성과 자아 형성 (600자 내외)
- "youth": 청년운 (19세 ~ 39세): 사회 진출, 초기 사회 활동기 (600자 내외)
- "middle": 중년운 (40세 ~ 54세): 인생의 전성기, 성취와 안정 (600자 내외)
- "mature": 장년운 (55세 ~ 69세): 제2의 도약, 삶의 결실 (600자 내외)
- "late": 말년운 (70세 이후): 인생의 마무리와 평온함 (600자 내외)
- "general_summary": 전체 운세 3문장 요약
- "general_keyword": 상징적 키워드
- "daeun": 현재 대운의 의미 분석
- "sinsal": 핵심 신살의 영향
- "gaewun": 구체적인 개운 비책
- "life_balance": { "wealth": 0~100점, "love": 0~100점, "career": 0~100점, "health": 0~100점 } (명리학적 근거에 기반한 실시간 점수 산출)

[중요 지침]
1. 모든 문단 끝에는 문단 나누기(\\n\\n)를 반드시 사용하십시오.
2. 팩트 중심의 엄격하고 권위 있는 말투를 유지하십시오.
4. 분석 시 제공된 한자 명식(${pillarSummary})을 바탕으로 일간(Daily Master)과 격국을 정확히 판별하십시오. 1991년생이라도 입춘 전이라면 '말띠(경오년)'일 수 있으며, 반드시 제공된 명식 텍스트를 기준으로 하십시오.`,
          sajuJson: { ...sajuRes, age, pillarSummary },
          expectedKeys: ["general", "early", "adolescence", "youth", "middle", "mature", "late", "general_summary", "general_keyword", "daeun", "sinsal", "gaewun", "life_balance"]
        };

        const apiRes = await fetch("/api/saju", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!apiRes.ok) throw new Error("API 요청 실패");
        const llmRes = cleanAstrologyTerms(await apiRes.json());

        const parseScore = (val: any) => {
          if (typeof val === 'number') return val;
          if (typeof val === 'string') {
            const n = parseInt(val.replace(/[^0-9]/g, ''));
            return isNaN(n) ? 50 : n;
          }
          return 50;
        };

        const lb = llmRes.life_balance || {};
        const safeLB = {
          wealth: parseScore(lb.wealth),
          love: parseScore(lb.love),
          career: parseScore(lb.career),
          health: parseScore(lb.health)
        };

        const readingData = {
          ...llmRes,
          life_balance: safeLB,
          elements: [
            { label: "목", value: (sajuRes.basePercentages.wood), color: "#81b29a" },
            { label: "화", value: (sajuRes.basePercentages.fire), color: "#e07a5f" },
            { label: "토", value: (sajuRes.basePercentages.earth), color: "#f2cc8f" },
            { label: "금", value: (sajuRes.basePercentages.metal), color: "#FFD700" },
            { label: "수", value: (sajuRes.basePercentages.water), color: "#3d5a80" }
          ],
          sections: [
            { id: "general", t: "인생 총운", d: { content: llmRes.general, summary: llmRes.general_summary, keyword: llmRes.general_keyword, gaewun: llmRes.gaewun?.general || {} }, c: "var(--accent-gold)" },
            { id: "early", t: "초년운 (0~19세)", d: { content: llmRes.early, gaewun: llmRes.gaewun?.early || {} }, c: "#81b29a" },
            { id: "adolescence", t: "청소년운 (13~18세)", d: { content: llmRes.adolescence, gaewun: llmRes.gaewun?.adolescence || {} }, c: "#A8DADC" },
            { id: "youth", t: "청년운 (19~39세)", d: { content: llmRes.youth, gaewun: llmRes.gaewun?.youth || {} }, c: "#e07a5f" },
            { id: "middle", t: "중년운 (40~54세)", d: { content: llmRes.middle, gaewun: llmRes.gaewun?.middle || {} }, c: "#f2cc8f" },
            { id: "mature", t: "장년운 (55~69세)", d: { content: llmRes.mature, gaewun: llmRes.gaewun?.mature || {} }, c: "#C9A050" },
            { id: "late", t: "말년운 (70세~)", d: { content: llmRes.late, gaewun: llmRes.gaewun?.late || {} }, c: "#3d5a80" }
          ],
          daeun: llmRes.daeun, 
          sinsal: llmRes.sinsal,
          daeunCycles: sajuRes.daeun.list,
          currentDaeunIdx: sajuRes.daeun.list.findIndex((c: any, i: number, arr: any[]) => {
            const nextStart = arr[i+1]?.startAge || 999;
            return age >= c.startAge && age < nextStart;
          }),
          raw: sajuRes
        };

        setBazi(baziData);
        setReading(readingData);
        localStorage.setItem(cacheKey, JSON.stringify({ data: readingData, timestamp: Date.now() }));
        setIsLoading(false);
    } catch (e: any) { alert(e.message); setIsLoading(false); }
  };

  const CopyButton = ({ bazi, reading }: any) => {
    const handleCopy = () => {
      let txt = `[전통 사주 리포트]\n\n사주: ${bazi.year} ${bazi.month} ${bazi.day} ${bazi.time}\n\n`;
      reading.sections.forEach((s: any) => txt += `● ${s.t}\n${s.d.content}\n\n`);
      navigator.clipboard.writeText(txt);
      alert("복사 완료");
    };
    return <button onClick={handleCopy} style={{ width: "100%", padding: "16px", background: "var(--accent-indigo)", color: "white", borderRadius: "14px", border: "none", cursor: "pointer", marginTop: "20px" }}>결과 복사하기</button>;
  };

  return (
    <main ref={topRef} style={{ width: "100%", minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Disclaimer />
      <TraditionalBackground />
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "10px 8px", background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(20px)", minHeight: "100vh", boxShadow: "0 0 60px rgba(0,0,0,0.05)" }}>
        
        <Link href="/" style={{ textDecoration: "none", display: "inline-block", marginBottom: "8px" }}>
          <button style={{ background: "rgba(42, 54, 95, 0.05)", border: "none", color: "var(--accent-indigo)", cursor: "pointer", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ArrowLeft size={18} />
          </button>
        </Link>

        <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "inline-block", background: "var(--accent-cherry)", color: "var(--accent-indigo)", padding: "1px 6px", borderRadius: "8px", fontSize: "0.45rem", fontWeight: "700", marginBottom: "4px" }}>CHEONG-A MAE-DANG</motion.div>
            <h1 onClick={handleDevReset} style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--accent-indigo)" }}>전통 사주</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>전통의 지혜로 운명을 비춥니다.</p>
        </div>

        {!isLoading && !bazi && (
          <section style={{ padding: "0 8px" }}>
            <h2 style={{ fontSize: "0.9rem", marginBottom: "16px", borderBottom: "1px solid var(--glass-border)", paddingBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
              <CalendarDays className="w-4 h-4" /> 나의 사주 정보
            </h2>
            <div style={{ display: "grid", gap: "12px" }}>
              <div onClick={() => setIsDatePickerOpen(true)} style={{ cursor: "pointer", padding: "12px", borderRadius: "10px", background: "rgba(0,0,0,0.03)", fontSize: "0.9rem" }}>{date}</div>
              <div style={{ display: "flex", gap: "8px" }}>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ flex: 1, padding: "12px", borderRadius: "10px", background: "rgba(0,0,0,0.03)", border: "none", fontSize: "0.9rem" }} />
                <div style={{ display: "flex", background: "rgba(0,0,0,0.05)", borderRadius: "10px", padding: "3px" }}>
                  <button onClick={() => setIsLunar(false)} style={{ padding: "5px 10px", borderRadius: "7px", border: "none", background: !isLunar ? "white" : "transparent", fontSize: "0.8rem" }}>양력</button>
                  <button onClick={() => setIsLunar(true)} style={{ padding: "5px 10px", borderRadius: "7px", border: "none", background: isLunar ? "white" : "transparent", fontSize: "0.8rem" }}>음력</button>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <select value={birthCity} onChange={(e) => setBirthCity(e.target.value)} style={{ flex: 1, padding: "12px", borderRadius: "10px", background: "rgba(0,0,0,0.03)", border: "none", fontSize: "0.9rem" }}>
                    {Object.keys(cityDataMap).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div style={{ display: "flex", background: "rgba(0,0,0,0.05)", borderRadius: "10px", padding: "3px" }}>
                    <button onClick={() => setGender("M")} style={{ padding: "5px 10px", borderRadius: "7px", border: "none", background: gender === "M" ? "white" : "transparent", fontSize: "0.8rem" }}>남</button>
                    <button onClick={() => setGender("F")} style={{ padding: "5px 10px", borderRadius: "7px", border: "none", background: gender === "F" ? "white" : "transparent", fontSize: "0.8rem" }}>여</button>
                  </div>
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", paddingLeft: "4px" }}>
                  태어난 지역에 따라 정밀한 시간 보정이 이루어집니다.
                </div>
              </div>
            </div>
            <button onClick={calculateBazi} style={{ width: "100%", marginTop: "24px", padding: "16px", borderRadius: "16px", background: "var(--accent-indigo)", color: "white", border: "none", fontSize: "1rem", fontWeight: "600", cursor: "pointer" }}>나의 운세 확인하기</button>
          </section>
        )}

        <AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ textAlign: "center", padding: "60px 24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "350px" }}>
              <div style={{ position: "relative", width: "120px", height: "120px", marginBottom: "32px" }}>
                <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}>
                  <circle cx="50" cy="50" r="42" fill="transparent" stroke="rgba(42, 54, 95, 0.06)" strokeWidth="6" />
                  <motion.circle 
                    cx="50" cy="50" r="42" 
                    fill="transparent" 
                    stroke="var(--accent-indigo)" 
                    strokeWidth="6" 
                    strokeDasharray="263.9"
                    animate={{ strokeDashoffset: 263.9 - (263.9 * loadingProgress) / 100 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                </svg>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                  <span style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--accent-indigo)", letterSpacing: "-0.03em" }}>{Math.round(loadingProgress)}%</span>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.p 
                  key={wisdomIdx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.5 }}
                  style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6", margin: 0, maxWidth: "280px" }}
                >
                  {wisdomQuotes[wisdomIdx]}
                </motion.p>
              </AnimatePresence>

              <div style={{ marginTop: "24px", fontSize: "0.75rem", color: "var(--text-secondary)", opacity: 0.7, fontWeight: "500" }}>
                분석 완료까지 1~2분 정도 소요될 수 있습니다.
              </div>
            </motion.div>
          )}
          {bazi && reading && (
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} ref={resultRef}>
              <SajuPillarTable 
                data={reading.raw.pillarDetails} 
                tenGods={reading.raw.tenGods} 
                stages12={reading.raw.stages12} 
                sals={reading.raw.sals} 
              />

              <div style={{ padding: "12px 14px", background: "white", borderRadius: "20px", border: "1px solid #eee", marginBottom: "24px" }}>
                <h3 style={{ textAlign: "center", marginBottom: "16px", fontSize: "0.9rem" }}>오행의 조화</h3>
                <FiveElementsDonut elements={reading.elements} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <AnimatedGauge label="재물복" value={reading.life_balance.wealth} color="#C9A050" icon={<Coins size={16} />} />
                    <AnimatedGauge label="애정운" value={reading.life_balance.love} color="#e07a5f" icon={<Heart size={16} />} />
                    <AnimatedGauge label="사회운" value={reading.life_balance.career} color="var(--accent-gold)" icon={<Briefcase size={16} />} />
                    <AnimatedGauge label="건강운" value={reading.life_balance.health} color="#81b29a" icon={<Activity size={16} />} />
                </div>
              </div>

              <DaeunTable cycles={reading.daeunCycles} currentIndex={reading.currentDaeunIdx} />

              <div style={{ display: "flex", flexDirection: "column", gap: "40px", marginTop: "40px" }}>
                {reading.sections.map((sec: any) => (
                  <motion.div key={sec.id} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once: true }}>
                    <h3 style={{ color: sec.c, fontSize: "1.2rem", marginBottom: "12px", borderLeft: `4px solid ${sec.c}`, paddingLeft: "12px" }}>{sec.t}</h3>
                    <div style={{ background: "rgba(255,255,255,0.5)", padding: "20px", borderRadius: "16px", border: "1px solid #eee", lineHeight: "1.8" }}>
                      {renderHighlightedText(sec.d.content)}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div style={{ marginTop: "40px", padding: "24px", background: "white", borderRadius: "24px", border: "1px solid #eee" }}>
                <h3 style={{ marginBottom: "20px" }}>대운과 신살</h3>
                <div style={{ color: "var(--text-secondary)", lineHeight: "1.8" }}>
                    {renderHighlightedText(reading.daeun)}
                    <div style={{ height: "20px" }} />
                    {renderHighlightedText(reading.sinsal)}
                </div>
              </div>

              <CopyButton bazi={bazi} reading={reading} />
              
              <FakeReviews />
              <PremiumPromo />
              
              <Link href="/"><button style={{ width: "100%", padding: "16px", background: "white", color: "var(--accent-indigo)", borderRadius: "14px", border: "1px solid #ddd", marginTop: "12px", cursor: "pointer", fontWeight: "600" }}>홈으로</button></Link>
              <button 
                onClick={scrollToTop} 
                style={{ width: "100%", padding: "16px", background: "rgba(42, 54, 95, 0.05)", color: "var(--accent-indigo)", borderRadius: "14px", border: "none", marginTop: "12px", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                <ArrowUp size={18} /> 맨위로
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <WheelDatePicker isOpen={isDatePickerOpen} onClose={() => setIsDatePickerOpen(false)} initialDate={date} onConfirm={(y,m,d) => setDate(`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`)} />
    </main>
  );
}

export default function SajuPage() {
  return <Suspense fallback={<div>Loading...</div>}><SajuContent /></Suspense>;
}
