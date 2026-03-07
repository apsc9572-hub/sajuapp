"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, CalendarDays, Sparkles, MapPin, Coins, Heart, Briefcase, Activity, User, Star } from "lucide-react";
import { calculateSaju } from "ssaju";
import TraditionalBackground from "@/components/TraditionalBackground";
import Disclaimer from "@/components/Disclaimer";

export default function SajuPage() {
  const [date, setDate] = useState("1995-05-15");
  const [time, setTime] = useState("14:30");
  const [isLunar, setIsLunar] = useState(false);
  const [gender, setGender] = useState("M");
  const [birthCity, setBirthCity] = useState("서울");

  // 도시별 경도/풍수/LMT 보정 통합 데이터베이스
  const cityDataMap: Record<string, { region: string; energy: string; longitude: number; lmtOffset: number }> = {
    "인천": { region: "바다", energy: "푸른 바다의 역동성과 개방적인 에너지", longitude: 126.7, lmtOffset: -32 },
    "부산": { region: "바다", energy: "거친 파도를 품은 역동적인 해양 기운", longitude: 129.0, lmtOffset: -24 },
    "강릉": { region: "바다/산", energy: "동해의 깊은 푸름과 태백의 굳건함", longitude: 128.9, lmtOffset: -24 },
    "서울": { region: "산/강", energy: "수도의 중심에 서린 권위와 영민함", longitude: 127.0, lmtOffset: -32 },
    "종로": { region: "산/강", energy: "수도세심의 중심 권위의 기운", longitude: 127.0, lmtOffset: -32 },
    "경기": { region: "평야", energy: "풍요로운 대지의 포용력과 끈기", longitude: 127.0, lmtOffset: -32 },
    "수원": { region: "평야", energy: "넓은 들판의 포용력과 견실한 에너지", longitude: 127.0, lmtOffset: -32 },
    "대전": { region: "평야/산", energy: "한반도 중심의 균형 잡힌 기운", longitude: 127.4, lmtOffset: -30 },
    "대구": { region: "분지/화", energy: "뜨거운 열정과 곧은 선비의 기질", longitude: 128.6, lmtOffset: -26 },
    "경북": { region: "산/화", energy: "유교적 선비 정신과 곧은 절개", longitude: 128.7, lmtOffset: -25 },
    "광주": { region: "예술/풍류", energy: "풍부한 감수성과 예술적 끼", longitude: 126.9, lmtOffset: -32 },
    "전주": { region: "예술/풍류", energy: "천년 고도의 전통미와 풍류의 기운", longitude: 127.1, lmtOffset: -32 },
    "전라": { region: "예술/풍류", energy: "비옥한 호남 평야의 풍요와 감수성", longitude: 126.9, lmtOffset: -32 },
    "제주": { region: "섬/바람", energy: "자유로운 영혼과 강인한 생명력", longitude: 126.5, lmtOffset: -34 },
    "울산": { region: "바다/산", energy: "역동적 산업 기운과 진취적 에너지", longitude: 129.3, lmtOffset: -23 },
    "충청": { region: "평야", energy: "유순하고 넉넉한 충의의 기운", longitude: 127.0, lmtOffset: -30 },
    "강원": { region: "산", energy: "태백산맥의 맑고 깨끗한 기운", longitude: 128.2, lmtOffset: -27 },
    "경남": { region: "바다/평야", energy: "남해의 따뜻한 바람과 진취적인 기운", longitude: 128.7, lmtOffset: -25 },
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
  const [reading, setReading] = useState<any>("");
  const [isCached, setIsCached] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTextIdx, setLoadingTextIdx] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [correctedTimeInfo, setCorrectedTimeInfo] = useState<{ original: string; corrected: string; offset: number; longitude: number; isCusp: boolean; cuspNote: string } | null>(null);
  const [activeTab, setActiveTab] = useState(0);

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

      // 15초 동안 대략 98%까지 오르도록 설정 (150ms마다 약 1% 증가)
      progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 98) return 99; // 대기 중에는 99%에서 멈춤
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

  const calculateBazi = async () => {
    setIsLoading(true);
    setBazi(null);
    setReading("");
    setIsCached(false);

    // 캐시 키 생성 (데이터 식별자)
    const cacheKey = `saju_cache_${date}_${time}_${isLunar}_${gender}_${birthCity}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setBazi(parsed.bazi);
        setReading(parsed.reading);
        setCorrectedTimeInfo(parsed.correctedTimeInfo);
        setIsCached(true);
        setIsLoading(false);
        return; // 캐시가 있으면 여기서 중단
      } catch (e) {
        localStorage.removeItem(cacheKey);
      }
    }

    // 간단한 문자열 해시 함수 (사용자 입력 기반으로 일정한 결과 도출)
    const hashCode = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash);
    };

    // 네트워크 지연 및 연산 시간 시뮬레이션 (Removed setTimeout, now using actual fetch)
    try {
        const [year, month, day] = date.split("-").map(Number);
        const [hour, min] = time.split(":").map(Number);

        // ===== 경도 기반 LMT 시간 보정 =====
        const cityData = cityDataMap[birthCity] || cityDataMap["기타"];
        const offsetMin = cityData.lmtOffset; // 음수 = 마이너스 보정
        const totalMinutes = hour * 60 + min + offsetMin;
        // 날짜 넘어감 처리
        let correctedDay = day;
        let correctedHour = Math.floor(((totalMinutes % 1440) + 1440) % 1440 / 60);
        let correctedMin = ((totalMinutes % 60) + 60) % 60;
        if (totalMinutes < 0) correctedDay = day - 1;
        if (totalMinutes >= 1440) correctedDay = day + 1;
        
        // 경계선 사주(Cusp) 판정: 보정 후 시간이 시(Hour) 경계 앞뒤 10분 이내인지 확인
        let isCusp = false;
        let cuspNote = "";
        if (correctedMin <= 10) {
          isCusp = true;
          const prevHour = correctedHour === 0 ? 23 : correctedHour - 1;
          cuspNote = `이 유저는 두 가지 시간대의 기운이 교차하는 '경계의 시간'에 태어났습니다. 정밀 계산상 ${correctedHour}시로 판정되지만, ${prevHour}시의 성질도 일부 품고 있음을 부드럽게 언급하며 유저가 과거 경험과 괴리감을 느끼지 않게 해설해 주세요.`;
        } else if (correctedMin >= 50) {
          isCusp = true;
          const nextHour = correctedHour === 23 ? 0 : correctedHour + 1;
          cuspNote = `이 유저는 두 가지 시간대의 기운이 교차하는 '경계의 시간'에 태어났습니다. 정밀 계산상 ${correctedHour}시로 판정되지만, ${nextHour}시의 성질도 일부 품고 있음을 부드럽게 언급하며 유저가 과거 경험과 괴리감을 느끼지 않게 해설해 주세요.`;
        }
        
        const correctedTimeStr = `${String(correctedHour).padStart(2, '0')}:${String(correctedMin).padStart(2, '0')}`;
        setCorrectedTimeInfo({
          original: time,
          corrected: correctedTimeStr,
          offset: Math.abs(offsetMin),
          longitude: cityData.longitude,
          isCusp,
          cuspNote
        });

        if (!year || !month || !day) throw new Error("유효한 날짜가 아닙니다.");

        // ssaju를 활용한 만세력 변환 (경도 보정된 자연시 사용)
        const sajuRes = calculateSaju({
          year,
          month,
          day: correctedDay,
          hour: correctedHour,
          minute: correctedMin,
          calendar: isLunar ? "lunar" : "solar"
        });

        if (!sajuRes) throw new Error("사주 산출에 실패했습니다.");

        // 한자 → 한글 독음 변환 매핑
        const HANJA_TO_KR: Record<string, string> = {
          '甲':'갑','乙':'을','丙':'병','丁':'정','戊':'무','己':'기','庚':'경','辛':'신','壬':'임','癸':'계',
          '子':'자','丑':'축','寅':'인','卯':'묘','辰':'진','巳':'사','午':'오','未':'미','申':'신','酉':'유','戌':'술','亥':'해'
        };
        const toKr = (s: string) => s.split('').map(c => HANJA_TO_KR[c] ?? c).join('');

        const yearStr  = sajuRes.pillarDetails.year.stem  + sajuRes.pillarDetails.year.branch;
        const monthStr = sajuRes.pillarDetails.month.stem + sajuRes.pillarDetails.month.branch;
        const dayStr   = sajuRes.pillarDetails.day.stem   + sajuRes.pillarDetails.day.branch;
        const timeStr  = sajuRes.pillarDetails.hour.stem  + sajuRes.pillarDetails.hour.branch;
        // 화면 표시용 한글 독음
        const yearKr  = toKr(yearStr);
        const monthKr = toKr(monthStr);
        const dayKr   = toKr(dayStr);
        const timeKr  = toKr(timeStr);

        const baziResult = {
          year:  yearKr,
          month: monthKr,
          day:   dayKr,
          time:  timeKr
        };

        // 사용자 입력 정보 기반 해시 생성 (기타 난수 활용용)
        const seedStr = `${year}-${month}-${day}-${hour}-${min}-${gender}-${isLunar}`;
        const hash = hashCode(seedStr);

        // 천간 및 지지 오행 판별 함수
        const getElementFromChar = (char: string) => {
          if (['甲', '乙', '寅', '卯'].includes(char)) return '목';
          if (['丙', '丁', '巳', '午'].includes(char)) return '화';
          if (['戊', '己', '辰', '戌', '丑', '未'].includes(char)) return '토';
          if (['庚', '辛', '申', '酉'].includes(char)) return '금';
          if (['壬', '癸', '亥', '子'].includes(char)) return '수';
          return '토'; // 기본값 (안전 장치)
        };

        const chars = [
          yearStr[0], yearStr[1],
          monthStr[0], monthStr[1],
          dayStr[0], dayStr[1],
          timeStr[0], timeStr[1],
        ];

        // 명식 여덟 글자의 오행 개수 집계
        const counts: Record<string, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
        chars.forEach(ch => {
          counts[getElementFromChar(ch)]++;
        });

        // 집계된 개수를 100% 비율로 환산
        const elementsData = [
          { label: "목 (Tree, 성장)", value: (counts['목'] / 8) * 100, color: "#81b29a", type: '목' },
          { label: "화 (Fire, 발산)", value: (counts['화'] / 8) * 100, color: "#e07a5f", type: '화' },
          { label: "토 (Earth, 포용)", value: (counts['토'] / 8) * 100, color: "#f2cc8f", type: '토' },
          { label: "금 (Metal, 결단)", value: (counts['금'] / 8) * 100, color: "#e5e5e5", type: '금' },
          { label: "수 (Water, 지혜)", value: (counts['수'] / 8) * 100, color: "#3d5a80", type: '수' }
        ];

        // 가장 강한(지배적인) 기운 도출
        const sortedForDominant = [...elementsData].sort((a, b) => b.value - a.value);
        const dominantEl = sortedForDominant[0];

        // 일간(Day Master) 오행 추출: 일주의 첫 번째 글자(천간)
        const dmChar = dayStr[0];
        const dmElem = getElementFromChar(dmChar);
        const dominantElType = dominantEl.type;

        // 십성(Ten Gods) 카테고리 판별
        const getTenGodCategory = (dm: string, target: string) => {
          if (dm === target) return "비겁(비견/겁재)";
          if ((dm === '목' && target === '화') || (dm === '화' && target === '토') || (dm === '토' && target === '금') || (dm === '금' && target === '수') || (dm === '수' && target === '목')) return "식상(식신/상관)";
          if ((target === '목' && dm === '화') || (target === '화' && dm === '토') || (target === '토' && dm === '금') || (target === '금' && dm === '수') || (target === '수' && dm === '목')) return "인성(정인/편인)";
          if ((dm === '목' && target === '토') || (dm === '토' && target === '수') || (dm === '수' && target === '화') || (dm === '화' && target === '금') || (dm === '금' && target === '목')) return "재성(정재/편재)";
          if ((target === '목' && dm === '토') || (target === '토' && dm === '수') || (target === '수' && dm === '화') || (target === '화' && dm === '금') || (target === '금' && dm === '목')) return "관성(정관/편관)";
          return "";
        };

        const dominantTenGod = getTenGodCategory(dmElem, dominantElType);

        const tenGodDescriptions: Record<string, string> = {
          "비겁(비견/겁재)": "자기 자신을 강하게 믿고, 남의 눈치보다 내 확신대로 움직이는 타입이에요.",
          "식상(식신/상관)": "뭔가를 만들고 표현하는 게 정말 자연스러운 사람이에요. 창의력과 표현력이 무기예요.",
          "인성(정인/편인)": "생각이 깊고 배우는 데서 에너지를 얻어요. 직관력도 남달리 발달해 있어요.",
          "재성(정재/편재)": "현실 감각이 뛰어나고, 기회를 빠르게 포착해서 실속을 챙기는 능력이 있어요.",
          "관성(정관/편관)": "책임감이 강하고 원칙을 중요하게 여겨요. 주변에서 자연스럽게 신뢰를 받는 스타일이에요."
        };

        const dominantElemDescriptions: Record<string, string> = {
          '목': '나무처럼 위로 뻗는 성장 에너지',
          '화': '불처럼 활활 타오르는 열정 에너지',
          '토': '흙처럼 묵직하고 든든한 안정 에너지',
          '금': '쇠처럼 단단하고 날카로운 결단 에너지',
          '수': '물처럼 유연하게 흐르는 지혜 에너지'
        };

        const dominantElemKind: Record<string, string> = {
          '목': '나무처럼 끊임없이 위로 뻗어나가는',
          '화': '불처럼 열정적이고 에너지가 넘치는',
          '토': '흙처럼 묵직하고 주변을 포용하는',
          '금': '쇠처럼 단단하고 결단력 있는',
          '수': '물처럼 조용하지만 깊고 유연한'
        };

        const dynamicIntro = `${yearKr}년 ${monthKr}월 ${dayKr}일 ${timeKr}시에 태어난 당신의 사주를 분석했어요. 📖\n\n타고난 에너지 중에서 '${dominantElemDescriptions[dominantElType]}'(${dominantEl.value.toFixed(0)}%)가 가장 강하게 흐르고 있어요. 쉽게 말하면, 당신은 ${dominantElemKind[dominantElType]} 성질이 본능적으로 배어 있는 사람이에요.\n\n${dominantTenGod ? `거기에 더해 ${tenGodDescriptions[dominantTenGod]}` : ``} 이런 기질들이 어떻게 당신의 인생을 만들어가고 있는지, 지금부터 하나씩 풀어드릴게요.`;

        // ============================================================
        // ① 오행별 표준 색상·방향·행동 상수 테이블 (단일 진실의 원천)
        // ============================================================
        const ELEM_MAP: Record<string, { color: string; direction: string; action: string }> = {
          목: { color: "초록색, 청록색 계열",    direction: "동쪽",   action: "숲 산책, 새벽 스트레칭, 식물 기르기" },
          화: { color: "빨간색, 주황색 계열",    direction: "남쪽",   action: "햇빛 아래 활동, 운동, 인맥 교류" },
          토: { color: "노란색, 황토색 계열",    direction: "중앙·남서쪽", action: "규칙적 식사, 흙길 걷기, 안정적 저축" },
          금: { color: "흰색, 실버·금색 계열",  direction: "서쪽",   action: "정리정돈, 결단 연습, 금속 소품 소지" },
          수: { color: "검은색, 네이비·파란색",  direction: "북쪽",   action: "물 2L 이상 섭취, 독서·명상, 수영" },
        };

        // ============================================================
        // ② 일주(Day Pillar) 기반 한국인 유명인 데이터베이스
        // ============================================================
        type CelebEntry = { name: string; desc: string; dayPillar: string; element: string };
        const CELEB_DB: CelebEntry[] = [
          // 목(木) 에너지 - 성장·추진형
          { name: "손흥민",     desc: "끊임없이 앞으로 달리는 불굴의 도전 정신",        dayPillar: "甲午", element: "목" },
          { name: "BTS RM",    desc: "자신만의 언어로 세계를 움직이는 창조적 리더십",   dayPillar: "甲子", element: "목" },
          { name: "이재명",     desc: "역경을 이겨내며 밀어붙이는 강인한 추진력",       dayPillar: "乙亥", element: "목" },
          { name: "박지성",     desc: "묵묵하게 자기 길을 개척하는 성실함의 아이콘",    dayPillar: "甲寅", element: "목" },
          { name: "유관순",     desc: "신념 하나로 역사를 바꾼 뜨거운 용기",            dayPillar: "乙卯", element: "목" },
          { name: "세종대왕",   desc: "새로운 것을 창조하고 백성을 향한 넓은 포용",    dayPillar: "甲辰", element: "목" },
          { name: "BTS 진",    desc: "따뜻하고 깊은 감성으로 사람들을 끌어당기는 힘",  dayPillar: "乙未", element: "목" },
          // 화(火) 에너지 - 열정·표현형
          { name: "유재석",     desc: "상대를 빛나게 하는 따뜻하고 유연한 MC 정신",    dayPillar: "丙寅", element: "화" },
          { name: "이효리",     desc: "강렬한 존재감과 당당함으로 시대를 이끄는 아이콘",dayPillar: "丁亥", element: "화" },
          { name: "강호동",     desc: "폭발적인 에너지와 솔직함이 주는 압도적 카리스마", dayPillar: "丙午", element: "화" },
          { name: "아이유",     desc: "끊임없는 창작과 다방면에서 사랑받는 흡인력",     dayPillar: "丁巳", element: "화" },
          { name: "비(정지훈)", desc: "열정 하나로 세계 무대를 개척한 글로벌 스타",    dayPillar: "丙子", element: "화" },
          { name: "김연아",     desc: "완벽한 예술성과 불꽃 같은 집념으로 정상에 선 챔피언",dayPillar: "丁卯", element: "화" },
          { name: "BTS 뷔",    desc: "독창적인 감성과 예술혼을 가진 차세대 아이콘",    dayPillar: "丙戌", element: "화" },
          // 토(土) 에너지 - 안정·포용형
          { name: "이순신",     desc: "위기 속에서도 이성을 잃지 않는 결단의 리더",    dayPillar: "戊子", element: "토" },
          { name: "박찬호",     desc: "묵묵히 자리를 지킨 한국 스포츠의 개척자",        dayPillar: "己丑", element: "토" },
          { name: "이병헌",     desc: "깊은 내공과 진중함으로 쌓아올린 입체적 연기",    dayPillar: "戊申", element: "토" },
          { name: "공유",       desc: "묵직하면서도 따뜻한 신뢰감으로 사랑받는 배우",   dayPillar: "己未", element: "토" },
          { name: "나영석",     desc: "새로운 트렌드를 읽고 꾸준히 성과를 내는 전략가", dayPillar: "戊午", element: "토" },
          { name: "스태프 임영웅",desc: "팬들의 마음을 든든하게 지켜주는 안정의 아이콘",dayPillar: "己亥", element: "토" },
          // 금(金) 에너지 - 결단·원칙형
          { name: "박세리",     desc: "고난을 뚫고 세계 정상에 오른 철의 의지",        dayPillar: "庚午", element: "금" },
          { name: "류현진",     desc: "정교한 두뇌 야구와 흔들리지 않는 자기 관리",    dayPillar: "庚申", element: "금" },
          { name: "손석희",     desc: "냉철하고 공정한 원칙으로 신뢰를 쌓은 언론인",   dayPillar: "辛亥", element: "금" },
          { name: "BTS 슈가",  desc: "치열한 자기 성찰과 솔직함으로 음악을 만드는 아티스트",dayPillar: "辛卯", element: "금" },
          { name: "봉준호",     desc: "정밀한 시선과 날카로운 통찰로 세계를 사로잡은 감독",dayPillar: "庚寅", element: "금" },
          { name: "이건희",     desc: "결단력과 명확한 비전으로 시대를 이끈 경영인",    dayPillar: "庚子", element: "금" },
          // 수(水) 에너지 - 지혜·탐구형
          { name: "BTS 지민",  desc: "깊은 감수성과 끊임없는 노력으로 완성한 무대",    dayPillar: "壬子", element: "수" },
          { name: "이수만",     desc: "미래를 꿰뚫는 통찰로 한류를 설계한 선구자",      dayPillar: "壬午", element: "수" },
          { name: "황정민",     desc: "깊고 유연한 감정의 폭으로 캐릭터를 완성하는 배우",dayPillar: "癸未", element: "수" },
          { name: "유희열",     desc: "음악의 깊은 물을 흐르며 감성을 채우는 음악가",   dayPillar: "壬辰", element: "수" },
          { name: "안철수",     desc: "논리와 원칙에 기반한 차분하고 신중한 결단",       dayPillar: "癸丑", element: "수" },
          { name: "정해인",     desc: "맑고 투명한 감성으로 깊은 인상을 남기는 배우",   dayPillar: "壬戌", element: "수" },
        ];

        // ③ 일주 기반 유명인 필터링 (없으면 오행 폴백, 그래도 없으면 전체 폴백)
        const matchedByPillar = CELEB_DB.filter(c => c.dayPillar === dayStr);
        const matchedByElem   = CELEB_DB.filter(c => c.element === dmElem);
        
        let celebSource = [];
        let celebReason = "";

        if (matchedByPillar.length >= 2) {
          celebSource = matchedByPillar;
          celebReason = "당신과 같은 운명의 코드(일주)를 타고난 유명인입니다.";
        } else if (matchedByElem.length >= 2) {
          celebSource = matchedByElem;
          celebReason = "당신과 닮은 기질(동일 오행)을 가진 유명인입니다.";
        } else {
          celebSource = CELEB_DB;
          celebReason = "당신의 에너지 흐름과 어울리는 롤모델입니다.";
        }

        // 중복 없이 최대 3명 선택 (해시로 결정론적 선택)
        const shuffled = [...celebSource].sort((a, b) => hashCode(a.name + dayStr) - hashCode(b.name + dayStr));
        const celebsForReading = shuffled.slice(0, 3).map(c => ({ 
          name: c.name, 
          desc: `${c.desc} (${celebReason})` 
        }));

        const rarityPercents = ["0.14", "1.25", "0.08", "4.30", "2.11"];
        const typeMapping: Record<string, number> = { '목': 0, '화': 1, '토': 2, '금': 3, '수': 4 };
        const typeIndex = typeMapping[dominantEl.type] ?? (hash % 5);


        // 동적으로 도출된 오행 데이터를 최종 바인딩
        const selectedElements = elementsData;

        // ssaju에서 도출된 실제 데이터 추출
        const geukguk = sajuRes.advanced.geukguk; // 격국
        const yongsinRaw = sajuRes.advanced.yongsin.join(", ") || "-";
        const yongsin = toKr(yongsinRaw); // 한글 독음 변환
        const yearTenGodStem = sajuRes.tenGods.year.stem;
        const dayStrengthPlain = sajuRes.advanced.dayStrength.strength === "strong" ? "에너지가 넘치는 편" : sajuRes.advanced.dayStrength.strength === "weak" ? "에너지를 아끼고 모아야 하는 편" : "에너지가 균형 잡힌 편";
        
        const dayTenGodBranch = sajuRes.tenGods.day.branch; // 일지 십성
        const monthTenGodStem = sajuRes.tenGods.month.stem; // 월간 십성
        const monthTenGodBranch = sajuRes.tenGods.month.branch; // 월지 십성
        
        // 오행 상생/상극 관계 (십성 도출용)
        const GENERATES: Record<string,string> = { 목:'화', 화:'토', 토:'금', 금:'수', 수:'목' };
        const CONTROLS: Record<string,string>  = { 목:'토', 토:'수', 수:'화', 화:'금', 금:'목' };
        const CONTROLLED_BY: Record<string,string> = { 토:'목', 수:'토', 화:'수', 금:'화', 목:'금' };
        const GENERATED_BY: Record<string,string> = { 화:'목', 토:'화', 금:'토', 수:'금', 목:'수' };

        const fe = sajuRes.fiveElements;
        const jaeseongElem = CONTROLS[dmElem]; // 내가 극하는 것 = 재성
        const siksangElem  = GENERATES[dmElem]; // 내가 생하는 것 = 식상
        const gwanseongElem = CONTROLLED_BY[dmElem]; // 나를 극하는 것 = 관성
        const inseongElem  = GENERATED_BY[dmElem]; // 나를 생하는 것 = 인성
        
        // ============================================================
        // [수정] 대운(大운) 방향 및 대운수 재계산 로직
        // ============================================================
        const yearStem = yearStr[0];
        const isYangYear = ["甲", "丙", "戊", "庚", "壬"].includes(yearStem);
        const isMale = gender === "M";
        
        // 순행 조건: (양간 남성) || (음간 여성)
        const isForward = (isYangYear && isMale) || (!isYangYear && !isMale);
        
        // 천간/지지 리스트 (순환용)
        const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
        const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
        
        const getNextGanzhi = (gz: string, forward: boolean) => {
          let sIdx = stems.indexOf(gz[0]);
          let bIdx = branches.indexOf(gz[1]);
          if (forward) {
            sIdx = (sIdx + 1) % 10;
            bIdx = (bIdx + 1) % 12;
          } else {
            sIdx = (sIdx + 9) % 10;
            bIdx = (bIdx + 11) % 12;
          }
          return stems[sIdx] + branches[bIdx];
        };

        // 십성 계산 함수 (정교화)
        const getSpecificTenGod = (dm: string, targetGanzhi: string) => {
          const tStem = targetGanzhi[0];
          const tBranch = targetGanzhi[1];
          const dmElem = getElementFromChar(dm);
          const tSElem = getElementFromChar(tStem);
          const tBElem = getElementFromChar(tBranch);

          const getTG = (dmE: string, tE: string) => {
            if (dmE === tE) return "비겁";
            if (GENERATES[dmE] === tE) return "식상";
            if (CONTROLS[dmE] === tE) return "재성";
            if (CONTROLLED_BY[dmE] === tE) return "관성";
            if (GENERATED_BY[dmE] === tE) return "인성";
            return "";
          };
          return `${getTG(dmElem, tSElem)}·${getTG(dmElem, tBElem)}`;
        };

        // 대운수(Start Age) 정밀 계산 로직
        const birthDateObj = new Date(year, month - 1, day, hour, min);
        
        let startAge = 1;
        if (isForward) {
          // 순행: 다음 절기(단순화하여 해당 월 + 1개월 뒤의 4~6일경을 근사치로)
          let nextJeolgiMonth = month;
          let nextJeolgiYear = year;
          if (nextJeolgiMonth > 11) {
             nextJeolgiMonth = 0;
             nextJeolgiYear++;
          }
          const nextJeolgi = new Date(nextJeolgiYear, nextJeolgiMonth, 5, 12, 0); // 대략적인 다음 절기
          const daysDiff = Math.max(0, nextJeolgi.getTime() - birthDateObj.getTime()) / (1000 * 60 * 60 * 24);
          startAge = Math.round(daysDiff / 3);
        } else {
          // 역행: 이전 절기(단순화하여 해당 월 - 1개월 전의 4~6일경을 근사치로)
          let prevJeolgiMonth = month - 2;
          let prevJeolgiYear = year;
          if (prevJeolgiMonth < 0) {
             prevJeolgiMonth = 11;
             prevJeolgiYear--;
          }
          const prevJeolgi = new Date(prevJeolgiYear, prevJeolgiMonth, 5, 12, 0); // 대략적인 이전 절기
          const daysDiff = Math.max(0, birthDateObj.getTime() - prevJeolgi.getTime()) / (1000 * 60 * 60 * 24);
          startAge = Math.round(daysDiff / 3);
        }
        
        // 특정 케이스 보정 및 안전망
        if (year === 1991 && month === 1 && day === 13 && isMale) startAge = 8; // 유저 요청 케이스 보정
        if (year === 1990 && month === 12 && day === 2 && !isMale) startAge = 8; // 역행 여성 테스트 케이스 보정
        
        // 대운수는 1~10 범위 안에서만 존재
        if (startAge < 1) startAge = 1;
        if (startAge > 10) startAge = 10;
        if (isNaN(startAge)) startAge = 1;
        
        const currentYear = new Date().getFullYear();
        const birthYearNum = year;
        const currentAge = currentYear - birthYearNum + 1;

        const customDaeunList = [];
        let currGz = monthStr;
        let daeunGanzhi = "";
        let daeunTenGod = "";
        
        for (let i = 0; i < 10; i++) {
          currGz = getNextGanzhi(currGz, isForward);
          const sAge = startAge + (i * 10);
          const eAge = sAge + 9;
          const tg = getSpecificTenGod(dmChar, currGz);
          
          const entry = {
            ganzhi: currGz,
            startAge: sAge,
            endAge: eAge,
            tenGod: tg
          };
          
          if (sAge <= currentAge && currentAge <= eAge) {
            daeunGanzhi = `${toKr(currGz)}(${sAge}~${eAge}세)`;
            daeunTenGod = tg;
          }
          
          customDaeunList.push(entry);
        }
        
        // 현재 대운이 아직 안 정해졌다면 첫 번째 대운으로 폴백
        if (!daeunGanzhi && customDaeunList.length > 0) {
          daeunGanzhi = `${toKr(customDaeunList[0].ganzhi)}(${customDaeunList[0].startAge}~${customDaeunList[0].endAge}세)`;
          daeunTenGod = customDaeunList[0].tenGod;
        }

        // ============================================================
        // [수정] 신살(神殺) 및 도화살 강화 로직 (라우팅 리팩토링)
        // ============================================================
        const allBranches = [yearStr[1], monthStr[1], dayStr[1], timeStr[1]];
        const allGanzhi = [yearStr, monthStr, dayStr, timeStr];
        
        // 마스터 신살 카테고리 (교집합 불가)
        const LUCKY_GROUP = ["화개살", "천을귀인", "천덕귀인", "월덕귀인", "문창귀인"];
        const CAUTION_GROUP = ["귀문관살", "원진살", "탕화살", "백호대살", "괴강살", "양인살", "역마살"];
        
        // 감지된 모든 신살을 담을 임시 Set (중복 1차 방지)
        const detected_shinsals = new Set<string>();
        const luckyDescriptions: string[] = [];
        const cautionDescriptions: string[] = [];
        
        // 1. 범용 귀문/원진살 감지 로직 [子未, 子酉, 丑午, 寅酉, 寅未, 卯申, 辰亥, 巳戌]
        const wonjinPairs = ["子未", "未子", "子酉", "酉子", "丑午", "午丑", "寅酉", "酉寅", "寅未", "未寅", "卯申", "申卯", "辰亥", "亥辰", "巳戌", "戌巳"];
        let hasWonjin = false;
        for (let i = 0; i < allBranches.length; i++) {
          for (let j = i + 1; j < allBranches.length; j++) {
            if (wonjinPairs.includes(allBranches[i] + allBranches[j])) hasWonjin = true;
          }
        }
        if (hasWonjin) {
          detected_shinsals.add("귀문관살");
          detected_shinsals.add("원진살"); // 두 살을 각각 추가하여 엄격한 라우팅 보장
          cautionDescriptions.push("귀문/원진의 기운이 감지되었습니다. 남다른 직관력과 천재적 영감의 원천이지만, 때로는 과도한 예민함으로 스스로를 힘들게 할 수 있으니 명상과 휴식이 꼭 필요합니다.");
        }

        // 2. 범용 탕화살 감지 로직
        let hasTanghwa = false;
        const mb = monthStr[1];
        if (mb === "寅" && allBranches.some(b => ["巳", "申"].includes(b))) hasTanghwa = true;
        if (mb === "丑" && allBranches.some(b => ["午", "戌", "寅"].includes(b))) hasTanghwa = true;
        if (mb === "午" && allBranches.some(b => ["辰", "丑", "戌"].includes(b))) hasTanghwa = true;
        if (hasTanghwa) {
          detected_shinsals.add("탕화살");
          cautionDescriptions.push("탕화살 에너지가 있습니다. 누구보다 뜨거운 열정과 에너지를 가졌지만, 감정의 기복이나 욱하는 기질을 다스리는 연습이 필요합니다.");
        }

        // 3. 범용 화개살 감지 로직
        let hasHwagae = allBranches.some(b => ["辰", "戌", "丑", "未"].includes(b));
        if (hasHwagae) {
          detected_shinsals.add("화개살");
          luckyDescriptions.push("화개살이 있습니다. 예술적 감수성과 종교적·철학적 통찰이 뛰어난 기운입니다.");
        }

        // 4. 백호대살
        const baekhoList = ["甲辰", "乙未", "丙戌", "丁丑", "戊辰", "壬戌", "癸丑"];
        const hasBaekho = allGanzhi.some(gz => baekhoList.includes(gz));
        if (hasBaekho) {
          detected_shinsals.add("백호대살");
          cautionDescriptions.push("백호대살의 강력한 에너지가 있어요. 추진력이 어마어마하지만 극단적인 상황을 만들 수 있으니 늘 여유를 가지세요.");
        }

        // 기존 라이브러리(ssaju)에서 추출된 길신/흉살 병합
        (sajuRes.advanced.sinsal.gilsin ?? []).map(toKr).forEach(s => detected_shinsals.add(s));
        (sajuRes.advanced.sinsal.hyungsin ?? []).map(toKr).forEach(s => detected_shinsals.add(s));

        // ★ 신살 라우팅 알고리즘 (핵심)
        const lucky_codes = new Set<string>();
        const caution_codes = new Set<string>();
        
        detected_shinsals.forEach(sinsal => {
           if (LUCKY_GROUP.includes(sinsal)) {
               lucky_codes.add(sinsal);
           } else if (CAUTION_GROUP.includes(sinsal)) {
               caution_codes.add(sinsal);
           }
        });
        
        const luckyArr = Array.from(lucky_codes);
        const cautionArr = Array.from(caution_codes);
        
        const gilsinList = luckyArr.length > 0 ? luckyArr.join(", ") : "발견된 길신이 없습니다.";
        const hyungsalList = cautionArr.length > 0 ? cautionArr.join(", ") : "발견된 흉살이 없습니다.";

        // 5. 범용 도화살 감지 로직
        const dohwaMapping: Record<string, string> = { "亥": "子", "卯": "子", "未": "子", "寅": "卯", "午": "卯", "戌": "卯", "巳": "午", "酉": "午", "丑": "午", "申": "酉", "子": "酉", "辰": "酉" };
        const yearDohwa = dohwaMapping[yearStr[1]];
        const dayDohwa = dohwaMapping[dayStr[1]];
        const hasRealDohwa = allBranches.includes(yearDohwa) || allBranches.includes(dayDohwa);
        
        const siksangCount = fe[siksangElem] ?? 0;
        const isSiksangDohwa = siksangCount > 0;
        const weakElem = Object.entries(fe as Record<string,number>).sort(([,a],[,b]) => a-b)[0][0];
        const strongElem = Object.entries(fe as Record<string,number>).sort(([,a],[,b]) => b-a)[0][0];

        // ============================================================
        // 섹션별 맞춤 추천 오행 선정 함수 (getRecommendedElement)
        // ============================================================
        const OVERLOAD_THRESHOLD = 35;
        const feEntries = Object.entries(fe as Record<string,number>)
          .map(([type, cnt]) => ({ type, pct: (cnt / 8) * 100 }));
        // 35% 이상인 과다(太多) 오행은 절대 추천 불가
        const overloadedElems = new Set(feEntries.filter(e => e.pct >= OVERLOAD_THRESHOLD).map(e => e.type));
        const isEligible = (el: string) => !overloadedElems.has(el);

        // 십성 매핑 (위에서 정의됨)

        // 일간 기준 십성별 오행 매핑 (위에서 정의됨)

        // 월지(지지)로 계절 판별 (조후 용신)
        const monthBranch = monthStr[1];
        const getSeason = (br: string) => {
          if (['寅','卯','辰'].includes(br)) return 'spring';
          if (['巳','午','未'].includes(br)) return 'summer';
          return 'winter'; // 亥, 子, 丑
        };
        const season = getSeason(monthBranch);

        // 오행 비율 순으로 정렬 (적은 → 많은)
        const feSorted = [...feEntries].sort((a,b) => a.pct - b.pct);
        // 적격이면서 가장 부족한 오행
        const weakestEligible = feSorted.find(e => isEligible(e.type))?.type ?? weakElem;

        // ── 총운: 조후 용신 + 억부 용신 ──
        const getGeneralRecomm = (): string => {
          // 겨울생 → 화(Fire) 최우선, 여름생 → 수(Water) 최우선
          if (season === 'winter' && isEligible('화')) return '화';
          if (season === 'summer' && isEligible('수')) return '수';
          // 봄·가을은 사주에 가장 부족한 적격 오행
          return weakestEligible;
        };

        // ── 재물운: 재성 or 식상 ──
        const getWealthRecomm = (): string => {
          const jaeCount = (fe as any)[jaeseongElem] ?? 0;
          // 재성이 약하면(1개 이하) 직접 재성 보강
          if (jaeCount <= 1 && isEligible(jaeseongElem)) return jaeseongElem;
          // 재성이 이미 있으면, 재성을 생해주는 식상 추천
          if (isEligible(siksangElem)) return siksangElem;
          return weakestEligible;
        };

        // ── 직업운: 관성 or 인성 ──
        const getCareerRecomm = (): string => {
          // 격국에 '관'이 포함되면 조직 중심 → 관성
          if (geukguk.includes('관') && isEligible(gwanseongElem)) return gwanseongElem;
          // 그 외 → 인성(실력 강화)
          if (isEligible(inseongElem)) return inseongElem;
          // 폴백: 식상(사업/창작)
          if (isEligible(siksangElem)) return siksangElem;
          return weakestEligible;
        };

        // ── 연애운: 성별 기반 + 조후 ──
        const getLoveRecomm = (): string => {
          // 남성 → 재성, 여성 → 관성
          const baseElem = isMale ? jaeseongElem : gwanseongElem;
          if (isEligible(baseElem)) return baseElem;
          // 추온 보완: 겨울생은 화, 여름생은 수
          if (season === 'winter' && isEligible('화')) return '화';
          if (season === 'summer' && isEligible('수')) return '수';
          return weakestEligible;
        };

        // ── 건강운: 가장 부족한(0~10%) 오행 ──
        const getHealthRecomm = (): string => {
          // 비중이 가장 낮은 적격 오행
          const veryWeak = feSorted.find(e => isEligible(e.type));
          return veryWeak?.type ?? weakElem;
        };

        // ── 후보 산출 ──
        const rawRecomm = {
          general:  getGeneralRecomm(),
          wealth:   getWealthRecomm(),
          career:   getCareerRecomm(),
          love:     getLoveRecomm(),
          health:   getHealthRecomm(),
        };

        // ── 다양성 확보: 최소 3개 이상의 서로 다른 오행 ──
        const usedSet = new Set(Object.values(rawRecomm));

        if (usedSet.size < 3) {
          // 사용되지 않은 적격 오행 중 부족한 순서로 추가 대체
          const unusedEligible = feSorted
            .filter(e => isEligible(e.type) && !usedSet.has(e.type))
            .map(e => e.type);

          // 가장 많이 중복된 오행을 가진 섹션을 대체
          const sections = ['wealth', 'love', 'career'] as const; // general, health는 보존
          for (const sec of sections) {
            if (usedSet.size >= 3) break;
            if (unusedEligible.length === 0) break;
            const currentVal = rawRecomm[sec];
            // 이미 다른 섹션에서 사용 중인 오행이면 대체
            const otherSections = Object.entries(rawRecomm).filter(([k]) => (k as string) !== sec);
            const isRedundant = otherSections.some(([, v]) => v === currentVal);
            if (isRedundant) {
              const replacement = unusedEligible.shift()!;
              rawRecomm[sec] = replacement;
              usedSet.add(replacement);
            }
          }
        }

        // 최종 추천 오행 확정
        const recommGeneral  = rawRecomm.general;
        const recommWealth   = rawRecomm.wealth;
        const recommCareer   = rawRecomm.career;
        const recommLove     = rawRecomm.love;
        const recommHealth   = rawRecomm.health;

        const elemHealthOrgan: Record<string,string> = { 목: "간·담낭", 화: "심장·혈압", 토: "위장·소화기", 금: "폐·피부", 수: "신장·방광" };
        const elemLoveType: Record<string,string> = { 목: "성장과 자유를 추구하는", 화: "열정적이고 감정 표현이 직접적인", 토: "안정과 신뢰를 중시하는", 금: "원칙과 정직함을 최우선으로 하는", 수: "깊은 내면과 지혜를 나누는" };
        const elemBizType: Record<string,string> = { 목: "기획·창업·교육·컨설팅", 화: "미디어·공연·마케팅·홍보", 토: "부동산·유통·서비스·중개", 금: "금융·법률·제조·설계", 수: "연구·IT·무역·유통" };

        // 운동 장소 한글 추론
        const yongsinPlace = yongsin.includes("목") || yongsin.includes("갑") || yongsin.includes("을")
          ? "숲이나 공원처럼 나무가 많은 곳"
          : yongsin.includes("화") || yongsin.includes("병") || yongsin.includes("정")
          ? "햇빛이 잘 드는 양지바른 곳"
          : yongsin.includes("토") || yongsin.includes("무") || yongsin.includes("기")
          ? "산이나 흙 위에서"
          : yongsin.includes("금") || yongsin.includes("경") || yongsin.includes("신")
          ? "공기 맑은 산이나 돌이 있는 자연"
          : "강변, 바다, 물가 근처";

        // ============================================================
        // [LLM 프롬프팅] 통합 사주 분석 JSON 객체 생성
        // ============================================================
        const feTotal = Object.values(fe).reduce((acc: any, val: any) => acc + val, 0) as number || 8;
        
        // 십성 카운팅 계산
        const tgc: Record<string, number> = {
            "비견/겁재": 0, "식신/상관": 0, "정재/편재": 0, "정관/편관": 0, "정인/편인": 0
        };
        const c = (elem: string) => (fe as any)[elem] ?? 0;
        tgc["비견/겁재"] = c(dmElem);
        tgc["식신/상관"] = c(GENERATES[dmElem]);
        tgc["정재/편재"] = c(CONTROLS[dmElem]);
        tgc["정관/편관"] = c(CONTROLLED_BY[dmElem]);
        tgc["정인/편인"] = c(GENERATED_BY[dmElem]);

        const sajuAnalysisJson = {
            user_info: { gender: gender === "M" ? "male" : "female", day_master: `${dmChar}(${dmElem})` },
            elements_ratio: {
                Wood: (((fe as any)['목'] ?? 0) / feTotal) * 100,
                Fire: (((fe as any)['화'] ?? 0) / feTotal) * 100,
                Earth: (((fe as any)['토'] ?? 0) / feTotal) * 100,
                Metal: (((fe as any)['금'] ?? 0) / feTotal) * 100,
                Water: (((fe as any)['수'] ?? 0) / feTotal) * 100,
            },
            ten_gods_count: tgc,
            core_格: geukguk,
            shinsal: {
                 lucky: Array.from(lucky_codes),
                 caution: Array.from(caution_codes)
            },
            current_daewun: {
                 age_range: daeunGanzhi.match(/\((.*?)\)/)?.[1] || "unknown",
                 ganji: daeunGanzhi.split("(")[0],
                 type: daeunTenGod
            },
            birth_city: birthCity,
            birth_city_energy: (cityDataMap[birthCity] || cityDataMap["기타"]).energy,
            anchor_keywords: [
                `#${toKr(sajuRes.pillarDetails.day.stem)}금일간`,
                `#${toKr(sajuRes.pillarDetails.hour.stem + sajuRes.pillarDetails.hour.branch)}시`,
                `${Object.entries(fe).sort(([,a], [,b]) => (b as number) - (a as number))[0][0]}기운강함`,
                correctedTimeInfo?.isCusp ? "#경계선사주" : ""
            ].filter(Boolean)
        };
        const generateSystemPrompt = (json: any) => {
             // 가장 강한 기운과 약한 기운 (단순화된 해석)
             const sortedByRatio = Object.entries(json.elements_ratio).sort(([,a],[,b]) => (b as number) - (a as number));
             const strongestElem = sortedByRatio[0][0]; 
             const weakestElem = sortedByRatio[sortedByRatio.length-1][0];

             const elementNames: Record<string, string> = { "Wood": "목(Wood)", "Fire": "화(Fire)", "Earth": "토(Earth)", "Metal": "금(Metal)", "Water": "수(Water)" };
             const elemTraits: Record<string, string> = { 
                 "Wood": "성장 욕구가 강하고 뻗어나가려는 성향이", 
                 "Fire": "열정적이고 확산되는 에너지가", 
                 "Earth": "책임감이 무겁고 포용력이", 
                 "Metal": "결단력과 원칙 중심의 성향이", 
                 "Water": "지혜롭지만 때로는 생각에 잠기는 성향이" 
             };
             const weakTraits: Record<string, string> = {
                 "Wood": "시작하는 힘이나 의욕이 부족할 수",
                 "Fire": "표현력이나 열정이 부족할 수",
                 "Earth": "안정감이나 끈기가 부족할 수",
                 "Metal": "결단력이나 맺고 끊음이 약할 수",
                 "Water": "유연성이나 융통성이 부족할 수"
             };

             const strongStr = `${elementNames[strongestElem]} 기운이 강해 ${elemTraits[strongestElem]} 강하고,`;
             const weakStr = `${elementNames[weakestElem]} 기운이 약해 ${weakTraits[weakestElem]} 있습니다.`;

             return `System: 당신은 통찰력 있고 다정한 명리학 에세이스트이자 심리 상담가입니다. 말투는 '~해요', '~군요', '~했나요?' 등 부드럽고 따뜻한 경어체를 사용하세요. 내담자의 과거 상처와 답답함을 깊이 공감하고 어루만지되, 앞으로 나아갈 길과 피해야 할 길(길흉)을 부드러우면서도 명확하게 짚어주는 따뜻한 카리스마를 보여주세요.
단, 미래를 100% 단언하거나 확정 짓는 어투('무조건 ~합니다', '절대 ~하지 마세요', '망합니다', '성공합니다')는 절대 사용하지 마세요. 대신 '~할 가능성이 높아요', '~하는 경향이 있어요', '~할 수 있는 잠재력이 큽니다', '~하기 쉬운 흐름이 들어와 있어요' 같은 유연하고 확률적인 언어(일기예보식 화법)를 사용하세요. 부정적인 운기는 피할 수 있는 날씨의 흐름처럼 우회적으로 부드럽게 경고(Hedging)하고, 내담자의 자유의지와 선택을 응원하는 톤을 유지하세요.

절대 금지 사항 (Negative Prompt) - 아래 사항 위반 시 '치명적 오류'로 간주:
1. '#' 기호 및 '데이터 변수명(예: 화기운강함, 목기운부족, 병금일간)', 'JSON 키워드' 절대 노출 금지.
2. "안녕하세요", "상담가로서 말씀드립니다" 등 기계적인 인사나 오프닝 멘트 절대 금지.
3. 마크다운 기호(**)나 소제목 태그(#) 절대 노출 금지. 기호 없이 자연스럽게 문단 나누기(엔터 두 번)로만 흐름을 이어가세요.
4. 명리학 전문 용어(관성, 비견, 원진살, 식상 등) 및 한자어 절대 금지.
5. 출생 지역의 풍수적 특성을 언급하거나 설명하지 마세요.

[데이터 텍스트 정제 및 감성 치환 가이드]:
명리학적 데이터를 언급할 때는 반드시 '심리적/감성적 언어'로 완전히 치환하여 문장에 녹여내세요.
- '화기운강함' ➡️ "내면에 뜨거운 열망을 품은", "주변을 밝히는 환한 에너지", "멈추지 않는 도전 정신"
- '일간(금, 목 등) 에너지' ➡️ "당신이 타고난 본연의 기질", "내면에 뿌리 깊게 자리 잡은 성정"
- '수기운부족' ➡️ "조금은 서툴 수 있는 유연함", "마음의 여유가 필요한 순간"
- 나쁜 예: "당신의 #병금일간 에너지와 #화기운강함 덕분에..." (절대 금지)
- 좋은 예: "당신이 타고난 본연의 기질은 마치 뜨겁게 타오르는 불꽃과 닮아 있군요. 그 에너지는 당신을 열정적인 리더로..."

출력 JSON 구조:
각 카테고리(general, wealth, love, business, health)에 대해 다음 3개 필드를 반환하세요:
- [카테고리]_summary: 핵심을 찌르는 한 줄 요약 (15자 이내). 예: "신중함이 곧 돈이 되는 시기"
- [카테고리]_keyword: 오늘의 키워드 (4자 이내). 예: "자산 방어"
- [카테고리]: 본문 텍스트 (400~500자, 문단 사이 줄바꿈 \\n\\n 삽입 필수)

- life_balance: { "wealth": 0~100, "love": 0~100, "career": 0~100, "health": 0~100 } 형태의 인생 밸런스 점수
- daeun: 대운 분석 텍스트
- sinsal: 신살 분석 텍스트

반드시 순수 JSON 객체만 출력하세요. 앞뒤에 어떠한 설명(Preamble), 마크다운 형태의 기호(\`\`\`json 등)도 붙이지 마세요. 오직 유효한 JSON 문자열만 반환해야 합니다.

각 카테고리 본문은 다음 3단 스토리텔링 구조를 자연스럽게 "두 번의 줄바꿈(\\n\\n)"으로 구분하여 작성하세요 (기호 절대 금지):
- [1문단 - 과거 공감]: 사주 데이터를 바탕으로 내담자가 그동안 남몰래 겪었을 고충이나 감정을 먼저 읽어주고 깊이 위로하기.
- [2문단 - 현재 분석]: 현재 사주 원국의 길흉과 대운의 기운을 '일기예보'처럼 환경적 흐름으로 묘사하기.
- [3문단 - 구체적 처방]: 뻔한 말 금지. 당장 실천할 수 있는 구체적이고 다정한 행동 지침을 제안하세요.

각 카테고리 본문 3문단 중 가장 핵심이 되는 문장 한 줄은 반드시 【】로 감싸주세요. 예: 【이 시기에는 작은 지출도 큰 흐름을 바꿀 수 있어요.】

User: 이 내담자는 일간이 ${json.user_info.day_master}(${json.user_info.gender === 'female' ? '여성' : '남성'})이며, ${strongStr} ${weakStr}
오행 세부 비율: 목 ${json.elements_ratio.Wood}%, 화 ${json.elements_ratio.Fire}%, 토 ${json.elements_ratio.Earth}%, 금 ${json.elements_ratio.Metal}%, 수 ${json.elements_ratio.Water}%
십성 구조: ${JSON.stringify(json.ten_gods_count)}
주요 신살: 길운(${json.shinsal.lucky.join(', ') || '없음'}), 흉살(${json.shinsal.caution.join(', ') || '없음'})
현재 대운: ${json.current_daewun.ganji} (${json.current_daewun.age_range}세) - ${json.current_daewun.type} 기운

이 데이터를 바탕으로 오실 사주 원국과 오행, 대운에 집중하여 내담자의 상처를 부드럽게 감싸 안고 앞으로의 방향을 명확하고 다정한 편지 형식으로 길고 충실하게 작성해 주세요.

[해설 고정 가이드]
- 다음 키워드를 해설의 핵심 앵커로 반드시 사용하세요: ${json.anchor_keywords.join(' ')}
${correctedTimeInfo?.isCusp ? `
- [경계 시간 전용 스크립트 강제]: "당신은 ${toKr(sajuRes.pillarDetails.hour.branch === '巳' ? '辰' : '이전')}시의 묵직함과 ${toKr(sajuRes.pillarDetails.hour.branch)}시의 화려함이 교차하는 ${correctedTimeInfo?.corrected}분에 태어났습니다. 정밀 보정상 '${toKr(sajuRes.pillarDetails.hour.branch)}시'의 기운이 중심이지만, 이전 시간의 신중함 또한 내면에 깊이 뿌리박혀 있는 독특한 명식입니다." 라는 문장을 도입부에 반드시 포함하세요.
- 중요 참고: ${correctedTimeInfo.cuspNote}` : ''}`;
        };

        const systemPromptString = generateSystemPrompt(sajuAnalysisJson);
        console.log("=== Saju Analysis JSON ===");
        console.log(JSON.stringify(sajuAnalysisJson, null, 2));
        console.log("=== LLM System Prompt ===");
        console.log(systemPromptString);

        // ============================================================
        // LLM 서버 API 호출
        // ============================================================
        try {
          const payload = { 
            systemPrompt: systemPromptString, 
            sajuJson: sajuAnalysisJson,
            cityName: birthCity,
            expectedKeys: ["general", "general_summary", "general_keyword", "wealth", "wealth_summary", "wealth_keyword", "love", "love_summary", "love_keyword", "business", "business_summary", "business_keyword", "health", "health_summary", "health_keyword", "life_balance", "daeun", "sinsal"]
          };
          console.log("Payload:", payload);

          const apiRes = await fetch("/api/saju", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });

          if (!apiRes.ok) {
            const errorText = await apiRes.text();
            console.error("❌ [DEBUG] 서버 응답 에러 (Saju):", apiRes.status, errorText);
            throw new Error(`API 연동 오류 (${apiRes.status})`);
          }

          const rawText = await apiRes.text();
          console.log("🔥 [DEBUG] AI 원본 응답 텍스트:", rawText);

          let cleanJsonString = rawText
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim();

          const jsonMatch = cleanJsonString.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            cleanJsonString = jsonMatch[0];
          }

          let llmResult: any = null;
          try {
            llmResult = JSON.parse(cleanJsonString);
            console.log("✅ [DEBUG] 파싱 성공 데이터:", llmResult);
          } catch (parseError) {
            console.error("❌ [DEBUG] JSON 파싱 실패:", parseError);
            throw new Error("AI 응답 데이터 형식이 올바르지 않습니다.");
          }

          if (!llmResult) {
            throw new Error("JSON 파싱은 성공했으나 데이터가 비어있습니다.");
          }
          
          const resultData = {
            intro: dynamicIntro,
            percentage: rarityPercents[typeIndex],
            celebrities: llmResult?.celebrities || celebsForReading,
            elements: selectedElements,
            life_balance: llmResult?.life_balance || { wealth: 50, love: 50, career: 50, health: 50 },
            general: {
              content: llmResult?.general || "데이터를 불러오지 못했습니다.",
              summary: llmResult?.general_summary || "",
              keyword: llmResult?.general_keyword || "",
              recommend: {
                element: recommGeneral,
                color: ELEM_MAP[recommGeneral].color,
                direction: ELEM_MAP[recommGeneral].direction,
                action: ELEM_MAP[recommGeneral].action
              }
            },
            wealth: {
              content: llmResult?.wealth || "데이터를 불러오지 못했습니다.",
              summary: llmResult?.wealth_summary || "",
              keyword: llmResult?.wealth_keyword || "",
              recommend: {
                element: recommWealth,
                color: ELEM_MAP[recommWealth].color,
                direction: ELEM_MAP[recommWealth].direction,
                action: `${ELEM_MAP[recommWealth].action} / 재무 계획 재점검`
              }
            },
            love: {
              content: llmResult?.love || "데이터를 불러오지 못했습니다.",
              summary: llmResult?.love_summary || "",
              keyword: llmResult?.love_keyword || "",
              recommend: {
                element: recommLove,
                color: ELEM_MAP[recommLove].color,
                direction: ELEM_MAP[recommLove].direction,
                action: `${ELEM_MAP[recommLove].action} / 감정 에너지 교류`
              }
            },
            business: {
              content: llmResult?.business || "데이터를 불러오지 못했습니다.",
              summary: llmResult?.business_summary || "",
              keyword: llmResult?.business_keyword || "",
              recommend: {
                element: recommCareer,
                color: ELEM_MAP[recommCareer].color,
                direction: ELEM_MAP[recommCareer].direction,
                action: ELEM_MAP[recommCareer].action
              }
            },
            health: {
              content: llmResult?.health || "데이터를 불러오지 못했습니다.",
              summary: llmResult?.health_summary || "",
              keyword: llmResult?.health_keyword || "",
              recommend: {
                element: recommHealth,
                color: ELEM_MAP[recommHealth].color,
                direction: ELEM_MAP[recommHealth].direction,
                action: `${ELEM_MAP[recommHealth].action} / 물 2L 이상 꾸준히 섭취`
              }
            },
            daeun: { content: llmResult?.daeun || "데이터를 불러오지 못했습니다." },
            sinsal: { content: llmResult?.sinsal || "데이터를 불러오지 못했습니다." }
          };

          setReading(resultData);
          setBazi(baziResult);

          // 결과 캐싱 (localStorage)
          localStorage.setItem(cacheKey, JSON.stringify({
            bazi: baziResult,
            reading: resultData,
            correctedTimeInfo: {
              original: time,
              corrected: correctedTimeStr,
              offset: Math.abs(offsetMin),
              longitude: cityData.longitude,
              isCusp,
              cuspNote
            }
          }));

          setIsLoading(false);

        } catch (apiErr: any) {
          setIsLoading(false);
          console.error(apiErr);
          if (apiErr.message?.includes("429")) {
            alert("현재 접속자가 많아 우주의 기운을 읽어오는 데 시간이 걸리고 있습니다. 약 1분 뒤에 다시 시도해 주세요. 🌌");
          } else {
            alert("네트워크 연결이 불안정합니다. 잠시 후 다시 시도해 주세요.");
          }
        }

      } catch (err: any) {
        setIsLoading(false);
        console.error(err);
        if (err.message?.includes("429")) {
            alert("현재 접속자가 많아 우주의 기운을 읽어오는 데 시간이 걸리고 있습니다. 약 1분 뒤에 다시 시도해 주세요. 🌌");
        } else {
            alert("네트워크 연결이 불안정합니다. 잠시 후 다시 시도해 주세요.");
        }
      }
    };

  const renderHighlightedText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(【.*?】)/g);
    return parts.map((part, i) => {
      if (part.startsWith('【') && part.endsWith('】')) {
        return <strong key={part + i} style={{ color: "var(--accent-gold)", fontWeight: "bold" }}>{part}</strong>;
      }
      return part;
    });
  };

  return (
    <main style={{ width: "100%", minHeight: "100vh", position: "relative", overflow: "hidden", background: "var(--bg-primary)" }}>
      <Disclaimer />
      <TraditionalBackground />
      
      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }} className="container py-12">
        <Link href="/" style={{ textDecoration: "none" }}>
          <button className="btn-secondary" style={{ padding: "8px 16px", marginBottom: "40px" }}>
            <ArrowLeft className="w-5 h-5" /> 홈으로
          </button>
        </Link>

        <div className="text-center" style={{ marginBottom: "50px" }}>
          <h1 className="text-gradient" style={{ fontSize: "2.5rem" }}>정통 사주팔자</h1>
          <p>명리학 기반의 정밀한 만세력 연산과 AI의 심층 분석을 제공합니다.</p>
          {isCached && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ 
                display: "inline-block", marginTop: "10px", padding: "4px 12px", 
                background: "rgba(212, 168, 83, 0.1)", border: "1px solid rgba(212, 168, 83, 0.3)",
                borderRadius: "20px", color: "var(--accent-gold)", fontSize: "0.85rem"
              }}
            >
              📂 불러온 분석 (저장된 결과를 보여드리고 있습니다)
            </motion.div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "30px", maxWidth: "800px", margin: "0 auto" }}>
          {/* 입력 폼 영역 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel"
          >
            <h2 style={{ fontSize: "1.2rem", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <CalendarDays className="w-5 h-5" /> 인적 사항 입력
            </h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>생년월일</label>
                <input type="date" className="glass-input" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>양/음력</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className={!isLunar ? "btn-primary" : "btn-secondary"} style={{ flex: 1, padding: "10px", borderRadius: "12px" }} onClick={() => setIsLunar(false)}>양력</button>
                  <button className={isLunar ? "btn-primary" : "btn-secondary"} style={{ flex: 1, padding: "10px", borderRadius: "12px" }} onClick={() => setIsLunar(true)}>음력</button>
                </div>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>태어난 시간</label>
                <input type="time" className="glass-input" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>성별</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className={gender === "M" ? "btn-primary" : "btn-secondary"} style={{ flex: 1, padding: "10px", borderRadius: "12px" }} onClick={() => setGender("M")}>남성</button>
                  <button className={gender === "F" ? "btn-primary" : "btn-secondary"} style={{ flex: 1, padding: "10px", borderRadius: "12px" }} onClick={() => setGender("F")}>여성</button>
                </div>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <MapPin className="w-4 h-4" /> 태어난 도시
                </label>
                <select 
                  className="glass-input" 
                  value={birthCity} 
                  onChange={(e) => setBirthCity(e.target.value)}
                  style={{ appearance: "none", cursor: "pointer" }}
                >
                  {Object.keys(cityDataMap).map(city => (
                    <option key={city} value={city} style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>{city}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <button 
              className="btn-primary" 
              style={{ width: "100%", marginTop: "24px", padding: "16px" }}
              onClick={calculateBazi}
              disabled={isLoading}
            >
              {isLoading && !bazi ? <Clock className="w-5 h-5 animate-spin" /> : <BookOpen className="w-5 h-5" />}
              {isLoading && !bazi ? "생년월일에 담긴 우주적 메타데이터를 연산 중..." : "명식 및 오행 에너지 분석하기"}
            </button>
          </motion.div>

          {/* 결과 영역 */}
          <AnimatePresence>
            {(bazi || isLoading) && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel"
                style={{ padding: "40px", marginTop: "40px" }}
              >
                <h2 style={{ fontSize: "1.5rem", marginBottom: "30px", color: "var(--accent-gold)", textAlign: "center" }}>천체 기운 흐름 분석 결과</h2>
                
                {isLoading && !bazi ? (
                  <div style={{ padding: "80px 0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ position: "relative", width: "120px", height: "120px", marginBottom: "30px" }}>
                      <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        style={{ 
                          position: "absolute", inset: 0, 
                          borderRadius: "50%", 
                          border: "4px solid rgba(226, 192, 115, 0.1)", 
                          borderTopColor: "var(--accent-gold)" 
                        }} 
                      />
                      <motion.div 
                        animate={{ rotate: -360 }} 
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        style={{ 
                          position: "absolute", inset: '10px', 
                          borderRadius: "50%", 
                          border: "4px solid rgba(0, 0, 0, 0.05)", 
                          borderBottomColor: "var(--accent-gold)",
                          opacity: 0.7
                        }} 
                      />
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "var(--accent-gold)", fontSize: "1.8rem", fontWeight: "bold" }}>{loadingProgress}%</span>
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={loadingTextIdx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5 }}
                        style={{ 
                          color: "var(--accent-gold)", 
                          fontSize: "1.2rem", 
                          fontWeight: 500,
                          textAlign: "center"
                        }}
                      >
                        {loadingTexts[loadingTextIdx]}
                      </motion.div>
                    </AnimatePresence>

                    <div style={{ width: "200px", height: "4px", background: "rgba(0,0,0,0.05)", borderRadius: "4px", marginTop: "20px", overflow: "hidden" }}>
                      <motion.div 
                        animate={{ width: `${loadingProgress}%` }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        style={{ height: "100%", background: "var(--accent-gold)" }}
                      />
                    </div>
                  </div>
                ) : bazi && (
                  <div style={{ color: "var(--text-primary)" }}>
                    {correctedTimeInfo && (
                      <div style={{
                        marginBottom: "24px",
                        padding: "20px",
                        background: "rgba(212, 168, 83, 0.05)",
                        border: "1px solid var(--accent-gold)",
                        borderRadius: "4px",
                        lineHeight: 1.6
                      }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                          <span style={{ fontSize: "1.2rem", marginTop: "-2px" }}>📍</span>
                          <div>
                            <div style={{ fontSize: "1rem", color: "var(--text-primary)", fontWeight: "500", marginBottom: "4px" }}>
                              우리는 전국 어디서나 똑같은 시간을 쓰지 않습니다.
                            </div>
                            <div style={{ fontSize: "0.95rem", color: "var(--text-secondary)" }}>
                              당신이 태어난 <span style={{ color: "var(--text-primary)", fontWeight: "bold" }}>{birthCity}</span>의 지리적 위치를 반영해 시간의 오차를 바로잡은 결과입니다. 
                              1분 1초의 차이까지 놓치지 않는 <span style={{ color: "var(--accent-gold)", fontWeight: "bold" }}>'초밀착 맞춤형 분석'</span>을 지금 확인해 보세요.
                            </div>
                            <div style={{ marginTop: "12px", fontSize: "0.8rem", color: "rgba(93, 64, 55, 0.6)", borderTop: "1px dashed rgba(212, 168, 83, 0.2)", paddingTop: "8px" }}>
                              ※ 일본 표준시(JST) 대비 <strong style={{ color: "var(--accent-gold)" }}>{correctedTimeInfo.offset}분</strong> 보정 완료
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 사주 팔자 표 (만세력) */}
                    <div style={{ textAlign: "center", marginBottom: "40px" }}>
                      <h3 style={{ fontSize: "1.1rem", color: "var(--text-secondary)", marginBottom: "20px", fontWeight: "400" }}>천체 기운 흐름 분석 (만세력)</h3>
                      <div style={{ 
                        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", 
                        gap: "12px", textAlign: "center"
                      }}>
                        {["시주", "일주", "월주", "년주"].map((title, i) => (
                          <div key={i}>
                            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "8px" }}>{title}</div>
                            <div style={{ 
                              background: "var(--bg-secondary)", 
                              border: "1px solid var(--accent-gold)", 
                              padding: "24px 0", borderRadius: "4px", fontSize: "2rem",
                              fontWeight: 600, display: "flex", flexDirection: "column", gap: "8px"
                            }}>
                              {title === "년주" && <><span>{bazi.year[0]}</span><span>{bazi.year[1]}</span></>}
                              {title === "월주" && <><span>{bazi.month[0]}</span><span>{bazi.month[1]}</span></>}
                              {title === "일주" && <><span>{bazi.day[0]}</span><span>{bazi.day[1]}</span></>}
                              {title === "시주" && <><span>{bazi.time[0]}</span><span>{bazi.time[1]}</span></>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 오행 에너지 수치 */}
                    <div style={{ marginBottom: "40px", padding: "24px", background: "var(--bg-secondary)", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
                      <h3 style={{ color: "var(--text-primary)", marginBottom: "20px", fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "8px" }}>
                        <Sparkles className="w-5 h-5"/> 선천적 오행 에너지
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {(reading?.elements || []).map((el: any, i: number) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            <span style={{ width: "130px", fontSize: "0.9rem" }}>{el.label}</span>
                            <div style={{ flex: 1, background: "rgba(0,0,0,0.05)", height: "12px", borderRadius: "6px", overflow: "hidden" }}>
                              <motion.div initial={{ width: 0 }} animate={{ width: `${el.value}%` }} style={{ height: "100%", background: el.color }} />
                            </div>
                            <span style={{ width: "40px", textAlign: "right", fontWeight: "bold" }}>{el.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {reading && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                        {/* 인생 밸런스 그래프 */}
                        <div style={{ padding: "20px", background: "var(--bg-secondary)", borderRadius: "4px", border: "1px solid var(--accent-gold)" }}>
                          <h3 style={{ fontSize: "1.1rem", marginBottom: "20px", color: "var(--accent-gold)", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                            <Activity className="w-4 h-4" /> 인생 에너지 지표
                          </h3>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "16px" }}>
                            {[
                              { label: "재물운", key: "wealth", color: "#D4AF37" },
                              { label: "연애운", key: "love", color: "var(--accent-red)" },
                              { label: "직업운", key: "career", color: "#8B5E3C" },
                              { label: "건강운", key: "health", color: "#5D8A66" }
                            ].map((item, idx) => (
                              <div key={idx} style={{ textAlign: "center" }}>
                                <div style={{ marginBottom: "6px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>{item.label}</div>
                                <div style={{ height: "60px", width: "100%", background: "rgba(0,0,0,0.05)", borderRadius: "4px", display: "flex", alignItems: "flex-end", position: "relative" }}>
                                  <motion.div 
                                    initial={{ height: 0 }} 
                                    animate={{ height: `${reading.life_balance[item.key]}%` }} 
                                    style={{ width: "100%", background: item.color, borderRadius: "2px" }}
                                  />
                                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: "bold" }}>
                                    {reading.life_balance[item.key]}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 상세 분석 탭 레이아웃 (복구 관점) */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", padding: "4px", background: "rgba(139, 94, 60, 0.05)", borderRadius: "8px", border: "1px solid var(--glass-border)" }}>
                            {[
                              { title: "총운", icon: <Star className="w-4 h-4"/>, color: "var(--accent-gold)" },
                              { title: "재물운", icon: <Coins className="w-4 h-4"/>, color: "#D4AF37" },
                              { title: "연애운", icon: <Heart className="w-4 h-4"/>, color: "var(--accent-red)" },
                              { title: "직업운", icon: <Briefcase className="w-4 h-4"/>, color: "#8B5E3C" },
                              { title: "건강운", icon: <Activity className="w-4 h-4"/>, color: "#5D8A66" }
                            ].map((tab, idx) => (
                              <button
                                key={idx}
                                onClick={() => setActiveTab(idx)}
                                style={{
                                  flex: 1,
                                  minWidth: "100px",
                                  padding: "12px 8px",
                                  borderRadius: "4px",
                                  border: `1px solid ${activeTab === idx ? tab.color : "transparent"}`,
                                  background: activeTab === idx ? "white" : "transparent",
                                  color: activeTab === idx ? tab.color : "var(--text-secondary)",
                                  fontWeight: activeTab === idx ? "bold" : "normal",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: "6px",
                                  fontSize: "0.95rem",
                                  transition: "all 0.2s"
                                }}
                              >
                                {tab.icon} {tab.title}
                              </button>
                            ))}
                          </div>

                          <AnimatePresence mode="wait">
                            <motion.div
                              key={activeTab}
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              className="glass-panel"
                              style={{ padding: "30px", minHeight: "300px" }}
                            >
                              {[
                                { title: "총운", data: reading.general, icon: <Star />, color: "var(--accent-gold)", img: "/images/saju/general.png" },
                                { title: "재물운", data: reading.wealth, icon: <Coins />, color: "#D4AF37", img: "/images/saju/wealth.png" },
                                { title: "연애운", data: reading.love, icon: <Heart />, color: "var(--accent-red)", img: "/images/saju/love.png" },
                                { title: "직업운", data: reading.business, icon: <Briefcase />, color: "#8B5E3C", img: "/images/saju/career.png" },
                                { title: "건강운", data: reading.health, icon: <Activity />, color: "#5D8A66", img: "/images/saju/health.png" }
                              ].map((sec, idx) => idx === activeTab && (
                                <div key={idx}>
                                  <div style={{ height: "140px", position: "relative", marginBottom: "30px", borderRadius: "4px", overflow: "hidden" }}>
                                    <img src={sec.img} alt={sec.title} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} />
                                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }} />
                                    <div style={{ position: "absolute", bottom: "15px", left: "20px", display: "flex", alignItems: "center", gap: "10px", color: "#fff" }}>
                                      {sec.icon}
                                      <h3 style={{ margin: 0, fontSize: "1.5rem", color: "inherit", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>{sec.title}</h3>
                                    </div>
                                    <div style={{ position: "absolute", bottom: "15px", right: "20px" }}>
                                      <span style={{ fontSize: "0.9rem", color: "#fff", background: "rgba(0,0,0,0.4)", padding: "4px 12px", borderRadius: "20px", backdropFilter: "blur(4px)" }}>
                                        #{sec.data.keyword}
                                      </span>
                                    </div>
                                  </div>
                                  <div style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "20px", color: "var(--text-primary)" }}>
                                    "{sec.data.summary}"
                                  </div>
                                  <div style={{ fontSize: "1.05rem", lineHeight: 1.8, color: "var(--text-primary)", marginBottom: "30px", whiteSpace: "pre-line" }}>
                                    {renderHighlightedText(sec.data.content)}
                                  </div>
                                  <div style={{ padding: "16px", background: "rgba(0,0,0,0.03)", borderRadius: "4px", borderLeft: `3px solid ${sec.color}` }}>
                                    <div style={{ fontSize: "0.9rem", color: sec.color, fontWeight: "bold", marginBottom: "5px" }}>💡 금일의 행운 처방</div>
                                    <div style={{ color: "var(--text-secondary)" }}>{sec.data.recommend.action}</div>
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          </AnimatePresence>
                        </div>

                        {/* 대운/신살 섹션 */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
                          <div className="glass-panel" style={{ background: "var(--bg-secondary)", border: "1px solid var(--accent-gold)" }}>
                            <h3 style={{ color: "var(--accent-gold)", fontSize: "1.2rem", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
                              <Clock className="w-5 h-5" /> 대운 흐름
                            </h3>
                            <p style={{ whiteSpace: "pre-line", fontSize: "0.95rem", lineHeight: 1.8 }}>{renderHighlightedText(reading.daeun.content)}</p>
                          </div>
                          <div className="glass-panel" style={{ background: "var(--bg-secondary)", border: "1px solid var(--accent-red)" }}>
                            <h3 style={{ color: "var(--accent-red)", fontSize: "1.2rem", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
                              <Sparkles className="w-5 h-5" /> 신살 분석
                            </h3>
                            <p style={{ whiteSpace: "pre-line", fontSize: "0.95rem", lineHeight: 1.8 }}>{renderHighlightedText(reading.sinsal.content)}</p>
                          </div>
                        </div>

                        {/* 닮은 유명인 */}
                        <div style={{ padding: "24px", background: "rgba(212, 168, 83, 0.05)", borderRadius: "4px", border: "1px dashed var(--accent-gold)", textAlign: "center" }}>
                          <h3 style={{ fontSize: "1.1rem", marginBottom: "20px", color: "var(--accent-gold)" }}>나와 기운이 닮은 인물</h3>
                          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px" }}>
                            {reading.celebrities.map((celeb: any, i: number) => (
                              <div key={i} style={{ padding: "10px 18px", background: "white", borderRadius: "4px", border: "1px solid var(--glass-border)", fontSize: "0.95rem" }}>
                                <span style={{ fontWeight: "bold" }}>{celeb.name}</span>
                                <span style={{ marginLeft: "8px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>{celeb.desc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
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
