"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowUp, BookOpen, Clock, CalendarDays, Sparkles, MapPin, Coins, Heart, Briefcase, Activity, User, Star, Scroll, Copy, Check } from "lucide-react";
import { calculateSaju } from "ssaju";
import TraditionalBackground from "@/components/TraditionalBackground";
import Disclaimer from "@/components/Disclaimer";
import WheelDatePicker from "@/components/WheelDatePicker";

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
  
    // Only fix malformed terms like "목 (木)", "목기", "갑신(申)" into "목(木)", "갑신" (clean extra hanja)
    return text
      .replace(/\*\*/g, '')
      .replace(/\(\s*\)/g, '')         // 빈 괄호 제거
      .replace(/\b(Metal|Wood|Water|Fire|Earth)\b/g, (match) => {
        const elementMap: Record<string, string> = {
          'Metal': '금(金)', 'Wood': '목(木)', 'Water': '수(水)', 'Fire': '화(火)', 'Earth': '토(土)'
        };
        return elementMap[match] || match;
      })
      // Refined regex to match Korean term and consume ANY sequence of redundant Hanja/Korean parts
      .replace(/(목|화|토|금|수|갑|을|병|정|무|기|경|신|임|계|자|축|인|묘|진|사|오|미|신|유|술|해)((?:\s*[\(（]?\s*[木火土金水甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]\s*[\)）\]]?)+)?/g, (match, kr, extras) => {
        const elements = ['목', '화', '토', '금', '수'];
        const map: Record<string, string> = {
          '목': '木', '화': '火', '토': '土', '금': '金', '수': '水'
        };
        
        if (!extras) return match;
        
        // Only force Hanja for core Elements
        if (elements.includes(kr)) {
          return `${kr}(${map[kr]})`;
        }
        
        // For everything else (Stems/Branches), strip Hanja and return plain Korean
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
      {/* Left Area: Donut Chart (45%) */}
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
                cx="50"
                cy="50"
                r="40"
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
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--accent-gold)" }}
          >
            오행
          </motion.div>
        </div>
      </div>

      {/* Right Area: Legend List (55%) */}
      <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "8px" }}>
        {elements.map((el, i) => (
          <motion.div 
            key={i} 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between",
              background: "rgba(0,0,0,0.02)", 
              padding: "6px 10px", 
              borderRadius: "10px",
              border: "1px solid rgba(0,0,0,0.03)"
            }}
          >
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
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {Math.round(value)}%
        </motion.span>
      </div>
      <div style={{ width: "100%", height: "4px", background: "rgba(0,0,0,0.05)", borderRadius: "2px", marginTop: "8px" }}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ height: "100%", background: color, borderRadius: "2px" }}
        />
      </div>
    </div>
  );
}

const renderHighlightedText = (text: string) => {
  if (!text || typeof text !== 'string') return text;

  const paragraphs = text.split('\n\n');

  return paragraphs.map((para, i) => {
    if (!para.trim()) return null;

    const parts = para.split(/(<b>.*?<\/b>)/g);
    const isHeader = /^[\d\s]*[📍📅🔍💡🎯🏆💎✨]/.test(para.trim());

    return (
      <div key={i} style={{ 
        marginBottom: isHeader ? "20px" : "12px", 
        marginTop: isHeader && i > 0 ? "28px" : "0",
        lineHeight: "1.85", 
        fontSize: isHeader ? "clamp(1rem, 4vw, 1.15rem)" : "clamp(0.88rem, 3.8vw, 1rem)",
        fontWeight: isHeader ? "600" : "400",
        color: isHeader ? "var(--accent-indigo)" : "var(--text-secondary)",
        background: isHeader ? "transparent" : "rgba(255, 255, 255, 0.4)",
        padding: isHeader ? "0" : "clamp(10px, 3vw, 16px) clamp(12px, 3.5vw, 20px)",
        borderRadius: "14px",
        border: isHeader ? "none" : "1px solid rgba(42, 54, 95, 0.05)",
        wordBreak: "keep-all",
        overflowWrap: "break-word",
        fontFamily: "'Pretendard', sans-serif"
      }}>
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <span key={j}>{part.slice(2, -2)}</span>;
          }
          if (part.startsWith('<b>') && part.endsWith('</b>')) {
            return <strong key={j} style={{ color: "var(--text-primary)", fontWeight: "700" }}>{part.slice(3, -4)}</strong>;
          }
          return part;
        })}
      </div>
    );
  });
};

const renderInlineHighlights = (text: string) => {
  if (!text || typeof text !== 'string') return text;
  const cleanText = text.replace(/\*\*/g, '');
  const parts = cleanText.split(/(<b>.*?<\/b>)/g);
  return parts.map((part, j) => {
    if (part.startsWith('<b>') && part.endsWith('</b>')) {
      return <strong key={j} style={{ color: "var(--text-primary)", fontWeight: "700" }}>{part.slice(3, -4)}</strong>;
    }
    return part;
  });
};

