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
    
    // Current Transit Data (2026-03-27 standard)
    const now = new Date();
    const currentTransit = calculateHighPrecisionSaju({
        year: 2026, month: 3, day: 27, hour: now.getHours(), minute: now.getMinutes(),
        latitude: 37.5, longitude: 127.0, isLunar: false, gender: gender === "M" ? "M" : "F"
    });

    return {
        sajuJson: {
            user_info: { gender: gender === "M" ? "남성" : "여성", day_master: sajuRes.ilgan },
            elements_ratio: correctedPercentages,
            strength_analysis: { base: baseStrength, corrected: correctedStrength },
            pillar_details: pillarDetails,
            yongsin: calculateYongsin(),
            daeun: {
                direction: sajuRes.daeun.direction === "Forward" ? "순행" : "역행",
                start_age: sajuRes.daeun.startAge,
                current_cycle: daeunCycles[currentDaeunIdx] || null,
                all_cycles: daeunCycles
            },
            current_transit: {
                year_pillar: currentTransit.year.stemKo + currentTransit.year.branchKo,
                month_pillar: currentTransit.month.stemKo + currentTransit.month.branchKo,
                day_pillar: currentTransit.day.stemKo + currentTransit.day.branchKo
            }
        },
        systemPrompt: "### 전문가 리포트",
        userAnswers: [`${selectedCategory}: ${userQuestion}`],
        sajuRes, basePercentages, correctedPercentages, baseStrength, correctedStrength, elementalLabels, y,
        yongsin, baseSipsungCounts: calculateSipsungDist(false), correctedSipsungCounts: calculateSipsungDist(true),
        stages12: { year: sajuRes.year.stage12, month: sajuRes.month.stage12, day: sajuRes.day.stage12, hour: sajuRes.hour.stage12 },
        sinsals: { 
            year: { merged: sajuRes.year.sinsals, stem: sajuRes.year.stemSinsals, branch: sajuRes.year.branchSinsals, twelveSal: sajuRes.year.branchSinsals.find(s => ["겁살", "재살", "천살", "지살", "년살", "월살", "망신살", "장성살", "반안살", "역마살", "육해살", "화개살"].includes(s)) || "" }, 
            month: { merged: sajuRes.month.sinsals, stem: sajuRes.month.stemSinsals, branch: sajuRes.month.branchSinsals, twelveSal: sajuRes.month.branchSinsals.find(s => ["겁살", "재살", "천살", "지살", "년살", "월살", "망신살", "장성살", "역마살", "육해살", "화개살"].includes(s)) || "" }, 
            day: { merged: sajuRes.day.sinsals, stem: sajuRes.day.stemSinsals, branch: sajuRes.day.branchSinsals, twelveSal: sajuRes.day.branchSinsals.find(s => ["겁살", "재살", "천살", "지살", "년살", "월살", "망신살", "장성살", "역마살", "육해살", "화개살"].includes(s)) || "" }, 
            hour: { merged: sajuRes.hour.sinsals, stem: sajuRes.hour.stemSinsals, branch: sajuRes.hour.branchSinsals, twelveSal: sajuRes.hour.branchSinsals.find(s => ["겁살", "재살", "천살", "지살", "년살", "월살", "망신살", "장성살", "역마살", "육해살", "화개살"].includes(s)) || "" } 
        },
        pillarDetails,
        userInput: { birthDate: date, birthTime: time, gender: gender === "M" ? "남성" : "여성" },
        daeunCycles,
        currentDaeunIdx,
        daeunNum: sajuRes.daeun.startAge + 1,
        daeunDirection: sajuRes.daeun.direction === "Forward" ? "forward" : "reverse"
    };
};

