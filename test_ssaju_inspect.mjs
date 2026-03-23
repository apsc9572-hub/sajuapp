import { calculateSaju } from "ssaju";

const res = calculateSaju({
  year: 1990,
  month: 4,
  day: 26,
  hour: 10,
  minute: 30,
  calendar: "solar",
  gender: "남"
});

console.log("--- Daeun ---");
console.log(JSON.stringify(res.daeun.list[0], null, 2));

console.log("--- Seyun (Yearly) ---");
console.log(JSON.stringify(res.seyun.find(s => s.year === 2026), null, 2));

console.log("--- Advanced (Sinsal, etc) ---");
console.log(JSON.stringify(res.advanced, null, 2));
