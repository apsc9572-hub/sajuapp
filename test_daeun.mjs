import { calculateSaju } from "ssaju";

const maleResult = calculateSaju({
  year: 1990, month: 4, day: 26, hour: 19, minute: 40,
  gender: "남",
  calendar: "solar"
});

const femaleResult = calculateSaju({
  year: 1990, month: 4, day: 26, hour: 19, minute: 40,
  gender: "여",
  calendar: "solar"
});

console.log("Male Direction:", maleResult.daeun.basis.direction);
console.log("Male Daeun List (first 3):", maleResult.daeun.list.slice(0, 3).map(d => d.ganzhi));

console.log("\nFemale Direction:", femaleResult.daeun.basis.direction);
console.log("Female Daeun List (first 3):", femaleResult.daeun.list.slice(0, 3).map(d => d.ganzhi));
