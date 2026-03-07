"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, CalendarDays, Sparkles, MoonStar, Scroll } from "lucide-react";
import { calculateSaju } from "ssaju";
import TraditionalBackground from "@/components/TraditionalBackground";
import Disclaimer from "@/components/Disclaimer";

function FortuneContent() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type") || "daily";

  const typeConfig: Record<string, any> = {
    daily: {
      title: "오늘의 운세",
      desc: "어제, 오늘, 내일의 기운 흐름",
      icon: <Sparkles className="w-6 h-6" />,
      tabs: ["어제", "오늘", "내일"],
      keys: ["past", "present", "future"]
    },
    monthly: {
      title: "월간 운세",
      desc: "전월, 이번 달, 다음 달의 방향성",
      icon: <MoonStar className="w-6 h-6" />,
      tabs: ["지난 달", "이번 달", "다음 달"],
      keys: ["past", "present", "future"]
    },
    yearly: {
      title: "년간 운세",
      desc: "작년, 올해, 내년의 거시적 판도",
      icon: <Scroll className="w-6 h-6" />,
      tabs: ["작년", "올해", "내년"],
      keys: ["past", "present", "future"]
    }
  };

  const currentType = typeConfig[typeParam] || typeConfig["daily"];

  const [date, setDate] = useState("1995-05-15");
  const [time, setTime] = useState("14:30");
  const [isLunar, setIsLunar] = useState(false);
  const [gender, setGender] = useState("M");
  
  const [bazi, setBazi] = useState<any>(null);
  const [reading, setReading] = useState<any>("");
  const [activeTab, setActiveTab] = useState(1); // 0: past, 1: present, 2: future
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
      }, 1800);

      progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 98) return 99;
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
    setActiveTab(1); 

    setTimeout(() => {
      const resultElement = document.getElementById("result-section");
      if (resultElement) {
        resultElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);

    try {
        const [year, month, day] = date.split("-").map(Number);
        const [hour, min] = time.split(":").map(Number);

        if (!year || !month || !day) throw new Error("유효한 날짜가 아닙니다.");

        const sajuRes = calculateSaju({
          year,
          month,
          day,
          hour,
          minute: min,
          calendar: isLunar ? "lunar" : "solar"
        });

        if (!sajuRes) throw new Error("사주 산출에 실패했습니다.");

        // 캐시 키 생성 (날짜, 시간, 음양력, 성별, 운세타입)
        const cacheKey = `fortune_${date}_${time}_${isLunar}_${gender}_${typeParam}`;
        const cachedData = localStorage.getItem(cacheKey);
        
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          setBazi(sajuRes);
          setReading(parsed.reading);
          setIsLoading(false);
          return;
        }

        const HANJA_TO_KR: Record<string, string> = {
          '甲':'갑','乙':'을','丙':'병','丁':'정','戊':'무','己':'기','庚':'경','辛':'신','壬':'임','癸':'계',
          '子':'자','丑':'축','寅':'인','卯':'묘','辰':'진','巳':'사','午':'오','未':'미','申':'신2','酉':'유','戌':'술','亥':'해'
        };
        const toKr = (s: string) => s.split('').map(c => HANJA_TO_KR[c] ?? c).join('');

        const yearKr  = toKr(sajuRes.pillarDetails.year.stem  + sajuRes.pillarDetails.year.branch);
        const monthKr = toKr(sajuRes.pillarDetails.month.stem + sajuRes.pillarDetails.month.branch);
        const dayKr   = toKr(sajuRes.pillarDetails.day.stem   + sajuRes.pillarDetails.day.branch);
        const timeKr  = toKr(sajuRes.pillarDetails.hour.stem  + sajuRes.pillarDetails.hour.branch);

        const sajuMap: Record<string, string> = {
            '갑': '목', '을': '목', '병': '화', '정': '화', '무': '토', '기': '토', '경': '금', '신': '금', '임': '수', '계': '수',
            '자': '수', '축': '토', '인': '목', '묘': '목', '진': '토', '사': '화', '오': '화', '미': '토', '신2': '금', '유': '금', '술': '토', '해': '수'
        };

        const allChars = [yearKr, monthKr, dayKr, timeKr].flatMap(gz => gz.split(''));
        const elementCounts: Record<string, number> = { '목': 0, '화': 0, '토': 0, '금': 0, '수': 0 };
        allChars.forEach(char => {
            const elem = sajuMap[char];
            if (elem) elementCounts[elem]++;
        });

        const sortedByRatio = Object.entries(elementCounts).sort(([,a],[,b]) => b - a);
        const strongestElem = sortedByRatio[0]?.[0] || '토'; 
        const weakestElem = sortedByRatio[sortedByRatio.length-1]?.[0] || '수';

        // 앵커 키워드 추출
        const anchorKeywords = [
          `#${dayKr[0]}일간`,
          `#${strongestElem}기운강함`,
          `#${timeKr}시`,
        ];

        // 경계 시간(Cusp) 체크 (시가 바뀌는 23, 01, 03... 의 30분 전후 5분)
        let cuspScript = "";
        const sajuHours = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23];
        if (sajuHours.includes(hour) && min >= 30 && min <= 35) {
          const currentHourBranch = toKr(sajuRes.pillarDetails.hour.branch);
          // 이전 시지(Branch) 이름 유추 (단순화: 자축인묘... 순서에서 하나 앞)
          const branches = ['자','축','인','묘','진','사','오','미','신2','유','술','해'];
          const idx = branches.indexOf(currentHourBranch);
          const prevIdx = (idx - 1 + 12) % 12;
          const prevHourBranch = branches[prevIdx];
          
          cuspScript = `당신은 ${prevHourBranch}(${prevHourBranch === '신2' ? '申' : ''})시의 묵직함과 ${currentHourBranch}시의 화려함이 교차하는 ${hour}시 ${min}분에 태어났습니다. 정밀 보정상 '${currentHourBranch}시'의 기운이 중심이지만, 이전 시간의 신중함 또한 내면에 깊이 뿌리박혀 있는 독특한 명식입니다.`;
        }

        const elemTraits: Record<string, string> = { 
            "목": "성장 욕구가 강하고 뻗어나가려는 성향이", 
            "화": "열정적이고 확산되는 에너지가", 
            "토": "책임감이 무겁고 포용력이", 
            "금": "결단력과 원칙 중심의 성향이", 
            "수": "지혜롭지만 때로는 생각에 잠기는 성향이" 
        };
        const weakTraits: Record<string, string> = {
            "목": "시작하는 힘이나 의욕이 부족할 수",
            "화": "표현력이나 열정이 부족할 수",
            "토": "안정감이나 끈기가 부족할 수",
            "금": "결단력이나 맺고 끊음이 약할 수",
            "수": "유연성이나 융통성이 부족할 수"
        };

        const strongStr = strongestElem + " 기운이 강해 " + (elemTraits[strongestElem] || "주도적인 성향이") + " 강하고,";
        const weakStr = weakestElem + " 기운이 상대적으로 약해 " + (weakTraits[weakestElem] || "마무리가 아쉬울 수") + " 있습니다.";

        let timeContext = "";
        if (typeParam === "daily") {
            timeContext = "이 내담자의 '어제', '오늘', '내일'의 일일 운세 흐름을 분석해 주세요.";
        } else if (typeParam === "monthly") {
            timeContext = "이 내담자의 '지난 달', '이번 달', '다음 달'의 월간 운세 흐름을 분석해 주세요.";
        } else {
            timeContext = "이 내담자의 '작년', '올해', '내년'의 연간 운세 판도와 장기적 흐름을 분석해 주세요.";
        }

        const dayMasterChar = dayKr[0] || '알수없음';

        const systemPrompt = `System: 당신은 20년 경력의 차분하고 통찰력 있는 '하이엔드 명리 상담가'이자 인문학 칼럼니스트입니다.
말투는 다정하지만 뼈가 있는 조언을 건네는 담백한 산문(에세이) 톤으로 작성하세요 ('~합니다', '~군요', '~할 수 있습니다'). 
내담자의 상황을 깊이 이해하고 위로하되, 다가올 시간의 길흉을 명확하면서도 다정하게 짚어주는 카리스마를 보여주세요.

단, 미래를 100% 단언하거나 확정 짓는 어투('무조건 ~합니다', '절대 ~하지 마세요', '망합니다', '성공합니다')는 피하세요. 대신 '~할 가능성이 높습니다', '~하는 경향이 있습니다', '~하기 쉬운 흐름이 들어와 있습니다' 같은 유연하고 깊이 있는 언어를 사용하세요.

반드시 포함해야 할 핵심 키워드: ${anchorKeywords.join(", ")}
${cuspScript ? `경계 시간 안내: ${cuspScript}` : ""}

절대 금지 사항 (Negative Prompt):
1. "계일간 님", "사용자님" 같은 기계적인 호칭 불가. 문맥상 자연스럽게 "당신은~" 식으로 주어를 풀어서 작성할 것.
2. "오늘의 기운석", "우주의 기운", "마법 같은", "놀라운", "특별한", "명심하세요" 등 AI가 버릇처럼 쓰는 뻔하고 오글거리는 형용사나 작위적인 명칭 완벽하게 차단.
3. 인사말이나 본인 소개 절대 금지.
4. 명리학 전문 용어(갑목, 을미시, 상관, 편재, 비견, 원진살 등) 및 한자어 절대 금지. 쉬운 심리적 언어나 자연물로 은유하세요.

User: 이 내담자는 일간이 ${dayMasterChar}이며, ${strongStr} ${weakStr}
${timeContext}

각 시점(과거, 현재, 미래)에 대해 다음 3단 스토리텔링 구조를 자연스러운 3개의 문단으로 구분하여 각각 400자 이내로 작성하세요 (기호 절대 금지). 모바일 가독성을 위해 단락 사이는 항상 두 번의 줄바꿈(\\n\\n)으로 띄우고, 핵심 문장은 **볼드체**를 사용해 1~2회 강조하세요.
- [3문단 - 구체적 처방]: 뻔한 말 금지. 당장 실천 가능한 다정한 행동 지침 제안.

반드시 순수 JSON 객체만 출력하세요. 앞뒤에 어떠한 설명(Preamble), 마크다운 형태의 기호(\`\`\`json 등)도 붙이지 마세요. 오직 유효한 JSON 문자열만 반환해야 합니다.`;

        const sajuAnalysisJson = {
             user_info: { gender, day_master: dayMasterChar },
             elements_counts: elementCounts,
             time_context: typeParam,
             anchor_keywords: anchorKeywords,
             cusp_script: cuspScript
        };

        const payload = { 
            systemPrompt: systemPrompt, 
            sajuJson: sajuAnalysisJson,
            cityName: "서울", // Fortune page currently doesn't have city selection, defaulting to Seoul for safety
            expectedKeys: ["past", "present", "future"] 
        };
        console.log("Payload:", payload);

        const apiRes = await fetch("/api/saju", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!apiRes.ok) {
            const errorText = await apiRes.text();
            console.error("❌ [DEBUG] 서버 응답 에러 (Fortune):", apiRes.status, errorText);
            throw new Error(`API 연동 오류 (${apiRes.status})`);
        }

        const rawText = await apiRes.text();
        console.log("🔥 [DEBUG] AI 원본 응답 텍스트 (Fortune):", rawText);

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
          console.log("✅ [DEBUG] 파싱 성공 데이터 (Fortune):", llmResult);
        } catch (parseError) {
          console.error("❌ [DEBUG] JSON 파싱 실패 (Fortune):", parseError);
          throw new Error("AI 응답 데이터 형식이 올바르지 않습니다.");
        }

        if (!llmResult) {
          throw new Error("JSON 파싱은 성공했으나 데이터가 비어있습니다.");
        }
        
        const finalReading = {
            past: llmResult?.past || "데이터를 불러오지 못했습니다.",
            present: llmResult?.present || "데이터를 불러오지 못했습니다.",
            future: llmResult?.future || "데이터를 불러오지 못했습니다."
        };

        setBazi(sajuRes);
        setReading(finalReading);

        // 결과 캐시 저장
        localStorage.setItem(cacheKey, JSON.stringify({
          reading: finalReading,
          timestamp: Date.now()
        }));

    } catch (err: any) {
        console.error(err);
        if (err.message?.includes("429")) {
            alert("현재 접속자가 많아 우주의 기운을 읽어오는 데 시간이 걸리고 있습니다. 약 1분 뒤에 다시 시도해 주세요. 🌌");
        } else {
            alert("네트워크 연결이 불안정합니다. 잠시 후 다시 시도해 주세요.");
        }
    } finally {
        setIsLoading(false);
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
      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }} className="container py-8">
        <Link href="/" style={{ textDecoration: "none", display: "inline-block", marginBottom: "30px" }}>
          <button style={{ background: "transparent", border: "none", color: "var(--text-primary)", cursor: "pointer", display: "flex", alignItems: "center", padding: "8px" }}>
            <ArrowLeft className="w-7 h-7" strokeWidth={1.5} />
          </button>
        </Link>

      <div className="text-center" style={{ marginBottom: "50px" }}>
        <div>
          <h1 style={{ fontSize: "2.4rem", marginBottom: "8px", fontWeight: "300" }}>{currentType.title}</h1>
          <p style={{ color: "var(--text-secondary)", fontWeight: "400", fontSize: "1.05rem" }}>{currentType.desc}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "30px", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
        {/* 입력 폼 영역 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ width: "100%", padding: "0 16px" }}
        >
          <h2 style={{ fontSize: "1.2rem", marginBottom: "30px", display: "flex", alignItems: "center", gap: "8px", fontWeight: "400", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "16px" }}>
            <CalendarDays className="w-5 h-5" strokeWidth={1.5} /> 기운을 읽을 정보
          </h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.95rem", color: "var(--text-secondary)" }}>생년월일</label>
              <input type="date" className="glass-input" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: "12px", fontSize: "0.95rem", color: "var(--text-secondary)" }}>양/음력</label>
              <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: "30px", padding: "4px" }}>
                <button style={{ flex: 1, padding: "12px", borderRadius: "30px", border: "none", background: !isLunar ? "rgba(255,255,255,0.15)" : "transparent", color: !isLunar ? "white" : "var(--text-secondary)", fontWeight: !isLunar ? 600 : 400, transition: "all 0.3s" }} onClick={() => setIsLunar(false)}>양력</button>
                <button style={{ flex: 1, padding: "12px", borderRadius: "30px", border: "none", background: isLunar ? "rgba(255,255,255,0.15)" : "transparent", color: isLunar ? "white" : "var(--text-secondary)", fontWeight: isLunar ? 600 : 400, transition: "all 0.3s" }} onClick={() => setIsLunar(true)}>음력</button>
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.95rem", color: "var(--text-secondary)" }}>태어난 시간</label>
              <input type="time" className="glass-input" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "12px", fontSize: "0.95rem", color: "var(--text-secondary)" }}>성별</label>
              <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: "30px", padding: "4px" }}>
                <button style={{ flex: 1, padding: "12px", borderRadius: "30px", border: "none", background: gender === "M" ? "rgba(255,255,255,0.15)" : "transparent", color: gender === "M" ? "white" : "var(--text-secondary)", fontWeight: gender === "M" ? 600 : 400, transition: "all 0.3s" }} onClick={() => setGender("M")}>남성</button>
                <button style={{ flex: 1, padding: "12px", borderRadius: "30px", border: "none", background: gender === "F" ? "rgba(255,255,255,0.15)" : "transparent", color: gender === "F" ? "white" : "var(--text-secondary)", fontWeight: gender === "F" ? 600 : 400, transition: "all 0.3s" }} onClick={() => setGender("F")}>여성</button>
              </div>
            </div>
          </div>
          
          <button 
            className="btn-primary" 
            style={{ width: "100%", marginTop: "40px", padding: "18px", borderRadius: "30px", fontSize: "1.1rem" }}
            onClick={calculateFortune}
            disabled={isLoading}
          >
            {isLoading && !bazi ? <Clock className="w-5 h-5 animate-spin" /> : <BookOpen className="w-5 h-5" />}
            {isLoading && !bazi ? "기운의 흐름을 분석 중입니다..." : `${currentType.title} 흐름 분석하기`}
          </button>
        </motion.div>

        {/* 결과 영역 */}
        <AnimatePresence>
          {(bazi || isLoading) && (
            <motion.div 
              id="result-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ padding: "16px", width: "100%", maxWidth: "95%", margin: "24px auto 0 auto", wordBreak: "keep-all" }}
            >
              <h2 style={{ fontSize: "1.4rem", marginBottom: "30px", color: "var(--accent-gold)", textAlign: "center", fontWeight: "300" }}>시운(時運) 흐름 지표</h2>
              
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
                        border: "4px solid rgba(255, 255, 255, 0.1)", 
                        borderBottomColor: "#fff",
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
                      style={{ color: "var(--accent-gold)", fontSize: "1.2rem", fontWeight: 500, textAlign: "center" }}
                    >
                      {loadingTexts[loadingTextIdx]}
                    </motion.div>
                  </AnimatePresence>

                  <div style={{ width: "200px", height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", marginTop: "20px", overflow: "hidden" }}>
                    <motion.div 
                      animate={{ width: `${loadingProgress}%` }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      style={{ height: "100%", background: "var(--accent-gold)" }}
                    />
                  </div>
                </div>
              ) : bazi && reading && (
                <>
                  {/* 동적 탭 UI */}
                  <div style={{ display: "flex", gap: "8px", marginBottom: "30px", padding: "4px", background: "rgba(139, 94, 60, 0.05)", borderRadius: "12px", border: "1px solid rgba(139, 94, 60, 0.1)" }}>
                    {currentType.tabs.map((tabStr: string, index: number) => {
                       const isActive = activeTab === index;
                       return (
                           <button 
                             key={index}
                             onClick={() => setActiveTab(index)}
                             style={{
                                flex: 1,
                                padding: "12px",
                                borderRadius: "8px",
                                fontSize: "1rem",
                                fontWeight: isActive ? "bold" : "normal",
                                backgroundColor: isActive ? "rgba(226, 192, 115, 0.15)" : "transparent",
                                color: isActive ? "var(--accent-gold)" : "var(--text-secondary)",
                                border: `1px solid ${isActive ? "rgba(226, 192, 115, 0.3)" : "transparent"}`,
                                transition: "all 0.3s ease"
                             }}
                           >
                              {tabStr}
                           </button>
                       )
                    })}
                  </div>

                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{
                      background: "transparent",
                      padding: "20px 0",
                      borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                      whiteSpace: "pre-line"
                    }}
                  >
                    <h3 style={{ color: "var(--accent-gold)", marginBottom: "20px", fontSize: "1.2rem", borderBottom: "1px solid rgba(226, 192, 115, 0.2)", paddingBottom: "10px" }}>
                       {currentType.tabs[activeTab]}의 기운석
                    </h3>
                    <div className="markdown-content" style={{ fontSize: "1.05rem", lineHeight: 2.0, color: "var(--text-primary)", whiteSpace: "pre-line" }}>
                      {renderHighlightedText(activeTab === 0 ? reading.past : activeTab === 1 ? reading.present : reading.future)}
                    </div>
                  </motion.div>
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
    <Suspense fallback={<div className="p-4 text-center">우주의 기운을 불러오는 중입니다...</div>}>
      <FortuneContent />
    </Suspense>
  );
}
