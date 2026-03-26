import { getUnifiedSaju } from "./src/lib/unified-saju";

const testCases = [
  {
    name: "1990-04-26 19:40 Male Gwangmyeong",
    params: { date: "1990-04-26", time: "19:40", isLunar: false, gender: "M", birthCity: "광명" },
    expected: { year: "경오", month: "경진", day: "신유", hour: "무술" }
  },
  {
    name: "1991-01-13 03:10 Male Seoul",
    params: { date: "1991-01-13", time: "03:10", isLunar: false, gender: "M", birthCity: "서울" },
    expected: { year: "경오", month: "기축", day: "경오", hour: "무인" }
  },
  {
    name: "1990-12-02 10:03 Female Seoul",
    params: { date: "1990-12-02", time: "10:03", isLunar: false, gender: "F", birthCity: "서울" },
    expected: { year: "경오", month: "정해", day: "신미", hour: "계사" }
  }
];

const HANJA_TO_KR: Record<string, string> = {
  '甲':'갑','乙':'을','丙':'병','丁':'정','戊':'무','己':'기','庚':'경','辛':'신','壬':'임','癸':'계',
  '子':'자','丑':'축','寅':'인','卯':'묘','辰':'진','巳':'사','午':'오','未':'미','申':'신','酉':'유','戌':'술','亥':'해'
};

const toKr = (s: string) => s.split('').map(c => HANJA_TO_KR[c] ?? c).join('');

console.log("=== Saju High-Precision Engine Verification ===\n");

testCases.forEach(tc => {
  try {
    const res = getUnifiedSaju(tc.params as any);
    const actual = {
      year: toKr(res.pillarDetails.year.stem + res.pillarDetails.year.branch),
      month: toKr(res.pillarDetails.month.stem + res.pillarDetails.month.branch),
      day: toKr(res.pillarDetails.day.stem + res.pillarDetails.day.branch),
      hour: toKr(res.pillarDetails.hour.stem + res.pillarDetails.hour.branch)
    };

    console.log(`Test: ${tc.name}`);
    console.log(`Expected: ${tc.expected.year} ${tc.expected.month} ${tc.expected.day} ${tc.expected.hour}`);
    console.log(`Actual:   ${actual.year} ${actual.month} ${actual.day} ${actual.hour}`);

    const match = JSON.stringify(actual) === JSON.stringify(tc.expected);
    console.log(`Result:   ${match ? "✅ PASS" : "❌ FAIL"}\n`);
  } catch (err) {
    console.log(`Test: ${tc.name} - ❌ ERROR: ${err}\n`);
  }
});
