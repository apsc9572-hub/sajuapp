import { calculateHighPrecisionSaju } from './src/lib/saju_calculator.js';

const testCases = [
  { name: "Case 1: 1990/04/26 19:40 Male Gwangmyeong", year: 1990, month: 4, day: 26, hour: 19, minute: 40, gender: "M", isLunar: false, lon: 126.86 },
  { name: "Case 2: 1990/12/02 10:03 Female Seoul", year: 1990, month: 12, day: 2, hour: 10, minute: 3, gender: "F", isLunar: false, lon: 126.97 },
  { name: "Case 3: 1964/02/25 18:10 Female Daejeon (Lunar)", year: 1964, month: 2, day: 25, hour: 18, minute: 10, gender: "F", isLunar: true, lon: 127.38 }
];

console.log("=== SAJU SINSAL/GILSUNG VERIFICATION ===\n");

testCases.forEach(tc => {
  const res = calculateHighPrecisionSaju({
    year: tc.year, month: tc.month, day: tc.day, hour: tc.hour, minute: tc.minute,
    latitude: 37.5, longitude: tc.lon, isLunar: tc.isLunar, gender: tc.gender
  });

  console.log(`[${tc.name}]`);
  ["year", "month", "day", "hour"].forEach(p => {
    const pillar = res[p];
    console.log(`${p.toUpperCase()}: ${pillar.stemKo}${pillar.branchKo} (${pillar.stem}${pillar.branch})`);
    console.log(`  Stem Sinsals  : ${pillar.stemSinsals.join(", ") || "-"}`);
    console.log(`  Branch Sinsals: ${pillar.branchSinsals.join(", ") || "-"}`);
    console.log(`  Combined      : ${pillar.sinsals.join(", ") || "-"}`);
  });
  console.log("-" .repeat(40));
});
