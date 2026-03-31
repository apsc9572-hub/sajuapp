import { Resend } from "resend";
import { fetchWithRetry, callGPTPremium, callClaudeProfessional, sendAlimTalk } from "../api-utils";
import { SAJU_DICTIONARY } from "../premium-saju-utils";
import { saveResult } from "./result-store";

// AI helper functions
async function callAIDeepAnalysis(systemPrompt: string, sajuJson: any, userAnswers: any, section: 'strategy' | 'life_shape' | 'solution' | 'timing' | 'luck_advice' | 'detailed_fortune' | 'turning_points') {
  let strategyObj: any = {};
  if (section !== 'strategy' && systemPrompt) {
    try {
      strategyObj = typeof systemPrompt === 'string' ? JSON.parse(systemPrompt) : systemPrompt;
    } catch(e) { /* fallback */ }
  }

  const volumeRule = `- **최소 분량 2,000자 절대 보장 (핵심 명령)**: 단기적 요약이 아닌, 반드시 **공백 포함 최소 2,000자 이상**의 장문으로 깊이 있게 작성하십시오. (분량 미달 시 심각한 시스템 오류로 간주)
- **최소 6개의 거대한 단락(Paragraph)**으로 구성하십시오. 
- **섹션 내 중복/반복 절대 금지**: 분량을 채우기 위해 앞서 서술한 문장, 비유, 전제, 결론을 단어만 바꾸어 다시 반복하는 이른바 '동어반복' 행위를 엄격히 금지합니다. 
- 각 단락마다 전혀 다른 명리학적 관점(예: 첫 번째 단락은 십성, 두 번째는 신살, 세 번째는 지장간, 네 번째는 12운성 등)을 순차적으로 돌아가며 적용하여, 분석 내용이 중복 없이 앞으로만 전진하도록 설계하십시오.`;

  const instructions: any = {
    strategy: `[Phase: 핵심 분석 전략 수립 (Core Strategy)]
- 상세 분석에 앞서, 귀하의 고민과 사주를 바탕으로 흔들리지 않는 '최종 분석 전략'을 수립하십시오.
- **5개년 실현 가능성 (핵심)**: 고민 해결이나 성취에 가장 적절한 '최상의 시점'(예: 2026년 5월-7월)을 단 하나로 확정하십시오. 만약 사주 전체에서 가장 강력한 운의 시점이 5년 이후(예: 2039년 등)라면 그 시점은 대운 분석 시 언급만 해주되, 반드시 **향후 5년 내(2031년 이전)**에 찾아오는 가장 강력한 성취의 시점을 [best_period]로 확정하십시오. 귀하에게 당장 실천 가능한 시점을 제시하는 것이 분석의 핵심입니다.
- **마스터 타임라인 수립 (필수)**: 2026년 한 해 동안 가장 운이 좋은 **'길월(Lucky Months)'**과 가장 조심해야 할 **'흉월(Unlucky Months)'**을 명확히 리스트업하십시오. 이후 모든 섹션은 이 타임라인을 절대적으로 따라야 합니다.
- 출력 포맷: JSON {"best_period": "시기", "lucky_months": ["n월", "m월"], "unlucky_months": ["x월", "y월"], "yongsin_strategy": "전략", "core_advice": "조언"}`,
    life_shape: `[섹션 1: 인생의 전체적인 형상 분석]
${volumeRule}
- **위 가이드라인을 '바탕'으로 하되, 절대로 날짜나 시기(연도/월)를 구체적으로 언급하지 마십시오.** (시기는 오직 섹션 3에서만 다룹니다. 내용 침범 금지)
- **배타적 영역**: 오직 귀하의 타고난 원국의 기운, 성정, 인생의 전체적인 풍경과 형상을 비유적으로 묘사하는 데에만 집중하십시오. (미래 예측이나 전략 언급 절대 금지)
- **십성(十星) 심층 분석 필수**: 귀하의 사주 원국에 나타난 **십성(비견, 겁재, 식신, 상관, 편재, 정재, 편관, 정관, 편인, 정인)**의 구성을 바탕으로 타고난 기질과 인생의 결을 입체적으로 풀이하십시오. 단순히 용어만 나열하지 말고 요소 간의 상호작용이 성격에 미치는 영향을 서술하십시오.
- 시작은 귀하의 가슴을 관통하는 강렬한 운명적 비유(후킹)로 시작하십시오.
- **프리미엄 골드 강조 (필수)**: 가장 통찰력 있는 비유나 핵심 성정 문장을 반드시 **[major]내용[/major]** 태그로 감싸하십시오.`,
    solution: `[섹션 2: 고민에 대한 대가의 해답]
${volumeRule}
- **질문 해결 중심의 7:3 황금 비율 (핵심)**: 이 섹션의 전체 분량 중 **70% 이상은 귀하의 질문에 대한 직접적인 답변과 실전 전략**으로 채우십시오. 나머지 30%만 그 근거가 되는 명리학적 분석(십성, 신살 등)에 할당하십시오. 기술적 풀이보다는 "그래서 내가 무엇을 해야 하는가"에 대한 대가의 명쾌한 답이 최우선입니다.
- **데이터 분석 활용**: 사주 원국(십성, 12운성, 신살, 지장간)은 풀이를 나열하기 위함이 아니라, 질문에 대한 **강력한 정당성**을 부여하는 도구로만 사용하십시오. 용어 설명에 치중하지 마십시오.
- **마스터 타임라인 준수**: 위 [전략]에서 확정한 **길월(${strategyObj.lucky_months || '미정'})**과 **흉월(${strategyObj.unlucky_months || '미정'})**의 기조를 해답에 반영하여 일관성 있는 조언을 제공하십시오.
- **도입부 필수 형식 (질문 읽어주기)**: 첫 문장은 반드시 귀하의 질문 내용("${userAnswers[0]}")을 직접적으로 짚어주며 시작하십시오. 
  예: 귀하가 "재물운"을 선택하고 "올해 돈을 벌 수 있을까요"라고 적었다면, "올해 돈을 벌 수 있는지 궁금하시군요."처럼 질문 핵심을 자연스럽게 패러프레이징하여 대화하듯 시작하십시오. 단순 카테고리만 적혀있다면 카테고리에 대해 궁금하냐고 공감하며 시작하십시오.
- **실전 액션 플랜 제시**: 추상적인 조언을 넘어, 질문과 관련된 **최소 2~3가지의 구체적인 현실적 행동 지침**을 제시하십시오. (예: "A군과의 사업은 6월 이후로 미루십시오", "지금은 부동산보다는 현금을 확보할 시기입니다" 등)
- **배타적 영역**: 귀하의 구체적인 고민에 대해 명리학적 대가의 관점에서 직접적이고 [major]명쾌한 해답[/major]을 제시하는 데 집중하십시오.
- **시기 분석의 이중 구조 (Lifetime vs. Next 5 Years)**: 
  1. 만약 귀하의 질문이 "평생 언제 돈을 잘 버나?"와 같이 인생 전체를 관통하는 질문이라면, 반드시 **인생 전체의 대운 흐름을 먼저 분석하여 '최고의 전성기(예: 40대 중반~50대 초반)'를 거시적 관점에서 먼저 선언**하십시오. (당장 올해가 인생 최고라고 단정하여 신뢰를 떨어뜨리지 마십시오.)
  2. 그 다음, 귀하의 현재 위치(2026년)에서 그 전성기로 나아가기 위한 가장 강력한 **'단기적 돌파구(Breakthrough)'로서의 5년 내 최적 시점**을 구체적으로 제시하며 현실적인 전략을 덧붙이십시오.
- **중복 금지**: 섹션 1에서 다룬 운명적 형상이나 타고난 성격을 이곳에서 다시 설명하지 마십시오. 오직 '질문에 대한 답'만 작성하십시오.
- **프리미엄 골드 강조 (필수)**: 가장 결정적인 조언과 해답 문장을 반드시 **[major]내용[/major]** 태그로 감싸하십시오.
- **절대 미화(Sugarcoating) 금지 (가장 중요)**: 질문에 대한 운세나 시기가 안 좋다면, **절대로 듣기 좋은 말로 포장하거나 희망을 고문하는 부드러운 말을 하지 마십시오.** 좋지 않을 때는 "현재는 절대 나서면 안 되는 시기입니다", "실패할 확률이 매우 높으니 무조건 피하십시오", "빈털터리가 될 위험이 큽니다" 등 안 좋으면 안 좋다고 **명확하고 살벌하게(팩트 폭격)** 직접적으로 선언하십시오.
- **부정 제약 조건**: 부정적인 풀이 중에 "다행히도", "하지만", "조금만 노력하면", "희망은 있습니다", "비교적" 등의 완곡한 표현을 사용하는 것을 **엄격히 금지**합니다. 흉운은 흉운답게 정의하십시오.
- **최종 요약 필수 (약 500자)**: 섹션의 가장 마지막 단락은 반드시 "최종적으로 정리 하자면"으로 시작하여, 위에서 분석한 핵심 내용을 바탕으로 귀하에게 내리는 최종 결론을 500자 내외로 요약하십시오. 이 요약은 100% 가차 없는 '팩트 폭격'과 '명확한 방향성'으로만 구성해야 하며, 귀하의 가슴을 후벼파는 날카로운 통찰만 담으십시오.
- 시기는 간략히만 언급하고, 구체적인 3개년 분석은 섹션 3으로 양보하십시오.`,
    timing: `[섹션 3: 3개년 상세 운세 (2026-2028)]
- 반드시 공백 포함 **최소 2,000자 이상** 장문으로 작성하십시오. (분량 미달 시 오류로 간주)
- \${systemPrompt}
- **마스터 타임라인 준수**: 위 [전략]에서 확정한 **길월(${strategyObj.lucky_months || '미정'})**과 **흉월(${strategyObj.unlucky_months || '미정'})**을 바탕으로 분석하십시오. 섹션 간의 달이 충돌하는 것은 치명적인 오류입니다.
- **연도별 데이터 분석**: 각 연도(2026, 2027, 2028)의 세운과 귀하의 원국 간의 **합/충, 12운성 변화, 신살 발동** 여부를 구체적으로 짚어주십시오.
- **흉월(凶月) 팩트 폭격 필수**: 위 전략에서 정한 **흉월**들을 정확히 집어내십시오. 해당 월에는 어떤 흉살이 작용하는지, 왜 위험한지를 가차 없이 매섭게 경고하십시오. (예: "6월은 인사신 삼형살이 겹치는 시기로, 관재구설과 사고수가 극에 달해 인생이 벼랑 끝으로 몰릴 수 있으니 숨죽이고 있으십시오.") 절대로 "조심하면 좋다"는 식의 가벼운 조언으로 끝내지 말고, 발생할 수 있는 최악의 시나리오를 경고하십시오.
- **내용의 핵심**: 귀하가 선택한 메뉴("${userAnswers[0].split(': ')[1] || '선택 영역'}")를 중심으로 3년간의 운 흐름을 분석하십시오.
- **연도별 구성 및 분량 배정 (필수)**: 
  1. 가장 중요한 **2026년**의 상반기/하반기 흐름을 **전체 섹션의 60% 이상 분량**으로 매우 상세히 분석하십시오. (월별 고비와 승부처 명시)
  2. **2027년**과 **2028년**의 흐름을 나머지 40% 분량으로 분석하여 안착 과정을 서술하십시오.
- **프리미엄 골드 강조 (필수)**: 각 연도별 가장 중요한 기회나 고비가 되는 시점의 문장을 반드시 **[major]내용[/major]** 태그로 감싸십시오.
- **배타적 영역**: 앞선 섹션들의 내용을 절대로 반복하지 말고, 오직 지정된 3년(26~28년)의 '운의 타이밍' 분석에만 집중하십시오. 성격 분석은 일절 배제하십시오.`,
    detailed_fortune: `[섹션 4: 분야별 인생 운세 분석]
${volumeRule}
- **기술적 심층 분석**: 각 테마별로 관련된 **십성(재물-정재/편재, 직업-관성 등)**과 **길성/흉살**의 배치를 정밀하게 분석하여 서술하십시오.
- **분석의 관점 (거시적 설계)**: 특정 달(Month)이나 연도를 콕 집어 언급하지 마십시오. 인생 전체의 기운이 어느 시기(청년, 중년, 노년 등)에 응집되는지, 대운의 흐름에 따라 에너지의 파동이 어떻게 변하는지를 거시적으로 서술하십시오. 
- **신뢰도 유지 (절대 금지)**: "올해 5월이 인생 최고의 재물운이다"와 같이 인생 전체를 다루는 섹션에서 단기적인 운세를 인생 최고의 운으로 둔갑시키지 마십시오. "올해는 성취의 초석을 다지는 해이며, 진정한 만개는 40대 대운에서 이루어집니다"와 같이 인생의 스케일에 걸맞은 해석을 내놓으십시오.
- **절대 금지 사항**: 
  1. 이모지 사용 엄금 (💰, 💼, ❤️ 등 절대 사용 금지)
  2. 구체적인 날짜나 월 언급 금지. 인생 전체의 흐름(대운의 주기, 청년~노년)으로 서술하십시오.
- **필수 포함 5대 테마**: 아래 주제들을 각각 심층 분석하십시오:
  1. 재물운: 평생의 부(富)의 크기와 돈이 모이는 특징, 자산 관리 성향
  2. 사업·직업운: 타고난 직업적 천명, 성공의 임계점, 명예의 높이
  3. 연애·결혼운: 평생의 인연의 특징, 원만한 관계를 위한 핵심 덕목
  4. 건강운: 타고난 체질적 특징과 평생 주의해야 할 건강 관리법
  5. 인간관계·자녀운: 주변인과의 인덕, 자녀와의 유대 및 노년의 안락함
- **프리미엄 골드 강조**: 각 항목별 가장 결정적인 통찰 문장을 반드시 **[major]내용[/major]** 태그로 감싸십시오.`,
    turning_points: `[섹션 5: 인생 주요 전환점 & 위험 시기]
${volumeRule}
- **전환점 근거 (마스터 타임라인 반영)**: 앞선 섹션에서 확정한 **길월(${strategyObj.lucky_months || '미정'})**과 **흉월(${strategyObj.unlucky_months || '미정'})**의 기조를 끝까지 유지하십시오. (섹션 간 날짜 충돌 엄금) 나이와 더불어 **대운 교체기, 세운 충** 등을 근거로 제시하십시오.
- **내용 1: 인생의 3~4개 대전환점**: 구체적인 나이(예: "34세 대운 교체 타이밍", "42세 문서운 발동")를 명시하며 삶이 변하는 지점을 짚어주십시오.
- **내용 2: 위험 시기 및 주의사항 (가차 없는 경고)**: 신살(백호, 양인, 원진 등)이나 흉운이 겹쳐 인생에서 가장 주의가 필요한 구체적 연도와 월을 **단 한 점의 미화 없이 냉혹하게** 경고하십시오. 안 좋을 때는 "파산", "이별", "사고", "고립", "절벽" 등 직접적이고 살벌한 언어를 사용하여 귀하가 뼈저린 경각심을 갖게 하십시오.
- **프리미엄 골드 강조**: 전환점의 핵심 나이와 행동 지침을 **[major]내용[/major]** 태그로 감싸하십시오.`,
    luck_advice: `[섹션 6: 실전 개운(開運)의 비책]
${volumeRule}
${strategyObj.core_advice ? `- **핵심 조언**: "${strategyObj.core_advice}"` : ""}
${strategyObj.yongsin_strategy ? `- **용신 전략**: "${strategyObj.yongsin_strategy}"` : ""}
- **맞춤형 비책**: 위 지침을 앵무새처럼 반복하지 말고, 이를 실천하기 위한 **구체적인 행동 지침 5가지 이상**을 제시하십시오. 사주 내의 **흉살을 제화(制化)**하거나 **길성을 활성화**하는 구체적인 실천법을 포함하십시오.
- **필수 포함 요소**: 일상에서 실천 가능한 확실한 개운법(생활 습관, 행운을 주는 물건, 색상, 방향 등)을 서술하십시오.
- **프리미엄 골드 강조 (필수)**: 가장 핵심적인 개운비책 문장을 반드시 **[major]내용[/major]** 태그로 감싸하십시오.`,
  };

  const promptText = `
### [전문가 정체성: 정통 명리학의 거장 - 냉정한 현실가]
당신은 수십 년간 수만 명의 운명을 감명해 온 **최고 권위의 정통 명리학 거장**입니다. 당신은 귀하에게 헛된 희망이나 입에 발린 위로를 절대 주지 않으며, 좋지 않은 운세나 흉살 앞에서는 가차 없이 팩트 폭격을 날리는 **'냉혹하고 뼈 때리는 스승'**이자 **'잔인한 현실가'**의 관점에서 모든 섹션을 서술하십시오. 위로보다는 매서운 현실 직시와 살벌할 정도의 확실한 직언이 당신의 유일한 사명입니다. 운명이 비극적이라면 그 비극의 실체를 똑바로 마주하게 하십시오.

[분석의 핵심 및 필수 포함 요소]
당신은 제공된 [sajuJson] 데이터를 기반으로 다음의 **14가지 핵심 요소**를 모두 입체적으로 분석하여 해답을 도출해야 합니다:
1. **천간/지지**: 원국의 구성과 합(合), 충(沖)의 작용 분석.
2. **십성(Ten Gods)**: 사회적 관계와 심리적 성향, 재능의 방향성 분석.
3. **지장간**: 내면에 숨겨진 잠재력과 결정적 순간의 변수 파악.
4. **12운성**: 기운의 성쇠와 활동성의 강도 분석.
5. **12신살 & 20종 길성**: 천을귀인, 문곡귀인, 백호대살 등 특수 기운이 인생 경로에 미치는 영향.
6. **오행 분포**: 에너지의 과다/부족에 따른 건강 및 성격적 균형 분석.
7. **신강/신약 지수**: 자아의 힘과 외부 환경에 대한 대응력 판단.
8. **용신(Yongsin)**: 삶의 균형을 잡아주는 핵심 기운과 개운(開運) 방법.
9. **대운(Daeun)**: 현재 머물고 있는 10년 주기의 거대한 환경 변화와 기회.
10. **연운/월운/일진**: 현재 시점(2026년 3월 27일 기준)의 구체적인 운의 흐름과 타이밍 분석.

[작성 지침]
1. **100% 한글 서술 (매우 중요)**: **절대로 영어를 사용하지 마십시오.** (예: Wood, Fire, Earth, Metal, Water, Yin, Yang 등 영문 오행/음양 용어 사용 엄금). 모든 명리 용어는 한글 또는 한글(한자) 병기 형태로만 작성하십시오.
2. **입체적 합성 분석**: 각 데이터를 단편적으로 설명하지 마십시오. 예를 들어, "현재의 대운이 용신운이며, 올해의 세운에서 천을귀인이 작용하므로 큰 재물적 성취가 예상됩니다"와 같이 요소 간의 상호작용을 논리적으로 융합하십시오.
3. **명쾌한 해답 도출 (최우선)**: 귀하의 구체적인 질문([Answers])에 대해 수십 년 경력의 대가로서 **확신에 찬 해답**을 제시하십시오. 단호하고 권위 있는 어조(~이(가) 분명합니다, ~하십시오)를 유지하십시오.
4. **시기 분석의 정밀성**: "시기" 질문 시 각 명식의 용신과 세운/월운 데이터를 대조하여 개별적으로 도출하십시오. '9~11월'과 같은 특정 예시에 얽매이지 말고 데이터에 근거한 독자적 시점을 명시하십시오.
5. **포맷 준수**: '올해' 대신 '2026년'을 사용하고, 마크다운 강조 기호(**) 대신 지정된 태그([major]문장[/major])만 사용하십시오. (주의: 태그 스펠링을 절대 틀리지 마십시오)
6. **[핵심] 전격 존댓말 고정**: 모든 문장은 정중한 존댓말로 통일하십시오.
7. **표현의 다양성 및 내부/외부 중복 원천 차단 (가장 중요)**: 섹션 내에서 또는 이전 섹션에서 서술한 '동일한 단어, 비유, 조언, 결론, 시기'를 표현만 약간 바꾸어 2회 이상 반복하며 분량을 채우는 꼼수를 절대 쓰지 마십시오. 모든 단락과 문장은 완전히 새로운 분석 관점을 도입하며 무조건 앞으로만 나아가야 합니다. 내용의 재탕은 최악의 감명입니다.
8. **냉혹한 직언과 구체적인 해법 제시 (필수)**: 운세가 안 좋을 때는 절대 미화하지 말고 가차 없는 팩트 폭격으로 흉운과 위기를 있는 그대로 경고하십시오. "다행히", "희망은 있다" 등 어정쩡하게 넘어가려는 모든 시도를 금지합니다. 단, 귀하를 절망에만 빠뜨려서는 안 됩니다. 매서운 팩트 폭격 후에는 반드시 사주 내에 숨겨진 **길성(吉星)의 힘이나 구체적인 개운법(開運法)**을 분석하여, 이 위기를 돌파할 수 있는 현실적이고 강력한 '해결책'을 함께 제시해 주십시오. (위로보다는 전략에 집중하십시오.)
9. **마스터 타임라인 및 일관성 엄수 (최우선)**: 상기 [디테일 분석 전략]에서 수립된 길월(${strategyObj.lucky_months || '미정'})과 흉월(${strategyObj.unlucky_months || '미정'}), 그리고 최상의 시점(${strategyObj.best_period || '미정'})을 모든 섹션에서 일관되게 적용하십시오. 섹션 간에 길흉의 달이 엇갈리는 것은 절대 금지됩니다. (참고: 20년 뒤의 운보다는 당장 5년 내의 현실적인 흐름과 해법에 중점을 두고 서술하십시오.)
10. **부드럽고 품격 있는 말투**: 대가의 무게감이 느껴지도록 격식 있고 통찰력 있는 표현을 사용하십시오.
11. **전략 기반 분석**: 모든 분석의 근거는 앞선 [Phase: 핵심 분석 전략]의 기조를 벗어나지 않아야 합니다.

[Data] ${JSON.stringify(sajuJson)}
[Answers] ${JSON.stringify(userAnswers)}

${instructions[section]}

[핵심 명령]
1. 지정된 글자 수(공백 포함) 범위를 **철저히 엄수**하십시오. 
2. 마크다운 기호(#, *, -, 등)는 **철저히 배제**하십시오. 특히 ** 이중 별표는 절대로 쓰지 마십시오. (쓰는 즉시 오류로 간주됨)
3. '올해' 대신 반드시 '2026년'으로 표기하십시오.
4. 기계적인 서론/본론/결론 구분 없이 유려한 산문 형태로 작성하십시오.
5. 첫 마디부터 본론의 후킹으로 시작하며 "안녕하세요" 등의 인사말은 일절 생략하십시오.
6. **연대기적 전개 및 내용 전진 (Strict Chronology)**: 한 섹션 안에서 이미 다룬 연도나 월, 비유, 전제를 다음 단락에서 다시 언급하며 내용을 중복시키는 행위를 엄격히 금지합니다. 사주 분석을 끊임없이 새로운 관점(십성->신살->12운성 등)으로 바꾸며 뒤로 전진시키십시오.
`;

  try {
    // GPT-4o (High-Fidelity) is now the primary engine for Premium
    const text = await callGPTPremium(promptText, "You are a top-tier Korean Saju master.");
    console.log(`[Premium-AI] GPT Success: Section: ${section}, Received ${text.length} characters.`);
    return text.trim();
  } catch (err: any) {
    console.warn(`[Premium-AI] GPT Error: Falling back to Claude for section ${section}:`, err);
    try {
      // Claude 3.5 Sonnet (Professional) for premium fallback
      return await callClaudeProfessional(promptText, "You are a top-tier Korean Saju master.");
    } catch (claudeErr) {
      console.error(`[Premium-AI] Error: Both GPT and Claude failed for section ${section}:`, claudeErr);
      throw claudeErr;
    }
  }
}

