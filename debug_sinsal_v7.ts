import { calculateHighPrecisionSaju } from './src/lib/saju_calculator.ts';

const params = { year: 1990, month: 4, day: 26, hour: 19, minute: 40, gender: 'M' as const, isLunar: false, latitude: 37.47, longitude: 126.86 };

console.log("=== SINSAL DEBUG FOR 1990/04/26 19:40 MALE ===");

const res = calculateHighPrecisionSaju(params);

console.log(`Ilgan: [${res.ilgan}]`);

["year", "month", "day", "hour"].forEach(p => {
    const pillar: any = (res as any)[p];
    console.log(`\n[${p}] Pillar: ${pillar.stemKo}${pillar.branchKo}`);
    console.log(`Sinsals: ${pillar.sinsals.join(', ')}`);
    console.log(`Stem Sinsals: ${pillar.stemSinsals.join(', ')}`);
    console.log(`Branch Sinsals: ${pillar.branchSinsals.join(', ')}`);
});