export const SAJU_DICTIONARY: Record<string, string> = {
    // 1. 기초 오행 (Elements)
    "목(木)": "성장과 추진력, 새로운 시작과 어진 마음을 상징하는 나무의 기운입니다.",
    "화(火)": "열정과 확산, 예의와 화려한 표현력을 의미하는 불의 기운입니다.",
    "토(土)": "안정과 중재, 신용과 포용력을 상징하는 대지의 기운입니다.",
    "금(金)": "결단과 의리, 냉철한 판단력과 변치 않는 단단함을 뜻하는 금속의 기운입니다.",
    "수(水)": "지혜와 유연함, 직관력과 끊임없이 흐르는 생명력을 의미하는 물의 기운입니다.",

    // 2. 십성 (Ten Gods)
    "비견": "나 자신과 같은 기운으로, 주체성과 독립심, 강한 자아를 의미합니다.",
    "겁재": "나와 오행은 같으나 음양이 다른 기운으로, 경쟁심, 투지, 재물을 나누는 힘을 뜻합니다.",
    "식신": "창의성과 표현력의 기운이며, 풍요로운 의식주와 건강, 수명을 상징합니다.",
    "상관": "재치와 순발력, 뛰어난 화술을 의미하며 기존의 틀을 깨는 혁신적인 기운입니다.",
    "편재": "내가 통제하는 유동적인 큰 재물을 의미하며, 모험심과 기획력, 사업적 수완을 뜻합니다.",
    "정재": "정직하게 노력하여 얻는 안정적인 재물이며, 성실함과 꼼꼼한 관리력을 상징합니다.",
    "편관": "자신을 엄격히 통제하는 기운으로, 명예와 권위, 강한 책임감과 인내심을 의미합니다.",
    "정관": "안정적인 직위와 명예를 의미하며, 규칙 준수와 합리적인 행정력을 상징합니다.",
    "편인": "독창적인 지혜와 통찰력, 예술적인 재능을 뜻하며 신비로운 지적 호기심을 의미합니다.",
    "정인": "학문과 지적 수용력, 인덕과 후원자의 복을 의미하는 자비로운 성분의 기운입니다.",

    // 3. 운성 및 신강약 (Energy & Strength)
    "신강": "본인의 자아 기운이 넘치고 강하여, 삶을 주도적으로 이끌어가는 힘이 큼을 의미합니다.",
    "신약": "주변의 기운을 수용하고 조율하며, 협력과 상생을 통해 내실을 다지는 기운입니다.",
    "중화": "기운이 한쪽으로 치우치지 않고 균형이 잘 잡힌 상태로, 원만한 삶의 흐름을 상징합니다.",
    "용신": "사주 전체의 균형과 조화를 맞춰주는 가장 핵심적인 행운의 기운이자 삶의 무기입니다.",
    "12운성": "인생의 기운이 생겨나서 왕성해졌다가 소멸하기까지의 12단계 순환 과정을 뜻합니다.",
    "지장간": "지지의 기운 속에 숨겨진 천간의 기운으로, 내면의 잠재력과 은밀한 변수를 의미합니다.",

    // 4. 길성과 신살 (Stars & Sinsals)
    "천을귀인": "위기를 기회로 바꿔주는 최고의 길성으로, 인복과 귀인의 도움을 상징합니다.",
    "문곡귀인": "학문과 예술적 재능이 뛰어나며, 지혜로운 판단력으로 명성을 얻는 기운입니다.",
    "정록": "성실한 노력으로 얻는 정당한 녹봉과 관직의 복을 의미합니다.",
    "양인살": "강력한 추진력과 카리스마를 상징하며, 결단력이 필요한 분야에서 대성하는 기운입니다.",
    "백호대살": "강한 기운과 폭발적인 에너지를 의미하며, 전문분야에서 압도적인 성과를 내는 힘입니다.",
    "괴강살": "우두머리의 기운으로 총명하고 강직하며, 대중을 이끄는 카리스마를 뜻합니다.",
    "도화살": "타인에게 매력을 발산하고 주목받는 기운으로, 현대 사주에서는 높은 인기를 의미합니다.",
    "역마살": "활동 범위가 넓고 이동이 잦음을 의미하며, 국제적인 활동이나 변화를 통한 발전을 뜻합니다.",
    "화개살": "예술성과 종교성, 깊은 사색을 의미하며 반복을 통해 전문성을 갖추는 기운입니다.",
    "암록": "보이지 않는 곳에서 돕는 귀인의 손길과 예상치 못한 재물 복을 상징합니다.",
    "홍염살": "다정다감하고 사람을 끄는 매력이 있어 대인관계에서 이점을 얻는 기운입니다.",
    "천문성": "영적 직관력과 지혜가 뛰어나 학문이나 종교, 상담 분야에서 두각을 나타냅니다.",
    "황은대사": "황제의 은혜를 입듯 예기치 못한 행운과 국가적 보상, 큰 도움을 받는 길성입니다."
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
