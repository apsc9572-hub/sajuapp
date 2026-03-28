import { calculateHighPrecisionSaju } from './src/lib/saju_calculator.ts';

const cases = [
    { label: "Case 1: 1990/04/26 19:40 Male (Gwangmyeong)", params: { year: 1990, month: 4, day: 26, hour: 19, minute: 40, gender: 'M' as const, isLunar: false, latitude: 37.47, longitude: 126.86 } },
    { label: "Case 2: 1990/12/02 10:03 Female (Seoul)", params: { year: 1990, month: 12, day: 2, hour: 10, minute: 3, gender: 'F' as const, isLunar: false, latitude: 37.56, longitude: 126.97 } },
    { label: "Case 3: 1964/02/25 18:10 Female (Daejeon, Lunar)", params: { year: 1964, month: 2, day: 25, hour: 18, minute: 10, gender: 'F' as const, isLunar: true, latitude: 36.35, longitude: 127.38 } }
];

console.log("=== MULTI-CASE DAEUN VERIFICATION ===\n");

cases.forEach(c => {
    try {
        const res = calculateHighPrecisionSaju(c.params);
        console.log(`[${c.label}]`);
        console.log(`Pillars: ${res.year.stemKo}${res.year.branchKo} / ${res.month.stemKo}${res.month.branchKo} / ${res.day.stemKo}${res.day.branchKo} / ${res.hour.stemKo}${res.hour.branchKo}`);
        console.log(`Daeun Number: ${res.daeun.startAge}`);
        console.log(`Sequence: ${res.daeun.cycles.slice(0, 5).map(cy => cy.ganzhi).join(' -> ')}`);
        console.log("-----------------------------------\n");
    } catch (e) {
        console.log(`Error in ${c.label}:`, e);
    }
});
