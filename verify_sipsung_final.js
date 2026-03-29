
// Standalone Sipsung Verifier (Vanilla JS)
const STEM_WEIGHTS = [1.0, 1.0, 1.0, 1.0];
const BRANCH_WEIGHTS = [1.0, 3.0, 1.5, 1.5];

const getElementFromChar = (char) => {
  if (['甲', '乙', '寅', '卯', '갑', '을', '인', '묘'].includes(char)) return 'wood';
  if (['丙', '丁', '巳', '午', '병', '정', '사', '오'].includes(char)) return 'fire';
  if (['戊', '己', '辰', '戌', '축', '미', '진', '술', '축', '미'].includes(char)) return 'earth';
  if (['庚', '辛', '申', '酉', '경', '신', '유'].includes(char)) return 'metal';
  if (['壬', '癸', '亥', '子', '임', '계', '해', '자'].includes(char)) return 'water';
  return 'earth';
};

const calculateSipsungDist = (ilgan, pillars, isCorrected) => {
    const counts = { bikyeop: 0, siksang: 0, jaeseong: 0, gwanseong: 0, inseong: 0 };
    const ilganEl = getElementFromChar(ilgan);
    const positions = ["year", "month", "day", "hour"];

    const monthBr = pillars.month.branch;
    const isWinter = ['해', '자', '축'].includes(monthBr);
    const isSpring = ['인', '묘', '진'].includes(monthBr);
    const isSummer = ['사', '오', '미'].includes(monthBr);
    const isAutumn = ['신', '유', '술'].includes(monthBr);

    const getTenGodGroup = (targetEl) => {
        const elOrder = ["wood", "fire", "earth", "metal", "water"];
        const iIdx = elOrder.indexOf(ilganEl);
        const tIdx = elOrder.indexOf(targetEl);
        const diff = (tIdx - iIdx + 5) % 5;
        const map = {
            0: "bikyeop", 1: "siksang", 2: "jaeseong", 3: "gwanseong", 4: "inseong"
        };
        return map[diff];
    };

    positions.forEach((pos, i) => {
        const p = pillars[pos];
        const Sw = isCorrected ? STEM_WEIGHTS[i] : 1.0;
        const Bw = isCorrected ? BRANCH_WEIGHTS[i] : 1.0;

        const sEl = getElementFromChar(p.stem);
        counts[getTenGodGroup(sEl)] += Sw;

        if (isCorrected && pos === 'month') {
            if (isWinter && p.branch === '축') counts[getTenGodGroup('water')] += Bw;
            else if (isSpring && p.branch === '진') {
                counts[getTenGodGroup('fire')] += (Bw * 0.67);
                counts[getTenGodGroup('earth')] += (Bw * 0.33);
            } else counts[getTenGodGroup(getElementFromChar(p.branch))] += Bw;
        } else {
            let bEl = getElementFromChar(p.branch);
            if (isCorrected) {
                if (isWinter && (p.branch === '축' || p.branch === '진')) bEl = 'water';
                else if (isSpring && (p.branch === '진' || p.branch === '미')) bEl = 'wood';
                else if (isSummer && (p.branch === '미' || p.branch === '술')) bEl = 'fire';
                else if (isAutumn && (p.branch === '술' || p.branch === '축')) bEl = 'metal';
            }
            counts[getTenGodGroup(bEl)] += Bw;
        }
    });

    const totalPoints = isCorrected ? 11.0 : 8.0;
    const normalized = {};
    Object.keys(counts).forEach(k => { 
        normalized[k] = Number(((counts[k] / totalPoints) * 100).toFixed(1)); 
    });
    return normalized;
};

const testCases = [
    { 
        name: "음 1990/10/16 10:03 여 (Solar 1990.12.02)", 
        ilgan: "무", 
        pillars: {
            year: { stem: "경", branch: "오" },
            month: { stem: "정", branch: "해" },
            day: { stem: "무", branch: "인" },
            hour: { stem: "정", branch: "사" }
        }
    },
    { 
        name: "음 1964/02/25 18:10 여 (Solar 1964.04.07)", 
        ilgan: "무", 
        pillars: {
            year: { stem: "갑", branch: "진" },
            month: { stem: "무", branch: "진" },
            day: { stem: "무", branch: "자" },
            hour: { stem: "신", branch: "유" }
        }
    },
    { 
        name: "양 1990/04/26 19:40 남", 
        ilgan: "신", 
        pillars: {
            year: { stem: "경", branch: "오" },
            month: { stem: "경", branch: "진" },
            day: { stem: "신", branch: "유" },
            hour: { stem: "무", branch: "술" }
        }
    },
    { 
        name: "양 1991/01/13 03:10 남", 
        ilgan: "계", 
        pillars: {
            year: { stem: "경", branch: "오" },
            month: { stem: "기", branch: "축" },
            day: { stem: "계", branch: "유" },
            hour: { stem: "계", branch: "축" }
        }
    }
];

testCases.forEach(tc => {
    console.log(`--- ${tc.name} ---`);
    console.log("Base:", JSON.stringify(calculateSipsungDist(tc.ilgan, tc.pillars, false)));
    console.log("Corrected:", JSON.stringify(calculateSipsungDist(tc.ilgan, tc.pillars, true)));
    console.log("");
});
