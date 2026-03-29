import { Resend } from "resend";
import { fetchWithRetry, callGPTLatest, callClaudeLatest, sendAlimTalk } from "../api-utils";
import { SAJU_DICTIONARY } from "../premium-saju-utils";
import { saveResult } from "./result-store";

// AI helper functions
async function callAIDeepAnalysis(systemPrompt: string, sajuJson: any, userAnswers: any, section: 'strategy' | 'life_shape' | 'solution' | 'timing' | 'luck_advice' | 'detailed_fortune' | 'turning_points') {
  const strategyContext = (section !== 'strategy' && systemPrompt) ? `\n[핵심 일관성 가이드라인 (반드시 준수)]\n${systemPrompt}\n` : "";
  
  const instructions: any = {
    strategy: `[Phase: 핵심 분석 전략 수립 (Core Strategy)]
- 상세 분석에 앞서, 내담자의 고민과 사주를 바탕으로 흔들리지 않는 '최종 분석 전략'을 수립하십시오.
- 고민 해결이나 사업 시작 등에 가장 적절한 '최상의 시점'(예: 2026년 5월-7월)을 단 하나로 확정하십시오.
- 출력 포맷: JSON {"best_period": "시기", "yongsin_strategy": "전략", "core_advice": "조언"}`,
    life_shape: `[섹션 1: 인생의 전체적인 형상 분석 - 운명의 풍경]
- 반드시 공백 포함 **1,800자 ~ 2,500자** 범위로 작성하십시오.
- **강제 구성**: 최소 **6개 이상의 긴 문단**으로 구성하며, 각 문단은 최소 300자 이상의 밀도 있는 설명을 담아야 합니다. (문단 구분을 확실히 하십시오)
- ${strategyContext}
- **분석 도메인**: 오직 내담자의 타고난 원국(사주)이 그리는 '상징적 풍경'과 '기운의 형상'을 비유적으로 묘사하십시오. (예: 추운 겨울의 촛불, 웅장한 바위 산 등)
- **차별화**: 구체적인 질문에 대한 답이나 날짜, 개운법을 여기서 언급하지 마십시오. 오직 '정체성'과 '풍경'에만 집중하십시오.
- 시작은 내담자의 가슴을 관통하는 강렬한 운명적 비유(후킹)로 시작하십시오.
- **프리미엄 골드 강조 (필수)**: 가장 통찰력 있는 비유나 핵심 성정 문장을 반드시 **[major]내용[/major]** 태그로 감싸하십시오.`,
    solution: `[섹션 2: 고민에 대한 대가의 해답 - 명리학적 해법]
- 반드시 공백 포함 **1,800자 ~ 2,500자** 범위로 작성하십시오.
- **강제 구성**: 최소 **6개 이상의 긴 문단**으로 구성하며, 각 문단은 최소 300자 이상의 밀도 있는 설명을 담아야 합니다. (문단 구분을 확실히 하십시오)
- ${strategyContext}
- **분석 도메인**: 내담자의 구체적인 질문([Answers])에 대해 십성(Ten Gods)의 작용과 오행의 희기(喜忌)를 근거로 한 '직설적 해답'과 '논리적 이유'를 서술하십시오.
- **차별화**: 섹션 1의 비유적 묘사를 반복하지 마십시오. 여기서는 철저히 '왜 그런지'에 대한 실질적 분석과 [major]명쾌한 해답[/major]에 집중하십시오.
- **도입부 필수 형식**: 첫 문장은 반드시 '"${userAnswers[0]}"라는 질문을 하셨습니다.'와 같이 사용자의 질문을 직접 인용하며 시작하십시오. (AI가 아닌 사람처럼 느껴지도록 공감을 담으십시오.)
- **프리미엄 골드 강조 (필수)**: 가장 결정적인 조언과 해답 문장을 반드시 **[major]내용[/major]** 태그로 감싸하십시오.
- 시기는 간략히만 언급하고, 구체적인 3개년 분석은 섹션 3으로 양보하십시오.`,
    timing: `[섹션 3: 3개년 상세 운세 - 시간의 흐름]
- 반드시 공백 포함 **1,800자 ~ 2,500자** 범위로 작성하십시오.
- **강제 구성**: 최소 **6개 이상의 긴 문단**으로 구성하며, 각 연도별 최소 2문단 이상 할당하여 상세히 서술하십시오. (문단 구분을 확실히 하십시오)
- ${strategyContext}
- **분석 도메인**: 2026~2028년의 '세운(年運)'과 '월운(月運)'을 대조하여 결정적 기회와 위기의 '타이밍'만 분석하십시오. 
- **내용의 핵심**: 내담자가 선택한 메뉴("${userAnswers[0].split(': ')[1] || '선택 영역'}")를 중심으로 3년간의 운 흐름을 분석하십시오.
- **차별화**: 성격이나 개운법을 언급하지 마십시오. 오직 '언제 무엇이 일어나는가'에만 집중하며 분석을 뒤로 전진시키십시오.
- **분량 배정**: 2026년의 운세를 전체 리포트의 60% 이상으로 매우 상세히 분석하십시오.
- **프리미엄 골드 강조 (필수)**: 각 연도별 핵심 시점의 문장을 반드시 **[major]내용[/major]** 태그로 감싸하십시오.`,
    detailed_fortune: `[섹션 4: 분야별 인생 운세 분석 - 삶의 영역들]
- 반드시 공백 포함 **1,800자 ~ 2,500자** 범위로 작성하십시오.
- **강제 구성**: 최소 **6개 이상의 긴 문단**으로 구성하십시오.
- ${strategyContext}
- **분석 도메인**: 특정 날짜를 배제하고, 평생의 재물, 사업, 연애, 건강, 자녀운의 '그릇의 크기'와 '삶의 양상'을 분석하십시오.
- **참고**: 각 분야(재물, 사업 등) 분석 시 반드시 해당 십성/신살을 인용하십시오.
- **차별화**: 3개년 운세와 겹치지 않게 '평생의 명(命)'에 집중하십시오.
- **프리미엄 골드 강조**: 각 항목별 결정적인 통찰 문장을 반드시 **[major]내용[/major]** 태그로 감싸하십시오.`,
    turning_points: `[섹션 5: 인생 주요 전환점 & 위험 시기 - 운명의 변곡점]
- 반드시 공백 포함 **1,800자 ~ 2,500자** 범위로 작성하십시오.
- **강제 구성**: 최소 **6개 이상의 긴 문단**으로 구성하십시오.
- ${strategyContext}
- **분석 도메인**: 인생의 3~4개 대전환점(나이 명시)과 주의가 필요한 위험 시기를 신살과 대운을 근거로 분석하십시오.
- **프리미엄 골드 강조**: 전환점의 핵심 나이와 행동 지침을 **[major]내용[/major]** 태그로 감싸하십시오.`,
    luck_advice: `[섹션 6: 실전 개운(開運)의 비책 - 행동 강령]
- 반드시 공백 포함 **1,800자 ~ 2,500자** 범위로 작성하십시오.
- **강제 구성**: 최소 **6개 이상의 긴 문단**으로 구성하십시오.
- ${strategyContext}
- **분석 도메인**: 내담자가 즉시 실천할 수 있는 '행동', '공간', '색상', '인간관계의 태도' 등 실질적인 개운법을 서술하십시오.
- **차별화**: 앞에서 설명한 사주 풀이를 반복하지 마십시오. 오직 '앞으로 어떻게 살아야 하는가'에만 집중하십시오.
- **프리미엄 골드 강조 (필수)**: 가장 핵심적인 개운비책 문장을 반드시 **[major]내용[/major]** 태그로 감싸하십시오.`,
  };

  const promptText = `
### [전문가 정체성: 정통 명리학의 거장]
당신은 수십 년간 수만 명의 운명을 감명해 온 **정통 명리학의 거장**입니다. AI가 아닌, 내담자의 고독과 희망을 깊이 공감하는 **'살아있는 스승'**의 관점에서 서술하십시오.

[분석의 핵심 및 필수 포함 요소]
당신은 제공된 [sajuJson] 데이터를 기반으로 다음의 **14가지 핵심 요소**를 모두 입체적으로 분석하여 해답을 도출해야 합니다:
1. **천간/지지**: 원국의 구성과 합(合), 충(沖)의 작용 분석.
2. **십성(Ten Gods)**: 사회적 관계와 심리적 성향, 재능의 방향성 분석.
3. **지장간**: 내면에 숨겨진 잠재력과 결정적 순간의 변수 파악.
4. **12운성**: 기운의 성쇠와 활동성의 강도 분석.
5. **12신살 & 20종 길성**: 특수 기운이 인생 경로에 미치는 영향.
6. **오행 분포**: 에너지의 과다/부족에 따른 건강 및 성격적 균형 분석.
7. **신강/신약 지수**: 자아의 힘과 외부 환경에 대한 대응력 판단.
8. **용신(Yongsin)**: 삶의 균형을 잡아주는 핵심 기운과 개운(開運) 방법.
9. **대운(Daeun)**: 10년 주기의 거대한 환경 변화와 기회.
10. **연운/월운/일진**: 현재 시점(2026년 기준)의 구체적인 운의 흐름.

[작성 지침]
1. **100% 한글 서술 (매우 중요)**: **절대로 영어를 사용하지 마십시오.** 모든 명리 용어는 한글 또는 한글(한자) 병기 형태로만 작성하십시오.
2. **오행 편중 적대적 금지 및 전(全) 데이터 종합 분석 (최우선)**: 오로지 '오행(목화토금수)'에만 의존해서 풀이하는 것을 엄격히 금지합니다. 제공된 [sajuJson]의 **십성, 12운성, 신살, 대운** 등 모든 지표를 매 섹션마다 반드시 1회 이상 명시적으로 인용하여 입체적으로 풀이하십시오.
3. **입체적 합성 분석**: 각 데이터를 단편적으로 설명하지 마십시오. 요소 간의 상호작용을 논리적으로 융합하여 서술하십시오.
4. **표현의 다양성 및 섹션간 중복 금지 (절대 엄수)**: 동일한 단어나 문장 구조를 반복하지 마십시오. 각 섹션은 지정된 분석 도메인(풍경/해법/타이밍/조언)에만 집중해야 합니다. 이전 섹션에서 사용한 비유나 문장을 다음 섹션에서 재사용하는 것을 엄격히 금지합니다. 풍성한 어휘를 사용하십시오.
5. **명쾌한 해답 도출**: 수십 년 경력의 대가로서 **확신에 찬 해답**을 제시하십시오. 단호하고 권위 있는 어조를 유지하십시오.
6. **포맷 준수**: '올해' 대신 '2026년'을 사용하고, 지정된 태그([major]문장[/major])만 사용하십시오.
7. **어휘의 풍부함**: 대가의 품격에 걸맞은 다채로운 명리학적 표현을 사용하십시오.

[Data] ${JSON.stringify(sajuJson)}
[Answers] ${JSON.stringify(userAnswers)}

${instructions[section]}

[핵심 명령]
1. 지정된 글자 수(1,800자~2,500자) 및 **문단 구성(최소 6문단)**을 **철저히 엄수**하십시오. 분량을 채우기 위해 내용을 중복시키지 말고, 정보를 더 깊게 파고드십시오.
2. 마크다운 기호(#, *, -, 등)는 **철저히 배제**하십시오.
3. 첫 마디부터 본론으로 시작하며 인사말은 생략하십시오.
4. 분석을 항상 '뒤로 전진'시키며 연대기적 중복을 피하십시오.
`;

  try {
    const text = await callGPTLatest(promptText, "You are a top-tier Korean Saju master.");
    console.log(`[GPT API Success] Section: ${section}, Received ${text.length} characters.`);
    return text.trim();
  } catch (err: any) {
    console.warn(`[GPT Error] Falling back to Claude for section ${section}:`, err);
    try {
      return await callClaudeLatest(promptText, "You are a top-tier Korean Saju master.");
    } catch (claudeErr) {
      console.error(`[AI Error] Both GPT and Claude failed for section ${section}:`, claudeErr);
      throw claudeErr;
    }
  }
}

