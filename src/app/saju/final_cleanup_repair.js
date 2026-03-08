const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/app/saju/page.tsx');

// 1. Files to delete
const filesToDelete = [
    'src/app/saju/page_old.tsx',
    'src/app/saju/bulletproof_repair.js',
    'src/app/saju/robust_repair.js',
    'src/app/saju/final_repair.js',
    'src/app/saju/overhaul_ui.js',
    'src/app/saju/update_ui.js',
    'src/app/saju/repair_page.js',
    'src/app/saju/clean_encoding.js',
    'src/app/saju/apply_modular_repair.js',
    'src/app/saju/replacement_logic.txt',
    'src/app/saju/replacement_ui.txt',
    'src/app/saju/find_junk.js',
    'src/app/saju/search_page.js',
    'src/app/saju/exhaustive_search.js',
    'src/app/saju/check_error.js',
    'src/app/saju/check_encoding.js',
    'src/app/saju/locate_mess.js',
    'src/app/saju/final_overhaul.js'
];

filesToDelete.forEach(f => {
    const p = path.join(process.cwd(), f);
    if (fs.existsSync(p)) {
        fs.unlinkSync(p);
        console.log(`Deleted: ${f}`);
    }
});

// 2. Structural Repair of page.tsx
try {
    let data = fs.readFileSync(filePath, 'utf8');
    
    // Locate the transition from loading to result (Line 953 in latest view)
    const startMarker = ') : bazi && (';
    const startIdx = data.lastIndexOf(startMarker);
    
    // Locate the end of the AnimatePresence (Line 1329 in latest view)
    const endMarker = '</AnimatePresence>';
    const endIdx = data.indexOf(endMarker, startIdx);

    if (startIdx === -1 || endIdx === -1) {
        console.error('Markers not found');
        process.exit(1);
    }

    const newUI = `) : (bazi && (
                    <motion.div 
                        id="result-section"
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
                                {[{t:"시주", g:bazi.time}, {t:"일주", g:bazi.day}, {t:"월주", g:bazi.month}, {t:"년주", g:bazi.year}].map((p, i) => (
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
                                ].map((item) => {
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
                                                    animate={{ width: \`\${score}%\` }}
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
                                    ].map((stage, sIdx) => stage.data && (
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
                                    {reading.celebrities.map((celeb, i) => (
                                        <div key={i} style={{ padding: "12px 24px", background: "white", borderRadius: "18px", border: "1px solid rgba(0,0,0,0.04)", fontSize: "1rem", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
                                            <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>{celeb.name}</span>
                                            <span style={{ marginLeft: "10px", color: "var(--text-secondary)", fontSize: "0.9rem" }}>{celeb.desc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))`;

    const finalContent = data.substring(0, startIdx) + newUI + data.substring(endIdx);
    fs.writeFileSync(filePath, finalContent, 'utf8');
    console.log('Successfully repaired page.tsx structure');

} catch (err) {
    console.error('Failed to repair page.tsx:', err);
    process.exit(1);
}
