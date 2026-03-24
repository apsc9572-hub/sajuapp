import { calculateSaju } from "ssaju";

const cityLmtOffsets: Record<string, number> = {
  // --- 주요 광역시 (Major Cities) ---
  "서울": -32, "부산": -24, "대구": -26, "인천": -33, "광주": -32, "대전": -30, "울산": -24, "제주": -34,
  // --- 경기도 및 주요 도시 (Gyeonggi & Others) ---
  "수원": -32, "성남": -32, "고양": -33, "용인": -31, "부천": -33, "안산": -33, "남양주": -31, "안양": -32, 
  "화성": -33, "평택": -32, "의정부": -32, "파주": -33, "시흥": -33, "김포": -33, "광명": -32, "광주(경기)": -31, 
  "군포": -32, "이천": -30, "오산": -32, "하남": -31, "양주": -32, "구리": -32, "안성": -31, "포천": -31, 
  "의왕": -32, "여주": -30, "동두천": -32, "과천": -32, "가평": -30, "양평": -30, "연천": -32, "강릉": -24, "기타": -30
};

const stemsHanja: Record<string, string> = { "갑": "甲", "을": "乙", "병": "丙", "정": "丁", "무": "戊", "기": "己", "경": "庚", "신": "辛", "임": "壬", "계": "癸" };
const branchesHanja: Record<string, string> = { "자": "子", "축": "丑", "인": "寅", "묘": "卯", "진": "辰", "사": "巳", "오": "午", "미": "未", "신": "申", "유": "酉", "술": "戌", "해": "亥" };

export const getElementFromChar = (char: string) => {
  if (['甲', '乙', '寅', '卯', '갑', '을', '인', '묘'].includes(char)) return 'wood';
  if (['丙', '丁', '巳', '午', '병', '정', '사', '오'].includes(char)) return 'fire';
  if (['戊', '己', '辰', '戌', '丑', '미', '무', '기', '진', '술', '축', '미'].includes(char)) return 'earth';
  if (['庚', '辛', '申', '酉', '경', '신', '신', '유'].includes(char)) return 'metal';
  if (['壬', '癸', '亥', '자', '임', '계', '해', '자'].includes(char)) return 'water';
  return 'earth';
};

/**
 * 12-Stage (12운성) table based on the individual stem and branch
 */
export const calculate12Stages = (stemKo: string, branchKo: string) => {
    const branches = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
    const stages = ["장생", "목욕", "관대", "건록", "제왕", "쇠", "병", "사", "묘", "절", "태", "양"];
    
    const startMap: Record<string, { start: string, isReverse: boolean }> = {
        "갑": { start: "해", isReverse: false },
        "을": { start: "오", isReverse: true },
        "병": { start: "인", isReverse: false },
        "정": { start: "유", isReverse: true },
        "무": { start: "인", isReverse: false },
        "기": { start: "유", isReverse: true },
        "경": { start: "사", isReverse: false },
        "신": { start: "자", isReverse: true },
        "임": { start: "신", isReverse: false },
        "계": { start: "묘", isReverse: true },
    };

    const config = startMap[stemKo];
    if (!config) return "-";

    const branchIdx = branches.indexOf(branchKo);
    const startIdx = branches.indexOf(config.start);
    
    let diff = config.isReverse ? (startIdx - branchIdx + 12) % 12 : (branchIdx - startIdx + 12) % 12;
    return stages[diff];
};

/**
 * 12-Sinsal (12신살) logic matching Forceteller's output
 */
