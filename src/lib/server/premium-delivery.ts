import { Resend } from "resend";
import { getElementFromChar } from "@/lib/premium-saju-utils";

const resend = new Resend(process.env.RESEND_API_KEY);

// Aligo SMS/AlimTalk API
async function sendAligoMessage(params: {
  receiver: string;
  message: string;
}) {
  const { receiver, message } = params;
  const apiKey = process.env.ALIGO_API_KEY;
  const userId = process.env.ALIGO_USER_ID;
  const sender = process.env.ALIGO_SENDER;

  if (!apiKey || !userId || !sender) {
    console.warn("[Aligo] Missing configuration, skipping SMS.");
    return;
  }

  const formData = new URLSearchParams();
  formData.append("key", apiKey);
  formData.append("user_id", userId);
  formData.append("sender", sender);
  formData.append("receiver", receiver);
  formData.append("msg", message);
  formData.append("msg_type", "SMS");

  try {
    const res = await fetch("https://apis.aligo.in/send/", {
      method: "POST",
      body: formData,
    });
    const result = await res.json();
    console.log("[Aligo] Send Result:", result);
    return result;
  } catch (err) {
    console.error("[Aligo] Send Error:", err);
  }
}

// AI helper functions
async function callGemini(apiKey: string, sajuJson: any, userAnswers: any) {
  const modelId = 'gemini-2.5-flash';
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

  const promptText = `
[Data] ${JSON.stringify(sajuJson)}
[Answers] ${JSON.stringify(userAnswers)}

### [Phase 1: 11분법 오행 산출 및 요약]
당신은 명리 데이터 전문가로서 아래 정보를 바탕으로 정확한 오행 비율과 용신을 판별해야 합니다.

1. **가중치 (총 11점)**: 
   - 천간(Stems): 연(1.0점), 월(1.5점), 일(1.5점), 시(1.0점)
   - 지지(Branches): 연(1.0점), 월(3.0점), 일(1.0점), 시(1.0점)
2. **조후 보정(겨울/습토)**: 
   - 사주 내 모든 '축토(丑)'와 '진토(辰)'의 가중치 점수를 100% 수(水) 기운으로 전환하십시오.

### [Phase 3: 출력 포맷 (Strict JSON ONLY)]
{
  "headline": "귀하의 질문을 명리학적으로 풀어낸 답변입니다.",
  "subheadline": "내담자의 현재 상황을 관통하는 통찰 (한 문장)",
  "yongsin": "청아매당 대가가 판별한 용신 (예: 목(木), 화(火))",
  "yongsin_desc": "용신에 대한 매우 간결한 설명",
  "basic_elements": {"wood": 0, "fire": 0, "earth": 0, "metal": 0, "water": 0},
  "corrected_elements": {"wood": 0, "fire": 0, "earth": 0, "metal": 0, "water": 0},
  "correction_reason": "보정의 의미 (우아한 표현)"
}
`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });

  if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);
  const resJson = await response.json();
  const text = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned empty text");
  let s = text.indexOf('{'), e = text.lastIndexOf('}');
  return JSON.parse(text.substring(s, e + 1));
}

async function callClaudeSection(apiKey: string, systemPrompt: string, sajuJson: any, userAnswers: any, section: 'life_shape' | 'solution' | 'timing_advice', geminiKey: string) {
  const modelId = 'gemini-2.5-flash';
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${geminiKey}`;

  const instructions = {
    life_shape: '### [태스크: 인생의 전체적인 형상 분석]\n제공된 사주 데이터를 바탕으로 내담자의 삶의 궤적과 그릇을 품격 있게 서술하십시오. 약 1,000자 내외 작성이 목표입니다. 출력 포맷은 오직 JSON {"life_shape": "내용"} 입니다.',
    solution: '### [태스크: 고민에 대한 심층 해답 및 영역별 조언]\n내담자의 질문(${JSON.stringify(userAnswers)})에 대해 명리학적 근거를 바탕으로 상세하게 해답을 제시하십시오. 약 2,000자 내외 작성이 목표입니다. 출력 포맷은 오직 JSON {"solution": "내용"} 입니다.',
    timing_advice: '### [태스크: 성패 시기 및 개운 비책]\n2026-2028년의 운의 흐름과 실천 가능한 개운 비책을 서술하십시오. 약 1,000자 내외 작성이 목표입니다. 출력 포맷은 오직 JSON {"timing": "내용", "luck_advice": "내용"} 입니다.'
  };

  const promptText = `
${systemPrompt}

[Data] ${JSON.stringify(sajuJson)}
[Answers] ${JSON.stringify(userAnswers)}

${instructions[section]}

[주의] 절대 요약하지 말고, 대가의 깊이 있는 통찰을 모든 문장에 녹여내어 압도적인 분량으로 작성하십시오.
`;

  const response = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: { 
        responseMimeType: "application/json",
        maxOutputTokens: 4096
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Error (${section}): ${response.status} - ${errorText}`);
  }
  const resJson = await response.json();
  const text = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error(`Gemini returned empty for ${section}`);

  try {
    let s = text.indexOf('{'), e = text.lastIndexOf('}');
    if (s === -1) throw new Error("No JSON object found");
    return JSON.parse(text.substring(s, e + 1));
  } catch (err) {
    console.error(`[AI] JSON Parse Failed for ${section}. Returning raw text.`, err);
    // Fallback: If JSON fails, the output might be truncated. 
    // Return a dummy object with the text as the value to prevent crashes.
    const fallback: any = {};
    fallback[section] = text;
    return fallback;
  }
}