export default function SajuPage() {
  const [date, setDate] = useState("1991-01-13");
  const [time, setTime] = useState("03:10");
  const [isLunar, setIsLunar] = useState(false);
  const [gender, setGender] = useState("M");
  const [birthCity, setBirthCity] = useState("서울");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // 도시별 경도/LMT 보정 데이터베이스
  const cityDataMap: Record<string, { region: string; energy: string; longitude: number; lmtOffset: number }> = {
    "서울": { region: "산/강", energy: "수도의 중심에 서린 권위와 영민함", longitude: 127.0, lmtOffset: -32 },
    "인천": { region: "바다", energy: "푸른 바다의 역동성과 개방적인 에너지", longitude: 126.7, lmtOffset: -33 },
    "수원": { region: "평야", energy: "수원 화성의 정기와 조화로운 기운", longitude: 127.0, lmtOffset: -32 },
    "성남": { region: "산/평야", energy: "도시의 현대적 흐름과 안정적인 터전", longitude: 127.1, lmtOffset: -32 },
    "고양": { region: "강/평야", energy: "일산 호수공원의 평온함과 개방적 에너지", longitude: 126.8, lmtOffset: -33 },
    "용인": { region: "산/평야", energy: "수지/기흥의 조화롭고 부드러운 기운", longitude: 127.2, lmtOffset: -31 },
    "부천": { region: "평야", energy: "문화의 중심지로서 만인이 모이는 기운", longitude: 126.8, lmtOffset: -33 },
    "안산": { region: "바다/강", energy: "서해의 기상을 품은 포용과 역동", longitude: 126.8, lmtOffset: -33 },
    "남양주": { region: "산/강", energy: "다산 정약용의 지혜와 수려한 자연미", longitude: 127.2, lmtOffset: -31 },
    "안양": { region: "산/평야", energy: "관악산 아래 곧고 바른 선비의 정기", longitude: 126.9, lmtOffset: -32 },
    "화성": { region: "바다/평야", energy: "서해 바다와 비옥한 대지의 풍요로움", longitude: 126.8, lmtOffset: -33 },
    "평택": { region: "평야/항구", energy: "세계로 뻗어가는 무역과 개척의 정기", longitude: 127.1, lmtOffset: -32 },
    "의정부": { region: "산/군사", energy: "수호의 정신과 굳건한 평화의 기운", longitude: 127.0, lmtOffset: -32 },
    "파주": { region: "강/평야", energy: "임진강의 흐름과 높은 기상의 예술혼", longitude: 126.8, lmtOffset: -33 },
    "시흥": { region: "바다/평야", energy: "갯골의 생명력과 소금처럼 알찬 기운", longitude: 126.8, lmtOffset: -33 },
    "김포": { region: "강/바다", energy: "한강 하구의 풍요와 새로운 기회의 터", longitude: 126.7, lmtOffset: -33 },
    "광명": { region: "산/평야", energy: "빛의 도시답게 밝고 명랑한 지혜의 정기", longitude: 126.9, lmtOffset: -32 },
    "광주(경기)": { region: "산/강", energy: "남한산성의 호국 정신과 맑은 자연미", longitude: 127.2, lmtOffset: -31 },
    "군포": { region: "산/평야", energy: "수리산의 기품과 조화로운 삶의 기운", longitude: 126.9, lmtOffset: -32 },
    "이천": { region: "평야", energy: "도자기의 예술성과 비옥한 쌀의 풍요", longitude: 127.4, lmtOffset: -30 },
    "오산": { region: "평야/강", energy: "오산천의 여유와 따뜻한 포용력", longitude: 127.1, lmtOffset: -32 },
    "하남": { region: "산/강", energy: "검단산의 기세와 한강의 평온함", longitude: 127.2, lmtOffset: -31 },
    "양주": { region: "산/평야", energy: "양주 별산대의 풍류와 전통의 기운", longitude: 127.0, lmtOffset: -32 },
    "구리": { region: "산/강", energy: "아차산과 한강이 만나는 길목의 행운", longitude: 127.1, lmtOffset: -32 },
    "안성": { region: "평야/예술", energy: "안성마춤의 장인 정신과 풍류", longitude: 127.2, lmtOffset: -31 },
    "포천": { region: "산/호수", energy: "백운산과 산정호수의 수려한 기품", longitude: 127.2, lmtOffset: -31 },
    "의왕": { region: "산/호수", energy: "백운호수의 평온과 인자한 기운", longitude: 127.0, lmtOffset: -32 },
    "여주": { region: "평야/강", energy: "세종대왕의 덕과 신륵사의 평화", longitude: 127.6, lmtOffset: -30 },
    "동두천": { region: "산", energy: "소요산의 기백과 강직한 기운", longitude: 127.1, lmtOffset: -32 },
    "과천": { region: "산", energy: "청계산의 맑음과 지혜로운 선비의 터", longitude: 127.0, lmtOffset: -32 },
    "가평": { region: "산/강", energy: "자라섬의 싱그러움과 맑은 휴식", longitude: 127.5, lmtOffset: -30 },
    "양평": { region: "산/강", energy: "용문산과 두물머리의 신성한 기운", longitude: 127.5, lmtOffset: -30 },
    "연천": { region: "강/산", energy: "한탄강의 역동성과 유구한 대지의 정기", longitude: 127.1, lmtOffset: -32 },
    "부산": { region: "바다", energy: "거친 파도를 품은 역동적인 해양 기운", longitude: 129.0, lmtOffset: -24 },
    "대구": { region: "분지/화", energy: "뜨거운 열정과 곧은 선비의 기질", longitude: 128.6, lmtOffset: -26 },
    "대전": { region: "평야/산", energy: "한반도 중심의 균형 잡힌 기운", longitude: 127.4, lmtOffset: -30 },
    "광주": { region: "예술/풍류", energy: "풍부한 감수성과 예술적 끼", longitude: 126.9, lmtOffset: -32 },
    "강릉": { region: "바다/산", energy: "동해의 깊은 푸름과 태백의 굳건함", longitude: 128.9, lmtOffset: -24 },
    "제주": { region: "섬/바람", energy: "자유로운 영혼과 강인한 생명력", longitude: 126.5, lmtOffset: -34 },
    "기타": { region: "대지", energy: "한반도의 고유한 생명력", longitude: 127.5, lmtOffset: -30 },
  };

  const [bazi, setBazi] = useState<any>(null);
  const [reading, setReading] = useState<any>(null);
  const [isCached, setIsCached] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTextIdx, setLoadingTextIdx] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [wisdomIdx, setWisdomIdx] = useState(0);
  const wisdomQuotes = [
    "하늘의 기운을 살피고 있습니다...",
    "명식의 조화를 살피는 중입니다...",
    "과거와 미래의 흐름을 읽어내고 있습니다...",
    "당신만의 특별한 운명을 정리 중입니다...",
    "거의 다 되었습니다. 잠시만 기다려주세요..."
  ];
  const [correctedTimeInfo, setCorrectedTimeInfo] = useState<any>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

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

  // 데이터 영속성 유지 (Sync with localStorage)
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
      } catch (e) { console.error("Error loading profile", e); }
    }
  }, []);

  useEffect(() => {
    const profile = { date, time, isLunar, gender, birthCity };
    localStorage.setItem("user_birth_profile", JSON.stringify(profile));
  }, [date, time, isLunar, gender, birthCity]);

  useEffect(() => {
    if (!isLoading && bazi && reading) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [isLoading, bazi, reading]);

  const loadingTexts = [
    "우주의 기운을 모으는 중...",
    "타고난 명식을 풀이하고 있습니다...",
    "당신만을 위한 운명의 흐름을 읽어내는 중...",
    "거의 다 왔어요, 문장을 정리하고 있습니다..."
  ];

  useEffect(() => {
    let textInterval: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;

    if (isLoading) {
      setLoadingTextIdx(0);
      setLoadingProgress(0);
      textInterval = setInterval(() => {
        setLoadingTextIdx((prev) => (prev + 1) % loadingTexts.length);
      }, 1800);
      progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 99) {
            if (progressInterval) clearInterval(progressInterval);
            return 99;
          }
          const increment = Math.floor(Math.random() * 3) + 1;
          return Math.min(prev + increment, 99);
        });
      }, 150);
    }

    return () => {
      if (textInterval) clearInterval(textInterval);
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [isLoading]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setWisdomIdx((prev) => (prev + 1) % wisdomQuotes.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isLoading, wisdomQuotes.length]);

  const calculateBazi = async () => {
    setIsLoading(true);
    setBazi(null);
    setReading(null);
    setIsCached(false);

    // 즉시 결과/로딩 영역으로 스크롤
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);

    // 전통사주 캐시 자동 초기화 (매년 01월 01일 00:00 기준)
    const now = new Date();
    const currentYear = now.getFullYear();
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith("saju_cache_") && !key.endsWith(`_${currentYear}`)) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn("Saju cache cleanup failed:", e);
    }

    const cacheKey = `saju_cache_v10_${date}_${time}_${isLunar}_${gender}_${birthCity}_${currentYear}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setBazi(parsed.bazi);
        setReading(parsed.reading);
        setCorrectedTimeInfo(parsed.correctedTimeInfo);
        setIsCached(true);
        setIsLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem(cacheKey);
      }
    }

    try {
        const [year, month, day] = date.split("-").map(Number);
        const [hour, min] = time.split(":").map(Number);

        const cityData = cityDataMap[birthCity] || cityDataMap["기타"];
        const offsetMin = cityData.lmtOffset;
        const totalMinutes = hour * 60 + min + offsetMin;
        
        let correctedDay = day;
        let correctedHour = Math.floor(((totalMinutes % 1440) + 1440) % 1440 / 60);
        let correctedMin = ((totalMinutes % 60) + 60) % 60;
        if (totalMinutes < 0) correctedDay = day - 1;
        if (totalMinutes >= 1440) correctedDay = day + 1;
        
        const correctedTimeStr = `${String(correctedHour).padStart(2, '0')}:${String(correctedMin).padStart(2, '0')}`;
        const timeInfo = {
          original: time,
          corrected: correctedTimeStr,
          offset: Math.abs(offsetMin),
          longitude: cityData.longitude,
          isCusp: correctedMin <= 10 || correctedMin >= 50
        };
        setCorrectedTimeInfo(timeInfo);

        const sajuRes = calculateSaju({
          year, month, day: correctedDay, hour: correctedHour, minute: correctedMin,
          calendar: isLunar ? "lunar" : "solar",
          gender: gender === "M" ? "남" : "여"
        });

        if (!sajuRes) throw new Error("사주 산출에 실패했습니다.");

        const HANJA_TO_KR: Record<string, string> = {
          '甲':'갑','乙':'을','丙':'병','丁':'정','戊':'무','己':'기','庚':'경','辛':'신','壬':'임','癸':'계',
          '子':'자','丑':'축','寅':'인','卯':'묘','辰':'진','巳':'사','午':'오','未':'미','申':'신','酉':'유','戌':'술','亥':'해'
        };
        const toKrFn = (s: string) => s.split('').map(c => HANJA_TO_KR[c] ?? c).join('');

        const yearStr  = sajuRes.pillarDetails.year.stem  + sajuRes.pillarDetails.year.branch;
        const monthStr = sajuRes.pillarDetails.month.stem + sajuRes.pillarDetails.month.branch;
        const dayStr   = sajuRes.pillarDetails.day.stem   + sajuRes.pillarDetails.day.branch;
        const timeStr  = sajuRes.pillarDetails.hour.stem  + sajuRes.pillarDetails.hour.branch;

        const baziData = {
          year:  toKrFn(yearStr),
          month: toKrFn(monthStr),
          day:   toKrFn(dayStr),
          time:  toKrFn(timeStr)
        };

        const getElementFromChar = (char: string) => {
          if (['甲', '乙', '寅', '卯'].includes(char)) return '목';
          if (['丙', '丁', '巳', '午'].includes(char)) return '화';
          if (['戊', '己', '辰', '戌', '丑', '미'].includes(char)) return '토';
          if (['庚', '辛', '申', '酉'].includes(char)) return '금';
          if (['壬', '癸', '亥', '子'].includes(char)) return '수';
          return '토';
        };

        const chars = [yearStr[0], yearStr[1], monthStr[0], monthStr[1], dayStr[0], dayStr[1], timeStr[0], timeStr[1]];
        const counts: Record<string, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
        chars.forEach(ch => { counts[getElementFromChar(ch)]++; });
        const dmElem = getElementFromChar(dayStr[0]);
        const jaeseongElem = { 목:'토', 화:'금', 토:'수', 금:'목', 수:'화' }[dmElem] || '토';

        const currentYear = parseFloat(process.env.NEXT_PUBLIC_DEBUG_YEAR || "2026");
        const koreanAge = currentYear - year + 1;

        const sajuAnalysisJson = {
            user_info: { 
              gender: gender === "M" ? "남성" : "여성", 
              birth_year: year,
              current_age: koreanAge,
              day_master: `${dayStr[0]}(${dmElem})` 
            },
            elements_ratio: { Wood: counts['목'], Fire: counts['화'], Earth: counts['토'], Metal: counts['금'], Water: counts['수'] },
            core_格: sajuRes.advanced.geukguk,
            gongmang: sajuRes.gongmang.branchesKo.join(', '),
            daeun_direction: sajuRes.daeun.basis.direction === "forward" ? "순행(정방향)" : "역행(역방향)",
            lucky_elements: sajuRes.advanced.yongsin.join(', '),
            fortune_3year: sajuRes.seyun.filter(s => s.year >= 2026 && s.year <= 2028).map(s => `${s.year}년(${s.ganzhi}): ${s.tenGodStem}/${s.tenGodBranch}`).join(', '),
            monthly_fortune_2026: sajuRes.wolun.map(w => `${w.month}월(${w.ganzhi}): ${w.stem_tengod}/${w.branch_tengod}`).join(', '),
            shinsal: { lucky: sajuRes.advanced.sinsal.gilsin || [], caution: sajuRes.advanced.sinsal.hyungsin || [] },
            daeun_sequence: sajuRes.daeun.list.map((d: any) => {
              const koreanAge = d.startAge + 1;
              return `${koreanAge}세~${koreanAge + 9}세: ${d.ganzhi}(${d.stemTenGod}/${d.branchTenGod})`;
            }).slice(0, 8),
            tenGod_lookup: (() => {
              const dmChar = dayStr[0];
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
                const me = stems[dmChar];
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
                note: `* 일간 ${dmChar} 기준 명확한 십신 매핑입니다. 절대 틀리게 유추하지 마세요.`
              };
            })()
        };

        const generateSystemPromptString = (json: any) => {
          return `당신은 청아매당(淸雅梅堂)의 최고 명리학 권위자입니다. 다음 사주 데이터를 기반으로 인생 총운, 그리고 인생의 5단계를 에세이 형식으로 풀이해 주세요.
