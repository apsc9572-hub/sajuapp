import { calculateHighPrecisionSaju } from './src/lib/saju_calculator.ts';
import { calculateWeightedElements, calculateStrengthInfo, calculateSipsungDist } from './src/lib/premium-saju-utils.ts';

const testCases = [
    { date: "1991-01-13", time: "03:10", isLunar: false, gender: "M", birthCity: "서울", selectedCategory: "종합운" },
    { date: "1990-04-26", time: "19:40", isLunar: false, gender: "M", birthCity: "광명", selectedCategory: "종합운" },
    { date: "1990-12-02", time: "10:03", isLunar: false, gender: "F", birthCity: "서울", selectedCategory: "종합운" }
];

async function runTests() {
    for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        const [y, m, d] = tc.date.split("-").map(Number);
        const [h, mi] = tc.time.split(":").map(Number);
        
        const sajuRes = calculateHighPrecisionSaju({ 
            year: y, month: m, day: d, hour: h, minute: mi, 
            latitude: 37.5, longitude: 127.0, isLunar: tc.isLunar, gender: tc.gender 
        });

        const { basePercentages, correctedPercentages } = calculateWeightedElements(sajuRes);
        const correctedStrength = calculateStrengthInfo(correctedPercentages, sajuRes.ilgan);
        
        console.log(`\n=== Test Case ${i + 1} (${tc.date}) ===`);
        console.log(`Pillars: ${sajuRes.year.stemKo}${sajuRes.year.branchKo} ${sajuRes.month.stemKo}${sajuRes.month.branchKo} ${sajuRes.day.stemKo}${sajuRes.day.branchKo} ${sajuRes.hour.stemKo}${sajuRes.hour.branchKo}`);
        console.log("Oohaeng:", JSON.stringify(correctedPercentages));
        console.log("Strength:", JSON.stringify(correctedStrength));
    }
}

runTests();
