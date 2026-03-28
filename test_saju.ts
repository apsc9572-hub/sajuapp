import { calculateHighPrecisionSaju } from './src/lib/saju_calculator.ts';

const cases = [
  { name: "1991년 01월 13일 03:10 남자 (서울 기준)", year: 1991, month: 1, day: 13, hour: 3, minute: 10, isLunar: false, gender: 'M', lon: 126.97 }
];

cases.forEach(c => {
  const res = calculateHighPrecisionSaju({
    year: c.year, month: c.month, day: c.day, hour: c.hour, minute: c.minute,
    latitude: 37.56, longitude: c.lon, isLunar: c.isLunar, gender: c.gender as 'M' | 'F'
  });
  console.log(`\n### [${c.name} 대운 상세]`);
  console.log(`대운수 (Daeun Number): ${res.daeun.startAge}`);
  console.log(`현재 나이 (Korean): ${2026 - c.year + 1}`);
  console.log(`방향: ${res.daeun.direction === 'Forward' ? '순행' : '역행'}`);
  res.daeun.cycles.forEach((d: any, i: number) => {
    console.log(`${i+1}대운: ${d.startAge}세~${d.startAge+9}세 (${d.ganzhi})`);
  });
});
