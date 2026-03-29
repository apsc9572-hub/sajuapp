import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, User } from "lucide-react";

const ALL_REVIEWS = [
  { id: 101, name: "강*현", content: "사주 보정이라는게 있는줄 몰랐는데.. 보정하고 보니까 제 성격이랑 소름돋게 똑가타여. 다른데서 본거랑 아예 다름;", rating: 5, tag: "보정 필수" },
  { id: 1, name: "김*진", content: "무료인데도 인터페이스가 너무 깔끔해서 보기 편하네요. 다른 어플들보다 풀이도 훨씬 현대적이어서 이해가 잘 됩니다.", rating: 5, tag: "깔끔한 UI" },
  { id: 102, name: "이*민", content: "태어난 계절에 따라 기운이 달라진다고 해서 신기했는데 보정 결과 보니까 진짜 맞는것 가틈.. 분석이 되게 정밀해여", rating: 5, tag: "정밀 분석" },
  { id: 4, name: "최*윤", content: "무료 운세만 봐도 제 성향을 너무 잘 맞춰서 깜짝 놀랐습니다. 굳이 결제 안 해도 이 정도면 충분히 도움 될 것 같아요!", rating: 5, tag: "무료 대만족" },
  { id: 103, name: "박*준", content: "무료 사주 많이 보러 다녔는데 여기처럼 보정해주는 곳은 첨봐여. 유료결재했는데 역시 보정값이 들어가니까 훨씬 정확함", rating: 5, tag: "보정의 차이" },
  { id: 9, name: "윤*서", content: "친구 추천으로 왔는데 역시 유명한 이유가 있네요. 무료도 퀄리티 상당하지만 프리미엄은 정말 깊이가 달라요.", rating: 5, tag: "강력 추천" },
  { id: 104, name: "최*서", content: "보정하니까 안 보이던 오행들이 생겨서 신기해여. 제가 금 기운이 부족한 줄 알았는데 보정하니 보완되네여ㄷㄷ", rating: 5, tag: "오행 보정" },
  { id: 10, name: "신*준", content: "다른 사주 어플은 한자가 너무 많아서 어려웠는데 여기는 한글로 다 풀어서 설명해주니 초보자도 보기 좋네요. 강력 추천합니다.", rating: 5, tag: "친절한 설명" },
  { id: 105, name: "정*훈", content: "보정 기능이 진짜 신의 한 수 인듯.. 사주 풀이가 훨씬 깊이 있고 제 상황이랑 딱 맞아 떨어져서 놀랬슴다", rating: 5, tag: "보정 대박" },
  { id: 20, name: "양*진", content: "매일 아침마다 오늘의 운세 확인하는데 하루를 시작하는 데 큰 도움이 됩니다. 무료인데 이 퀄리티라니 믿기지 않네요.", rating: 5, tag: "매일 확인 중" },
  { id: 6, name: "한*원", content: "보정이 뭔지 몰랐는데 여기서 보정하고 나니까 제가 알던 사주랑 아예 다르게 나오네요. 이게 정확한 내 운명이구나 싶어서 신기합니다.", rating: 5, tag: "보정의 힘" },
  { id: 2, name: "박*우", content: "원래 이런 거 잘 안 믿는데 무료 사주 내용이 너무 구체적이라 놀랐어요ㅋㅋㅋ 진짜 분석 깊이가 남다르네요..", rating: 5, tag: "정밀한 분석" },
  { id: 7, name: "임*현", content: "여기저기 사주 많이 보러 다녀서 대충은 다 안다고 생각했는데, 태어난 계절에 따라 오행 기운이 바뀔 수 있다는 건 여기서 처음 알았네요. 분석이 정말 구체적입니다.", rating: 5, tag: "전문적 분석" },
  { id: 5, name: "정*민", content: "무료에서 조심하라던 게 실제로 딱 맞아서 바로 유료버전 결재함..ㅋㅋㅋ 상담받는 기분이에요. 대박임", rating: 5, tag: "대만족" },
  { id: 15, name: "송*철", content: "태어난 계절 고려해서 보정해준다는 게 신기하네요. 확실히 그냥 생년월일만 넣을 때보다 결과가 더 정확한 느낌입니다.", rating: 5, tag: "정밀 분석" },
  { id: 8, name: "강*석", content: "무료 결과보고 반신반의하며 돈내고 봤는데, 제 성격 단점까지 정확히 짚어주셔서 반성 마니 했습니다. 도움이 마니 됐어요.", rating: 5, tag: "인생 조언" },
  { id: 3, name: "이*혜", content: "무료도 퀄리티 좋네여! 근데 유료결제는 확실히 내용이 훨씬 방대하고 뼈 때리는 조언이 많아서 도움 많이 됐습니다 ㅠㅠ", rating: 5, tag: "강력 추천" },
  { id: 11, name: "권*아", content: "올해 운세가 너무 답답해서 왔는데 속이 다 시원합니다. 무료만 보지 말고 유료 분석까지 보시는 거 추천해요.", rating: 5, tag: "속 시원함" },
  { id: 12, name: "고*훈", content: "사주에 나오는 제 모습이 평소 제 고민이랑 똑같아서 놀랐습니다. 프리미엄 통해 앞으로의 방향성을 잡았어요.", rating: 5, tag: "방향 설정" },
  { id: 13, name: "장*빈", content: "무료 버전도 충분히 좋지만, 프리미엄은 제 인생의 사용 설명서 같은 느낌입니다. 만족도 최고에여.", rating: 5, tag: "만족도 최고" },
  { id: 14, name: "배*주", content: "매년 사주 보러 다니는데 이제 여기 정착하려고요. 분석이 정말 정밀하고 믿음이 갑니다.", rating: 5, tag: "정착 완료" },
  { id: 16, name: "남*윤", content: "취업 준비 때문에 힘들었는데 유료로 사쥬 보고 큰 힘 얻어갑니다. 조언해주신 시기 잘 노려볼게요.", rating: 5, tag: "취준생 추천" },
  { id: 17, name: "전*우", content: "사업 시작 전 고민 많았는데 명쾌한 해답을 주셔서 감사합니다. 프리미엄 결제하길 정말 잘했어요.", rating: 5, tag: "사업운 추천" },
  { id: 18, name: "황*은", content: "연애운이 너무 안 풀려서 답답했는데 제 성향 분석보고 고칠 점 찾았어요. 무료보다 훨씬 유용함!", rating: 5, tag: "연애운 해결" },
  { id: 19, name: "문*현", content: "처음 해봤는데 UI도 깔끔하고 분석 내용도 길고 정성스러워서 조아여. 프리미엄 강추!", rating: 5, tag: "깔끔한 구성" },
  { id: 21, name: "유*민", content: "무료 결과가 좋아서 혹시나 하고 프리미엄 봤는데 내용이 3배는 넘는 것 같아요. 진짜 꼼꼼합니다.", rating: 5, tag: "꼼꼼한 분석" },
  { id: 22, name: "손*혁", content: "인생의 변곡점에서 큰 도움 받았습니다. 조언해주신 내용 마음에 새기고 열심히 살아보려구요.", rating: 5, tag: "큰 힘이 됨" },
  { id: 23, name: "심*영", content: "사주는 어렵다고만 생각했는데 여기는 현대적으로 잘 풀어주네여. 결제한게 아깝지 않았습니다.", rating: 5, tag: "현대적 해석" },
  { id: 24, name: "노*서", content: "친구들한테도 다 공유해줬어요ㅋㅋ 무료 사주인데도 내용이 알차고 조언도 구체적이라 다들 좋아하네요.", rating: 5, tag: "친구 추천" },
  { id: 25, name: "허*준", content: "답답한 마음이 반쯤 해결된 기분입니다. 프리미엄 사주의 깊이가 확실히 다르다는 걸 느꼈어요.", rating: 5, tag: "마음의 평화" },
  { id: 26, name: "백*은", content: "반복해서 읽어보게 되네요. 제 인생 흐름을 한눈에 보는 느낌이라 프리미엄 강력 추천합니다.", rating: 5, tag: "인생 흐름" },
  { id: 27, name: "안*연", content: "무료 사주 보고 넘 좋았는데, 유료결제는 진짜 전율이 느껴질 정도로 자세하네요. 감사합니다.", rating: 5, tag: "전율의 분석" },
  { id: 106, name: "오*현", content: "사주 보정이라는게 생소했는데 결과 보니까 왜 하는지 알겠네요. 제 기운에 맞게 딱딱 짚어주니 소름돋아요.", rating: 5, tag: "보정 필수" },
  { id: 107, name: "배*성", content: "무료로 본 월간운세가 너무 잘 맞아서 유료 결재했습니다. 보정 데이터가 반영되서 그런지 확실히 풀이가 남달라요.", rating: 5, tag: "월간운세 추천" },
  { id: 108, name: "조*희", content: "평소에 내가 왜 이럴까 고민했던 부분들이 사주 보정 풀이 하나로 다 해결됐습니다. 신기하네여 진짜..", rating: 5, tag: "고민 해결" },
  { id: 109, name: "윤*우", content: "UI가 너무 예뻐서 계속 보게 되네요. 가독성도 좋고 현대적인 해석이라 친구들한테도 마니 추천했어요!", rating: 5, tag: "디자인 최고" },
  { id: 110, name: "곽*은", content: "무료 사쥬치고 퀄리티가 너무 좋아서 놀랬슴다 ㅋㅋ 유료버전은 얼마나 더 좋을지 기대되네요.", rating: 5, tag: "무료 대만족" },
  { id: 28, name: "마*수", content: "매일 아침 출근길에 보는데 하루 마음가짐 정하기 딱 좋네요. 무료인데도 조언이 정말 알찹니다.", rating: 5, tag: "일상의 힘" },
  { id: 29, name: "지*석", content: "사업운때문에 고민 마니 했는데 프리미엄 보정 분석보고 큰 도움 받았습니다. 방향성이 확실히 잡히네여.", rating: 5, tag: "사업가 필수" },
  { id: 30, name: "변*아", content: "데이터 기반이라 그런지 다른 어플보다 훨씬 신뢰가 가요. 보정 기능이 진짜 핵심인듯!", rating: 5, tag: "데이터 분석" },
  { id: 31, name: "염*훈", content: "사주풀이가 이렇게 재밌는건줄 몰랐네요 ㅋㅋ 한글로 풀어서 설명해주니 이해가 쏙쏙 됩니다.", rating: 5, tag: "꿀잼 분석" },
  { id: 32, name: "채*리", content: "결혼 앞두고 마음이 복잡했는데 프리미엄 사주 보고 힐링하고 갑니다. 조언해주신 시기 잘 지켜볼게요.", rating: 5, tag: "예비신부 추천" },
  { id: 33, name: "기*환", content: "자녀 사주 보정해서 봤는데 성향을 너무 잘 맞춰서 깜짝 놀랐습니다. 교육 보조 지표로 써도 될듯요 ㅋㅋ", rating: 5, tag: "교육운 추천" },
  { id: 34, name: "탁*재", content: "사쥬 보러 오프라인 가기 좀 그랬는데 여기서 프리미엄 결재하고 무릎을 탁 쳤습니다. 가성비 최고에여.", rating: 5, tag: "가성비 갑" },
  { id: 35, name: "서*진", content: "운의 흐름을 그래프로 보니까 한눈에 들어와서 좋네요. 보정된 수치라 그런지 제 인생이랑 딱 맞아요.", rating: 5, tag: "그래프 분석" },
  { id: 36, name: "주*현", content: "힘든 시기였는데 따뜻한 조언 감사드려요. 무료인데도 마음의 위로를 마니 받았습니다.", rating: 5, tag: "위로의 조언" },
  { id: 37, name: "표*빈", content: "유료 결재가 아깝지 않은 퀄리티입니다. 보정 시스템이 정말 정교하게 설계된 것 같아요.", rating: 5, tag: "시스템 완성도" },
  { id: 38, name: "엄*준", content: "계절 보정? 첨 들어보는데 이거하고 안하고 차이가 크네여. 제 사주가 왜 그렇게 풀렸는지 이제야 알겠음다.", rating: 5, tag: "보정의 차이" },
  { id: 39, name: "진*우", content: "친구들이랑 같이 봤는데 다들 소름돋는다고 난리에요 ㅋㅋ 무료 사쥬 이 정도면 진짜 혜자네여.", rating: 5, tag: "역대급 퀄리티" },
  { id: 40, name: "선*우", content: "UI가 깔끔해서 부모님도 보기 편해하시네요. 온 가족이 연초마다 여기서 유료 분석 받으려구요.", rating: 5, tag: "가족 사주" },
  { id: 41, name: "원*희", content: "내용이 반복되지 않고 단계별로 깊이 들어가는게 좋았습니다. 유료 결재 대만족!", rating: 5, tag: "심도 있는 분석" },
  { id: 42, name: "하*은", content: "사쥬라기보다 인생 상담 받는 기분이었어요. 보정된 오행 분석이 정말 신선했습니다.", rating: 5, tag: "인생 상담" },
  { id: 43, name: "라*현", content: "무료로 이 정도 정보를 얻을 수 있다는게 놀랍네요. 프리미엄은 얼마나 더 대단할지 궁금해서 결국 결재함 ㅋㅋ", rating: 5, tag: "호기심 해결" },
  { id: 44, name: "공*준", content: "태어난 시간이 없어서 걱정했는데 보조 지표로 보정해서 봐주니 넘 편하네요. 정확도도 높은것 가타여.", rating: 5, tag: "편의성 최고" },
  { id: 45, name: "석*아", content: "다른데서 안 나오던 부분까지 보정으로 잡아내주니 신기해요. 이제 여기만 이용할 것 가씀다.", rating: 5, tag: "정착 확정" },
  { id: 201, name: "강*빈", content: "궁금한 키워드로 직접 질문할 수 있어서 진짜 편해여. 대중적인 결과보다 제가 딱 알고 싶은 부분을 콕 찝어주니까 결재하길 잘한듯!", rating: 5, tag: "키워드 질문" },
  { id: 202, name: "임*윤", content: "키워드별로 나눠서 물어볼 수 있는게 이 어플 최고 장점인듯 ㅋㅋ 다른데서 못 보던 정밀한 답변이라 대만족하고 갑니다.", rating: 5, tag: "정밀한 답변" },
  { id: 203, name: "박*연", content: "키워드로 질문하는 기능 써봤는데 진짜 신기하네요. 제 상황에 맞춰서 키워드 골라 물어보니 상담받는 기분이 들정도로 구체적이에여.", rating: 5, tag: "커스텀 분석" },
  { id: 301, name: "송*원", content: "커피 한 잔 값인 5천원이라 궁금할 때마다 부담 없이 프리미엄 결재하게 되네요 ㅋㅋ 가성비 진짜 최고인듯!", rating: 5, tag: "부담 없는 가격" },
  { id: 302, name: "조*민", content: "답답하고 막힐 때마다 5천원으로 속 시원한 분석 받을 수 있어서 좋아요. 가격이 착해서 자주 이용하게 됩니다.", rating: 5, tag: "가성비 갑" },
  { id: 303, name: "하*라", content: "다른덴 너무 비싸서 망설여지는데 여기는 5,000원이면 보정 결과까지 다 볼 수 있어서 넘 좋네여. 벌써 세 번째 결재함!", rating: 5, tag: "착한 가격" }
];