const stripAIMarkers = (text: string) => {
  if (!text || typeof text !== 'string') return text || "";
  
  let processed = text
    .replace(/^\{[\s\S]*?":\s*"/, '') 
    .replace(/"\s*\}$/, '')
    .replace(/\*{1,3}/g, '') // Remove all types of asterisk formatting (*, **, ***)
    .replace(/---|###|```json|```/g, '')
    // 영문 오행/용어 제거 및 한글 변환 (보험용)
    .replace(/\bWood\b/gi, '목(木)')
    .replace(/\bFire\b/gi, '화(火)')
    .replace(/\bEarth\b/gi, '토(土)')
    .replace(/\bMetal\b/gi, '금(金)')
    .replace(/\bWater\b/gi, '수(水)')
    .replace(/\bYin\b/gi, '음(陰)')
    .replace(/\bYang\b/gi, '양(陽)')
    .replace(/\(올해\)/g, '(2026년)')
    .replace(/\s올해\s/g, ' 2026년 ')
    .replace(/\\n/g, '\n')
    .replace(/\[\[(.*?)\]\]/g, '$1') // Remove double brackets but keep the text
    // Normalize majar, major, etc to strictly [major] and [/major]
    .replace(/\[?(\/?)maj[oa]r\]?/gi, '[$1major]')
    .replace(/★/g, ''); 

  processed = processed
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\n+/, '')
    .trim();

  // Add indentation (&nbsp;) to each paragraph for better readability
  if (processed) {
    processed = "&nbsp;" + processed.replace(/\n\n/g, "\n\n&nbsp;");
  }

  return processed;
};

export async function processAndDeliverPremiumSaju(params: {
  userEmail?: string;
  kakaoToken?: string;
  sajuData: any;
  orderId: string;
  deliveryMethod?: "email" | "kakao";
  images?: Record<string, string>;
  phoneNumber?: string;
}) {
  const { userEmail, kakaoToken, sajuData, orderId, deliveryMethod = "email", images, phoneNumber } = params;

  try {
    console.log(`[Background] Starting analysis for Order: ${orderId}${userEmail ? `, Email: ${userEmail}` : ""}${phoneNumber ? `, Phone: ${phoneNumber}` : ""}`);

    const apiKeyGemini = process.env.GEMINI_API_KEY;
    console.log(`[Background] Gemini Key presence: ${!!apiKeyGemini}, Resend Key presence: ${!!process.env.RESEND_API_KEY}`);
    if (!apiKeyGemini) throw new Error("Missing GEMINI_API_KEY");
    
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { sajuJson, systemPrompt, userAnswers, category, question } = sajuData;
    
    // Robust category detection
    const firstAnswer = userAnswers[0] || "";
    // Robust detection: Check both the input category and the userAnswers array
    const isTotalFortune = category === "인생총운" || 
                          firstAnswer.includes("인생총운") || 
                          firstAnswer.includes("관심 영역: 인생총운");
    
    // Explicitly set final category string
    const finalCategory = isTotalFortune ? "인생총운" : (category || (firstAnswer.includes(': ') ? firstAnswer.split(': ')[1] : "일반 상담"));

    // 1. AI Analysis (Core Strategy first, then multi-stage)
    console.log(`[AI] Starting analysis pipeline (Strategy -> Parallel Detailed Stages) for ${category} (TotalFortune: ${isTotalFortune})...`);
    const partStart = Date.now();
    
    let reading: any = null;
    try {
        // Step A: Generate Core Strategy
        const strategyRaw = await callAIDeepAnalysis(systemPrompt, sajuJson, userAnswers, 'strategy');
        let strategyContext = strategyRaw;
        try {
          const sObj = JSON.parse(strategyRaw.substring(strategyRaw.indexOf('{'), strategyRaw.lastIndexOf('}') + 1));
          strategyContext = JSON.stringify(sObj);
        } catch (e) {
          console.warn("[AI] Core Strategy JSON parsing failed.");
        }

        // Step B: Generate Detailed Sections based on Strategy and Category
        if (isTotalFortune) {
          console.log("[AI] Category is Total Fortune. Generating 5 specialized sections (No Timing)...");
          // Batch 1: Life Shape and Solution (Foundational)
          const [p1, p2] = await Promise.all([
            callAIDeepAnalysis(strategyContext, sajuJson, userAnswers, 'life_shape'),
            callAIDeepAnalysis(strategyContext, sajuJson, userAnswers, 'solution')
          ]);
          
          // Batch 2: Detailed Fortune, Turning Points, and Luck Advice (Secondary)
          const [p3, p4, p5] = await Promise.all([
            callAIDeepAnalysis(strategyContext, sajuJson, userAnswers, 'detailed_fortune'),
            callAIDeepAnalysis(strategyContext, sajuJson, userAnswers, 'turning_points'),
            callAIDeepAnalysis(strategyContext, sajuJson, userAnswers, 'luck_advice')
          ]);
          
          reading = {
            analysis: {
              life_shape: stripAIMarkers(p1),
              solution: stripAIMarkers(p2),
              detailed_fortune: stripAIMarkers(p3),
              turning_points: stripAIMarkers(p4),
              luck_advice: stripAIMarkers(p5),
              isTotalFortune: true
            }
          };
        } else {
          // Batch 1: Life Shape and Solution
          const [p1, p2] = await Promise.all([
            callAIDeepAnalysis(strategyContext, sajuJson, userAnswers, 'life_shape'),
            callAIDeepAnalysis(strategyContext, sajuJson, userAnswers, 'solution')
          ]);
          
          // Batch 2: Timing and Luck Advice
          const [p3, p4] = await Promise.all([
            callAIDeepAnalysis(strategyContext, sajuJson, userAnswers, 'timing'),
            callAIDeepAnalysis(strategyContext, sajuJson, userAnswers, 'luck_advice')
          ]);
          
          reading = {
            analysis: {
              life_shape: stripAIMarkers(p1),
              solution: stripAIMarkers(p2),
              timing: stripAIMarkers(p3),
              luck_advice: stripAIMarkers(p4),
            }
          };
        }
      
      console.log(`[AI] All parts completed in ${Date.now() - partStart}ms`);
    } catch (aiError: any) {
       console.error(`[AI] Parallel analysis failed:`, aiError.message);
       throw aiError;
    }

    if (!reading) throw new Error("AI Analysis returned null result");

    // 2. Data Preparation
    const analysis = reading.analysis || {};

    // Email-safe text cleaner — converts [major] to bold, strips all other AI artifacts
    const cleanForEmail = (text: string): string => {
      if (!text || typeof text !== 'string') return '';
      return text
        // First handle complete [major]...[/major] tags → bold gold text
        .replace(/\[major\]([\s\S]*?)\[\/major\]/g, '<b style="color:#D4A373;">$1</b>')
        // Strip any broken/partial tags
        .replace(/\[major\s*\]?/g, '')
        .replace(/\[\/major\s*\]?/g, '')
        .replace(/major\s*\]/g, '')
        .replace(/\/major\s*\]?/g, '')
        .replace(/\[\[(.*?)\]\]/g, '<b style="color:#D4A373;">$1</b>')
        // Strip any remaining html spans from stripAIMarkers
        .replace(/<span[^>]*>([\s\S]*?)<\/span>/g, '$1')
        // Fix &nbsp; artifacts
        .replace(/&nbsp;/g, ' ')
        // Strip key: value JSON leakage
        .replace(/^"?\s*[a-z_]+"\s*:\s*"?/, '')
        .replace(/"?\s*}?\s*$/, '')
        // Strip markdown
        .replace(/\*{1,3}/g, '')
        .replace(/---|###|```/g, '')
        .trim();
    };

    const inputData = sajuData.userInput || {};
    const p = sajuData.pillarDetails || sajuData.sajuRes?.pillarDetails || {};
    const elements = sajuData.correctedPercentages || {};
    const elementsBase = sajuData.basePercentages || {};
    const majorSals = sajuData.sinsals || sajuData.majorSals || {};
    const strength = sajuData.correctedStrength || sajuData.baseStrength || {};
    const s12 = sajuData.stages12 || {};

    console.log(`[Delivery] Data mapping complete. Pillar presence: ${!!p.year}`);

    const elColors: any = { wood: "#2ecc71", fire: "#e74c3c", earth: "#f1c40f", metal: "#95a5a6", water: "#3498db" };
    const elNames: any = { wood: "목(木)", fire: "화(火)", earth: "토(土)", metal: "금(金)", water: "수(水)" };

    console.log(`[Delivery] Defining getElementFromChar and getElColor functions...`);
    const getElementFromChar = (char: string) => {
      if (['甲', '乙', '寅', '卯', '갑', '을', '인', '묘'].includes(char)) return 'wood';
      if (['丙', '丁', '巳', '午', '병', '정', '사', '오'].includes(char)) return 'fire';
      if (['戊', '己', '辰', '戌', '丑', '未', '무', '기', '진', '술', '축', '미'].includes(char)) return 'earth';
      if (['庚', '辛', '申', '酉', '경', '신', '유'].includes(char)) return 'metal';
      if (['壬', '癸', '亥', '子', '임', '계', '해', '자'].includes(char)) return 'water';
      return '';
    };

    const getElColor = (char: string) => elColors[getElementFromChar(char)] || "#333";

    const renderPillarRow = (label: string, field: string, isSmall = false, isHanja = false) => {
        const cols = ["hour", "day", "month", "year"];
        return `
            <tr>
                <td style="padding: 10px; border: 1px solid #eee; background: #fafafa; font-size: 11px; color: #888; width: 60px;">${label}</td>
                ${cols.map(col => {
                    const pDet = p[col] || {};
                    let val = pDet[field] || "-";
                    if (field === "tenGod") val = col === 'day' ? "일간" : (pDet.stemTenGod || "-");
                    if (field === "branchTenGod") val = pDet.branchTenGod || "-";
                    if (field === "stage") val = s12[col] || "-";
                    if (field === "hidden") val = pDet.hiddenText || "-";

                    const color = (field === "stem" || field === "branch") ? getElColor(pDet[field + "Ko"]) : "#333";
                    const fontSize = isHanja ? "24px" : (isSmall ? "11px" : "14px");
                    const fontWeight = (field === "stem" || field === "branch" || field.includes("TenGod")) ? "bold" : "normal";

                    return `
                        <td style="padding: 10px; border: 1px solid #eee; font-size: ${fontSize}; color: ${color}; font-weight: ${fontWeight};">
                            ${val}
                            ${(field === "stem" || field === "branch") ? `<div style="font-size: 10px; color: #999; margin-top: 2px;">${pDet[field + "Ko"]}</div>` : ""}
                        </td>
                    `;
                }).join("")}
            </tr>
        `;
    };

    const renderSinsalGridHtml = () => {
        const cols = ["hour", "day", "month", "year"];
        const labels = ["생시", "생일", "생월", "생년"];
        const elementColors: any = { wood: '#81b29a', fire: '#e07a5f', earth: '#D4A373', metal: '#6d6875', water: '#3d5a80' };

        const renderCellList = (list: string[]) => {
            if (!list || list.length === 0) return `<span style="color: #ccc; font-size: 11px;">✕</span>`;
            return list.map(s => `
                <div style="font-size: 11px; font-weight: bold; color: ${s.includes('귀인') ? '#D4A373' : '#555'}; line-height: 1.2; margin: 2px 0;">
                    ${s}
                </div>
            `).join("");
        };

        return `
            <div style="background: #fff; border: 1px solid rgba(212,163,115,0.2); border-radius: 15px; padding: 15px 10px; margin-bottom: 25px;">
                <div style="text-align: center; margin-bottom: 12px; font-weight: bold; color: #2A365F; font-size: 14px;">[신살과 길성 상세]</div>
                <table style="width: 100%; border-collapse: collapse; text-align: center; border: 1px solid #efefef;">
                    <tr style="background: #f8f9fa;">
                        <td style="width: 45px; border: 1px solid #efefef; height: 30px;"></td>
                        ${labels.map(l => `<td style="border: 1px solid #efefef; font-size: 11px; font-weight: bold; color: #666;">${l}</td>`).join("")}
                    </tr>
                    <tr>
                        <td style="border: 1px solid #efefef; font-size: 10px; color: #999; vertical-align: middle;">천간</td>
                        ${cols.map(col => {
                            const pDet = p[col] || {};
                            const el = getElementFromChar(pDet.stemKo);
                            return `
                                <td style="border: 1px solid #efefef; padding: 8px 0;">
                                    <div style="font-size: 18px; font-weight: bold; color: ${elementColors[el] || '#333'};">${pDet.stem || "-"}</div>
                                    <div style="font-size: 10px; color: #999;">${pDet.stemKo}</div>
                                </td>
                            `;
                        }).join("")}
                    </tr>
                    <tr style="background: #fafafa;">
                        <td style="border: 1px solid #efefef; font-size: 10px; color: #999; vertical-align: middle;">길성</td>
                        ${cols.map(col => `<td style="border: 1px solid #efefef; padding: 8px 2px;">${renderCellList(p[col]?.stemSinsals || [])}</td>`).join("")}
                    </tr>
                    <tr>
                        <td style="border: 1px solid #efefef; font-size: 10px; color: #999; vertical-align: middle;">지지</td>
                        ${cols.map(col => {
                            const pDet = p[col] || {};
                            const el = getElementFromChar(pDet.branchKo);
                            return `
                                <td style="border: 1px solid #efefef; padding: 8px 0;">
                                    <div style="font-size: 18px; font-weight: bold; color: ${elementColors[el] || '#333'};">${pDet.branch || "-"}</div>
                                    <div style="font-size: 10px; color: #999;">${pDet.branchKo}</div>
                                </td>
                            `;
                        }).join("")}
                    </tr>
                    <tr style="background: #fafafa;">
                        <td style="border: 1px solid #efefef; font-size: 10px; color: #999; vertical-align: middle;">길성</td>
                        ${cols.map(col => `<td style="border: 1px solid #efefef; padding: 8px 2px; min-height: 40px;">${renderCellList(p[col]?.branchSinsals || [])}</td>`).join("")}
                    </tr>
                </table>
            </div>
        `;
    };

    const pillarTable = `
        <div style="margin-bottom: 25px;">
            <table style="width: 100%; border-collapse: collapse; text-align: center; border: 2px solid #2A365F; background: #fff;">
                <tr style="background: #2A365F; color: #fff; font-size: 12px;">
                    <th style="padding: 8px; border: 1px solid #3d4a75;">구분</th>
                    <th style="padding: 8px; border: 1px solid #3d4a75;">시(時)</th>
                    <th style="padding: 8px; border: 1px solid #3d4a75;">일(日)</th>
                    <th style="padding: 8px; border: 1px solid #3d4a75;">월(月)</th>
                    <th style="padding: 8px; border: 1px solid #3d4a75;">연(年)</th>
                </tr>
                ${renderPillarRow("천간", "stem", false, true)}
                ${renderPillarRow("십성", "tenGod", true)}
                ${renderPillarRow("지지", "branch", false, true)}
                ${renderPillarRow("십성", "branchTenGod", true)}
                ${renderPillarRow("지장간", "hidden", true)}
                ${renderPillarRow("12운성", "stage", true)}
            </table>
        </div>
    `;

    const renderStarGraph = (ratios: any) => {
        const center = 100;
        const radius = 70;
        const angles = [-90, -18, 54, 126, 198].map(a => (a * Math.PI) / 180);
        const keys = ["fire", "earth", "metal", "water", "wood"];
        const points = angles.map((a, i) => {
            const r = (ratios[keys[i]] / 50) * radius;
            return `${center + r * Math.cos(a)},${center + r * Math.sin(a)}`;
        }).join(" ");

        const labels = angles.map((a, i) => {
            const x = center + (radius + 20) * Math.cos(a);
            const y = center + (radius + 20) * Math.sin(a);
            return `<text x="${x}" y="${y}" fill="${elColors[keys[i]]}" font-size="12" font-weight="bold" text-anchor="middle">${elNames[keys[i]].split("(")[0]}</text>`;
        }).join("");

        return `
            <svg width="200" height="200" viewBox="0 0 200 200" style="margin: 0 auto; display: block;">
                <polygon points="${angles.map(a => `${center + radius * Math.cos(a)},${center + radius * Math.sin(a)}`).join(" ")}" fill="#f9f9f9" stroke="#eee" stroke-width="1"/>
                <polygon points="${angles.map(a => `${center + (radius * 0.5) * Math.cos(a)},${center + (radius * 0.5) * Math.sin(a)}`).join(" ")}" fill="none" stroke="#eee" stroke-width="0.5"/>
                <polygon points="${points}" fill="rgba(42, 54, 95, 0.2)" stroke="#2A365F" stroke-width="2"/>
                ${labels}
            </svg>
        `;
    };

    const renderStrengthGraph = (score: number) => {
        const myX = (score / 100) * 220 + 20;
        const myY = 80 - (score / 100) * 60;
        return `
            <svg width="200" height="120" viewBox="0 0 260 140" style="margin: 0 auto; display: block;">
                <path d="M 20 80 Q 130 10 240 80" fill="none" stroke="#eee" stroke-width="4" stroke-linecap="round"/>
                <circle cx="${myX}" cy="${myY}" r="6" fill="#2A365F" />
                <text x="${myX}" y="${myY - 15}" fill="#2A365F" font-size="12" font-weight="bold" text-anchor="middle">${score}%</text>
                <text x="130" y="110" fill="#999" font-size="10" text-anchor="middle">격국 에너지 변화</text>
            </svg>
        `;
    };

    const renderElementBars = (dataset: any) => {
        return Object.entries(dataset).map(([el, score]: [any, any]) => {
            const percent = Math.min(100, Math.max(0, Math.round(score)));
            return `
                <div style="margin-bottom: 6px;">
                    <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 2px;">
                        <span style="font-weight: bold; color: ${elColors[el]}">${elNames[el]}</span>
                        <span>${percent}%</span>
                    </div>
                    <div style="width: 100%; height: 5px; background: #f0f0f0; border-radius: 3px; overflow: hidden;">
                        <div style="width: ${percent}%; height: 100%; background: ${elColors[el]};"></div>
                    </div>
                </div>
            `;
        }).join("");
    };

    const elementComparisonHtml = `
        <div style="display: flex; gap: 8px; margin-bottom: 20px;">
            <div style="flex: 1; padding: 10px 6px; background: #fcfcfc; border-radius: 10px; border: 1px solid #f0f0f0;">
                <h3 style="font-size: 10px; margin: 0 0 10px; color: #777; text-align: center;">기본 오행</h3>
                ${renderElementBars(elementsBase)}
            </div>
            <div style="flex: 1; padding: 10px 6px; background: #fdfbf7; border-radius: 10px; border: 1px solid #e9e0d2;">
                <h3 style="font-size: 10px; margin: 0 0 10px; color: #2A365F; text-align: center;">전문가 보정</h3>
                ${renderElementBars(elements)}
            </div>
        </div>
    `;

    const htmlContent = `
        <div style="font-family: 'Nanum Myeongjo', serif; max-width: 650px; margin: 0 auto; background-color: #f8f8f5; padding: 6px; color: #333; -webkit-text-size-adjust: none;">
            <div style="background-color: #fff; border: 1px solid #D4A373; border-radius: 15px; padding: 15px 10px; box-shadow: 0 10px 40px rgba(0,0,0,0.05);">
                <div style="text-align: center; margin-bottom: 15px;">
                    <div style="display: inline-block; padding: 3px 10px; border: 1px solid #D4A373; border-radius: 50px; color: #D4A373; font-size: 8px; letter-spacing: 1px; margin-bottom: 6px;">PREMIUM SAJU REPORT</div>
                    <h1 style="color: #2A365F; font-size: 20px; margin: 0; letter-spacing: -0.5px; line-height: 1.3;">귀하의 운명에 대한 심층 사주풀이</h1>
                </div>

                <div style="background-color: #fcfaf7; border: 1px solid rgba(212, 163, 115, 0.2); border-radius: 10px; padding: 10px; margin-bottom: 12px; line-height: 1.6; text-align: center; font-size: 11px; color: #555;">
                    <span style="display: inline-block; margin: 0 3px;"><b>생년월일</b> ${inputData.birthDate}</span> | 
                    <span style="display: inline-block; margin: 0 3px;"><b>태어난 시</b> ${inputData.birthTime}</span> | 
                    <span style="display: inline-block; margin: 0 3px;"><b>성별</b> ${inputData.gender}</span>
                </div>

                <div style="background-color: #fff9f9; border: 1px solid #ffdbdb; border-radius: 8px; padding: 12px; margin-bottom: 20px; text-align: center; font-size: 11.5px; color: #d32f2f; line-height: 1.6; word-break: keep-all;">
                    <b>[청아매당 감명 안내]</b><br/>본 감명서는 귀하에게 헛된 희망을 주지 않기 위해, 운세의 길흉화복을 어떠한 미화도 없이 <b>단호한 직언(팩트폭격)</b>으로 서술하고 있으니 양지해 주시기 바랍니다.
                </div>

                    ${images?.pillar ? 
                        `<div style="margin-bottom: 25px; text-align: center;">
                            <img src="${images.pillar}" alt="Premium Saju Pillar Table" style="max-width: 100%; height: auto; border: 1.5px solid #2A365F; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);" />
                        </div>` : pillarTable}

                    ${renderSinsalGridHtml()}

                <div style="margin-bottom: 25px;">
                    <h2 style="color: #2A365F; font-size: 16px; margin-bottom: 12px; border-bottom: 1px solid #D4A373; padding-bottom: 6px;">오행 및 십성 에너지 분석</h2>
                    <p style="font-size: 11px; color: #666; margin-bottom: 15px; line-height: 1.6; word-break: keep-all;">* 원국(보정 전)은 타고난 에너지의 그릇이나, 실제 운명은 태어난 계절적 환경에 의해 크게 조율됩니다. 청아매당은 이를 정밀하게 보정하여 귀하의 <b>'실질적인 진짜 기운(보정 후)'</b>을 찾아 드립니다.</p>
                    
                    ${images?.star_base || images?.star_corrected ? `
                        <div style="margin-bottom: 25px; text-align: center;">
                            <div style="font-weight: 700; font-size: 13px; color: #D4A373; margin-bottom: 12px;">[오행 에너지 순환 분석]</div>
                            <div style="margin-bottom: 20px;">
                                <div style="font-size: 10px; color: #999; margin-bottom: 5px;">보정 전</div>
                                <img src="${images.star_base || ""}" alt="Element Base" style="width: 100%; max-width: 440px; height: auto; border-radius: 8px; border: 1px solid #eee;" />
                            </div>
                            <div style="margin-bottom: 10px;">
                                <div style="font-size: 11px; color: #D4A373; font-weight: bold; margin-bottom: 5px;">보정 후 (중요)</div>
                                <img src="${images.star_corrected || ""}" alt="Element Corrected" style="width: 100%; max-width: 500px; height: auto; border-radius: 8px; border: 1.5px solid #D4A373;" />
                            </div>
                        </div>
                    ` : ""}

                    ${images?.donut_base || images?.donut_corrected ? `
                        <div style="margin-bottom: 25px; text-align: center;">
                            <div style="font-weight: 700; font-size: 13px; color: #D4A373; margin-bottom: 12px;">[십성 분포 및 성향 분석]</div>
                            <div style="margin-bottom: 20px;">
                                <div style="font-size: 10px; color: #999; margin-bottom: 5px;">보정 전</div>
                                <img src="${images.donut_base || ""}" alt="Donut Base" style="width: 100%; max-width: 440px; height: auto; border-radius: 8px; border: 1px solid #eee;" />
                            </div>
                            <div style="margin-bottom: 10px;">
                                <div style="font-size: 11px; color: #D4A373; font-weight: bold; margin-bottom: 5px;">보정 후 (중요)</div>
                                <img src="${images.donut_corrected || ""}" alt="Donut Corrected" style="width: 100%; max-width: 500px; height: auto; border-radius: 8px; border: 1.5px solid #D4A373;" />
                            </div>
                        </div>
                    ` : ""}

                    ${images?.strength_base || images?.strength_corrected ? `
                        <div style="margin-bottom: 25px; text-align: center;">
                            <div style="font-weight: 700; font-size: 13px; color: #D4A373; margin-bottom: 12px;">[신강/신약 지수 분석]</div>
                            <div style="margin-bottom: 20px;">
                                <div style="font-size: 10px; color: #999; margin-bottom: 5px;">보정 전</div>
                                <img src="${images.strength_base || ""}" alt="Strength Base" style="width: 100%; max-width: 440px; height: auto; border-radius: 8px; border: 1px solid #eee;" />
                            </div>
                            <div style="margin-bottom: 10px;">
                                <div style="font-size: 11px; color: #D4A373; font-weight: bold; margin-bottom: 5px;">보정 후 (중요)</div>
                                <img src="${images.strength_corrected || ""}" alt="Strength Corrected" style="width: 100%; max-width: 500px; height: auto; border-radius: 8px; border: 1.5px solid #D4A373;" />
                            </div>
                        </div>
                    ` : ""}

                    ${images?.daeun ? `
                        <div style="margin-bottom: 25px; text-align: center;">
                            <div style="font-weight: 700; font-size: 12px; color: #D4A373; margin-bottom: 10px;">[나의 대운(大運) 흐름 분석]</div>
                            <div style="margin: 0 auto; max-width: 500px; border: 1.5px solid #D4A373; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                                <img src="${images.daeun}" alt="Daeun Table" style="width: 100%; height: auto; display: block;" />
                            </div>
                            <p style="font-size: 10px; color: #999; margin-top: 8px;">* 하이라이트된 부분은 현재 귀하가 위치한 대운의 시기입니다.</p>
                        </div>
                    ` : ""}
                </div>

                <div style="background-color: #2A365F; color: #fff; padding: 22px 10px; border-radius: 12px; margin-bottom: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border: 1px solid #D4A373;">
                    <h2 style="color: #D4A373; font-size: 16px; margin: 0; text-align: center; border-bottom: 1px solid rgba(212,163,115,0.2); padding-bottom: 10px;">1. 인생의 전체적인 형상 분석</h2>
                    <div style="font-size: 14px; opacity: 0.95; line-height: 1.7; margin-top: 15px; word-break: keep-all; text-align: left; white-space: pre-wrap;">${cleanForEmail(analysis.life_shape)}</div>
                </div>

                <div style="background-color: #2A365F; color: #fff; padding: 22px 10px; border-radius: 12px; margin-bottom: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border: 1px solid #D4A373;">
                    <h2 style="color: #D4A373; font-size: 16px; margin: 0; text-align: center; border-bottom: 1px solid rgba(212,163,115,0.2); padding-bottom: 10px;">2. 고민에 대한 대가의 해답</h2>
                    <div style="font-size: 14px; opacity: 0.95; line-height: 1.7; margin-top: 15px; word-break: keep-all; text-align: left; white-space: pre-wrap;">${cleanForEmail(analysis.solution)}</div>
                </div>

                ${analysis.isTotalFortune ? `
                <div style="background-color: #2A365F; color: #fff; padding: 22px 10px; border-radius: 12px; margin-bottom: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border: 1px solid #D4A373;">
                    <h2 style="color: #D4A373; font-size: 16px; margin: 0; text-align: center; border-bottom: 1px solid rgba(212,163,115,0.2); padding-bottom: 10px;">3. 분야별 상세 운세 분석</h2>
                    <div style="font-size: 14px; opacity: 0.95; line-height: 1.7; margin-top: 15px; word-break: keep-all; text-align: left; white-space: pre-wrap;">${cleanForEmail(analysis.detailed_fortune)}</div>
                </div>

                <div style="background-color: #2A365F; color: #fff; padding: 22px 10px; border-radius: 12px; margin-bottom: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border: 1px solid #D4A373;">
                    <h2 style="color: #D4A373; font-size: 16px; margin: 0; text-align: center; border-bottom: 1px solid rgba(212,163,115,0.2); padding-bottom: 10px;">4. 인생 주요 전환점 & 위험 시기</h2>
                    <div style="font-size: 14px; opacity: 0.95; line-height: 1.7; margin-top: 15px; word-break: keep-all; text-align: left; white-space: pre-wrap;">${cleanForEmail(analysis.turning_points)}</div>
                </div>

                <div style="background-color: #2A365F; color: #fff; padding: 22px 10px; border-radius: 12px; margin-bottom: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border: 1px solid #D4A373;">
                    <h2 style="color: #D4A373; font-size: 16px; margin: 0; text-align: center; border-bottom: 1px solid rgba(212,163,115,0.2); padding-bottom: 10px;">5. 대가의 개운 비책</h2>
                    <div style="font-size: 14px; opacity: 0.95; line-height: 1.7; margin-top: 15px; word-break: keep-all; text-align: left; white-space: pre-wrap;">${cleanForEmail(analysis.luck_advice)}</div>
                </div>
                ` : `
                <div style="background-color: #2A365F; color: #fff; padding: 22px 10px; border-radius: 12px; margin-bottom: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border: 1px solid #D4A373;">
                    <h2 style="color: #D4A373; font-size: 16px; margin: 0; text-align: center; border-bottom: 1px solid rgba(212,163,115,0.2); padding-bottom: 10px;">3. 성패의 시기 (2026-2028)</h2>
                    <div style="font-size: 14px; opacity: 0.95; line-height: 1.7; margin-top: 15px; word-break: keep-all; text-align: left; white-space: pre-wrap;">${cleanForEmail(analysis.timing)}</div>
                </div>

                <div style="background-color: #2A365F; color: #fff; padding: 22px 10px; border-radius: 12px; margin-bottom: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border: 1px solid #D4A373;">
                    <h2 style="color: #D4A373; font-size: 16px; margin: 0; text-align: center; border-bottom: 1px solid rgba(212,163,115,0.2); padding-bottom: 10px;">4. 대가의 개운 비책</h2>
                    <div style="font-size: 14px; opacity: 0.95; line-height: 1.7; margin-top: 15px; word-break: keep-all; text-align: left; white-space: pre-wrap;">${cleanForEmail(analysis.luck_advice)}</div>
                </div>
                `}

                <div style="text-align: center; border-top: 1px solid #eee; padding-top: 40px; margin-top: 50px;">
                    <div style="margin-bottom: 35px; padding: 25px; background: #fff; border-radius: 15px; border: 1px solid #e9e0d2; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
                        <p style="font-size: 15px; color: #2A365F; margin-bottom: 20px; font-weight: bold; font-family: 'Nanum Myeongjo', serif;">운명의 흐름은 멈추지 않습니다.</p>
                        <p style="font-size: 13px; color: #666; margin-bottom: 25px; line-height: 1.6; word-break: keep-all;">
                            내딛는 발걸음마다 새로운 인연과 도전이 당신을 기다리고 있습니다.<br/>
                            또 다른 갈림길에서 깊은 통찰이 필요하시다면 언제든 다시 찾아주세요.
                        </p>
                        <a href="https://www.cheongamaedang.com/premium-saju" style="display: inline-block; padding: 16px 35px; background: linear-gradient(135deg, #2A365F 0%, #1A1C2C 100%); color: #D4A373; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 15px; box-shadow: 0 8px 25px rgba(42,54,95,0.3); border: 1px solid #D4A373;">
                            명리 대가의 다른 조언 더 듣기 ➔
                        </a>
                    </div>

                    ${renderDictionaryHtml()}

                    <p style="margin-top: 30px; font-size: 11px; color: #bbb;">본 리포트는 데이터 보안을 위해 암호화되어 전송되었습니다.</p>
                    <p style="margin-top: 10px; font-size: 9px; color: #ccc;">© 2026 청아매당. All Rights Reserved.</p>
                </div>
            </div>
        </div>
    `;

    // 3. Email Delivery (if email provided)
    if (deliveryMethod === "email" && userEmail) {
      console.log(`[Email] Sending to ${userEmail}...`);
      
      const attachments = [];
      if (images) {
        if (images.pillar) attachments.push({ filename: 'pillar.png', content: Buffer.from(images.pillar.split(',')[1], 'base64'), cid: 'pillar', disposition: 'inline' });
        if (images.star_base) attachments.push({ filename: 'star_base.png', content: Buffer.from(images.star_base.split(',')[1], 'base64'), cid: 'star_base', disposition: 'inline' });
        if (images.star_corrected) attachments.push({ filename: 'star_corrected.png', content: Buffer.from(images.star_corrected.split(',')[1], 'base64'), cid: 'star_corrected', disposition: 'inline' });
        if (images.donut_base) attachments.push({ filename: 'donut_base.png', content: Buffer.from(images.donut_base.split(',')[1], 'base64'), cid: 'donut_base', disposition: 'inline' });
        if (images.donut_corrected) attachments.push({ filename: 'donut_corrected.png', content: Buffer.from(images.donut_corrected.split(',')[1], 'base64'), cid: 'donut_corrected', disposition: 'inline' });
        if (images.strength_base) attachments.push({ filename: 'strength_base.png', content: Buffer.from(images.strength_base.split(',')[1], 'base64'), cid: 'strength_base', disposition: 'inline' });
        if (images.strength_corrected) attachments.push({ filename: 'strength_corrected.png', content: Buffer.from(images.strength_corrected.split(',')[1], 'base64'), cid: 'strength_corrected', disposition: 'inline' });
        if (images.daeun) attachments.push({ filename: 'daeun.png', content: Buffer.from(images.daeun.split(',')[1], 'base64'), cid: 'daeun', disposition: 'inline' });
      }

      console.log("[Premium Delivery] Sending email via Resend...");
      console.log("[Premium Delivery] Sending to:", userEmail, "From:", "청아매당 <info@cheongamaedang.com>");
      try {
        const sendResult = await resend.emails.send({
          from: "청아매당 <info@cheongamaedang.com>", 
          to: [userEmail!],
          subject: `[청아매당] 프리미엄 사주 감명 결과지가 도착했습니다.`,
          html: htmlContent,
          attachments: attachments.length > 0 ? attachments : undefined
        });

        console.log("[Premium Delivery] Resend Send Result:", JSON.stringify(sendResult));
        if (sendResult.error) {
          console.error("[Premium Delivery] Resend API Error (Possible Unverified Domain):", sendResult.error);
          
          // TRY FALLBACK (Optional - depends on account settings)
          if (process.env.RESEND_FALLBACK_FROM) {
             console.log("[Premium Delivery] Retrying with fallback 'from' address...");
             await resend.emails.send({
                from: process.env.RESEND_FALLBACK_FROM,
                to: [userEmail!],
                subject: `[RETRY] [청아매당] 프리미엄 사주 감명 결과지가 도착했습니다.`,
                html: htmlContent,
                attachments: attachments.length > 0 ? attachments : undefined
             });
          }
        } else {
          console.log("[Premium Delivery] Email successfully sent according to Resend.");
        }
      } catch (resendEx: any) {
        console.error("[Premium Delivery] Resend Exception (Fatal):", resendEx.message, resendEx.stack);
      }
    }

    // 4. Save result to Redis for AlimTalk link delivery
    let resultId = orderId; // fallback to orderId
    try {
      const userInput = sajuData.userInput || {};
      // Build detailed data for SajuResultView
      const sajuRes = sajuData.sajuRes;
      const elementCounts: Record<string, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
      if (sajuRes) {
        ['year', 'month', 'day', 'hour'].forEach(p => {
          const stemEl = getElementFromChar(sajuRes[p].stemKo);
          const branchEl = getElementFromChar(sajuRes[p].branchKo);
          elementCounts[stemEl]++;
          elementCounts[branchEl]++;
        });
      }

      const flatSinsals = sajuData.sinsals ? {
        year: sajuData.sinsals.year?.branch || [],
        year_stem: sajuData.sinsals.year?.stem || [],
        month: sajuData.sinsals.month?.branch || [],
        month_stem: sajuData.sinsals.month?.stem || [],
        day: sajuData.sinsals.day?.branch || [],
        day_stem: sajuData.sinsals.day?.stem || [],
        hour: sajuData.sinsals.hour?.branch || [],
        hour_stem: sajuData.sinsals.hour?.stem || []
      } : {};

      const detailedData = {
        ...sajuData,
        table: sajuRes,
        tenGods: sajuData.correctedSipsungCounts,
        baseTenGods: sajuData.baseSipsungCounts,
        elements_ratio: sajuData.correctedPercentages,
        elements_ratio_base: sajuData.basePercentages,
        elementCounts: ['wood', 'fire', 'earth', 'metal', 'water'].reduce((acc: any, k) => { acc[k] = Math.round((sajuData.correctedPercentages[k] || 0) * 0.11); return acc; }, {}),
        elementCounts_base: ['wood', 'fire', 'earth', 'metal', 'water'].reduce((acc: any, k) => { acc[k] = Math.round((sajuData.basePercentages[k] || 0) * 0.08); return acc; }, {}),
        element_labels: sajuData.elementalLabels,
        strength: { 
          base: sajuData.baseStrength, 
          corrected: sajuData.correctedStrength 
        },
        sinsals: flatSinsals,
        yongsin: sajuData.yongsin?.eokbu || "",
        yongsin_desc: "인생의 균형을 잡아주는 핵심 기운입니다." // fallback or derived
      };

      resultId = await saveResult(orderId, {
        orderId,
        userInput: {
          name: inputData.name,
          birthDate: inputData.birthDate,
          birthTime: inputData.birthTime,
          gender: inputData.gender,
          question: inputData.userAnswers?.[0] || inputData.question || question,
        },
        analysis: reading.analysis,
        isTotalFortune, // Explicitly save flag at top level
        detailedData, // Pass all visual data
        images, // Pass captured PNGs as fallback
        yongsin: sajuData.yongsin, // Full object {johu, eokbu}
        yongsin_desc: detailedData.yongsin_desc
      });
      console.log(`[ResultStore] Result saved with resultId: ${resultId}`);
    } catch (storeError: any) {
      console.error("[ResultStore] Failed to save result:", storeError.message);
    }

    // 5. Aligo AlimTalk Delivery (Professional)
    if (deliveryMethod === "kakao" && phoneNumber) {
      console.log(`[Kakao] Sending AlimTalk via Aligo to ${phoneNumber}...`);
      try {
        await sendAlimTalk({
          receiver: phoneNumber,
          // IMPORTANT: This message MUST match the approved Aligo template UG_5237 exactly
          message: `청아매당에 귀한 발걸음 해주셔서 감사합니다. 귀하의 사주에 대한 질문의 답변이 도착 하였습니다. 감사합니다.`,
          buttons: [
            {
              name: "채널추가",
              linkType: "AC"
            },
            {
              name: "사주풀이 결과 보기",
              linkType: "WL",
              linkMo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cheongamaedang.com'}/result/${resultId}`,
              linkPc: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cheongamaedang.com'}/result/${resultId}`
            }
          ]
        });
        console.log("[Kakao] AlimTalk sent successfully.");
      } catch (alimError: any) {
        console.error("[Kakao] AlimTalk failed:", alimError.message);
      }
    }

    console.log(`[Background] Completed for Order: ${orderId}`);

  } catch (error) {
    console.error(`[Background] Error:`, error);
  }
}

function renderDictionaryHtml() {
    const categories = [
        {
            name: "1. 기초 오행 (Energy)",
            terms: ["목(木)", "화(火)", "토(土)", "금(金)", "수(水)"]
        },
        {
            name: "2. 십성 (Social & Mind)",
            terms: ["비견", "겁재", "식신", "상관", "편재", "정재", "편관", "정관", "편인", "정인"]
        },
        {
            name: "3. 에너지와 신강약 (Power)",
            terms: ["신강", "신약", "중화", "용신", "12운성", "지장간"]
        },
        {
            name: "4. 길성과 신살 (Stars & Sinsal)",
            terms: ["천을귀인", "문곡귀인", "정록", "암록", "홍염살", "천문성", "황은대사", "양인살", "백호대살", "괴강살", "도화살", "역마살", "화개살"]
        }
    ];
    
    let html = `
    <div style="margin-top: 40px; padding: 30px 20px; background-color: #fff; border: 1.5px solid #e9e0d2; border-radius: 20px; box-shadow: 0 5px 20px rgba(0,0,0,0.03);">
        <div style="text-align: center; margin-bottom: 25px;">
            <h3 style="margin: 0; color: #2A365F; font-size: 18px; display: inline-block; position: relative; padding-bottom: 10px;">
                📚 명리학 핵심 용어 사전
                <div style="position: absolute; bottom: 0; left: 10%; right: 10%; height: 2px; background: linear-gradient(90deg, transparent, #C9A050, transparent);"></div>
            </h3>
            <p style="font-size: 11px; color: #999; margin-top: 8px;">리포트의 깊은 이해를 돕기 위한 주요 용어 설명입니다.</p>
        </div>
    `;

    categories.forEach((cat) => {
        html += `
        <div style="margin-bottom: 25px;">
            <div style="background: #fdfbf7; padding: 6px 12px; border-radius: 8px; color: #C9A050; font-size: 13px; font-weight: bold; margin-bottom: 12px; border-left: 3px solid #C9A050;">
                ${cat.name}
            </div>
            <table style="width: 100%; border-collapse: collapse;">
        `;

        for (let i = 0; i < cat.terms.length; i += 2) {
            const term1 = cat.terms[i];
            const term2 = cat.terms[i+1];

            html += `<tr>`;
            if (term1) {
                html += `
                <td style="width: 50%; padding: 10px; border-bottom: 1px solid #f9f9f9; vertical-align: top;">
                    <div style="font-weight: bold; color: #2A365F; font-size: 12px; margin-bottom: 4px;">${term1}</div>
                    <div style="font-size: 10px; color: #666; line-height: 1.6; word-break: keep-all;">${SAJU_DICTIONARY[term1] || ""}</div>
                </td>
                `;
            }
            if (term2) {
                html += `
                <td style="width: 50%; padding: 10px; border-bottom: 1px solid #f9f9f9; vertical-align: top;">
                    <div style="font-weight: bold; color: #2A365F; font-size: 12px; margin-bottom: 4px;">${term2}</div>
                    <div style="font-size: 10px; color: #666; line-height: 1.6; word-break: keep-all;">${SAJU_DICTIONARY[term2] || ""}</div>
                </td>
                `;
            } else {
                html += `<td style="width: 50%; border-bottom: 1px solid #f9f9f9;"></td>`;
            }
            html += `</tr>`;
        }

        html += `
            </table>
        </div>
        `;
    });

    html += `
        <p style="margin-top: 5px; font-size: 10px; color: #bbb; text-align: center; font-style: italic;">
            * 위 용어들은 보편적인 명리학적 해석을 바탕으로 하며, 개인의 사주 명식에 따라 그 작용력은 달라질 수 있습니다.
        </p>
    </div>
    `;
    return html;
}