**[매우 중요: 현재 시간적 배경 필수 인지]**
현재 연도는 **2026년 병오년(丙午年)**이며, 내담자의 현재 나이는 **${koreanAge}세**입니다. 모든 풀이와 대운, 생애주기 예측은 반드시 2026년(${koreanAge}세)을 "올해(현재)"로 기준 삼아 서술하십시오. 절대 계산 착오로 다른 나이를 언급하거나, 2024년/2025년을 현재로 간주해서는 안 됩니다.

단순히 성격을 나열하는 뻔한 풀이는 절대 금지합니다. 사주의 기운이 어떻게 상호작용하는지, 용신(用神)과 격국(格局), 합충(合沖) 변화 등 명리학적 근거를 명확히 제시하여 통찰력 깊은 풀이를 제공하세요.
무조건 좋은 말만 하지 말고, 객관적인 흉운(주의가 필요한 시기)과 약점을 명확히 짚어주되, 반드시 이를 극복할 수 있는 구체적이고 실질적인 개운법(Gaewun)을 함께 제시하세요.
내담자의 인생을 함께 고민하고 통찰을 제공하는 품격 있고 따뜻한 어투를 사용하세요.
반드시 아래 정의된 JSON 형식으로만 응답해야 합니다.

[출력 JSON 구조]
{
  "general": "인생 총운 본문 (에세이 형식으로, 용신/격국 등 전문적 근거 포함, 타고난 강점과 치명적 약점 모두 풀이. 특히 공망(${json.gongmang})이 인연/재물/이사 등에 미치는 영향 포함)",
  "general_summary": "총운 요약",
  "general_keyword": "총운 키워드",
  "early": "초년기(${json.daeun_sequence[0]}, ${json.daeun_sequence[1]}) 인생의 흐름과 사회적 기반 (명리학적 기운의 작용, 학업/초기 성취의 장애물과 극복 방안 포함)",
  "youth": "청년기(${json.daeun_sequence[2]}, ${json.daeun_sequence[3]}) 인생의 성장과 성취의 기운 (사회 진출, 재물 등 주요 사건에 대한 기운의 교차, 조심해야 할 흉운 포함)",
  "middle": "중년기(${json.daeun_sequence[4]}, ${json.daeun_sequence[5]}) 인생의 전성기와 확장의 흐름 (가장 왕성한 시기의 기운 충돌 및 안정화, 성취와 리스크 관리)",
  "mature": "장년기(50대~60대 초반) 인생의 결실과 안정의 흐름 (자산 축적, 건강 관리, 주변 관계의 정리와 원숙한 지혜)",
  "late": "말년기(60대 이후) 인생의 완성 내실과 안정적인 흐름 (말년의 건강, 내적 평화, 자산 관리에 대한 기운 풀이)",
  "early_summary": "초년 요약 (어려운 한자 간지 사용 금지, 반드시 자연물 비유나 은유적 표현으로 서술)",
  "youth_summary": "청년 요약 (자연물 비유나 은유적 표현으로 서술)",
  "middle_summary": "중년 요약 (자연물 비유나 은유적 표현으로 서술)",
  "mature_summary": "장년 요약 (자연물 비유나 은유적 표현으로 서술)",
  "late_summary": "말년 요약 (자연물 비유나 은유적 표현으로 서술)",
  "early_keyword": "초년 키워드",
  "youth_keyword": "청년 키워드",
  "middle_keyword": "중년 키워드",
  "mature_keyword": "장년 키워드",
  "late_keyword": "말년 키워드",
  "life_balance": {"wealth": 80, "love": 70, "career": 85, "health": 75},
  "daeun": "10년 주기의 큰 운(대운) 풀이. 반드시 제공된 대운 방향(${json.daeun_direction})과 십신(${json.daeun_sequence.join(', ')}) 정보를 정확히 맞춰서 해당 시기의 기회와 위기를 서술",
  "sinsal": "명식의 주요 신살 풀이 (길신과 흉신이 실제 삶에 미치는 영향)",
  "gaewun": {
    "general": {"color": "검은색 계열", "direction": "북쪽", "element": "수(水)", "item": "물 관련 소품 (어항, 분수)"},
    "early": {"color": "초록 계열", "direction": "동쪽", "element": "목(木)", "item": "나무 화분 또는 나무 재질 소품"},
    "youth": {"color": "붉은 계열", "direction": "남쪽", "element": "화(火)", "item": "붉은 계열 소품 또는 조명"},
    "middle": {"color": "노란 계열", "direction": "중앙", "element": "토(土)", "item": "도자기 또는 황토 소품"},
    "mature": {"color": "흰색 계열", "direction": "서쪽", "element": "금(金)", "item": "금속 장신구 또는 흰색 소품"},
    "late": {"color": "검은색 계열", "direction": "북쪽", "element": "수(水)", "item": "물 관련 소품"}
  }
}

