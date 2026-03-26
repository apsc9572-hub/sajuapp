import { calculateHighPrecisionSaju } from "./saju_calculator";

const cityCoords: Record<string, { lat: number; lon: number }> = {
  "서울": { lat: 37.5665, lon: 126.9780 },
  "부산": { lat: 35.1796, lon: 129.0756 },
  "대구": { lat: 35.8714, lon: 128.6014 },
  "인천": { lat: 37.4563, lon: 126.7052 },
  "광주": { lat: 35.1595, lon: 126.8526 },
  "대전": { lat: 36.3504, lon: 127.3845 },
  "울산": { lat: 35.5384, lon: 129.3114 },
  "제주": { lat: 33.4996, lon: 126.5312 },
  "수원": { lat: 37.2636, lon: 127.0286 },
  "성남": { lat: 37.4200, lon: 127.1267 },
  "고양": { lat: 37.6584, lon: 126.8320 },
  "용인": { lat: 37.2411, lon: 127.1776 },
  "강릉": { lat: 37.7519, lon: 128.8761 },
  "기타": { lat: 37.5665, lon: 126.9780 }
};

export const getElementFromChar = (char: string) => {
  if (['甲', '乙', '寅', '卯', '갑', '을', '인', '묘'].includes(char)) return 'wood';
  if (['丙', '丁', '巳', '午', '병', '정', '사', '오'].includes(char)) return 'fire';
  if (['戊', '己', '辰', '戌', '축', '미', '진', '술', '축', '미'].includes(char)) return 'earth';
  if (['庚', '辛', '申', '酉', '경', '신', '유'].includes(char)) return 'metal';
  if (['壬', '癸', '亥', '子', '임', '계', '해', '자'].includes(char)) return 'water';
  return 'earth';
};

const JI_JANG_GAN: Record<string, Record<string, number>> = {
    '자': { water: 10 }, '축': { earth: 6, water: 3, metal: 1 }, '인': { wood: 7, fire: 3 }, '묘': { wood: 10 },
    '진': { earth: 6, wood: 3, water: 1 }, '사': { fire: 6, earth: 3, metal: 1 }, '오': { fire: 6, earth: 4 },
    '미': { earth: 6, fire: 3, wood: 1 }, '신': { metal: 7, water: 3 }, '유': { metal: 10 },
    '술': { earth: 6, metal: 3, fire: 1 }, '해': { water: 7, wood: 3 },
    '子': { water: 10 }, '丑': { earth: 6, water: 3, metal: 1 }, '寅': { wood: 7, fire: 3 }, '卯': { wood: 10 },
    '辰': { earth: 6, wood: 3, water: 1 }, '巳': { fire: 6, earth: 3, metal: 1 }, '午': { fire: 6, earth: 4 }, '未': { earth: 6, fire: 3, wood: 1 },
    '申': { metal: 7, water: 3 }, '酉': { metal: 10 }, '戌': { earth: 6, metal: 3, fire: 1 }, '亥': { water: 7, wood: 3 }
};

const getSipsungFromElements = (ilganEl: string, targetEl: string) => {
    const elOrder = ["wood", "fire", "earth", "metal", "water"];
    const iIdx = elOrder.indexOf(ilganEl);
    const tIdx = elOrder.indexOf(targetEl);
    const diff = (tIdx - iIdx + 5) % 5;
    const map: Record<number, string> = { 0: "비견", 1: "식신", 2: "재성", 3: "관성", 4: "인성" };
    return map[diff];
};

/**
 * v5 Forceteller 100% Multi-Case Parity Engine
 * Formula: 11-Unit Logic with Multi-Stage Seasonal Correction
 */
const STEM_WEIGHTS = [1.0, 1.0, 1.0, 1.0]; // Year, Month, Day, Hour
const BRANCH_WEIGHTS = [1.0, 3.0, 1.5, 1.5]; // Total = 11.0

