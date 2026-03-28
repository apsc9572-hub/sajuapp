"use client";

import SajuResultView from "@/components/SajuResultView";

export default function ResultClientWrapper({ reading, detailedData }: { reading: any, detailedData: any }) {
  const handleCopy = async () => {
    const analysis = reading.analysis;
    const fullText = `
[청아매당 프리미엄 사주 분석 결과]

1. 인생의 전체적인 형상 분석
${analysis?.life_shape?.replace(/<[^>]*>?/gm, '')}

2. 고민에 대한 대가의 해답
${analysis?.solution?.replace(/<[^>]*>?/gm, '')}

3. 성패의 시기 (2026-2028)
${analysis?.timing?.replace(/<[^>]*>?/gm, '')}

4. 개운의 비책
${analysis?.luck_advice?.replace(/<[^>]*>?/gm, '')}

© 2026 청아매당. 본 결과지의 무단 전재 및 배포를 금합니다.
    `.trim();

    try {
      await navigator.clipboard.writeText(fullText);
      alert("전체 분석 결과가 클립보드에 복사되었습니다.");
    } catch (err) {
      console.error("Copy failed", err);
      alert("복사에 실패했습니다.");
    }
  };

  return <SajuResultView reading={reading} detailedData={detailedData} onCopy={handleCopy} />;
}
