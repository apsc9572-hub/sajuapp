import { prepareAnalysisData } from './src/lib/premium-saju-utils.ts';

const testCases = [
    { date: "1991-01-13", time: "03:10", isLunar: false, gender: "M", birthCity: "서울", selectedCategory: "종합운", userQuestion: "전체적인 운세가 궁금합니다." },
    { date: "1990-04-26", time: "19:40", isLunar: false, gender: "M", birthCity: "광명", selectedCategory: "종합운", userQuestion: "전체적인 운세가 궁금합니다." },
    { date: "1990-12-02", time: "10:03", isLunar: false, gender: "F", birthCity: "서울", selectedCategory: "종합운", userQuestion: "전체적인 운세가 궁금합니다." }
];

async function runTests() {
    for (let i = 0; i < testCases.length; i++) {
        console.log(`\n=== Test Case ${i + 1} ===`);
        console.log(`Input: ${testCases[i].date} ${testCases[i].time} ${testCases[i].gender}`);
        try {
            const result = await prepareAnalysisData(testCases[i]);
            console.log("Pillars:", result.sajuRes.year.ganzhi, result.sajuRes.month.ganzhi, result.sajuRes.day.ganzhi, result.sajuRes.hour.ganzhi);
            console.log("Oohaeng (Corrected):", JSON.stringify(result.correctedPercentages));
            console.log("Sipsung (Corrected):", JSON.stringify(result.correctedSipsungCounts));
            console.log("Strength (Corrected):", JSON.stringify(result.correctedStrength));
        } catch (e) {
            console.error("Error:", e);
        }
    }
}

runTests();