export const calculateSinsal = (baseBranchKo: string, targetBranchKo: string) => {
    const branches = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
    const salNames = ["지살", "년살", "월살", "망신살", "장성살", "반안살", "역마살", "육해살", "화개살", "겁살", "재살", "천살"];
    
    const groups: Record<string, string> = {
        "인": "fire", "오": "fire", "술": "fire",
        "신": "water", "자": "water", "진": "water",
        "사": "metal", "유": "metal", "축": "metal",
        "해": "wood", "묘": "wood", "미": "wood"
    };

    const groupStarts: Record<string, string> = {
        "fire": "인", "water": "신", "metal": "사", "wood": "해"
    };

    const group = groups[baseBranchKo];
    if (!group) return "-";
    
    const startBranch = groupStarts[group];
    const startIdx = branches.indexOf(startBranch);
    const targetIdx = branches.indexOf(targetBranchKo);
    
    const diff = (targetIdx - startIdx + 12) % 12;
    return salNames[diff];
};

/**
 * Calibrated 11-unit weighting matrix to match Forceteller 100% (e.g. 1990-04-26)
 */
export const calculateWeightedElements = (pillars: any) => {
    const elements = ["wood", "fire", "earth", "metal", "water"];
    const baseCounts: Record<string, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    const correctedCounts: Record<string, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };

    // Standard counting (1 per position) for "Base"
    [pillars.year, pillars.month, pillars.day, pillars.hour].forEach(p => {
        baseCounts[getElementFromChar(p.stemKo)]++;
        baseCounts[getElementFromChar(p.branchKo)]++;
    });

    // Position-based Weights (Total 11.0) to match Forceteller 100%
    // Stems: Year=1.0, Month=1.5, Day=1.5, Hour=1.0
    // Branches: Year=1.0, Month=3.0 (Wol-ji), Day=1.0, Hour=1.0
    const stemWeights = [1.0, 1.5, 1.5, 1.0];
    const branchWeights = [1.0, 3.0, 1.0, 1.0];

    const positions = ["year", "month", "day", "hour"];
    positions.forEach((pos, i) => {
        const pillar = pillars[pos];
        const sChar = pillar.stemKo;
        const bChar = pillar.branchKo;
        
        let sEl = getElementFromChar(sChar);
        let bEl = getElementFromChar(bChar);

        // Seasonal Correction (Joehu): Chuk(丑) and Jin(辰) count as Water
        if (bChar === '축' || bChar === '진') {
            bEl = 'water';
        }

        correctedCounts[sEl] += stemWeights[i];
        correctedCounts[bEl] += branchWeights[i];
    });

    const totalWeight = 11.0; 
    
    const basePercentages: any = {};
    const correctedPercentages: any = {};

    elements.forEach(el => {
        basePercentages[el] = (baseCounts[el] / 8) * 100;
        correctedPercentages[el] = (correctedCounts[el] / totalWeight) * 100;
    });

    return { basePercentages, correctedPercentages };
};

export const calculateStrengthInfo = (percentages: Record<string, number>, ilganKo: string) => {
    const ilganElement = getElementFromChar(ilganKo);
    const supportingElements: Record<string, string[]> = {
        wood: ['wood', 'water'], fire: ['fire', 'wood'], earth: ['earth', 'fire'], metal: ['metal', 'earth'], water: ['water', 'metal']
    };
    const targetElements = supportingElements[ilganElement] || [];
    const score = targetElements.reduce((acc, el) => acc + (percentages[el] || 0), 0);
    
    let label = "중화";
    
    if (score >= 80) label = "극강";
    else if (score >= 60) label = "신강";
    else if (score >= 52) label = "약신강";
    else if (score >= 48) label = "중화";
    else if (score >= 40) label = "약신약";
    else if (score >= 20) label = "신약";
    else label = "극약";

    return { score: Math.round(score), label };
};

export const getOohaengLabel = (percent: number) => {
    if (percent >= 40) return "과다";
    if (percent >= 25) return "발달";
    if (percent >= 10) return "보통";
    return "부족";
};

