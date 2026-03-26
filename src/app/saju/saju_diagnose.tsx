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
          'Metal': '금(金)', 'Wood': '목(木)', 'Water': '수(수)', 'Fire': '화(火)', 'Earth': '토(土)'
        };
        return elementMap[match] || match;
      })
      .replace(/(목|화|토|금|수|갑|을|병|정|무|기|경|신|임|계|자|축|인|묘|진|사|오|미|신|유|술|해)((?:\s*[\(（]?\s*[木火土金水甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]\s*[\)）\]]?)+)?/g, (match, kr, extras) => {
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
    <div style={{ 
      display: "flex", 
      flexDirection: "row", 
      alignItems: "center", 
      gap: "24px", 
      width: "100%", 
      marginBottom: "32px",
      padding: "0 8px"
    }}>
      <div style={{ flex: "0 0 45%", position: "relative", maxWidth: "160px", aspectRatio: "1/1" }}>
        <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}>
          {elements.map((el, i) => {
            if (el.value === 0) return null;
            const strokeDasharray = `${(el.value / total) * 251.2} 251.2`;
            const strokeDashoffset = -currentOffset;
            currentOffset += (el.value / total) * 251.2;
            return (
              <motion.circle
                key={i}
                cx="50" cy="50" r="40"
                fill="transparent"
                stroke={el.color}
                strokeWidth="12"
                initial={{ strokeDasharray: "0 251.2" }}
                animate={{ strokeDasharray }}
                strokeDashoffset={strokeDashoffset}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
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

const renderHighlightedText = (text: string) => {
  if (!text || typeof text !== 'string') return text;
  return text.split('\n\n').map((para, i) => {
    if (!para.trim()) return null;
    const isHeader = /^[\d\s]*[📍📅🔍💡🎯🏆💎✨]/.test(para.trim());
    const cleanPara = para.replace(/\*\*(.*?)\*\*/g, '$1').replace(/<b>(.*?)<\/b>/g, '$1');
    return (
      <div key={i} style={{ 
        marginBottom: isHeader ? "24px" : "16px", 
        marginTop: isHeader && i > 0 ? "32px" : "0",
        lineHeight: "1.9", fontSize: isHeader ? "1.2rem" : "1.05rem", fontWeight: isHeader ? "600" : "400",
        color: isHeader ? "var(--accent-indigo)" : "var(--text-secondary)", background: isHeader ? "transparent" : "rgba(255, 255, 255, 0.4)",
        padding: isHeader ? "0" : "16px 20px", borderRadius: "16px", border: isHeader ? "none" : "1px solid rgba(42, 54, 95, 0.05)", wordBreak: "keep-all"
      }}>
        {cleanPara}
      </div>
    );
  });
};

const renderInlineHighlights = (text: string) => {
  if (!text || typeof text !== 'string') return text;
  return text.replace(/\*\*/g, '').replace(/<b>/g, '').replace(/<\/b>/g, '');
};

export default function SajuPage() {
  const [date, setDate] = useState("1995-05-15");
  const [time, setTime] = useState("14:30");
  const [isLunar, setIsLunar] = useState(false);
  const [gender, setGender] = useState("M");
  const [birthCity, setBirthCity] = useState("서울");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const cityDataMap: Record<string, { region: string; energy: string; longitude: number; lmtOffset: number }> = {
    "서울": { region: "산/강", energy: "수도의 중심에 서린 권위와 영민함", longitude: 127.0, lmtOffset: -32 },
    "인천": { region: "바다", energy: "푸른 바다의 역동성과 개방적인 에너지", longitude: 126.7, lmtOffset: -33 },
    "기타": { region: "대지", energy: "한반도의 고유한 생명력", longitude: 127.5, lmtOffset: -30 },
  };

  const [bazi, setBazi] = useState<any>(null);
  const [reading, setReading] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [wisdomIdx, setWisdomIdx] = useState(0);
  const wisdomQuotes = ["하늘의 기운을 살피고 있습니다...", "명식의 조화를 살피는 중입니다...", "운명의 흐름을 읽어내고 있습니다..."];
  const resultRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const handleDevReset = () => { localStorage.clear(); window.location.reload(); };

  useEffect(() => {
    const saved = localStorage.getItem("user_birth_profile");
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p.date) setDate(p.date);
        if (p.gender) setGender(p.gender);
        if (p.birthCity) setBirthCity(p.birthCity);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (isLoading) {
      const pInt = setInterval(() => {
        setLoadingProgress(prev => prev >= 99 ? 99 : prev + Math.floor(Math.random() * 3) + 1);
      }, 150);
      const wInt = setInterval(() => setWisdomIdx(prev => (prev + 1) % wisdomQuotes.length), 3000);
      return () => { clearInterval(pInt); clearInterval(wInt); };
    }
  }, [isLoading]);

  const calculateBazi = async () => {
    setIsLoading(true);
    setBazi(null);
    setReading(null);
    
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);

    const cacheKey = `saju_diag_v1_${date}_${time}_${isLunar}_${gender}_${birthCity}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const p = JSON.parse(cached);
      setBazi(p.bazi); setReading(p.reading); setIsLoading(false); return;
    }

    try {
        const [year, month, day] = date.split("-").map(Number);
        const sajuRes = getUnifiedSaju({ date, time, isLunar, gender, birthCity });
        if (!sajuRes) throw new Error("사주 산출 실패");

        const HANJA_TO_KR: Record<string, string> = {
          '甲':'갑','乙':'을','丙':'병','丁':'정','戊':'무','己':'기','庚':'경','辛':'신','壬':'임','癸':'계',
          '子':'자','丑':'축','寅':'인','卯':'묘','辰':'진','巳':'사','午':'오','未':'미','申':'신','酉':'유','戌':'술','亥':'해'
        };
        const toKr = (s: string) => s.split('').map(c => HANJA_TO_KR[c] ?? c).join('');

        const baziData = {
          year: toKr(sajuRes.pillarDetails.year.stem + sajuRes.pillarDetails.year.branch),
          month: toKr(sajuRes.pillarDetails.month.stem + sajuRes.pillarDetails.month.branch),
          day: toKr(sajuRes.pillarDetails.day.stem + sajuRes.pillarDetails.day.branch),
          time: toKr(sajuRes.pillarDetails.hour.stem + sajuRes.pillarDetails.hour.branch)
        };

        const currentYear = 2026;
        const koreanAge = currentYear - year + 1;

        const sajuAnalysisJson = {
          user_info: { gender: gender === "M" ? "남성" : "여성", age: koreanAge, dm: baziData.day },
          daeun_chung_check: (() => {
              const current = sajuRes.daeun.list.find((d: any) => (koreanAge - 1) >= d.startAge && (koreanAge - 1) <= d.endAge);
              if (!current) return "분석 불가";
              const checkChung = (g1: string, g2: string) => {
                  const bc: Record<string, string> = { '자':'오','오':'자','축':'미','미':'축','인':'신','신':'인','묘':'유','유':'묘','진':'술','술':'진','사':'해','해':'사' };
                  return bc[g1[1]] === g2[1];
              };
              const yearClashes = sajuRes.seyun.filter(s => s.year >= 2026 && s.year <= 2028).filter(s => checkChung(current.ganzhi, s.ganzhi)).map(s => `${s.year}년`);
              return { is_chung_active: yearClashes.length > 0, clashes: yearClashes.join(', ') || "없음" };
          })()
        };

        const payload = {
          systemPrompt: `당신은 명리학 권위자입니다... [생략된 긴 프롬프트 구현]`,
          sajuJson: sajuAnalysisJson,
          expectedKeys: ["general", "early", "youth", "middle", "mature", "late", "general_summary", "general_keyword", "daeun", "sinsal", "gaewun", "chung_impact"]
        };

        const apiRes = await fetch("/api/saju", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!apiRes.ok) throw new Error("API 요청 실패");
        const llmResRaw = await apiRes.json();
        const llmResult = cleanAstrologyTerms(llmResRaw);

        const resultData = {
          bazi: baziData,
          reading: {
            elements: [{ label: "금", value: 20, color: "#FFD700" }, { label: "수", value: 20, color: "#3d5a80" }],
            life_balance: { wealth: 80, love: 70, career: 85, health: 75 },
            sections: [
              { id: "general", t: "인생 총운", d: { content: llmResult.general, summary: llmResult.general_summary, keyword: llmResult.general_keyword, gaewun: llmResult.gaewun?.general || {} }, c: "var(--accent-gold)" },
              { id: "early", t: "초년: ~20대", d: { content: llmResult.early, summary: llmResult.early_summary, keyword: llmResult.early_keyword, gaewun: llmResult.gaewun?.early || {} }, c: "#81b29a" },
            ],
            daeun: llmResult.daeun, sinsal: llmResult.sinsal
          }
        };

        setBazi(resultData.bazi); setReading(resultData.reading);
        localStorage.setItem(cacheKey, JSON.stringify(resultData));
        setIsLoading(false);
    } catch (e: any) { alert(e.message); setIsLoading(false); }
  };

  return (
    <main ref={topRef} style={{ width: "100%", minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Disclaimer />
      <div style={{ maxWidth: "480px", margin: "0 auto", background: "white", padding: "20px" }}>
        <h1 onClick={handleDevReset}>전통 명리 진단</h1>
        {!isLoading && !bazi && (
          <div>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            <button onClick={calculateBazi}>진단 시작</button>
          </div>
        )}
        <AnimatePresence>
          {isLoading && (
            <motion.div>풀이 중... {loadingProgress}%</motion.div>
          )}
          {bazi && reading && (
            <div ref={resultRef}>
              <div>{bazi.year} {bazi.month} {bazi.day} {bazi.time}</div>
              <FiveElementsDonut elements={reading.elements} />
              {reading.sections.map((sec: any) => (
                <div key={sec.id}>
                  <h3>{sec.t}</h3>
                  <div>{renderHighlightedText(sec.d.content)}</div>
                </div>
              ))}
              <PremiumPromo />
            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
