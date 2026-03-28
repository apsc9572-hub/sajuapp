"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowUp, BookOpen, Clock, CalendarDays, Sparkles, MoonStar, Scroll, Coins, Briefcase, Activity, Heart, Target, Users, Wallet, ShieldAlert, Download, Share2, Calculator, Calendar, Copy, Check } from "lucide-react";
import { getUnifiedSaju } from "@/lib/unified-saju";
import TraditionalBackground from "@/components/TraditionalBackground";
import Disclaimer from "@/components/Disclaimer";
import WheelDatePicker from "@/components/WheelDatePicker";
import dynamic from "next/dynamic";
import PremiumPromo from "@/components/PremiumPromo";

const TraditionalBackgroundSafe = dynamic(() => import("@/components/TraditionalBackground"), { ssr: false });

// 12개월 운기 분석 차트 컴포넌트
const LineChart = ({ data }: { data: number[] }) => {
  const max = Math.max(...data, 100);
  const min = Math.min(...data, 0);
  const range = max - min;
  const height = 120;
  const width = 300;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / range) * height
  }));

  const d = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

  return (
    <div style={{ width: "100%", height: "180px", position: "relative", marginTop: "20px" }}>
      <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "16px", fontWeight: "600", textAlign: "center" }}>12개월 운기 변화 추이</div>
      <svg viewBox={`-10 -10 ${width + 20} ${height + 20}`} style={{ width: "100%", height: "120px", overflow: "visible" }}>
        {/* Grids */}
        {[0, 25, 50, 75, 100].map(v => {
          const y = height - ((v - min) / range) * height;
          return <line key={v} x1="0" y1={y} x2={width} y2={y} stroke="rgba(0,0,0,0.05)" strokeWidth="1" />;
        })}
        {/* Line */}
        <motion.path
          d={d}
          fill="none"
          stroke="var(--accent-indigo)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <motion.circle
              cx={p.x}
              cy={p.y}
              r="4"
              fill="white"
              stroke="var(--accent-indigo)"
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
            />
            <text x={p.x} y={height + 15} fontSize="8" textAnchor="middle" fill="var(--text-secondary)">{i + 1}월</text>
          </g>
        ))}
      </svg>
    </div>
  );
};