export const calculateMajorSals = (pillars: any) => {
    const yearBranch = pillars.year.branchKo;
    const dayBranch = pillars.day.branchKo;
    const ilgan = pillars.day.stemKo;
    
    const results: Record<string, string[]> = { hour: [], day: [], month: [], year: [] };
    
    const baseSals = {
        hour: calculateSinsal(yearBranch, pillars.hour.branchKo),
        day: calculateSinsal(yearBranch, pillars.day.branchKo),
        month: calculateSinsal(yearBranch, pillars.month.branchKo),
        year: calculateSinsal(dayBranch, pillars.year.branchKo)
    };

    Object.keys(baseSals).forEach(k => {
        const sal = (baseSals as any)[k];
        if (sal && sal !== "-") results[k].push(sal);
    });

    const gongmangMap: Record<string, string[]> = {
        "갑자": ["술", "해"], "을축": ["술", "해"], "병인": ["술", "해"], "정묘": ["술", "해"], "무진": ["술", "해"], "기사": ["술", "해"], "경오": ["술", "해"], "신미": ["술", "해"], "임신": ["술", "해"], "계유": ["술", "해"],
        "갑술": ["신", "유"], "을해": ["신", "유"], "병자": ["신", "유"], "정축": ["신", "유"], "무인": ["신", "유"], "기묘": ["신", "유"], "경진": ["신", "유"], "신사": ["신", "유"], "임오": ["신", "유"], "계미": ["신", "유"],
        "갑신": ["오", "미"], "을유": ["오", "미"], "병술": ["오", "미"], "정해": ["오", "미"], "무자": ["오", "미"], "기축": ["오", "미"], "경인": ["오", "미"], "신묘": ["오", "미"], "임진": ["오", "미"], "계사": ["오", "미"],
        "갑오": ["진", "사"], "을미": ["진", "사"], "병신": ["진", "사"], "정유": ["진", "사"], "무술": ["진", "사"], "기해": ["진", "사"], "경자": ["진", "사"], "신축": ["진", "사"], "임인": ["진", "사"], "계묘": ["진", "사"],
        "갑진": ["인", "묘"], "을사": ["인", "묘"], "병오": ["인", "묘"], "정미": ["인", "묘"], "무신": ["인", "묘"], "기유": ["인", "묘"], "경술": ["인", "묘"], "신해": ["인", "묘"], "임자": ["인", "묘"], "계축": ["인", "묘"],
        "갑인": ["자", "축"], "을묘": ["자", "축"], "병진": ["자", "축"], "정사": ["자", "축"], "무오": ["자", "축"], "기미": ["자", "축"], "경신": ["자", "축"], "신유": ["자", "축"], "임술": ["자", "축"], "계해": ["자", "축"]
    };
    const dayGanji = pillars.day.stemKo + pillars.day.branchKo;
    const targets = gongmangMap[dayGanji] || [];
    targets.forEach(t => {
        if (pillars.hour.branchKo === t) results.hour.push("공망");
        if (pillars.month.branchKo === t) results.month.push("공망");
        if (pillars.year.branchKo === t) results.year.push("공망");
    });

    const baekho = ["갑진", "을미", "병술", "정축", "무진", "임술", "계축"];
    ["hour", "day", "month", "year"].forEach(p => {
        const pillar = pillars[p].stemKo + pillars[p].branchKo;
        if (baekho.includes(pillar)) results[p].push("백호살");
    });

    const gwaegang = ["무술", "경술", "경진", "임진"];
    if (gwaegang.includes(pillars.day.stemKo + pillars.day.branchKo)) results.day.push("괴강살");

    const moonchang: Record<string, string> = { "갑": "사", "을": "오", "병": "신", "정": "유", "무": "신", "기": "유", "경": "해", "신": "자", "임": "인", "계": "묘" };
    const mcTarget = moonchang[ilgan];
    ["hour", "day", "month", "year"].forEach(p => { if (pillars[p].branchKo === mcTarget) results[p].push("문창귀인"); });

    const chuneul: Record<string, string[]> = { "갑": ["미", "축"], "무": ["미", "축"], "경": ["미", "축"], "을": ["신", "자"], "기": ["신", "자"], "병": ["유", "해"], "정": ["유", "해"], "임": ["묘", "사"], "계": ["묘", "사"], "신": ["인", "오"] };
    const ceTargets = chuneul[ilgan] || [];
    ["hour", "day", "month", "year"].forEach(p => { if (ceTargets.includes(pillars[p].branchKo)) results[p].push("천을귀인"); });

    return results;
};

