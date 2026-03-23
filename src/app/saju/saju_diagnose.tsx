"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowUp, BookOpen, Clock, CalendarDays, Sparkles, MapPin, Coins, Heart, Briefcase, Activity, User, Star, Scroll, Copy, Check } from "lucide-react";
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
          <div style={{ fontSize: "0.6rem", color: "var(--text-secondary)" }}>?섏쓽 湲곗슫</div>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--accent-gold)" }}
          >
            ?ㅽ뻾
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
  const [birthCity, setBirthCity] = useState("?쒖슱");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // ?꾩떆蹂?寃쎈룄/LMT 蹂댁젙 ?곗씠?곕쿋?댁뒪
  const cityDataMap: Record<string, { region: string; energy: string; longitude: number; lmtOffset: number }> = {
    "?쒖슱": { region: "??媛?, energy: "?섎룄??以묒떖???쒕┛ 沅뚯쐞? ?곷???, longitude: 127.0, lmtOffset: -32 },
    "?몄쿇": { region: "諛붾떎", energy: "?몃Ⅸ 諛붾떎????룞?깃낵 媛쒕갑?곸씤 ?먮꼫吏", longitude: 126.7, lmtOffset: -33 },
    "?섏썝": { region: "?됱빞", energy: "?섏썝 ?붿꽦???뺢린? 議고솕濡쒖슫 湲곗슫", longitude: 127.0, lmtOffset: -32 },
    "?깅궓": { region: "???됱빞", energy: "?꾩떆???꾨????먮쫫怨??덉젙?곸씤 ?곗쟾", longitude: 127.1, lmtOffset: -32 },
    "怨좎뼇": { region: "媛??됱빞", energy: "?쇱궛 ?몄닔怨듭썝???됱삩?④낵 媛쒕갑???먮꼫吏", longitude: 126.8, lmtOffset: -33 },
    "?⑹씤": { region: "???됱빞", energy: "?섏?/湲고씎??議고솕濡?퀬 遺?쒕윭??湲곗슫", longitude: 127.2, lmtOffset: -31 },
    "遺泥?: { region: "?됱빞", energy: "臾명솕??以묒떖吏濡쒖꽌 留뚯씤??紐⑥씠??湲곗슫", longitude: 126.8, lmtOffset: -33 },
    "?덉궛": { region: "諛붾떎/媛?, energy: "?쒗빐??湲곗긽???덉? ?ъ슜怨???룞", longitude: 126.8, lmtOffset: -33 },
    "?⑥뼇二?: { region: "??媛?, energy: "?ㅼ궛 ?뺤빟?⑹쓽 吏?쒖? ?섎젮???먯뿰誘?, longitude: 127.2, lmtOffset: -31 },
    "?덉뼇": { region: "???됱빞", energy: "愿?낆궛 ?꾨옒 怨㏐퀬 諛붾Ⅸ ?좊퉬???뺢린", longitude: 126.9, lmtOffset: -32 },
    "?붿꽦": { region: "諛붾떎/?됱빞", energy: "?쒗빐 諛붾떎? 鍮꾩삦???吏???띿슂濡쒖?", longitude: 126.8, lmtOffset: -33 },
    "?됲깮": { region: "?됱빞/??뎄", energy: "?멸퀎濡?六쀬뼱媛??臾댁뿭怨?媛쒖쿃???뺢린", longitude: 127.1, lmtOffset: -32 },
    "?섏젙遺": { region: "??援곗궗", energy: "?섑샇???뺤떊怨?援녠굔???됲솕??湲곗슫", longitude: 127.0, lmtOffset: -32 },
    "?뚯＜": { region: "媛??됱빞", energy: "?꾩쭊媛뺤쓽 ?먮쫫怨??믪? 湲곗긽???덉닠??, longitude: 126.8, lmtOffset: -33 },
    "?쒗씎": { region: "諛붾떎/?됱빞", energy: "媛?낏???앸챸?κ낵 ?뚭툑泥섎읆 ?뚯갔 湲곗슫", longitude: 126.8, lmtOffset: -33 },
    "源??: { region: "媛?諛붾떎", energy: "?쒓컯 ?섍뎄???띿슂? ?덈줈??湲고쉶????, longitude: 126.7, lmtOffset: -33 },
    "愿묐챸": { region: "???됱빞", energy: "鍮쏆쓽 ?꾩떆?듦쾶 諛앷퀬 紐낅옉??吏?쒖쓽 ?뺢린", longitude: 126.9, lmtOffset: -32 },
    "愿묒＜(寃쎄린)": { region: "??媛?, energy: "?⑦븳?곗꽦???멸뎅 ?뺤떊怨?留묒? ?먯뿰誘?, longitude: 127.2, lmtOffset: -31 },
    "援고룷": { region: "???됱빞", energy: "?섎━?곗쓽 湲고뭹怨?議고솕濡쒖슫 ?띠쓽 湲곗슫", longitude: 126.9, lmtOffset: -32 },
    "?댁쿇": { region: "?됱빞", energy: "?꾩옄湲곗쓽 ?덉닠?깃낵 鍮꾩삦??????띿슂", longitude: 127.4, lmtOffset: -30 },
    "?ㅼ궛": { region: "?됱빞/媛?, energy: "?ㅼ궛泥쒖쓽 ?ъ쑀? ?곕쑜???ъ슜??, longitude: 127.1, lmtOffset: -32 },
    "?섎궓": { region: "??媛?, energy: "寃?⑥궛??湲곗꽭? ?쒓컯???됱삩??, longitude: 127.2, lmtOffset: -31 },
    "?묒＜": { region: "???됱빞", energy: "?묒＜ 蹂꾩궛????띾쪟? ?꾪넻??湲곗슫", longitude: 127.0, lmtOffset: -32 },
    "援щ━": { region: "??媛?, energy: "?꾩감?곌낵 ?쒓컯??留뚮굹??湲몃ぉ???됱슫", longitude: 127.1, lmtOffset: -32 },
    "?덉꽦": { region: "?됱빞/?덉닠", energy: "?덉꽦留덉땄???μ씤 ?뺤떊怨??띾쪟", longitude: 127.2, lmtOffset: -31 },
    "?ъ쿇": { region: "???몄닔", energy: "諛깆슫?곌낵 ?곗젙?몄닔???섎젮??湲고뭹", longitude: 127.2, lmtOffset: -31 },
    "?섏솗": { region: "???몄닔", energy: "諛깆슫?몄닔???됱삩怨??몄옄??湲곗슫", longitude: 127.0, lmtOffset: -32 },
    "?ъ＜": { region: "?됱빞/媛?, energy: "?몄쥌??뺤쓽 ?뺢낵 ?좊Ⅵ?ъ쓽 ?됲솕", longitude: 127.6, lmtOffset: -30 },
    "?숇몢泥?: { region: "??, energy: "?뚯슂?곗쓽 湲곕갚怨?媛뺤쭅??湲곗슫", longitude: 127.1, lmtOffset: -32 },
    "怨쇱쿇": { region: "??, energy: "泥?퀎?곗쓽 留묒쓬怨?吏?쒕줈???좊퉬????, longitude: 127.0, lmtOffset: -32 },
    "媛??: { region: "??媛?, energy: "?먮씪?ъ쓽 ?깃렇?ъ?怨?留묒? ?댁떇", longitude: 127.5, lmtOffset: -30 },
    "?묓룊": { region: "??媛?, energy: "?⑸Ц?곌낵 ?먮Ъ癒몃━???좎꽦??湲곗슫", longitude: 127.5, lmtOffset: -30 },
    "?곗쿇": { region: "媛???, energy: "?쒗깂媛뺤쓽 ??룞?깃낵 ?좉뎄???吏???뺢린", longitude: 127.1, lmtOffset: -32 },
    "遺??: { region: "諛붾떎", energy: "嫄곗튇 ?뚮룄瑜??덉? ??룞?곸씤 ?댁뼇 湲곗슫", longitude: 129.0, lmtOffset: -24 },
    "?援?: { region: "遺꾩?/??, energy: "?④굅???댁젙怨?怨㏃? ?좊퉬??湲곗쭏", longitude: 128.6, lmtOffset: -26 },
    "???: { region: "?됱빞/??, energy: "?쒕컲??以묒떖??洹좏삎 ?≫엺 湲곗슫", longitude: 127.4, lmtOffset: -30 },
    "愿묒＜": { region: "?덉닠/?띾쪟", energy: "?띾???媛먯닔?깃낵 ?덉닠????, longitude: 126.9, lmtOffset: -32 },
    "媛뺣쫱": { region: "諛붾떎/??, energy: "?숉빐??源딆? ?몃쫫怨??쒕갚??援녠굔??, longitude: 128.9, lmtOffset: -24 },
    "?쒖＜": { region: "??諛붾엺", energy: "?먯쑀濡쒖슫 ?곹샎怨?媛뺤씤???앸챸??, longitude: 126.5, lmtOffset: -34 },
    "湲고?": { region: "?吏", energy: "?쒕컲?꾩쓽 怨좎쑀???앸챸??, longitude: 127.5, lmtOffset: -30 },
  };

  const toKr = (str: string) => {
    const map: Record<string, string> = {
      "??: "媛?, "阿?: "??, "訝?: "蹂?, "訝?: "??, "??: "臾?, "藥?: "湲?, "佯?: "寃?, "渦?: "??, "鶯?: "??, "??: "怨?,
      "耶?: "??, "訝?: "異?, "野?: "??, "??: "臾?, "渦?: "吏?, "藥?: "??, "??: "??, "??: "誘?, "??: "??, "??: "??, "??: "??, "雅?: "??
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
    "?섎뒛??湲곗슫???댄뵾怨??덉뒿?덈떎...",
    "紐낆떇??議고솕瑜??댄뵾??以묒엯?덈떎...",
    "怨쇨굅? 誘몃옒???먮쫫???쎌뼱?닿퀬 ?덉뒿?덈떎...",
    "?뱀떊留뚯쓽 ?밸퀎???대챸???뺣━ 以묒엯?덈떎...",
    "嫄곗쓽 ???섏뿀?듬땲?? ?좎떆留?湲곕떎?ㅼ＜?몄슂..."
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
        alert("媛쒕컻??紐⑤뱶: 紐⑤뱺 罹먯떆 諛?荑좏궎媛 珥덇린?붾릺?덉뒿?덈떎.");
        window.location.reload();
        return 0;
      }
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = setTimeout(() => setClickCount(0), 2000);
      return newCount;
    });
  };

  // ?곗씠???곸냽???좎? (Sync with localStorage)
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
    "?곗＜??湲곗슫??紐⑥쑝??以?..",
    "?怨좊궃 紐낆떇???댄뵾怨??덉뒿?덈떎...",
    "?뱀떊留뚯쓣 ?꾪븳 ?대챸???먮쫫???쎌뼱?대뒗 以?..",
    "嫄곗쓽 ???붿뼱?? 臾몄옣???뺣━?섍퀬 ?덉뒿?덈떎..."
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

    // 利됱떆 寃곌낵/濡쒕뵫 ?곸뿭?쇰줈 ?ㅽ겕濡?    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);

    const cacheKey = `saju_cache_v8_${date}_${time}_${isLunar}_${gender}_${birthCity}`;
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

        const cityData = cityDataMap[birthCity] || cityDataMap["湲고?"];
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
          gender: gender === "M" ? "?? : "??
        });

        if (!sajuRes) throw new Error("?ъ＜ ?곗텧???ㅽ뙣?덉뒿?덈떎.");

        const HANJA_TO_KR: Record<string, string> = {
          '??:'媛?,'阿?:'??,'訝?:'蹂?,'訝?:'??,'??:'臾?,'藥?:'湲?,'佯?:'寃?,'渦?:'??,'鶯?:'??,'??:'怨?,
          '耶?:'??,'訝?:'異?,'野?:'??,'??:'臾?,'渦?:'吏?,'藥?:'??,'??:'??,'??:'誘?,'??:'??,'??:'??,'??:'??,'雅?:'??
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
          if (['??, '阿?, '野?, '??].includes(char)) return '紐?;
          if (['訝?, '訝?, '藥?, '??].includes(char)) return '??;
          if (['??, '藥?, '渦?, '??, '訝?, '誘?].includes(char)) return '??;
          if (['佯?, '渦?, '??, '??].includes(char)) return '湲?;
          if (['鶯?, '??, '雅?, '耶?].includes(char)) return '??;
          return '??;
        };

        const chars = [yearStr[0], yearStr[1], monthStr[0], monthStr[1], dayStr[0], dayStr[1], timeStr[0], timeStr[1]];
        const counts: Record<string, number> = { 紐? 0, ?? 0, ?? 0, 湲? 0, ?? 0 };
        chars.forEach(ch => { counts[getElementFromChar(ch)]++; });
        const dmElem = getElementFromChar(dayStr[0]);
        const jaeseongElem = { 紐?'??, ??'湲?, ??'??, 湲?'紐?, ??'?? }[dmElem] || '??;

        const currentYear = parseFloat(process.env.NEXT_PUBLIC_DEBUG_YEAR || "2026");
        const koreanAge = currentYear - year + 1;

        const sajuAnalysisJson = {
            user_info: { 
              gender: gender === "M" ? "?⑥꽦" : "?ъ꽦", 
              birth_year: year,
              current_age: koreanAge,
              day_master: `${dayStr[0]}(${dmElem})` 
            },
            elements_ratio: { Wood: counts['紐?], Fire: counts['??], Earth: counts['??], Metal: counts['湲?], Water: counts['??] },
            core_?? sajuRes.advanced.geukguk,
            gongmang: sajuRes.gongmang.branchesKo.join(', '),
            daeun_direction: sajuRes.daeun.basis.direction === "forward" ? "?쒗뻾(?뺣갑??" : "??뻾(??갑??",
            lucky_elements: sajuRes.advanced.yongsin.join(', '),
            shinsal: { lucky: sajuRes.advanced.sinsal.gilsin || [], caution: sajuRes.advanced.sinsal.hyungsin || [] },
            daeun_sequence: sajuRes.daeun.list.map((d: any) => {
              const koreanAge = d.startAge + 1;
              return `${koreanAge}??${koreanAge + 9}?? ${d.ganzhi}(${d.stemTenGod}/${d.branchTenGod})`;
            }).slice(0, 8),
            current_daeun: (() => {
                const current = sajuRes.daeun.list.find((d: any) => (koreanAge - 1) >= d.startAge && (koreanAge - 1) <= d.endAge);
                return current ? `${current.ganzhi}(${current.stemTenGod}/${current.branchTenGod})` : "?뺣낫 ?놁쓬";
            })(),
            daeun_chung_check: (() => {
                const current = sajuRes.daeun.list.find((d: any) => (koreanAge - 1) >= d.startAge && (koreanAge - 1) <= d.endAge);
                if (!current) return "遺꾩꽍 遺덇?";
                
                const checkChung = (g1: string, g2: string) => {
                    const branchChung: Record<string, string> = {
                      '??: '??, '??: '??, '異?: '誘?, '誘?: '異?, '??: '??, '??: '??,
                      '臾?: '??, '??: '臾?, '吏?: '??, '??: '吏?, '??: '??, '??: '??
                    };
                    return branchChung[g1[1]] === g2[1];
                };

                const yearClashes = sajuRes.seyun
                    .filter(s => s.year >= 2026 && s.year <= 2028)
                    .filter(s => checkChung(current.ganzhi, s.ganzhi))
                    .map(s => `${s.year}??${s.ganzhi})`);

                const monthClashes = sajuRes.wolun
                    .filter(w => checkChung(current.ganzhi, w.ganzhi))
                    .map(w => `${w.month}??${w.ganzhi})`);

                return {
                    is_chung_active: yearClashes.length > 0 || monthClashes.length > 0,
                    year_clashes: yearClashes.join(', ') || "?놁쓬",
                    month_clashes: monthClashes.join(', ') || "?놁쓬",
                    desc: "?꾩옱 ??닿낵 ?몄슫/?붿슫??吏吏媛 ?쒕줈 異?亦??섎뒗 愿怨꾩엯?덈떎. ?대뒗 蹂?붿? 異⑸룎, ?뱀? ?덇린移?紐삵븳 ?ш굔???붿떆?섎?濡??좎쓽 源딄쾶 ??댄빐???⑸땲??"
                };
            })(),
            tenGod_lookup: (() => {
              const dmChar = dayStr[0];
              const branchToStem: Record<string, string> = {
                '??: '怨?, '異?: '湲?, '??: '媛?, '臾?: '??, '吏?: '臾?, '??: '蹂?,
                '??: '??, '誘?: '湲?, '??: '寃?, '??: '??, '??: '臾?, '??: '??
              };
              const stems: Record<string, { element: string, polarity: string }> = {
                '媛?: { element: '紐?, polarity: '+' }, '??: { element: '紐?, polarity: '-' },
                '蹂?: { element: '??, polarity: '+' }, '??: { element: '??, polarity: '-' },
                '臾?: { element: '??, polarity: '+' }, '湲?: { element: '??, polarity: '-' },
                '寃?: { element: '湲?, polarity: '+' }, '??: { element: '湲?, polarity: '-' },
                '??: { element: '??, polarity: '+' }, '怨?: { element: '??, polarity: '-' }
              };
              const elements = ['紐?, '??, '??, '湲?, '??];
              
              const calculateTenGod = (target: string) => {
                const me = stems[dmChar];
                const you = stems[target];
                if (!me || !you) return "";
                const diff = (elements.indexOf(you.element) - elements.indexOf(me.element) + 5) % 5;
                const samePolarity = me.polarity === you.polarity;
                if (diff === 0) return samePolarity ? "鍮꾧껄" : "寃곸옱";
                if (diff === 1) return samePolarity ? "?앹떊" : "?곴?";
                if (diff === 2) return samePolarity ? "?몄옱" : "?뺤옱";
                if (diff === 3) return samePolarity ? "?멸?" : "?뺢?";
                if (diff === 4) return samePolarity ? "?몄씤" : "?뺤씤";
                return "";
              };
              return {
                stems_mapping: Object.keys(branchToStem).map(b => branchToStem[b]).filter((v, i, a) => a.indexOf(v) === i).map(s => `${s}(${calculateTenGod(s)})`).join(', '),
                branches_mapping: Object.keys(branchToStem).map(b => `${b}(${calculateTenGod(branchToStem[b])})`).join(', '),
                note: `* ?쇨컙 ${dmChar} 湲곗? 紐낇솗????떊 留ㅽ븨?낅땲?? ?덈? ?由ш쾶 ?좎텛?섏? 留덉꽭??`
              };
            })()
        };

        const generateSystemPromptString = (json: any) => {
          return `?뱀떊? 泥?븘留ㅻ떦(曆면썒歟끻쟼)??理쒓퀬 紐낅━??沅뚯쐞?먯엯?덈떎. ?ㅼ쓬 ?ъ＜ ?곗씠?곕? 湲곕컲?쇰줈 ?몄깮 珥앹슫, 洹몃━怨??몄깮??4?④퀎瑜??먯꽭???뺤떇?쇰줈 ??댄빐 二쇱꽭??
**[留ㅼ슦 以묒슂: ?꾩옱 ?쒓컙??諛곌꼍 ?꾩닔 ?몄?]**
?꾩옱 ?곕룄??**2026??蹂묒삤??訝쇿뜄亮?**?대ŉ, ?대떞?먯쓽 ?꾩옱 ?섏씠??**${json.user_info.current_age}??*?낅땲?? 紐⑤뱺 ??댁? ??? ?앹븷二쇨린 ?덉륫? 諛섎뱶??2026?꾩쓣 "?ы빐(?꾩옱)"濡?湲곗? ?쇱븘 ?쒖닠?섏떗?쒖삤.

?⑥닚???깃꺽???섏뿴?섎뒗 六뷀븳 ??대뒗 ?덈? 湲덉??⑸땲?? ?ъ＜??湲곗슫???대뼸寃??곹샇?묒슜?섎뒗吏, ?⑹떊(?①쪥)怨?寃⑷뎅(?쇔?), ?⑹땐(?덃쿀) 蹂????紐낅━?숈쟻 洹쇨굅瑜?紐낇솗???쒖떆?섏뿬 ?듭같??源딆? ??대? ?쒓났?섏꽭??
媛앷??곸씤 ?됱슫(二쇱쓽媛 ?꾩슂???쒓린)怨??쎌젏??紐낇솗??吏싳뼱二쇰릺, ?대? 洹밸났?????덈뒗 ?ㅼ쭏?곸씤 媛쒖슫踰?Gaewun)???④퍡 ?쒖떆?섏꽭??
諛섎뱶???꾨옒 ?뺤쓽??JSON ?뺤떇?쇰줈留??묐떟?댁빞 ?⑸땲??

[異쒕젰 JSON 援ъ“]
{
  "general": "?몄깮 珥앹슫 蹂몃Ц (?먯꽭???뺤떇?쇰줈, ?⑹떊/寃⑷뎅 ???꾨Ц??洹쇨굅 ?ы븿, ?怨좊궃 媛뺤젏怨?移섎챸???쎌젏 紐⑤몢 ??? ?뱁엳 怨듬쭩(${json.gongmang}) ?곹뼢 ?ы븿)",
  "general_summary": "珥앹슫 ?붿빟",
  "general_keyword": "珥앹슫 ?ㅼ썙??,
  "early": "珥덈뀈湲?~${json.daeun_sequence[1].split('??)[0]}?? ?몄깮???먮쫫怨??ы쉶??湲곕컲",
  "youth": "泥?뀈湲?${json.daeun_sequence[2].split('??)[0]}??${json.daeun_sequence[3].split('~')[1]}) ?몄깮???깆옣怨??깆랬??湲곗슫",
  "middle": "以묐뀈湲?${json.daeun_sequence[4].split('??)[0]}??${json.daeun_sequence[5].split('~')[1]}) ?몄깮???꾩꽦湲곗? ?뺤옣???먮쫫",
  "mature": "?λ뀈湲?50?~60? 珥덈컲) ?몄깮???덉젙怨?寃곗떎???먮쫫",
  "late": "留먮뀈湲?60? ?댄썑) ?몄깮???꾩꽦 ?댁떎怨??덉젙?곸씤 ?먮쫫",
  "early_summary": "珥덈뀈 ?붿빟",
  "youth_summary": "泥?뀈 ?붿빟",
  "middle_summary": "以묐뀈 ?붿빟",
  "mature_summary": "?λ뀈 ?붿빟",
  "late_summary": "留먮뀈 ?붿빟",
  "early_keyword": "珥덈뀈 ?ㅼ썙??,
  "youth_keyword": "泥?뀈 ?ㅼ썙??,
  "middle_keyword": "以묐뀈 ?ㅼ썙??,
  "mature_keyword": "?λ뀈 ?ㅼ썙??,
  "late_keyword": "留먮뀈 ?ㅼ썙??,
  "life_balance": {"wealth": 80, "love": 70, "career": 85, "health": 75},
  "daeun": "10??二쇨린????????? ??? ?꾩옱 ???${json.current_daeun})??以묒떖?쇰줈 ?대떦 ?쒓린??湲고쉶? ?꾧린瑜??쒖닠",
  "sinsal": "紐낆떇??二쇱슂 ?좎궡 ???(湲몄떊怨??됱떊???ㅼ젣 ?띠뿉 誘몄튂???곹뼢)",
  "chung_impact": "???異?亦? ?곹뼢 遺꾩꽍: ?꾩옱 ??닿낵 異⑸룎?섎뒗 ?쒓린(${json.daeun_chung_check.year_clashes}, ${json.daeun_chung_check.month_clashes})?????紐낅━?숈쟻 寃쎄퀬? ??묒콉.",
  "gaewun": {
    "general": {"color": "寃???怨꾩뿴", "direction": "遺곸そ", "element": "??麗?", "item": "?덉닠 媛먯긽 ?먮뒗 紐낆긽"},
    "early": {"color": "?몃Ⅸ 怨꾩뿴", "direction": "?숈そ", "element": "紐???", "item": "?섎Т ?붾텇"},
    "youth": {"color": "遺됱? 怨꾩뿴", "direction": "?⑥そ", "element": "????", "item": "諛앹? 議곕챸"},
    "middle": {"color": "?몃? 怨꾩뿴", "direction": "以묒븰", "element": "????", "item": "?꾩옄湲?},
    "mature": {"color": "蹂대씪??怨꾩뿴", "direction": "以묒븰", "element": "????", "item": "蹂댁꽍 ?먮뒗 臾몃갑援?},
    "late": {"color": "?곗깋 怨꾩뿴", "direction": "?쒖そ", "element": "湲???", "item": "湲덉냽 ?μ떊援?}
  }
}

[留ㅼ슦 以묒슂 - 媛?낆꽦 諛?臾몃떒 援ъ꽦]:
1. ?쒖옄 ?ъ슜 理쒖냼?? ?쒖옄瑜?吏곸젒 ?섏뿴?섏? 留먭퀬, ?쒓?濡?癒쇱? ?쒓린?섍퀬 ?꾩슂??寃쎌슦?먮쭔 愿꾪샇 ?덉뿉 ?쒖옄瑜?蹂묎린?섏꽭?? (?? 媛묐ぉ(?꿩쑉), ?뺤옱(閭ｈ깹)). ??대릺吏 ?딆? standalone ?쒖옄???덈? ?ъ슜?섏? 留덉꽭??
2. 臾몃떒 ?섎늻湲? 蹂몃Ц(general, early, youth, middle, late ?? ?묒꽦 ?? 諛섎뱶??3~4臾몄옣留덈떎 ??踰덉쓽 以꾨컮轅?\\n\\n)???ъ슜?섏뿬 臾몃떒??紐낇솗???섎늻??떆?? 媛?낆꽦??理쒖슦?좎엯?덈떎.
3. 遺꾨웾 議곗젅: 媛??뱀뀡蹂?蹂몃Ц? ?듭떖 ?꾩＜濡?紐낇솗?섍쾶 ?쒖닠?섏뿬 珥?500~600???댁쇅濡??좎??섏떗?쒖삤. ?덈Т 湲몄뼱吏吏 ?딄쾶 二쇱쓽?섏꽭??
4. ?꾨Ц ?⑹뼱 ?쒗솕: '鍮꾧껄', '?앹떊' ??紐낅━???⑹뼱瑜??ъ슜???뚮뒗 諛섎뱶??洹??섎?瑜??꾨??곸씤 鍮꾩쑀濡???댁꽌 ?ㅻ챸?섏꽭??
5. ??떊 留ㅽ븨??以?? 泥쒓컙 - ${json.tenGod_lookup.stems_mapping} / 吏吏 - ${json.tenGod_lookup.branches_mapping}瑜??덈??곸쑝濡??곕Ⅴ??떆??`;
        };

        const payload = {
          systemPrompt: generateSystemPromptString(sajuAnalysisJson),
          sajuJson: sajuAnalysisJson,
          expectedKeys: ["general", "early", "youth", "middle", "mature", "late", "general_summary", "early_summary", "youth_summary", "middle_summary", "mature_summary", "late_summary", "general_keyword", "early_keyword", "youth_keyword", "middle_keyword", "mature_keyword", "late_keyword", "life_balance", "daeun", "sinsal", "gaewun", "chung_impact"]
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
            await delay(1500 * retries); 
            continue;
          }

          const errorData = await apiRes.json().catch(() => ({}));
          const userMsg = errorData.details || errorData.error || "API ?붿껌 ?ㅽ뙣";
          
          if (apiRes.status === 503 || userMsg.includes("503") || userMsg.includes("overload")) {
            throw new Error("?꾩옱 ?댁꽭 ????쒕쾭???묒냽?먭? 留롮븘 湲곗슫???쎈뒗 ???쒓컙??嫄몃━怨??덉뒿?덈떎. ?좎떆 ???ㅼ떆 ?쒕룄??二쇱꽭??");
          }
          
          throw new Error(userMsg);
        }

        if (!apiRes || !apiRes.ok) throw new Error("API ?붿껌 ?ㅽ뙣");
        const llmResultRaw = await apiRes.json();
        const llmResult = cleanAstrologyTerms(llmResultRaw);

        const resultData = {
          bazi: baziData,
          reading: {
            elements: [
              { label: "湲?, value: (counts['湲?]/8)*100, color: "#FFD700" },
              { label: "??, value: (counts['??]/8)*100, color: "#3d5a80" }
            ],
            life_balance: llmResult.life_balance || { wealth: 50, love: 50, career: 50, health: 50 },
            sections: [
              { id: "general", t: "?몄깮 珥앹슫", d: { content: llmResult.general, summary: llmResult.general_summary, keyword: llmResult.general_keyword, gaewun: llmResult.gaewun?.general || {color:"-", direction:"-", element:"-", item:"-"} }, c: "var(--accent-gold)" },
              { id: "early", t: "珥덈뀈: ~20?", d: { content: llmResult.early, summary: llmResult.early_summary, keyword: llmResult.early_keyword, gaewun: llmResult.gaewun?.early || {color:"-", direction:"-", element:"-", item:"-"} }, c: "#81b29a" },
              { id: "youth", t: "泥?뀈: 30?", d: { content: llmResult.youth, summary: llmResult.youth_summary, keyword: llmResult.youth_keyword, gaewun: llmResult.gaewun?.youth || {color:"-", direction:"-", element:"-", item:"-"} }, c: "#e07a5f" },
              { id: "middle", t: "以묐뀈: 40?", d: { content: llmResult.middle, summary: llmResult.middle_summary, keyword: llmResult.middle_keyword, gaewun: llmResult.gaewun?.middle || {color:"-", direction:"-", element:"-", item:"-"} }, c: "#C9A050" },
              { id: "mature", t: "?λ뀈: 50~60?", d: { content: llmResult.mature, summary: llmResult.mature_summary, keyword: llmResult.mature_keyword, gaewun: llmResult.gaewun?.mature || {color:"-", direction:"-", element:"-", item:"-"} }, c: "#D4A373" },
              { id: "late", t: "留먮뀈: 60? ?댄썑", d: { content: llmResult.late, summary: llmResult.late_summary, keyword: llmResult.late_keyword, gaewun: llmResult.gaewun?.late || {color:"-", direction:"-", element:"-", item:"-"} }, c: "#3d5a80" }
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

    } catch (e: any) {
        console.error(e);
        alert(e.message || "?ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.");
        setIsLoading(false);
    }
  };
  const renderHighlightedText = (text: string) => {
    if (!text || typeof text !== 'string') return text;
    const ELEMENT_COLORS: Record<string, string> = {
      '紐???': '#81b29a', '????': '#e07a5f', '????': '#D4A373', '湲???': '#FFD700', '??麗?': '#3d5a80'
    };
    return text.split('\n\n').map((para, i) => {
      const isHeader = /^[\d\s]*[?뱧?뱟?뵇?뮕?렞?룇?뭿??/.test(para.trim());
      const cleanPara = para.replace(/\*\*(.*?)\*\*/g, '$1').replace(/<b>(.*?)<\/b>/g, '$1');
      const parts = cleanPara.split(/(紐?(??)|??(??)|??(??)|湲?(??)|??(麗?))/g);
      return (
        <div key={i} style={{ 
          marginBottom: isHeader ? "24px" : "16px", 
          marginTop: isHeader && i > 0 ? "32px" : "0",
          lineHeight: "1.9", fontSize: isHeader ? "1.2rem" : "1.05rem", fontWeight: isHeader ? "600" : "400",
          color: isHeader ? "var(--accent-indigo)" : "var(--text-secondary)", background: isHeader ? "transparent" : "rgba(255, 255, 255, 0.4)",
          padding: isHeader ? "0" : "16px 20px", borderRadius: "16px", border: isHeader ? "none" : "1px solid rgba(42, 54, 95, 0.05)", wordBreak: "keep-all"
        }}>
          {parts.map((part, j) => ELEMENT_COLORS[part] ? <strong key={j} style={{ color: ELEMENT_COLORS[part], fontWeight: "800" }}>{part}</strong> : part)}
        </div>
      );
    });
  };

  const renderInlineHighlights = (text: string) => {
    if (!text || typeof text !== 'string') return text;
    const ELEMENT_COLORS: Record<string, string> = {
      '紐???': '#81b29a', '????': '#e07a5f', '????': '#D4A373', '湲???': '#FFD700', '??麗?': '#3d5a80'
    };
    const parts = text.replace(/\*\*/g, '').split(/(紐?(??)|??(??)|??(??)|湲?(??)|??(麗?))/g);
    return parts.map((part, j) => ELEMENT_COLORS[part] ? <strong key={j} style={{ color: ELEMENT_COLORS[part], fontWeight: "800" }}>{part}</strong> : part);
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
      .replace(/\(\s*\)/g, '')         // 鍮?愿꾪샇 ?쒓굅
      .replace(/\b(Metal|Wood|Water|Fire|Earth)\b/g, (match) => {
        const elementMap: Record<string, string> = { 'Metal': '湲???', 'Wood': '紐???', 'Water': '??麗?', 'Fire': '????', 'Earth': '????' };
        return elementMap[match] || match;
      })
      .replace(/(紐?????湲???媛???蹂???臾?湲?寃?????怨???異???臾?吏?????誘?????????((?:\s*[\(竊??\s*[?①겓?잓뇫麗당뵴阿쇾툢訝곫닁藥긷틲渦쎾，?멨춴訝묈칲??쒼藥녑뜄?ょ뵵?됪닃雅?\s*[\)竊?]]?)+)?/g, (match, kr, extras) => {
        const elements = ['紐?, '??, '??, '湲?, '??];
        const map: Record<string, string> = { '紐?: '??, '??: '??, '??: '??, '湲?: '??, '??: '麗? };
        if (!extras) return match;
        return elements.includes(kr) ? `${kr}(${map[kr] || ''})` : kr;
      });
  };

  const CopyButton = ({ bazi, reading }: { bazi: any, reading: any }) => {
    const [copied, setCopied] = useState(false);
    
    const handleCopy = () => {
      let text = `[?꾪넻 ?ъ＜ ???由ы룷??\n\n`;
      text += `???ъ＜ 紐낆떇\n- ?꾩＜: ${bazi.year}\n- ?붿＜: ${bazi.month}\n- ?쇱＜: ${bazi.day}\n- ?쒖＜: ${bazi.time}\n\n`;
      
      reading.sections.forEach((sec: any) => {
        text += `??${sec.t}\n`;
        text += `"${sec.d.summary}"\n\n`;
        text += `${sec.d.content}\n\n`;
      });
      
      text += `??????ㅻ챸\n${reading.daeun}\n\n`;
      text += `??二쇱슂 ?좎궡\n${reading.sinsal}\n\n`;
      text += `蹂?由ы룷?몃뒗 2026??蹂묒삤?꾩쓣 湲곗??쇰줈 ?묒꽦?섏뿀?듬땲??`;

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
        {copied ? "蹂듭궗 ?꾨즺!" : "?꾩껜 寃곌낵 蹂듭궗?섍린"}
      </button>
    );
  };

  const RollingNumber = ({ value }: { value: number }) => <>{value}</>;

  return (
    <main ref={topRef} style={{ width: "100%", minHeight: "100vh", position: "relative", background: "var(--bg-primary)" }}>
      <Disclaimer />
      <TraditionalBackground />
      <WheelDatePicker isOpen={isDatePickerOpen} onClose={() => setIsDatePickerOpen(false)} initialDate={date} onConfirm={(y, m, d, lunar) => { setDate(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`); setIsLunar(lunar); }} />
      
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
            <div onClick={handleDevReset} style={{ display: "inline-block", cursor: "pointer", userSelect: "none" }}>
              <h1 style={{ fontSize: "1.05rem", fontWeight: "700", marginBottom: "4px", letterSpacing: "0", color: "var(--accent-indigo)" }}>泥?븘留ㅻ떦 ?ъ＜</h1>
            </div>
            <div style={{ width: "24px", height: "1px", background: "var(--accent-gold)", margin: "8px auto 8px" }}></div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: "1.4", fontFamily: "'Nanum Myeongjo', serif" }}>?꾪넻??吏?쒕줈 ?대챸??鍮꾩땅?덈떎.</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <section style={{ padding: "0 8px" }}>
              <h2 style={{ fontSize: "0.9rem", marginBottom: "16px", borderBottom: "1px solid var(--glass-border)", paddingBottom: "10px", display: "flex", alignItems: "center", gap: "8px", fontWeight: "500" }}>
                <CalendarDays className="w-4 h-4" /> ?뺣낫 ?낅젰
              </h2>
              <div style={{ display: "grid", gap: "12px" }}>
                <div onClick={() => setIsDatePickerOpen(true)} className="glass-input" style={{ cursor: "pointer", padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.8)", fontSize: "0.9rem" }}>{date}</div>
                
                <div style={{ display: "flex", gap: "8px" }}>
                  <input type="time" className="glass-input" value={time} onChange={(e) => setTime(e.target.value)} style={{ flex: 1, padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.8)", fontSize: "0.9rem" }} />
                  <div style={{ display: "flex", background: "rgba(0,0,0,0.05)", borderRadius: "10px", padding: "3px" }}>
                    <button onClick={() => setIsLunar(false)} style={{ padding: "5px 10px", borderRadius: "7px", border: "none", background: !isLunar ? "white" : "transparent", fontSize: "0.8rem" }}>?묐젰</button>
                    <button onClick={() => setIsLunar(true)} style={{ padding: "5px 10px", borderRadius: "7px", border: "none", background: isLunar ? "white" : "transparent", fontSize: "0.8rem" }}>?뚮젰</button>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <select className="glass-input" value={birthCity} onChange={(e) => setBirthCity(e.target.value)} style={{ flex: 1, padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.8)", fontSize: "0.9rem" }}>
                      {Object.keys(cityDataMap).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div style={{ display: "flex", background: "rgba(0,0,0,0.05)", borderRadius: "10px", padding: "3px" }}>
                      <button onClick={() => setGender("M")} style={{ padding: "5px 10px", borderRadius: "7px", border: "none", background: gender === "M" ? "white" : "transparent", fontSize: "0.8rem" }}>??/button>
                      <button onClick={() => setGender("F")} style={{ padding: "5px 10px", borderRadius: "7px", border: "none", background: gender === "F" ? "white" : "transparent", fontSize: "0.8rem" }}>??/button>
                    </div>
                  </div>
                  <p style={{ fontSize: "0.62rem", color: "var(--text-secondary)", opacity: 0.8, paddingLeft: "4px", margin: 0, letterSpacing: "-0.02em" }}>
                    * ?쒖뼱??吏??뿉 ?곕Ⅸ 誘몄꽭???쒓컙 李⑥씠瑜?諛섏쁺?섏뿬 ???뺥솗?섍쾶 ??댄빀?덈떎.
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
                {isLoading ? "湲곗슫???댄뵾??以?.." : "?댁꽭 遺꾩꽍 ?쒖옉?섍린"}
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
                        <p style={{ color: "var(--accent-indigo)", fontWeight: "700", fontSize: "1.1rem", marginBottom: "16px", letterSpacing: "0.1em" }}>湲곗슫???먮쫫???댄뵾??以묒엯?덈떎</p>
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
                        {[ {l:"?쒖＜", v:bazi.time}, {l:"?쇱＜", v:bazi.day}, {l:"?붿＜", v:bazi.month}, {l:"?꾩＜", v:bazi.year} ].map((p, i) => (
                          <div key={i} style={{ background: "rgba(255,255,255,0.8)", padding: "16px 4px", borderRadius: "16px", textAlign: "center", border: "1px solid var(--glass-border)", boxShadow: "0 8px 20px rgba(26, 28, 44, 0.04)" }}>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "6px", fontWeight: "500" }}>{p.l}</div>
                            <div style={{ fontSize: "1.3rem", fontWeight: "700", color: "var(--accent-indigo)" }}>{p.v}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ padding: "32px 24px", background: "white", borderRadius: "24px", border: "1px solid var(--glass-border)", boxShadow: "0 15px 40px rgba(26, 28, 44, 0.05)" }}>
                        <h3 style={{ textAlign: "center", marginBottom: "32px", fontSize: "1.1rem", fontWeight: "600", color: "var(--accent-indigo)" }}>湲곗슫??議고솕</h3>
                        <FiveElementsDonut elements={reading.elements} />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                          <AnimatedGauge label="?ы쉶???꾩긽" value={reading.life_balance.career} color="var(--accent-gold)" icon={<Briefcase size={20} />} />
                          <AnimatedGauge label="?앸챸??媛뺣룄" value={reading.life_balance.health} color="#81b29a" icon={<Activity size={20} />} />
                          <AnimatedGauge label="?щЪ蹂??섏?" value={reading.life_balance.wealth} color="#FFD700" icon={<Coins size={20} />} />
                          <AnimatedGauge label="?좎젙??吏?? value={reading.life_balance.love} color="#e07a5f" icon={<Heart size={20} />} />
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
                                  <Sparkles size={16} /> ???쒓린??媛쒖슫踰?                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                  <div style={{ background: "white", padding: "12px", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
                                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "4px" }}>異붿쿇 ?됱긽</div>
                                    <div style={{ fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: "600" }}>{renderInlineHighlights(sec.d.gaewun.color)}</div>
                                  </div>
                                  <div style={{ background: "white", padding: "12px", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
                                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "4px" }}>異붿쿇 諛⑺뼢</div>
                                    <div style={{ fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: "600" }}>{renderInlineHighlights(sec.d.gaewun.direction)}</div>
                                  </div>
                                  <div style={{ background: "white", padding: "12px", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
                                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "4px" }}>異붿쿇 ?ㅽ뻾</div>
                                    <div style={{ fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: "600" }}>{renderInlineHighlights(sec.d.gaewun.element)}</div>
                                  </div>
                                  <div style={{ background: "white", padding: "12px", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
                                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "4px" }}>異붿쿇 臾쇨굔</div>
                                    <div style={{ fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: "600" }}>{renderInlineHighlights(sec.d.gaewun.item)}</div>
                                  </div>
                                </div>
                              </div>
                            )}
                            </motion.div>
                        ))}
                      </div>


                      <CopyButton bazi={bazi} reading={reading} />

                      <div style={{ display: "flex", flexDirection: "column", gap: "32px", marginTop: "16px" }}>
                        <div style={{ padding: "24px", background: "rgba(201, 160, 80, 0.05)", borderRadius: "20px", border: "1px solid rgba(201, 160, 80, 0.1)" }}>
                          <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "16px", color: "var(--accent-gold)", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Star size={18} /> ??닿낵 ?좎궡???먮쫫
                          </h3>
                          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div style={{ background: "white", padding: "16px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                              <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>?꾩옱??????먮쫫</div>
                              <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.7" }}>{renderHighlightedText(reading.daeun)}</div>
                            </div>
                            <div style={{ background: "white", padding: "16px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                              <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>?ъ＜???뱀닔 ?좎궡</div>
                              <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.7" }}>{renderHighlightedText(reading.sinsal)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    {/* ?섎떒 ?ㅻ줈媛湲?踰꾪듉 異붽? */}
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
                        <ArrowUp size={20} /> 留??꾨줈
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
                          <ArrowLeft size={20} /> ?덉쑝濡?                        </motion.button>
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