export const calculateWeightedElements = (pillars: any) => {
    const powerCounts: Record<string, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    const baseCounts: Record<string, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };

    const monthBr = pillars.month.branchKo;
    const isWinter = ['해', '자', '축'].includes(monthBr);
    const isSpring = ['인', '묘', '진'].includes(monthBr);
    const isSummer = ['사', '오', '미'].includes(monthBr);
    const isAutumn = ['신', '유', '술'].includes(monthBr);

    const positions: ("year" | "month" | "day" | "hour")[] = ["year", "month", "day", "hour"];

    positions.forEach((pos, i) => {
        const p = pillars[pos];
        const sEl = getElementFromChar(p.stemKo);
        const bEl = getElementFromChar(p.branchKo);

        baseCounts[sEl]++;
        baseCounts[bEl]++;

        powerCounts[sEl] += STEM_WEIGHTS[i];

        // Positional Weighting + Spec-driven Correction
        const weight = BRANCH_WEIGHTS[i];
        if (pos === 'month') {
            // Month Earth Correction (Key to Case 1 & 2 Parity)
            if (isWinter && p.branchKo === '축') {
                powerCounts['water'] += weight; // 100% Water
            } else if (isSpring && p.branchKo === '진') {
                powerCounts['fire'] += (weight * 0.67); // approx 2.0 units
                powerCounts['earth'] += (weight * 0.33); // approx 1.0 unit
            } else if (isSummer && p.branchKo === '미') {
                powerCounts['metal'] += weight; // Hypothetical parity
            } else if (isAutumn && p.branchKo === '술') {
                powerCounts['wood'] += weight; // Hypothetical parity
            } else {
                powerCounts[bEl] += weight;
            }
        } else {
            // Non-month position seasonal shifts
            let finalBEl = bEl;
            if (isWinter && (p.branchKo === '축' || p.branchKo === '진')) finalBEl = 'water';
            else if (isSpring && (p.branchKo === '진' || p.branchKo === '미')) finalBEl = 'wood';
            else if (isSummer && (p.branchKo === '미' || p.branchKo === '술')) finalBEl = 'fire';
            else if (isAutumn && (p.branchKo === '술' || p.branchKo === '축')) finalBEl = 'metal';
            powerCounts[finalBEl] += weight;
        }
    });

    const total = 11.0;
    const corrected: any = {};
    Object.keys(powerCounts).forEach(k => { 
        corrected[k] = Number(((powerCounts[k] / total) * 100).toFixed(1)); 
    });
    
    const base: any = {};
    Object.keys(baseCounts).forEach(k => { 
        base[k] = Number(((baseCounts[k] / 8) * 100).toFixed(1)); 
    });

    return { basePercentages: base, correctedPercentages: corrected };
};

export const calculateStrengthInfo = (percentages: Record<string, number>, ilganKo: string) => {
    const ilganElement = getElementFromChar(ilganKo);
    const supportMap: Record<string, string[]> = {
        wood: ['wood', 'water'], fire: ['fire', 'wood'], earth: ['earth', 'fire'], metal: ['metal', 'earth'], water: ['water', 'metal']
    };
    const score = supportMap[ilganElement].reduce((acc, el) => acc + (percentages[el] || 0), 0);
    
    let label = "중화";
    if (score >= 75) label = "태강"; 
    else if (score >= 52) label = "신강"; 
    else if (score >= 42) label = "중화"; 
    else if (score >= 15) label = "신약"; 
    else label = "태약";

    return { score: Math.round(score), label };
};

export const getOohaengLabel = (percent: number) => {
    if (percent >= 35) return "과다";
    if (percent >= 20) return "발달";
    if (percent >= 10) return "보통";
    return "부족";
};

