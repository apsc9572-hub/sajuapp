"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function PremiumPromo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      style={{
        marginTop: "48px",
        marginBottom: "32px",
        padding: "32px 24px",
        background: "linear-gradient(135deg, rgba(42, 54, 95, 0.03) 0%, rgba(201, 160, 80, 0.06) 100%)",
        borderRadius: "28px",
        border: "1px solid rgba(201, 160, 80, 0.15)",
        boxShadow: "0 15px 40px rgba(0,0,0,0.02)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Decorative Elements */}
      <div style={{ position: "absolute", top: "-15px", right: "-15px", opacity: 0.08 }}>
        <Sparkles size={100} color="#C9A050" />
      </div>
      
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ 
          display: "inline-flex", 
          alignItems: "center", 
          gap: "6px", 
          background: "rgba(201, 160, 80, 0.1)", 
          padding: "6px 14px", 
          borderRadius: "20px",
          color: "#C9A050",
          fontSize: "0.75rem",
          fontWeight: "700",
          marginBottom: "20px",
          letterSpacing: "0.05em"
        }}>
          <Sparkles size={14} /> PREMIUM SERVICE
        </div>

        <h3 style={{ 
          fontSize: "1.3rem", 
          fontWeight: "800", 
          color: "#2A365F", 
          marginBottom: "20px",
          fontFamily: "'Nanum Myeongjo', serif",
          lineHeight: "1.5",
          wordBreak: "keep-all"
        }}>
          똑같은 사주라도<br/>결과는 완전히 달라야 합니다
        </h3>
        
        <div style={{ 
          textAlign: "left",
          background: "rgba(255, 255, 255, 0.4)",
          padding: "20px",
          borderRadius: "20px",
          marginBottom: "32px",
          border: "1px solid rgba(201, 160, 80, 0.1)"
        }}>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontWeight: "700", color: "#C9A050", fontSize: "0.9rem", marginBottom: "4px" }}>🌓 조후(調候) 보정</div>
            <div style={{ fontSize: "0.85rem", color: "#555", lineHeight: "1.6" }}>
              태어난 계절의 온도와 습도를 분석합니다. 여름의 불기운과 겨울의 물기운은 그 쓰임이 전혀 다르기에, <b>계절적 환경을 보정한 진짜 기운</b>을 찾아내는 것이 프리미엄의 핵심입니다.
            </div>
          </div>
          <div>
            <div style={{ fontWeight: "700", color: "#C9A050", fontSize: "0.9rem", marginBottom: "4px" }}>🏛️ 궁성(宮星) 구조 분석</div>
            <div style={{ fontSize: "0.85rem", color: "#555", lineHeight: "1.6" }}>
              단순히 글자의 개수만 세지 않습니다. 각 글자가 위치한 자리(부모, 배우자, 자녀운)와 그들 간의 복잡한 상호작용을 통해 <b>당신의 인생을 결정짓는 정밀한 구조</b>를 읽어냅니다.
            </div>
          </div>
        </div>

        <p style={{ 
          fontSize: "0.95rem", 
          color: "#2A365F", 
          lineHeight: "1.7", 
          marginBottom: "32px",
          wordBreak: "keep-all",
          fontWeight: "600"
        }}>
          단순한 풀이를 넘어 당신의 인생을 바꿀<br/>명확한 해법, 청아매당 프리미엄에서 만나보세요.
        </p>
        
        <Link href="/premium-saju" style={{ textDecoration: "none" }}>
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: "0 12px 30px rgba(42, 54, 95, 0.2)" }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: "18px 36px",
              background: "#2A365F",
              color: "#C9A050",
              borderRadius: "50px",
              border: "1px solid rgba(201, 160, 80, 0.3)",
              fontSize: "1.05rem",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: "0 auto",
              boxShadow: "0 10px 25px rgba(42, 54, 95, 0.15)"
            }}
          >
            프리미엄 사주 감명 받기 <ArrowRight size={20} />
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}
