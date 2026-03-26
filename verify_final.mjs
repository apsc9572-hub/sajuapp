import { prepareAnalysisData } from './src/lib/premium-saju-utils.ts';

const testCase = { 
    date: "1991-01-13", time: "03:10", longitude: 127.0, gender: "M", 
    isLunar: false, birthCity: "서울", selectedCategory: "종합운", userQuestion: "운세" 
};

async function run() {
    console.log("=== Final Parity Test (Case 1) ===");
    try {
        const result = await prepareAnalysisData(testCase);
        console.log("Pillars:", result.sajuRes.year.stemKo + result.sajuRes.year.branchKo, result.sajuRes.month.stemKo + result.sajuRes.month.branchKo, result.sajuRes.day.stemKo + result.sajuRes.day.branchKo, result.sajuRes.hour.stemKo + result.sajuRes.hour.branchKo);
        console.log("Oohaeng (Corrected):", JSON.stringify(result.correctedPercentages));
        console.log("Sipsung (Corrected):", JSON.stringify(result.correctedSipsungCounts));
        console.log("Strength:", JSON.stringify(result.correctedStrength));
    } catch (e) {
        console.error(e);
    }
}
run();
