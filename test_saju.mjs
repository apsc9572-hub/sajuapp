import { calculateSaju } from "ssaju";

function getElementFromChar(char) {
  const elements = {
    '甲': '목', '乙': '목', '寅': '목', '卯': '목',
    '丙': '화', '丁': '화', '巳': '화', '午': '화',
    '戊': '토', '己': '토', '辰': '토', '戌': '토', '丑': '토', '未': '토',
    '庚': '금', '辛': '금', '申': '금', '酉': '금',
    '壬': '수', '癸': '수', '亥': '수', '子': '수',
  };
  return elements[char] || '목'; // 기본값 (안전장치)
}

function getWealthRoutingText(fe, dmElem) {
  const GENERATES = { 목:'화', 화:'토', 토:'금', 금:'수', 수:'목' };
  const CONTROLS = { 목:'토', 토:'수', 수:'화', 화:'금', 금:'목' };

  const jaeseongElem = CONTROLS[dmElem]; 
  const siksangElem  = GENERATES[dmElem]; 

  const jaeCount = fe[jaeseongElem] ?? 0;
  const siksangCount = fe[siksangElem] ?? 0;
  
  if (jaeCount >= 2) {
    return "타고난 금전 감각이 탁월합니다. 돈이 모이는 흐름을 본능적으로 읽어내며, 자산을 적극적으로 운용하고 굴리는 환경에서 큰 부를 축적합니다.";
  }
  if (jaeCount <= 1 && siksangCount >= 2) {
    return "당신의 아이디어와 기술이 곧 돈이 되는 사주입니다. 조직에 얽매이기보다 프리랜서, 전문직, 자기 사업을 통해 능력을 펼칠 때 재물운이 터집니다.";
  }
  return "한탕주의를 피하고 차곡차곡 쌓아가는 안정성이 평생의 부를 지킵니다. 부동산, 문서 자산 등 눈에 보이지 않는 위험을 피하고 확실한 현금 흐름을 만드세요.";
}

function getLoveRoutingText(fe, dmElem, gender) {
  const CONTROLLED_BY = { 토:'목', 수:'토', 화:'수', 금:'화', 목:'금' };
  const CONTROLS = { 목:'토', 토:'수', 수:'화', 화:'금', 금:'목' };

  const jaeseongElem = CONTROLS[dmElem]; 
  const gwanseongElem = CONTROLLED_BY[dmElem]; 

  if (gender === "M") {
    const hasJae = (fe[jaeseongElem] ?? 0) > 0;
    if (hasJae) return "이성에게 다가가는 부드러운 매력을 타고났습니다. 현실적이고 책임감 있는 연애를 추구하며, 관계를 리드하는 데 능숙합니다.";
    return "인연을 맺는 데 시간이 조금 걸릴 수 있지만, 한 번 마음을 주면 변치 않는 순애보를 가졌습니다. 서두르지 말고 자연스러운 만남을 추구하세요.";
  } else {
    const hasGwan = (fe[gwanseongElem] ?? 0) > 0;
    if (hasGwan) return "자신을 존중하고 든든한 울타리가 되어줄 수 있는 책임감 있는 파트너와 인연이 깊습니다. 서로의 룰을 지키는 안정적인 관계에서 행복을 느낍니다.";
    return "사회적 기준이나 뻔한 연애 방식에 얽매이지 않는 자유로운 영혼입니다. 통제하려 들지 않고, 친구처럼 내 삶의 영역을 존중하는 사람과 잘 맞습니다.";
  }
}

// Case 1: 1991 Male
const c1 = calculateSaju({year:1991, month:1, day:13, hour:3, minute:10, calendar:'solar'});
const dm1 = getElementFromChar(c1.day[0]); 
console.log(`--- [TEST 1] 1991년 1월 13일 (남성) ---`);
console.log("DM Element:", dm1);
console.log("Wealth Text :", getWealthRoutingText(c1.fiveElements, dm1));
console.log("Love Text   :", getLoveRoutingText(c1.fiveElements, dm1, "M"));

// Case 2: 1990 Female
const c2 = calculateSaju({year:1990, month:12, day:2, hour:10, minute:3, calendar:'solar'});
const dm2 = getElementFromChar(c2.day[0]);
console.log(`\n--- [TEST 2] 1990년 12월 2일 (여성) ---`);
console.log("DM Element:", dm2);
console.log("Wealth Text :", getWealthRoutingText(c2.fiveElements, dm2));
console.log("Love Text   :", getLoveRoutingText(c2.fiveElements, dm2, "F"));