const ThreeDayScoreGraph = ({ scores, labels: customLabels }: { scores: { yesterday: number, today: number, tomorrow: number }, labels?: string[] }) => {
  const data = [scores.yesterday, scores.today, scores.tomorrow];
  const labels = customLabels || ["어제", "오늘", "내일"];
  const max = 100;
  const height = 80;
  const width = 240;
  
  // SVG points for line
  const padding = 40;
  const points = data.map((score, i) => ({
    x: padding + (i * (width - padding * 2) / 2),
    y: height - (score / max) * height + 10
  }));

  const d = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

  return (
    <div style={{ background: "rgba(255,255,255,0.6)", padding: "24px 16px", borderRadius: "24px", marginBottom: "32px", border: "1px solid var(--glass-border)" }}>

      <div style={{ position: "relative", height: `${height + 40}px`, width: "100%", display: "flex", justifyContent: "center" }}>
        <svg viewBox={`0 0 ${width} ${height + 40}`} style={{ width: "100%", maxWidth: "300px", height: "auto", overflow: "visible" }}>
          {/* Grid Lines */}
          {[0, 50, 100].map(v => {
            const y = height - (v / 100) * height + 10;
            return <line key={v} x1={padding-20} y1={y} x2={width-padding+20} y2={y} stroke="rgba(0,0,0,0.03)" strokeWidth="1" />;
          })}
          
          {/* Connect Line */}
          <motion.path
            d={d}
            fill="none"
            stroke="var(--accent-gold)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
          
          {/* Gradient Area under line */}
          <motion.path
            d={`${d} L ${points[2].x},${height+10} L ${points[0].x},${height+10} Z`}
            fill="linear-gradient(180deg, rgba(201, 160, 80, 0.1) 0%, rgba(201, 160, 80, 0) 100%)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 1.5 }}
            style={{ fill: "rgba(201, 160, 80, 0.05)" }}
          />

          {/* Points and Labels */}
          {points.map((p, i) => (
            <g key={i}>
              <motion.circle
                cx={p.x}
                cy={p.y}
                r="5"
                fill="white"
                stroke={i === 1 ? "var(--accent-gold)" : "rgba(201, 160, 80, 0.4)"}
                strokeWidth="3"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + i * 0.2 }}
              />
              <text x={p.x} y={p.y - 12} fontSize="10" fontWeight="700" textAnchor="middle" fill={i === 1 ? "var(--accent-gold)" : "var(--text-secondary)"}>
                {data[i]}
              </text>
              <text x={p.x} y={height + 30} fontSize="11" fontWeight={i === 1 ? "700" : "400"} textAnchor="middle" fill={i === 1 ? "var(--text-primary)" : "var(--text-secondary)"}>
                {labels[i]}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

// FiveElementsDonut
function FiveElementsDonut({ elements }: { elements: any[] }) {
  const total = elements?.reduce((sum, el) => sum + el.value, 0) || 1;
  let currentOffset = 0;

  return (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "24px", width: "100%", marginBottom: "32px", padding: "0 8px" }}>
      <div style={{ flex: "0 0 45%", position: "relative", maxWidth: "160px", aspectRatio: "1/1" }}>
        <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}>
          {elements?.map((el, i) => {
            if (el.value === 0) return null;
            const strokeDasharray = `${(el.value / total) * 251.2} 251.2`;
            const strokeDashoffset = -currentOffset;
            currentOffset += (el.value / total) * 251.2;
            return (
              <motion.circle key={i} cx="50" cy="50" r="40" fill="transparent" stroke={el.color} strokeWidth="12" initial={{ strokeDasharray: "0 251.2", strokeDashoffset: 0 }} animate={{ strokeDasharray, strokeDashoffset }} transition={{ duration: 1.5, ease: "easeOut" }} />
            );
          })}
        </svg>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", width: "100%" }}>
          <div style={{ fontSize: "0.6rem", color: "var(--text-secondary)" }}>나의 기운</div>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--accent-gold)" }}>분포도</motion.div>
        </div>
      </div>
      <div style={{ flex: "1" }}>
        {elements?.map((el, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: el.color, flexShrink: 0 }} />
              <span style={{ fontSize: "0.85rem", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{el.name}</span>
            </div>
            <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-primary)", whiteSpace: "nowrap" }}>{Math.round((el.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FortuneContent() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type") || "daily";

  const typeConfig: Record<string, any> = {
    daily: {
      title: "오늘의 흐름",
      desc: "당신을 둘러싼 행운의 리듬",
      icon: <Sparkles className="w-6 h-6" />,
      tabs: ["종합", "재물", "애정", "건강", "사업"],
      keys: ["today", "wealth", "love", "health", "career"]
    },
    monthly: {
      title: "월간 운세",
      desc: "이달의 방향성과 삶의 변화",
      icon: <MoonStar className="w-6 h-6" />,
      tabs: ["종합", "1주차", "2주차", "3주차", "4주차", "5주차"],
      keys: ["this_month", "week1", "week2", "week3", "week4", "week5"]
    },
    yearly: {
      title: "연간 운세",
      desc: "올해의 거시적 판도와 운의 흐름",
      icon: <Scroll className="w-6 h-6" />,
      tabs: ["종합", "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
      keys: ["this_year", "m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "m9", "m10", "m11", "m12"]
    },
    wealth: {
      title: "재물운",
      desc: "인생의 단계별 금전적 기회와 성취",
      icon: <Coins className="w-6 h-6" />,
      tabs: ["초년: 10~20대", "청년: 30대", "중년: 40대", "장년: 50대", "말년: 60대 이후"],
      keys: ["early", "youth", "middle", "mature", "late"]
    },
    business: {
      title: "사업운",
      desc: "사회적 성취와 계약, 성장의 방향",
      icon: <Briefcase className="w-6 h-6" />,
      tabs: ["전체적인 흐름"],
      keys: ["overall"]
    },
    health: {
      title: "건강운",
      desc: "신체 에너지와 마음의 안녕",
      icon: <Activity className="w-6 h-6" />,
      tabs: ["초년: 10~20대", "청년: 30대", "중년: 40대", "장년: 50대", "말년: 60대 이후"],
      keys: ["early", "youth", "middle", "mature", "late"]
    },
    love: {
      title: "애정운",
      desc: "인연의 기운과 관계의 양상",
      icon: <Heart className="w-6 h-6" />,
      tabs: ["초년: 10~20대", "청년: 30대", "중년: 40대", "장년: 50대", "말년: 60대 이후"],
      keys: ["early", "youth", "middle", "mature", "late"]
    }
  };

  const currentType = typeConfig[typeParam] || typeConfig["daily"];

  const [date, setDate] = useState("1991-01-13");
  const [time, setTime] = useState("03:10");
  const [isLunar, setIsLunar] = useState(false);
  const [isLeap, setIsLeap] = useState(false);
  const [gender, setGender] = useState("M");
  const [birthCity, setBirthCity] = useState("서울");

  // 데이터 영속성 유지 (Sync with localStorage)
  useEffect(() => {
    const savedInfo = localStorage.getItem("user_birth_profile");
    if (savedInfo) {
      try {
        const parsed = JSON.parse(savedInfo);
        if (parsed.date) setDate(parsed.date);
        if (parsed.time) setTime(parsed.time);
        if (parsed.isLunar !== undefined) setIsLunar(parsed.isLunar);
        if (parsed.isLeap !== undefined) setIsLeap(parsed.isLeap);
        if (parsed.gender) setGender(parsed.gender);
        if (parsed.birthCity) setBirthCity(parsed.birthCity);
      } catch (e) { console.error("Error loading profile", e); }
    }
  }, []);

  useEffect(() => {
    const profile = { date, time, isLunar, isLeap, gender, birthCity };
    localStorage.setItem("user_birth_profile", JSON.stringify(profile));
  }, [date, time, isLunar, isLeap, gender, birthCity]);

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
  const [reading, setReading] = useState<any>("");
  const [activeTab, setActiveTab] = useState(0);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
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

  const [isLoading, setIsLoading] = useState(false);
  const [loadingTextIdx, setLoadingTextIdx] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [wisdomIdx, setWisdomIdx] = useState(0);
  const wisdomQuotes = [
    "하늘의 기운을 살피고 있습니다...",
    "당신만의 특별한 운세를 분석하는 중입니다...",
    "어제와 오늘, 내일의 흐름을 읽고 있습니다...",
    "명식의 기운을 문장으로 정리 중입니다...",
    "거의 다 되었습니다. 잠시만 기다려주세요..."
  ];

  useEffect(() => {
    if (!isLoading && bazi && reading) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [isLoading, bazi, reading]);

  const loadingTexts = [
    "우주의 기운을 모으는 중...",
    "명식을 바탕으로 시운을 살피고 있습니다...",
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
      }, 1500);

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
      clearInterval(textInterval);
      clearInterval(progressInterval);
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

  const cleanAstrologyTerms = (obj: any): any => {
    if (!obj) return obj;
    if (typeof obj === 'string') {
      return obj.replace(/([가-힣])\(\1\)/g, '$1')
                .replace(/[\u4e00-\u9faf]/g, '') // 모든 한자 제거
                .replace(/\(\s*\)/g, '')         // 빈 괄호 제거
                .replace(/\*\*([^*]+)\*\*/g, '$1')
                .replace(/<b>(.*?)<\/b>/g, '$1')
                .replace(/&nbsp;/g, ' ')
                .trim();
    }
    if (Array.isArray(obj)) return obj.map(cleanAstrologyTerms);
    if (typeof obj === 'object') {
      const cleaned: any = {};
      for (const key in obj) cleaned[key] = cleanAstrologyTerms(obj[key]);
      return cleaned;
    }
    return obj;
  };

  const getCacheKey = () => {
    const now = new Date();
    let timeModifier = "";
    if (typeParam === "daily") {
      timeModifier = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
    } else if (typeParam === "monthly") {
      timeModifier = `${now.getFullYear()}-${now.getMonth()+1}`;
    } else if (typeParam === "yearly") {
      timeModifier = `${now.getFullYear()}`;
    }
    return `fortune_v33_${date}_${time}_${isLunar}_${isLeap}_${gender}_${typeParam}_${timeModifier}`;
  };

  // 자동 캐시 로드 제거: 사용자가 직접 버튼을 눌러야만 넘어감 (다른 날짜 선택 가능하도록)

  const calculateFortune = async () => {
    // 운세 캐시 자동 초기화 (오늘의 흐름: 매일, 이달의 흐름: 매월, 올해의 흐름: 매년 기준 지난 캐시 삭제)
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const todaySuffix = `${currentYear}-${currentMonth}-${now.getDate()}`;
      const monthSuffix = `${currentYear}-${currentMonth}`;
      const yearSuffix = `${currentYear}`;

      Object.keys(localStorage).forEach(key => {
        if (!key.startsWith("fortune_")) return;
        
        // 오늘의 흐름 캐시 삭제
        if (key.includes("_daily_") && !key.endsWith(todaySuffix)) {
          localStorage.removeItem(key);
        } 
        // 이달의 흐름 캐시 삭제
        else if (key.includes("_monthly_") && !key.endsWith(monthSuffix)) {
          localStorage.removeItem(key);
        }
        // 올해의 흐름 캐시 삭제
        else if (key.includes("_yearly_") && !key.endsWith(yearSuffix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn("Cache cleanup failed:", e);
    }

    const cacheKey = getCacheKey();
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setBazi(parsed.bazi);
        setReading(parsed.reading);
        // 캐시가 있으면 즉시 결과로 스크롤만 하고 종료
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
        return;
      } catch (e) { localStorage.removeItem(cacheKey); }
    }

    setIsLoading(true);
    setBazi(null);
    setReading("");
    setActiveTab(0);

    // 즉시 결과/로딩 영역으로 스크롤
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);

    try {
      const [year, month, day] = date.split("-").map(Number);
      const [hour, min] = time.split(":").map(Number);

      if (!year || !month || !day) throw new Error("유효한 날짜가 아닙니다.");

      const sajuRes = getUnifiedSaju({
        date,
        time,
        isLunar,
        isLeap,
        gender,
        birthCity
      });

      if (!sajuRes) throw new Error("사주 산출에 실패했습니다.");

      const HANJA_TO_KR: Record<string, string> = {
        '甲': '갑', '乙': '을', '丙': '병', '丁': '정', '戊': '무', '己': '기', '庚': '경', '辛': '신', '壬': '임', '癸': '계',
        '子': '자', '丑': '축', '寅': '인', '卯': '묘', '辰': '진', '巳': '사', '午': '오', '未': '미', '申': '신', '酉': '유', '戌': '술', '亥': '해'
      };
      const toKr = (s: string) => s.split('').map(c => HANJA_TO_KR[c] ?? c).join('');

      const yearKr = toKr(sajuRes.pillarDetails.year.stem + sajuRes.pillarDetails.year.branch);
      const monthKr = toKr(sajuRes.pillarDetails.month.stem + sajuRes.pillarDetails.month.branch);
      const dayKr = toKr(sajuRes.pillarDetails.day.stem + sajuRes.pillarDetails.day.branch);
      const timeKr = toKr(sajuRes.pillarDetails.hour.stem + sajuRes.pillarDetails.hour.branch);

      const sajuMap: Record<string, string> = {
        '갑': '목', '을': '목', '병': '화', '정': '화', '무': '토', '기': '토', '경': '금', '신': '금', '임': '수', '계': '수',
        '자': '수', '축': '토', '인': '목', '묘': '목', '진': '토', '사': '화', '오': '화', '미': '토', '유': '금', '술': '토', '해': '수'
      };

      const allChars = [yearKr, monthKr, dayKr, timeKr].flatMap(gz => gz.split(''));
      const elementCounts: Record<string, number> = { '목': 0, '화': 0, '토': 0, '금': 0, '수': 0 };
      allChars.forEach(char => {
        const elem = sajuMap[char];
        if (elem) elementCounts[elem]++;
      });

      const sortedByRatio = Object.entries(elementCounts).sort(([, a], [, b]) => b - a);
      const strongestElem = sortedByRatio[0]?.[0] || '토';
      const weakestElem = sortedByRatio[sortedByRatio.length - 1]?.[0] || '수';

      const anchorKeywords = [
        `#${dayKr[0]}일간`,
        `#${strongestElem}기운강함`,
        `#${timeKr}시`,
      ];

      // 십신 맵핑 테이블 생성 (AI 정확도 향상)
      const calculateTenGod = (dm: string, target: string) => {
        const stems: Record<string, { element: string, polarity: string }> = {
          '갑': { element: '목', polarity: '+' }, '을': { element: '목', polarity: '-' },
          '병': { element: '화', polarity: '+' }, '정': { element: '화', polarity: '-' },
          '무': { element: '토', polarity: '+' }, '기': { element: '토', polarity: '-' },
          '경': { element: '금', polarity: '+' }, '신': { element: '금', polarity: '-' },
          '임': { element: '수', polarity: '+' }, '계': { element: '수', polarity: '-' }
        };
        const elements = ['목', '화', '토', '금', '수'];
        const me = stems[dm];
        const you = stems[target];
        if (!me || !you) return "";
        const meIdx = elements.indexOf(me.element);
        const youIdx = elements.indexOf(you.element);
        const diff = (youIdx - meIdx + 5) % 5;
        const samePolarity = me.polarity === you.polarity;
        if (diff === 0) return samePolarity ? "비견" : "겁재";
        if (diff === 1) return samePolarity ? "식신" : "상관";
        if (diff === 2) return samePolarity ? "편재" : "정재";
        if (diff === 3) return samePolarity ? "편관" : "정관";
        if (diff === 4) return samePolarity ? "편인" : "정인";
        return "";
      };

      const branchToStem: Record<string, string> = {
        '자': '계', '축': '기', '인': '갑', '묘': '을', '진': '무', '사': '병',
        '오': '정', '미': '기', '신': '경', '유': '신', '술': '무', '해': '임'
      };

      const dmChar = dayKr[0];
      const tenGodLookup = `
[필독: 내담자 일간(${dmChar}) 기준 십신 매핑표]
천간: ${Object.keys(branchToStem).map(b => branchToStem[b]).filter((v, i, a) => a.indexOf(v) === i).map(s => `${s}(${calculateTenGod(dmChar, s)})`).join(', ')}
지지: ${Object.keys(branchToStem).map(b => `${b}(${calculateTenGod(dmChar, branchToStem[b])})`).join(', ')}
* 반드시 이 매핑을 따라야 하며, 특히 ${dmChar === '신' ? '경금은 겁재, 신금은 비견' : ''}임을 명확히 인지하세요.
`;
      anchorKeywords.push(tenGodLookup);

      let cuspScript = "";
      const sajuHours = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23];
      if (sajuHours.includes(hour) && min >= 30 && min <= 35) {
        const currentHourBranch = toKr(sajuRes.pillarDetails.hour.branch);
        const branches = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
        const idx = branches.indexOf(currentHourBranch);
        const prevIdx = (idx - 1 + 12) % 12;
        const prevHourBranch = branches[prevIdx];
        cuspScript = `당신은 ${prevHourBranch}시의 묵직함과 ${currentHourBranch}시의 화려함이 교차하는 ${hour}시 ${min}분에 태어났습니다.`;
      }

      const strongestElemTrait = strongestElem + " 기운이 강해 주도적인 성향이 뚜렷하며,";
      const weakestElemTrait = weakestElem + " 기운이 상대적으로 약해 맺고 끊음이 아쉬울 수 있습니다.";

      let timeContext = "";
      const dTodayBase = new Date();
      const todayStr = dTodayBase.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
      
      const getPillars = (d: Date) => {
        try {
          const res = getUnifiedSaju({
              date: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
              time: "12:00",
              isLunar: false,
              gender: "M",
              birthCity: "서울"
          });
          const yStr = res.year.stemKo + res.year.branchKo;
          const mStr = res.month.stemKo + res.month.branchKo;
          const dStr = res.day.stemKo + res.day.branchKo;
          return { yStr, mStr, dStr };
        } catch {
          return { yStr: "", mStr: "", dStr: "" };
        }
      };
      
      const { yStr: ty, mStr: tm, dStr: td } = getPillars(dTodayBase);
      const todayEnhancedStr = `${todayStr}(${ty}년 ${tm}월 ${td}일)`;

      // 다음 달 만세력 미리 계산 (AI 오류 방지)
      const dNextMonth = new Date(dTodayBase);
      dNextMonth.setMonth(dNextMonth.getMonth() + 1);
      const { mStr: nmStr } = getPillars(dNextMonth);

      if (typeParam === "wealth") {
        timeContext = "이 내담자의 인생 전체 '재물운'을 [초년(10~20대), 청년(30대), 중년(40대), 장년(50대), 말년(60대 이후)] 5단계 생애주기로 나누어 풀어 주세요.";
      } else if (typeParam === "monthly") {
        timeContext = `오늘은 ${todayEnhancedStr}입니다. 현재는 ${tm}달이며, 다음 달 기운은 ${nmStr}입니다. 이번 달과 다음 달의 흐름을 아래 JSON 구조로 응답하세요.

반드시 아래 JSON 객체로 응답하세요:
{
  "this_month": {
    "content": "이번 달(${tm}월) 전체 종합 운세 (인사말 없이 바로 풀이 시작. 가독성을 위해 5문장마다 반드시 줄바꿈(\\n\\n)을 2번 사용하여 문단을 나눌 것. 반드시 포함: 이번 달 핵심 키워드 3개, 전체 기운 흐름, 좋은 점, 주의할 점을 구체적으로 명시)",
    "score": 85, (0-100 사이 숫자로 응답)
    "last_month_score": 78, (0-100 사이 숫자로 응답)
    "next_month_score": 82, (0-100 사이 숫자로 응답)
    "scores": {"wealth":80,"love":75,"career":85,"health":70} (각 0-100 사이 숫자로 응답)
  },
  "week1": { "content": "1주차 흐름 (숫자 날짜 표기 절대 금지, '1주차'로만 명시)" },
  "week2": { "content": "2주차 흐름 (숫자 날짜 표기 절대 금지, '2주차'로만 명시)" },
  "week3": { "content": "3주차 흐름 (숫자 날짜 표기 절대 금지, '3주차'로만 명시)" },
  "week4": { "content": "4주차 흐름 (숫자 날짜 표기 절대 금지, '4주차'로만 명시)" },
  "week5": { "content": "5주차 흐름 (숫자가 있는 경우에만 상세 서술, 없는 달이라도 빈칸이 아닌 자연스럽게 '마무리 시기' 혹은 '기운의 전환'으로 풀어주세요)" },
  "wealth": { "content": "이번 달(${tm}월) 재산의 흐름 (일간과 ${tm}월 기운의 상호작용 기반 분석)" },
  "love": { "content": "이번 달(${tm}월) 인연의 흐름 (남녀 공통 배우자 및 연인운 분석)" },
  "health": { "content": "이번 달(${tm}월) 기력의 조절 (오행의 조화를 살핀 건강 조언)" },
  "career": { "content": "이번 달(${tm}월) 업(業)의 성취 (직장 및 사업적 기회와 위기 분석)" },
  "lucky_days": "길일 목록",
  "unlucky_days": "흉일 목록",
  "gaewun": {"color":"색상","item":"물건","numbers":"숫자5개","direction":"방향"}
}

[필수 가이드라인]
- **따뜻하고 노련한 전문가 페르소나**: 당신은 30년 경력의 인자한 명리학자입니다. AI처럼 건조하게 분석만 하지 말고, 내담자의 고민에 공감하며 조언하는 **선생님**의 느낌으로 다정하고 부드럽게 서술하세요.
- **부드러운 구어체 어미**: "~입니다, ~음을 암시합니다" 보다는 "~네요, ~지요, ~일 거예요, ~하시면 좋겠어요" 등 대화하는 듯한 친근한 종결 어미를 적극적으로 섞어서 사용하세요.
- **한자(Hanja) 완전 금지**: 辛卯 -> 신묘, 卯 -> 묘 등 모든 명리학 용어와 한자어를 반드시 **한글로만** 작성하세요. 결과값에 한자가 단 하나라도 섞이지 않게 주의하세요.
- **전문 용어 설명**: 식신, 상관 등 용어는 지식을 뽐내기 위함이 아니라 이해를 돕기 위한 도구입니다. 기계적인 괄호() 설명 대신 문맥 속에 자연스럽게 "당신의 재능을 꽃피우는 식신의 기운이..." 처럼 사람이 말하듯 풀어서 최초 1회만 설명하세요.
- **가독성(문단 나누기)**: 글이 빽빽하지 않도록 5문장마다 혹은 내용 전환 시 반드시 줄바꿈(\\n\\n)을 2번 사용하여 문단을 시원하게 나누어 주세요.
- **중복 금지**: 이미 설명한 논리나 용어를 다른 카테고리에서 반복하지 마세요.
- 마크다운/HTML/영어 금지. 인사말 없이 바로 깊이 있는 풀이 시작.`;
      } else if (typeParam === "yearly") {
        timeContext = `오늘은 ${todayEnhancedStr}입니다. 올해 전체 운세를 아래 JSON 구조로 응답하세요. 
모든 월별 분석과 길월/흉월은 반드시 **양력(Solar Calendar)** 기준으로 서술하십시오. '음력' 표현과 기준을 절대 사용하지 마세요.

반드시 아래 JSON 객체로 응답하세요:
{
  "this_year": {
    "content": "올해 전체 종합운 (핵심만 공백 포함 150~200자로 매우 간결하게 서술). 인사말 없이 바로 풀이 시작. 반드시 포함: 핵심 키워드 3개, 올해의 흐름, 좋은 점, 주의할 점, 길월과 흉월 명시",
    "score": 85, (0-100 사이 숫자로 응답)
    "last_year_score": 75, (0-100 사이 숫자로 응답)
    "next_year_score": 82, (0-100 사이 숫자로 응답)
    "monthlyEnergies": [80,75,82,88,90,85,78,72,80,85,88,82], (각 0-100 사이 숫자로 응답)
    "scores": {"wealth":80,"love":75,"career":85,"health":70} (각 0-100 사이 숫자로 응답)
  },
  "m1": { "content": "1월의 기운 (일간과의 조화 및 핵심 포인트)" },
  "m2": { "content": "2월의 기운" },
  "m3": { "content": "3월의 기운" },
  "m4": { "content": "4월의 기운" },
  "m5": { "content": "5월의 기운" },
  "m6": { "content": "6월의 기운" },
  "m7": { "content": "7월의 기운" },
  "m8": { "content": "8월의 기운" },
  "m9": { "content": "9월의 기운" },
  "m10": { "content": "10월의 기운" },
  "m11": { "content": "11월의 기운" },
  "m12": { "content": "12월의 기운" },
  "wealth": { "content": "올해 재물운 (공백 포함 100~150자로 핵심만 요약)" },
  "love": { "content": "올해 애정운 (공백 포함 100~150자로 핵심만 요약)" },
  "health": { "content": "올해 건강운 (공백 포함 100~150자로 핵심만 요약)" },
  "career": { "content": "올해 사업운 (공백 포함 100~150자로 핵심만 요약)" },
  "lucky_months": "길월 목록 (예: 양력 3월, 양력 8월. 기호 없이 월만 표기할 것. '인월' 같은 명리 용어 절대 금지)",
  "unlucky_months": "흉월 목록 (예: 양력 7월, 양력 11월. 기호 없이 월만 표기할 것. '인월' 같은 명리 용어 절대 금지)",
  "gaewun": {"color":"색상","item":"물건","numbers":"숫자5개","direction":"방향"}
}

[필수 가이드라인]
- **품격 있는 대가의 페르소나**: 당신은 수많은 인생을 상담해온 베테랑 명리학자입니다. 내담자의 미래를 따뜻하게 비추는 등불처럼, 다정하고 명확한 조조(助言)를 건네세요.
- **부드러운 구어체**: AI 같은 건조한 문체는 지양하고, "~네요, ~가 좋겠어요, ~일 거예요" 등 신뢰감 있고 부드러운 종결 어미를 사용하세요.
- **한자(Hanja) 절대 금지**: 모든 용어와 오행은 반드시 **한글로만** 작성하세요. (辛卯 -> 신묘 등)
- **가독성(문단 나누기)**: 빽뻑한 느낌이 들지 않게 5문장마다 반드시 줄바꿈(\\n\\n)을 2번 사용하여 문단을 시원하게 나누어 주세요.
- **양력 기준**: 매월 분석 및 길월/흉월은 반드시 **양력** 기준으로 서술하세요.
- **2026년 월별 만세력(Pillars) 사전 제공**: 
  1월(기축 己丑), 2월(경인 庚寅), 3월(신묘 辛卯), 4월(임진 壬辰), 5월(계사 癸巳), 6월(갑오 甲午), 7월(을미 乙未), 8월(병신 丙申), 9월(정유 丁酉), 10월(무술 戊戌), 11월(기해 己亥), 12월(경자 庚子).
  반드시 위 정보를 바탕으로 정확한 월별 기운을 분석하세요.
- 마크다운/HTML/영어 사용 금지. 인사말 없이 바로 깊이 있는 풀이 시작.`;
      } else if (typeParam === "daily") {
        const dToday = new Date();
        const dYest = new Date(dToday); dYest.setDate(dYest.getDate() - 1);
        const dTom = new Date(dToday); dTom.setDate(dTom.getDate() + 1);
        
        const getIljin = (d: Date) => {
          try {
            const res = getUnifiedSaju({
              date: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
              time: "12:00",
              isLunar: false,
              gender: "M",
              birthCity: "서울"
            });
            return toKr(res.pillarDetails.day.stem + res.pillarDetails.day.branch);
          } catch (err) {
            return "";
          }
        };

        const todayIljin = getIljin(dToday);
        const yestIljin = getIljin(dYest);
        const tomIljin = getIljin(dTom);

        timeContext = `오늘은 ${todayStr}(${todayIljin}일)입니다. 어제(${yestIljin}일), 오늘(${todayIljin}일), 내일(${tomIljin}일) 3일간의 운세 흐름을 살펴 주세요.

반드시 아래 JSON 객체로 응답하세요:
{
  "yesterday": { "score": 85 }, (0-100 사이 숫자로 응답)
  "today": { 
    "content": "오늘 종합운 핵심 풀이 (반드시 공백 포함 150~200자 이내로 매우 간결하게 서술. 200자 초과 절대 금지. 만세력 일진 설명 포함)", 
    "score": 88, (0-100 사이 숫자로 응답)
    "scores": {"wealth":80,"love":75,"career":85,"health":70}, (각 0-100 사이 숫자로 응답)
    "gaewun": {"color":"색상","item":"행운의 물건(행동 불가)","numbers":"1~99숫자5개 쉼표구분","direction":"방향"}
  },
  "tomorrow": { "score": 90 },
  "wealth": { "content": "오늘 재물운 요약 (공백 포함 100~150자 이내. 150자 초과 금지)", "score": 80, "gaewun": {"color":"","item":"","numbers":"","direction":""} },
  "love": { "content": "오늘 애정운 요약 (공백 포함 100~150자 이내. 150자 초과 금지)", "score": 75, "gaewun": {"color":"","item":"","numbers":"","direction":""} },
  "health": { "content": "오늘 건강운 요약 (공백 포함 100~150자 이내. 150자 초과 금지)", "score": 70, "gaewun": {"color":"","item":"","numbers":"","direction":""} },
  "career": { "content": "오늘 사업운 요약 (공백 포함 100~150자 이내. 150자 초과 금지)", "score": 85, "gaewun": {"color":"","item":"","numbers":"","direction":""} }
}

[필수 가이드라인]
- **따뜻한 상담가 페르소나**: 당신은 내담자의 오늘 하루를 응원하는 다정한 명리학자입니다. 부드러운 말투(~네요, ~해보세요)로 사람이 직접 말하는 듯한 느낌을 주며, 짧지만 따뜻한 통찰을 전하세요.
- **한자(Hanja) 완전 금지**: 모든 오행과 용어는 한글로만 작성하세요. (辛卯 -> 신묘 등)
- **중복 금지**: 'today' 종합운의 내용을 다른 카테고리에서 그대로 반복하지 마세요.
- **실전 위주**: 각 영역(재물, 애정 등)에서는 명리 이론보다 실제 벌어질 상황과 행동 지침 위주로 서술하세요.
- 마크다운 기술 및 HTML 태그 절대 금지. 인사말 없이 바로 시작.`;
      } else {
        timeContext = `이 ${todayEnhancedStr} 기준으로 내담자의 '${currentType.title}' 테마에 집중하여 풀어 주세요. 결과가 도출된 근거(이유)를 반드시 포함해 주세요.`;
      }

      let systemPrompt = `당신은 청아매당의 최고 명리학 권위자입니다. 명리 데이터를 기반으로 깊이 있는 통찰을 제공하세요.
현재 연도는 2026년 병오년입니다. 모든 풀이와 예측은 반드시 2026년을 올해(현재)로 기준 삼아 서술하십시오.

[절대 금지 사항]
- 인사말(안녕하세요, 반갑습니다, 내담자님 등) 절대 금지. 인사 없이 바로 풀이 시작.
- 영어 단어 절대 금지. wealth, love, career, health 등 모든 단어를 한국어로만 작성.
- 마크다운 강조 기호(**, [], ##, -, *) 절대 사용 금지.
- HTML 태그(<b>, <br> 등) 절대 사용 금지.
- 오행을 언급할 때 한자 병기 금지. '목', '화', '토', '금', '수' 한글로만 작성. '목(木)' 형식 사용 금지.

왜 이런 결과가 나왔는지 명리학적 근거를 섞어서 이유를 명확히 설명해 주세요.
흉운이나 약점을 숨기지 말고 솔직하게 조언하되, 극복할 수 있는 실질적인 행동 지침을 함께 제시하세요.
반드시 JSON 형식으로 응답하며,
- daily: 'yesterday', 'today', 'tomorrow', 'wealth', 'love', 'health', 'business'
- monthly: 'this_month', 'week1'~'week5', 'wealth', 'love', 'health', 'career', 'lucky_days', 'unlucky_days', 'gaewun'
- yearly: 'this_year', 'm1'~'m12', 'wealth', 'love', 'health', 'career', 'lucky_months', 'unlucky_months', 'gaewun'
- 기타: ${currentType.keys[0]}
- 용어 설명 방식: 십신, 합/충 등 전문 용어만 최초 1회 문맥 속에 자연스럽게 풀어서(기계적인 괄호 사용 자제) 사람이 말하듯 서술. '배우자', '건강', '재물' 등 일반 단어는 절대 부연 설명 금지.
- **문체: 모든 문장은 반드시 '하십시오체' 또는 '해요체' 등 정중한 존댓말로 통일하십시오. 반말이나 불완전한 문장 종결을 절대 금지합니다.**
- 시기 표기: '올해' 대신 반드시 '2026년'으로 명시하십시오.
- 품격 있는 대가(大家)의 어조로, 내담자의 고민을 꿰뚫어 보는 듯한 깊이 있는 설명.
- 2026년 병오년을 기준으로 현재 내담자가 처한 명리적 환경을 면밀히 분석.

배경: ${anchorKeywords.join(", ")}
${cuspScript ? `특이사항: ${cuspScript}` : ""}

내용: ${strongestElemTrait} ${weakestElemTrait}
${timeContext}`;

      if (typeParam === "wealth") {
        systemPrompt = `너는 청아매당의 재물운 전문 최고 명리학 권위자야. 사용자의 사주 명식을 살펴 5단계 생애주기별(초년, 청년, 중년, 장년, 말년) 재물운을 심층적으로 풀어.
**[매우 중요: 현재 시간적 배경 필수 인지]**
현재 연도는 **2026년 병오년(丙午年)**입니다. 모든 풀이와 생애주기 도출은 반드시 2026년을 "올해(현재)"로 기준 삼아 계산하십시오.

단순히 돈이 들어온다/나간다는 식의 뻔한 풀이를 넘어서, 각 시기의 재물운이 "왜" 그런 흐름을 보이는지에 대해 용신(用神)과 사주의 구조적 특징 등 명리학적 근거를 반드시 포함하여 설명해.
무조건 좋은 말만 하지 말고, 금전적 손실이나 파재(破財)의 위기가 있는 흉운을 객관적으로 짚어주고, 이를 방어할 수 있는 실질적인 자산 관리법과 개운법(Gaewun)을 상세히 조언해.
반드시 JSON 형식으로 응답하며, 'early', 'youth', 'middle', 'mature', 'late' 5개의 키 내부에 아래의 구조를 완벽하게 지켜서 반환해.
ai언어 금지! (AI 특유의 말투를 절대 쓰지 마세요. 품격 있는 전문가의 어투를 사용하세요.)

# Output JSON Structure for EACH stage (early, youth, middle, mature, late)
# Important: Use 'Korean(Kanji)' format ONLY for the first mention of the 5 Elements (Wood, Fire, Earth, Metal, Water). Example: 목(木), 화(火). For ALL other terms including Stems and Branches, and for subsequent mentions of elements, use plain Korean ONLY. STRICTLY FORBID Kanji-only or English terms. DO NOT use formatting markers like ** or HTML tags like <b>. 
# Quality: Use natural, professional, high-quality Korean prose. Avoid weird, literal, or overly technical phrasings. Ensure the consultation feels premium and insightful.
{
  "summary": "(해당 시기의 재물운 핵심 총평 요약 및 '왜' 그런지에 대한 명리적 이유 포함, 4~5문장 내외)",
  "cards": {
    "focus": { "title": "핵심 재물원 등 한 줄 요약", "content": "어디서 돈이 들어오는지 구체적 지침" },
    "expense": { "title": "지출 방어 등 한 줄 요약", "content": "돈이 새어나가는 곳과 대비책" },
    "partners": { "title": "재물 귀인 등 한 줄 요약", "content": "재물운을 돕는 인연이나 환경" },
    "risk": { "title": "투자 리스크 등 한 줄 요약", "content": "투자와 관련된 주의사항" }
  },
  "action_tips": {
    "do": "이 시기 가장 중요한 재물 실천 지침 1가지",
    "dont": "절대 피해야 할 재물 관련 행동 1가지"
  },
  "gaewun": {
    "color": "추천 색상",
    "direction": "추천 방향",
    "element": "추천 오행(목,화,토,금,수 중 택1)",
    "item": "추천 물건"
  }
}
* 주의: 모든 시기(early~late)에 대하여 위 포맷을 빠짐없이 작성.

배경: ${anchorKeywords.join(", ")}
${cuspScript ? `특이사항: ${cuspScript}` : ""}
내용: ${strongestElemTrait} ${weakestElemTrait}`;
      } else if (typeParam === "health") {
        systemPrompt = `너는 청아매당의 건강 전문 최고 명리학 권위자야. 사용자의 사주 명식을 살펴 5단계 생애주기별(초년, 청년, 중년, 장년, 말년) 건강운과 신체적/정신적 에너지를 심층적으로 풀어.
**[매우 중요: 현재 시간적 배경 필수 인지]**
현재 연도는 **2026년 병오년(丙午年)**입니다. 모든 풀이와 예측은 반드시 2026년을 "올해(현재)"로 기준 삼아 서술하십시오. 절대 2024년이나 2025년을 현재로 간주해서는 안 됩니다.

각 시기의 건강 상태나 발병 위험이 "왜" 그렇게 나타나는지(예: 특정 오행의 과다/부족, 운의 충돌 등) 명리적 근거를 반드시 포함해.
무조건 건강하다는 뻔한 말 대신, 객관적으로 취약한 신체 기관이나 스트레스 요인을 명확히 짚어주고, 이를 예방/극복할 수 있는 실질적인 생활 습관과 개운법(Gaewun)을 구체적으로 조언해.
반드시 JSON 형식으로 응답하며, 'early', 'youth', 'middle', 'mature', 'late' 5개의 키 내부에 아래의 구조를 완벽하게 지켜서 반환해.
ai언어 금지! (AI 모델 특유의 딱딱한 말투를 절대 쓰지 마세요. 품격 있는 전문가의 어투를 사용하세요.)

# Output JSON Structure for EACH stage (early, youth, middle, mature, late)
# Important: Use 'Korean(Kanji)' format ONLY for the first mention of the 5 Elements. Example: 목(木). For all other terms, use plain Korean. STRICTLY FORBID Kanji-only, Korean-only, or English terms. DO NOT use formatting markers like ** or HTML tags like <b>. 
# Quality: Use natural, professional, high-quality Korean prose. Avoid weird, literal, or overly technical phrasings. Ensure the consultation feels premium and insightful.
{
  "summary": "(해당 시기의 건강운 핵심 총평 요약 및 명리적 근거 포함, 4~5문장 내외)",
  "cards": {
    "physical": { "title": "핵심 신체 기운 등 한 줄 요약", "content": "주의해야 할 신체 부위나 강화해야 할 체력 요소" },
    "mental": { "title": "정신 건강 지수 등 한 줄 요약", "content": "스트레스 관리나 마음의 여유를 위한 조언" },
    "lifestyle": { "title": "생활 습관 제안 등 한 줄 요약", "content": "이 시기 꼭 지켜야 할 식습관이나 활동 지침" },
    "habits": { "title": "운동 및 휴식 등 한 줄 요약", "content": "권장하는 운동 강도나 휴식의 방식" }
  },
  "action_tips": {
    "do": "건강을 위해 꼭 실천해야 할 습관 1가지",
    "dont": "건강을 위해 반드시 피해야 할 행동 1가지"
  },
  "gaewun": {
    "color": "추천 색상",
    "direction": "추천 방향",
    "element": "추천 오행(목,화,토,금,수 중 택1)",
    "item": "추천 물건"
  }
}
* 주의: 모든 시기(early~late)에 대하여 위 포맷을 빠짐없이 작성.

배경: ${anchorKeywords.join(", ")}
${cuspScript ? `특이사항: ${cuspScript}` : ""}
내용: ${strongestElemTrait} ${weakestElemTrait}`;
      } else if (typeParam === "business") {
        systemPrompt = `너는 청아매당의 비즈니스 전문 사주 가명가이자 전략 컨설턴트야. 사용자의 사주 명식을 살펴 단순한 운세를 넘어 실제 사업 경영에 도움이 되는 실무적이고 통찰력 있는 조언을 제공해.
**[매우 중요: 현재 시간적 배경 필수 인지]**
현재 연도는 **2026년 병오년(丙午年)**입니다. 모든 분석과 예측은 반드시 2026년을 "올해(현재)"로 기준 삼아 서술하십시오. 절대 2024년이나 2025년을 현재로 간주해서는 안 됩니다.

사업적 조언뿐만 아니라, 사용자의 사주 기운이 현재 비즈니스 상황(확장, 축소, 위기 등)과 "왜" 그렇게 상호작용하는지 용신(用神) 등 명리적 근거를 설명해.
무조건 성공한다는 뻔한 말 대신, 발생 가능한 리스크(자금줄 막힘, 배신, 사기 등)와 흉운을 객관적으로 짚어주고, 이를 방어하기 위한 구체적인 경영 전략과 개운법(Gaewun)을 조언해.
반드시 JSON 형식으로 응답하며, '${currentType.keys[0]}' 단일 키 내부에 아래의 JSON 구조를 완벽하게 지켜서 반환해.
ai언어 금지! (AI 언어 모델이나 챗봇 특유의 말투를 절대 쓰지 마세요. 품격 있는 전문가의 어투를 사용하세요.)

# Output JSON Structure (Strictly follow this structure)
# Important: Use 'Korean(Kanji)' format ONLY for the first mention of the 5 Elements. Example: 목(木). For all other terms, use plain Korean. STRICTLY FORBID Kanji-only or English terms. DO NOT use formatting markers like ** or HTML tags like <b>. 
# Quality: Use natural, professional, high-quality Korean prose. Avoid weird, literal, or overly technical phrasings. Ensure the consultation feels premium and insightful.
{
  "${currentType.keys[0]}": {
    "summary": "(총론: 현재 사업운의 핵심 총평과 방향성 및 명리적 이유 요약, 4~5문장 내외)",
    "energy": [
      { "name": "목(기획)", "value": 0~100사이_점수, "color": "#81b29a" },
      { "name": "화(확장)", "value": 0~100사이_점수, "color": "#e07a5f" },
      { "name": "토(중립)", "value": 0~100사이_점수, "color": "#D4A373" },
      { "name": "금(결실)", "value": 0~100사이_점수, "color": "#C9A050" },
      { "name": "수(관리)", "value": 0~100사이_점수, "color": "#3d5a80" }
    ],
    "cards": {
      "timing": { "title": "가을 (8~10월) 등 한 줄 요약", "content": "시기별 구체적 행동 지침" },
      "partners": { "title": "핵심 파트너 등 한 줄 요약", "content": "협력관계를 맺어야 할 상대나 주의해야 할 상대" },
      "capital": { "title": "보수적 운용 등 한 줄 요약", "content": "사업적 자금 순환 및 지출 관리 전략" },
      "risk": { "title": "계약 검토 등 한 줄 요약", "content": "발생 가능한 리스크와 대비책" }
    },
    "action_tips": {
      "do": "가장 중요한 실천 지침 1가지",
      "dont": "절대 피해야 할 행동 1가지"
    }
  }
}
* 주의: energy 배열의 모든 value 합산이 꼭 100일 필요는 없으며, 사용자의 명식에 따른 각각의 잠재 에너지 점수를 부여할 것.

배경: ${anchorKeywords.join(", ")}
${cuspScript ? `특이사항: ${cuspScript}` : ""}
내용: ${strongestElemTrait} ${weakestElemTrait}`;
      } else if (typeParam === "love") {
        systemPrompt = `너는 청아매당의 애정운(연애/결혼) 전문 최고 명리학 권위자야. 사용자의 사주 명식을 분석하여 5단계 생애주기별(초년, 청년, 중년, 장년, 말년) 애정운과 인연의 흐름을 심층적으로 분석해.
**[매우 중요: 현재 시간적 배경 필수 인지]**
현재 연도는 **2026년 병오년(丙午年)**입니다. 모든 분석과 예측은 반드시 2026년을 "올해(현재)"로 기준 삼아 서술하십시오. 절대 2024년이나 2025년을 현재로 간주해서는 안 됩니다.

인연의 흐름이 "왜" 그렇게 나타나는지 사용자의 사주상 배우자 기운(재성/관성)의 위치나 합(合), 충(沖) 등의 명리적 근거를 섞어 설명해.
무조건 좋은 인연을 만난다는 식의 뻔한 말 대신, 이별수나 갈등이 예상되는 흉운 시기를 객관적으로 짚어주고, 관계를 지키거나 더 나은 인연을 끌어당기기 위한 실질적 개운법(Gaewun)을 조언해.
반드시 JSON 형식으로 응답하며, 'early', 'youth', 'middle', 'mature', 'late' 5개의 키 내부에 아래의 구조를 완벽하게 지켜서 반환해.
ai언어 금지! (AI 모델 특유의 딱딱한 말투를 절대 쓰지 마세요. 품격 있는 전문가의 어투를 사용하세요.)

# Output JSON Structure for EACH stage (early, youth, middle, mature, late)
# Important: Use 'Korean(Kanji)' format ONLY for the first mention of the 5 Elements. Example: 목(木). For all other terms, use plain Korean. STRICTLY FORBID Kanji-only or English terms. DO NOT use formatting markers like ** or HTML tags like <b>. 
# Quality: Use natural, professional, high-quality Korean prose. Avoid weird, literal, or overly technical phrasings. Ensure the consultation feels premium and insightful.
{
  "summary": "(해당 시기의 애정운 핵심 총평 요약 및 명리적 이유 포함, 4~5문장 내외)",
  "cards": {
    "romance": { "title": "연애 에너지 성향 등 한 줄 요약", "content": "이 시기의 전반적인 연애 기운과 태도" },
    "partners": { "title": "이상적인 인연 등 한 줄 요약", "content": "어떤 사람과 합이 좋은지, 인연이 닿는 시기" },
    "caution": { "title": "관계의 주의점 등 한 줄 요약", "content": "갈등 요소나 경계해야 할 태도" },
    "timing": { "title": "인연의 타이밍 등 한 줄 요약", "content": "결혼이나 깊은 관계로 발전하기 좋은 시기" }
  },
  "action_tips": {
    "do": "사랑을 맺기 위해 꼭 실천해야 할 행동 1가지",
    "dont": "관계 유지를 위해 반드시 피해야 할 행동 1가지"
  },
  "gaewun": {
    "color": "추천 색상",
    "direction": "추천 방향",
    "element": "추천 오행(목,화,토,금,수 중 택1)",
    "item": "추천 물건"
  }
}
* 주의: 모든 시기(early~late)에 대하여 위 포맷을 빠짐없이 작성.

배경: ${anchorKeywords.join(", ")}
${cuspScript ? `특이사항: ${cuspScript}` : ""}
내용: ${strongestElemTrait} ${weakestElemTrait}`;
      }

      const payload = {
        systemPrompt,
        sajuJson: {
          user_info: { 
            gender: gender === "M" ? "male" : "female", 
            day_master: `${dayKr[0]}(${sajuMap[dayKr[0]]})` 
          },
          elements_ratio: elementCounts,
          type: typeParam
        }
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

        if (apiRes && apiRes.ok) break;

        if (apiRes && apiRes.status === 503 && retries < maxRetries) {
          retries++;
          await delay(1500 * retries); // Exponential backoff: 1.5s, 3s
          continue;
        }

        const errorData = await apiRes.json().catch(() => ({}));
        let userMsg = errorData.details || errorData.error || "API 요청 실패";
        
        if (apiRes.status === 503 || userMsg.includes("503") || userMsg.includes("overload")) {
          userMsg = "현재 운세 풀이 서버에 접속자가 많아 기운을 읽는 데 시간이 걸리고 있습니다. 잠시 후 다시 시도해 주세요.";
        }
        
        throw new Error(userMsg);
      }

      if (!apiRes || !apiRes.ok) throw new Error("API 요청 실패");
      let llmResultRaw = await apiRes.json();
      const llmResult = cleanAstrologyTerms(llmResultRaw);
      const finalReading: Record<string, any> = {};

      if (["daily", "monthly", "yearly"].includes(typeParam)) {
        // Elements Calculation
        const elementsValues = [
          { label: "목", value: (elementCounts['목']/8)*100, color: "#81b29a" },
          { label: "화", value: (elementCounts['화']/8)*100, color: "#e07a5f" },
          { label: "토", value: (elementCounts['토']/8)*100, color: "#f2cc8f" },
          { label: "금", value: (elementCounts['금']/8)*100, color: "#C9A050" },
          { label: "수", value: (elementCounts['수']/8)*100, color: "#3d5a80" }
        ];
        finalReading.overallEnergy = elementsValues;

        for (const key of currentType.keys) {
          const raw = llmResult[key] || (key === 'career' ? llmResult['business'] : undefined);
          if (!raw) {
            console.error(`Missing key [${key}] in llmResult:`, llmResultRaw);
            throw new Error(`기운을 완벽하게 읽어내지 못했습니다. 다시 한 번 풀이를 시도해 주세요.`);
          }
          if (typeof raw === 'string') {
            finalReading[key] = { content: raw, score: 80, gaewun: { color: "금색", direction: "동쪽", element: "금(金)", item: "장신구" } };
          } else if (raw && (raw.content || raw.analysis || raw.text)) {
            finalReading[key] = {
              content: raw.content || raw.analysis || raw.text,
              score: raw.score || 80,
              gaewun: raw.gaewun || { color: "금색", direction: "동쪽", element: "금(金)", item: "장신구", numbers: "1,2,3,4,5" },
              scores: raw.scores || null
            };
          } else {
            console.error(`Malformed content for key [${key}]:`, raw);
            throw new Error(`기운을 완벽하게 읽어내지 못했습니다. 다시 한 번 풀이를 시도해 주세요.`);
          }
        }
        if (typeParam === "daily") {
          if (llmResult.yesterday) finalReading.yesterday = { score: llmResult.yesterday.score || 80 };
          if (llmResult.tomorrow) finalReading.tomorrow = { score: llmResult.tomorrow.score || 80 };
        }
      } else {
        for (const key of currentType.keys) {
          const raw = llmResult[key] || (llmResult.wealth_stages && llmResult.wealth_stages[key]);
          if (!raw) throw new Error("기운을 완벽하게 읽어내지 못했습니다. 다시 한 번 풀이를 시도해 주세요.");
          finalReading[key] = raw;
        }
      }

      if (typeParam === "wealth" || typeParam === "health" || typeParam === "love" || typeParam === "daily" || typeParam === "monthly" || typeParam === "yearly" ) {
        const counts = elementCounts || { '목':0, '화':0, '토':0, '금':0, '수':0 };
        finalReading.overallEnergy = Object.entries(counts).map(([name, value]) => ({ name: name === '목' ? '목' : name === '화' ? '화' : name === '토' ? '토' : name === '금' ? '금' : '수', label: name, value: (value/8)*100, color: { '목':'#81b29a','화':'#e07a5f','토':'#D4A373','금':'#FAC42D','수':'#3d5a80' }[name] }));
      }

      setBazi(sajuRes);
      setReading(finalReading);
      localStorage.setItem(cacheKey, JSON.stringify({ bazi: sajuRes, reading: finalReading }));
    } catch (err: any) {
      console.error(err);
      alert(err.message || "풀이에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const RollingNumber = ({ value }: { value: number }) => {
    const [dV, setDV] = useState(0);
    useEffect(() => {
      let s = 0; if (s === value) { setDV(value); return; }
      const t = setInterval(() => { s++; setDV(s); if (s >= value) clearInterval(t); }, 1000 / (value || 1));
      return () => clearInterval(t);
    }, [value]);
    return <span>{dV}</span>;
  };

  const FiveElementsDonut = ({ elements }: { elements: any[] }) => {
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
  };

  const SubScoreGraph = ({ scores }: { scores: any }) => {
    if (!scores) return null;
    const items = [{ l: "재물", v: scores.wealth, c: "#C9A050" }, { l: "애정", v: scores.love, c: "#e07a5f" }, { l: "사업", v: scores.career, c: "#81b29a" }, { l: "건강", v: scores.health, c: "#3d5a80" }];
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "40px" }}>
        {items.map((it, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ position: "relative", height: "80px", background: "rgba(0,0,0,0.03)", borderRadius: "10px", marginBottom: "8px", overflow: "hidden" }}>
              <motion.div initial={{ height: 0 }} animate={{ height: `${it.v}%` }} transition={{ duration: 1, delay: i * 0.1 }} style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: it.c }} />
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "0.75rem", fontWeight: "700", color: it.v > 50 ? "white" : "var(--text-primary)" }}>{it.v}</div>
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{it.l}</div>
          </div>
        ))}
      </div>
    );
  };

  const CopyButton = ({ content }: { content: string }) => {
    const [c, setC] = useState(false);
    return (
      <button onClick={() => { navigator.clipboard.writeText(content); setC(true); setTimeout(() => setC(false), 2000); }} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "12px", background: c ? "#81b29a" : "rgba(42, 54, 95, 0.05)", color: c ? "white" : "var(--accent-indigo)", border: "1px solid var(--glass-border)", fontSize: "0.85rem", fontWeight: "600", marginBottom: "24px" }}>
        {c ? <Check size={14} /> : <Copy size={14} />} {c ? "복사완료" : "리포트 복사"}
      </button>
    );
  };

  const renderInlineHighlights = (text: string) => {
    if (!text || typeof text !== 'string') return text;
    const parts = text.replace(/\*\*/g, '').split(/(목\(木\)|화\(火\)|토\(土\)|금\(金\)|수\(水\))/g);
    return parts.map((p, i) => <span key={i} style={{ color: { '목(木)':'#81b29a','화(火)':'#e07a5f','토(土)':'#D4A373','금(金)':'#FAC42D','수(水)':'#3d5a80' }[p] || 'inherit', fontWeight: { '목(木)':'800','화(火)':'800','토(土)':'800','금(金)':'800','수(水)':'800' }[p] ? '800' : 'normal' }}>{p}</span>);
  };

  const renderHighlightedText = (text: any, noColor: boolean = false) => {
    if (!text || typeof text !== 'string') return null;
    const colors: any = noColor ? {} : { '목(木)':'#81b29a', '화(火)':'#e07a5f', '토(土)':'#D4A373', '금(金)':'#FAC42D', '수(水)':'#3d5a80' };
    return text.replace(/\*\*/g, '').split('\n').filter((p:any) => p.trim() !== '').map((para:any, i:any) => {
      const parts = para.split(/(목\(木\)|화\(火\)|토\(土\)|금\(金\)|수\(水\))/g);
      const isH = /^[\d\s]*[📍📅🔍🛡️✨🎯]/.test(para.trim());
      return (
        <div key={i} style={{ marginBottom: isH ? "20px" : "12px", marginTop: isH && i > 0 ? "28px" : "0", lineHeight: "1.85", fontSize: isH ? "clamp(1rem, 4vw, 1.15rem)" : "clamp(0.88rem, 3.8vw, 1rem)", fontWeight: isH ? "600" : "400", color: isH ? "var(--accent-indigo)" : "var(--text-secondary)", background: isH ? "transparent" : "rgba(255, 255, 255, 0.4)", padding: isH ? "0" : "clamp(10px, 3vw, 16px) clamp(12px, 3.5vw, 20px)", borderRadius: "14px", border: isH ? "none" : "1px solid rgba(42, 54, 95, 0.05)", wordBreak: "keep-all", overflowWrap: "break-word" }}>
          {parts.map((part:any, j:any) => <span key={j} style={{ color: colors[part] || 'inherit', fontWeight: colors[part] ? '800' : 'inherit' }}>{part}</span>)}
        </div>
      );
    });
  };

  return (
    <main ref={topRef} style={{ minHeight: "100vh", position: "relative", background: "var(--bg-primary)", padding: "0 0 80px" }}>
      <div className="max-w-xl mx-auto px-4 relative" style={{ zIndex: 10 }}>
        
        <Link href="/" style={{ textDecoration: "none", display: "inline-block", marginBottom: "8px", marginTop: "12px" }}>
          <button style={{ background: "rgba(42, 54, 95, 0.05)", border: "none", color: "var(--accent-indigo)", cursor: "pointer", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ArrowLeft size={18} />
          </button>
        </Link>

        {/* Centered Header (Matching Saju style) */}
        <div style={{ textAlign: "center", marginBottom: "32px", paddingTop: "0px" }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "inline-block", background: "var(--accent-cherry)", color: "var(--accent-indigo)", padding: "1px 6px", borderRadius: "8px", fontSize: "0.45rem", fontWeight: "700", marginBottom: "4px" }}>CHEONG-A MAE-DANG</motion.div>
            <h1 onClick={handleDevReset} style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--accent-indigo)" }}>{currentType.title}</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{currentType.desc}</p>
        </div>

        {!bazi && (
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
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }} onClick={calculateFortune} disabled={isLoading} style={{ width: "100%", marginTop: "24px", padding: "16px", borderRadius: "16px", background: "var(--accent-indigo)", color: "white", border: "none", fontSize: "1rem", fontWeight: "600", cursor: isLoading ? "not-allowed" : "pointer" }}>
              {isLoading ? "기운을 읽는 중..." : "나의 운세 확인하기"}
            </motion.button>
          </section>
        )}


        <WheelDatePicker isOpen={isDatePickerOpen} onClose={() => setIsDatePickerOpen(false)} onConfirm={(y, m, d, lunar) => { setDate(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`); setIsLunar(lunar); setIsDatePickerOpen(false); }} initialDate={date} initialIsLunar={isLunar} />

        <AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} ref={resultRef} style={{ textAlign: "center", padding: "60px 24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
              {/* Circular Percentage Gauge */}
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

              {/* Single animated status text */}
              <AnimatePresence mode="wait">
                <motion.p 
                  key={wisdomIdx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.5 }}
                  style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.5", margin: 0, maxWidth: "280px" }}
                >
                  {wisdomQuotes[wisdomIdx]}
                </motion.p>
              </AnimatePresence>

              <div style={{ marginTop: "24px", fontSize: "0.75rem", color: "var(--text-secondary)", opacity: 0.7, fontWeight: "500" }}>
                분석 완료까지 1~2분 정도 소요될 수 있습니다.
              </div>
            </motion.div>
          )}

          {!isLoading && bazi && reading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} ref={resultRef}>
              <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <div 
                  onClick={handleDevReset}
                  style={{ display: "inline-block", padding: "8px 20px", background: "var(--accent-indigo)", borderRadius: "30px", color: "white", fontSize: "0.85rem", fontWeight: "600", marginBottom: "16px", cursor: "pointer", userSelect: "none" }}
                >
                  분석 결과
                </div>
                <h2 style={{ fontSize: "2rem", fontWeight: "700", color: "var(--text-primary)" }}>운명의 조각들을 찾았습니다</h2>
              </div>

              {["wealth", "health", "love", "business"].includes(typeParam) ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "60px" }}>
                  {typeParam === "business" && reading.overall?.energy && (
                    <div style={{ padding: "40px 24px", background: "white", borderRadius: "28px", border: "1px solid var(--glass-border)", marginBottom: "32px" }}>
                      <h3 style={{ textAlign: "center", marginBottom: "24px", fontSize: "1rem", fontWeight: "600" }}>🎯 비즈니스 에너지 분포</h3>
                      <FiveElementsDonut elements={reading.overall.energy} />
                    </div>
                  )}
                  {reading.overallEnergy && typeParam !== "business" && (
                    <div style={{ padding: "40px 24px", background: "white", borderRadius: "28px", border: "1px solid var(--glass-border)", marginBottom: "48px" }}>
                      <h3 style={{ textAlign: "center", marginBottom: "32px", fontSize: "1.1rem", fontWeight: "600", color: "var(--accent-indigo)" }}>🎨 타고난 오행 에너지</h3>
                      <FiveElementsDonut elements={reading.overallEnergy} />
                    </div>
                  )}
                  {currentType.keys.map((key: string, index: number) => {
                    const stageData = reading[key] || {};
                    const secColor = typeParam === "wealth" ? ["#81b29a", "#e07a5f", "#D4A373", "#3d5a80", "#6c5b7b"][index] : "var(--accent-gold)";
                    return (
                      <div key={key} style={{ borderBottom: index === currentType.keys.length - 1 ? "none" : "1px solid var(--glass-border)", paddingBottom: "clamp(40px, 8vw, 64px)" }}>
                        <h3 style={{ fontSize: "clamp(1.2rem, 4.5vw, 1.6rem)", marginBottom: "clamp(16px, 4vw, 28px)", color: secColor, textAlign: "center" }}>{currentType.tabs[index]}</h3>
                        <div style={{ fontSize: "clamp(0.88rem, 3.8vw, 1.05rem)", marginBottom: "clamp(20px, 4vw, 32px)", borderLeft: `4px solid ${secColor}`, paddingLeft: "clamp(12px, 3vw, 16px)", lineHeight: "1.7" }}>"{renderInlineHighlights(stageData.summary)}"</div>
                        <div style={{ display: "grid", gap: "12px", marginBottom: "clamp(20px, 4vw, 32px)" }}>
                          {Object.entries(stageData.cards || {}).map(([cK, cD]: [string, any], i) => (
                            <div key={i} style={{ background: "rgba(255,255,255,0.7)", padding: "20px", borderRadius: "16px", border: "1px solid var(--glass-border)", display: "flex", gap: "16px" }}>
                              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(0,0,0,0.03)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Target size={20} /></div>
                              <div><div style={{ fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>{cD?.title}</div><div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>{cD?.content}</div></div>
                            </div>
                          ))}
                        </div>
                        <div style={{ padding: "24px", background: "rgba(201, 160, 80, 0.05)", borderRadius: "20px", border: "1px solid rgba(201, 160, 80, 0.15)", marginBottom: "32px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div style={{ display: "flex", gap: "12px" }}><div style={{ fontWeight: "700", color: "#81b29a" }}>강조!</div><div>{stageData.action_tips?.do}</div></div>
                            <div style={{ height: "1px", background: "rgba(0,0,0,0.05)" }} /><div style={{ display: "flex", gap: "12px" }}><div style={{ fontWeight: "700", color: "#e07a5f" }}>주의!</div><div>{stageData.action_tips?.dont}</div></div>
                          </div>
                        </div>
                        {stageData.gaewun && (
                          <div style={{ padding: "24px", background: "rgba(255, 255, 255, 0.7)", borderRadius: "20px", border: `1px solid rgba(0,0,0,0.05)` }}>
                            <div style={{ fontWeight: "700", color: secColor, marginBottom: "20px", fontSize: "1rem" }}>✨ 추천 개운법</div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                              {[{ t: "색상", v: stageData.gaewun.color }, { t: "방향", v: stageData.gaewun.direction }, { t: "오행", v: stageData.gaewun.element }, { t: "물건", v: stageData.gaewun.item }].map((it, i) => (
                                <div key={i} style={{ background: "white", padding: "16px", borderRadius: "16px", border: "1px solid var(--glass-border)" }}><div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{it.t}</div><div style={{ fontSize: "0.9rem", fontWeight: "600" }}>{it.v}</div></div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ background: "rgba(255, 255, 255, 0.7)", padding: "clamp(24px, 5vw, 40px) clamp(16px, 4vw, 24px)", borderRadius: "clamp(20px, 5vw, 32px)", border: "1px solid var(--glass-border)", boxShadow: "0 25px 60px rgba(42, 54, 95, 0.06)" }}>
                  {typeParam === "daily" && reading.yesterday && <ThreeDayScoreGraph scores={{ yesterday: reading.yesterday.score, today: reading.today.score, tomorrow: reading.tomorrow.score }} />}
                  {typeParam === "monthly" && reading.this_month && <ThreeDayScoreGraph scores={{ yesterday: reading.last_month_score || Math.round((reading.this_month?.score || 80) * 0.9), today: reading.this_month?.score || 80, tomorrow: reading.next_month_score || Math.round((reading.this_month?.score || 80) * 1.05) }} labels={["지난달", "이번달", "다음달"]} />}
                  {typeParam === "yearly" && reading.this_year && <ThreeDayScoreGraph scores={{ yesterday: reading.last_year_score || Math.round((reading.this_year?.score || 80) * 0.92), today: reading.this_year?.score || 80, tomorrow: reading.next_year_score || Math.round((reading.this_year?.score || 80) * 1.03) }} labels={["작년", "올해", "내년"]} />}
                  
                  {reading.overallEnergy && (
                    <div style={{ padding: "40px 24px", background: "white", borderRadius: "28px", border: "1px solid var(--glass-border)", marginBottom: "32px" }}>
                      <h3 style={{ textAlign: "center", marginBottom: "32px", fontSize: "1.1rem", fontWeight: "600", color: "var(--accent-indigo)" }}>🎨 타고난 오행 에너지</h3>
                      <FiveElementsDonut elements={reading.overallEnergy} />
                    </div>
                  )}

                  {reading.today?.scores && typeParam === "daily" && <SubScoreGraph scores={reading.today.scores} />}
                  {reading.this_month?.scores && typeParam === "monthly" && <SubScoreGraph scores={reading.this_month.scores} />}
                  {reading.this_year?.scores && typeParam === "yearly" && <SubScoreGraph scores={reading.this_year.scores} />}
                  {typeParam === "yearly" && reading.this_year?.monthlyEnergies && <div style={{ background: "white", padding: "24px", borderRadius: "24px", marginBottom: "40px", border: "1px solid rgba(42, 54, 95, 0.08)" }}><LineChart data={reading.this_year.monthlyEnergies} /></div>}
                  {typeParam === "daily" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
                      {currentType.keys.map((key: string, idx: number) => {
                        const emojiMap: Record<string, string> = { "종합": "🌟", "재물": "💰", "애정": "❤️", "건강": "🍀", "사업": "💼" };
                        const emoji = emojiMap[currentType.tabs[idx]] || "✨";
                        return (
                          <div key={key}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                              <div style={{ width: "4px", height: "18px", background: "var(--accent-gold)", borderRadius: "2px" }} />
                              <h3 style={{ fontSize: "1.25rem", fontWeight: "800", fontFamily: "'Nanum Myeongjo', serif", color: "var(--accent-indigo)" }}>
                                {emoji} {currentType.tabs[idx]} 운세
                              </h3>
                            </div>
                            <div style={{ lineHeight: "1.8", color: "var(--text-primary)", marginBottom: "24px" }}>{renderHighlightedText(reading[key]?.content, true)}</div>
                            {idx < currentType.keys.length - 1 && <div style={{ height: "1px", background: "rgba(0,0,0,0.05)", marginBottom: "32px" }} />}
                          </div>
                        );
                      })}
                      {reading.today?.gaewun && (
                        <div style={{ padding: "32px 24px", background: "rgba(201, 160, 80, 0.05)", borderRadius: "24px", border: "1px solid rgba(201, 160, 80, 0.15)" }}>
                          <div style={{ fontWeight: "700", color: "var(--accent-gold)", marginBottom: "20px", fontSize: "1.1rem" }}>🍀 오늘의 행운 개운법</div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            {[{ t: "행운의 색상", v: reading.today.gaewun.color }, { t: "행운의 물건", v: reading.today.gaewun.item }, { t: "행운의 숫자", v: reading.today.gaewun.numbers }, { t: "행운의 방향", v: reading.today.gaewun.direction }].map((it, i) => (
                              <div key={i} style={{ background: "white", padding: "16px", borderRadius: "16px", border: "1px solid var(--glass-border)" }}><div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{it.t}</div><div style={{ fontSize: "0.9rem", fontWeight: "600" }}>{it.v}</div></div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : ["monthly", "yearly"].includes(typeParam) ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                      {/* 종합 운세 */}
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}><div style={{ width: "4px", height: "18px", background: "var(--accent-gold)", borderRadius: "2px" }} /><h3 style={{ fontSize: "1.15rem", fontWeight: "700" }}>{typeParam === "monthly" ? "📅 이번 달 종합 운세" : "📅 올해의 종합 운세"}</h3></div>
                        <div style={{ lineHeight: "1.85", color: "var(--text-primary)" }}>{renderHighlightedText(reading[typeParam === "monthly" ? "this_month" : "this_year"]?.content, true)}</div>
                      </div>
                      <div style={{ height: "1px", background: "rgba(0,0,0,0.06)" }} />
                      {/* 주차별/월별 운세 */}
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}><div style={{ width: "4px", height: "18px", background: "#81b29a", borderRadius: "2px" }} /><h3 style={{ fontSize: "1.15rem", fontWeight: "700" }}>{typeParam === "monthly" ? "📆 주차별 운세" : "📆 월별 운세"}</h3></div>
                        {(typeParam === "monthly" ? ["week1","week2","week3","week4","week5"] : ["m1","m2","m3","m4","m5","m6","m7","m8","m9","m10","m11","m12"]).map((key, idx) => {
                          const now = new Date();
                          const curDate = now.getDate();
                          const curWeekIdx = Math.min(4, Math.floor((curDate - 1) / 7));
                          const isCurWeek = typeParam === "monthly" && idx === curWeekIdx;
                          const weekEmojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];
                          
                          return reading[key]?.content && (
                            <div key={key} style={{ 
                              marginBottom: "24px", 
                              padding: "20px",
                              background: isCurWeek ? "rgba(201,160,80,0.08)" : "rgba(255,255,255,0.5)",
                              borderRadius: "20px",
                              border: isCurWeek ? "2px solid var(--accent-gold)" : "1px solid rgba(0,0,0,0.04)",
                              transition: "all 0.3s ease"
                            }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                                <div style={{ fontSize: "1.05rem", fontWeight: "800", fontFamily: "'Nanum Myeongjo', serif", color: isCurWeek ? "var(--accent-gold)" : "var(--accent-indigo)" }}>
                                  {typeParam === "monthly" ? `${weekEmojis[idx]} ${idx+1}주차` : `📅 ${idx+1}월`}
                                </div>
                                {isCurWeek && (
                                  <motion.span 
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--accent-gold)", background: "rgba(201,160,80,0.15)", padding: "4px 10px", borderRadius: "30px" }}
                                  >
                                    📍 이번 주
                                  </motion.span>
                                )}
                              </div>
                              <div style={{ lineHeight: "1.8", color: isCurWeek ? "var(--text-primary)" : "var(--text-secondary)" }}>{renderHighlightedText(reading[key]?.content, true)}</div>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ height: "1px", background: "rgba(0,0,0,0.06)" }} />
                      {/* 재물/애정/건강/사업 */}
                      {[{key:"wealth",label:"💰 재물운"},{key:"love",label:"💕 애정운"},{key:"health",label:"💪 건강운"},{key:"career",label:"💼 사업운"}].map(({key,label}) => reading[key]?.content && (
                        <div key={key}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}><div style={{ width: "4px", height: "18px", background: key==="wealth"?"#FAC42D":key==="love"?"#e07a5f":key==="health"?"#3d5a80":"#81b29a", borderRadius: "2px" }} /><h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>{label}</h3></div>
                          <div style={{ lineHeight: "1.85", color: "var(--text-primary)" }}>{renderHighlightedText(reading[key]?.content, true)}</div>
                        </div>
                      ))}
                      <div style={{ height: "1px", background: "rgba(0,0,0,0.06)" }} />
                      {/* 길일/흉일 */}
                      {(reading.lucky_days || reading.unlucky_days || reading.lucky_months || reading.unlucky_months) && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                          <div style={{ background: "rgba(129,178,154,0.08)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(129,178,154,0.2)" }}>
                            <div style={{ fontSize: "0.75rem", color: "#81b29a", fontWeight: "700", marginBottom: "6px" }}>{typeParam === "monthly" ? "🍀 길일" : "🍀 길월"}</div>
                            <div style={{ fontSize: "0.9rem", fontWeight: "600" }}>{reading.lucky_days || reading.lucky_months}</div>
                          </div>
                          <div style={{ background: "rgba(224,122,95,0.08)", padding: "16px", borderRadius: "16px", border: "1px solid rgba(224,122,95,0.2)" }}>
                            <div style={{ fontSize: "0.75rem", color: "#e07a5f", fontWeight: "700", marginBottom: "6px" }}>{typeParam === "monthly" ? "⚠️ 흉일" : "⚠️ 흉월"}</div>
                            <div style={{ fontSize: "0.9rem", fontWeight: "600" }}>{reading.unlucky_days || reading.unlucky_months}</div>
                          </div>
                        </div>
                      )}
                      {/* 개운법 */}
                      {reading.gaewun && (
                        <div style={{ padding: "32px 24px", background: "rgba(201, 160, 80, 0.05)", borderRadius: "24px", border: "1px solid rgba(201, 160, 80, 0.15)" }}>
                          <div style={{ fontWeight: "700", color: "var(--accent-gold)", marginBottom: "20px", fontSize: "1.1rem" }}>🍀 개운법</div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            {[{ t: "행운의 색상", v: reading.gaewun.color }, { t: "행운의 물건", v: reading.gaewun.item }, { t: "행운의 숫자", v: reading.gaewun.numbers }, { t: "행운의 방향", v: reading.gaewun.direction }].map((it, i) => (
                              <div key={i} style={{ background: "white", padding: "16px", borderRadius: "16px", border: "1px solid var(--glass-border)" }}><div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{it.t}</div><div style={{ fontSize: "0.9rem", fontWeight: "600" }}>{it.v}</div></div>
                            ))}
                          </div>
                        </div>
                      )}
                      <CopyButton content={Object.values(reading).filter((v:any) => typeof v === 'object' && v?.content).map((v:any) => v.content).join('\n\n')} />
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: "clamp(0.92rem, 3.8vw, 1.05rem)", lineHeight: "2", marginBottom: "40px" }}>{renderHighlightedText(reading[currentType.keys[activeTab]]?.content, true)}</div>
                    </>
                  )}
                </div>
              )}

              <PremiumPromo />

              <div style={{ marginTop: "60px", display: "flex", justifyContent: "center", gap: "16px" }}>
                <button onClick={() => topRef.current?.scrollIntoView({ behavior: 'smooth' })} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "14px 24px", borderRadius: "30px", background: "rgba(42, 54, 95, 0.05)", border: "1px solid var(--glass-border)", fontWeight: "600" }}><ArrowUp size={18} /> 맨 위로</button>
                <Link href="/"><button style={{ display: "flex", alignItems: "center", gap: "8px", padding: "14px 24px", borderRadius: "30px", background: "white", border: "1px solid var(--glass-border)", fontWeight: "600" }}><ArrowLeft size={18} /> 홈으로</button></Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

export default function FortunePage() {
  return <Suspense fallback={<div>Loading...</div>}><FortuneContent /></Suspense>;
}