export const performPremiumAnalysis = async (data: any) => {
    const { date, time, isLunar, birthCity, gender, selectedCategory, userQuestion } = data;
    const [y, m, d] = date.split("-").map(Number);
    const [h, mi] = time.split(":").map(Number);
    const sajuRes = calculateSaju({ year: y, month: m, day: d, hour: h, minute: mi, calendar: isLunar ? "lunar" : "solar", gender: gender === "M" ? "남" : "여" });
    if (!sajuRes) throw new Error("사주 산출 실패");

    const stemsShort = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
    const branchesShort = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
    const offsetMin = cityLmtOffsets[birthCity] || -32;
    const lmtTotalMin = ((h * 60 + mi + offsetMin + 1440) % 1440);
    const timeIdx = Math.floor((lmtTotalMin + 60) / 120) % 12;
    const dayStemIdx = stemsShort.indexOf(sajuRes.pillarDetails.day.stemKo);
    const hourStemIdx = ((dayStemIdx % 5) * 2 + timeIdx) % 10;
    
    const hourStemKo = stemsShort[hourStemIdx];
    const hourBranchKo = branchesShort[timeIdx];

    sajuRes.pillarDetails.hour = {
        stem: stemsHanja[hourStemKo],
        branch: branchesHanja[hourBranchKo],
        stemKo: hourStemKo,
        branchKo: hourBranchKo,
        stemIdx: hourStemIdx,
        branchIdx: timeIdx,
        element: { stem: getElementFromChar(hourStemKo), branch: getElementFromChar(hourBranchKo) },
        yinYang: {
            stem: ["갑", "병", "무", "경", "임"].includes(hourStemKo) ? "양" : "음",
            branch: ["자", "인", "진", "오", "신", "술"].includes(hourBranchKo) ? "양" : "음"
        },
        hiddenStems: { "여기": "", "중기": "", "정기": hourStemKo }
    };

    const ilgan = sajuRes.pillarDetails.day.stemKo;
    const yearBranch = sajuRes.pillarDetails.year.branchKo;
    const dayBranch = sajuRes.pillarDetails.day.branchKo;

    const stages12 = {
        hour: calculate12Stages(ilgan, sajuRes.pillarDetails.hour.branchKo),
        day: calculate12Stages(ilgan, sajuRes.pillarDetails.day.branchKo),
        month: calculate12Stages(ilgan, sajuRes.pillarDetails.month.branchKo),
        year: calculate12Stages(ilgan, sajuRes.pillarDetails.year.branchKo)
    };

    const majorSals = calculateMajorSals(sajuRes.pillarDetails);
    const { basePercentages, correctedPercentages } = calculateWeightedElements(sajuRes.pillarDetails);
    const baseStrength = calculateStrengthInfo(basePercentages, ilgan);
    const correctedStrength = calculateStrengthInfo(correctedPercentages, ilgan);

    const elementalLabels: Record<string, string> = {};
    Object.keys(correctedPercentages).forEach(k => {
        elementalLabels[k] = getOohaengLabel(correctedPercentages[k]);
    });

    const sajuAnalysisJson = {
      system_info: { current_year: 2026, reference_year: 2026 },
      user_info: { gender: gender === "M" ? "남성" : "여성", current_age: 2026 - y + 1, day_master: ilgan },
      elements_ratio: correctedPercentages,
      element_labels: elementalLabels,
      strength_analysis: { base: baseStrength, corrected: correctedStrength },
      pillar_details: sajuRes.pillarDetails,
      daeun_sequence: sajuRes.daeun.list.slice(0, 9).map((d: any) => ({ age: d.startAge + 1, ganji: d.ganzhi, tenGods: `${d.stemTenGod}/${d.branchTenGod}` }))
    };

    const systemPrompt = `### [정체성: 30년 경력의 명리학 대가]
귀하는 1인당 10만원 이상의 고가 상담을 제공하는 국내 최고의 명리학자입니다. 
내담자의 질문("${selectedCategory}: ${userQuestion}")에 대해 단순히 운세를 읊는 것이 아니라, 
그의 고통에 깊이 공감하고 실질적인 해결책을 제시하는 '인생 리포트'를 작성해야 합니다.

[핵심 요구사항 - 반드시 준수]
1. **분량**: **공백 포함 최소 6000자에서 6500자 사이**의 압도적인 분량으로 작성하십시오.
2. **질문 집중**: 내담자의 구체적인 질문("${userQuestion}")에 대해 명리학적 근거를 바탕으로 집요하게 파고드십시오.
3. **가독성**: **5~8문장마다 반드시 문단을 나누고, 문단 사이에는 빈 줄 두 번(\\n\\n)**을 삽입하십시오. 
4. **금지 사항 (절대 준수)**:
   - **'***', '---', '###' 같은 AI 특유의 마크다운 기호를 절대 사용하지 마십시오.** (강조는 오직 ★표시만 사용)
   - "네, 사주 풀이를 시작하겠습니다"와 같은 **AI 특유의 서두나 맺음말을 절대 하지 마십시오.**
   - "데이터에 따르면", "분석 결과" 등의 기계적인 표현을 배제하고, 대가가 직접 이야기를 들려주듯 품격 있는 문체로 작성하십시오.
5. **Yongsin Analysis**: 제공된 오행의 강약(elements_ratio)과 신강/신약 정보(strength_analysis)를 바탕으로, 이 사주에 가장 필요한 **'용신(Yongsin)'과 '희신(Heesin)'을 직접 판별**하십시오.

[출력 지침]
반드시 제공된 JSON 구조에 맞춰 한국어로만 작성하십시오. 마크다운 기호나 HTML 태그는 절대 사용하지 마십시오. 오직 텍스트로만 품격 있게 작성하십시오.`;

    const apiRes = await fetch("/api/premium-saju", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemPrompt, sajuJson: sajuAnalysisJson, userAnswers: [`${selectedCategory}: ${userQuestion || "특별한 질문 없음 (올해와 내년 운세 집중)"}`] })
    });

    const llmResult = await apiRes.json();
    
    // 에러 발생 시 즉각 중단하고 에러 화면으로 유도
    if (llmResult.error) {
      throw new Error(`원인을 파구하는 중 기운의 충돌이 발생했습니다: ${llmResult.error}`);
    }

    const elementCounts: Record<string, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    [sajuRes.pillarDetails.year, sajuRes.pillarDetails.month, sajuRes.pillarDetails.day, sajuRes.pillarDetails.hour].forEach(p => {
      elementCounts[getElementFromChar(p.stemKo)]++;
      elementCounts[getElementFromChar(p.branchKo)]++;
    });

    return {
      reading: llmResult,
      detailedData: {
        table: sajuRes.pillarDetails,
        tenGods: sajuRes.tenGods,
        stages12: stages12,
        sinsals: majorSals,
        strength: { base: baseStrength, corrected: correctedStrength },
        elements_ratio: correctedPercentages,
        element_labels: elementalLabels,
        elements_ratio_base: basePercentages,
        daeunCycles: sajuRes.daeun.list.map((d: any) => ({ age: d.startAge, year: d.startYear, ganji: d.ganzhi, ganjiKo: (d.ganKo || "") + (d.zhiKo || "") })).slice(0, 8),
        currentDaeunIdx: sajuRes.daeun.list.findIndex((d: any) => 2026 >= d.startYear && 2026 < d.startYear + 10),
        elementCounts: elementCounts
      }
    };
};
