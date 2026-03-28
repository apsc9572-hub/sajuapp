import { calculateHighPrecisionSaju } from '../src/lib/saju_calculator';

const cityCoords: Record<string, { lat: number; lon: number }> = {
  "서울": { lat: 37.5665, lon: 126.9780 },
  "광명": { lat: 37.4786, lon: 126.8647 }, // Manual add for test
  "대전": { lat: 36.3504, lon: 127.3845 }
};

const testCases = [
  { name: "Case 1 (1990/04/26 19:40 M Gwangmyeong)", year: 1990, month: 4, day: 26, hour: 19, minute: 40, isLunar: false, gender: "M", city: "광명" },
  { name: "Case 2 (1991/01/13 03:10 M Seoul)", year: 1991, month: 1, day: 13, hour: 3, minute: 10, isLunar: false, gender: "M", city: "서울" },
  { name: "Case 3 (1990/10/16 10:03 F Seoul - Lunar)", year: 1990, month: 10, day: 16, hour: 10, minute: 3, isLunar: true, gender: "F", city: "서울" },
  { name: "Case 4 (1964/02/25 18:10 F Daejeon - Lunar)", year: 1964, month: 2, day: 25, hour: 18, minute: 10, isLunar: true, gender: "F", city: "대전" }
];

async function runTests() {
  for (const tc of testCases) {
    console.log(`\n--- ${tc.name} ---`);
    const coords = cityCoords[tc.city] || cityCoords["서울"];
    const res = await calculateHighPrecisionSaju({
      year: tc.year,
      month: tc.month,
      day: tc.day,
      hour: tc.hour,
      minute: tc.minute,
      latitude: coords.lat,
      longitude: coords.lon,
      isLunar: tc.isLunar,
      gender: tc.gender as "M" | "F"
    });
    
    console.log(`Pillars: ${res.year.stemKo}${res.year.branchKo} ${res.month.stemKo}${res.month.branchKo} ${res.day.stemKo}${res.day.branchKo} ${res.hour.stemKo}${res.hour.branchKo}`);
    console.log(`Daeun Start Age: ${res.daeun.startAge} (${res.daeun.direction === 'Forward' ? '순행' : '역행'})`);
    
    const pillars = ["year", "month", "day", "hour"];
    pillars.forEach(p => {
      const pillar = (res as any)[p];
      console.log(` [${p.toUpperCase()}] ${pillar.sinsals.join(", ")}`);
    });
  }
}

runTests().catch(console.error);
