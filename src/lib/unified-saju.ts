import { calculateHighPrecisionSaju, SajuResult } from "./saju_calculator";

const STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
const BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];

export const cityCoords: Record<string, { lat: number; lon: number }> = {
  "서울": { lat: 37.5665, lon: 126.9780 },
  "부산": { lat: 35.1796, lon: 129.0756 },
  "대구": { lat: 35.8714, lon: 128.6014 },
  "인천": { lat: 37.4563, lon: 126.7052 },
  "광주": { lat: 35.1595, lon: 126.8526 },
  "대전": { lat: 36.3504, lon: 127.3845 },
  "울산": { lat: 35.5384, lon: 129.3114 },
  "제주": { lat: 33.4996, lon: 126.5312 },
  "수원": { lat: 37.2636, lon: 127.0286 },
  "성남": { lat: 37.4200, lon: 127.1267 },
  "고양": { lat: 37.6584, lon: 126.8320 },
  "용인": { lat: 37.2411, lon: 127.1776 },
  "강릉": { lat: 37.7519, lon: 128.8761 },
  "기타": { lat: 37.5665, lon: 126.9780 }
};

export const getPillarsForDate = (date: Date) => {
    return calculateHighPrecisionSaju({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        hour: 12, minute: 0,
        latitude: 37.5, longitude: 127.0,
        isLunar: false, isIntercalation: false, gender: "M"
    });
};

export const getUnifiedSaju = (data: {
    date: string;
    time: string;
    isLunar: boolean;
    isLeap?: boolean;
    gender: string;
    birthCity: string;
}) => {
    const [y, m, d] = data.date.split("-").map(Number);
    const [h, mi] = data.time.split(":").map(Number);
    const coord = cityCoords[data.birthCity] || cityCoords["서울"];
    
    const sajuRes = calculateHighPrecisionSaju({
        year: y, month: m, day: d, hour: h, minute: mi,
        latitude: coord.lat, longitude: coord.lon,
        isLunar: data.isLunar, isIntercalation: data.isLeap || false, gender: data.gender === "M" ? "M" : "F"
    });

    // Helper for Pillar Mapping
    const buildPillarDetail = (p: any) => ({
        stem: p.stem,
        branch: p.branch,
        stemKo: p.stemKo,
        branchKo: p.branchKo,
        stemTenGod: p.stemTenGod,
        branchTenGod: p.branchTenGod,
        element: p.element,
        yinYang: p.yinYang,
        hiddenStems: p.hiddenStems,
        hiddenText: p.hiddenText,
        stage12: p.stage12,
        sinsals: p.sinsals
    });

    // Generate Seyun (Yearly Ganji) for current period
    const currentYear = 2026;
    const seyun = [2026, 2027, 2028].map(yr => {
        const res = getPillarsForDate(new Date(yr, 6, 1));
        return { year: yr, ganzhi: res.year.stemKo + res.year.branchKo, tenGodStem: res.year.stemTenGod, tenGodBranch: res.year.branchTenGod };
    });

    // Generate Wolun (Monthly Ganji) for 2026
    const wolun = Array.from({ length: 12 }, (_, i) => {
        const res = getPillarsForDate(new Date(2026, i, 15));
        return {
            month: i + 1,
            ganzhi: res.month.stemKo + res.month.branchKo,
            stem_tengod: res.month.stemTenGod,
            branch_tengod: res.month.branchTenGod
        };
    });

    const sajuMap: Record<string, string> = {
        '갑': 'wood', '을': 'wood', '경': 'metal', '신': 'metal', '임': 'water', '계': 'water', '병': 'fire', '정': 'fire', '무': 'earth', '기': 'earth',
        '인': 'wood', '묘': 'wood', '유': 'metal', '해': 'water', '자': 'water', '사': 'fire', '오': 'fire', '진': 'earth', '술': 'earth', '축': 'earth', '미': 'earth'
    };

    const allChars = [
        sajuRes.year.stemKo, sajuRes.year.branchKo,
        sajuRes.month.stemKo, sajuRes.month.branchKo,
        sajuRes.day.stemKo, sajuRes.day.branchKo,
        sajuRes.hour.stemKo, sajuRes.hour.branchKo
    ];

    const counts: Record<string, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    allChars.forEach(char => {
        const elem = sajuMap[char];
        if (elem) counts[elem]++;
    });

    const basePercentages = {
        wood: (counts.wood / 8) * 100,
        fire: (counts.fire / 8) * 100,
        earth: (counts.earth / 8) * 100,
        metal: (counts.metal / 8) * 100,
        water: (counts.water / 8) * 100
    };

    return {
        ...sajuRes,
        basePercentages,
        pillarDetails: {
            year: buildPillarDetail(sajuRes.year),
            month: buildPillarDetail(sajuRes.month),
            day: buildPillarDetail(sajuRes.day),
            hour: buildPillarDetail(sajuRes.hour)
        },
        tenGods: {
            year: { stem: sajuRes.year.stemTenGod, branch: sajuRes.year.branchTenGod },
            month: { stem: sajuRes.month.stemTenGod, branch: sajuRes.month.branchTenGod },
            day: { stem: "일간", branch: sajuRes.day.branchTenGod },
            hour: { stem: sajuRes.hour.stemTenGod, branch: sajuRes.hour.branchTenGod }
        },
        stages12: {
            bong: {
                year: sajuRes.year.stage12,
                month: sajuRes.month.stage12,
                day: sajuRes.day.stage12,
                hour: sajuRes.hour.stage12
            }
        },
        sals: {
            year: { twelveSal: sajuRes.year.sinsals[0], specialSals: sajuRes.year.sinsals.slice(1) },
            month: { twelveSal: sajuRes.month.sinsals[0], specialSals: sajuRes.month.sinsals.slice(1) },
            day: { twelveSal: sajuRes.day.sinsals[0], specialSals: sajuRes.day.sinsals.slice(1) },
            hour: { twelveSal: sajuRes.hour.sinsals[0], specialSals: sajuRes.hour.sinsals.slice(1) }
        },
        advanced: {
            geukguk: sajuRes.geukguk,
            sinsal: {
                gilsin: [...sajuRes.year.sinsals, ...sajuRes.month.sinsals, ...sajuRes.day.sinsals, ...sajuRes.hour.sinsals].filter(s => !["천살","지살","망신살","겁살","재살","육해살","화개살","백호대살","양인살","괴강살","원진살","귀문관살","홍염살","도화살"].includes(s)),
                hyungsin: [...sajuRes.year.sinsals, ...sajuRes.month.sinsals, ...sajuRes.day.sinsals, ...sajuRes.hour.sinsals].filter(s => ["천살","지살","망신살","겁살","재살","육해살","화개살","백호대살","양인살","괴강살","원진살","귀문관살","홍염살","도화살"].includes(s))
            },
            yongsin: [] 
        },
        gongmang: { branchesKo: sajuRes.gongmang },
        daeun: {
            basis: { direction: sajuRes.daeun.direction === "Forward" ? "forward" : "reverse" },
            list: sajuRes.daeun.cycles.map(c => ({
                startAge: c.startAge,
                ganzhi: c.ganzhi,
                stemTenGod: c.stemTenGod,
                branchTenGod: c.branchTenGod
            }))
        },
        seyun,
        wolun
    };
};
