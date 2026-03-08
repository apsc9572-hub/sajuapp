const fs = require('fs');
const filePath = 'c:\\Users\\COM\\Desktop\\어플\\src\\app\\saju\\page.tsx';

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const returnStartMarker = 'return (';
    const startIdx = data.indexOf(returnStartMarker);
    const endIdx = data.lastIndexOf('}'); // The very last bracket of the file

    if (startIdx === -1) {
        throw new Error('Return statement not found');
    }

    const newContent = data.substring(0, startIdx) + `return (
    <main style={{ width: "100%", minHeight: "100vh", position: "relative", overflow: "hidden", background: "var(--bg-primary)" }}>
      <Disclaimer />
      <TraditionalBackground />
      
      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }} className="container py-8">
        <Link href="/" style={{ textDecoration: "none", display: "inline-block", marginBottom: "30px" }}>
          <button style={{ background: "transparent", border: "none", color: "var(--text-primary)", cursor: "pointer", display: "flex", alignItems: "center", padding: "8px" }}>
            <ArrowLeft className="w-7 h-7" strokeWidth={1.5} />
          </button>
        </Link>

        <div className="text-center" style={{ marginBottom: "50px" }}>
          <div>
            <h1 style={{ fontSize: "2.4rem", marginBottom: "8px", fontWeight: "300" }}>나를 비추는 시간</h1>
            <p style={{ color: "var(--text-secondary)", fontWeight: "400", fontSize: "1.05rem" }}>태어난 시간을 바탕으로 나만의 고유한 흐름을 짚어봅니다.</p>
            {isCached && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ 
                  display: "inline-block", marginTop: "16px", padding: "6px 16px", 
                  background: "rgba(0, 0, 0, 0.05)", border: "1px solid var(--glass-border)",
                  borderRadius: "20px", color: "var(--text-secondary)", fontSize: "0.85rem"
                }}
              >
                 저장된 분석 결과를 불러왔습니다
              </motion.div>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "30px", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
          {/* 입력 폼 영역 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ width: "100%", padding: "0 16px" }}
          >
            <h2 style={{ fontSize: "1.2rem", marginBottom: "30px", display: "flex", alignItems: "center", gap: "8px", fontWeight: "400", borderBottom: "1px solid var(--glass-border)", paddingBottom: "16px" }}>
              <CalendarDays className="w-5 h-5" strokeWidth={1.5} /> 기운을 읽을 정보
            </h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>생년월일</label>
                <div 
                  className="glass-input" 
                  onClick={() => setIsDatePickerOpen(true)}
                  style={{ cursor: "pointer", minHeight: "44px", display: "flex", alignItems: "center" }}
                >
                  {date || "날짜를 선택하세요"}
                </div>
                <WheelDatePicker 
                  isOpen={isDatePickerOpen}
                  onClose={() => setIsDatePickerOpen(false)}
                  initialDate={date}
                  onConfirm={(newDate) => setDate(newDate)}
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "12px", fontSize: "0.95rem", color: "var(--text-secondary)" }}>양/음력</label>
                <div style={{ display: "flex", background: "rgba(0,0,0,0.05)", borderRadius: "30px", padding: "4px" }}>
                  <button style={{ flex: 1, padding: "12px", borderRadius: "30px", border: "none", background: !isLunar ? "rgba(0,0,0,0.1)" : "transparent", color: !isLunar ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: !isLunar ? 600 : 400, transition: "all 0.3s" }} onClick={() => setIsLunar(false)}>양력</button>
                  <button style={{ flex: 1, padding: "12px", borderRadius: "30px", border: "none", background: isLunar ? "rgba(0,0,0,0.1)" : "transparent", color: isLunar ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: isLunar ? 600 : 400, transition: "all 0.3s" }} onClick={() => setIsLunar(true)}>음력</button>
                </div>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "0.95rem", color: "var(--text-secondary)" }}>태어난 시간</label>
                <input type="time" className="glass-input" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "12px", fontSize: "0.95rem", color: "var(--text-secondary)" }}>성별</label>
                <div style={{ display: "flex", background: "rgba(0,0,0,0.05)", borderRadius: "30px", padding: "4px" }}>
                  <button style={{ flex: 1, padding: "12px", borderRadius: "30px", border: "none", background: gender === "M" ? "rgba(0,0,0,0.1)" : "transparent", color: gender === "M" ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: gender === "M" ? 600 : 400, transition: "all 0.3s" }} onClick={() => setGender("M")}>남성</button>
                  <button style={{ flex: 1, padding: "12px", borderRadius: "30px", border: "none", background: gender === "F" ? "rgba(0,0,0,0.1)" : "transparent", color: gender === "F" ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: gender === "F" ? 600 : 400, transition: "all 0.3s" }} onClick={() => setGender("F")}>여성</button>
                </div>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <MapPin className="w-4 h-4" /> 태어난 도시
                </label>
                <select 
                  className="glass-input" 
                  value={birthCity} 
                  onChange={(e) => setBirthCity(e.target.value)}
                  style={{ appearance: "none", cursor: "pointer" }}
                >
                  {Object.keys(cityDataMap).map(city => (
                    <option key={city} value={city} style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>{city}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <button 
              className="btn-primary" 
              style={{ width: "100%", marginTop: "40px", padding: "18px", borderRadius: "30px", fontSize: "1.1rem" }}
              onClick={calculateBazi}
              disabled={isLoading}
            >
              {isLoading && !bazi ? <Clock className="w-5 h-5 animate-spin" /> : <BookOpen className="w-5 h-5" />}
              {isLoading && !bazi ? "타고난 기운을 분석 중입니다..." : "나의 기운 분석하기"}
            </button>
          </motion.div>

          {/* 결과 영역 */}
          <AnimatePresence>
            {(bazi || isLoading) && (
              <motion.div 
                id="result-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ padding: "16px", width: "100%", maxWidth: "95%", margin: "24px auto 0 auto", wordBreak: "keep-all" }}
              >
                <h2 style={{ fontSize: "1.4rem", marginBottom: "30px", color: "var(--accent-gold)", textAlign: "center", fontWeight: "300" }}>천체 기운 흐름 분석 결과</h2>
                
                {isLoading && !bazi ? (
                  <div style={{ padding: "80px 0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ position: "relative", width: "120px", height: "120px", marginBottom: "30px" }}>
                      <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        style={{ 
                          position: "absolute", inset: 0, 
                          borderRadius: "50%", 
                          border: "4px solid rgba(226, 192, 115, 0.1)", 
                          borderTopColor: "var(--accent-gold)" 
                        }} 
                      />
                      <motion.div 
                        animate={{ rotate: -360 }} 
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        style={{ 
                          position: "absolute", inset: '10px', 
                          borderRadius: "50%", 
                          border: "4px solid rgba(0, 0, 0, 0.05)", 
                          borderBottomColor: "var(--accent-gold)",
                          opacity: 0.7
                        }} 
                      />
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "var(--accent-gold)", fontSize: "1.8rem", fontWeight: "bold" }}>{loadingProgress}%</span>
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={loadingTextIdx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5 }}
                        style={{ 
                          color: "var(--accent-gold)", 
                          fontSize: "1.2rem", 
                          fontWeight: 500,
                          textAlign: "center"
                        }}
                      >
                        {loadingTexts[loadingTextIdx]}
                      </motion.div>
                    </AnimatePresence>

                    <div style={{ width: "200px", height: "4px", background: "rgba(0,0,0,0.05)", borderRadius: "4px", marginTop: "20px", overflow: "hidden" }}>
                      <motion.div 
                        animate={{ width: \`\${loadingProgress}%\` }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        style={{ height: "100%", background: "var(--accent-gold)" }}
                      />
                    </div>
                  </div>
                ) : (bazi && (
                    <motion.div 
                        id="result-section-view"
                        ref={resultRef}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full px-0"
                        style={{ display: "flex", flexDirection: "column", gap: "32px", paddingBottom: "100px", wordBreak: "keep-all" }}
                    >
                        {/* 1. 교정 시간 강조 섹션 */}
                        {correctedTimeInfo && (
                            <div style={{
                                padding: "32px 24px",
                                background: "rgba(201, 160, 80, 0.08)",
                                borderRadius: "28px",
                                border: "1px solid rgba(201, 160, 80, 0.3)",
                                boxShadow: "0 10px 40px rgba(0,0,0,0.03)",
                                marginBottom: "12px"
                            }}>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                                    <div style={{ padding: "12px", background: "var(--accent-gold)", borderRadius: "50%", color: "white" }}>
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "1.2rem", color: "var(--text-primary)", fontWeight: "600", marginBottom: "8px" }}>
                                            지리적 위치와 자연시를 균형 있게 보정하였습니다.
                                        </div>
                                        <div style={{ fontSize: "1rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                                            당신이 태어난 <strong style={{ color: "var(--text-primary)" }}>{birthCity}</strong>의 정확한 경도를 반영하여 실제 우주의 기운이 태동한 순간을 포착했습니다. 
                                            일본 표준시(JST) 대비 <strong style={{ color: "var(--accent-gold)" }}>{correctedTimeInfo.offset}분</strong>의 시차를 정밀하게 바로잡았습니다.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. 사주 명식 (만세력) 히어로 섹션 */}
                        <div style={{ textAlign: "center", padding: "40px 0" }}>
                            <span style={{ fontSize: "0.85rem", color: "var(--accent-gold)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "16px", display: "block" }}>The Destiny Pillars</span>
                            <h2 style={{ fontSize: "2.2rem", fontWeight: "300", marginBottom: "40px", color: "var(--text-primary)" }}>당신을 비추는 네 개의 기둥</h2>
                            
                            <div style={{ 
                                display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "16px"
                            }}>
                                {[{t:"시주", g:bazi.time}, {t:"일주", g:bazi.day}, {t:"월주", g:bazi.month}, {t:"년주", g:bazi.year}].map((p: any, i: number) => (
                                    <div key={i} style={{ 
                                        background: "rgba(255, 255, 255, 0.4)", 
                                        backdropFilter: "blur(20px)",
                                        border: "1px solid var(--glass-border)", 
                                        padding: "24px 30px", 
                                        borderRadius: "24px", 
                                        display: "flex", 
                                        flexDirection: "column",
                                        alignItems: "center", 
                                        gap: "12px",
                                        minWidth: "120px",
                                        boxShadow: "0 8px 30px rgba(0,0,0,0.02)"
                                    }}>
                                        <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: "500" }}>{p.t}</span>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "center" }}>
                                            <span style={{ fontSize: "2.2rem", fontWeight: "600", color: "var(--text-primary)", letterSpacing: "4px", lineHeight: 1 }}>{p.g[0]}</span>
                                            <span style={{ fontSize: "2.2rem", fontWeight: "600", color: "var(--text-primary)", letterSpacing: "4px", lineHeight: 1 }}>{p.g[1]}</span>
                                        </div>
                                        <span style={{ fontSize: "0.85rem", color: "var(--accent-gold)", marginTop: "4px" }}>{toKr(p.g[0])}{toKr(p.g[1])}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. 에너지 지표 (Toss style) */}
                        <div style={{ 
                            padding: "32px 24px", 
                            background: "rgba(255, 255, 255, 0.4)", 
                            backdropFilter: "blur(25px)", 
                            borderRadius: "32px", 
                            border: "1px solid rgba(255, 255, 255, 0.4)",
                            boxShadow: "0 10px 50px rgba(0,0,0,0.05)"
                        }}>
                            <h3 style={{ fontSize: "1.2rem", fontWeight: "400", marginBottom: "32px", color: "var(--text-primary)", textAlign: "center" }}>잠재 에너지 밸런스</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                {[
                                    { label: "재물 흐름", key: "wealth", color: "#C9A050", icon: <Coins className="w-5 h-5" /> },
                                    { label: "인연 흐름", key: "love", color: "#E07A5F", icon: <Heart className="w-5 h-5" /> },
                                    { label: "사회적 성과", key: "career", color: "#D4A373", icon: <Briefcase className="w-5 h-5" /> },
                                    { label: "생명력/건강", key: "health", color: "#81b29a", icon: <Activity className="w-5 h-5" /> }
                                ].map((item: any) => {
                                    const score = reading.life_balance[item.key] || 50;
                                    return (
                                        <div key={item.key} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1rem", color: "var(--text-primary)", fontWeight: "500" }}>
                                                    <span style={{ color: item.color }}>{item.icon}</span>
                                                    <span>{item.label}</span>
                                                </div>
                                                <span style={{ fontSize: "1rem", color: item.color, fontWeight: "700" }}>{score}%</span>
                                            </div>
                                            <div style={{ width: "100%", height: "6px", background: "rgba(0,0,0,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: \\\`\${score}%\\\` }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                    style={{ height: "100%", background: item.color, borderRadius: "3px" }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 4. 메인 분석 에세이 */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
                            {/* 인생 총운 */}
                            {reading.general && reading.general.content && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    style={{ 
                                        padding: "40px 24px", 
                                        background: "rgba(255, 255, 255, 0.5)", 
                                        backdropFilter: "blur(25px)", 
                                        borderRadius: "32px", 
                                        border: "1px solid rgba(255, 255, 255, 0.4)",
                                        boxShadow: "0 10px 50px rgba(0,0,0,0.05)"
                                    }}
                                >
                                    <div style={{ marginBottom: "24px" }}>
                                        <span style={{ fontSize: "0.85rem", color: "var(--accent-gold)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1.5px" }}>Master Overview</span>
                                        <h3 style={{ margin: "4px 0 0 0", fontSize: "1.8rem", color: "var(--text-primary)", fontWeight: "300" }}>인생 총운</h3>
                                    </div>
                                    <div style={{ fontSize: "1.1rem", lineHeight: "2.2", color: "var(--text-secondary)", whiteSpace: "pre-line", textAlign: "justify" }}>
                                        {renderHighlightedText(reading.general.content)}
                                    </div>
                                </motion.div>
                            )}

                            {/* 재물 생애주기 (Wealth 전용) */}
                            {reading.wealth_stages && reading.wealth_stages.early && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                    <h3 style={{ fontSize: "1.6rem", color: "var(--text-primary)", fontWeight: "300", paddingLeft: "12px" }}>재물 생애주기 상세 분석</h3>
                                    {[
                                        { label: "초년 (10~20대)", data: reading.wealth_stages.early, icon: "🌱" },
                                        { label: "청년 (30대)", data: reading.wealth_stages.youth, icon: "🌿" },
                                        { label: "중년 (40대)", data: reading.wealth_stages.middle, icon: "🌳" },
                                        { label: "장년 (50대)", data: reading.wealth_stages.mature, icon: "🍂" },
                                        { label: "말년 (60대 이후)", data: reading.wealth_stages.late, icon: "❄️" }
                                    ].map((stage: any, sIdx: number) => stage.data && (
                                        <motion.div
                                            key={sIdx}
                                            initial={{ opacity: 0, x: -15 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            style={{ 
                                                padding: "32px 24px", 
                                                background: "rgba(255, 255, 255, 0.4)", 
                                                backdropFilter: "blur(25px)", 
                                                borderRadius: "28px", 
                                                border: "1px solid rgba(255, 255, 255, 0.3)",
                                                boxShadow: "0 8px 30px rgba(0,0,0,0.03)"
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                                                <span style={{ fontSize: "1.2rem" }}>{stage.icon}</span>
                                                <span style={{ fontSize: "1rem", color: "var(--accent-gold)", fontWeight: "600" }}>{stage.label}</span>
                                            </div>
                                            <div style={{ fontSize: "1.1rem", lineHeight: "2", color: "var(--text-secondary)", whiteSpace: "pre-line", textAlign: "justify" }}>
                                                {renderHighlightedText(stage.data)}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {/* 대운 / 신살 상세 */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
                                <div style={{ 
                                    padding: "32px 24px", 
                                    background: "rgba(255, 255, 255, 0.4)", 
                                    backdropFilter: "blur(20px)", 
                                    borderRadius: "28px", 
                                    border: "1px solid rgba(255, 255, 255, 0.3)" 
                                }}>
                                    <h4 style={{ color: "var(--accent-gold)", fontSize: "1.3rem", fontWeight: "300", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
                                        <Clock className="w-6 h-6" /> 대운 흐름 상세 분석
                                    </h4>
                                    <div style={{ fontSize: "1.1rem", lineHeight: "2.1", color: "var(--text-secondary)", whiteSpace: "pre-line" }}>
                                        {renderHighlightedText(reading.daeun.content)}
                                    </div>
                                </div>
                                <div style={{ 
                                    padding: "32px 24px", 
                                    background: "rgba(255, 255, 255, 0.4)", 
                                    backdropFilter: "blur(20px)", 
                                    borderRadius: "28px", 
                                    border: "1px solid rgba(255, 255, 255, 0.3)" 
                                }}>
                                    <h4 style={{ color: "var(--accent-red)", fontSize: "1.3rem", fontWeight: "300", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
                                        <Sparkles className="w-6 h-6" /> 신살 및 특수 기운 분석
                                    </h4>
                                    <div style={{ fontSize: "1.1rem", lineHeight: "2.1", color: "var(--text-secondary)", whiteSpace: "pre-line" }}>
                                        {renderHighlightedText(reading.sinsal.content)}
                                    </div>
                                </div>
                            </div>

                            {/* 닮은 명사 */}
                            <div style={{ 
                                padding: "40px 24px", 
                                background: "rgba(0,0,0,0.02)", 
                                borderRadius: "32px", 
                                textAlign: "center",
                                border: "1px solid var(--glass-border)"
                            }}>
                                <h3 style={{ fontSize: "1.1rem", color: "var(--accent-gold)", marginBottom: "24px", fontWeight: "400", letterSpacing: "1px" }}>근원적 기운이 닮은 인물</h3>
                                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px" }}>
                                    {reading.celebrities.map((celeb: any, i: number) => (
                                        <div key={i} style={{ padding: "12px 24px", background: "white", borderRadius: "18px", border: "1px solid rgba(0,0,0,0.04)", fontSize: "1rem", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
                                            <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>{celeb.name}</span>
                                            <span style={{ marginLeft: "10px", color: "var(--text-secondary)", fontSize: "0.9rem" }}>{celeb.desc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
`;
    fs.writeFileSync(filePath, newContent, 'utf8');
} catch (e) { console.error(e); }