export default function FakeReviews() {
  const [visibleCount, setVisibleCount] = useState(5);
  const [shuffledReviews, setShuffledReviews] = useState<typeof ALL_REVIEWS>([]);

  useEffect(() => {
    // 마운트 시 한 번만 랜덤하게 섞음
    const shuffled = [...ALL_REVIEWS].sort(() => Math.random() - 0.5);
    setShuffledReviews(shuffled);
  }, []);

  useEffect(() => {
    if (visibleCount >= shuffledReviews.length || shuffledReviews.length === 0) return;

    // 5초에서 15초 사이의 랜덤한 대기 시간 계산
    const nextDelay = Math.floor(Math.random() * (15000 - 5000 + 1)) + 5000;
    
    const timer = setTimeout(() => {
      setVisibleCount((prev) => prev + 1);
    }, nextDelay);

    return () => clearTimeout(timer);
  }, [visibleCount, shuffledReviews]);

  const visibleReviews = shuffledReviews.slice(0, visibleCount);

  return (
    <div style={{ marginTop: "40px", padding: "0 8px" }}>
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        marginBottom: "20px",
        padding: "0 4px"
      }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#2A365F" }}>실시간 이용 후기</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#C9A050", fontSize: "0.9rem", fontWeight: "700" }}>
          <Star size={16} fill="#C9A050" /> 4.9/5.0
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {visibleReviews.map((review, idx) => (
          <motion.div
            key={review.id}
            initial={idx >= 5 ? { opacity: 0, height: 0, marginTop: 0 } : { opacity: 1, height: "auto" }}
            animate={{ opacity: 1, height: "auto", marginTop: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              padding: "16px",
              background: "white",
              borderRadius: "18px",
              border: "1px solid #f0f0f0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
              overflow: "hidden"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <User size={14} color="#999" />
                </div>
                <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#555" }}>{review.name}</span>
                <div style={{ display: "flex", gap: "1px" }}>
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={10} fill="#C9A050" color="#C9A050" />
                  ))}
                </div>
              </div>
              <span style={{ 
                fontSize: "0.7rem", 
                fontWeight: "800", 
                color: "#C9A050", 
                background: "rgba(201, 160, 80, 0.1)", 
                padding: "2px 8px", 
                borderRadius: "12px"
              }}>
                {review.tag}
              </span>
            </div>
            <p style={{ 
              fontSize: "0.9rem", 
              color: "#333", 
              lineHeight: "1.5", 
              margin: 0,
              wordBreak: "keep-all"
            }}>
              {review.content}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
