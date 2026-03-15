"use client";

import { motion } from "framer-motion";
import { Sparkles, MoonStar, BookOpen, Scroll, Navigation, Coins, Briefcase, Activity, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Disclaimer from "@/components/Disclaimer";
import TraditionalBackground from "@/components/TraditionalBackground";

export default function Home() {
  const menus = [
    { title: "오늘의 흐름", icon: <Sparkles className="w-8 h-8" strokeWidth={1.2} />, color: "var(--accent-indigo)", link: "/fortune?type=daily" },
    { title: "이달의 흐름", icon: <MoonStar className="w-8 h-8" strokeWidth={1.2} />, color: "var(--accent-indigo)", link: "/fortune?type=monthly" },
    { title: "올해의 흐름", icon: <Scroll className="w-8 h-8" strokeWidth={1.2} />, color: "var(--accent-indigo)", link: "/fortune?type=yearly" },
    { title: "전통 사주", icon: <BookOpen className="w-8 h-8" strokeWidth={1.2} />, color: "var(--accent-indigo)", link: "/saju" },
    { title: "재물운", icon: <Coins className="w-8 h-8" strokeWidth={1.2} />, color: "var(--accent-gold)", link: "/fortune?type=wealth" },
    { title: "사업운", icon: <Briefcase className="w-8 h-8" strokeWidth={1.2} />, color: "var(--accent-gold)", link: "/fortune?type=business" },
    { title: "건강운", icon: <Activity className="w-8 h-8" strokeWidth={1.2} />, color: "#81b29a", link: "/fortune?type=health" },
    { title: "애정운", icon: <Heart className="w-8 h-8" strokeWidth={1.2} />, color: "var(--accent-cherry)", link: "/fortune?type=love" },
  ];

  return (
    <main style={{ width: "100%", minHeight: "100vh", position: "relative", overflow: "hidden", background: "var(--bg-primary)" }}>
      <Disclaimer />
      
      <TraditionalBackground />

      {/* 포그라운드 UI 컨텐츠 - 투명도를 높여(0.45 -> 0.7) 배경 위에서 글자가 더 잘 보이게 함 */}
      <div style={{ 
        position: "relative", 
        zIndex: 10, 
        height: "100%", 
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "center", 
        alignItems: "center",
        background: "rgba(255, 255, 255, 0.75)", // 대비 향상을 위해 불투명도 증가
        padding: "10px 0",
        overflow: "hidden" // 스크롤 원천 차단
      }}>
        <div className="container" style={{ width: "100%", padding: "20px 0" }}>
          
          <motion.div 
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "50px" }}
          >
            <div style={{ position: "relative", marginBottom: "20px" }}>
              <motion.div
                animate={{ 
                  y: [0, -5, 0],
                  scale: [1, 1.02, 1]
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                style={{
                  width: "clamp(100px, 25vw, 130px)",
                  height: "clamp(100px, 25vw, 130px)",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.98)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 2,
                  boxShadow: "0 10px 40px rgba(42, 54, 95, 0.12)",
                  border: "2px solid rgba(248, 215, 218, 0.5)",
                  overflow: "hidden"
                }}
              >
                <Image 
                  src="/cheong_a_mae_dang_final_logo.png" 
                  alt="청아매당 로고" 
                  width={130}
                  height={130}
                  style={{ 
                    width: "100%", 
                    height: "100%", 
                    objectFit: "contain"
                  }} 
                  priority
                />
              </motion.div>
              {/* Soft Ambient Glow */}
              <div style={{ 
                position: "absolute", 
                top: "50%", 
                left: "50%", 
                transform: "translate(-50%, -50%)", 
                width: "200px", 
                height: "200px", 
                background: "radial-gradient(circle, rgba(248, 215, 218, 0.4) 0%, transparent 70%)", 
                opacity: 0.5, 
                zIndex: 1 
              }}></div>
            </div>

            <div style={{ position: "relative", textAlign: "center", marginBottom: "32px", zIndex: 5 }}>
              <h1 className="traditional-title" style={{ 
                fontSize: "clamp(1.5rem, 5vw, 2.1rem)", 
                fontWeight: "900",
                color: "var(--accent-indigo)", 
                letterSpacing: "0.15em",
                margin: "0 0 8px 0",
                position: "relative",
                zIndex: 2,
                fontFamily: "'Nanum Myeongjo', serif",
                textShadow: "0 2px 15px rgba(255, 255, 255, 1), 0 0 30px rgba(255, 255, 255, 1)" // 글자 뒤 광운 효과로 가독성 확보
              }}>
                청아매당
              </h1>
              {/* More Dramatic Ink Wash Style Underline */}
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "130%", opacity: 0.9 }} // 불투명도 높임
                transition={{ delay: 0.2, duration: 1, ease: "easeOut" }}
                style={{ 
                  position: "absolute",
                  bottom: "15px",
                  left: "-15%",
                  height: "20px",
                  background: "radial-gradient(ellipse at center, var(--accent-cherry) 0%, transparent 80%)",
                  filter: "blur(15px)",
                  zIndex: 1,
                  transform: "rotate(-1.5deg)"
                }}
              />
              <p style={{ 
                fontSize: "0.75rem",
                color: "var(--accent-indigo)",
                letterSpacing: "0.02em",
                margin: "6px 0 0 0",
                opacity: 0.95, // 텍스트 진하게
                fontFamily: "'Nanum Myeongjo', serif",
                fontWeight: "700", // 더 굵게
                textAlign: "center"
              }}>
                전통의 지혜로 당신의 길을 비추다
              </p>
            </div>
          </motion.div>

            <motion.div 
              style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(4, 1fr)", 
                gap: "16px 8px", 
                maxWidth: "480px", 
                margin: "0 auto",
                padding: "0 10px",
                perspective: "1000px" 
              }}
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              initial="hidden"
              animate="show"
            >
              {menus.map((menu, index) => (
                <Link href={menu.link} key={menu.title} style={{ textDecoration: "none" }}>
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, scale: 0.8, y: 20 },
                      show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } }
                    }}
                    style={{ 
                      cursor: "pointer", 
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "10px",
                      textAlign: "center",
                      transformStyle: "preserve-3d"
                    }}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -8, 
                      rotateX: 5, 
                      rotateY: -5,
                      filter: "brightness(1.05)"
                    }}
                    whileTap={{ scale: 0.95, y: 0, rotateX: 0, rotateY: 0 }}
                  >
                    <motion.div 
                      style={{
                        width: "clamp(50px, 13vw, 62px)",
                        height: "clamp(50px, 13vw, 62px)",
                        borderRadius: "50%",
                        background: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: menu.color,
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)", // 더 강한 그림자
                        border: "1px solid rgba(42, 54, 95, 0.15)", // 더 진한 테두리
                        transition: "box-shadow 0.3s ease"
                      }}
                      whileHover={{
                        boxShadow: "0 20px 30px rgba(0,0,0,0.1), inset 0 2px 0 rgba(255,255,255,1), 0 0 15px rgba(255,255,255,0.8)"
                      }}
                    >
                      {menu.icon}
                    </motion.div>
                    <span style={{ 
                      fontSize: "0.6rem", 
                      fontWeight: 900, 
                      color: "var(--accent-indigo)", 
                      letterSpacing: "-0.5px",
                      marginTop: "1px",
                      textShadow: "0 2px 10px rgba(255, 255, 255, 1), 0 0 20px rgba(255, 255, 255, 1)" // 가독성을 위한 강한 화이트 쉐도우
                    }}>{menu.title}</span>
                  </motion.div>
                </Link>
              ))}
            </motion.div>

        </div>

        {/* AdSense 최적화를 위한 정통 사주 가이드 섹션 (1,500자 이상의 풍부한 컨텐츠) */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          style={{ 
            width: "100%", 
            maxWidth: "800px", 
            margin: "0 auto", 
            padding: "80px 24px",
            background: "linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 15%, rgba(255, 255, 255, 0.95) 100%)",
            borderRadius: "40px 40px 0 0",
            boxShadow: "0 -20px 60px rgba(0,0,0,0.03)",
            zIndex: 5,
            position: "relative"
          }}
        >
          <div style={{ textAlign: "left", color: "var(--accent-indigo)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
              <div style={{ width: "40px", height: "1px", background: "var(--accent-gold)" }}></div>
              <h2 style={{ 
                fontSize: "1.8rem", 
                fontWeight: 800, 
                fontFamily: "'Nanum Myeongjo', serif",
                letterSpacing: "-0.02em"
              }}>
                청아매당 정통 사주 가이드
              </h2>
            </div>

            <div style={{ lineHeight: "2.1", fontSize: "1.05rem", color: "var(--text-secondary)", wordBreak: "keep-all", fontFamily: "'Nanum Myeongjo', serif" }}>
              <section style={{ marginBottom: "56px" }}>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "20px", color: "var(--accent-indigo)", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ color: "var(--accent-gold)" }}>01.</span> 사주명리학: 삶의 지혜를 담은 동양의 정수
                </h3>
                <p>
                  사주명리학(四柱命理學)은 수천 년 전부터 이어져 온 동양 철학의 결정체로, 우주와 자연의 섭리를 인간의 삶에 투영하여 해석하는 고도의 학문입니다. 단순히 미래를 우연히 맞히는 점술을 넘어, 개인이 타고난 기운의 특징과 흐름을 객관적으로 인식하고 이를 삶의 지혜로 활용하는 자기 탐구의 과정이라 할 수 있습니다. 현대 사회에서도 사주명리학은 여전히 강력한 힘을 발휘하며, 수많은 사람들이 자신의 성향을 파악하고 최선의 선택을 내리는 데 있어 중요한 나침반 역할을 하고 있습니다. 청아매당은 이러한 전통 명리학의 정수를 현대적인 감각으로 재해석하여, 여러분이 마주한 삶의 다양한 고민에 대해 탁월한 통찰력을 제공하고자 합니다.
                </p>
                <p style={{ marginTop: "16px" }}>
                  명리학은 '명(命)'을 아는 학문입니다. 여기서 명이란 정해진 숙명이 아니라, 내가 태어난 시점의 우주적 기운이 고착된 '그릇'을 의미합니다. 자신의 그릇이 무엇인지, 그리고 그 그릇에 무엇을 담을 수 있는지를 아는 것은 인생의 시행착오를 줄이는 가장 빠른 길입니다. 청아매당 가이드는 여러분이 스스로의 명을 깊이 읽고, 다가올 운의 흐름에 유연하게 대처할 수 있도록 돕는 실무적인 지침서가 될 것입니다.
                </p>
              </section>

              <section style={{ marginBottom: "56px" }}>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "20px", color: "var(--accent-indigo)", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ color: "var(--accent-gold)" }}>02.</span> 내 운명의 나침반, 사주(四柱)의 구성 원리
                </h3>
                <p>
                  사주(四柱)는 문자 그대로 사람이 태어난 연(年), 월(月), 일(日), 시(時)의 네 기둥을 의미합니다. 각 기둥에는 천간(天干)과 지지(地支)라는 두 개의 글자가 배정되어 총 여덟 글자(팔자, 八字)가 형성됩니다. 이 여덟 글자는 만물을 구성하는 오행(목, 화, 토, 금, 수)의 기운으로 밀도 있게 이루어져 있으며, 이들 사이의 상생(相生)과 상극(相剋)이라는 복합적인 상호작용을 통해 한 사람의 선천적인 기질, 잠재된 재능, 건강 상태, 그리고 대인관계와 사회적 성취의 거대한 흐름을 생생하게 보여줍니다.
                </p>
                <div style={{ background: "rgba(42, 54, 95, 0.03)", padding: "32px", borderRadius: "24px", marginTop: "24px", border: "1px solid rgba(42, 54, 95, 0.05)" }}>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    <li style={{ marginBottom: "16px" }}><strong style={{ color: "var(--accent-indigo)" }}>- 년주(年柱):</strong> 인생의 뿌리이자 조상의 정기를 나타내며, 국가나 가문과 같은 근본적인 환경과 유년기 운세를 상징합니다.</li>
                    <li style={{ marginBottom: "16px" }}><strong style={{ color: "var(--accent-indigo)" }}>- 월주(月柱):</strong> 성장의 토대이자 사회적 활동의 배경이 되는 부모, 형제와의 인연 및 청년기의 직업적 목표와 성취를 의미합니다.</li>
                    <li style={{ marginBottom: "16px" }}><strong style={{ color: "var(--accent-indigo)" }}>- 일주(日柱):</strong> 한 사람의 핵심이자 '나 자신'을 직접적으로 상징하는 기둥으로, 배우자와의 관계 및 중년기 인생의 전성기를 나타냅니다.</li>
                    <li style={{ marginBottom: 0 }}><strong style={{ color: "var(--accent-indigo)" }}>- 시주(시柱):</strong> 인생의 마무리를 짓는 자녀 운과 말년의 평온함, 그리고 내면 깊숙이 숨겨진 비밀스러운 성향을 투영합니다.</li>
                  </ul>
                </div>
              </section>

              <section style={{ marginBottom: "56px" }}>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "20px", color: "var(--accent-indigo)", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ color: "var(--accent-gold)" }}>03.</span> 2026년 병오년(丙午年), 도약과 열정의 시기
                </h3>
                <p>
                  오는 2026년은 병오년(丙午年)으로, '붉은 말'의 해입니다. 천간의 병화(丙火)와 지지의 오화(午火)가 만나 위아래가 모두 뜨거운 화(火)의 기운으로 가득 차는 매우 역동적인 시기입니다. 이는 그동안 정체되어 있던 기운이 활발히 움직이며, 새로운 기회와 성장이 폭발적으로 일어날 수 있음을 암시합니다. 하지만 강한 불기운은 급격한 변화를 초래할 수 있으므로, 자신의 사주 구성에 따라 이 기운을 어떻게 다스리느냐가 성공의 관건이 될 것입니다. 
                </p>
                <p style={{ marginTop: "16px" }}>
                  특히 병오년의 기운은 숨겨져 있던 진실이 드러나고, 화려하게 빛나는 시기이기도 합니다. 명예를 소중히 여기고 열정적으로 도전하는 이들에게는 병오년의 기운이 강력한 추진력이 되어줄 것입니다. 반면, 이미 화 기운이 너무 강한 사주라면 지나친 확정보다는 내실을 기하고 감정을 조절하는 지혜가 필요합니다. 청아매당은 여러분의 사주가 2026년의 뜨거운 기운과 어떻게 조화를 이룰지 정밀하게 분석해 드립니다.
                </p>
              </section>

              <section style={{ marginBottom: "56px" }}>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "20px", color: "var(--accent-indigo)", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ color: "var(--accent-gold)" }}>04.</span> 재물운을 보는 법: 풍요를 부르는 사주학적 통찰
                </h3>
                <p>
                  많은 분들이 가장 궁금해하는 '재물운'은 단순히 돈의 많고 적음을 넘어, 재물을 얻는 방식과 이를 유지하는 능력을 복합적으로 분석해야 합니다. 사주에서 재물운은 일간(나)이 극하는 성분인 '재성(財星)'을 중심으로 판단합니다. 재성은 크게 정재(正財)와 편재(偏財)로 나뉘며, 정재는 성실하게 쌓아가는 안정적인 자산을 뜻하고, 편재는 큰 규모의 유동적인 재물이나 사업적 성취를 의미합니다.
                </p>
                <p style={{ marginTop: "16px" }}>
                  하지만 재성이 많다고 무조건 부자가 되는 것은 아닙니다. 재물을 내 것으로 만들고 지탱할 수 있는 '나의 힘(일간)'이 충분히 강해야 하며, 재물을 지속적으로 만들어내는 원동력인 '식상(食傷)'이 조화롭게 배치되어야 비로소 큰 부의 흐름을 거머쥘 수 있습니다. 자신의 재물운 유형이 어떤 방식에 적합한지 파악하는 것이 경제적 독립을 위한 첫걸음입니다. 청아매당은 여러분의 타고난 재물 기질을 명확히 진단하여, 부의 경로를 안내합니다.
                </p>
              </section>

              <section style={{ marginBottom: "56px" }}>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "20px", color: "var(--accent-indigo)", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ color: "var(--accent-gold)" }}>05.</span> 개운법(開運法): 나쁜 기운을 물리치고 행운을 부르는 법
                </h3>
                <p>
                  운명은 고정된 화석이 아니라, 나의 선택과 의지, 그리고 환경의 변화를 통해 충분히 개선할 수 있는 유동적인 에너지입니다. 이를 명리학에서는 '개운법'이라 칭합니다. 자신에게 부족한 오행의 기운을 보강하는 색상의 의복을 착용하거나, 집안의 인테리어 방향을 조절하는 것만으로도 운의 흐름은 미세하게 변화하기 시작합니다. 
                </p>
                <p style={{ marginTop: "16px" }}>
                  가장 강력한 개운법은 자신의 명식을 정확히 알고, 때를 기다릴 줄 아는 인내와 기회가 왔을 때 과감히 발을 내딛는 용기를 갖추는 것입니다. 또한 긍정적인 마음가짐과 타인에 대한 배려는 탁한 운을 씻어내고 맑고 강한 운을 정화시키는 최고의 비법입니다. 개운은 단순한 미신이 아닌, 나를 둘러싼 환경의 주파수를 긍정적으로 맞추는 에너지 최적화 과정입니다.
                </p>
              </section>

              <section style={{ marginBottom: "40px" }}>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "20px", color: "var(--accent-indigo)", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ color: "var(--accent-gold)" }}>06.</span> 결론: 청아매당과 함께하는 새로운 운명의 시작
                </h3>
                <p>
                  사주는 우리 인생의 계절을 알려주는 지도와 같습니다. 겨울이 오면 두꺼운 옷을 준비하고, 봄이 오면 씨앗을 뿌릴 준비를 하듯, 자신의 운을 미리 알고 대비하는 것은 인생이라는 거친 바다를 항해하는 데 있어 가장 현명한 태도입니다. 청아매당의 정밀한 사주 분석 서비스를 통해 여러분의 타고난 명식 속에 숨겨진 보석 같은 재능을 발견하고, 다가올 2026년과 그 이후의 풍요로운 미래를 전략적으로 설계해 보시기 바랍니다. 당신의 운명을 비추는 따뜻한 빛, 청아매당이 언제나 함께하겠습니다.
                </p>
                <p style={{ marginTop: "24px", color: "var(--accent-indigo)", fontWeight: 700 }}>
                  지금 위 메뉴에서 당신의 오늘과 내일, 그리고 평생의 흐름을 확인해 보세요.
                </p>
              </section>
            </div>
          </div>
        </motion.div>

      </div>
    </main>
  );
}
