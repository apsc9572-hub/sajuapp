import { calculateHighPrecisionSaju } from './src/lib/saju_calculator.ts';

// We can't easily see internal variables, so let's use the actual solar longitude logic
function getSolarLongitude(date: Date): number {
  const ms = date.getTime();
  const d = (ms / 86400000) - (new Date("2000-01-01T12:00:00Z").getTime() / 86400000);
  const g = (357.529 + 0.98560028 * d) % 360;
  const q = (280.459 + 0.98564736 * d) % 360;
  const l = (q + 1.915 * Math.sin(g * Math.PI / 180) + 0.02 * Math.sin(2 * g * Math.PI / 180)) % 360;
  return (l + 360) % 360;
}

function findJeolgiTime(startDate: Date, targetAngle: number, forward: boolean): Date {
    let curr = new Date(startDate);
    const step = forward ? 1 : -1;
    for (let i = 0; i < 35; i++) {
        const l = getSolarLongitude(curr);
        const diff = (targetAngle - l + 360) % 360;
        if (forward && diff < 1.1) break;
        if (!forward && (l - targetAngle + 360) % 360 < 1.1) break;
        curr.setTime(curr.getTime() + step * 86400000);
    }
    let left = curr.getTime() - 86400000 * 2;
    let right = curr.getTime() + 86400000 * 2;
    for (let i = 0; i < 20; i++) {
        const mid = (left + right) / 2;
        const l = getSolarLongitude(new Date(mid));
        const diff = (l - targetAngle + 360) % 360;
        if (diff < 180) left = mid; else right = mid;
    }
    return new Date((left + right) / 2);
}

const birth = new Date(1991, 0, 13, 3, 10);
const nextNode = findJeolgiTime(birth, 315, true); 

console.log(`Birth: ${birth.toLocaleString()}`);
console.log(`Node (Ipchun): ${nextNode.toLocaleString()}`);
const diff = Math.abs(nextNode.getTime() - birth.getTime()) / 86400000;
console.log(`Diff Days: ${diff}`);
console.log(`Start Age (Round): ${Math.round(diff/3)}`);
