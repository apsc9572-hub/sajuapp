"use client";

import SajuResultView from "@/components/SajuResultView";

export default function ResultClientWrapper({ reading, detailedData }: { reading: any, detailedData: any }) {
  const handleCopy = async () => {
    const analysis = reading.analysis || {};
    const isTotal = reading.isTotalFortune || analysis.isTotalFortune;
    
    let text = `[청아매당 프리미엄 사주 분석 결과]\n\n`;
    text += `1. 인생의 전체적인 형상 분석\n${analysis.life_shape?.replace(/<[^>]*>?/gm, '') || ""}\n\n`;
    text += `2. 고민에 대한 대가의 해답\n${analysis.solution?.replace(/<[^>]*>?/gm, '') || ""}\n\n`;
    
    if (isTotal) {
      text += `3. 분야별 상세 인생 운세\n${analysis.detailed_fortune?.replace(/<[^>]*>?/gm, '') || ""}\n\n`;
      text += `4. 인생 주요 전환점 & 위험 시기\n${analysis.turning_points?.replace(/<[^>]*>?/gm, '') || ""}\n\n`;
      text += `5. 대가의 개운 비책\n${(analysis.luck_advice || reading.luck_advice)?.replace(/<[^>]*>?/gm, '') || ""}\n\n`;
    } else {
      text += `3. 성패의 시기 (2026-2028)\n${analysis.timing?.replace(/<[^>]*>?/gm, '') || ""}\n\n`;
      text += `4. 대가의 개운 비책\n${(analysis.luck_advice || reading.luck_advice)?.replace(/<[^>]*>?/gm, '') || ""}\n\n`;
    }
    
    text += `© 2026 청아매당. 본 결과지의 무단 전재 및 배포를 금합니다.`;
    const fullText = text.trim();

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