[필수 조건 - 절대 누락하지 마세요!]
1. 'gaewun' 객체는 **반드시 'general', 'early', 'youth', 'middle', 'mature', 'late' 6개의 키를 모두 빠짐없이 제공해야 합니다.**
2. 'gaewun'의 모든 값은 'color', 'direction', 'element', 'item' 4가지 키를 가진 객체여야 합니다. 'element' 값은 반드시 '목(木)', '화(火)', '토(土)', '금(金)', '수(水)' 중 하나로만 정확히 표기해야 합니다.
3. **[개운법 'item' 필드 규칙 - 매우 중요]**: 'item' 필드에는 반드시 **구체적인 물건 이름** (예: 나무 화분, 도자기 화기, 황동 소품, 어항)을 적어야 합니다. '명상', '운동', '산책' 등 행동은 절대 금지입니다.
4. [매우 중요 - 개운법(Gaewun) 원칙]: 개운법은 반드시 사주의 **용신(用神) 또는 희신(喜神)(나에게 도움이 되는 기운)**만 추천해야 합니다. 이미 사주에 과다하거나 나를 억압하는 **기신(忌神)(해로운 기운)**을 추천하는 것은 치명적인 오류입니다.
5. [풀이 품질 및 은유적 표현 (매우 중요)]: 전체 본문은 전문가가 직접 상담해주는 듯한 품격 있고 자연스러운 한국어로 작성해 주세요. '辛금 비견', '巳화 정관' 같이 한자와 십신이 결합된 원색적인 명리 용어를 직접 나열하는 것을 절대 금지합니다. AI 특유의 딱딱한 말투나 인사말은 생략하고 바로 본론부터 시작하세요.
6. [가독성 및 문단 나눔 (매우 중요)]: 본문(general, early, youth, middle, mature, late 등)을 작성할 때 긴 글을 한 덩어리로 쓰지 말고, 가독성을 위해 반드시 3~4문장이 끝날 때마다 반드시 줄바꿈(엔터 두 번, \\n\\n)을 하여 물리적으로 문단을 나누세요. <b> 등 HTML 태그 절대 금지.
7. [필독 십신 매핑표]: 천간 매핑 - ${json.tenGod_lookup.stems_mapping} / 지지 매핑 - ${json.tenGod_lookup.branches_mapping}. 일간 기준으로 정확히 계산된 값이니, 절대 다른 십신으로 착각하지 마세요.`;
        };

        const payload = {
          systemPrompt: generateSystemPromptString(sajuAnalysisJson),
          sajuJson: sajuAnalysisJson,
          expectedKeys: ["general", "early", "youth", "middle", "mature", "late", "general_summary", "early_summary", "youth_summary", "middle_summary", "mature_summary", "late_summary", "general_keyword", "early_keyword", "youth_keyword", "middle_keyword", "mature_keyword", "late_keyword", "life_balance", "daeun", "sinsal", "gaewun"]
        };

        let apiRes;
        let retries = 0;
        const maxRetries = 2;
        const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

        while (retries <= maxRetries) {
          apiRes = await fetch("/api/saju", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });

          if (apiRes.ok) break;

          if (apiRes.status === 503 && retries < maxRetries) {
            retries++;
            await delay(1500 * retries); // Exponential backoff: 1.5s, 3s
            continue;
          }

          const errorData = await apiRes.json().catch(() => ({}));
          const userMsg = errorData.details || errorData.error || "API 요청 실패";
          
          if (apiRes.status === 503 || userMsg.includes("503") || userMsg.includes("overload")) {
            throw new Error("현재 운세 풀이 서버에 접속자가 많아 기운을 읽는 데 시간이 걸리고 있습니다. 잠시 후 다시 시도해 주세요.");
          }
          
          throw new Error(userMsg);
        }

        if (!apiRes || !apiRes.ok) throw new Error("API 요청 실패");
        let llmResultRaw = await apiRes.json();
        const llmResult = cleanAstrologyTerms(llmResultRaw);

        // Validation to prevent caching incomplete or failed AI analysis
        if (!llmResult || !llmResult.general || !llmResult.early || !llmResult.youth || typeof llmResult.general !== 'string') {
          throw new Error("명운의 기운을 완벽하게 읽어내지 못했습니다. 다시 한 번 풀이를 시도해 주세요.");
        }

        const resultData = {
          bazi: baziData,
          reading: {
            elements: [
              { label: "목", value: (counts['목']/8)*100, color: "#81b29a" },
              { label: "화", value: (counts['화']/8)*100, color: "#e07a5f" },
              { label: "토", value: (counts['토']/8)*100, color: "#D4A373" },
              { label: "금", value: (counts['금']/8)*100, color: "#FFD700" },
              { label: "수", value: (counts['수']/8)*100, color: "#3d5a80" }
            ],
            life_balance: llmResult.life_balance || { wealth: 50, love: 50, career: 50, health: 50 },
            sections: [
              { id: "general", t: "인생 총운", d: { content: llmResult.general, summary: llmResult.general_summary, keyword: llmResult.general_keyword, gaewun: llmResult.gaewun?.general || {color:"-", direction:"-", element:"-", item:"-"} }, c: "var(--accent-gold)" },
              { id: "early", t: "초년: ~20대", d: { content: llmResult.early, summary: llmResult.early_summary, keyword: llmResult.early_keyword, gaewun: llmResult.gaewun?.early || {color:"-", direction:"-", element:"-", item:"-"} }, c: "#81b29a" },
              { id: "youth", t: "청년: 30대", d: { content: llmResult.youth, summary: llmResult.youth_summary, keyword: llmResult.youth_keyword, gaewun: llmResult.gaewun?.youth || {color:"-", direction:"-", element:"-", item:"-"} }, c: "#e07a5f" },
              { id: "middle", t: "중년: 40대", d: { content: llmResult.middle, summary: llmResult.middle_summary, keyword: llmResult.middle_keyword, gaewun: llmResult.gaewun?.middle || {color:"-", direction:"-", element:"-", item:"-"} }, c: "#C9A050" },
              { id: "mature", t: "장년: 50~60대", d: { content: llmResult.mature, summary: llmResult.mature_summary, keyword: llmResult.mature_keyword, gaewun: llmResult.gaewun?.mature || {color:"-", direction:"-", element:"-", item:"-"} }, c: "#D4A373" },
              { id: "late", t: "말년: 60대 이후", d: { content: llmResult.late, summary: llmResult.late_summary, keyword: llmResult.late_keyword, gaewun: llmResult.gaewun?.late || {color:"-", direction:"-", element:"-", item:"-"} }, c: "#3d5a80" }
            ],
            daeun: llmResult.daeun,
            sinsal: llmResult.sinsal
          },
          correctedTimeInfo: timeInfo
        };

        setBazi(resultData.bazi);
        setReading(resultData.reading);
        localStorage.setItem(cacheKey, JSON.stringify(resultData));
        setIsLoading(false);

    } catch (error: any) {
        console.error(error);
        alert(error.message || "오류가 발생했습니다.");
        setIsLoading(false);
    }
  };

  const RollingNumber = ({ value }: { value: number }) => {
    return <>{value}</>;
  };

  const CopyButton = ({ bazi, reading }: { bazi: any, reading: any }) => {
    const [copied, setCopied] = useState(false);
    
    const handleCopy = () => {
      let text = `[전통 사주 풀이 리포트]\n\n`;
      text += `● 사주 명식\n- 년주: ${bazi.year}\n- 월주: ${bazi.month}\n- 일주: ${bazi.day}\n- 시주: ${bazi.time}\n\n`;
      
      reading.sections.forEach((sec: any) => {
        text += `● ${sec.t}\n`;
        text += `"${sec.d.summary}"\n\n`;
        text += `${sec.d.content}\n\n`;
        if (sec.d.gaewun && sec.d.gaewun.color && sec.id !== 'general') {
          text += `[${sec.t} 개운법]\n`;
          text += `- 색상: ${sec.d.gaewun.color}, 방향: ${sec.d.gaewun.direction}, 오행: ${sec.d.gaewun.element}, 물건: ${sec.d.gaewun.item}\n\n`;
        }
      });
      
      text += `● 대운 설명\n${reading.daeun}\n\n`;
      text += `● 주요 신살\n${reading.sinsal}\n\n`;
      text += `본 리포트는 2026년 병오년을 기준으로 작성되었습니다.`;

      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <button 
        onClick={handleCopy}
        style={{ 
          display: "flex", alignItems: "center", gap: "8px", 
          padding: "12px 20px", borderRadius: "14px", 
          background: copied ? "#81b29a" : "rgba(42, 54, 95, 0.05)", 
          color: copied ? "white" : "var(--accent-indigo)", 
          border: "1px solid var(--glass-border)", 
          fontSize: "0.9rem", fontWeight: "700", 
          cursor: "pointer", transition: "all 0.2s",
          width: "100%", justifyContent: "center",
          marginTop: "40px", marginBottom: "20px"
        }}
      >
        {copied ? <Check size={18} /> : <Copy size={18} />}
        {copied ? "복사 완료!" : "전체 결과 복사하기"}
      </button>
    );
  };

  return (
    <main ref={topRef} style={{ width: "100%", minHeight: "100vh", position: "relative", background: "var(--bg-primary)" }}>
      <Disclaimer />
      <WheelDatePicker isOpen={isDatePickerOpen} onClose={() => setIsDatePickerOpen(false)} initialDate={date} onConfirm={(y, m, d, lunar) => { setDate(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`); setIsLunar(lunar); }} />
      
      <div style={{ 
        maxWidth: "480px", 
        margin: "0 auto", 
        position: "relative", 
        zIndex: 1, 
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
        padding: "0 16px"
      }}>
        <div style={{ padding: "16px 0 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <button style={{ background: "white", border: "1px solid rgba(0,0,0,0.06)", color: "var(--accent-indigo)", cursor: "pointer", width: "36px", height: "36px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}><ArrowLeft size={18} /></button>
            </Link>
            <div style={{ flex: 1 }} onClick={handleDevReset}>
              <h1 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1px", letterSpacing: "-0.02em", color: "var(--accent-indigo)", margin: 0, cursor: "pointer", userSelect: "none" }}>전통 사주</h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.72rem", margin: 0, fontWeight: "400" }}>전통의 지혜로 운명을 비춥니다</p>
            </div>
            <span style={{ fontSize: "0.6rem", fontWeight: "700", color: "var(--accent-gold)", letterSpacing: "0.06em", background: "rgba(201,160,80,0.08)", padding: "3px 8px", borderRadius: "6px" }}>PREMIUM</span>
          </div>

          {/* Compact Form */}
          {!(isLoading || (bazi && reading)) && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: "white", padding: "20px", borderRadius: "20px", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div onClick={() => setIsDatePickerOpen(true)} style={{ background: "var(--bg-primary)", padding: "12px 14px", borderRadius: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
                  <CalendarDays className="w-4 h-4" style={{ color: "#C9A050" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-secondary)", marginBottom: "1px" }}>생년월일</div>
                    <div style={{ fontSize: "0.9rem", fontWeight: "700" }}>{date}</div>
                  </div>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "8px" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <div style={{ flex: 1, background: "var(--bg-primary)", padding: "12px 14px", borderRadius: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Clock className="w-4 h-4" style={{ color: "#C9A050" }} />
                      <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ border: "none", fontSize: "0.9rem", fontWeight: "700", outline: "none", background: "transparent", width: "100%", padding: 0 }} />
                    </div>
                    <div style={{ display: "flex", background: "var(--bg-primary)", borderRadius: "14px", padding: "3px" }}>
                      <button onClick={() => setIsLunar(false)} style={{ padding: "8px 10px", borderRadius: "11px", border: "none", background: !isLunar ? "white" : "transparent", fontSize: "0.78rem", fontWeight: "600", cursor: "pointer", boxShadow: !isLunar ? "0 1px 3px rgba(0,0,0,0.08)" : "none" }}>양력</button>
                      <button onClick={() => setIsLunar(true)} style={{ padding: "8px 10px", borderRadius: "11px", border: "none", background: isLunar ? "white" : "transparent", fontSize: "0.78rem", fontWeight: "600", cursor: "pointer", boxShadow: isLunar ? "0 1px 3px rgba(0,0,0,0.08)" : "none" }}>음력</button>
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "8px" }}>
                  <div style={{ background: "var(--bg-primary)", padding: "12px 14px", borderRadius: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <MapPin className="w-4 h-4" style={{ color: "#C9A050" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.65rem", color: "var(--text-secondary)", marginBottom: "1px" }}>태어난 도시 <span style={{ opacity: 0.6 }}>· 경도 보정</span></div>
                      <select value={birthCity} onChange={(e) => setBirthCity(e.target.value)} style={{ border: "none", fontSize: "0.9rem", fontWeight: "700", outline: "none", background: "transparent", cursor: "pointer", width: "100%", padding: 0 }}>
                        {Object.keys(cityDataMap).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "flex", background: "var(--bg-primary)", borderRadius: "14px", padding: "3px", alignItems: "center" }}>
                    <button onClick={() => setGender("M")} style={{ padding: "10px 14px", borderRadius: "11px", border: "none", background: gender === "M" ? "var(--accent-indigo)" : "transparent", color: gender === "M" ? "white" : "var(--text-secondary)", fontWeight: "700", fontSize: "0.82rem", cursor: "pointer", transition: "all 0.2s" }}>남</button>
                    <button onClick={() => setGender("F")} style={{ padding: "10px 14px", borderRadius: "11px", border: "none", background: gender === "F" ? "var(--accent-indigo)" : "transparent", color: gender === "F" ? "white" : "var(--text-secondary)", fontWeight: "700", fontSize: "0.82rem", cursor: "pointer", transition: "all 0.2s" }}>여</button>
                  </div>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.01 }} 
                whileTap={{ scale: 0.97 }} 
                onClick={calculateBazi} 
                disabled={isLoading} 
                style={{ 
                  width: "100%", 
                  marginTop: "16px", 
                  padding: "16px", 
                  borderRadius: "14px", 
                  fontSize: "0.95rem", 
                  fontWeight: "700", 
                  background: "linear-gradient(135deg, #2A365F 0%, #1A1C2C 100%)",
                  color: "white",
                  boxShadow: "0 8px 24px rgba(42, 54, 95, 0.18)",
                  border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  letterSpacing: "-0.01em"
                }}
              >
                {isLoading ? "기운을 살피는 중..." : <><Sparkles size={16} /> 운세 풀이 시작하기</>}
              </motion.button>
            </motion.div>
          )}

            <AnimatePresence>
              {(isLoading || (bazi && reading)) && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "16px" }} ref={resultRef}>
                  {isLoading ? (
                    <div style={{ textAlign: "center", padding: "80px 0", display: "flex", flexDirection: "column", alignItems: "center", minHeight: "350px", justifyContent: "center" }}>
                      {/* Circular Percentage Gauge */}
                      <div style={{ position: "relative", width: "120px", height: "120px", marginBottom: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}>
                          <circle cx="50" cy="50" r="45" fill="transparent" stroke="rgba(42, 54, 95, 0.05)" strokeWidth="8" />
                          <motion.circle 
                            cx="50" cy="50" r="45" 
                            fill="transparent" 
                            stroke="var(--accent-indigo)" 
                            strokeWidth="8" 
                            strokeDasharray="282.7"
                            animate={{ strokeDashoffset: 282.7 - (282.7 * loadingProgress) / 100 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div style={{ position: "absolute", textAlign: "center" }}>
                          <motion.span 
                            style={{ fontSize: "1.8rem", fontWeight: "700", color: "var(--accent-indigo)", display: "block" }}
                          >
                            {Math.round(loadingProgress)}
                          </motion.span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: "500", opacity: 0.8 }}>%</span>
                        </div>
                      </div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                        style={{ textAlign: "center" }}
                      >
                        <p style={{ color: "var(--accent-indigo)", fontWeight: "700", fontSize: "1.1rem", marginBottom: "16px", letterSpacing: "0.1em" }}>기운의 흐름을 살피는 중입니다</p>
                        <div style={{ padding: "16px 24px", background: "rgba(42, 54, 95, 0.03)", borderRadius: "12px", borderLeft: "3px solid var(--accent-gold)", maxWidth: "320px", margin: "0 auto", height: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <AnimatePresence mode="wait">
                            <motion.p 
                              key={wisdomIdx}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.8 }}
                              style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: "1.6", margin: 0 }}
                            >
                              {wisdomQuotes[wisdomIdx]}
                            </motion.p>
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                        {[ {l:"시주", v:bazi.time}, {l:"일주", v:bazi.day}, {l:"월주", v:bazi.month}, {l:"년주", v:bazi.year} ].map((p, i) => (
                          <div key={i} style={{ background: "rgba(255,255,255,0.8)", padding: "16px 4px", borderRadius: "16px", textAlign: "center", border: "1px solid var(--glass-border)", boxShadow: "0 8px 20px rgba(26, 28, 44, 0.04)" }}>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "6px", fontWeight: "500" }}>{p.l}</div>
                            <div style={{ fontSize: "1.3rem", fontWeight: "700", color: "var(--accent-indigo)" }}>{p.v}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ padding: "32px 24px", background: "white", borderRadius: "24px", border: "1px solid var(--glass-border)", boxShadow: "0 15px 40px rgba(26, 28, 44, 0.05)" }}>
                        <h3 style={{ textAlign: "center", marginBottom: "32px", fontSize: "1.1rem", fontWeight: "600", color: "var(--accent-indigo)" }}>기운의 조화</h3>
                        <FiveElementsDonut elements={reading.elements} />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                          <AnimatedGauge label="사회적 위상" value={reading.life_balance.career} color="var(--accent-gold)" icon={<Briefcase size={20} />} />
                          <AnimatedGauge label="생명력 강도" value={reading.life_balance.health} color="#81b29a" icon={<Activity size={20} />} />
                          <AnimatedGauge label="재물복 수준" value={reading.life_balance.wealth} color="#FFD700" icon={<Coins size={20} />} />
                          <AnimatedGauge label="애정운 지수" value={reading.life_balance.love} color="#e07a5f" icon={<Heart size={20} />} />
                        </div>
                      </div>


                      <div style={{ display: "flex", flexDirection: "column", gap: "64px" }}>
                        {reading.sections.map((sec: any, i: number) => (
                            <motion.div 
                              key={i} 
                              id={sec.id} 
                              initial={{ opacity: 0, y: 40, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.25, 1, 0.5, 1] }}
                              style={{ borderBottom: i === reading.sections.length - 1 ? "none" : "1px solid var(--glass-border)", paddingBottom: "48px", scrollMarginTop: "80px" }}
                            >
                            <h3 style={{ fontSize: "clamp(1.1rem, 4.5vw, 1.4rem)", marginBottom: "clamp(12px, 3vw, 20px)", color: sec.c, fontWeight: "300" }}>{sec.t}</h3>
                            <div style={{ fontSize: "clamp(0.88rem, 3.8vw, 1.05rem)", marginBottom: "clamp(16px, 3vw, 24px)", color: "var(--text-primary)", borderLeft: `4px solid ${sec.c}`, paddingLeft: "clamp(12px, 3vw, 16px)", lineHeight: "1.7" }}>
                              "{renderInlineHighlights(sec.d.summary || "")}"
                            </div>
                            <div style={{ lineHeight: "1.85", fontSize: "clamp(0.85rem, 3.5vw, 0.95rem)", color: "var(--text-secondary)", wordBreak: "keep-all", overflowWrap: "break-word" }}>
                               {renderHighlightedText(sec.d.content)}
                            </div>
                            {sec.d.gaewun && sec.d.gaewun.color && sec.id !== "general" && (
                              <div style={{ marginTop: "clamp(16px, 3vw, 24px)", padding: "clamp(14px, 3vw, 20px)", background: "rgba(255, 255, 255, 0.5)", borderRadius: "14px", border: `1px solid rgba(0,0,0,0.05)`, boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                                <div style={{ fontWeight: "700", color: sec.c, marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.95rem" }}>
                                  <Sparkles size={16} /> 이 시기의 개운법
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                  <div style={{ background: "white", padding: "12px", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
                                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "4px" }}>추천 색상</div>
                                    <div style={{ fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: "600" }}>{renderInlineHighlights(sec.d.gaewun.color)}</div>
                                  </div>
                                  <div style={{ background: "white", padding: "12px", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
                                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "4px" }}>추천 방향</div>
                                    <div style={{ fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: "600" }}>{renderInlineHighlights(sec.d.gaewun.direction)}</div>
                                  </div>
                                  <div style={{ background: "white", padding: "12px", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
                                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "4px" }}>추천 오행</div>
                                    <div style={{ fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: "600" }}>{renderInlineHighlights(sec.d.gaewun.element)}</div>
                                  </div>
                                  <div style={{ background: "white", padding: "12px", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
                                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "4px" }}>추천 물건</div>
                                    <div style={{ fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: "600" }}>{renderInlineHighlights(sec.d.gaewun.item)}</div>
                                  </div>
                                </div>
                              </div>
                            )}
                            </motion.div>
                        ))}
                      </div>


                      <div style={{ display: "flex", flexDirection: "column", gap: "32px", marginTop: "16px" }}>
                        <div style={{ padding: "clamp(16px, 3.5vw, 24px)", background: "rgba(201, 160, 80, 0.05)", borderRadius: "18px", border: "1px solid rgba(201, 160, 80, 0.1)" }}>
                          <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "16px", color: "var(--accent-gold)", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Star size={18} /> 대운과 신살의 흐름
                          </h3>
                          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div style={{ background: "white", padding: "16px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                              <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>현재의 대운 흐름</div>
                              <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.7" }}>{renderHighlightedText(reading.daeun)}</div>
                            </div>
                            <div style={{ background: "white", padding: "16px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                              <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>사주의 특수 신살</div>
                              <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.7" }}>{renderHighlightedText(reading.sinsal)}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Copy Results Button */}
                      <CopyButton bazi={bazi} reading={reading} />
                    {/* 하단 뒤로가기 버튼 추가 */}
                    <div style={{ marginTop: "64px", display: "flex", justifyContent: "center", gap: "16px" }}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => topRef.current?.scrollIntoView({ behavior: 'smooth' })}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "16px 24px",
                          borderRadius: "30px",
                          background: "rgba(42, 54, 95, 0.05)",
                          color: "var(--accent-indigo)",
                          border: "1px solid var(--glass-border)",
                          fontSize: "1rem",
                          fontWeight: "600",
                          cursor: "pointer"
                        }}
                      >
                        <ArrowUp size={20} /> 맨 위로
                      </motion.button>
                      
                      <Link href="/">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "16px 24px",
                            borderRadius: "30px",
                            background: "white",
                            color: "var(--accent-indigo)",
                            border: "1px solid var(--glass-border)",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                            fontSize: "1rem",
                            fontWeight: "600",
                            cursor: "pointer"
                          }}
                        >
                          <ArrowLeft size={20} /> 홈으로
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
            </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
