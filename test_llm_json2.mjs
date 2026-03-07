console.log("=== SAJU LLM JSON GENERATION TEST ===");

try {
  const sajuAnalysisJson = {
      user_info: { gender: "female", day_master: "辛(금)" },
      elements_ratio: {
          Wood: 0,
          Fire: 37.5,
          Earth: 12.5,
          Metal: 25,
          Water: 25,
      },
      ten_gods_count: {
          "비견/겁재": 1, "식신/상관": 2, "정재/편재": 0, "정관/편관": 3, "정인/편인": 2
      },
      core_格: "상관격",
      shinsal: {
           lucky: ["천을귀인", "문창귀인"],
           caution: ["귀문관살"]
      },
      current_daewun: {
           age_range: "28",
           ganji: "甲申",
           type: "재성/비겁"
      }
  };

  const generateSystemPrompt = (json) => {
       return `당신은 20년 차 명리학 일타 강사입니다. 이 내담자는 일간이 ${json.user_info.day_master}이며, ${json.user_info.gender === 'female' ? '여성' : '남성'}입니다.
오행 비율: 목 ${json.elements_ratio.Wood}%, 화 ${json.elements_ratio.Fire}%, 토 ${json.elements_ratio.Earth}%, 금 ${json.elements_ratio.Metal}%, 수 ${json.elements_ratio.Water}%
십성 구조: ${JSON.stringify(json.ten_gods_count)}
격국: ${json.core_格}
주요 신살: 길신(${json.shinsal.lucky.join(', ') || '없음'}), 흉살(${json.shinsal.caution.join(', ') || '없음'})
현재 대운: ${json.current_daewun.ganji} (${json.current_daewun.age_range}세, ${json.current_daewun.type} 기운)

위 데이터를 바탕으로, 내담자의 성향과 현재 대운에 맞는 100% 개인화된 인생 전반 및 재물운 조언을 400자 이내로 팩트 폭격하며 작성해 주세요. '에너지가 균형 잡혔다' 같은 뻔한 소리는 철저히 배제하세요.`;
  };

  const systemPromptString = generateSystemPrompt(sajuAnalysisJson);
  console.log("\n[1] Generated Saju JSON Object:");
  console.log(JSON.stringify(sajuAnalysisJson, null, 2));
  
  console.log("\n[2] Generated LLM System Prompt:");
  console.log(systemPromptString);
  
} catch (e) {
  console.error("Test Error", e);
}
