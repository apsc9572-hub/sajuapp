"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowUp, BookOpen, Clock, CalendarDays, Sparkles, MoonStar, Scroll, Coins, Briefcase, Activity, Heart, Target, Users, Wallet, ShieldAlert, Download, Share2, Calculator, Calendar, Copy, Check } from "lucide-react";
import { calculateSaju } from "ssaju";
import TraditionalBackground from "@/components/TraditionalBackground";
import Disclaimer from "@/components/Disclaimer";
import WheelDatePicker from "@/components/WheelDatePicker";

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
      title: "오늘의 운세",
      desc: "당신을 둘러싼 어제, 오늘, 내일의 흐름",
      icon: <Sparkles className="w-6 h-6" />,
      tabs: ["어제", "오늘", "내일"],
      keys: ["yesterday", "today", "tomorrow"]
    },
    monthly: {
      title: "월간 운세",
      desc: "이달의 방향성과 삶의 변화",
      icon: <MoonStar className="w-6 h-6" />,
      tabs: ["이번달"],
      keys: ["this_month"]
    },
    yearly: {
      title: "연간 운세", // fixed typo
      desc: "올해의 거시적 판도와 운의 흐름",
      icon: <Scroll className="w-6 h-6" />,
      tabs: ["올해"],
      keys: ["this_year"]
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

  const [date, setDate] = useState("1995-05-15");
  const [time, setTime] = useState("14:30");
  const [isLunar, setIsLunar] = useState(false);
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
        if (parsed.gender) setGender(parsed.gender);
        if (parsed.birthCity) setBirthCity(parsed.birthCity);
      } catch (e) { console.error("Error loading profile", e); }
    }
  }, []);

  useEffect(() => {
    const profile = { date, time, isLunar, gender, birthCity };
    localStorage.setItem("user_birth_profile", JSON.stringify(profile));
  }, [date, time, isLunar, gender, birthCity]);

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

  const [isLoading, setIsLoading] = useState(false);
  const [loadingTextIdx, setLoadingTextIdx] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [wisdomIdx, setWisdomIdx] = useState(0);
  const wisdomQuotes = [
    "하늘의 기운을 살피고 있습니다...",
    "당신만의 특별한 운세를 분석하는 중입니다...",
    "어제와 오늘, 내일의 흐름을 읽고 있습니다...",
    "분석된 결과를 문장으로 정리 중입니다...",
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
    "명식을 바탕으로 시운을 분석하고 있습니다...",
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

  const calculateFortune = async () => {
    setIsLoading(true);
    setBazi(null);
    setReading("");
    setActiveTab(typeParam === "daily" ? 1 : 0);

    // 즉시 결과/로딩 영역으로 스크롤
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);

    try {
      const [year, month, day] = date.split("-").map(Number);
      const [hour, min] = time.split(":").map(Number);

      if (!year || !month || !day) throw new Error("유효한 날짜가 아닙니다.");

      const cityData = cityDataMap[birthCity] || cityDataMap["기타"];
      const offsetMin = cityData.lmtOffset;
      const totalMinutes = hour * 60 + min + offsetMin;

      let correctedDay = day;
      let correctedHour = Math.floor(((totalMinutes % 1440) + 1440) % 1440 / 60);
      let correctedMin = ((totalMinutes % 60) + 60) % 60;
      if (totalMinutes < 0) correctedDay = day - 1;
      if (totalMinutes >= 1440) correctedDay = day + 1;

      const sajuRes = calculateSaju({
        year,
        month,
        day: correctedDay,
        hour: correctedHour,
        minute: correctedMin,
        calendar: isLunar ? "lunar" : "solar"
      });

      if (!sajuRes) throw new Error("사주 산출에 실패했습니다.");

      const now = new Date();
      let timeModifier = "";
      if (typeParam === "daily") {
        timeModifier = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
      } else if (typeParam === "monthly") {
        timeModifier = `${now.getFullYear()}-${now.getMonth()+1}`;
      } else if (typeParam === "yearly") {
        timeModifier = `${now.getFullYear()}`;
      }
      const cacheKey = `fortune_v21_${date}_${time}_${isLunar}_${gender}_${typeParam}_${timeModifier}`;
      const cachedData = localStorage.getItem(cacheKey);

      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        setBazi(sajuRes);
        setReading(parsed.reading);
        setIsLoading(false);
        return;
      }

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
          const res = calculateSaju({ year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate(), hour: 12, minute: 0, calendar: "solar" });
          const yStr = toKr(res.pillarDetails.year.stem + res.pillarDetails.year.branch);
          const mStr = toKr(res.pillarDetails.month.stem + res.pillarDetails.month.branch);
          const dStr = toKr(res.pillarDetails.day.stem + res.pillarDetails.day.branch);
          return { yStr, mStr, dStr };
        } catch {
          return { yStr: "", mStr: "", dStr: "" };
        }
      };
      
      const { yStr: ty, mStr: tm, dStr: td } = getPillars(dTodayBase);
      const todayEnhancedStr = `${todayStr}(${ty}년 ${tm}월 ${td}일)`;

      if (typeParam === "wealth") {
        timeContext = "이 내담자의 인생 전체 '재물운'을 [초년(10~20대), 청년(30대), 중년(40대), 장년(50대), 말년(60대 이후)] 5단계 생애주기로 나누어 분석해 주세요.";
      } else if (typeParam === "monthly") {
        timeContext = `오늘은 ${todayEnhancedStr}입니다. 이번 달의 운세를 다음 4단계 구조에 맞춰 상세히 분석해 주세요.

1. 📍 이달의 요약 (약 200자): 핵심 키워드 3개와 전체적인 기운 설명 (5초 안에 파악 가능하도록).

2. 📅 주차별 상세 흐름 (약 600자, 주당 150자): 1주~4주별 비즈니스, 재물, 대인관계 중 도드라지는 변화와 실질적 행동 지침.

3. 🔍 핵심 분야별 분석 (약 450자, 분야당 150자): 재물, 애정, 건강 분야별 논리적 근거를 포함한 상세 조언.

4. 💡 이달의 비책 및 핵심 날짜 (약 150자): 반드시 지켜야 할 한 줄 조언, 행운의 날, 주의할 날 리스트.

주의: 위 4단계 분석 내용을 반드시 'this_month' 객체 내의 'content' 키 하나의 문자열(긴 에세이 형식) 안에 모두 묶어서 작성하세요. 객체나 배열로 여러 키를 나누어 응답하면 절대 안 됩니다.
- [매우 중요]: 모든 결과값에서 '오행'을 언급할 때는 색상 강조 표기를 위해, 처음부터 끝까지 일관되게 반드시 '목(木)', '화(火)', '토(土)', '금(金)', '수(水)' 형식으로 한자를 병기하여 작성하세요!! ('화' 라고만 적지 마세요). 단, 십간(갑, 을 등)과 십이지(자, 축 등)는 한자 없이 한글로만 쓰세요. AI 언어 모델 특유의 딱딱한 말투나 강조 기호는 사용하지 마세요.`;
      } else if (typeParam === "yearly") {
        timeContext = `오늘은 ${todayEnhancedStr}입니다. 내담자의 올해(1년) 전체 운세를 다음 5단계의 '프리미엄 컨설팅 리포트' 형식으로 약 2,500자 분량으로 상세히 분석해 주세요.
반드시 각 단계마다 "왜" 이런 흐름이 나타나는지에 대한 명리학적 근거를 상세히 설명해 주세요.

1. 🎯 연간 총론 및 키워드 (200~300자): 올해를 관통하는 핵심 기운, 반드시 잡아야 할 기회, 주의해야 할 태도 요약. 명리학적 근거 포함.

2. 📅 분기별 로드맵 (Q1~Q4, 약 800자): 1~3월, 4~6월, 7~9월, 10~12월로 나누어 각 분기별 비즈니스, 재물, 대인관계의 흐름과 구체적 지침.

3. 🔍 4대 핵심 분야 심층 분석 (약 800자): 재물, 사업/직업, 애정, 건강 분야별로 명리적 근거를 포함한 본질적 풀이.

4. 🛡️ 연간 위기관리 및 조언 (200~300자): 가장 주의해야 할 달(Month)과 사건, 이를 예방하기 위한 핵심 지침.

5. ✨ 명리적 분석 근거 (200~300자): 내담자의 타고난 기질과 세운(올해의 운)이 어떻게 상호작용하는지 논리적으로 설명.

가이드 및 가독성 (매우 중요):
- 위 5단계 분석 내용을 단일한 'content' 키 하나의 문자열(긴 에세이 형식) 안에 모두 묶어서 작성하세요! 각 단계별로 별도 키(key)를 쪼개서 만들지 마세요.
- 각 항목 설명에는 ● 기호를 적절히 섞어 사용하세요.
- 각 섹션 제목 앞에는 위 예시처럼 이모지를 붙이세요.
- 문단 사이에는 반드시 빈 줄을 두 번(double newline) 넣어 여백을 충분히 두세요.
- 카카오톡 공유 시 깔끔하도록 ###, --- 등 마크다운 기호는 절대 사용하지 마세요. (AI 특유의 강조 기호 ** 도 절대 금지)
- 응답은 오직 'this_year' 단일 객체만 포함하며, 그 안에 'content', 'score'(0-100점), 'gaewun'(color, direction, element, item)을 포함한 객체로 응답하세요.
- 특히 'this_year' 객체 최상단에 1월부터 12월까지의 운기 점수(0-100)를 담은 'monthlyEnergies' 배열(숫자 12개)을 반드시 포함하세요. AI 모델 특유의 말투를 배제하십시오.`;
      } else if (typeParam === "daily") {
        const dToday = new Date();
        const dYest = new Date(dToday); dYest.setDate(dYest.getDate() - 1);
        const dTom = new Date(dToday); dTom.setDate(dTom.getDate() + 1);
        
        const getIljin = (d: Date) => {
          try {
            const res = calculateSaju({ year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate(), hour: 12, minute: 0, calendar: "solar" });
            return toKr(res.pillarDetails.day.stem + res.pillarDetails.day.branch);
          } catch {
            return "";
          }
        };

        const todayIljin = getIljin(dToday);
        const yestIljin = getIljin(dYest);
        const tomIljin = getIljin(dTom);

        timeContext = `오늘은 ${todayStr}(${todayIljin}일)입니다. 어제(${yestIljin}일), 오늘(${todayIljin}일), 내일(${tomIljin}일) 3일간의 운세를 각각 상세히 분석해 주세요. 
            각 날짜별로 'content', 'score'(0-100점), 'gaewun'(color, direction, element, item 4가지 항목)을 반드시 포함한 객체로 응답하세요.
            특히 'today' 객체에는 'scores'라는 하위 객체를 추가하여 재물(wealth), 애정(love), 사업/직업(career), 건강(health) 4가지 항목의 점수(0-100점)를 각각 포함해 주세요.
            각 분석 내용 마지막에는 왜 이런 운세가 나왔는지 사주의 일간과 일진(${todayIljin} 등) 중심의 명리적 이유를 한 문장으로 덧붙여 주세요.`;
      } else {
        timeContext = `이 ${todayEnhancedStr} 기준으로 내담자의 '${currentType.title}' 테마에 집중하여 분석해 주세요. 결과가 도출된 근거(이유)를 반드시 포함해 주세요.`;
      }

      let systemPrompt = `당신은 청아매당(淸雅梅堂)의 최고 명리학 권위자입니다. 명리 데이터를 기반으로 깊이 있는 분석을 제공하세요.
단순히 좋은 말만 나열하지 마세요. 내담자가 자신의 운세를 납득할 수 있도록, 왜 이런 분석 결과가 나왔는지 용신(用神), 격국(格局), 합충(合沖) 등 명리학적 근거를 섞어서 "이유"를 명확히 설명해 주세요.
무조건 좋은 말만 하지 말고, 객관적인 흉운(주의가 필요한 시기)과 약점을 짚어주되, 반드시 이를 극복할 수 있는 실질적인 개운법(Gaewun)과 행동 지침을 함께 제시하세요.
반드시 JSON 형식으로 응답하며, 
- daily 테마일 경우: 'yesterday', 'today', 'tomorrow' 각각의 객체 사용.
- monthly 테마일 경우: 'this_month' 객체 하나만 사용.
- yearly 테마일 경우: 'this_year' 객체 하나만 사용.
- 공통: 모든 시간 기반 객체 내부에 'content'(긴 텍스트 문자열), 'score'(숫자), 'gaewun'(객체: color, direction, element, item)를 포함하며, 또한 'scores' 하위 객체를 추가하여 재물(wealth), 애정(love), 사업/직업(career), 건강(health) 4가지 항목의 점수(0-100점)를 각각 포함해주세요. (단, element는 반드시 '목(木)', '화(火)', '토(土)', '금(金)', '수(水)' 중 하나로 표기)
- 기타 테마일 경우: ${currentType.keys[0]} 키를 사용하여 분석 내용을 제공.
- 명리학적 근거를 바탕으로 하되, 전문가가 직접 상담해주는 듯한 품격 있고 따뜻한 어투로 설명하세요.
- [매우 중요]: 흉운이나 약점을 숨기지 말고 솔직하게 조언하되, 'gaewun' 객체 외에도 'content' 본문 곳곳에 운을 통제하고 보완할 구체적 행동 지침(마음가짐, 환경 변화 등)을 제시하세요.
- [매우 중요]: 모든 결과값에서 '오행'을 언급할 때는 색상 강조 표기를 위해, 처음부터 끝까지 일관되게 반드시 '목(木)', '화(火)', '토(土)', '금(金)', '수(水)' 형식으로 한자를 병기하여 작성하세요!! ('화' 라고만 적지 마세요). 단, 십간(갑, 을 등)과 십이지(자, 축 등)는 한자 없이 한글로만 쓰세요.
- [풀이 품질]: '한 민족을 얻는다'와 같은 어색한 표현이나 AI 특유의 딱딱한 말투, 마크다운 강조 기호(**)를 절대 사용하지 마세요. 현대적이고 세련된 어투를 사용하며, <b>와 같은 HTML 태그도 금지합니다.

배경: ${anchorKeywords.join(", ")}
${cuspScript ? `특이사항: ${cuspScript}` : ""}

내용: ${strongestElemTrait} ${weakestElemTrait}
${timeContext}`;

      if (typeParam === "wealth") {
        systemPrompt = `너는 청아매당(淸雅梅堂)의 재물운 전문 최고 명리학 권위자야. 사용자의 사주 명식을 분석하여 5단계 생애주기별(초년, 청년, 중년, 장년, 말년) 재물운을 심층적으로 분석해.
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
        systemPrompt = `너는 청아매당(淸雅梅堂)의 건강 전문 최고 명리학 권위자야. 사용자의 사주 명식을 분석하여 5단계 생애주기별(초년, 청년, 중년, 장년, 말년) 건강운과 신체적/정신적 에너지를 심층적으로 분석해.
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
        systemPrompt = `너는 청아매당(淸雅梅堂)의 비즈니스 전문 사주 분석가이자 전략 컨설턴트야. 사용자의 사주 명식을 분석하여 단순한 운세를 넘어 실제 사업 경영에 도움이 되는 실무적이고 통찰력 있는 조언을 제공해.
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
        systemPrompt = `너는 청아매당(淸雅梅堂)의 애정운(연애/결혼) 전문 최고 명리학 권위자야. 사용자의 사주 명식을 분석하여 5단계 생애주기별(초년, 청년, 중년, 장년, 말년) 애정운과 인연의 흐름을 심층적으로 분석해.
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
          userMsg = "현재 운세 분석 서버에 접속자가 많아 기운을 읽는 데 시간이 걸리고 있습니다. 잠시 후 다시 시도해 주세요.";
        }
        
        throw new Error(userMsg);
      }

      if (!apiRes || !apiRes.ok) throw new Error("API 요청 실패");
      let llmResultRaw = await apiRes.json();
      const llmResult = cleanAstrologyTerms(llmResultRaw);
      const finalReading: Record<string, any> = {};

      if (["daily", "monthly", "yearly"].includes(typeParam)) {
        currentType.keys.forEach((key: string) => {
          const raw = llmResult[key];
          if (typeof raw === 'string') {
            finalReading[key] = { content: raw, score: 80, gaewun: { color: "금색", direction: "동쪽", element: "금(金)", item: "장신구" } };
          } else if (raw && (raw.content || raw.analysis || raw.text)) {
            finalReading[key] = {
              content: raw.content || raw.analysis || raw.text,
              score: raw.score || 80,
              gaewun: raw.gaewun || { color: "금색", direction: "동쪽", element: "금(金)", item: "장신구" },
              scores: raw.scores || null
            };
          } else {
            finalReading[key] = { content: "세부 분석 정보를 생성하지 못했습니다.", score: 70, gaewun: { color: "흰색", direction: "서쪽", element: "수(水)", item: "금속 장신구" } };
          }
        });
      } else {
        currentType.keys.forEach((key: string) => {
          // Fallback check: if the AI returned it wrapped in 'wealth_stages' (old behavior) or directly
          const raw = llmResult[key] || (llmResult.wealth_stages && llmResult.wealth_stages[key]);
          finalReading[key] = raw || "분석 정보를 가져오지 못했습니다.";
        });
      }

      if (typeParam === "wealth" || typeParam === "health" || typeParam === "love") {
        const overallEnergy = [
          { name: "목", value: elementCounts["목"] || 0, color: "#81b29a" },
          { name: "화", value: elementCounts["화"] || 0, color: "#e07a5f" },
          { name: "토", value: elementCounts["토"] || 0, color: "#D4A373" },
          { name: "금", value: elementCounts["금"] || 0, color: "#C9A050" },
          { name: "수", value: elementCounts["수"] || 0, color: "#3d5a80" }
        ];
        finalReading.overallEnergy = overallEnergy;
      }

      setBazi(sajuRes);
      setReading(finalReading);

      localStorage.setItem(cacheKey, JSON.stringify({
        reading: finalReading,
        timestamp: Date.now()
      }));

    } catch (err: any) {
      console.error(err);
      alert(err.message || "분석에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const CopyButton = ({ content }: { content: string }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    return (
      <motion.button 
        whileHover={{ scale: 1.02 }} 
        whileTap={{ scale: 0.98 }} 
        onClick={handleCopy}
        style={{ 
          width: "100%", 
          marginTop: "24px", 
          padding: "16px", 
          borderRadius: "16px", 
          background: copied ? "#4ade80" : "var(--accent-indigo)", 
          color: "white", 
          border: "none", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          gap: "10px",
          fontWeight: "600",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          transition: "background 0.3s ease"
        }}
      >
        {copied ? (
          <> <Check size={18} /> 전체 리포트 복사 완료! </>
        ) : (
          <> <Copy size={18} /> 전체 프리미엄 리포트 복사하기 </>
        )}
      </motion.button>
    );
  };

  const renderHighlightedText = (text: any) => {
    if (!text || typeof text !== 'string') return null;
    const cleanText = text.replace(/\*\*/g, '');
    
    const ELEMENT_COLORS: Record<string, string> = {
      '목(木)': '#81b29a',
      '화(火)': '#e07a5f',
      '토(土)': '#f2cc8f',
      '금(金)': '#C9A050',
      '수(水)': '#3d5a80'
    };

    return cleanText.split('\n').filter(p => p.trim() !== '').map((para, i) => {
      // Handle bold text and Elements
      const parts = para.split(/(<b>.*?<\/b>|목\(木\)|화\(火\)|토\(土\)|금\(金\)|수\(水\))/g);
      
      const isHeader = /^[\d\s]*[📍📅🔍🛡️✨🎯]/.test(para.trim());
      
      return (
        <div key={i} style={{ 
          marginBottom: isHeader ? "24px" : "16px", 
          marginTop: isHeader && i > 0 ? "32px" : "0",
          lineHeight: "1.9", 
          fontSize: isHeader ? "1.2rem" : "1.05rem",
          fontWeight: isHeader ? "600" : "400",
          color: isHeader ? "var(--accent-indigo)" : "var(--text-secondary)",
          background: isHeader ? "transparent" : "rgba(255, 255, 255, 0.4)",
          padding: isHeader ? "0" : "16px 20px",
          borderRadius: "16px",
          border: isHeader ? "none" : "1px solid rgba(42, 54, 95, 0.05)",
          wordBreak: "keep-all",
          fontFamily: "'Pretendard', sans-serif"
        }}>
          {parts.map((part, j) => {
            if (part.startsWith('<b>') && part.endsWith('</b>')) {
              return <strong key={j} style={{ color: "var(--text-primary)", fontWeight: "700" }}>{part.slice(3, -4)}</strong>;
            }
            if (ELEMENT_COLORS[part]) {
              return <strong key={j} style={{ color: ELEMENT_COLORS[part], fontWeight: "800" }}>{part}</strong>;
            }
            return part;
          })}
        </div>
      );
    });
  };

  // Helper for inline highlights (no block margins)
  const renderInlineHighlights = (text: string) => {
    if (!text || typeof text !== 'string') return text;
    const cleanText = text.replace(/\*\*/g, '');
    const ELEMENT_COLORS: Record<string, string> = {
      '목(木)': '#81b29a', '화(火)': '#e07a5f', '토(土)': '#f2cc8f', '금(金)': '#C9A050', '수(水)': '#3d5a80'
    };
    const parts = cleanText.split(/(<b>.*?<\/b>|목\(木\)|화\(火\)|토\(土\)|금\(金\)|수\(水\))/g);
    return parts.map((part, j) => {
      if (part.startsWith('<b>') && part.endsWith('</b>')) {
        return <strong key={j} style={{ color: "var(--text-primary)", fontWeight: "700" }}>{part.slice(3, -4)}</strong>;
      }
      if (ELEMENT_COLORS[part]) {
        return <strong key={j} style={{ color: ELEMENT_COLORS[part], fontWeight: "800" }}>{part}</strong>;
      }
      return part;
    });
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
    
    // Only fix malformed terms like "목 (木)", "목木", "갑신(申)申)" into "목(木)", "갑신(申)"
    return text
      .replace(/\*\*/g, '')
      // Elements: English to Korean(Kanji)
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

  const RollingNumber = ({ value }: { value: number }) => {
    return <>{value}</>;
  };

  const SubScoreGraph = ({ scores }: { scores: any }) => {
    if (!scores) return null;
    const items = [
      { label: '재물운', value: scores.wealth || 0, color: '#C9A050' },
      { label: '애정운', value: scores.love || 0, color: '#e07a5f' },
      { label: '사업/학업', value: scores.career || 0, color: '#3d5a80' },
      { label: '건강운', value: scores.health || 0, color: '#81b29a' },
    ];

    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "32px" }}>
        {items.map((item, i) => (
          <div key={i} style={{ background: "white", padding: "14px", borderRadius: "18px", border: "1px solid var(--glass-border)", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-secondary)" }}>{item.label}</span>
              <span style={{ fontSize: "0.85rem", fontWeight: "700", color: item.color }}>{item.value}</span>
            </div>
            <div style={{ height: "4px", background: "rgba(0,0,0,0.03)", borderRadius: "2px", overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.value}%` }}
                transition={{ duration: 1, delay: 0.2 + i * 0.1 }}
                style={{ height: "100%", background: item.color, borderRadius: "2px" }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <main ref={topRef} style={{ width: "100%", minHeight: "100vh", position: "relative", background: "var(--bg-primary)" }}>
      <Disclaimer />
      <TraditionalBackground />
      <WheelDatePicker isOpen={isDatePickerOpen} onClose={() => setIsDatePickerOpen(false)} initialDate={date} onConfirm={(d) => setDate(d)} />
      
      <div style={{ 
        maxWidth: "480px", 
        margin: "0 auto", 
        height: (isLoading || reading.today || reading.this_month || reading.this_year || bazi) ? "auto" : "100%",
        position: "relative", 
        zIndex: 1, 
        background: "rgba(255, 255, 255, 0.95)", 
        backdropFilter: "blur(20px)",
        boxShadow: "0 0 60px rgba(26, 28, 44, 0.12)",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
        overflowY: (isLoading || reading.today || reading.this_month || reading.this_year || bazi) ? "initial" : "hidden"
      }}>
        <div style={{ padding: "20px 20px" }}>
          <Link href="/" style={{ textDecoration: "none", marginBottom: "16px", display: "inline-block" }}>
            <button style={{ background: "rgba(42, 54, 95, 0.05)", border: "none", color: "var(--accent-indigo)", cursor: "pointer", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><ArrowLeft size={18} /></button>
          </Link>

          <div className="text-center" style={{ marginBottom: (isLoading || bazi) ? "32px" : "20px" }}>
            <motion.div 
               initial={{ opacity: 0, y: -10 }} 
               animate={{ opacity: 1, y: 0 }}
                style={{ display: "inline-block", background: "var(--accent-cherry)", color: "var(--accent-indigo)", padding: "1px 6px", borderRadius: "8px", fontSize: "0.45rem", fontWeight: "700", marginBottom: "4px", letterSpacing: "0.1em" }}
            >
              CHEONG-A MAE-DANG
            </motion.div>
            <h1 style={{ fontSize: "1.05rem", fontWeight: "700", color: "var(--accent-indigo)", letterSpacing: "0", textShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              청아매당 {currentType.title}
            </h1>
            <div style={{ width: "24px", height: "1px", background: "var(--accent-gold)", margin: "8px auto 8px" }}></div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: "1.4", fontFamily: "'Nanum Myeongjo', serif" }}>
              전통의 혜안으로 {currentType.title} 정수를 풀어냅니다.
            </p>
          </div>

          <div style={{ width: "100%" }}>
            <section style={{ padding: "0" }}>
            <h2 style={{ fontSize: "0.9rem", marginBottom: "16px", borderBottom: "1px solid var(--glass-border)", paddingBottom: "10px", display: "flex", alignItems: "center", gap: "8px", fontWeight: "500" }}>
              {React.cloneElement(currentType.icon as any, { size: 18 })} 정보 입력
            </h2>
            <div style={{ display: "grid", gap: "12px" }}>
              <div onClick={() => setIsDatePickerOpen(true)} className="glass-input" style={{ cursor: "pointer", padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.8)", fontSize: "0.9rem" }}>{date}</div>

              <div style={{ display: "flex", gap: "8px" }}>
                <input type="time" className="glass-input" value={time} onChange={(e) => setTime(e.target.value)} style={{ flex: 1, padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.8)", fontSize: "0.9rem" }} />
                <div style={{ display: "flex", background: "rgba(0,0,0,0.05)", borderRadius: "10px", padding: "3px" }}>
                  <button onClick={() => setIsLunar(false)} style={{ padding: "5px 10px", borderRadius: "7px", border: "none", background: !isLunar ? "white" : "transparent", fontSize: "0.8rem" }}>양력</button>
                  <button onClick={() => setIsLunar(true)} style={{ padding: "5px 10px", borderRadius: "7px", border: "none", background: isLunar ? "white" : "transparent", fontSize: "0.8rem" }}>음력</button>
                </div>
              </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <select className="glass-input" value={birthCity} onChange={(e) => setBirthCity(e.target.value)} style={{ flex: 1, padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.8)", fontSize: "0.9rem" }}>
                      {Object.keys(cityDataMap).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div style={{ display: "flex", background: "rgba(0,0,0,0.05)", borderRadius: "10px", padding: "3px" }}>
                      <button onClick={() => setGender("M")} style={{ padding: "5px 10px", borderRadius: "7px", border: "none", background: gender === "M" ? "white" : "transparent", fontSize: "0.8rem" }}>남</button>
                      <button onClick={() => setGender("F")} style={{ padding: "5px 10px", borderRadius: "7px", border: "none", background: gender === "F" ? "white" : "transparent", fontSize: "0.8rem" }}>여</button>
                    </div>
                  </div>
                  <p style={{ fontSize: "0.62rem", color: "var(--text-secondary)", opacity: 0.8, paddingLeft: "4px", margin: 0, letterSpacing: "-0.02em" }}>
                    * 태어난 지역에 따른 미세한 시간 차이를 반영하여 더 정확하게 분석합니다.
                  </p>
                </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.01 }} 
              whileTap={{ scale: 0.98 }} 
              onClick={calculateFortune} 
              disabled={isLoading} 
              className="btn-primary" 
              style={{ 
                width: "100%", 
                marginTop: "16px", 
                padding: "14px", 
                borderRadius: "12px", 
                fontSize: "1rem", 
                fontWeight: "600",
                background: "var(--accent-indigo)",
                boxShadow: "0 8px 20px rgba(42, 54, 95, 0.2)",
                border: "none"
              }}
            >
              {isLoading ? "운의 흐름을 읽는 중..." : `${currentType.title} 흐름 분석하기`}
            </motion.button>
          </section>

          <AnimatePresence>
            {(bazi || isLoading) && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "0", marginTop: "40px" }} ref={resultRef} id="result-section">
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                   <div style={{ width: "40px", height: "2px", background: "var(--accent-gold)", margin: "0 auto 16px" }}></div>
                   <h2 style={{ fontSize: "1.6rem", fontWeight: "700", color: "var(--accent-indigo)", letterSpacing: "-0.02em" }}>분석 결과</h2>
                </div>

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
                      <p style={{ color: "var(--accent-indigo)", fontWeight: "700", fontSize: "1.1rem", marginBottom: "16px", letterSpacing: "0.1em" }}>{currentType.title} 흐름을 읽고 있습니다</p>
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
                  <>
                    {typeParam === "business" || typeParam === "wealth" || typeParam === "health" || typeParam === "love" ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: (typeParam === "wealth" || typeParam === "health" || typeParam === "love") ? "80px" : "40px" }}>
                        {(typeParam === "wealth" || typeParam === "health" || typeParam === "love") && reading.overallEnergy && (
                          <div style={{ padding: "40px 24px", background: "white", borderRadius: "28px", border: "1px solid var(--glass-border)", boxShadow: "0 15px 45px rgba(26, 28, 44, 0.05)", marginBottom: "48px" }}>
                            <h3 style={{ textAlign: "center", marginBottom: "32px", fontSize: "1.1rem", fontWeight: "600", color: "var(--accent-indigo)" }}>🎨 타고난 오행 에너지</h3>
                            <FiveElementsDonut elements={reading.overallEnergy} />
                          </div>
                        )}
                        {currentType.keys.map((key: string, index: number) => {
                          const stageData = reading[key] || {};
                          const summary = stageData.summary || "분석 정보를 가져오지 못했습니다.";
                          const energy = stageData.energy || [];
                          const cards = stageData.cards || {};
                          const actionTips = stageData.action_tips || {};
                          const gaewun = stageData.gaewun || null;
                          const sectionColors = ["#81b29a", "#e07a5f", "#D4A373", "#3d5a80", "#6c5b7b"];
                          const secColor = typeParam === "wealth" ? (sectionColors[index] || "var(--accent-gold)") : "var(--accent-gold)";
                          
                          return (
                            <motion.div 
                              key={key} 
                              initial={{ opacity: 0, y: 40, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ duration: 0.7, delay: index * 0.1, ease: [0.25, 1, 0.5, 1] }}
                              style={(typeParam === "wealth" || typeParam === "health" || typeParam === "love") ? { borderBottom: index === currentType.keys.length - 1 ? "none" : "1px solid var(--glass-border)", paddingBottom: "64px" } : {}}
                            >
                              {(typeParam === "wealth" || typeParam === "health" || typeParam === "love") && (
                                <h3 style={{ fontSize: "1.6rem", marginBottom: "28px", color: secColor, fontWeight: "300", textAlign: "center" }}>{currentType.tabs[index]}</h3>
                              )}

                              {typeParam === "business" && energy && energy.length > 0 && (
                                <div style={{ padding: "32px 20px", background: "white", borderRadius: "24px", border: "1px solid var(--glass-border)", boxShadow: "0 10px 30px rgba(0,0,0,0.03)", marginBottom: "32px" }}>
                                  <h3 style={{ textAlign: "center", marginBottom: "24px", fontSize: "1rem", fontWeight: "500", color: "var(--text-primary)" }}>🎯 이달의 비즈니스 에너지 분포</h3>
                                  <FiveElementsDonut elements={energy} />
                                </div>
                              )}

                              <div style={{ fontSize: "1.05rem", marginBottom: "32px", color: "var(--text-primary)", borderLeft: `4px solid ${secColor}`, paddingLeft: "16px", lineHeight: "1.7", wordBreak: "keep-all" }}>
                                "{renderInlineHighlights(summary)}"
                              </div>

                              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px", marginBottom: "32px" }}>
                                {Object.entries(cards).map(([cardKey, cardData]: [string, any], i) => {
                                  let icon = <Target className="text-[#e07a5f]" size={24} />;
                                  if (cardKey === "partners" || cardKey === "romance") icon = <Users className="text-[#3d5a80]" size={24} />;
                                  if (cardKey === "capital" || cardKey === "expense" || cardKey === "physical") icon = <Wallet className="text-[#C9A050]" size={24} />;
                                  if (cardKey === "risk" || cardKey === "lifestyle" || cardKey === "caution") icon = <ShieldAlert className="text-[#D4A373]" size={24} />;
                                  if (cardKey === "mental" || cardKey === "habits" || cardKey === "timing") icon = <Heart className="text-[#e07a5f]" size={24} />;
                                  
                                  return (
                                    <div key={i} style={{ background: "rgba(255,255,255,0.7)", padding: "20px", borderRadius: "16px", border: "1px solid var(--glass-border)", boxShadow: "0 4px 15px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", gap: "12px" }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-primary)" }}>
                                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(0,0,0,0.03)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                          {icon}
                                        </div>
                                      </div>
                                      <div>
                                        <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>{cardData?.title || "-"}</div>
                                        <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.6", wordBreak: "keep-all" }}>{cardData?.content || "-"}</div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              <div style={{ padding: "24px", background: "rgba(201, 160, 80, 0.05)", borderRadius: "20px", border: "1px solid rgba(201, 160, 80, 0.15)", marginBottom: typeParam === "wealth" ? "32px" : "0" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                  <div style={{ display: "flex", gap: "12px" }}>
                                    <div style={{ fontWeight: "700", color: "#81b29a", minWidth: "40px" }}>강조!</div>
                                    <div style={{ fontSize: "0.95rem", color: "var(--text-primary)", lineHeight: "1.6" }}>{actionTips.do}</div>
                                  </div>
                                  <div style={{ height: "1px", background: "rgba(0,0,0,0.05)" }} />
                                  <div style={{ display: "flex", gap: "12px" }}>
                                    <div style={{ fontWeight: "700", color: "#e07a5f", minWidth: "40px" }}>주의!</div>
                                    <div style={{ fontSize: "0.95rem", color: "var(--text-primary)", lineHeight: "1.6" }}>{actionTips.dont}</div>
                                  </div>
                                </div>
                              </div>
                              
                              {(typeParam === "wealth" || typeParam === "health") && gaewun && gaewun.color && (
                                <div style={{ padding: "24px", background: "rgba(255, 255, 255, 0.7)", borderRadius: "20px", border: `1px solid rgba(0,0,0,0.05)`, boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
                                  <div style={{ fontWeight: "700", color: secColor, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px", fontSize: "1rem" }}>
                                    <Sparkles size={18} /> 이 시기의 {typeParam === "wealth" ? "재물" : typeParam === "health" ? "건강" : "애정"} 개운법
                                  </div>
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                    {[
                                      { t: "추천 색상", v: gaewun.color || "-" },
                                      { t: "추천 방향", v: gaewun.direction || "-" },
                                      { t: "추천 오행", v: gaewun.element || "-" },
                                      { t: "추천 물건", v: gaewun.item || "-" }
                                    ].map((item, i) => (
                                      <div key={i} style={{ background: "white", padding: "16px", borderRadius: "16px", border: "1px solid var(--glass-border)", display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{item.t}</div>
                                        <div style={{ fontSize: "0.95rem", color: "var(--text-primary)", fontWeight: "600" }}>{renderInlineHighlights(item.v)}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : ["daily", "monthly", "yearly"].includes(typeParam) ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
                        {currentType.tabs.length > 1 && (
                          <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "8px", overflowX: "auto", paddingBottom: "8px" }}>
                            {currentType.tabs.map((tab: string, idx: number) => (
                              <button
                              key={idx}
                              onClick={() => setActiveTab(idx)}
                              style={{
                                padding: "10px 24px",
                                borderRadius: "20px",
                                border: "1px solid var(--glass-border)",
                                background: activeTab === idx ? "var(--accent-gold)" : "white",
                                color: activeTab === idx ? "white" : "var(--text-primary)",
                                fontSize: "0.95rem",
                                fontWeight: activeTab === idx ? "600" : "400",
                                whiteSpace: "nowrap",
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                boxShadow: activeTab === idx ? "0 4px 12px rgba(201, 160, 80, 0.2)" : "none"
                              }}
                            >
                              {tab}
                              </button>
                            ))}
                          </div>
                        )}

                        <motion.div
                          key={activeTab}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                          style={{
                            background: "rgba(255, 255, 255, 0.7)",
                            backdropFilter: "blur(10px)",
                            padding: "40px 24px",
                            borderRadius: "32px",
                            border: "1px solid var(--glass-border)",
                            boxShadow: "0 25px 60px rgba(42, 54, 95, 0.06)"
                          }}
                        >
                          <div style={{ textAlign: "center", marginBottom: "48px", padding: "32px", background: "white", borderRadius: "24px", boxShadow: "0 10px 40px rgba(0,0,0,0.02)", border: "1px solid var(--glass-border)" }}>
                            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "12px", letterSpacing: "0.05em" }}>행운 기운 점수</div>
                            <div style={{ fontSize: "3.5rem", fontWeight: "200", color: "var(--accent-gold)", display: "flex", alignItems: "baseline", justifyContent: "center", gap: "6px" }}>
                              {reading[currentType.keys[activeTab]]?.score || 85}
                              <span style={{ fontSize: "1.4rem", color: "var(--text-secondary)", fontWeight: "300" }}>점</span>
                            </div>
                            <div style={{ maxWidth: "200px", margin: "16px auto 0", height: "6px", background: "rgba(0,0,0,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${reading[currentType.keys[activeTab]]?.score || 85}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                style={{ height: "100%", background: "linear-gradient(90deg, #D4AF37, #C9A050)", borderRadius: "3px" }}
                              />
                            </div>
                          </div>

                          {/* 세부 점수 그래프 표시 */}
                          {reading[currentType.keys[activeTab]]?.scores && (
                            <SubScoreGraph scores={reading[currentType.keys[activeTab]].scores} />
                          )}

                          {/* 연간 운세인 경우 12개월 에너지 차트 표시 */}
                          {typeParam === "yearly" && activeTab === 1 && reading.this_year?.monthlyEnergies && (
                            <div style={{ background: "white", padding: "24px", borderRadius: "24px", marginBottom: "40px", border: "1px solid rgba(42, 54, 95, 0.08)" }}>
                              <LineChart data={reading.this_year.monthlyEnergies} />
                            </div>
                          )}

                          <div style={{ fontSize: "1.05rem", lineHeight: "2.1", color: "var(--text-primary)", marginBottom: "48px", wordBreak: "keep-all" }}>
                            {renderHighlightedText(reading[currentType.keys[activeTab]]?.content)}
                          </div>

                          {/* 리포트 복사 버튼 (연간/월간 등 요약 리포트 용) */}
                          {["monthly", "yearly"].includes(typeParam) && reading[currentType.keys[activeTab]]?.content && (
                            <CopyButton content={reading[currentType.keys[activeTab]].content} />
                          )}

                          <div style={{ padding: "32px 24px", background: "rgba(201, 160, 80, 0.03)", borderRadius: "24px", border: "1px solid rgba(201, 160, 80, 0.1)", marginTop: "40px" }}>
                            <div style={{ fontWeight: "700", color: "var(--accent-gold)", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px", fontSize: "1rem" }}>
                              <Sparkles size={20} /> 기운을 여는 열쇠 (개운법)
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                              {[
                                { t: "추천 색상", v: reading[currentType.keys[activeTab]]?.gaewun?.color || "흰색" },
                                { t: "행운의 물건", v: reading[currentType.keys[activeTab]]?.gaewun?.item || "향초" },
                                { t: "생활 습관", v: reading[currentType.keys[activeTab]]?.gaewun?.habit || "아침 산책" },
                                { t: "행운의 방향", v: reading[currentType.keys[activeTab]]?.gaewun?.direction || "동쪽" }
                              ].map((item, i) => (
                                <div key={i} style={{ background: "white", padding: "20px 16px", borderRadius: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.02)", border: "1px solid var(--glass-border)" }}>
                                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "6px" }}>{item.t}</div>
                                  <div style={{ fontSize: "0.95rem", color: "var(--text-primary)", fontWeight: "600" }}>{renderInlineHighlights(item.v)}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    ) : (
                      <div style={{ fontSize: "1.1rem", lineHeight: "2.2", color: "var(--text-primary)", whiteSpace: "pre-line" }}>
                        {renderHighlightedText(reading[currentType.keys[0]]?.content || reading[currentType.keys[0]])}
                      </div>
                    )}

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
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function FortunePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FortuneContent />
    </Suspense>
  );
}
