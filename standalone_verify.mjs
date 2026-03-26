// Standalone Parity Verifier
const STEM_WEIGHTS = [1.0, 1.5, 1.0, 1.0];
const BRANCH_WEIGHTS = [1.0, 3.0, 1.0, 1.5];
const JI_JANG_GAN_PRO = {
    '자': { water: 10 }, '축': { earth: 6, water: 3, metal: 1 }, '인': { wood: 7, fire: 2, earth: 1 }, '묘': { wood: 10 },
    '진': { earth: 6, wood: 3, water: 1 }, '사': { fire: 6, earth: 3, metal: 1 }, '오': { fire: 6, earth: 4 },
    '미': { earth: 6, fire: 3, wood: 1 }, '신': { metal: 7, water: 2, earth: 1 }, '유': { metal: 10 },
    '술': { earth: 6, metal: 3, fire: 1 }, '해': { water: 7, wood: 3 }
};

const getElementFromChar = (char) => {
    if (['인', '묘', '갑', '을'].includes(char)) return 'wood';
    if (['사', '오', '병', '정'].includes(char)) return 'fire';
    if (['진', '술', '축', '미', '무', '기'].includes(char)) return 'earth';
    if (['신', '유', '경', '신'].includes(char)) return 'metal';
    if (['해', '자', '임', '계'].includes(char)) return 'water';
    return 'earth';
};

const getSipsungFromElements = (ilganEl, targetEl) => {
    const relationships = {
        wood: { wood: "비견", fire: "식상", earth: "재성", metal: "관성", water: "인성" },
        fire: { fire: "비견", earth: "식상", metal: "재성", water: "관성", wood: "인성" },
        earth: { earth: "비견", metal: "식상", water: "재성", wood: "관성", fire: "인성" },
        metal: { metal: "비견", water: "식상", wood: "재성", fire: "관성", earth: "인성" },
        water: { water: "비견", wood: "식상", fire: "재성", earth: "관성", metal: "인성" }
    };
    const group = relationships[ilganEl][targetEl];
    // Simplified for distribution
    return group;
};

const calculateWeightedElements = (pillars) => {
    const powerCounts = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    const positions = ["year", "month", "day", "hour"];
    positions.forEach((pos, i) => {
        const p = pillars[pos];
        const sEl = getElementFromChar(p.stemKo);
        const bEl = getElementFromChar(p.branchKo);
        powerCounts[sEl] += STEM_WEIGHTS[i];
        const jjg = JI_JANG_GAN_PRO[p.branchKo] || { [bEl]: 10 };
        const totalJJG = Object.values(jjg).reduce((a, b) => a + b, 0);
        Object.entries(jjg).forEach(([el, ratio]) => {
            powerCounts[el] += (ratio / totalJJG) * BRANCH_WEIGHTS[i];
        });
    });
    const corrected = {};
    Object.keys(powerCounts).forEach(k => { 
        corrected[k] = Number(((powerCounts[k] / 11.0) * 100).toFixed(1)); 
    });
    return corrected;
};

// ... Simplified Sipsung/Strength logic for verification
const calculateStrength = (percentages, ilganKo) => {
    const ilganElement = getElementFromChar(ilganKo);
    const supportMap = {
        wood: ['wood', 'water'], fire: ['fire', 'wood'], earth: ['earth', 'fire'], metal: ['metal', 'earth'], water: ['water', 'metal']
    };
    const score = supportMap[ilganElement].reduce((acc, el) => acc + (percentages[el] || 0), 0);
    let label = "중화";
    if (score >= 52) label = "신강"; else if (score >= 42) label = "중화"; else label = "신약";
    return { score: Math.round(score), label };
};

// Dummy pillar generator for verification (using the known pillars from the user's cases)
const testCases = [
    { 
        name: "Case 1: 1991/01/13 M",
        pillars: {
            year: { stemKo: "경", branchKo: "오" },
            month: { stemKo: "기", branchKo: "축" },
            day: { stemKo: "임", branchKo: "술" },
            hour: { stemKo: "임", branchKo: "인" }
        },
        ilgan: "임"
    },
    {
        name: "Case 2: 1990/04/26 M",
        pillars: {
            year: { stemKo: "경", branchKo: "오" },
            month: { stemKo: "경", branchKo: "진" },
            day: { stemKo: "임", branchKo: "인" },
            hour: { stemKo: "경", branchKo: "술" }
        },
        ilgan: "임"
    },
    {
        name: "Case 3: 1990/12/02 F",
        pillars: {
            year: { stemKo: "경", branchKo: "오" },
            month: { stemKo: "정", branchKo: "해" },
            day: { stemKo: "경", branchKo: "술" },
            hour: { stemKo: "신", branchKo: "사" }
        },
        ilgan: "경"
    }
];

testCases.forEach(tc => {
    const corrected = calculateWeightedElements(tc.pillars);
    const strength = calculateStrength(corrected, tc.ilgan);
    console.log(`\n=== ${tc.name} ===`);
    console.log("Oohaeng:", JSON.stringify(corrected));
    console.log("Strength:", JSON.stringify(strength));
});
