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
 * [Premium] GPT-4o High-Fidelity 모델
 * 유료 사용자 전용 최상위 머신
 */
export async function callGPTPremium(
  prompt: string,
  systemPrompt: string,
  responseFormat: "text" | "json_object" = "text",
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  console.log(`[Premium-AI] Calling GPT-4o High-Fidelity...`);

  const response = await fetchWithRetry("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      response_format: { type: responseFormat },
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`GPT Premium Error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

/**
 * [Free] GPT-4o-Mini 모델
 * 무료 사용자용 효율적인 기계
 */
export async function callGPTFree(
  prompt: string,
  systemPrompt: string,
  responseFormat: "text" | "json_object" = "text",
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  console.log(`[Free-AI] Calling GPT-4o-Mini...`);

  const response = await fetchWithRetry("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
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
    throw new Error(`GPT Free Error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

/**
 * [Professional Fallback] Claude 3.5 Sonnet
 * 시스템 장애 시 최후의 보루
 */
export async function callClaudeProfessional(
  prompt: string,
  systemPrompt: string = "You are a professional Saju expert.",
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  console.log("[AI] Calling Claude 3.5 Professional Fallback...");

  const response = await fetchWithRetry("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API Error: ${response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || "";
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
    const missing = { apiKey: !!apiKey, userId: !!userId, senderKey: !!senderKey, templateCode: !!templateCode, sender: !!sender };
    console.error("[Aligo] Missing configuration", missing);
    throw new Error(`Aligo configuration missing: ${JSON.stringify(missing)}`);
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
