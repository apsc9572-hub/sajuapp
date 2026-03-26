
import { calculateSaju } from "ssaju";

const getElementFromChar = (char) => {
  if (['甲', '乙', '寅', '卯', '갑', '을', '인', '묘'].includes(char)) return 'wood';
  if (['丙', '丁', '巳', '午', '병', '정', '사', '오'].includes(char)) return 'fire';
  if (['戊', '己', '辰', '戌', '丑', '未', '무', '기', '진', '술', '축', '미'].includes(char)) return 'earth';
  if (['庚', '辛', '申', '酉', '경', '신', '신', '유'].includes(char)) return 'metal';
  if (['壬', '癸', '亥', '子', '임', '계', '해', '자'].includes(char)) return 'water';
  return 'earth';
};

const calculateWeightedElements = (pillars) => {
    const correctedCounts = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    const stemWeights = [1.0, 1.5, 1.5, 1.0]; // Year, Month, Day, Hour (Wait, let's verify order)
    // From premium-saju-utils.ts: 
    // stemWeights = [1.0, 1.5, 1.5, 1.0]; // year, month, day, hour
    // branchWeights = [1.0, 3.0, 1.0, 1.0]; // year, month, day, hour

    const positions = ["year", "month", "day", "hour"];
    const sWeights = [1.0, 1.5, 1.5, 1.0];
    const bWeights = [1.0, 3.0, 1.0, 1.0];

    positions.forEach((pos, i) => {
        const pillar = pillars[pos];
        const sChar = pillar.stemKo;
        const bChar = pillar.branchKo;
        
        let sEl = getElementFromChar(sChar);
        let bEl = getElementFromChar(bChar);

        // Seasonal Correction: Chuk(丑) and Jin(辰) count as Water
        if (bChar === '축' || bChar === '진') {
            bEl = 'water';
        }

        correctedCounts[sEl] += sWeights[i];
        correctedCounts[bEl] += bWeights[i];
    });

    const totalWeight = 11.0; 
    const correctedPercentages = {};
    Object.keys(correctedCounts).forEach(el => {
        correctedPercentages[el] = (correctedCounts[el] / totalWeight) * 100;
    });

    return { correctedCounts, correctedPercentages };
};

// 1991-01-13 03:10 Solar
const sajuRes = calculateSaju({ year: 1991, month: 1, day: 13, hour: 3, minute: 10, calendar: "solar" });
const pDet = sajuRes.pillarDetails;

const pillars = {
    year: { stemKo: pDet.year.stemKo, branchKo: pDet.year.branchKo },
    month: { stemKo: pDet.month.stemKo, branchKo: pDet.month.branchKo },
    day: { stemKo: pDet.day.stemKo, branchKo: pDet.day.branchKo },
    hour: { stemKo: pDet.hour.stemKo, branchKo: pDet.hour.branchKo }
};

console.log("Pillars (Ko):", pillars);

const result = calculateWeightedElements(pillars);
console.log("Counts:", result.correctedCounts);
console.log("Percentages:", JSON.stringify(result.correctedPercentages, null, 2));
