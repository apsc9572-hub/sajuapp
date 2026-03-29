import { getResult } from "@/lib/server/result-store";
import TraditionalBackground from "@/components/TraditionalBackground";
import SajuResultView from "@/components/SajuResultView";
import ResultClientWrapper from "./ResultClientWrapper";

type Props = {
  params: Promise<{
    resultId: string;
  }>;
};

export default async function ResultPage({ params }: Props) {
  const resolvedParams = await params;
  const resultId = resolvedParams.resultId;

  const data = await getResult(resultId);

  if (!data) {
    return (
      <main style={{ width: "100%", minHeight: "100vh", position: "relative", background: "var(--bg-primary)", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <TraditionalBackground />
        <div style={{ background: "rgba(255,255,255,0.9)", padding: "40px", borderRadius: "20px", textAlign: "center", zIndex: 10 }}>
          <h1 style={{ color: "var(--accent-indigo)", marginBottom: "16px", fontSize: "1.4rem", fontWeight: "800" }}>결과를 찾을 수 없습니다</h1>
          <p style={{ color: "#666" }}>만료되었거나 잘못된 링크입니다.</p>
        </div>
      </main>
    );
  }

  // Map data to SajuResultView format
  // Detect Total Fortune from ALL available signals, including the stored question
  const isTotalFortune = 
    data.isTotalFortune === true || 
    data.analysis?.isTotalFortune === true || 
    !!data.analysis?.detailed_fortune ||
    (data.userInput?.question || "").includes("인생총운");

  const reading = {
    ...data,
    isTotalFortune,
    subheadline: "귀하의 타고난 기운과 미래의 흐름을 정밀하게 분석한 결과입니다.",
    analysis: {
      ...data.analysis,
      isTotalFortune, // Also inject into analysis object for deeper components
      title: `${data.userInput?.name || "고객"}님의 인생 총운 심층 분석`
    }
  };

  const detailedData = data.detailedData || {
      // Fallback in case of old data
      table: null,
      strength: { base: null, corrected: null },
      elements_ratio: null,
      element_labels: null
  };

  return (
    <main style={{ width: "100%", minHeight: "100vh", position: "relative", background: "var(--bg-primary)" }}>
      <TraditionalBackground />
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px", position: "relative", zIndex: 10 }}>
        <ResultClientWrapper reading={reading} detailedData={detailedData} />
      </div>
    </main>
  );
}
