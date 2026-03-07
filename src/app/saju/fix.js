const fs = require('fs');
const path = 'C:/Users/COM/Desktop/어플/src/app/saju/page.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

const replacement = `        // ============================================================
        // LLM 서버 API 호출
        // ============================================================
        try {
          const apiRes = await fetch("/api/saju", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ systemPrompt: systemPromptString, sajuJson: sajuAnalysisJson })
          });

          if (!apiRes.ok) throw new Error("API 연동 오류");

          const llmResult = await apiRes.json();
          
          setReading({
            intro: dynamicIntro,
            percentage: rarityPercents[typeIndex],
            celebrities: celebsForReading,
            elements: selectedElements,
            general: {
              content: llmResult.general || "데이터를 불러오지 못했습니다.",
              recommend: {
                element: recommGeneral,
                color: ELEM_MAP[recommGeneral].color,
                direction: ELEM_MAP[recommGeneral].direction,
                action: ELEM_MAP[recommGeneral].action
              }
            },
            wealth: {
              content: llmResult.wealth || "데이터를 불러오지 못했습니다.",
              recommend: {
                element: recommWealth,
                color: ELEM_MAP[recommWealth].color,
                direction: ELEM_MAP[recommWealth].direction,
                action: \`\${ELEM_MAP[recommWealth].action} / 재무 계획 재점검\`
              }
            },
            love: {
              content: llmResult.love || "데이터를 불러오지 못했습니다.",
              recommend: {
                element: recommLove,
                color: ELEM_MAP[recommLove].color,
                direction: ELEM_MAP[recommLove].direction,
                action: \`\${ELEM_MAP[recommLove].action} / 감정 에너지 교류\`
              }
            },
            business: {
              content: llmResult.business || "데이터를 불러오지 못했습니다.",
              recommend: {
                element: recommCareer,
                color: ELEM_MAP[recommCareer].color,
                direction: ELEM_MAP[recommCareer].direction,
                action: ELEM_MAP[recommCareer].action
              }
            },
            health: {
              content: llmResult.health || "데이터를 불러오지 못했습니다.",
              recommend: {
                element: recommHealth,
                color: ELEM_MAP[recommHealth].color,
                direction: ELEM_MAP[recommHealth].direction,
                action: \`\${ELEM_MAP[recommHealth].action} / 물 2L 이상 꾸준히 섭취\`
              }
            },
            daeun: { content: llmResult.daeun || "데이터를 불러오지 못했습니다." },
            sinsal: { content: llmResult.sinsal || "데이터를 불러오지 못했습니다." }
          });
          setIsLoading(false);

        } catch (apiErr) {
          setIsLoading(false);
          console.error(apiErr);
          alert("명식 분석 중 AI 서버 오류가 발생했습니다.");
        }`;

// Replace lines 689 through 827
lines.splice(689, 828 - 689, replacement);

fs.writeFileSync(path, lines.join('\n'));
console.log('Successfully updated page.tsx with API fetch logic and removed old string templates.');