const stripAIMarkers = (text: string) => {
  if (!text || typeof text !== 'string') return text || "";
  
  let processed = text
    .replace(/^\{[\s\S]*?":\s*"/, '') 
    .replace(/"\s*\}$/, '')
    .replace(/\*{1,3}/g, '') 
    .replace(/---|###|```json|```/g, '')
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
    .replace(/\[\[(.*?)\]\]/g, '$1') 
    .replace(/\[?(\/?)maj[oa]r\]?/gi, '[$1major]')
    .replace(/★/g, ''); 

  processed = processed
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\n+/, '')
    .trim();

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
    console.log(`[Background] Starting analysis for Order: ${orderId}`);

    const apiKeyGemini = process.env.GEMINI_API_KEY;
    if (!apiKeyGemini) throw new Error("Missing GEMINI_API_KEY");
    
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { sajuJson, systemPrompt, userAnswers, category, question } = sajuData;
    
    const firstAnswer = userAnswers[0] || "";
    const isTotalFortune = category === "인생총운" || 
                          firstAnswer.includes("인생총운") || 
                          firstAnswer.includes("관심 영역: 인생총운");
    
    const strategyRaw = await callAIDeepAnalysis("", sajuJson, userAnswers, 'strategy');
    let strategyContext = strategyRaw;
    try {
      const sObj = JSON.parse(strategyRaw.substring(strategyRaw.indexOf('{'), strategyRaw.lastIndexOf('}') + 1));
      strategyContext = JSON.stringify(sObj);
    } catch (e) {
      console.warn("[AI] Strategy parsing failed.");
    }

    let reading: any = null;
    if (isTotalFortune) {
      const results = await Promise.all([
        callAIDeepAnalysis(strategyContext, sajuJson, userAnswers, 'life_shape'),
        callAIDeepAnalysis(strategyContext, sajuJson, userAnswers, 'solution'),
        callAIDeepAnalysis(strategyContext, sajuJson, userAnswers, 'detailed_fortune'),
        callAIDeepAnalysis(strategyContext, sajuJson, userAnswers, 'turning_points'),
        callAIDeepAnalysis(strategyContext, sajuJson, userAnswers, 'luck_advice')
      ]);
      reading = {
        analysis: {
          life_shape: stripAIMarkers(results[0]),
          solution: stripAIMarkers(results[1]),
          detailed_fortune: stripAIMarkers(results[2]),
          turning_points: stripAIMarkers(results[3]),
          luck_advice: stripAIMarkers(results[4]),
          isTotalFortune: true
        }
      };
    } else {
      const results = await Promise.all([
        callAIDeepAnalysis(strategyContext, sajuJson, userAnswers, 'life_shape'),
        callAIDeepAnalysis(strategyContext, sajuJson, userAnswers, 'solution'),
        callAIDeepAnalysis(strategyContext, sajuJson, userAnswers, 'timing'),
        callAIDeepAnalysis(strategyContext, sajuJson, userAnswers, 'luck_advice')
      ]);
      reading = {
        analysis: {
          life_shape: stripAIMarkers(results[0]),
          solution: stripAIMarkers(results[1]),
          timing: stripAIMarkers(results[2]),
          luck_advice: stripAIMarkers(results[3])
        }
      };
    }

    const cleanForEmail = (text: string): string => {
      if (!text || typeof text !== 'string') return '';
      return text
        .replace(/\[major\]([\s\S]*?)\[\/major\]/g, '<b style="color:#D4A373;">$1</b>')
        .replace(/\[major\s*\]?/g, '').replace(/\[\/major\s*\]?/g, '')
        .replace(/major\s*\]/g, '').replace(/\/major\s*\]?/g, '')
        .replace(/\[\[(.*?)\]\]/g, '<b style="color:#D4A373;">$1</b>')
        .replace(/<span[^>]*>([\s\S]*?)<\/span>/g, '$1')
        .replace(/&nbsp;/g, ' ')
        .replace(/^"?\s*[a-z_]+"\s*:\s*"?/, '').replace(/"?\s*}?\s*$/, '')
        .replace(/\*{1,3}/g, '').replace(/---|###|```/g, '')
        .trim();
    };

    const inputData = sajuData.userInput || {};
    const p = sajuData.pillarDetails || sajuData.sajuRes?.pillarDetails || {};
    
    const getElementFromChar = (char: string) => {
      if (['甲', '乙', '寅', '卯', '갑', '을', '인', '묘'].includes(char)) return 'wood';
      if (['丙', '丁', '巳', '午', '병', '정', '사', '오'].includes(char)) return 'fire';
      if (['戊', '己', '辰', '戌', '丑', '未', '무', '기', '진', '술', '축', '미'].includes(char)) return 'earth';
      if (['庚', '辛', '申', '酉', '경', '신', '유'].includes(char)) return 'metal';
      if (['壬', '癸', '亥', '子', '임', '계', '해', '자'].includes(char)) return 'water';
      return '';
    };

    const renderPillarRow = (label: string, field: string) => {
        return `<tr><td style="padding:10px;border:1px solid #eee;background:#fafafa;font-size:11px;color:#888;width:60px;">${label}</td>` + 
        ["hour", "day", "month", "year"].map(col => {
            const val = p[col]?.[field] || "-";
            return `<td style="padding:10px;border:1px solid #eee;font-size:14px;">${val}</td>`;
        }).join("") + `</tr>`;
    };

    const pillarTable = `
        <table style="width:100%;border-collapse:collapse;text-align:center;border:2px solid #2A365F;background:#fff;">
            <tr style="background:#2A365F;color:#fff;">
                <th style="padding:8px;border:1px solid #3d4a75;">구분</th>
                <th style="padding:8px;border:1px solid #3d4a75;">시(時)</th>
                <th style="padding:8px;border:1px solid #3d4a75;">일(日)</th>
                <th style="padding:8px;border:1px solid #3d4a75;">월(月)</th>
                <th style="padding:8px;border:1px solid #3d4a75;">연(年)</th>
            </tr>
            ${renderPillarRow("천간", "stemKo")}
            ${renderPillarRow("지지", "branchKo")}
        </table>
    `;

    const htmlContent = `
        <div style="font-family:serif;max-width:650px;margin:0 auto;padding:10px;background:#f8f8f5;">
            <div style="background:#fff;border:1px solid #D4A373;border-radius:15px;padding:20px;">
                <h1 style="color:#2A365F;text-align:center;">프리미엄 사주 감명 결과서</h1>
                <div style="margin:20px 0;">${pillarTable}</div>
                <div style="background:#2A365F;color:#fff;padding:20px;border-radius:10px;margin-bottom:15px;">
                    <h2 style="color:#D4A373;font-size:18px;margin-top:0;">1. 인생의 전체적인 형상 분석</h2>
                    <div style="line-height:1.8;white-space:pre-wrap;">${cleanForEmail(reading.analysis.life_shape)}</div>
                </div>
                <div style="background:#2A365F;color:#fff;padding:20px;border-radius:10px;margin-bottom:15px;">
                    <h2 style="color:#D4A373;font-size:18px;margin-top:0;">2. 고민에 대한 대가의 해답</h2>
                    <div style="line-height:1.8;white-space:pre-wrap;">${cleanForEmail(reading.analysis.solution)}</div>
                </div>
                ${reading.analysis.isTotalFortune ? `
                    <div style="background:#2A365F;color:#fff;padding:20px;border-radius:10px;margin-bottom:15px;">
                        <h2 style="color:#D4A373;font-size:18px;margin-top:0;">3. 분야별 상세 운세</h2>
                        <div style="line-height:1.8;white-space:pre-wrap;">${cleanForEmail(reading.analysis.detailed_fortune)}</div>
                    </div>
                ` : `
                    <div style="background:#2A365F;color:#fff;padding:20px;border-radius:10px;margin-bottom:15px;">
                        <h2 style="color:#D4A373;font-size:18px;margin-top:0;">3. 성패의 시기 (2026-2028)</h2>
                        <div style="line-height:1.8;white-space:pre-wrap;">${cleanForEmail(reading.analysis.timing)}</div>
                    </div>
                `}
                <div style="background:#2A365F;color:#fff;padding:20px;border-radius:10px;margin-bottom:15px;">
                    <h2 style="color:#D4A373;font-size:18px;margin-top:0;">대가의 개운 비책</h2>
                    <div style="line-height:1.8;white-space:pre-wrap;">${cleanForEmail(reading.analysis.luck_advice)}</div>
                </div>
                <div style="text-align:center;margin-top:40px;">
                    <a href="https://www.cheongamaedang.com/result/${orderId}" style="display:inline-block;padding:15px 30px;background:#2A365F;color:#D4A373;text-decoration:none;border-radius:10px;font-weight:bold;">웹에서 상세 결과 보기</a>
                </div>
                ${renderDictionaryHtml()}
            </div>
        </div>
    `;

    if (deliveryMethod === "email" && userEmail) {
        await resend.emails.send({ from: "청아매당 <info@cheongamaedang.com>", to: [userEmail], subject: "[청아매당] 프리미엄 결과지가 도착했습니다.", html: htmlContent });
    }

    const resultId = await saveResult(orderId, { orderId, userInput: inputData, analysis: reading.analysis, sajuData });

    if (deliveryMethod === "kakao" && phoneNumber) {
        await sendAlimTalk({ receiver: phoneNumber, message: `청아매당에 귀한 발걸음 해주셔서 감사합니다. 귀하의 사주에 대한 질문의 답변이 도착 하였습니다. 감사합니다.`, buttons: [{ name: "결과 보기", linkType: "WL", linkMo: "https://www.cheongamaedang.com/result/" + resultId }] });
    }

  } catch (error) {
    console.error(`[Background] Error:`, error);
  }
}

function renderDictionaryHtml() {
    const categories = [
        { name: "1. 기초 오행 (Energy)", terms: ["목(木)", "화(火)", "토(土)", "금(金)", "수(水)"] },
        { name: "2. 십성 (Social & Mind)", terms: ["비견", "겁재", "식신", "상관", "편재", "정재", "편관", "정관", "편인", "정인"] }
    ];
    return `
        <div style="margin-top:40px;border-top:1px solid #eee;padding-top:20px;">
            <p style="font-size:12px;color:#999;text-align:center;">[사주 용어 사전]</p>
            ${categories.map(c => `
                <div style="margin-bottom:15px;">
                    <div style="font-size:11px;font-weight:bold;color:#2A365F;margin-bottom:5px;">${c.name}</div>
                    <div style="font-size:10px;color:#666;">${c.terms.join(", ")}</div>
                </div>
            `).join("")}
        </div>
    `;
}
