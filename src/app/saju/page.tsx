"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowUp, BookOpen, Clock, CalendarDays, Sparkles, MapPin, Coins, Heart, Briefcase, Activity, User, Star, Scroll } from "lucide-react";
import { calculateSaju } from "ssaju";
import TraditionalBackground from "@/components/TraditionalBackground";
import Disclaimer from "@/components/Disclaimer";
import WheelDatePicker from "@/components/WheelDatePicker";

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


export default function SajuPage() {
  const [date, setDate] = useState("1995-05-15");
  const [time, setTime] = useState("14:30");
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

  const toKr = (str: string) => {
    const map: Record<string, string> = {
      "甲": "갑", "乙": "을", "丙": "병", "丁": "정", "戊": "무", "己": "기", "庚": "경", "辛": "신", "壬": "임", "癸": "계",
      "子": "자", "丑": "축", "寅": "인", "卯": "묘", "辰": "진", "巳": "사", "午": "오", "未": "미", "申": "신", "酉": "유", "戌": "술", "亥": "해"
    };
    return str.split('').map(c => map[c] || c).join('');
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
    "명식의 조화를 분석하는 중입니다...",
    "과거와 미래의 흐름을 읽어내고 있습니다...",
    "당신만의 특별한 운명을 정리 중입니다...",
    "거의 다 되었습니다. 잠시만 기다려주세요..."
  ];
  const [correctedTimeInfo, setCorrectedTimeInfo] = useState<any>(null);
  const resultRef = useRef<HTMLDivElement>(null);

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
    "타고난 명식을 분석하고 있습니다...",
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

    const cacheKey = `saju_cache_v6_${date}_${time}_${isLunar}_${gender}_${birthCity}`;
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
          calendar: isLunar ? "lunar" : "solar"
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

        const sajuAnalysisJson = {
            user_info: { gender: gender === "M" ? "male" : "female", day_master: `${dayStr[0]}(${dmElem})` },
            elements_ratio: { Wood: counts['목'], Fire: counts['화'], Earth: counts['토'], Metal: counts['금'], Water: counts['수'] },
            core_格: sajuRes.advanced.geukguk,
            shinsal: { lucky: sajuRes.advanced.sinsal.gilsin || [], caution: sajuRes.advanced.sinsal.hyungsin || [] }
        };

        const generateSystemPromptString = (json: any) => {
          return `당신은 통찰력 있는 사주 상담가입니다. 다음 사주 데이터를 기반으로 인생 총운, 재물운, 그리고 인생의 4단계를 에세이 형식으로 길게 풀이해 주세요.
특히 각 분석 결과가 "왜" 그렇게 도출되었는지에 대한 명리학적 근거(오행의 조화, 일간의 특성, 신살의 영향 등)를 반드시 포함하여 설명해 주세요.
반드시 아래 정의된 JSON 형식으로만 응답해야 합니다.

[출력 JSON 구조]
{
  "general": "인생 총운 본문 (에세이 형식으로 아주 길고 상세하게, 명리학적 근거 포함)",
  "general_summary": "총운 요약",
  "general_keyword": "총운 키워드",
  "early": "10~20대(초년) 인생의 흐름과 사회적 기반 (인생 총운처럼 아주 길고 상세한 에세이 형식으로, 해당 시기의 운 기운이 왜 그렇게 작용하는지 근거 포함)",
  "youth": "30대(청년) 인생의 성장과 성취의 기운 (인생 총운처럼 아주 길고 상세한 에세이 형식으로, 해당 시기의 운 기운이 왜 그렇게 작용하는지 근거 포함)",
  "middle": "40대(중년) 인생의 전성기와 확장의 흐름 (인생 총운처럼 아주 길고 상세한 에세이 형식으로, 해당 시기의 운 기운이 왜 그렇게 작용하는지 근거 포함)",
  "late": "50대 이후(말년) 인생의 완성 내실과 안정적인 흐름 (인생 총운처럼 아주 길고 상세한 에세이 형식으로, 해당 시기의 운 기운이 왜 그렇게 작용하는지 근거 포함)",
  "early_summary": "초년 요약",
  "youth_summary": "청년 요약",
  "middle_summary": "중년 요약",
  "late_summary": "말년 요약",
  "early_keyword": "초년 키워드",
  "youth_keyword": "청년 키워드",
  "middle_keyword": "중년 키워드",
  "late_keyword": "말년 키워드",
  "life_balance": {"wealth": 80, "love": 70, "career": 85, "health": 75},
  "daeun": "대운 분석 본문",
  "sinsal": "신살 분석 본문",
  "gaewun": {
    "general": {"color": "짙은 갈색", "direction": "중앙", "element": "토(土)", "item": "원목 탁자"},
    "early": {"color": "푸른 계열", "direction": "동쪽", "element": "목(木)", "item": "나무 화분"},
    "youth": {"color": "붉은 계열", "direction": "남쪽", "element": "화(火)", "item": "밝은 조명"},
    "middle": {"color": "노란 계열", "direction": "중앙", "element": "토(土)", "item": "도자기"},
    "late": {"color": "흰색 계열", "direction": "서쪽", "element": "금(金)", "item": "금속 장신구"}
  }
}

[필수 조건 - 절대 누락하지 마세요!]
1. 'early', 'youth', 'middle', 'late' 그리고 'gaewun' 키 내부에 반드시 영어 키(general, early, youth, middle, late)를 사용하세요.
2. 특히 'gaewun' 객체는 **반드시 'general' 키를 포함하여 5개의 연령대 키 모두를 빠짐없이 제공해야 합니다.** 'general'이 없으면 시스템 에러가 발생합니다.
3. 'gaewun'의 모든 값은 예시처럼 'color', 'direction', 'element', 'item' 4가지 키를 가진 객체여야 합니다. 단, 'element' 값은 반드시 '목(木)', '화(火)', '토(土)', '금(金)', '수(水)' 중 하나로만 정확히 표기해야 합니다.
4. **매우 중요**: 본문 분석 내용에서 전문적인 명리학 용어나 오행을 언급할 때는 반드시 '한글(漢字)' 형식을 사용하세요. 예: 토(土), 목(목), 용신(用神), 격국(格局) 등. **절대 Metal, Wood 등 영어를 섞지 마세요.**
5. **매우 중요**: 강조하고 싶은 핵심 구절은 반드시 마크다운 마커를 사용하여 **진하게** 표시하세요. <b>와 같은 HTML 태그는 절대 사용하지 마세요.
가독성을 위해 각 분석 내용은 문단(paragraph)을 나누어 서술하고, 문단 사이에는 반드시 빈 줄(double newline) 넣어주세요. 상담하듯 다정하고 품격 있는 어투를 사용하세요.`;

        };

        const payload = {
          systemPrompt: generateSystemPromptString(sajuAnalysisJson),
          sajuJson: sajuAnalysisJson,
          expectedKeys: ["general", "early", "youth", "middle", "late", "early_summary", "youth_summary", "middle_summary", "late_summary", "life_balance", "daeun", "sinsal", "gaewun"]
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
            throw new Error("현재 운세 분석 서버에 접속자가 많아 기운을 읽는 데 시간이 걸리고 있습니다. 잠시 후 다시 시도해 주세요.");
          }
          
          throw new Error(userMsg);
        }

        if (!apiRes || !apiRes.ok) throw new Error("API 요청 실패");
        let llmResultRaw = await apiRes.json();
        const llmResult = cleanAstrologyTerms(llmResultRaw);

        const ELEM_MAP: Record<string, any> = {
          목: { c: "#81b29a", a: "나무가 많은 숲 산책" },
          화: { c: "#e07a5f", a: "햇빛 쬐기와 활발한 활동" },
          토: { c: "#f2cc8f", a: "안정적인 휴식과 흙길 걷기" },
          금: { c: "#e5e5e5", a: "정리정돈과 냉철한 판단" },
          수: { c: "#3d5a80", a: "물 마시기와 깊은 생각" },
        };

        const resultData = {
          elements: [
            { label: "목", value: (counts['목']/8)*100, color: "#81b29a" },
            { label: "화", value: (counts['화']/8)*100, color: "#e07a5f" },
            { label: "토", value: (counts['토']/8)*100, color: "#f2cc8f" },
            { label: "금", value: (counts['금']/8)*100, color: "#e5e5e5" },
            { label: "수", value: (counts['수']/8)*100, color: "#3d5a80" }
          ],
          life_balance: llmResult.life_balance || { wealth: 50, love: 50, career: 50, health: 50 },
          sections: [
            { id: "general", t: "인생 총운", d: { content: llmResult.general, summary: llmResult.general_summary, keyword: llmResult.general_keyword, gaewun: llmResult.gaewun?.general || {color:"-", direction:"-", element:"-", item:"-"} }, c: "var(--accent-gold)" },
            { id: "early", t: "초년: 10~20대", d: { content: llmResult.early, summary: llmResult.early_summary, keyword: llmResult.early_keyword, gaewun: llmResult.gaewun?.early || {color:"-", direction:"-", element:"-", item:"-"} }, c: "#81b29a" },
            { id: "youth", t: "청년: 30대", d: { content: llmResult.youth, summary: llmResult.youth_summary, keyword: llmResult.youth_keyword, gaewun: llmResult.gaewun?.youth || {color:"-", direction:"-", element:"-", item:"-"} }, c: "#e07a5f" },
            { id: "middle", t: "중년: 40대", d: { content: llmResult.middle, summary: llmResult.middle_summary, keyword: llmResult.middle_keyword, gaewun: llmResult.gaewun?.middle || {color:"-", direction:"-", element:"-", item:"-"} }, c: "#D4A373" },
            { id: "late", t: "말년: 50대 이후", d: { content: llmResult.late, summary: llmResult.late_summary, keyword: llmResult.late_keyword, gaewun: llmResult.gaewun?.late || {color:"-", direction:"-", element:"-", item:"-"} }, c: "#3d5a80" }
          ],
          daeun: llmResult.daeun || "대운 분석 결과를 불러오지 못했습니다.",
          sinsal: llmResult.sinsal || "신살 분석 결과를 불러오지 못했습니다.",
          gaewun: llmResult.gaewun || []
        };

        setReading(resultData);
        setBazi(baziData);
        localStorage.setItem(cacheKey, JSON.stringify({ bazi: baziData, reading: resultData, correctedTimeInfo: timeInfo }));
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        console.error(err);
        alert("분석에 실패했습니다.");
      }
  };

  const renderHighlightedText = (text: any) => {
    if (!text || typeof text !== 'string') return null;
    
    const ELEMENT_COLORS: Record<string, string> = {
      '목(木)': '#81b29a',
      '화(火)': '#e07a5f',
      '토(土)': '#f2cc8f',
      '금(金)': '#C9A050',
      '수(水)': '#3d5a80'
    };

    return text.split('\n').filter(p => p.trim() !== '').map((para, i) => {
      // Handle bold text **bold** and Elements
      const parts = para.split(/(\*\*.*?\*\*|<b>.*?<\/b>|목\(木\)|화\(火\)|토\(土\)|금\(金\)|수\(水\))/g);
      
      // If the paragraph looks like a title
      const isHeader = /^[\d\s]*[📍📅🔍💡🎯🏆💎✨]/.test(para.trim());

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
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} style={{ color: "var(--text-primary)", fontWeight: "700" }}>{part.slice(2, -2)}</strong>;
            }
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
    const ELEMENT_COLORS: Record<string, string> = {
      '목(木)': '#81b29a', '화(火)': '#e07a5f', '토(土)': '#f2cc8f', '금(金)': '#C9A050', '수(水)': '#3d5a80'
    };
    const parts = text.split(/(\*\*.*?\*\*|<b>.*?<\/b>|목\(木\)|화\(火\)|토\(土\)|금\(金\)|수\(水\))/g);
    return parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j} style={{ color: "var(--text-primary)", fontWeight: "700" }}>{part.slice(2, -2)}</strong>;
      }
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
    return text
      .replace(/Metal\(금\)/g, '금(金)')
      .replace(/Wood\(목\)/g, '목(木)')
      .replace(/Water\(수\)/g, '수(水)')
      .replace(/Fire\(화\)/g, '화(火)')
      .replace(/Earth\(토\)/g, '토(土)')
      .replace(/금\(Metal\)/g, '금(金)')
      .replace(/목\(Wood\)/g, '목(木)')
      .replace(/수\(Water\)/g, '수(水)')
      .replace(/화\(Fire\)/g, '화(火)')
      .replace(/토\(Earth\)/g, '토(土)')
      .replace(/([甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥])\(.*?\)/g, (match, hanja) => {
        const map: Record<string, string> = {
          '甲':'갑','乙':'을','丙':'병','丁':'정','戊':'무','己':'기','庚':'경','辛':'신','壬':'임','癸':'계',
          '子':'자','丑':'축','寅':'인','卯':'묘','辰':'진','巳':'사','午':'오','未':'미','申':'신','酉':'유','戌':'술','亥':'해'
        };
        return `${map[hanja] || hanja}(${hanja})`;
      });
  };

  const RollingNumber = ({ value }: { value: number }) => {
    return <>{value}</>;
  };

  return (
    <main style={{ width: "100%", minHeight: "100vh", position: "relative", background: "var(--bg-primary)" }}>
      <Disclaimer />
      <TraditionalBackground />
      
      <div style={{ 
        maxWidth: "480px", 
        margin: "0 auto", 
        height: (isLoading || (bazi && reading)) ? "auto" : "100%",
        position: "relative", 
        zIndex: 1, 
        background: "rgba(255, 255, 255, 0.95)", 
        backdropFilter: "blur(20px)",
        boxShadow: "0 0 60px rgba(26, 28, 44, 0.12)",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
        overflowY: (isLoading || (bazi && reading)) ? "initial" : "hidden"
      }}>
        <div style={{ padding: "20px 20px" }}>
          <Link href="/" style={{ textDecoration: "none", marginBottom: "16px", display: "inline-block" }}>
            <button style={{ background: "rgba(42, 54, 95, 0.05)", border: "none", color: "var(--accent-indigo)", cursor: "pointer", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><ArrowLeft size={18} /></button>
          </Link>

          <div style={{ textAlign: "center", marginBottom: (isLoading || (bazi && reading)) ? "32px" : "20px" }}>
            <motion.div 
               initial={{ opacity: 0, y: -10 }} 
               animate={{ opacity: 1, y: 0 }}
               style={{ display: "inline-block", background: "var(--accent-cherry)", color: "var(--accent-indigo)", padding: "1px 6px", borderRadius: "8px", fontSize: "0.45rem", fontWeight: "700", marginBottom: "4px", letterSpacing: "0.1em" }}
            >
              CHEONG-A MAE-DANG
            </motion.div>
            <h1 style={{ fontSize: "1.05rem", fontWeight: "700", marginBottom: "4px", letterSpacing: "0", color: "var(--accent-indigo)" }}>청아매당 사주</h1>
            <div style={{ width: "24px", height: "1px", background: "var(--accent-gold)", margin: "8px auto 8px" }}></div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: "1.4", fontFamily: "'Nanum Myeongjo', serif" }}>전통의 지혜로 운명을 비춥니다.</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <section style={{ padding: "0 8px" }}>
              <h2 style={{ fontSize: "0.9rem", marginBottom: "16px", borderBottom: "1px solid var(--glass-border)", paddingBottom: "10px", display: "flex", alignItems: "center", gap: "8px", fontWeight: "500" }}>
                <CalendarDays className="w-4 h-4" /> 정보 입력
              </h2>
              <div style={{ display: "grid", gap: "12px" }}>
                <div onClick={() => setIsDatePickerOpen(true)} className="glass-input" style={{ cursor: "pointer", padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.8)", fontSize: "0.9rem" }}>{date}</div>
                <WheelDatePicker isOpen={isDatePickerOpen} onClose={() => setIsDatePickerOpen(false)} initialDate={date} onConfirm={(d) => setDate(d)} />
                
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
                onClick={calculateBazi} 
                disabled={isLoading} 
                className="btn-primary" 
                style={{ 
                  width: "100%", 
                  marginTop: "24px", 
                  padding: "16px", 
                  borderRadius: "16px", 
                  fontSize: "1.05rem", 
                  fontWeight: "500", 
                  background: "var(--accent-indigo)",
                  boxShadow: "0 10px 25px rgba(42, 54, 95, 0.2)",
                  border: "none"
                }}
              >
                {isLoading ? "기운을 살피는 중..." : "운세 분석 시작하기"}
              </motion.button>
            </section>

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
                          <AnimatedGauge label="재물복 수준" value={reading.life_balance.wealth} color="#C9A050" icon={<Coins size={20} />} />
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
                            <h3 style={{ fontSize: "1.4rem", marginBottom: "20px", color: sec.c, fontWeight: "300" }}>{sec.t}</h3>
                            <div style={{ fontSize: "1.05rem", marginBottom: "24px", color: "var(--text-primary)", borderLeft: `4px solid ${sec.c}`, paddingLeft: "16px", lineHeight: "1.7" }}>
                              "{renderInlineHighlights(sec.d.summary || "")}"
                            </div>
                            <div style={{ lineHeight: "1.85", fontSize: "0.95rem", color: "var(--text-secondary)", wordBreak: "keep-all" }}>
                               {renderHighlightedText(sec.d.content)}
                            </div>
                            {sec.d.gaewun && sec.d.gaewun.color && (
                              <div style={{ marginTop: "24px", padding: "20px", background: "rgba(255, 255, 255, 0.5)", borderRadius: "16px", border: `1px solid rgba(0,0,0,0.05)`, boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
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
                        <div style={{ padding: "24px", background: "rgba(201, 160, 80, 0.05)", borderRadius: "20px", border: "1px solid rgba(201, 160, 80, 0.1)" }}>
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
                    {/* 하단 뒤로가기 버튼 추가 */}
                    <div style={{ marginTop: "64px", display: "flex", justifyContent: "center", gap: "16px" }}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
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
      </div>
    </main>
  );
}