const stripAIMarkers = (text: string) => {
  if (!text || typeof text !== 'string') return text || "";
  return text.replace(/\*\*\*|---|###|```json|```/g, '').trim();
};

export async function processAndDeliverPremiumSaju(params: {
  userEmail: string;
  kakaoToken?: string;
  sajuData: any;
  orderId: string;
  deliveryMethod?: "email" | "kakao"; // Added
}) {
  const { userEmail, kakaoToken, sajuData, orderId, deliveryMethod = "email" } = params;

  try {
    console.log(`[Background] Starting analysis for Order: ${orderId}, Email: ${userEmail}`);

    const apiKeyAnthropic = process.env.ANTHROPIC_API_KEY;
    const apiKeyGemini = process.env.GEMINI_API_KEY;

    console.log(`[API Check] Anthropic: ${apiKeyAnthropic ? `Found (${apiKeyAnthropic.length})` : "MISSING!"}`);
    console.log(`[API Check] Gemini: ${apiKeyGemini ? `Found (${apiKeyGemini.length})` : "MISSING!"}`);

    if (!apiKeyAnthropic || !apiKeyGemini) throw new Error("Missing API Keys in process.env");

    const { sajuJson, systemPrompt, userAnswers } = sajuData;

    // 1. AI Analysis
    console.log(`[AI] Starting concurrent analysis (Claude + Gemini)... Expected: 60-90s`);
    const [geminiResult, part1, part2, part3] = await Promise.all([
      callGemini(apiKeyGemini, sajuJson, userAnswers).then(res => { console.log("[AI] Gemini Analysis Finished"); return res; }),
      callClaudeSection(apiKeyAnthropic, systemPrompt, sajuJson, userAnswers, 'life_shape', apiKeyGemini).then(res => { console.log("[AI] Gemini (Life Shape) Finished"); return res; }),
      callClaudeSection(apiKeyAnthropic, systemPrompt, sajuJson, userAnswers, 'solution', apiKeyGemini).then(res => { console.log("[AI] Gemini (Solution) Finished"); return res; }),
      callClaudeSection(apiKeyAnthropic, systemPrompt, sajuJson, userAnswers, 'timing_advice', apiKeyGemini).then(res => { console.log("[AI] Gemini (Timing) Finished"); return res; })
    ]);

    console.log("[AI] All sections generated. Formatting report...");

    const reading = {
      ...geminiResult,
      analysis: {
        title: "운명의 대전환점 분석 리포트",
        life_shape: stripAIMarkers(part1),
        solution: stripAIMarkers(part2),
        timing: stripAIMarkers(part3),
      },
      luck_advice: "위의 타이밍 분석에 개운의 비책이 모두 포함되어 있습니다. 내용을 정독하시어 삶의 지표로 삼으시길 바랍니다."
    };

    // 2. Email Delivery (Resend)
    const analysis = reading.analysis || {};
    const p = sajuData.sajuRes.pillarDetails || {};
    const dSeq = sajuData.sajuJson.daeun_sequence || [];
    const elements = reading.corrected_elements || reading.basic_elements || sajuData.correctedPercentages || {};
    const elLabels = sajuData.elementalLabels || {};
    const s12 = sajuData.stages12 || {};
    const majorSals = sajuData.majorSals || {};
    const strength = sajuData.correctedStrength || sajuData.baseStrength || {};

    const elColors: any = { wood: "#2ecc71", fire: "#e74c3c", earth: "#f1c40f", metal: "#95a5a6", water: "#3498db" };
    const elNames: any = { wood: "목(木)", fire: "화(火)", earth: "토(土)", metal: "금(金)", water: "수(水)" };

    const getElStyle = (char: string) => {
        const el = getElementFromChar(char);
        return `color: ${elColors[el]}; font-weight: bold;`;
    };

    const renderPillarCell = (col: string) => {
        const pDet = p[col] || {};
        const stem = pDet.stem || "-";
        const branch = pDet.branch || "-";
        const stemKo = pDet.stemKo || "";
        const branchKo = pDet.branchKo || "";
        
        // Correct Field Mapping for Ten Gods (Sipsung)
        const tenGodStem = pDet.stemTenGod || (col === 'day' ? "일간" : "-");
        const tenGodBranch = pDet.branchTenGod || "-";
        
        const stage = s12[col] || "-";
        const allSals = majorSals[col] || [];
        const salsOnly = allSals.filter((s: string) => !s.includes("귀인") && s !== "공망").join("<br/>") || "-";
        const gwiinOnly = allSals.filter((s: string) => s.includes("귀인") || s === "공망").join("<br/>") || "-";

        return `
            <td style="padding: 15px 5px; border: 1px solid #eee; width: 25%; vertical-align: top;">
                <div style="font-size: 11px; color: #888; margin-bottom: 8px;">${tenGodStem}</div>
                <div style="margin-bottom: 12px; background: #fdfbf7; padding: 10px; border-radius: 10px; border: 1px solid #f0e6d2;">
                    <span style="display: block; font-size: 24px; ${getElStyle(stemKo)}">${stem}</span>
                    <span style="display: block; font-size: 10px; color: #999; margin-top: -2px;">${stemKo}</span>
                </div>
                <div style="margin-bottom: 12px; background: #fdfbf7; padding: 10px; border-radius: 10px; border: 1px solid #f0e6d2;">
                    <span style="display: block; font-size: 24px; ${getElStyle(branchKo)}">${branch}</span>
                    <span style="display: block; font-size: 10px; color: #999; margin-top: -2px;">${branchKo}</span>
                </div>
                <div style="font-size: 11px; color: #888; margin-bottom: 8px;">${tenGodBranch}</div>
                <div style="font-size: 11px; color: #3d4a75; font-weight: bold; margin-bottom: 8px;">${stage}</div>
                <div style="font-size: 10px; color: #d63384; margin-bottom: 10px; min-height: 20px;">${salsOnly}</div>
                <div style="font-size: 10px; color: #D4A373; font-weight: bold;">${gwiinOnly}</div>
            </td>
        `;
    };

    const pillarTable = `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; text-align: center; border: 2px solid #2A365F; border-radius: 15px; overflow: hidden; background: #fff;">
            <tr style="background: #2A365F; color: #fff; font-size: 13px;">
                <th style="padding: 12px; border: 1px solid #3d4a75;">시(時)</th>
                <th style="padding: 12px; border: 1px solid #3d4a75;">일(日)</th>
                <th style="padding: 12px; border: 1px solid #3d4a75;">월(月)</th>
                <th style="padding: 12px; border: 1px solid #3d4a75;">연(年)</th>
            </tr>
            <tr>
                ${renderPillarCell('hour')}
                ${renderPillarCell('day')}
                ${renderPillarCell('month')}
                ${renderPillarCell('year')}
            </tr>
        </table>
    `;

    const elementsBase = sajuData.basePercentages || {};
    
    const renderElementBars = (dataset: any) => {
        return Object.entries(dataset).map(([el, score]: [any, any]) => {
            const percent = Math.round(score);
            return `
                <div style="margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px;">
                        <span style="font-weight: bold; color: ${elColors[el]}">${elNames[el]}</span>
                        <span>${percent}%</span>
                    </div>
                    <div style="width: 100%; height: 6px; background: #eee; border-radius: 3px; overflow: hidden;">
                        <div style="width: ${percent}%; height: 100%; background: ${elColors[el]}; border-radius: 3px;"></div>
                    </div>
                </div>
            `;
        }).join("");
    };

    const elementComparisonHtml = `
        <div style="display: flex; gap: 20px; margin-bottom: 30px;">
            <div style="flex: 1; padding: 15px; background: #fafafa; border-radius: 12px; border: 1px solid #eee;">
                <h3 style="font-size: 13px; margin: 0 0 15px; color: #666; text-align: center;">기본 오행 (보정 전)</h3>
                ${renderElementBars(elementsBase)}
            </div>
            <div style="flex: 1; padding: 15px; background: #fdfbf7; border-radius: 12px; border: 1px solid #e9e0d2;">
                <h3 style="font-size: 13px; margin: 0 0 15px; color: #2A365F; text-align: center;">전문가 보정 (보정 후)</h3>
                ${renderElementBars(elements)}
            </div>
        </div>
    `;

    const htmlContent = `
        <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #333; line-height: 1.8; background-color: #fcf9f4;">
            <div style="text-align: center; margin-bottom: 40px; border-bottom: 4px double #D4A373; padding-bottom: 30px; background: #fff; padding: 40px 20px; border-radius: 20px 20px 0 0;">
                <h1 style="color: #2A365F; font-size: 28px; margin: 0; letter-spacing: -1px; font-weight: 800;">PREMIUM 명리 기록서</h1>
                <p style="color: #D4A373; font-size: 16px; font-weight: 600; margin: 15px 0 0; letter-spacing: 2px;">청아매당 大家의 심층 분석</p>
                <div style="display: inline-block; margin-top: 20px; padding: 5px 15px; background: #2A365F; color: #fff; border-radius: 20px; font-size: 12px;">관리번호: ${orderId}</div>
            </div>
            
            <div style="background: #fff; padding: 35px 25px; border-radius: 0 0 20px 20px; box-shadow: 0 15px 40px rgba(0,0,0,0.04);">
                <div style="margin-bottom: 45px;">
                    <h2 style="color: #2A365F; font-size: 20px; margin-bottom: 25px; border-bottom: 1px solid #eee; padding-bottom: 10px;">★ 귀하의 원국 (四柱)</h2>
                    ${pillarTable}
                </div>

                <div style="margin-bottom: 45px;">
                    <h2 style="color: #2A365F; font-size: 20px; margin-bottom: 25px; border-bottom: 1px solid #eee; padding-bottom: 10px;">★ 오행 분석 리포트 (보정 비교)</h2>
                    ${elementComparisonHtml}
                    <div style="margin-top: -10px; padding: 15px; background: #fff; border-radius: 10px; border: 1px solid #eee;">
                        <span style="font-size: 14px; font-weight: bold; color: #2A365F;">최종 판정: 내담자님은 현재 "${strength.label || ""}" 상태입니다.</span>
                        <p style="font-size: 13px; color: #666; margin: 8px 0 0;">* 조후(겨울/습토) 보정과 가중치 분석이 완료된 결과입니다.</p>
                    </div>
                </div>

                <div style="margin-bottom: 45px; background: #fff; border: 1px solid #D4A373; padding: 30px; border-radius: 20px;">
                    <h2 style="color: #2A365F; font-size: 22px; margin-top: 0; text-align: center;">인생의 전체적인 형상 분석</h2>
                    <div style="font-size: 16px; color: #444; word-break: keep-all; line-height: 2.0; text-align: justify;">
                        ${analysis.life_shape?.replace(/\n/g, '<br/>')}
                    </div>
                </div>

                <div style="margin-bottom: 45px;">
                    <h2 style="color: #2A365F; font-size: 20px; margin-bottom: 25px; border-bottom: 1px solid #eee; padding-bottom: 10px;">★ 고민에 대한 대가의 해답</h2>
                    <div style="font-size: 16px; color: #333; word-break: keep-all; line-height: 2.0; background: #f9f9f9; padding: 30px; border-radius: 15px;">
                        ${analysis.solution?.replace(/\n/g, '<br/>')}
                    </div>
                </div>

                <div style="margin-bottom: 45px;">
                    <h2 style="color: #2A365F; font-size: 20px; margin-bottom: 25px; border-bottom: 1px solid #eee; padding-bottom: 10px;">★ 성패의 시기 (2026-2028)</h2>
                    <div style="font-size: 16px; color: #444; word-break: keep-all; line-height: 2.0;">
                        ${analysis.timing?.replace(/\n/g, '<br/>')}
                    </div>
                </div>

                <div style="background-color: #2A365F; color: #fff; padding: 40px 30px; border-radius: 25px; margin-bottom: 50px; box-shadow: 0 20px 40px rgba(42, 54, 95, 0.3); border: 2px solid #D4A373;">
                    <h2 style="color: #D4A373; font-size: 24px; margin-top: 0; text-align: center; border-bottom: 1px solid rgba(212, 163, 115, 0.3); padding-bottom: 15px;">개운(開運)의 비책</h2>
                    <div style="font-size: 16px; opacity: 0.95; line-height: 2.0; margin-top: 25px; word-break: keep-all;">
                        ${reading.luck_advice?.replace(/\n/g, '<br/>')}
                    </div>
                </div>

                <div style="margin-top: 30px; padding: 20px; border: 1px solid #e9e0d2; border-radius: 12px; background: #fff; margin-bottom: 40px;">
                    <h3 style="margin-top: 0; font-size: 16px; color: #2A365F;">귀하의 대운 흐름</h3>
                    <table style="width: 100%; border-collapse: collapse; text-align: center;">
                        <tr>
                            ${dSeq.map((d: any) => {
                                const isCurrent = (sajuData.sajuJson.user_info.current_age >= d.age && sajuData.sajuJson.user_info.current_age < d.age + 10);
                                return `
                                    <td style="padding: 10px 5px; border: 1px solid ${isCurrent ? '#D4A373' : '#eee'}; border-radius: 8px; background: ${isCurrent ? '#fdfbf7' : '#fff'};">
                                        <div style="font-size: 10px; color: #999;">${d.age}세</div>
                                        <div style="font-size: 14px; font-weight: bold; color: #333; margin: 4px 0;">${d.ganji}</div>
                                        <div style="font-size: 9px; color: #888;">${d.tenGods || ""}</div>
                                    </td>
                                `;
                            }).join("")}
                        </tr>
                    </table>
                </div>

                <div style="text-align: center; font-size: 13px; color: #999; border-top: 1px solid #eee; padding-top: 40px; margin-top: 50px;">
                    <p style="margin-bottom: 20px;">본 리포트의 모든 분석은 데이터 보안을 위해 암호화되어 관리됩니다.</p>
                    <a href="https://www.cheongamaedang.com/success?orderId=${orderId}&show=true&skip=true" style="display: inline-block; padding: 16px 45px; background: #D4A373; color: white; text-decoration: none; border-radius: 15px; font-weight: bold; font-size: 16px; box-shadow: 0 8px 20px rgba(212, 163, 115, 0.4);">온라인 기록서 전문 보기</a>
                    <p style="margin-top: 35px; font-size: 11px;">© 2026 청아매당. 본 결과지의 무단 전재 및 배포를 금합니다.</p>
                </div>
            </div>
        </div>
    `;

    // 2. Email Delivery via Resend
    if (deliveryMethod === "email") {
      console.log(`[Background] Attempting to send Email to: ${userEmail}...`);
      try {
        const { data, error } = await resend.emails.send({
          from: "청아매당 <info@cheongamaedang.com>", 
          to: [userEmail],
          subject: `[청아매당] 프리미엄 사주 감명 결과지가 도착했습니다.`,
          html: htmlContent,
        });

        if (error) {
          console.error(`[Email] Resend API Error:`, error.message);
        } else {
          console.log(`[Email] Sent successfully! Message ID: ${data?.id}`);
        }
      } catch (err: any) {
        console.error(`[Email] Runtime Error:`, err.message);
      }
    }

    // 3. Kakao/SMS Delivery (Aligo Fallback)
    // We'll also try the Kakao Memo API if a token is available, 
    // but Aligo is our primary "external" delivery provider.
    
    // (Aligo message logic removed for privacy)

    // 3. Kakao Delivery (via Kakao Memo API)
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
              description: '귀하만을 위한 4,000자의 정밀 분석 기록서가 완성되었습니다. 지금 바로 확인해 보세요.',
              image_url: 'https://www.cheongamaedang.com/cheong_a_mae_dang_final_logo.png',
              link: { 
                mobile_web_url: `https://www.cheongamaedang.com/success?orderId=${orderId}&show=true`, 
                web_url: `https://www.cheongamaedang.com/success?orderId=${orderId}&show=true` 
              },
            },
            buttons: [{ 
              title: '나의 기록서 보기', 
              link: { 
                mobile_web_url: `https://www.cheongamaedang.com/success?orderId=${orderId}&show=true`, 
                web_url: `https://www.cheongamaedang.com/success?orderId=${orderId}&show=true` 
              } 
            }],
          })
        })
      }).catch(e => console.error("Kakao Memo error:", e));
    }

    console.log(`[Background] Delivery completed for Order: ${orderId}`);

  } catch (error) {
    console.error(`[Background] Error for Order: ${error instanceof Error ? error.message : "unknown"}:`, error);
  }
}
