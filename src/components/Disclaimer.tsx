"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

export default function Disclaimer() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show only once per session or day (simplified to always show initially for demo)
    const hasSeenDisclaimer = sessionStorage.getItem("disclaimerSeen");
    if (!hasSeenDisclaimer) {
      setTimeout(() => setIsVisible(true), 1500); // delay before showing
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem("disclaimerSeen", "true");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            width: "90%",
            maxWidth: "600px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid var(--glass-border)",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            display: "flex",
            gap: "16px",
            alignItems: "flex-start"
          }}
        >
          <div style={{ color: "var(--accent-gold)", marginTop: "2px" }}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "8px", fontWeight: 600, color: "var(--text-primary)" }}>Apple/App Store 심사 방어: 엔터테인먼트 목적 안내</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "12px" }}>
              본 애플리케이션의 모든 콘텐츠(타로, 사주, 꿈해몽 등)는 오직 엔터테인먼트 목적으로만 제공되며, 
              실제적, 의학적, 재정적, 법률적 조언을 대체할 수 없습니다. 결과에 기반한 어떠한 결정에도 법적 책임을 지지 않습니다.
            </p>
            <button 
              onClick={handleClose}
              style={{
                background: "rgba(0,0,0,0.05)",
                border: "1px solid rgba(0,0,0,0.05)",
                color: "var(--text-primary)",
                padding: "8px 20px",
                borderRadius: "20px",
                fontSize: "0.85rem",
                cursor: "pointer",
                transition: "background 0.2s",
                fontWeight: 500
              }}
            >
              동의하고 계속하기
            </button>
          </div>
          <button 
            onClick={handleClose} 
            style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
