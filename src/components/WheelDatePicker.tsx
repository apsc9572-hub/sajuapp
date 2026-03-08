"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WheelDatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate: string; // "YYYY-MM-DD"
  onConfirm: (date: string) => void;
}

export default function WheelDatePicker({ isOpen, onClose, initialDate, onConfirm }: WheelDatePickerProps) {
  const [year, setYear] = useState(1995);
  const [month, setMonth] = useState(5);
  const [day, setDay] = useState(15);

  const years = Array.from({ length: 151 }, (_, i) => 1900 + i);
  const months = Array.from({ length: 12 }, (_, i) => 1 + i);
  const days = Array.from({ length: 31 }, (_, i) => 1 + i);

  const yearRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && initialDate) {
      const [y, m, d] = initialDate.split("-").map(Number);
      setYear(y);
      setMonth(m);
      setDay(d);
    }
  }, [isOpen, initialDate]);

  // Scroll to initial values when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollToValue(yearRef, years.indexOf(year));
        scrollToValue(monthRef, months.indexOf(month));
        scrollToValue(dayRef, days.indexOf(day));
      }, 100);
    }
  }, [isOpen]);

  const scrollToValue = (ref: any, index: number) => {
    if (ref.current) {
      const itemHeight = 44; // Height of each item
      ref.current.scrollTop = index * itemHeight;
    }
  };

  const handleScroll = (ref: any, type: "year" | "month" | "day") => {
    if (!ref.current) return;
    const itemHeight = 44;
    const index = Math.round(ref.current.scrollTop / itemHeight);
    
    if (type === "year") setYear(years[index]);
    if (type === "month") setMonth(months[index]);
    if (type === "day") setDay(days[index]);
  };

  const handleConfirm = () => {
    const formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onConfirm(formattedDate);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.3)",
              backdropFilter: "blur(2px)",
              zIndex: 1000
            }}
          />
          
          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              background: "#FAF9F7",
              borderTopLeftRadius: "24px",
              borderTopRightRadius: "24px",
              padding: "20px 20px 40px 20px",
              zIndex: 1001,
              boxShadow: "0 -4px 20px rgba(0,0,0,0.1)"
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <button onClick={onClose} style={{ border: "none", background: "transparent", color: "#666", fontSize: "1rem", cursor: "pointer" }}>취소</button>
              <span style={{ fontWeight: "600", fontSize: "1.1rem" }}>생년월일 선택</span>
              <button onClick={handleConfirm} style={{ border: "none", background: "transparent", color: "#C9A050", fontWeight: "700", fontSize: "1.05rem", cursor: "pointer" }}>확인</button>
            </div>

            {/* Picker Wheels */}
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", height: "220px", position: "relative" }}>
              {/* Center Bar Highlight */}
              <div style={{
                position: "absolute",
                top: "50%",
                left: 0,
                right: 0,
                height: "44px",
                transform: "translateY(-50%)",
                background: "rgba(0,0,0,0.03)",
                borderTop: "1px solid rgba(0,0,0,0.05)",
                borderBottom: "1px solid rgba(0,0,0,0.05)",
                pointerEvents: "none",
                zIndex: 0
              }} />

              {/* Year Wheel */}
              <WheelColumn 
                ref={yearRef} 
                items={years} 
                selectedValue={year} 
                onScroll={() => handleScroll(yearRef, "year")} 
                label="년" 
              />
              {/* Month Wheel */}
              <WheelColumn 
                ref={monthRef} 
                items={months} 
                selectedValue={month} 
                onScroll={() => handleScroll(monthRef, "month")} 
                label="월" 
              />
              {/* Day Wheel */}
              <WheelColumn 
                ref={dayRef} 
                items={days} 
                selectedValue={day} 
                onScroll={() => handleScroll(dayRef, "day")} 
                label="일" 
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const WheelColumn = React.forwardRef<HTMLDivElement, { items: number[], selectedValue: number, onScroll: () => void, label: string }>(
  ({ items, selectedValue, onScroll, label }, ref) => {
    return (
      <div style={{ flex: 1, position: "relative", height: "100%", overflow: "hidden" }}>
        <div
          ref={ref}
          onScroll={onScroll}
          style={{
            height: "100%",
            overflowY: "scroll",
            scrollSnapType: "y mandatory",
            padding: "88px 0", // Padding to align center
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            position: "relative",
            zIndex: 1
          }}
          className="hide-scrollbar"
        >
          {items.map((val) => (
            <div
              key={val}
              style={{
                height: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                scrollSnapAlign: "center",
                fontSize: val === selectedValue ? "1.2rem" : "1rem",
                fontWeight: val === selectedValue ? "700" : "400",
                color: val === selectedValue ? "#2C2C2C" : "#999",
                opacity: val === selectedValue ? 1 : 0.5,
                transition: "all 0.2s ease"
              }}
            >
              {val}{label}
            </div>
          ))}
        </div>
      </div>
    );
  }
);
