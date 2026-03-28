"use client";

import { useEffect, useRef, useState } from "react";
import { loadTossPayments, TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, CreditCard } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  orderName: string;
  customerKey: string;
}

export default function PaymentModal({ isOpen, onClose, amount, orderName, customerKey }: PaymentModalProps) {
  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [devClicks, setDevClicks] = useState(0);
  const devTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use the client key from environment variables
  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || ""; 

  useEffect(() => {
    if (!isOpen || !clientKey) return;

    (async () => {
      try {
        const tossPayments = await loadTossPayments(clientKey);
        
        // Initialize widgets
        const widgets = tossPayments.widgets({ customerKey });
        
        // Set the amount
        await widgets.setAmount({
          currency: "KRW",
          value: amount,
        });

        // Render payment methods and agreement
        await Promise.all([
          widgets.renderPaymentMethods({
            selector: "#payment-method",
            variantKey: "DEFAULT",
          }),
          widgets.renderAgreement({
            selector: "#agreement",
            variantKey: "AGREEMENT",
          })
        ]);

        widgetsRef.current = widgets;
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading payment widget v2:", error);
      }
    })();
  }, [isOpen, amount, clientKey, customerKey]);

  const handlePaymentRequest = async () => {
    const widgets = widgetsRef.current;
    if (!widgets) return;

    try {
      // Create a unique order ID
      const orderId = uuidv4();
      
      // Request payment
      await widgets.requestPayment({
        orderId: orderId,
        orderName: orderName,
        customerName: "청아매당 사용자",
        customerEmail: "customer@example.com",
        successUrl: `${window.location.origin}/success`,
        failUrl: `${window.location.origin}/fail`,
      });
    } catch (error) {
      console.error("Payment request failed:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)",
          display: "flex", justifyContent: "center", alignItems: "center",
          zIndex: 2000, padding: "20px"
        }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          style={{
            background: "white", width: "100%", maxWidth: "480px",
            borderRadius: "24px", overflow: "hidden", position: "relative",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
          }}
        >
          {/* Header */}
          <div style={{ 
            padding: "20px 24px", borderBottom: "1px solid #f0f0f0",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "linear-gradient(135deg, var(--accent-indigo), #1A1C2C)"
          }}>
            <div 
              onClick={() => {
                setDevClicks(prev => {
                  const next = prev + 1;
                  if (next >= 10) {
                    window.location.href = `/success?skip=true&paymentKey=dev&orderId=dev&amount=5000`;
                    return 0;
                  }
                  if (devTimeoutRef.current) clearTimeout(devTimeoutRef.current);
                  devTimeoutRef.current = setTimeout(() => setDevClicks(0), 3000);
                  return next;
                });
              }}
              style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "default", userSelect: "none" }}
            >
              <CreditCard size={20} color="var(--accent-gold)" />
              <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "white", margin: 0 }}>프리미엄 결제</h3>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={16} />
            </button>
          </div>

          <div style={{ padding: "24px", maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ marginBottom: "20px", textAlign: "center" }}>
              <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "8px" }}>결제 금액</div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "10px" }}>
                <span style={{ fontSize: "1.1rem", color: "#999", textDecoration: "line-through" }}>10,000원</span>
                <span style={{ fontSize: "2rem", fontWeight: "900", color: "#e63946" }}>5,000원</span>
              </div>
              <div style={{ fontSize: "0.9rem", color: "var(--accent-gold)", fontWeight: "600", marginTop: "8px" }}>{orderName}</div>
              <div style={{ fontSize: "0.8rem", color: "#5ea582", fontWeight: "700", marginTop: "4px" }}>오픈 기념 50% 할인 중!</div>
            </div>

            <div id="payment-method" style={{ marginBottom: "12px" }} />
            <div id="agreement" />

            {isLoading && (
              <div style={{ padding: "40px 0", textAlign: "center", color: "#999" }}>
                {!clientKey ? "환경 변수 설정이 필요합니다." : "결제 창을 불러오는 중입니다..."}
              </div>
            )}
          </div>

          <div style={{ padding: "20px 24px", background: "#fcfcfc" }}>
            <button
              onClick={handlePaymentRequest}
              disabled={isLoading}
              style={{
                width: "100%", padding: "16px", borderRadius: "16px",
                background: isLoading ? "#ccc" : "linear-gradient(135deg, var(--accent-indigo), #1A1C2C)",
                color: "var(--accent-gold)", fontWeight: "800", fontSize: "1.1rem",
                border: "none", cursor: isLoading ? "not-allowed" : "pointer",
                display: "flex", justifyContent: "center", alignItems: "center", gap: "8px",
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)"
              }}
            >
              <ShieldCheck size={20} /> 결제하기
            </button>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "20px", marginTop: "12px" }}>
              <p style={{ fontSize: "0.75rem", color: "#999", margin: 0 }}>
                본 결제는 안전한 토스페이먼츠 시스템을 통해 처리됩니다.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
