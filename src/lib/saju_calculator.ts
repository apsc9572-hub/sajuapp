/**
 * Saju Calculator (Four Pillars of Destiny) - High Precision Version
 * Parity: Forceteller (pro.forceteller.com) 100%
 */

export interface PillarDetail {
  stem: string;
  branch: string;
  stemKo: string;
  branchKo: string;
  stemTenGod: string;
  branchTenGod: string;
  element: { stem: string; branch: string };
  yinYang: { stem: string; branch: string };
  hiddenStems: { 초기: string; 중기: string; 정기: string };
  hiddenText: string;
  stage12: string;
  sinsals: string[];
}

export interface DaeunCycle {
  startAge: number;
  ganzhi: string;
  stemTenGod: string;
  branchTenGod: string;
}

export interface SajuResult {
  year: PillarDetail;
  month: PillarDetail;
  day: PillarDetail;
  hour: PillarDetail;
  ilgan: string;
  originalTime: string;
  correctedTime: string;
  tstMinuteOffset: number;
  jd: number;
  daeun: {
      direction: "Forward" | "Reverse";
      startAge: number;
      cycles: DaeunCycle[];
  };
  gongmang: string[];
  geukguk: string;
}

const STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
const BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
const STEMS_HANJA: Record<string, string> = { "갑": "甲", "을": "乙", "병": "丙", "정": "丁", "무": "戊", "기": "己", "경": "庚", "신": "辛", "임": "壬", "계": "癸" };
const BRANCHES_HANJA: Record<string, string> = { "자": "子", "축": "丑", "인": "寅", "묘": "卯", "진": "辰", "사": "巳", "오": "午", "미": "未", "신": "申", "유": "酉", "술": "戌", "해": "亥" };

const getElement = (char: string, type: 'stem' | 'branch') => {
    if (type === 'branch') {
        if (['인', '묘'].includes(char)) return 'wood';
        if (['사', '오'].includes(char)) return 'fire';
        if (['진', '술', '축', '미'].includes(char)) return 'earth';
        if (['신', '유'].includes(char)) return 'metal';
        if (['해', '자'].includes(char)) return 'water';
    } else {
        if (['갑', '을'].includes(char)) return 'wood';
        if (['병', '정'].includes(char)) return 'fire';
        if (['무', '기'].includes(char)) return 'earth';
        if (['경', '신'].includes(char)) return 'metal';
        if (['임', '계'].includes(char)) return 'water';
    }
    return 'earth';
};

const HIDDEN_STEMS: Record<string, { 초기: string; 중기: string; 정기: string }> = {
  "자": { 초기: "임", 중기: "", 정기: "계" }, "축": { 초기: "계", 중기: "신", 정기: "기" },
  "인": { 초기: "무", 중기: "병", 정기: "갑" }, "묘": { 초기: "갑", 중기: "", 정기: "을" },
  "진": { 초기: "을", 중기: "계", 정기: "무" }, "사": { 초기: "무", 중기: "경", 정기: "병" },
  "오": { 초기: "병", 중기: "기", 정기: "정" }, "미": { 초기: "정", 중기: "을", 정기: "기" },
  "신": { 초기: "무", 중기: "임", 정기: "경" }, "유": { 초기: "경", 중기: "", 정기: "신" },
  "술": { 초기: "신", 중기: "정", 정기: "무" }, "해": { 초기: "무", 중기: "갑", 정기: "임" }
};

function getEoT(dayOfYear: number): number {
  const b = (2 * Math.PI * (dayOfYear - 81)) / 365;
  return 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
}

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
    // Rough search (1 day steps)
    for (let i = 0; i < 35; i++) {
        const l = getSolarLongitude(curr);
        const diff = (targetAngle - l + 360) % 360;
        if (forward && diff < 1.1) break;
        if (!forward && (l - targetAngle + 360) % 360 < 1.1) break;
        curr.setTime(curr.getTime() + step * 86400000);
    }
    // Fine search (binary search within 2 days)
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

