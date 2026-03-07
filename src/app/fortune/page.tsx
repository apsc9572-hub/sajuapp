"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, CalendarDays, Sparkles, MoonStar, Scroll } from "lucide-react";
import { calculateSaju } from "ssaju";

export default function FortunePage() {
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

  const [isLoading, setIsLoading] = useState(false);
  const [loadingTextIdx, setLoadingTextIdx] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);

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
    setActiveTab(1); // 기본은 '현재' (오늘/이번달/올해)

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

        // 한자 → 한글 독음 변환 매핑
        const HANJA_TO_KR: Record<string, string> = {
          '甲':'갑','乙':'을','丙':'병','丁':'정','戊':'무','己':'기','庚':'경','辛':'신','壬':'임','癸':'계',
          '子':'자','丑':'축','寅':'인','卯':'묘','辰':'진','巳':'사','午':'오','未':'미','申':'신2','酉':'유','戌':'술','亥':'해'
        };
        const toKr = (s: string) => s.split('').map(c => HANJA_TO_KR[c] ?? c).join('');

        const yearKr  = toKr(sajuRes.pillarDetails.year.stem  + sajuRes.pillarDetails.year.branch);
        const monthKr = toKr(sajuRes.pillarDetails.month.stem + sajuRes.pillarDetails.month.branch);
        const dayKr   = toKr(sajuRes.pillarDetails.day.stem   + sajuRes.pillarDetails.day.branch);
        const timeKr  = toKr(sajuRes.pillarDetails.hour.stem  + sajuRes.pillarDetails.hour.branch);

        // 오행 카운팅
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

        const systemPrompt = "System: 당신은 통찰력 있고 다정한 명리학 에세이스트이자 심리 상담가입니다. 말투는 '~해요', '~군요', '~했나요?' 등 부드럽고 따뜻한 경어체를 사용하세요. " +
"내담자의 상황을 깊이 이해하고 위로하되, 다가올 시간의 길흉을 명확하면서도 다정하게 짚어주는 따뜻한 카리스마를 보여주세요.\n\n" +
"단, 미래를 100% 단언하거나 확정 짓는 어투('무조건 ~합니다', '절대 ~하지 마세요', '망합니다', '성공합니다')는 절대 사용하지 마세요. 대신 '~할 가능성이 높아요', '~하는 경향이 있어요', '~하기 쉬운 흐름이 들어와 있어요' 같은 유연하고 확률적인 언어(일기예보식 화법)를 사용하세요.\n\n" +
"절대 금지 사항 (Negative Prompt):\n" +
"1. 인사말이나 본인 소개 절대 금지.\n" +
"2. 마크다운 소제목(**)이나 기호 노출 절대 금지.\n" +
"3. 명리학 전문 용어(관성, 비견, 원진살 등) 그대로 출력 금지. 쉬운 심리적 언어로 번역하세요.\n\n" +
"User: 이 내담자는 일간이 " + dayMasterChar + "이며, " + strongStr + " " + weakStr + "\n" +
timeContext + "\n\n" +
"각 시점(과거, 현재, 미래)에 대해 다음 3단 스토리텔링 구조를 자연스러운 3개의 문단으로 구분하여 각각 400자 이내로 작성하세요 (기호 절대 금지):\n" +
"- [1문단 - 공감 및 상황 분석]: 해당 시점에 겪은/겪을 감정과 상황을 일기예보처럼 묘사.\n" +
"- [2문단 - 기운의 판도]: 길흉의 포인트를 확률적 언어로 명확히 짚기.\n" +
"- [3문단 - 구체적 처방]: 뻔한 말 금지. 당장 실천 가능한 다정한 행동 지침 제안.";

        const sajuAnalysisJson = {
             user_info: { gender, day_master: dayMasterChar },
             elements_counts: elementCounts,
             time_context: typeParam
        };

        const apiRes = await fetch("/api/saju", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                systemPrompt: systemPrompt, 
                sajuJson: sajuAnalysisJson,
                expectedKeys: ["past", "present", "future"] 
            })
        });

        if (!apiRes.ok) throw new Error("API 연동 오류");

        const llmResult = await apiRes.json();
        
        setBazi(sajuRes);
        setReading({
            past: llmResult.past || "데이터를 불러오지 못했습니다.",
            present: llmResult.present || "데이터를 불러오지 못했습니다.",
            future: llmResult.future || "데이터를 불러오지 못했습니다."
        });

    } catch (err) {
        console.error(err);
        alert("운세 연산 중 에러가 발생했습니다.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <main className="page-wrapper container">
      <Link href="/" style={{ textDecoration: "none" }}>
        <button className="btn-secondary" style={{ padding: "8px 16px", marginBottom: "40px" }}>
          <ArrowLeft className="w-5 h-5" /> 홈으로
        </button>
      </Link>

      <div className="text-center" style={{ marginBottom: "50px" }}>
        <h1 className="text-gradient" style={{ fontSize: "2.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
          {currentType.icon} {currentType.title}
        </h1>
        <p>{currentType.desc}</p>
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
          </div>
          
          <button 
            className="btn-primary" 
            style={{ width: "100%", marginTop: "24px", padding: "16px" }}
            onClick={calculateFortune}
            disabled={isLoading}
          >
            {isLoading && !bazi ? <Clock className="w-5 h-5 animate-spin" /> : <BookOpen className="w-5 h-5" />}
            {isLoading && !bazi ? "시간의 흐름에 따른 운기를 계산 중..." : `${currentType.title} 확인하기`}
          </button>
        </motion.div>

        {/* 결과 영역 */}
        <AnimatePresence>
          {(bazi || isLoading) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel"
              style={{ padding: "40px" }}
            >
              <h2 style={{ fontSize: "1.5rem", marginBottom: "30px", color: "var(--accent-gold)", textAlign: "center" }}>시운(時運) 흐름 지표</h2>
              
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
                  <div style={{ display: "flex", gap: "8px", marginBottom: "30px", padding: "4px", background: "rgba(0,0,0,0.2)", borderRadius: "12px" }}>
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
                    key={activeTab} // 탭 변경 시 애니메이션 리렌더링
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{
                      background: "rgba(0, 0, 0, 0.2)",
                      padding: "30px",
                      borderRadius: "16px",
                      border: "1px solid rgba(255,255,255,0.05)"
                    }}
                  >
                    <h3 style={{ color: "var(--accent-gold)", marginBottom: "20px", fontSize: "1.2rem", borderBottom: "1px solid rgba(226, 192, 115, 0.2)", paddingBottom: "10px" }}>
                       {currentType.tabs[activeTab]}의 기운석
                    </h3>
                    <div className="markdown-content" style={{ fontSize: "1.05rem", lineHeight: 1.8, color: "var(--text-primary)", whiteSpace: "pre-line" }}>
                      {activeTab === 0 ? reading.past : activeTab === 1 ? reading.present : reading.future}
                    </div>
                  </motion.div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
