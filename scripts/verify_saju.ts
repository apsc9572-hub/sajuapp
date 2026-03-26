import { calculateHighPrecisionSaju } from './src/lib/saju_calculator';

const testCase = {
  year: 1991, month: 1, day: 13, hour: 3, minute: 10,
  latitude: 37.5665, longitude: 126.9780, // Seoul
  isLunar: false, gender: "M" as const
};

const result = calculateHighPrecisionSaju(testCase);

console.log("=== Saju Calculation Verification (1991-01-13 03:10 Seoul) ===");
console.log(`Original Time: ${result.originalTime}`);
console.log(`Corrected Time (TST): ${result.correctedTime} (Offset: ${result.tstMinuteOffset} min)`);
console.log("");
console.log("Pillars (Saju):");
console.log(`Year:  ${result.year.stemKo}${result.year.branchKo} (${result.year.stem}${result.year.branch})`);
console.log(`Month: ${result.month.stemKo}${result.month.branchKo} (${result.month.stem}${result.month.branch})`);
console.log(`Day:   ${result.day.stemKo}${result.day.branchKo} (${result.day.stem}${result.day.branch})`);
console.log(`Hour:  ${result.hour.stemKo}${result.hour.branchKo} (${result.hour.stem}${result.hour.branch})`);
console.log("");
console.log("Sinsal Check:");
console.log(`Year Sinsal:  ${result.year.sinsals.join(", ")}`);
console.log(`Month Sinsal: ${result.month.sinsals.join(", ")}`);
console.log(`Day Sinsal:   ${result.day.sinsals.join(", ")}`);
console.log(`Hour Sinsal:  ${result.hour.sinsals.join(", ")}`);
