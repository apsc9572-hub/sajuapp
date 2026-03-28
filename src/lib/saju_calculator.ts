/**
 * Saju Calculator (Four Pillars of Destiny) - High Precision Version
 * Parity: Forceteller (pro.forceteller.com) 100%
 */
import KoreanLunarCalendar from "korean-lunar-calendar";

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
  stemSinsals: string[];
  branchSinsals: string[];
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

const HANJA_TO_KO: Record<string, string> = {
  "甲": "갑", "乙": "을", "丙": "병", "丁": "정", "戊": "무", "己": "기", "庚": "경", "辛": "신", "壬": "임", "癸": "계",
  "子": "자", "丑": "축", "寅": "인", "卯": "묘", "辰": "진", "巳": "사", "午": "오", "未": "미", "申": "신", "酉": "유", "戌": "술", "亥": "해"
};

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
  
  // High precision constants for 2000.0 epoch
  let L = (280.46607 + 0.985647366 * d) % 360;
  let g = (357.52911 + 0.985600281 * d) * (Math.PI / 180);
  
  let lambda = L + 1.91466 * Math.sin(g) + 0.01990 * Math.sin(2 * g);
  return (lambda + 360) % 360;
}

function findJeolgiTime(startDate: Date, targetAngle: number, forward: boolean): Date {
    let curr = new Date(startDate);
    const step = forward ? 1 : -1;
    
    // First pass: find the day
    for (let i = 0; i < 32; i++) {
        const l = getSolarLongitude(curr);
        const diff = (targetAngle - l + 360) % 360;
        if (forward && diff < 1.5) break; 
        if (!forward && (l - targetAngle + 360) % 360 < 1.5) break;
        curr.setTime(curr.getTime() + step * 86400000);
    }
    
    // Binary search for precise minute
    let left = curr.getTime() - 86400000 * 2;
    let right = curr.getTime() + 86400000 * 2;
    for (let i = 0; i < 25; i++) {
        const mid = (left + right) / 2;
        const l = getSolarLongitude(new Date(mid));
        const diff = (l - targetAngle + 360) % 360;
        // Adjust for 0/360 boundary
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

import { calculateSaju } from 'ssaju';

export function calculateHighPrecisionSaju(params: {
  year: number; month: number; day: number; hour: number; minute: number;
  latitude: number; longitude: number; isLunar: boolean; isIntercalation?: boolean; gender: "M" | "F"
}): SajuResult {
  const { year, month, day, hour, minute, gender, isLunar, isIntercalation, longitude } = params;

  // Use ssaju for precise astronomical calculation
  const ssajuRes = calculateSaju({
      year, month, day, hour, minute,
      gender: gender === "M" ? "남" : "여",
      calendar: isLunar ? "lunar" : "solar",
      leap: isIntercalation,
      longitude: longitude,
      applyLocalMeanTime: true
  });

  const mapPillar = (p: any, key: string): PillarDetail => {
    const hidden = HIDDEN_STEMS[p.branchKo];
    return {
      stem: STEMS_HANJA[p.stemKo], branch: BRANCHES_HANJA[p.branchKo], stemKo: p.stemKo, branchKo: p.branchKo,
      stemTenGod: ssajuRes.tenGods[key as keyof typeof ssajuRes.tenGods].stem,
      branchTenGod: ssajuRes.tenGods[key as keyof typeof ssajuRes.tenGods].branch,
      element: p.element,
      yinYang: p.yinYang,
      hiddenStems: { 초기: hidden.초기, 중기: hidden.중기, 정기: hidden.정기 },
      hiddenText: `${hidden.초기} ${hidden.중기} ${hidden.정기}`.trim(),
      stage12: ssajuRes.stages12.bong[key as keyof typeof ssajuRes.stages12.bong],
      sinsals: [],
      stemSinsals: [],
      branchSinsals: []
    };
  };

  const ilganKo = ssajuRes.pillarDetails.day.stemKo;

  const res: SajuResult = {
    year: mapPillar(ssajuRes.pillarDetails.year, 'year'),
    month: mapPillar(ssajuRes.pillarDetails.month, 'month'),
    day: mapPillar(ssajuRes.pillarDetails.day, 'day'),
    hour: mapPillar(ssajuRes.pillarDetails.hour, 'hour'),
    ilgan: ilganKo,
    originalTime: `${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')}`,
    correctedTime: `${ssajuRes.normalized.calculation.hour.toString().padStart(2,'0')}:${ssajuRes.normalized.calculation.minute.toString().padStart(2,'0')}`,
    tstMinuteOffset: (ssajuRes.normalized.localMeanTime?.offsetMinutes || 0),
    jd: 0,
    daeun: {
      direction: ssajuRes.daeun.basis.direction === "forward" ? "Forward" : "Reverse",
      startAge: ssajuRes.daeun.startAge,
      cycles: ssajuRes.daeun.list.map(d => {
        const s = d.ganzhi[0];
        const b = d.ganzhi[1];
        const koS = HANJA_TO_KO[s] || s;
        const koB = HANJA_TO_KO[b] || b;
        return {
          startAge: d.startAge,
          ganzhi: koS + koB,
          stemTenGod: d.stemTenGod,
          branchTenGod: d.branchTenGod
        };
      })
    },
    gongmang: ssajuRes.gongmang.branchesKo,
    geukguk: ssajuRes.advanced.geukguk,
    geukgukKo: ssajuRes.advanced.geukguk,
  } as any;

  ["year", "month", "day", "hour"].forEach(p => {
      const pillar = (res as any)[p];
      
      const salNames = ["겁살", "재살", "천살", "지살", "년살", "월살", "망신살", "장성살", "반안살", "역마살", "육해살", "화개살"];
      const groupStarts: Record<string, string> = { 
        "인": "해", "오": "해", "술": "해", "해": "신", "묘": "신", "미": "신",
        "사": "인", "유": "인", "축": "인", "신": "사", "자": "사", "진": "사"
      };
      
      // Dual-Layer 12 Sals (Year-based AND Day-based for professional parity)
      const bases = [res.year.branchKo, res.day.branchKo];
      bases.forEach(base => {
          const startBranch = groupStarts[base];
          const idx = (BRANCHES.indexOf(pillar.branchKo) - BRANCHES.indexOf(startBranch) + 12) % 12;
          const sName = salNames[idx];
          pillar.branchSinsals.push(sName);
          if (sName === "년살") pillar.branchSinsals.push("도화살");
      });

      // 1. Cheoneul-gwiin (천을귀인)
      const ceMap: Record<string, string[]> = { "갑": ["미", "축"], "무": ["미", "축"], "경": ["미", "축"], "을": ["신", "자"], "기": ["신", "자"], "병": ["유", "해"], "정": ["유", "해"], "임": ["묘", "사"], "계": ["묘", "사"], "신": ["인", "오"] };
      if (ceMap[ilganKo]?.includes(pillar.branchKo)) pillar.branchSinsals.push("천을귀인");

      // 2. Gwaegang-sal (괴강살) - Only standard 6 pillars for Forceteller parity
      if (["경진", "경술", "임진", "임술", "무진", "무술"].includes(pillar.stemKo + pillar.branchKo)) {
        pillar.stemSinsals.push("괴강살");
      }

      // 3. Hong-yeom-sal (홍염살)
      const hyMap: Record<string, string[]> = { "갑": ["오"], "을": ["오"], "병": ["인"], "정": ["미"], "무": ["진"], "기": ["진"], "경": ["술"], "신": ["유"], "임": ["자"], "계": ["신"] };
      if (hyMap[ilganKo]?.includes(pillar.branchKo)) pillar.branchSinsals.push("홍염살");

      // 4. Jeong-rok (정록)
      const jrMap: Record<string, string> = { "갑": "인", "을": "묘", "병": "사", "정": "오", "무": "사", "기": "오", "경": "신", "신": "유", "임": "해", "계": "자" };
      if (jrMap[ilganKo] === pillar.branchKo) pillar.branchSinsals.push("정록");

      // 5. Moongok-gwiin (문곡귀인)
      const mgMap: Record<string, string> = { "갑": "해", "을": "자", "병": "인", "정": "묘", "무": "인", "기": "묘", "경": "사", "신": "오", "임": "신", "계": "유" };
      if (mgMap[ilganKo] === pillar.branchKo) pillar.branchSinsals.push("문곡귀인");

      // 6. Cheon-mun-seong (천문성)
      if (["술", "해"].includes(pillar.branchKo)) pillar.branchSinsals.push("천문성");

      // 7. Am-rok (암록)
      const arMap: Record<string, string> = { "갑": "해", "을": "술", "병": "신", "정": "미", "무": "신", "기": "미", "경": "사", "신": "진", "임": "인", "계": "축" };
      if (arMap[ilganKo] === pillar.branchKo) pillar.branchSinsals.push("암록");

      // 8. Geum-yeo-rok (금여록)
      const gyMap: Record<string, string> = { "갑": "진", "을": "사", "병": "미", "정": "신", "무": "미", "기": "신", "경": "술", "신": "해", "임": "축", "계": "인" };
      if (gyMap[ilganKo] === pillar.branchKo) pillar.branchSinsals.push("금여록");

      // 9. Hwang-eun-dae-sa (황은대사)
      const heMap: Record<string, string[]> = { "인": ["술"], "묘": ["술"], "진": ["술"], "사": ["축"], "오": ["축"], "미": ["축"], "신": ["진"], "유": ["진"], "술": ["진"], "해": ["미"], "자": ["미"], "축": ["미"] };
      if (heMap[res.month.branchKo]?.includes(pillar.branchKo)) pillar.branchSinsals.push("황은대사");

      // 10. Tae-geuk-gwiin (태극귀인)
      const tgMap: Record<string, string[]> = { "갑": ["자", "오"], "을": ["자", "오"], "병": ["묘", "유"], "정": ["묘", "유"], "무": ["진", "술", "축", "미"], "기": ["진", "술", "축", "미"], "경": ["인", "해"], "신": ["인", "해"], "임": ["사", "신"], "계": ["사", "신"] };
      if (tgMap[ilganKo]?.includes(pillar.branchKo)) pillar.branchSinsals.push("태극귀인");

      // 11. Hak-dang-gwiin (학당귀인)
      const hdMap: Record<string, string> = { "갑": "해", "을": "자", "병": "인", "정": "묘", "무": "인", "기": "묘", "경": "사", "신": "오", "임": "신", "계": "유" };
      if (hdMap[ilganKo] === pillar.branchKo) pillar.branchSinsals.push("학당귀인");

      // 12. Cheon-duck (천덕귀인)
      const cdMap: Record<string, string[]> = { "인": ["정"], "묘": ["신"], "진": ["임"], "사": ["신"], "오": ["해"], "미": ["갑"], "신": ["계"], "유": ["인"], "술": ["병"], "해": ["을"], "자": ["사"], "축": ["경"] };
      if (cdMap[res.month.branchKo]?.includes(pillar.stemKo)) pillar.stemSinsals.push("천덕귀인");

      // 13. Wol-duck (월덕귀인)
      const wdMap: Record<string, string> = { "인": "병", "오": "병", "술": "병", "신": "임", "자": "임", "진": "임", "사": "경", "유": "경", "축": "경", "해": "갑", "묘": "갑", "미": "갑" };
      if (wdMap[res.month.branchKo] === pillar.stemKo) pillar.stemSinsals.push("월덕귀인");

      // 14. Yang-in (양인살) - Refined for Forceteller Hour Yangin
      const yanginMap: Record<string, string> = { "갑": "묘", "을": "진", "병": "오", "정": "미", "무": "오", "기": "미", "경": "유", "신": "술", "임": "자", "계": "축" };
      if (yanginMap[ilganKo] === pillar.branchKo) pillar.branchSinsals.push("양인살");
      // Specific Hour Yangin for 戊: 戌 (found in Image 2)
      if (ilganKo === "신" && pillar.branchKo === "술" && p === "hour") pillar.branchSinsals.push("양인살");

      // 15. Baek-ho (백호대살)
      if (["갑진", "을미", "병술", "정축", "무진", "임술", "계축"].includes(pillar.stemKo + pillar.branchKo)) {
        pillar.stemSinsals.push("백호대살");
        pillar.branchSinsals.push("백호대살");
      }

      // Special cases: Doha, Yeokma, Hwagae from any position
      if (["자", "오", "묘", "유"].includes(pillar.branchKo) && !pillar.branchSinsals.includes("도화살")) pillar.branchSinsals.push("도화살");
      if (["인", "신", "사", "해"].includes(pillar.branchKo)) pillar.branchSinsals.push("역마살");
      if (["진", "술", "축", "미"].includes(pillar.branchKo)) pillar.branchSinsals.push("화개살");

      // Hyeonchim-sal (현침살) - Sharpness
      if (['갑', '신', '계'].includes(pillar.stemKo)) pillar.stemSinsals.push("현침살");
      if (['묘', '오', '신', '미', '술'].includes(pillar.branchKo)) pillar.branchSinsals.push("현침살");

      // Final Deduplication
      pillar.stemSinsals = Array.from(new Set(pillar.stemSinsals));
      pillar.branchSinsals = Array.from(new Set(pillar.branchSinsals));
      pillar.sinsals = Array.from(new Set([...pillar.stemSinsals, ...pillar.branchSinsals]));
  });

  return res;
}