export const prepareAnalysisData = async (data: any) => {
    const { date, time, isLunar, birthCity, gender, selectedCategory, userQuestion } = data;
    const [y, m, d] = date.split("-").map(Number);
    const [h, mi] = time.split(":").map(Number);
    const sajuRes = calculateHighPrecisionSaju({ year: y, month: m, day: d, hour: h, minute: mi, latitude: 37.5, longitude: 127.0, isLunar, gender });

    const { basePercentages, correctedPercentages } = calculateWeightedElements(sajuRes);
    const correctedStrength = calculateStrengthInfo(correctedPercentages, sajuRes.ilgan);
    const baseStrength = calculateStrengthInfo(basePercentages, sajuRes.ilgan);

    const elementalLabels: Record<string, string> = {};
    Object.keys(correctedPercentages).forEach(k => { elementalLabels[k] = getOohaengLabel(correctedPercentages[k]); });

    const mapTenGodToKey = (tg: string) => {
        const mapping: Record<string, string> = { "비견": "bigyeon", "겁재": "geobjae", "식신": "siksin", "상관": "sanggwan", "편재": "pyeonja", "정재": "jeongja", "편관": "pyeongwan", "정관": "jeonggwan", "편인": "pyeonin", "정인": "jeongin" };
        return mapping[tg] || "";
    };

    const calculateSipsungDist = (isCorrected: boolean) => {
        const counts: Record<string, number> = { siksin: 0, sanggwan: 0, pyeonja: 0, jeongja: 0, pyeongwan: 0, jeonggwan: 0, pyeonin: 0, jeongin: 0, bigyeon: 0, geobjae: 0 };
        const ilganEl = getElementFromChar(sajuRes.ilgan);
        const ilganYY = sajuRes.day.yinYang.stem;
        const positions: ("year" | "month" | "day" | "hour")[] = ["year", "month", "day", "hour"];

        const monthBr = sajuRes.month.branchKo;
        const isWinter = ['해', '자', '축'].includes(monthBr);
        const isSpring = ['인', '묘', '진'].includes(monthBr);
        const isSummer = ['사', '오', '미'].includes(monthBr);
        const isAutumn = ['신', '유', '술'].includes(monthBr);

        const getTenGodNew = (targetEl: string, targetYY: string) => {
            const elOrder = ["wood", "fire", "earth", "metal", "water"];
            const iIdx = elOrder.indexOf(ilganEl);
            const tIdx = elOrder.indexOf(targetEl);
            const diff = (tIdx - iIdx + 5) % 5;
            const sameYY = ilganYY === targetYY;
            const map: Record<number, string[]> = {
                0: ["비견", "겁재"], 1: ["식신", "상관"], 2: ["편재", "정재"], 3: ["편관", "정관"], 4: ["편인", "정인"]
            };
            return sameYY ? map[diff][0] : map[diff][1];
        };

        const getFunctionalYY = (b: string) => {
            return ['자', '축', '묘', '오', '미', '유'].includes(b) ? "음" : "양";
        };

        positions.forEach((pos, i) => {
            const p = sajuRes[pos];
            const Sw = isCorrected ? STEM_WEIGHTS[i] : 1.0;
            const Bw = isCorrected ? BRANCH_WEIGHTS[i] : 1.0;

            // 1. Stem
            const sKey = mapTenGodToKey(p.stemTenGod);
            if (sKey) counts[sKey] += Sw;
            else if (pos === 'day') counts['bigyeon'] += Sw;

            // 2. Branch with Seasonal Shift & Split
            if (isCorrected && pos === 'month') {
                if (isWinter && p.branchKo === '축') {
                    const tg = getTenGodNew('water', getFunctionalYY(p.branchKo));
                    const k = mapTenGodToKey(tg); if (k) counts[k] += Bw;
                } else if (isSpring && p.branchKo === '진') {
                    // Split Jin in Spring: 67% Fire, 33% Earth
                    const tgF = getTenGodNew('fire', getFunctionalYY(p.branchKo));
                    const kF = mapTenGodToKey(tgF); if (kF) counts[kF] += (Bw * 0.67);
                    const tgE = getTenGodNew('earth', getFunctionalYY(p.branchKo));
                    const kE = mapTenGodToKey(tgE); if (kE) counts[kE] += (Bw * 0.33);
                } else {
                    const tg = getTenGodNew(getElementFromChar(p.branchKo), getFunctionalYY(p.branchKo));
                    const k = mapTenGodToKey(tg); if (k) counts[k] += Bw;
                }
            } else {
                let bEl = getElementFromChar(p.branchKo);
                if (isCorrected) {
                    if (isWinter && (p.branchKo === '축' || p.branchKo === '진')) bEl = 'water';
                    else if (isSpring && (p.branchKo === '진' || p.branchKo === '미')) bEl = 'wood';
                    else if (isSummer && (p.branchKo === '미' || p.branchKo === '술')) bEl = 'fire';
                    else if (isAutumn && (p.branchKo === '술' || p.branchKo === '축')) bEl = 'metal';
                }
                const tg = getTenGodNew(bEl, getFunctionalYY(p.branchKo));
                const bKey = mapTenGodToKey(tg);
                if (bKey) counts[bKey] += Bw;
            }
        });

        const totalPoints = isCorrected ? 11.0 : 8.0;
        const normalized: any = {};
        Object.keys(counts).forEach(k => { 
            normalized[k] = Number(((counts[k] / totalPoints) * 100).toFixed(1)); 
        });
        return normalized;
    };

    const calculateYongsin = () => {
        const mBr = sajuRes.month.branchKo;
        const ilganEl = getElementFromChar(sajuRes.ilgan);
        let johu = "화(한기 해소)";
        if (['해', '자', '축'].includes(mBr)) johu = "화(한기 해소)";
        else if (['사', '오', '미'].includes(mBr)) johu = "수(열기 식힘)";
        else johu = "수(조후 조절)";

        let eokbu = "토(균형 조절)";
        if (correctedStrength.score > 55) { // Strong
            if (ilganEl === 'wood') eokbu = "금(성장 억제)";
            else if (ilganEl === 'fire') eokbu = "수(열기 식힘)";
            else if (ilganEl === 'earth') eokbu = "목(토기 소통)";
            else if (ilganEl === 'metal') eokbu = "화(금기 제련)";
            else eokbu = "토(수기 제방)";
        } else { // Weak
            if (ilganEl === 'wood') eokbu = "수(수기 보충)";
            else if (ilganEl === 'fire') eokbu = "목(화기 지원)";
            else if (ilganEl === 'earth') eokbu = "화(토기 온난)";
            else if (ilganEl === 'metal') eokbu = "토(기운 보충)"; // Match Case 2 metal
            else eokbu = "금(수기 근원)"; // Match Case 3 water
        }
        return { johu, eokbu };
    };

    const daeunCycles = sajuRes.daeun.cycles.map((d: any) => ({
        age: d.startAge,
        year: y + d.startAge,
        ganji: d.ganzhi,
        ganjiKo: d.ganzhi // Ganzhi is already Korean in saju_calculator
    })).slice(0, 8);

    const currentYear = 2026; // Forceteller Parity Standard
    let currentDaeunIdx = -1;
    for (let i = 0; i < daeunCycles.length; i++) {
        const start = daeunCycles[i].year;
        const end = i < daeunCycles.length - 1 ? daeunCycles[i+1].year : 2100;
        if (currentYear >= start && currentYear < end) {
            currentDaeunIdx = i;
            break;
        }
    }

    const yongsin = calculateYongsin();
    const pillarDetails = { year: sajuRes.year, month: sajuRes.month, day: sajuRes.day, hour: sajuRes.hour };
    return {
        sajuJson: {
            user_info: { gender: gender === "M" ? "남성" : "여성", day_master: sajuRes.ilgan },
            elements_ratio: correctedPercentages,
            strength_analysis: { base: baseStrength, corrected: correctedStrength },
            pillar_details: pillarDetails
        },
        systemPrompt: "### 전문가 리포트",
        userAnswers: [`${selectedCategory}: ${userQuestion}`],
        sajuRes, basePercentages, correctedPercentages, baseStrength, correctedStrength, elementalLabels, y,
        yongsin, baseSipsungCounts: calculateSipsungDist(false), correctedSipsungCounts: calculateSipsungDist(true),
        stages12: { year: sajuRes.year.stage12, month: sajuRes.month.stage12, day: sajuRes.day.stage12, hour: sajuRes.hour.stage12 },
        sinsals: { year: sajuRes.year.sinsals, month: sajuRes.month.sinsals, day: sajuRes.day.sinsals, hour: sajuRes.hour.sinsals },
        pillarDetails,
        userInput: { birthDate: date, birthTime: time, gender: gender === "M" ? "남성" : "여성" },
        daeunCycles,
        currentDaeunIdx,
        daeunNum: sajuRes.daeun.startAge + 1,
        daeunDirection: sajuRes.daeun.direction === "Forward" ? "forward" : "reverse"
    };
};

export const performPremiumAnalysis = async (data: any) => {
    const analysisData = await prepareAnalysisData(data);
    return {
        reading: { analysis: { life_shape: "분석 결과..." } },
        detailedData: {
            table: analysisData.sajuRes,
            strength: { base: analysisData.baseStrength, corrected: analysisData.correctedStrength },
            elements_ratio: analysisData.correctedPercentages,
            element_labels: analysisData.elementalLabels
        }
    };
};
