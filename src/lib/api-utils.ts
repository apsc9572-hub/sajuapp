/**
 * Exponential Backoff를 적용한 fetch 래퍼 함수
 * @param url 요청할 URL
 * @param options fetch 옵션
 * @param maxRetries 최대 재시도 횟수 (기본값: 3)
 * @param baseDelay 기본 대기 시간 (ms, 기본값: 1000)
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<Response> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        // 지수 백오프: baseDelay * 2^(attempt-1) + jitter
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 100;
        console.log(`[Retry] Attempt ${attempt}/${maxRetries}. Waiting ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const response = await fetch(url, options);

      // 재시도가 필요한 상태 코드: 429 (Too Many Requests), 503 (Service Unavailable), 504 (Gateway Timeout)
      if (response.status === 429 || response.status === 503 || response.status === 504) {
        console.warn(`[API Warning] Received status ${response.status} on attempt ${attempt + 1}`);
        if (attempt < maxRetries) continue;
      }

      return response;
    } catch (error) {
      lastError = error;
      console.error(`[API Error] Attempt ${attempt + 1} failed:`, error);
      if (attempt < maxRetries) continue;
    }
  }

  throw lastError || new Error(`Failed after ${maxRetries} retries`);
}

/**
 * GPT 최신 모델(5.1) 호출 함수
 * 현재 시스템의 메인 분석 엔진으로 사용됨
 */
export async function callGPTLatest(
  prompt: string,
  systemPrompt: string,
  responseFormat: "text" | "json_object" = "text",
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  console.log(`[AI] Calling GPT 5.1 Main Engine... (${responseFormat})`);

  const response = await fetchWithRetry("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      response_format: { type: responseFormat },
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`GPT API Error: ${response.status} - ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("GPT response is empty");

  console.log("[AI] GPT 5.1 call successful.");
  return text;
}

/**
 * Claude 최신 모델(4.6) 호출 함수
 * GPT 실패 시 안정적인 폴백(Fallback) 엔진으로 사용됨
 */
export async function callClaudeLatest(
  prompt: string,
  systemPrompt: string = "You are a professional Saju (Korean Astrology) expert.",
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  console.log("[AI] Calling Claude 4.6 Sonnet (Fallback)...");

  const response = await fetchWithRetry("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Claude API Error: ${response.status} - ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text;
  if (!text) throw new Error("Claude response is empty");

  console.log("[AI] Claude 4.6 Sonnet call successful.");
  return text;
}

/**
 * 알리고 알림톡 발송 함수
 */
export async function sendAlimTalk(params: {
  receiver: string;
  message: string;
  emblem?: string;
  button1?: { name: string; type: string; url_mobile?: string; url_pc?: string };
  buttons?: any[]; // array of button objects matching Aligo spec
}) {
  const apiKey = process.env.ALIGO_API_KEY;
  const userId = process.env.ALIGO_USER_ID;
  const senderKey = process.env.ALIGO_SENDER_KEY;
  const templateCode = process.env.ALIGO_TEMPLATE_CODE;
  const sender = process.env.ALIGO_SENDER;

  if (!apiKey || !userId || !senderKey || !templateCode || !sender) {
    console.error("[Aligo] Missing configuration", { apiKey: !!apiKey, userId: !!userId, senderKey: !!senderKey, templateCode: !!templateCode, sender: !!sender });
    return { status: "error", message: "Missing configuration" };
  }

  // Direct send to Aligo AlimTalk API (as per official docs - no token step needed)
  console.log("[Aligo] Sending AlimTalk... apikey:", apiKey.slice(0, 6) + "...", "userid:", userId, "receiver:", params.receiver);

  // Build URL-encoded body like the official curl example: --data-urlencode
  const bodyParams = new URLSearchParams();
  bodyParams.append("apikey", apiKey);
  bodyParams.append("userid", userId);
  bodyParams.append("senderkey", senderKey);
  bodyParams.append("tpl_code", templateCode);
  bodyParams.append("sender", sender);
  bodyParams.append("receiver_1", params.receiver);
  bodyParams.append("subject_1", "청아매당 프리미엄 사주 결과");
  bodyParams.append("message_1", params.message);
  // testMode: Y for debugging auth without consuming points (remove in production)
  // bodyParams.append("testMode", "Y");

  if (params.buttons) {
    bodyParams.append("button_1", JSON.stringify({
      button: params.buttons
    }));
  } else if (params.button1) {
    bodyParams.append("button_1", JSON.stringify({
      button: [
        {
          name: params.button1.name,
          linkType: params.button1.type,
          linkMo: params.button1.url_mobile,
          linkPc: params.button1.url_pc
        }
      ]
    }));
  }

  try {
    const response = await fetch("https://kakaoapi.aligo.in/akv10/alimtalk/send/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: bodyParams.toString(),
    });

    const result = await response.json();
    console.log("[Aligo] Send Result:", JSON.stringify(result));
    return result;
  } catch (error) {
    console.error("[Aligo] Request Failed:", error);
    return { status: "error", message: "Request failed" };
  }
}
