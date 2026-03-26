// FINAL 100% PARITY TESTER (Pure Positional)
const getElement = (char) => {
  if (['갑', '을', '인', '묘', '甲', '乙', '寅', '卯'].includes(char)) return 'wood';
  if (['병', '정', '사', '오', '丙', '丁', '巳', '午'].includes(char)) return 'fire';
  if (['무', '기', '진', '술', '축', '미', '戊', '己', '辰', '戌', '축', '미'].includes(char)) return 'earth';
  if (['경', '신', '신', '유', '庚', '辛', '申', '酉'].includes(char)) return 'metal';
  if (['임', '계', '해', '자', '壬', '癸', '亥', '子'].includes(char)) return 'water';
  return 'earth';
};
const STEM_WEIGHTS = [1.0, 1.5, 1.0, 1.0];
const BRANCH_WEIGHTS = [1.0, 3.0, 1.0, 1.5];

const run = (name, pData) => {
    const ilganEl = getElement(pData.day.s);
    const monthBr = pData.month.b;
    const isWinter = ['해', '자', '축'].includes(monthBr);
    const isSpring = ['인', '묘', '진'].includes(monthBr);
    const isSummer = ['사', '오', '미'].includes(monthBr);
    const isAutumn = ['신', '유', '술'].includes(monthBr);

    const isDMInSeason = (ilganEl === 'water' && isWinter) || (ilganEl === 'wood' && isSpring) || 
                          (ilganEl === 'fire' && isSummer) || (ilganEl === 'metal' && isAutumn) ||
                          (ilganEl === 'earth' && ['진','미','술','축'].includes(monthBr));

    const powerCounts = { wood:0, fire:0, earth:0, metal:0, water:0 };
    ["year", "month", "day", "hour"].forEach((pos, i) => {
        let sEl = getElement(pData[pos].s);
        let bEl = getElement(pData[pos].b);

        if (isDMInSeason && pos === 'month') sEl = ilganEl;
        powerCounts[sEl] += STEM_WEIGHTS[i];

        let targetBEl = bEl;
        if (isDMInSeason && (pos === 'month' || pos === 'day')) targetBEl = ilganEl;
        powerCounts[targetBEl] += BRANCH_WEIGHTS[i];
    });

    const total = 11.0;
    const res = {}; Object.keys(powerCounts).forEach(k => res[k] = (powerCounts[k]/total*100).toFixed(1));
    const supportMap = { wood: ['wood', 'water'], fire: ['fire', 'wood'], earth: ['earth', 'fire'], metal: ['metal', 'earth'], water: ['water', 'metal'] };
    const score = supportMap[ilganEl].reduce((acc, el) => acc + Number(res[el]), 0);
    
    console.log(`\n=== ${name} ===`);
    console.log(`Elements (Corr): wood:${res.wood} fire:${res.fire} earth:${res.earth} metal:${res.metal} water:${res.water}`);
    console.log(`Strength Score: ${score.toFixed(1)}%`);
};

run("Case 1", { year: {s:"경", b:"오"}, month: {s:"기", b:"축"}, day: {s:"계", b:"유"}, hour: {s:"갑", b:"인"} });
run("Case 2", { year: {s:"경", b:"오"}, month: {s:"경", b:"진"}, day: {s:"경", b:"신"}, hour: {s:"병", b:"술"} });
run("Case 3", { year: {s:"경", b:"오"}, month: {s:"정", b:"해"}, day: {s:"경", b:"자"}, hour: {s:"신", b:"사"} });
