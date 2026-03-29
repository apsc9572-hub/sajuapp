"use client";

import { motion } from "framer-motion";
import { Star, User } from "lucide-react";

const REVIEWS = [
  {
    id: 1,
    name: "김*진",
    content: "무료라고 해서 대충 봤는데 생각보다 너무 잘 맞아서 놀람;; 고민하다 프리미엄 결제했는데 역시 디테일이 다르네요. 돈 안 아까움 ㄹㅇ",
    rating: 5,
    tag: "프리미엄 구매"
  },
  {
    id: 2,
    name: "박*우",
    content: "원래 이런 거 잘 안 믿는데 무료 사주가 너무 소름 돋아서 프리미엄도 바로 질렀어요ㅋㅋㅋ 진짜 무서울 정도네요..",
    rating: 5,
    tag: "프리미엄 구매"
  },
  {
    id: 3,
    name: "이*혜",
    content: "무료도 퀄리티 좋네요! 근데 프리미엄은 확실히 내용이 훨씬 방대하고 뼈 때리는 조언이 많아서 도움 많이 됐습니다 ㅠㅠ",
    rating: 5,
    tag: "강력 추천"
  },
  {
    id: 4,
    name: "최*윤",
    content: "무료 운세 보고 깜짝 놀라서 프리미엄까지 해봤는데.. 와 진짜 일간 분석부터 소름;; 고민 있으신 분들 프리미엄 꼭 해보세요!!",
    rating: 5,
    tag: "소름 주의"
  },
  {
    id: 5,
    name: "정*민",
    content: "무료에서 조심하라던 게 실제로 딱 맞아서 바로 프리미엄 결제함..ㅋㅋㅋ 상담받는 기분이에요. 대박임",
    rating: 5,
    tag: "대만족"
  }
];

export default function FakeReviews() {
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
        {REVIEWS.map((review, idx) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            style={{
              padding: "16px",
              background: "white",
              borderRadius: "18px",
              border: "1px solid #f0f0f0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
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
