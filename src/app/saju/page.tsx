"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowUp, BookOpen, Clock, CalendarDays, Sparkles, MapPin, Coins, Heart, Briefcase, Activity, User, Star, Scroll, Copy, Check } from "lucide-react";
import { getUnifiedSaju } from "@/lib/unified-saju";
import TraditionalBackground from "@/components/TraditionalBackground";
import Disclaimer from "@/components/Disclaimer";
import WheelDatePicker from "@/components/WheelDatePicker";
import PremiumPromo from "@/components/PremiumPromo";

// Global Helpers
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
  } else if (typeof input === 'object') {
    if (input.summary || input.details) {
      text = (input.summary || "") + (input.summary && input.details ? "\n\n" : "") + (input.details || "");
    } else {
      text = JSON.stringify(input);
    }
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

const renderInlineHighlights = (text: string) => {
  if (!text || typeof text !== 'string') return text;
  return text.replace(/\*\*/g, '').replace(/<b>/g, '').replace(/<\/b>/g, '');
};

export default function SajuPage() {
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

        const HANJA_TO_KR: Record<string, string> = { '甲':'갑','乙':'을','丙':'병','丁':'정','戊':'무','己':'기','庚':'경','辛':'신','壬':'임','癸':'계','子':'자','丑':'축','寅':'인','卯':'묘','辰':'진','巳':'사','午':'오','未':'미','申':'신','酉':'유','戌':'술','亥':'해' };
        const toKr = (s: string) => s.split('').map(c => HANJA_TO_KR[c] ?? c).join('');

        const baziData = {
          year: toKr(sajuRes.pillarDetails.year.stem + sajuRes.pillarDetails.year.branch),
          month: toKr(sajuRes.pillarDetails.month.stem + sajuRes.pillarDetails.month.branch),
          day: toKr(sajuRes.pillarDetails.day.stem + sajuRes.pillarDetails.day.branch),
          time: toKr(sajuRes.pillarDetails.hour.stem + sajuRes.pillarDetails.hour.branch)
        };

        const [y] = date.split('-').map(Number);
        const age = 2026 - y + 1;

        // Cache Check
        const cacheKey = `saju_cache_${date}_${time}_${isLunar}_${gender}_${birthCity}`;
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
          systemPrompt: `전통 사주 전문가로서 ${age}세 기준 인생 풀이를 제공하세요.
명리학적 근거를 바탕으로 하되, 사용자가 이해하기 쉬운 현대적 언어를 사용하세요.
가독성을 위해 모든 분석 내용은 5~8줄마다 빈 줄(\\n\\n)을 넣어 문단을 명확히 나누어 주세요.
각 분석 항목(general, early 등)은 반드시 '문자열(String)'로만 응답해야 하며, 절대 객체 형태로 중첩하지 마세요.
반드시 JSON 형식으로만 응답해야 하며, 'life_balance' 객체에는 wealth, love, career, health 점수를 0에서 100 사이의 '숫자(Number)' 형태로 포함하세요.`,
          sajuJson: { ...sajuRes, age },
          expectedKeys: ["general", "early", "youth", "middle", "mature", "late", "general_summary", "general_keyword", "daeun", "sinsal", "gaewun", "life_balance"]
        };

        const apiRes = await fetch("/api/saju", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!apiRes.ok) throw new Error("API 요청 실패");
        const llmRes = cleanAstrologyTerms(await apiRes.json());

        const parseScore = (val: any) => {
          let n = 50;
          if (typeof val === 'number') {
            n = isNaN(val) ? 50 : val;
          } else if (typeof val === 'string') {
            n = parseInt(val.replace(/[^0-9]/g, ''));
            if (isNaN(n)) n = 50;
          }
          // AI가 1-10 척도로 준 경우를 대비해 보정 (7 -> 70, 6 -> 60 등)
          if (n > 0 && n <= 10) n = n * 10;
          return n;
        };

        const lb = llmRes.life_balance || {};
        const safeLB = {
          wealth: parseScore(lb.wealth),
          love: parseScore(lb.love),
          career: parseScore(lb.career),
          health: parseScore(lb.health)
        };

        setBazi(baziData);
        const readingData = {
          ...llmRes,
          life_balance: safeLB,
          elements: [
            { label: "목", value: (sajuRes.basePercentages.wood), color: "#81b29a" },
            { label: "화", value: (sajuRes.basePercentages.fire), color: "#e07a5f" },
            { label: "토", value: (sajuRes.basePercentages.earth), color: "#f2cc8f" },
            { label: "금", value: (sajuRes.basePercentages.metal), color: "#e5e5e5" },
            { label: "수", value: (sajuRes.basePercentages.water), color: "#3d5a80" }
          ],
          sections: [
            { id: "general", t: "인생 총운", d: { content: llmRes.general, summary: llmRes.general_summary, keyword: llmRes.general_keyword, gaewun: llmRes.gaewun?.general || {} }, c: "var(--accent-gold)" },
            { id: "early", t: "초년: ~20대", d: { content: llmRes.early, summary: llmRes.early_summary, keyword: llmRes.early_keyword, gaewun: llmRes.gaewun?.early || {} }, c: "#81b29a" },
            { id: "youth", t: "청년: 30대", d: { content: llmRes.youth, summary: llmRes.youth_summary, keyword: llmRes.youth_keyword, gaewun: llmRes.gaewun?.youth || {} }, c: "#e07a5f" },
            { id: "middle", t: "중년: 40대", d: { content: llmRes.middle, summary: llmRes.middle_summary, keyword: llmRes.middle_keyword, gaewun: llmRes.gaewun?.middle || {} }, c: "#f2cc8f" },
            { id: "mature", t: "장년: 50~60대", d: { content: llmRes.mature, summary: llmRes.mature_summary, keyword: llmRes.mature_keyword, gaewun: llmRes.gaewun?.mature || {} }, c: "#C9A050" },
            { id: "late", t: "말년: 60대 이후", d: { content: llmRes.late, summary: llmRes.late_summary, keyword: llmRes.late_keyword, gaewun: llmRes.gaewun?.late || {} }, c: "#3d5a80" }
          ],
          daeun: llmRes.daeun, sinsal: llmRes.sinsal
        };

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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "32px", marginTop: "20px" }}>
                {[ {l:"시주", v:bazi.time}, {l:"일주", v:bazi.day}, {l:"월주", v:bazi.month}, {l:"년주", v:bazi.year} ].map((p, i) => (
                  <div key={i} style={{ background: "white", padding: "16px 4px", borderRadius: "16px", textAlign: "center", border: "1px solid #eee", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
                    <div style={{ fontSize: "0.75rem", color: "#666", marginBottom: "4px" }}>{p.l}</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--accent-indigo)" }}>{p.v}</div>
                  </div>
                ))}
              </div>

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

              <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
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