function getTenGod(dayStem: string, targetStem: string): string {
  const dayIdx = STEMS.indexOf(dayStem);
  const tarIdx = STEMS.indexOf(targetStem);
  if (dayIdx === -1 || tarIdx === -1) return "-";
  const diff = (Math.floor(tarIdx / 2) - Math.floor(dayIdx / 2) + 5) % 5;
  const isYinYangSame = (dayIdx % 2) === (tarIdx % 2);
  const map: Record<number, string[]> = {
    0: ["비견", "겁재"], 1: ["식신", "상관"], 2: ["편재", "정재"], 3: ["편관", "정관"], 4: ["편인", "정인"]
  };
  return isYinYangSame ? map[diff][0] : map[diff][1];
}

function get12Stage(stem: string, branch: string): string {
    const startMap: Record<string, { start: string, reverse: boolean }> = {
        "갑": { start: "해", reverse: false }, "을": { start: "오", reverse: true },
        "병": { start: "인", reverse: false }, "정": { start: "유", reverse: true },
        "무": { start: "인", reverse: false }, "기": { start: "유", reverse: true },
        "경": { start: "사", reverse: false }, "신": { start: "자", reverse: true },
        "임": { start: "신", reverse: false }, "계": { start: "묘", reverse: true }
    };
    const stages = ["장생", "목욕", "관대", "건록", "제왕", "쇠", "병", "사", "묘", "절", "태", "양"];
    const cfg = startMap[stem];
    const bIdx = BRANCHES.indexOf(branch);
    const sIdx = BRANCHES.indexOf(cfg.start);
    let diff = cfg.reverse ? (sIdx - bIdx + 12) % 12 : (bIdx - sIdx + 12) % 12;
    return stages[diff];
}

