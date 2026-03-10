"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, CalendarDays, Sparkles, MoonStar, Scroll, Coins, Briefcase, Activity, Heart, Target, Users, Wallet, ShieldAlert } from "lucide-react";
import { calculateSaju } from "ssaju";
import TraditionalBackground from "@/components/TraditionalBackground";
import Disclaimer from "@/components/Disclaimer";
import WheelDatePicker from "@/components/WheelDatePicker";

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
      tabs: ["지난달", "이번달", "다음달"],
      keys: ["last_month", "this_month", "next_month"]
    },
    yearly: {
      title: "년간 운세",
      desc: "올해의 거시적 판도와 운의 흐름",
      icon: <Scroll className="w-6 h-6" />,
      tabs: ["지난해", "올해", "내년"],
      keys: ["last_year", "this_year", "next_year"]
    },
    wealth: {
      title: "재물운",
      desc: "인생의 단계별 금전적 기회와 성취",
      icon: <Coins className="w-6 h-6" />,
      tabs: ["초년: 10~20대", "청년: 30대", "중년: 40대", "장년: 50대", "말년: 60대 이후"],
      keys: ["early", "youth", "middle", "mature", "late"]
    },
    business: {
      title: "사업운 흐름",
      desc: "사회적 성취와 계약, 성장의 방향",
      icon: <Briefcase className="w-6 h-6" />,
      tabs: ["전체적인 흐름"],
      keys: ["overall"]
    },
    health: {
      title: "건강운 흐름",
      desc: "신체 에너지와 마음의 안녕",
      icon: <Activity className="w-6 h-6" />,
      tabs: ["초년: 10~20대", "청년: 30대", "중년: 40대", "장년: 50대", "말년: 60대 이후"],
      keys: ["early", "youth", "middle", "mature", "late"]
    },
    love: {
      title: "애정운 흐름",
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

  const [isLoading, setIsLoading] = useState(false);
  const [loadingTextIdx, setLoadingTextIdx] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);

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

  const calculateFortune = async () => {
    setIsLoading(true);
    setBazi(null);
    setReading("");
    setActiveTab(["daily", "monthly", "yearly"].includes(typeParam) ? 1 : 0);

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
      const cacheKey = `fortune_v19_${date}_${time}_${isLunar}_${gender}_${typeParam}_${timeModifier}`;
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
      const todayStr = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

      if (typeParam === "wealth") {
        timeContext = "이 내담자의 인생 전체 '재물운'을 [초년(10~20대), 청년(30대), 중년(40대), 장년(50대), 말년(60대 이후)] 5단계 생애주기로 나누어 분석해 주세요.";
      } else if (typeParam === "monthly") {
        timeContext = `오늘은 ${todayStr}입니다. 지난달, 이번달, 다음달 3개월간의 운세를 각각 상세히 분석해 주세요. 
            각 기간별로 'content', 'score'(0-100점), 'gaewun'(color, direction, element, item 4가지 항목)을 반드시 포함한 객체로 응답하세요.`;
      } else if (typeParam === "yearly") {
        timeContext = `오늘은 ${todayStr}입니다. 지난해, 올해, 내년 3년간의 운세를 각각 상세히 분석해 주세요. 
            각 기간별로 'content', 'score'(0-100점), 'gaewun'(color, direction, element, item 4가지 항목)을 반드시 포함한 객체로 응답하세요.`;
      } else if (typeParam === "daily") {
        timeContext = `오늘은 ${todayStr}입니다. 어제, 오늘, 내일 3일간의 운세를 각각 상세히 분석해 주세요. 
            각 날짜별로 'content', 'score'(0-100점), 'gaewun'(color, direction, element, item 4가지 항목)을 반드시 포함한 객체로 응답하세요.`;
      } else {
        timeContext = `이 ${todayStr} 기준으로 내담자의 '${currentType.title}' 테마에 집중하여 분석해 주세요.`;
      }

      let systemPrompt = `당신은 통찰력 있는 사주 상담가입니다. 명리 데이터를 기반으로 깊이 있는 분석을 제공하세요.
반드시 JSON 형식으로 응답하며, 
- daily 테마일 경우: 'yesterday', 'today', 'tomorrow' 각각의 객체 사용.
- monthly 테마일 경우: 'last_month', 'this_month', 'next_month' 각각의 객체 사용.
- yearly 테마일 경우: 'last_year', 'this_year', 'next_year' 각각의 객체 사용.
- 공통: 모든 시간 기반 객체 내부에 'content', 'score'(숫자), 'gaewun'(객체: color, direction, element, item)를 포함. (단, element는 반드시 '목(木)', '화(火)', '토(土)', '금(金)', '수(水)' 중 하나로 표기)
- 기타 테마일 경우: ${currentType.keys[0]} 키를 사용하여 분석 내용을 제공.
- 전문 용어는 지양하고 비유적인 표현으로 다정하게 설명하세요.
- 마크다운 강조 기호(**)는 사용하지 마세요. 모든 텍스트는 일반 텍스트로 작성하세요.

배경: ${anchorKeywords.join(", ")}
${cuspScript ? `특이사항: ${cuspScript}` : ""}

내용: ${strongestElemTrait} ${weakestElemTrait}
${timeContext}`;

      if (typeParam === "wealth") {
        systemPrompt = `너는 재물운 전문 사주 분석가야. 사용자의 사주 명식을 분석하여 5단계 생애주기별(초년, 청년, 중년, 장년, 말년) 재물운을 심층적으로 분석해.
반드시 JSON 형식으로 응답하며, 'early', 'youth', 'middle', 'mature', 'late' 5개의 키 내부에 아래의 구조를 완벽하게 지켜서 반환해.
ai언어 금지! (AI 특유의 말투를 절대 쓰지 마세요)

# Output JSON Structure for EACH stage (early, youth, middle, mature, late)
{
  "summary": "(해당 시기의 재물운 핵심 총평 요약, 3문장 내외)",
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
        systemPrompt = `너는 건강 전문 사주 분석가야. 사용자의 사주 명식을 분석하여 5단계 생애주기별(초년, 청년, 중년, 장년, 말년) 건강운과 신체적/정신적 에너지를 심층적으로 분석해.
반드시 JSON 형식으로 응답하며, 'early', 'youth', 'middle', 'mature', 'late' 5개의 키 내부에 아래의 구조를 완벽하게 지켜서 반환해.
ai언어 금지! (AI 모델 특유의 딱딱한 말투를 절대 쓰지 마세요)

# Output JSON Structure for EACH stage (early, youth, middle, mature, late)
{
  "summary": "(해당 시기의 건강운 핵심 총평 요약, 3문장 내외)",
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
        systemPrompt = `너는 비즈니스 전문 사주 분석가이자 전략 컨설턴트인 'AI 비즈니스 마스터'야. 사용자의 사주 명식을 분석하여 단순한 운세를 넘어 실제 사업 경영에 도움이 되는 실무적이고 통찰력 있는 조언을 제공해.
반드시 JSON 형식으로 응답하며, '${currentType.keys[0]}' 단일 키 내부에 아래의 JSON 구조를 완벽하게 지켜서 반환해.
ai언어 금지! (AI 언어 모델이나 챗봇 특유의 말투를 절대 쓰지 마세요)

# Output JSON Structure (Strictly follow this structure)
{
  "${currentType.keys[0]}": {
    "summary": "(총론: 현재 사업운의 핵심 총평과 방향성 요약, 3문장 내외)",
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
        systemPrompt = `너는 애정운(연애/결혼) 전문 사주 분석가야. 사용자의 사주 명식을 분석하여 5단계 생애주기별(초년, 청년, 중년, 장년, 말년) 애정운과 인연의 흐름을 심층적으로 분석해.
반드시 JSON 형식으로 응답하며, 'early', 'youth', 'middle', 'mature', 'late' 5개의 키 내부에 아래의 구조를 완벽하게 지켜서 반환해.
ai언어 금지! (AI 모델 특유의 딱딱한 말투를 절대 쓰지 마세요)

# Output JSON Structure for EACH stage (early, youth, middle, mature, late)
{
  "summary": "(해당 시기의 애정운 핵심 총평 요약, 3문장 내외)",
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
    "color": "행운의 색상",
    "direction": "행운의 방향",
    "element": "추천 오행(목,화,토,금,수 중 택1)",
    "item": "행운의 아이템"
  }
}
* 주의: 모든 시기(early~late)에 대하여 위 포맷을 빠짐없이 작성.

배경: ${anchorKeywords.join(", ")}
${cuspScript ? `특이사항: ${cuspScript}` : ""}
내용: ${strongestElemTrait} ${weakestElemTrait}`;
      }

      const payload = {
        systemPrompt: systemPrompt,
        sajuJson: { gender, elementCounts, type: typeParam, baseDate: date },
        cityName: birthCity,
        expectedKeys: ["daily", "monthly", "yearly"].includes(typeParam) ? currentType.keys : currentType.keys
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
        let userMsg = errorData.details || errorData.error || "API 요청 실패";
        
        if (apiRes.status === 503 || userMsg.includes("503") || userMsg.includes("overload")) {
          userMsg = "현재 운세 분석 서버에 접속자가 많아 기운을 읽는 데 시간이 걸리고 있습니다. 잠시 후 다시 시도해 주세요.";
        }
        
        throw new Error(userMsg);
      }

      if (!apiRes || !apiRes.ok) throw new Error("API 요청 실패");
      const llmResult = await apiRes.json();
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
              gaewun: raw.gaewun || { color: "금색", direction: "동쪽", element: "금(金)", item: "장신구" }
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

  const renderHighlightedText = (text: any) => {
    if (!text || typeof text !== 'string') return null;
    return text.replace(/\*\*/g, '');
  };

  const RollingNumber = ({ value }: { value: number }) => {
    return <>{value}</>;
  };

  return (
    <main style={{ width: "100%", minHeight: "100vh", position: "relative", background: "var(--bg-primary)" }}>
      <Disclaimer />
      <TraditionalBackground />
      <div style={{ position: "relative", zIndex: 1 }} className="container py-8">
        <Link href="/" style={{ textDecoration: "none", marginBottom: "30px", display: "inline-block" }}>
          <button style={{ background: "transparent", border: "none", color: "var(--text-primary)", cursor: "pointer" }}><ArrowLeft /></button>
        </Link>

        <div className="text-center" style={{ marginBottom: "50px" }}>
          <h1 style={{ fontSize: "2.4rem", fontWeight: "300" }}>{currentType.title}</h1>
          <p style={{ color: "var(--text-secondary)" }}>{currentType.desc}</p>
        </div>

        <div style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
          <section style={{ padding: "0 16px" }}>
            <h2 style={{ fontSize: "1.2rem", marginBottom: "24px", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "12px" }}>분석 정보 입력</h2>
            <div style={{ display: "grid", gap: "24px" }}>
              <div onClick={() => setIsDatePickerOpen(true)} className="glass-input" style={{ cursor: "pointer" }}>{date}</div>
              <WheelDatePicker isOpen={isDatePickerOpen} onClose={() => setIsDatePickerOpen(false)} initialDate={date} onConfirm={(d) => setDate(d)} />

              <div style={{ display: "flex", gap: "8px" }}>
                <input type="time" className="glass-input" value={time} onChange={(e) => setTime(e.target.value)} style={{ flex: 1 }} />
                <div style={{ display: "flex", background: "rgba(0,0,0,0.05)", borderRadius: "30px", padding: "4px" }}>
                  <button onClick={() => setIsLunar(false)} style={{ padding: "8px 16px", borderRadius: "30px", background: !isLunar ? "white" : "transparent" }}>양력</button>
                  <button onClick={() => setIsLunar(true)} style={{ padding: "8px 16px", borderRadius: "30px", background: isLunar ? "white" : "transparent" }}>음력</button>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <select className="glass-input" value={birthCity} onChange={(e) => setBirthCity(e.target.value)} style={{ flex: 1 }}>
                  {Object.keys(cityDataMap).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div style={{ display: "flex", background: "rgba(0,0,0,0.05)", borderRadius: "30px", padding: "4px" }}>
                  <button onClick={() => setGender("M")} style={{ padding: "8px 16px", borderRadius: "30px", background: gender === "M" ? "white" : "transparent" }}>남</button>
                  <button onClick={() => setGender("F")} style={{ padding: "8px 16px", borderRadius: "30px", background: gender === "F" ? "white" : "transparent" }}>여</button>
                </div>
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.97 }} 
              onClick={calculateFortune} 
              disabled={isLoading} 
              className="btn-primary" 
              style={{ width: "100%", marginTop: "40px", padding: "18px", borderRadius: "30px", fontSize: "1.1rem", transition: "box-shadow 0.2s" }}
            >
              {isLoading ? "분석 중..." : `${currentType.title} 흐름 분석하기`}
            </motion.button>
          </section>

          <AnimatePresence>
            {(bazi || isLoading) && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "16px", marginTop: "40px" }} ref={resultRef} id="result-section">
                <h2 style={{ fontSize: "1.4rem", marginBottom: "30px", color: "var(--accent-gold)", textAlign: "center" }}>분석 결과</h2>

                {isLoading ? (
                  <div style={{ textAlign: "center", padding: "64px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ position: "relative", width: "120px", height: "120px", marginBottom: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
                        <defs>
                          <linearGradient id="goldGradientFortune" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#E6C875" />
                            <stop offset="100%" stopColor="#AA7C11" />
                          </linearGradient>
                        </defs>
                        <circle cx="60" cy="60" r="58" fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="3" />
                        <circle 
                          cx="60" cy="60" r="58" fill="none" stroke="url(#goldGradientFortune)" strokeWidth="3" 
                          strokeDasharray={364.42} 
                          strokeDashoffset={364.42 - (loadingProgress / 100) * 364.42} 
                          strokeLinecap="round"
                          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
                        />
                      </svg>
                      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", color: "var(--accent-gold)", fontWeight: "300" }}>
                        {loadingProgress}<span style={{ fontSize: "1rem", marginLeft: "2px", opacity: 0.8 }}>%</span>
                      </div>
                    </div>
                    <p style={{ color: "var(--text-secondary)", fontSize: "1rem", letterSpacing: "-0.02em" }}>{loadingTexts[loadingTextIdx]}</p>
                  </div>
                ) : (
                  <>
                    {typeParam === "business" || typeParam === "wealth" || typeParam === "health" || typeParam === "love" ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: (typeParam === "wealth" || typeParam === "health" || typeParam === "love") ? "80px" : "40px" }}>
                        {(typeParam === "wealth" || typeParam === "health" || typeParam === "love") && reading.overallEnergy && (
                          <div style={{ padding: "32px 20px", background: "white", borderRadius: "24px", border: "1px solid var(--glass-border)", boxShadow: "0 10px 30px rgba(0,0,0,0.03)", marginBottom: "32px" }}>
                            <h3 style={{ textAlign: "center", marginBottom: "24px", fontSize: "1rem", fontWeight: "500", color: "var(--text-primary)" }}>🎯 나의 타고난 오행 에너지 분포</h3>
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
                              whileInView={{ opacity: 1, y: 0, scale: 1 }}
                              viewport={{ once: true, margin: "-50px" }}
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

                              <div style={{ fontSize: "1.05rem", fontStyle: "italic", marginBottom: "32px", color: "var(--text-primary)", borderLeft: `4px solid ${secColor}`, paddingLeft: "16px", lineHeight: "1.7", wordBreak: "keep-all" }}>
                                "{summary}"
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
                                        <div style={{ fontSize: "0.95rem", color: "var(--text-primary)", fontWeight: "600" }}>{item.v}</div>
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

                        <motion.div
                          key={activeTab}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
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

                          <div style={{ fontSize: "1.05rem", lineHeight: "2.1", color: "var(--text-primary)", marginBottom: "48px", whiteSpace: "pre-line", wordBreak: "keep-all" }}>
                            {renderHighlightedText(reading[currentType.keys[activeTab]]?.content)}
                          </div>

                          <div style={{ padding: "32px 24px", background: "rgba(201, 160, 80, 0.03)", borderRadius: "24px", border: "1px solid rgba(201, 160, 80, 0.1)" }}>
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
                                  <div style={{ fontSize: "0.95rem", color: "var(--text-primary)", fontWeight: "600" }}>{item.v}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    ) : (
                      <div style={{ fontSize: "1.1rem", lineHeight: "2.2", color: "var(--text-primary)", whiteSpace: "pre-line" }}>
                        {renderHighlightedText(reading[currentType.keys[0]])}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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
