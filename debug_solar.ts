function getSolarLongitude(date: Date): number {
  const ms = date.getTime();
  const d = (ms / 86400000) - (new Date("2000-01-01T12:00:00Z").getTime() / 86400000);
  let L = (280.46607 + 0.985647366 * d) % 360;
  let g = (357.52911 + 0.985600281 * d) * (Math.PI / 180);
  let lambda = L + 1.91466 * Math.sin(g) + 0.01990 * Math.sin(2 * g);
  return (lambda + 360) % 360;
}

const birth = new Date(1991, 0, 13, 3, 10);
const lon = getSolarLongitude(birth);
console.log(`Solar Longitude for 1991-01-13: ${lon}`);

const termAngles = [315, 345, 15, 45, 75, 105, 135, 165, 195, 225, 255, 285];
let monthIdx = termAngles.findIndex((a, i) => {
    const nextA = termAngles[(i + 1) % 12];
    if (a > nextA) return lon >= a || lon < nextA;
    return lon >= a && lon < nextA;
});
console.log(`Month Index: ${monthIdx}`);
// 11 is Chuk, 0 is In (Wait, in our code 11 is Dec/Chuk)
// Let's check the result of findJeolgiTime
function findJeolgiTime(startDate: Date, targetAngle: number, forward: boolean): Date {
    let curr = new Date(startDate);
    const step = forward ? 1 : -1;
    for (let i = 0; i < 32; i++) {
        const l = getSolarLongitude(curr);
        const diff = (targetAngle - l + 360) % 360;
        if (forward && diff < 1.5) break; 
        if (!forward && (l - targetAngle + 360) % 360 < 1.5) break;
        curr.setTime(curr.getTime() + step * 86400000);
    }
    let left = curr.getTime() - 86400000 * 2;
    let right = curr.getTime() + 86400000 * 2;
    for (let i = 0; i < 25; i++) {
        const mid = (left + right) / 2;
        const l = getSolarLongitude(new Date(mid));
        const diff = (l - targetAngle + 360) % 360;
        if (diff < 180) left = mid; else right = mid;
    }
    return new Date((left + right) / 2);
}

const nextNode = findJeolgiTime(birth, 315, true);
console.log(`Next Node (Ipchun): ${nextNode.toLocaleString()}`);
const diff = Math.abs(nextNode.getTime() - birth.getTime()) / 86400000;
console.log(`Diff: ${diff}`);
console.log(`StartAge: ${Math.round(diff/3)}`);