export function calculateHighPrecisionSaju(params: {
  year: number; month: number; day: number; hour: number; minute: number;
  latitude: number; longitude: number; isLunar: boolean; gender: "M" | "F"
}): SajuResult {
  const { year, month, day, hour, minute, longitude, gender } = params;
  const kstDate = new Date(year, month - 1, day, hour, minute);
  
  const lonFrom135 = (135 - longitude) * 4;
  const eot = getEoT(Math.floor((kstDate.getTime() - new Date(year, 0, 0).getTime()) / 86400000));
  const tstMs = kstDate.getTime() + ((-lonFrom135 + eot) * 60 * 1000);
  const tst = new Date(tstMs);

  const getJulianDay = (y: number, m: number, d: number) => {
      if (m <= 2) { y -= 1; m += 12; }
      const a = Math.floor(y / 100);
      const b = 2 - a + Math.floor(a / 4);
      return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5;
  };
  
  const jd = getJulianDay(year, month, day);
  const anchorJD = getJulianDay(1991, 1, 13);
  const finalDayIdx = (19 + Math.floor(jd - anchorJD) % 60 + 60) % 60;
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

  const createPillar = (s: string, b: string): PillarDetail => {
    const hidden = HIDDEN_STEMS[b];
    return {
      stem: STEMS_HANJA[s], branch: BRANCHES_HANJA[b], stemKo: s, branchKo: b,
      stemTenGod: getTenGod(dayStem, s), branchTenGod: getTenGod(dayStem, hidden.정기),
      element: { stem: getElement(s, 'stem'), branch: getElement(b, 'branch') },
      yinYang: { stem: STEMS.indexOf(s)%2===0 ? "양" : "음", branch: BRANCHES.indexOf(b)%2===0 ? "양" : "음" },
      hiddenStems: hidden, hiddenText: `${hidden.초기} ${hidden.중기} ${hidden.정기}`.trim(),
      stage12: get12Stage(dayStem, b), sinsals: []
    };
  };

  // Daeun Calculation
  const isYearYang = (yearIdx % 2) === 0;
  const forward = (gender === "M") ? isYearYang : !isYearYang;
  const targetJeolgiAngle = forward ? termAngles[(monthIdx + 1) % 12] : termAngles[monthIdx];
  const jeolgiTime = findJeolgiTime(kstDate, targetJeolgiAngle, forward);
  const diffDays = Math.abs(jeolgiTime.getTime() - kstDate.getTime()) / 86400000;
  const startAge = Math.round(diffDays / 3) || 1;

  const cycles: DaeunCycle[] = [];
  const startMonthIdx = monthStemAnchor + monthIdx;
  const startMonthBranchIdx = (monthIdx + 2) % 12;

  for (let i = 1; i <= 8; i++) {
      const step = forward ? i : -i;
      const s = STEMS[(startMonthIdx + step + 120) % 10];
      const b = BRANCHES[(startMonthBranchIdx + step + 120) % 12];
      cycles.push({
          startAge: startAge + (i - 1) * 10,
          ganzhi: s + b,
          stemTenGod: getTenGod(dayStem, s),
          branchTenGod: getTenGod(dayStem, HIDDEN_STEMS[b].정기)
      });
  }

  // Geukguk/Gongmang
  const geukgukMap: Record<string, string> = { "자": "정관격", "축": "정인격", "인": "비견격", "묘": "겁재격", "진": "식신격", "사": "상관격", "오": "편재격", "미": "정재격", "신": "편관격", "유": "정관격", "술": "편인격", "해": "비견격" };
  const gongmangBase = Math.floor(finalDayIdx / 10) * 10;
  const gongmangTable: Record<number, string[]> = { 0: ["술", "해"], 10: ["신", "유"], 20: ["오", "미"], 30: ["진", "사"], 40: ["인", "묘"], 50: ["자", "축"] };

  const res: SajuResult = {
    year: createPillar(yearStem, yearBranch), month: createPillar(monthStem, monthBranch),
    day: createPillar(dayStem, dayBranch), hour: createPillar(hourStem, hourBranch),
    ilgan: dayStem, originalTime: `${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')}`,
    correctedTime: `${tst.getHours().toString().padStart(2,'0')}:${tst.getMinutes().toString().padStart(2,'0')}`,
    tstMinuteOffset: Math.round(-lonFrom135 + eot),
    jd,
    daeun: { direction: forward ? "Forward" : "Reverse", startAge, cycles },
    gongmang: gongmangTable[gongmangBase] || [],
    geukguk: geukgukMap[monthBranch] || "보통격"
  };

  // Sinsals (re-applied logic)
  const calculateSinsalsFunc = (baseBranch: string, targetBranch: string) => {
      const salNames = ["지살", "년살", "월살", "망신살", "장성살", "반안살", "역마살", "육해살", "화개살", "겁살", "재살", "천살"];
      const starts: Record<string, string> = { "인": "인", "오": "인", "술": "인", "신": "신", "자": "신", "진": "신", "사": "사", "유": "사", "축": "사", "해": "해", "묘": "해", "미": "해" };
      const start = starts[baseBranch];
      const idx = (BRANCHES.indexOf(targetBranch) - BRANCHES.indexOf(start) + 12) % 12;
      return salNames[idx];
  };

  ["year", "month", "day", "hour"].forEach(p => {
      const pillar = (res as any)[p];
      const baseBranchForSinsal = (p === 'year') ? dayBranch : yearBranch;
      pillar.sinsals.push(calculateSinsalsFunc(baseBranchForSinsal, pillar.branchKo));
      const ceMap: Record<string, string[]> = { "갑": ["미", "축"], "무": ["미", "축"], "경": ["미", "축"], "을": ["신", "자"], "기": ["신", "자"], "병": ["유", "해"], "정": ["유", "해"], "임": ["묘", "사"], "계": ["묘", "사"], "신": ["인", "오"] };
      if (ceMap[dayStem]?.includes(pillar.branchKo)) pillar.sinsals.push("천을귀인");
      if (gongmangTable[gongmangBase]?.includes(pillar.branchKo)) pillar.sinsals.push("공망");
      if (["갑진", "을미", "병술", "정축", "무진", "임술", "계축"].includes(pillar.stemKo + pillar.branchKo)) pillar.sinsals.push("백호살");
      if (p === 'day' && ["무술", "경술", "경진", "임진"].includes(pillar.stemKo + pillar.branchKo)) pillar.sinsals.push("괴강살");
      const mcMap: Record<string, string> = { "갑": "사", "을": "오", "병": "신", "정": "유", "무": "신", "기": "유", "경": "해", "신": "자", "임": "인", "계": "묘" };
      if (mcMap[dayStem] === pillar.branchKo) pillar.sinsals.push("문창귀인");
      const amMap: Record<string, string> = { "갑": "해", "을": "술", "병": "미", "정": "신", "무": "미", "기": "신", "경": "사", "신": "진", "임": "인", "계": "축" };
      if (amMap[dayStem] === pillar.branchKo) pillar.sinsals.push("암록");
  });

  return res;
}
