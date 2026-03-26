import { Resend } from "resend";
import { fetchWithRetry, callGPTLatest, callClaudeLatest } from "../api-utils";

// AI helper functions
async function callAIDeepAnalysis(systemPrompt: string, sajuJson: any, userAnswers: any, section: 'strategy' | 'life_shape' | 'solution' | 'timing' | 'luck_advice') {
  const strategyContext = (section !== 'strategy' && systemPrompt) ? `\n[핵심 일관성 가이드라인 (반드시 준수)]\n${systemPrompt}\n` : "";
  
  const instructions: any = {
    strategy: `[Phase: 핵심 분석 전략 수립 (Core Strategy)]
- 상세 분석에 앞서, 내담자의 고민과 사주를 바탕으로 흔들리지 않는 '최종 분석 전략'을 수립하십시오.
- 고민 해결이나 사업 시작 등에 가장 적절한 '최상의 시점'(예: 2026년 5월-7월)을 단 하나로 확정하십시오.
- 출력 포맷: JSON {"best_period": "시기", "yongsin_strategy": "전략", "core_advice": "조언"}`,
    life_shape: `[섹션 1: 인생의 전체적인 형상 분석]
- 반드시 공백 포함 **1,500자 ~ 1,800자** 범위로 작성하십시오.
- ${strategyContext}
- **위 가이드라인을 '바탕'으로 하되, 절대로 날짜나 시기(연도/월)를 구체적으로 언급하지 마십시오.** (그것은 섹션 3의 역할입니다.)
- 오직 내담자의 타고난 원국의 기운, 성정, 인생의 전체적인 풍경과 형상을 비유적으로 묘사하는 데에만 집중하십시오.
- 시작은 내담자의 가슴을 관통하는 강렬한 운명적 비유(후킹)로 시작하십시오.`,
    solution: `[섹션 2: 고민에 대한 대가의 해답]
- 반드시 공백 포함 **2,500자 ~ 3,000자** 범위로 작성하십시오.
- ${strategyContext}
- **섹션 1에서 다룬 운명적 형상을 반복하지 마십시오.**
- 내담자의 구체적인 고민("${userAnswers[0]}")에 대해 직접적이고 명쾌한 해답을 제시하십시오.
- 시기는 간략히만 언급하고, 구체적인 3개년 분석은 섹션 3으로 양보하십시오.`,
    timing: `[섹션 3: 성패의 시기 (2026-2028)]
- 반드시 공백 포함 **1,800자 ~ 2,200자** 범위로 작성하십시오.
- ${strategyContext}
- **이 리포트에서 2026, 2027, 2028년의 연도별 흐름을 가장 상세히 다루는 유일한 섹션입니다.**
- 앞선 섹션들의 내용을 반복하여 분량을 채우지 말고, 오직 '운의 타이밍' 분석에만 집중하십시오.`,
    luck_advice: `[섹션 4: 개운(開運)의 비책]
- 반드시 공백 포함 **1,000자 ~ 1,200자** 범위로 작성하십시오.
- ${strategyContext}
- **시기 분석이나 고민 해답을 반복하지 마십시오.**
- 일상에서 실천 가능한 철학적이고 비유적인 비책(행동, 습관 등)을 제시하십시오.`
  };

  const promptText = `
### [전문가 정체성: 정통 명리학의 거장]
당신은 수십 년간 수만 명의 운명을 감명해 온 **정통 명리학의 거장**입니다. AI가 아닌, 내담자의 고독과 희망을 깊이 공감하는 **'살아있는 스승'**의 관점에서 서술하십시오.

[작성 지침]
1. **명쾌한 해답 도출 (최우선)**: 내담자의 구체적인 질문([Answers])에 대해 모호한 태도를 버리고, 수십 년 경력의 대가로서 **확신에 찬 해답**을 제시하십시오. "관찰됩니다", "가능성이 있습니다"와 같은 표현보다는 "~이(가) 분명합니다", "~해야만 합니다"와 같은 단호한 어조를 사용하십시오.
2. **시기 분석의 정밀성**: 질문에 "언제", "어느 때", "시기" 등의 단어가 포함된 경우, 제공된 사주 데이터(대운/세운 등)를 기반으로 **"2026년 늦가을", "2026년 9월에서 11월 사이"**와 같이 구체적인 시점을 명확히 짚어주십시오. 근거 없는 희망 고문이 아닌, 기운의 흐름에 근거한 실질적 타이밍을 제시하십시오. 이때 '올해'라는 단어 대신 반드시 '2026년'이라고 쓰십시오.
3. **용어 통일 (올해 -> 2026년)**: '올해', '금년'이라는 모호한 표현은 절대 사용하지 마십시오. 모든 시점 언급은 반드시 **'2026년'** 또는 **'2026'**으로 명시하십시오.
4. **특수 기호 절대 사용 금지**: ** 기호(bold)를 포함한 모든 마크다운 강조 기호나 특수 기호를 절대 사용하지 마십시오. 강조는 지정된 커스텀 태그([[단어]], [major]문장[/major])로만 수행하십시오.
5. **부드럽고 품격 있는 말투**: 대가의 무게감이 느껴지도록 격식 있고 통찰력 있는 표현을 사용하십시오.

[Data] ${JSON.stringify(sajuJson)}
[Answers] ${JSON.stringify(userAnswers)}

${instructions[section]}

[핵심 명령]
1. 지정된 글자 수(공백 포함) 범위를 **철저히 엄수**하십시오. 
2. 마크다운 기호(#, *, -, 등)는 **철저히 배제**하십시오. 특히 ** 이중 별표는 절대로 쓰지 마십시오. (쓰는 즉시 오류로 간주됨)
3. '올해' 대신 반드시 '2026년'으로 표기하십시오.
4. 기계적인 서론/본론/결론 구분 없이 유려한 산문 형태로 작성하십시오.
5. 첫 마디부터 본론의 후킹으로 시작하며 "안녕하세요" 등의 인사말은 일절 생략하십시오.
`;

  try {
    // GPT 5.1 is now the primary engine
    const text = await callGPTLatest(promptText, "You are a top-tier Korean Saju master.");
    console.log(`[GPT API Success] Section: ${section}, Received ${text.length} characters.`);
    return text.trim();
  } catch (err) {
    console.warn(`[GPT Error] Falling back to Claude for section ${section}:`, err);
    // Fallback to Claude 4.6 Sonnet
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
    .replace(/\*{1,3}/g, '') // Remove all types of asterisk formatting (*, **, ***)
    .replace(/---|###|```json|```/g, '')
    .replace(/\(올해\)/g, '(2026년)')
    .replace(/\s올해\s/g, ' 2026년 ')
    .replace(/\\n/g, '\n')
    .replace(/\[\[(.*?)\]\]/g, '<span style="color: #D4AF37; font-weight: bold;">$1</span>')
    .replace(/\[major\](.*?)\[\/major\]/g, '<span style="color: #D4AF37; font-weight: bold; border-bottom: 2px solid rgba(212,163,115,0.3); padding-bottom: 1px;">$1</span>')
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
  userEmail: string;
  kakaoToken?: string;
  sajuData: any;
  orderId: string;
  deliveryMethod?: "email" | "kakao";
  images?: Record<string, string>;
}) {
  const { userEmail, kakaoToken, sajuData, orderId, deliveryMethod = "email", images } = params;

  try {
    console.log(`[Background] Starting analysis for Order: ${orderId}, Email: ${userEmail}`);

    const apiKeyGemini = process.env.GEMINI_API_KEY;
    console.log(`[Background] Gemini Key presence: ${!!apiKeyGemini}, Resend Key presence: ${!!process.env.RESEND_API_KEY}`);
    if (!apiKeyGemini) throw new Error("Missing GEMINI_API_KEY");
    
    // Initialize Resend inside function for environment safety
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { sajuJson, systemPrompt, userAnswers } = sajuData;

    // 1. AI Analysis (Core Strategy first, then multi-stage)
    console.log(`[AI] Starting analysis pipeline (Strategy -> Parallel Detailed Stages)...`);
    const partStart = Date.now();
    
    let reading: any = null;
    try {
        // Step A: Generate Core Strategy (Yongsin & Best Period)
        const strategyRaw = await callAIDeepAnalysis(systemPrompt, sajuJson, userAnswers, 'strategy');
        let strategyContext = strategyRaw;
        try {
          // Verify if it's JSON, if not, or malformed, just use the string
          const sObj = JSON.parse(strategyRaw.substring(strategyRaw.indexOf('{'), strategyRaw.lastIndexOf('}') + 1));
          strategyContext = JSON.stringify(sObj);
        } catch (e) {
          console.warn("[AI] Core Strategy JSON parsing failed, using raw text as context.");
        }

        // Step B: Generate Detailed Sections based on Strategy
        const [part1, part2, part3, part4] = await Promise.all([
          callAIDeepAnalysis(strategyContext, sajuJson, userAnswers, 'life_shape'),
          callAIDeepAnalysis(strategyContext, sajuJson, userAnswers, 'solution'),
          callAIDeepAnalysis(strategyContext, sajuJson, userAnswers, 'timing'),
          callAIDeepAnalysis(strategyContext, sajuJson, userAnswers, 'luck_advice')
        ]);
      
      console.log(`[AI] All parts completed in ${Date.now() - partStart}ms`);
      
      reading = {
        analysis: {
          life_shape: stripAIMarkers(part1),
          solution: stripAIMarkers(part2),
          timing: stripAIMarkers(part3),
          luck_advice: stripAIMarkers(part4),
        }
      };
    } catch (aiError: any) {
       console.error(`[AI] Parallel analysis failed:`, aiError.message, aiError.stack);
       throw aiError;
    }

    if (!reading) throw new Error("AI Analysis returned null result");

    // 2. Data Preparation
    const analysis = reading.analysis || {};
    const userInput = sajuData.userInput || {};
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
                    if (field === "sinsal") val = (majorSals[col] || []).filter((s: string) => !s.includes("귀인") && s !== "공망")[0] || "-";
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
                ${renderPillarRow("12신살", "sinsal", true)}
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

                <div style="background-color: #fcfaf7; border: 1px solid rgba(212, 163, 115, 0.2); border-radius: 10px; padding: 10px; margin-bottom: 20px; line-height: 1.6; text-align: center; font-size: 11px; color: #555;">
                    <span style="display: inline-block; margin: 0 3px;"><b>생년월일</b> ${userInput.birthDate}</span> | 
                    <span style="display: inline-block; margin: 0 3px;"><b>태어난 시</b> ${userInput.birthTime}</span> | 
                    <span style="display: inline-block; margin: 0 3px;"><b>성별</b> ${userInput.gender}</span>
                </div>

                    ${images?.pillar ? 
                        `<div style="margin-bottom: 25px; text-align: center;">
                            <img src="${images.pillar}" alt="Premium Saju Pillar Table" style="max-width: 100%; height: auto; border: 1.5px solid #2A365F; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);" />
                        </div>` : pillarTable}

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
                    <div style="font-size: 14px; opacity: 0.95; line-height: 1.7; margin-top: 15px; word-break: keep-all; text-align: left; white-space: pre-wrap;">${analysis.life_shape}</div>
                </div>

                <div style="background-color: #2A365F; color: #fff; padding: 22px 10px; border-radius: 12px; margin-bottom: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border: 1px solid #D4A373;">
                    <h2 style="color: #D4A373; font-size: 16px; margin: 0; text-align: center; border-bottom: 1px solid rgba(212,163,115,0.2); padding-bottom: 10px;">2. 고민에 대한 대가의 해답</h2>
                    <div style="font-size: 14px; opacity: 0.95; line-height: 1.7; margin-top: 15px; word-break: keep-all; text-align: left; white-space: pre-wrap;">${analysis.solution}</div>
                </div>

                <div style="background-color: #2A365F; color: #fff; padding: 22px 10px; border-radius: 12px; margin-bottom: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border: 1px solid #D4A373;">
                    <h2 style="color: #D4A373; font-size: 16px; margin: 0; text-align: center; border-bottom: 1px solid rgba(212,163,115,0.2); padding-bottom: 10px;">3. 성패의 시기 (2026-2028)</h2>
                    <div style="font-size: 14px; opacity: 0.95; line-height: 1.7; margin-top: 15px; word-break: keep-all; text-align: left; white-space: pre-wrap;">${analysis.timing}</div>
                </div>

                <div style="background-color: #2A365F; color: #fff; padding: 22px 10px; border-radius: 12px; margin-bottom: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border: 1px solid #D4A373;">
                    <h2 style="color: #D4A373; font-size: 16px; margin: 0; text-align: center; border-bottom: 1px solid rgba(212,163,115,0.2); padding-bottom: 10px;">4. 개운(開운)의 비책</h2>
                    <div style="font-size: 14px; opacity: 0.95; line-height: 1.7; margin-top: 15px; word-break: keep-all; text-align: left; white-space: pre-wrap;">${analysis.luck_advice}</div>
                </div>

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

                    <p style="margin-top: 30px; font-size: 11px; color: #bbb;">본 리포트는 데이터 보안을 위해 암호화되어 전송되었습니다.</p>
                    <p style="margin-top: 10px; font-size: 9px; color: #ccc;">© 2026 청아매당. All Rights Reserved.</p>
                </div>
            </div>
        </div>
    `;

    // 3. Email Delivery
    if (deliveryMethod === "email") {
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
          to: [userEmail],
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
                to: [userEmail],
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

    // 4. Kakao Memo Delivery (Optional)
    if (deliveryMethod === "kakao" && kakaoToken) {
      await fetch('https://kapi.kakao.com/v2/api/talk/memo/default/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${kakaoToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          template_object: JSON.stringify({
            object_type: 'feed',
            content: {
              title: '청아매당 PREMIUM 명리 기록서 도착',
              description: '귀하만을 위한 정밀 분석 기록서가 완성되었습니다.',
              image_url: 'https://www.cheongamaedang.com/cheong_a_mae_dang_final_logo.png',
              link: { mobile_web_url: `https://www.cheongamaedang.com/success?orderId=${orderId}&show=true`, web_url: `https://www.cheongamaedang.com/success?orderId=${orderId}&show=true` },
            },
            buttons: [{ 
              title: '기록서 보기', 
              link: { mobile_web_url: `https://www.cheongamaedang.com/success?orderId=${orderId}&show=true`, web_url: `https://www.cheongamaedang.com/success?orderId=${orderId}&show=true` } 
            }],
          })
        })
      }).catch(e => console.error("Kakao error:", e));
    }

    console.log(`[Background] Completed for Order: ${orderId}`);

  } catch (error) {
    console.error(`[Background] Error:`, error);
  }
}
