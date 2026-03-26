const { calculateHighPrecisionSaju } = require("./src/lib/saju_calculator");
const { calculateWeightedElements, calculateStrengthInfo, getSeasonFromBranch, POSITIONAL_WEIGHTS, SEASONAL_COEFFICIENTS, getElementFromChar } = require("./src/lib/premium-saju-utils");

const JI_JANG_GAN = {
    '자': { water: 10 }, '축': { earth: 6, water: 3, metal: 1 }, '인': { wood: 7, fire: 3 }, '묘': { wood: 10 },
    '진': { earth: 6, wood: 3, water: 1 }, '사': { fire: 6, earth: 3, metal: 1 }, '오': { fire: 6, earth: 4 },
    '미': { earth: 6, fire: 3, wood: 1 }, '신': { metal: 7, water: 3 }, '유': { metal: 10 },
    '술': { earth: 6, metal: 3, fire: 1 }, '해': { water: 7, wood: 3 }
}

const mapTenGodToKey = (tg) => {
    const mapping = {
        "비견": "bigyeon", "겁재": "geobjae", "식신": "siksin", "상관": "sanggwan",
        "편재": "pyeonja", "정재": "jeongja", "편관": "pyeongwan", "정관": "jeonggwan",
        "편인": "pyeonin", "정인": "jeongin"
    };
    return mapping[tg] || "";
};

const getSipsungFromElements = (ilganEl, targetEl) => {
    const elOrder = ["wood", "fire", "earth", "metal", "water"];
    const iIdx = elOrder.indexOf(ilganEl);
    const tIdx = elOrder.indexOf(targetEl);
    if (iIdx === -1 || tIdx === -1) return "비견";
    const diff = (tIdx - iIdx + 5) % 5;
    const map = { 0: "비견", 1: "식신", 2: "재성", 3: "관성", 4: "인성" };
    return map[diff];
};

const calculateSipsungDist = (sajuRes, isCorrected) => {
    const counts = { siksin: 0, sanggwan: 0, pyeonja: 0, jeongja: 0, pyeongwan: 0, jeonggwan: 0, pyeonin: 0, jeongin: 0, bigyeon: 0, geobjae: 0 };
    const positions = ["year", "month", "day", "hour"];
    const ilganKo = sajuRes.day.stemKo;
    const ilganEl = getElementFromChar(ilganKo);
    const season = getSeasonFromBranch(sajuRes.month.branchKo);
    const coeffs = isCorrected ? SEASONAL_COEFFICIENTS[season] : { wood:1, fire:1, earth:1, metal:1, water:1 };

    positions.forEach((pos, i) => {
        const p = sajuRes[pos];
        const weightS = isCorrected ? POSITIONAL_WEIGHTS.stems[i] : 1.0;
        const weightB = isCorrected ? POSITIONAL_WEIGHTS.branches[i] : 1.0;

        if (pos !== 'day') {
            const tg = p.stemTenGod;
            const sKey = mapTenGodToKey(tg || "-");
            const stemEl = getElementFromChar(p.stemKo);
            if (sKey) counts[sKey] += weightS * coeffs[stemEl];
        } else {
            counts['bigyeon'] += weightS * coeffs[ilganEl];
        }

        const branchEl = getElementFromChar(p.branchKo);
        const jjg = JI_JANG_GAN[p.branchKo] || { [branchEl]: 10 };
        const totalJJG = Object.values(jjg).reduce((a, b) => a + b, 0);
        Object.entries(jjg).forEach(([el, ratio]) => {
            const power = (ratio / totalJJG) * weightB * coeffs[el];
            const tg = getSipsungFromElements(ilganEl, el);
            const sKey = mapTenGodToKey(tg);
            if (sKey) counts[sKey] += power;
        });
    });

    const total = Object.values(counts).reduce((a,b) => a+b, 0);
    const normalized = {}; Object.keys(counts).forEach(k => { normalized[k] = Number(((counts[k] / total) * 100).toFixed(1)); });
    return normalized;
};

const runTest = (name, year, month, day, hour, minute, gender, lat, lon) => {
    const sajuRes = calculateHighPrecisionSaju({ year, month, day, hour, minute, latitude: lat, longitude: lon, isLunar: false, gender });
    const { basePercentages, correctedPercentages } = calculateWeightedElements(sajuRes);
    const baseStrength = calculateStrengthInfo(basePercentages, sajuRes.ilgan);
    const correctedStrength = calculateStrengthInfo(correctedPercentages, sajuRes.ilgan);
    const baseSipsung = calculateSipsungDist(sajuRes, false);
    const correctedSipsung = calculateSipsungDist(sajuRes, true);

    console.log(`\n=== CASE: ${name} ===`);
    console.log(`Elements (B/C): Wood(${basePercentages.wood}/${correctedPercentages.wood}) Fire(${basePercentages.fire}/${correctedPercentages.fire}) Earth(${basePercentages.earth}/${correctedPercentages.earth}) Metal(${basePercentages.metal}/${correctedPercentages.metal}) Water(${basePercentages.water}/${correctedPercentages.water})`);
    console.log(`Strength: Base(${baseStrength.score}%, ${baseStrength.label}) -> Corr(${correctedStrength.score}%, ${correctedStrength.label})`);
    console.log(`Ten-Gods (B): Bigyeon(${baseSipsung.bigyeon}) Siksin(${baseSipsung.siksin}) Pyeonja(${baseSipsung.pyeonja}) Pyeongwan(${baseSipsung.pyeongwan}) Pyeonin(${baseSipsung.pyeonin}) ...`);
    console.log(`Ten-Gods (C): Bigyeon(${correctedSipsung.bigyeon}) Siksin(${correctedSipsung.siksin}) Pyeonja(${correctedSipsung.pyeonja}) Pyeongwan(${correctedSipsung.pyeongwan}) Pyeonin(${correctedSipsung.pyeonin}) ...`);
}

runTest("Case 1", 1991, 1, 13, 3, 10, "M", 37.56, 126.97);
runTest("Case 2", 1990, 4, 26, 19, 40, "M", 37.47, 126.86);
runTest("Case 3", 1990, 12, 2, 10, 3, "F", 37.56, 126.97);
