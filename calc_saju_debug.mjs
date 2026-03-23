
import { calculateSaju } from 'ssaju';

const year = 1990;
const month = 4;
const day = 26;
const hour = 19;
const min = 40;
const offsetMin = -32;

const totalMinutes = hour * 60 + min + offsetMin;
let correctedDay = day;
let correctedHour = Math.floor(((totalMinutes % 1440) + 1440) % 1440 / 60);
let correctedMin = ((totalMinutes % 60) + 60) % 60;
if (totalMinutes < 0) correctedDay = day - 1;
if (totalMinutes >= 1440) correctedDay = day + 1;

console.log(`Original: ${year}-${month}-${day} ${hour}:${min}`);
console.log(`Corrected: ${year}-${month}-${correctedDay} ${correctedHour}:${correctedMin}`);

try {
  const sajuRes = calculateSaju({
    year, month, day: correctedDay, hour: correctedHour, minute: correctedMin,
    calendar: "solar"
  });
  console.log("Pillars:", sajuRes.pillarDetails.year.ganzhi, sajuRes.pillarDetails.month.ganzhi, sajuRes.pillarDetails.day.ganzhi, sajuRes.pillarDetails.hour.ganzhi);
  console.log("Day Master:", sajuRes.pillarDetails.day.stem);
} catch (e) {
  console.error(e);
}
