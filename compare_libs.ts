import { calculateHighPrecisionSaju } from './src/lib/saju_calculator.ts';
import * as manseryeok from 'manseryeok';
import ssaju from 'ssaju';

const params = { year: 1991, month: 1, day: 13, hour: 3, minute: 10, isLunar: false, gender: 'M' as const };

console.log("=== COMPARISON FOR 1991-01-13 03:10 MALE ===");

// 1. Our Current Calculator
try {
  const res = calculateHighPrecisionSaju({...params, latitude: 37.5, longitude: 126.97});
  console.log(`\n[Our Calculator]`);
  console.log(`Daeun Number: ${res.daeun.startAge}`);
  console.log(`3rd: ${res.daeun.cycles[2].startAge}세 (${res.daeun.cycles[2].ganzhi})`);
  console.log(`4th: ${res.daeun.cycles[3].startAge}세 (${res.daeun.cycles[3].ganzhi})`);
} catch(e) { console.log("Our calc failed", e); }

// 2. ssaju
import { calculateSaju } from 'ssaju';
try {
  const res = calculateSaju({
    year: params.year, month: params.month, day: params.day, 
    hour: params.hour, minute: params.minute, 
    gender: params.gender === 'M' ? '남' : '여',
    calendar: 'solar'
  });
  console.log(`[ssaju]`);
  console.log(`Daeun Number: ${res.daeun.startAge}`);
  console.log(`Diff Days: ${res.daeun.basis.diffDays}`);
  console.log(`3rd: ${res.daeun.list[2].startAge}세 (${res.daeun.list[2].ganzhi})`);
  console.log(`4th: ${res.daeun.list[3].startAge}세 (${res.daeun.list[3].ganzhi})`);
} catch(e) { console.log("ssaju failed", e); }

// 3. manseryeok
try {
  // Need to check manseryeok API. Based on common patterns:
  // If it's the one I found online:
  // @ts-ignore
  const result = manseryeok.calculateFourPillars(params);
  console.log(`\n[manseryeok]`);
  console.log(`Pillars: ${JSON.stringify(result.toObject())}`);
} catch(e) { console.log("manseryeok failed"); }
