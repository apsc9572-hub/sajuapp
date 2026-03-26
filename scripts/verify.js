const STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
const BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
const STEMS_HANJA = { "갑": "甲", "을": "乙", "병": "丙", "정": "丁", "무": "戊", "기": "己", "경": "庚", "신": "辛", "임": "壬", "계": "癸" };
const BRANCHES_HANJA = { "자": "子", "축": "丑", "인": "寅", "묘": "卯", "진": "辰", "사": "巳", "오": "午", "미": "未", "신": "申", "유": "酉", "술": "戌", "해": "亥" };

function getEoT(dayOfYear) {
  const b = (2 * Math.PI * (dayOfYear - 81)) / 365;
  return 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
}

function getSolarLongitude(date) {
  const ms = date.getTime();
  const d = (ms / 86400000) - (new Date("2000-01-01T12:00:00Z").getTime() / 86400000);
  const g = (357.529 + 0.98560028 * d) % 360;
  const q = (280.459 + 0.98564736 * d) % 360;
  const l = (q + 1.915 * Math.sin(g * Math.PI / 180) + 0.02 * Math.sin(2 * g * Math.PI / 180)) % 360;
  return (l + 360) % 360;
}

function calculate(params) {
  const { year, month, day, hour, minute, longitude } = params;
  const kstDate = new Date(year, month - 1, day, hour, minute);
  const lonFrom135 = (135 - longitude) * 4;
  const eot = getEoT(Math.floor((kstDate.getTime() - new Date(year, 0, 0).getTime()) / 86400000));
  const tstMs = kstDate.getTime() + ((-lonFrom135 + eot) * 60 * 1000);
  const tst = new Date(tstMs);

  const getJulianDay = (y, m, d) => {
      if (m <= 2) { y -= 1; m += 12; }
      const a = Math.floor(y / 100);
      const b = 2 - a + Math.floor(a / 4);
      return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5;
  };
  
  const jd = getJulianDay(year, month, day);
  const anchorJD = getJulianDay(1991, 1, 13);
  const finalDayIdx = (18 + Math.floor(jd - anchorJD) % 60 + 60) % 60;
  const dayStem = STEMS[finalDayIdx % 10];
  const dayBranch = BRANCHES[finalDayIdx % 12];

  const solarL = getSolarLongitude(kstDate);
  const termAngles = [315, 345, 15, 45, 75, 105, 135, 165, 195, 225, 255, 285];
  let monthIdx = termAngles.findIndex((a, i) => {
      const nextA = termAngles[(i + 1) % 12];
      if (a > nextA) return solarL >= a || solarL < nextA;
      return solarL >= a && solarL < nextA;
  });
  if (monthIdx === -1) monthIdx = 11;

  let sYear = year;
  if (solarL < 315 && month <= 2) sYear -= 1;
  const yearIdx = (sYear - 4 + 60) % 60;
  const yearStem = STEMS[yearIdx % 10];
  const yearBranch = BRANCHES[yearIdx % 12];

  const monthStemAnchor = (yearIdx % 5) * 2 + 2;
  const monthStem = STEMS[(monthStemAnchor + monthIdx) % 10];
  const monthBranch = BRANCHES[(monthIdx + 2) % 12];

  const hourTotalMin = tst.getHours() * 60 + tst.getMinutes();
  const hourBranchIdx = Math.floor((hourTotalMin + 60) % 1440 / 120);
  const hourStemAnchor = (finalDayIdx % 5) * 2;
  const hourStem = STEMS[(hourStemAnchor + hourBranchIdx) % 10];
  const hourBranch = BRANCHES[hourBranchIdx];

  return {
    year: yearStem + yearBranch,
    month: monthStem + monthBranch,
    day: dayStem + dayBranch,
    hour: hourStem + hourBranch,
    tst: tst.toTimeString().split(' ')[0],
    offset: Math.round(-lonFrom135 + eot)
  };
}

const testCase = { year: 1991, month: 1, day: 13, hour: 3, minute: 10, longitude: 126.9780 };
console.log(JSON.stringify(calculate(testCase), null, 2));
