// FULL STANDALONE PRECISION VERIFIER
// ----------------------------------------------------------------------------
// Part 1: Saju Calculator Logic (from saju_calculator.ts)
// ----------------------------------------------------------------------------
const STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
const BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];

function getSolarLongitude(date) {
    const ms = date.getTime();
    const d = (ms / 86400000) - (new Date("2000-01-01T12:00:00Z").getTime() / 86400000);
    const g = (357.529 + 0.98560028 * d) % 360;
    const q = (280.459 + 0.98564736 * d) % 360;
    const l = (q + 1.915 * Math.sin(g * Math.PI / 180) + 0.02 * Math.sin(2 * g * Math.PI / 180)) % 360;
    return (l + 360) % 360;
}

function getJulianDay(y, m, d) {
    if (m <= 2) { y -= 1; m += 12; }
    const a = Math.floor(y / 100);
    const b = 2 - a + Math.floor(a / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5;
}

function calculateHighPrecisionSaju(params) {
    const { year, month, day, hour, minute, longitude } = params;
    const kstDate = new Date(year, month - 1, day, hour, minute);
    const lonFrom135 = (135 - longitude) * 4; // Seoul: -32m
    const tst = new Date(kstDate.getTime() + (-lonFrom135 * 60 * 1000));

    const jd = getJulianDay(year, month, day);
    const anchorJD = getJulianDay(1991, 1, 13);
    const finalDayIdx = (19 + Math.floor(jd - anchorJD) % 60 + 60) % 60;
    const dayStem = STEMS[finalDayIdx % 10];
    const dayBranch = BRANCHES[finalDayIdx % 12];

    const solarL = getSolarLongitude(kstDate);
    const termAngles = [315, 345, 15, 45, 75, 105, 135, 165, 195, 225, 255, 285];
    let monthIdx = termAngles.findIndex((a, i) => {
        const nextA = termAngles[(i + 1) % 12];
        if (a > nextA) return solarL >= a || solarL < nextA;
        return solarL >= a && solarL < nextA;
    });
    if (monthIdx === -1) monthIdx = 11;

    let sYear = year;
    if (solarL < 315 && month <= 2) sYear -= 1;
    const yearIdx = (sYear - 4 + 60) % 60;
    const yearStem = STEMS[yearIdx % 10];
    const yearBranch = BRANCHES[yearIdx % 12];

    const monthStemAnchor = (yearIdx % 5) * 2 + 2;
    const monthStem = STEMS[(monthStemAnchor + monthIdx) % 10];
    const monthBranch = BRANCHES[(monthIdx + 2) % 12];

    const hourTotalMin = tst.getHours() * 60 + tst.getMinutes();
    const hourBranchIdx = Math.floor((hourTotalMin + 60) % 1440 / 120);
    const hourStemAnchor = (finalDayIdx % 5) * 2;
    const hourStem = STEMS[(hourStemAnchor + hourBranchIdx) % 10];
    const hourBranch = BRANCHES[hourBranchIdx];

    return {
        year: { stemKo: yearStem, branchKo: yearBranch },
        month: { stemKo: monthStem, branchKo: monthBranch },
        day: { stemKo: dayStem, branchKo: dayBranch },
        hour: { stemKo: hourStem, branchKo: hourBranch },
        ilgan: dayStem
    };
}

// ----------------------------------------------------------------------------
// Part 2: Parity Logic (from premium-saju-utils.ts)
// ----------------------------------------------------------------------------
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

// ----------------------------------------------------------------------------
// Part 3: Test Execution
// ----------------------------------------------------------------------------
const testCases = [
    { date: "1991-01-13", time: "03:10", longitude: 127.0, gender: "M", name: "Case 1" },
    { date: "1990-04-26", time: "19:40", longitude: 127.0, gender: "M", name: "Case 2" },
    { date: "1990-12-02", time: "10:03", longitude: 127.0, gender: "F", name: "Case 3" }
];

testCases.forEach(tc => {
    const [y, m, d] = tc.date.split("-").map(Number);
    const [h, mi] = tc.time.split(":").map(Number);
    const pillars = calculateHighPrecisionSaju({ year: y, month: m, day: d, hour: h, minute: mi, longitude: tc.longitude });
    const corrected = calculateWeightedElements(pillars);
    const strength = calculateStrength(corrected, pillars.ilgan);
    
    console.log(`\n=== ${tc.name} (${tc.date} ${tc.time}) ===`);
    console.log(`Pillars: ${pillars.year.stemKo}${pillars.year.branchKo} ${pillars.month.stemKo}${pillars.month.branchKo} ${pillars.day.stemKo}${pillars.day.branchKo} ${pillars.hour.stemKo}${pillars.hour.branchKo}`);
    console.log("Oohaeng:", JSON.stringify(corrected));
    console.log("Strength:", JSON.stringify(strength));
});
