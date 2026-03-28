
import { calculateHighPrecisionSaju } from './src/lib/saju_calculator';

const STEM_WEIGHTS = [1.0, 1.0, 1.0, 1.0];
const BRANCH_WEIGHTS = [1.0, 3.0, 1.5, 1.5];

const getElementFromChar = (char: string) => {
  if (['甲', '乙', '寅', '卯', '갑', '을', '인', '묘'].includes(char)) return 'wood';
  if (['丙', '丁', '巳', '午', '병', '정', '사', '오'].includes(char)) return 'fire';
  if (['戊', '己', '辰', '戌', '축', '미', '진', '술', '축', '미'].includes(char)) return 'earth';
  if (['庚', '辛', '申', '酉', '경', '신', '유'].includes(char)) return 'metal';
  if (['壬', '癸', '亥', '子', '임', '계', '해', '자'].includes(char)) return 'water';
  return 'earth';
};

const calculateSipsungDist = (sajuRes: any, isCorrected: boolean) => {
    const counts: Record<string, number> = { bikyeop: 0, siksang: 0, jaeseong: 0, gwanseong: 0, inseong: 0 };
    const ilganEl = getElementFromChar(sajuRes.ilgan);
    const positions: ("year" | "month" | "day" | "hour")[] = ["year", "month", "day", "hour"];

    const monthBr = sajuRes.month.branchKo;
    const isWinter = ['해', '자', '축'].includes(monthBr);
    const isSpring = ['인', '묘', '진'].includes(monthBr);
    const isSummer = ['사', '오', '미'].includes(monthBr);
    const isAutumn = ['신', '유', '술'].includes(monthBr);

    const getTenGodGroup = (targetEl: string) => {
        const elOrder = ["wood", "fire", "earth", "metal", "water"];
        const iIdx = elOrder.indexOf(ilganEl);
        const tIdx = elOrder.indexOf(targetEl);
        const diff = (tIdx - iIdx + 5) % 5;
        const map: Record<number, string> = {
            0: "bikyeop", 1: "siksang", 2: "jaeseong", 3: "gwanseong", 4: "inseong"
        };
        return map[diff];
    };

    positions.forEach((pos, i) => {
        const p = sajuRes[pos];
        const Sw = isCorrected ? STEM_WEIGHTS[i] : 1.0;
        const Bw = isCorrected ? BRANCH_WEIGHTS[i] : 1.0;

        const sEl = getElementFromChar(p.stemKo);
        counts[getTenGodGroup(sEl)] += Sw;

        if (isCorrected && pos === 'month') {
            if (isWinter && p.branchKo === '축') counts[getTenGodGroup('water')] += Bw;
            else if (isSpring && p.branchKo === '진') {
                counts[getTenGodGroup('fire')] += (Bw * 0.67);
                counts[getTenGodGroup('earth')] += (Bw * 0.33);
            } else counts[getTenGodGroup(getElementFromChar(p.branchKo))] += Bw;
        } else {
            let bEl = getElementFromChar(p.branchKo);
            if (isCorrected) {
                if (isWinter && (p.branchKo === '축' || p.branchKo === '진')) bEl = 'water';
                else if (isSpring && (p.branchKo === '진' || p.branchKo === '미')) bEl = 'wood';
                else if (isSummer && (p.branchKo === '미' || p.branchKo === '술')) bEl = 'fire';
                else if (isAutumn && (p.branchKo === '술' || p.branchKo === '축')) bEl = 'metal';
            }
            counts[getTenGodGroup(bEl)] += Bw;
        }
    });

    const totalPoints = isCorrected ? 11.0 : 8.0;
    const normalized: any = {};
    Object.keys(counts).forEach(k => { 
        normalized[k] = Number(((counts[k] / totalPoints) * 100).toFixed(1)); 
    });
    return normalized;
};

const testCases = [
    { name: "음 1990/10/16 10:03 여 (Seoul)", y: 1990, m: 10, d: 16, h: 10, mi: 3, isLunar: true, gender: "F" },
    { name: "음 1964/02/25 18:10 여 (Daejeon)", y: 1964, m: 2, d: 25, h: 18, mi: 10, isLunar: true, gender: "F" },
    { name: "양 1990/04/26 19:40 남 (Gwangmyeong)", y: 1990, m: 4, d: 26, h: 19, mi: 40, isLunar: false, gender: "M" },
    { name: "양 1991/01/13 03:10 남 (Seoul)", y: 1991, m: 1, d: 13, h: 3, mi: 10, isLunar: false, gender: "M" }
];

testCases.forEach(tc => {
    const sajuRes = calculateHighPrecisionSaju({ year: tc.y, month: tc.m, day: tc.d, hour: tc.h, minute: tc.mi, latitude: 37.5, longitude: 127.0, isLunar: tc.isLunar, gender: tc.gender });
    console.log(`--- ${tc.name} ---`);
    console.log(`Pillars: ${sajuRes.year.stemKo}${sajuRes.year.branchKo} ${sajuRes.month.stemKo}${sajuRes.month.branchKo} ${sajuRes.day.stemKo}${sajuRes.day.branchKo} ${sajuRes.hour.stemKo}${sajuRes.hour.branchKo}`);
    console.log(`Ilgan: ${sajuRes.ilgan}`);
    console.log("Base:", calculateSipsungDist(sajuRes, false));
    console.log("Corrected:", calculateSipsungDist(sajuRes, true));
    console.log("");
});
