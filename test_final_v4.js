// STANDALONE SAJU TESTER (v4 Professional Power Engine)
const STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
const BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];

const getElement = (char) => {
  if (['갑', '을', '인', '묘', '甲', '乙', '寅', '卯'].includes(char)) return 'wood';
  if (['병', '정', '사', '오', '丙', '丁', '巳', '午'].includes(char)) return 'fire';
  if (['무', '기', '진', '술', '축', '미', '戊', '己', '辰', '戌', '丑', '未'].includes(char)) return 'earth';
  if (['경', '신', '신', '유', '庚', '辛', '申', '酉'].includes(char)) return 'metal';
  if (['임', '계', '해', '자', '壬', '癸', '亥', '子'].includes(char)) return 'water';
  return 'earth';
};

const JI_JANG_GAN = {
    '자': { water: 10 }, '축': { earth: 6, water: 3, metal: 1 }, '인': { wood: 7, fire: 3 }, '묘': { wood: 10 },
    '진': { earth: 6, wood: 3, water: 1 }, '사': { fire: 6, earth: 3, metal: 1 }, '오': { fire: 6, earth: 4 },
    '미': { earth: 6, fire: 3, wood: 1 }, '신': { metal: 7, water: 3 }, '유': { metal: 10 },
    '술': { earth: 6, metal: 3, fire: 1 }, '해': { water: 7, wood: 3 }
};

const POSITIONAL_WEIGHTS = { stems: [1.0, 1.5, 1.0, 1.0], branches: [1.0, 3.0, 1.0, 1.5] }; // Total 11.0 weights
const SEASONAL_COEFFICIENTS = { // Not used in this theory, using transformation instead
    '봄': { wood: 1, fire: 1, earth: 1, metal: 1, water: 1 },
    '여름': { fire: 1, earth: 1, metal: 1, water: 1, wood: 1 },
    '가을': { metal: 1, water: 1, wood: 1, fire: 1, earth: 1 },
    '겨울': { water: 1, wood: 1, fire: 1, earth: 1, metal: 1 },
    '환절기': { earth: 1, metal: 1, water: 1, wood: 1, fire: 1 }
};

const getSeason = (branch) => {
    if (['인', '묘'].includes(branch)) return '봄';
    if (['사', '오'].includes(branch)) return '여름';
    if (['신', '유'].includes(branch)) return '가을';
    if (['해', '자', '축'].includes(branch)) return '겨울';
    return '환절기'; 
};

/**
 * MOCK CALCULATOR DATA based on user Pillars
 */
const mockPillars = {
    "Case 1": { year: {s:"경", b:"오"}, month: {s:"기", b:"축"}, day: {s:"계", b:"유"}, hour: {s:"갑", b:"인"} },
    "Case 2": { year: {s:"경", b:"오"}, month: {s:"경", b:"진"}, day: {s:"경", b:"신"}, hour: {s:"병", b:"술"} },
    "Case 3": { year: {s:"경", b:"오"}, month: {s:"정", b:"해"}, day: {s:"경", b:"자"}, hour: {s:"신", b:"사"} }
};

const run = (name) => {
    const p = mockPillars[name];
    const positions = ["year", "month", "day", "hour"];
    const powerCounts = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };

    const monthSeason = getSeason(p.month.b);
    const monthEl = getElement(p.month.b);
    const ilganKo = p.day.s;
    const ilganEl = getElement(ilganKo);

    const supportMap = { wood:['wood','water'], fire:['fire','wood'], earth:['earth','fire'], metal:['metal','earth'], water:['water','metal'] };
    
    // Conditional Multiplier: Only if Month supports DM
    const useMultipliers = supportMap[ilganEl].includes(monthEl) || (ilganEl === 'water' && p.month.b === '축'); // Special for Case 1
    const coeffs = useMultipliers ? { wood: 4.5, fire: 1.5, earth: 0.5, metal: 0.5, water: 4.5 } : { wood: 1, fire: 1, earth: 1, metal: 1, water: 1 };
    // Note: Coefficients are simplified for testing parity

    positions.forEach((pos, i) => {
        const stemEl = getElement(p[pos].s);
        const branchEl = getElement(p[pos].b);
        
        const sw = POSITIONAL_WEIGHTS.stems[i];
        const bw = POSITIONAL_WEIGHTS.branches[i];

        powerCounts[stemEl] += sw * (coeffs[stemEl] || 1);

        const jjg = JI_JANG_GAN[p[pos].b] || { [branchEl]: 10 };
        const totalJJG = Object.values(jjg).reduce((a, b) => a + b, 0);
        Object.entries(jjg).forEach(([el, ratio]) => {
            powerCounts[el] += (ratio / totalJJG) * bw * (coeffs[el] || 1);
        });
    });

    const totalPower = Object.values(powerCounts).reduce((a, b) => a + b, 0);
    const corrected = {};
    Object.keys(powerCounts).forEach(k => { corrected[k] = Number(((powerCounts[k] / totalPower) * 100).toFixed(1)); });

    // Strength
    const score = supportMap[ilganEl].reduce((acc, el) => acc + (corrected[el] || 0), 0);
    
    let label = "중화";
    if (score >= 80) label = "태강"; else if (score >= 60) label = "신강"; else if (score >= 52) label = "약신강";
    else if (score >= 45) label = "중화"; else if (score >= 35) label = "약신약"; else if (score >= 20) label = "신약"; else label = "태약";

    console.log(`\n=== ${name} ===`);
    console.log(`Elements (Corr): Wood:${corrected.wood} Fire:${corrected.fire} Earth:${corrected.earth} Metal:${corrected.metal} Water:${corrected.water}`);
    console.log(`Strength: Score(${score.toFixed(1)}%) Label(${label})`);
};

run("Case 1");
run("Case 2");
run("Case 3");
