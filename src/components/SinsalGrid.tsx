import React from 'react';
import { SAJU_DICTIONARY } from '../lib/premium-saju-utils';

interface PillarData {
  stem: string;
  branch: string;
  stemKo: string;
  branchKo: string;
  stemSinsals: string[];
  branchSinsals: string[];
  element: { stem: string; branch: string };
}

// 용어 가이드 툴팁 컴포넌트
const TermTooltip = ({ term, children }: { term: string, children: React.ReactNode }) => {
  const [show, setShow] = React.useState(false);
  const description = SAJU_DICTIONARY[term];

  if (!description) return <>{children}</>;

  return (
    <div 
      style={{ position: 'relative', display: 'inline-block', cursor: 'help' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow(!show)}
    >
      {children}
      {show && (
        <div style={{
          position: 'absolute',
          bottom: '120%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '180px',
          background: 'rgba(42, 54, 95, 0.95)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '0.75rem',
          fontWeight: '400',
          lineHeight: '1.4',
          zIndex: 1000,
          boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
          pointerEvents: 'none',
          textAlign: 'center'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '2px' }}>{term}</div>
          {description}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            marginLeft: '-5px',
            borderWidth: '5px',
            borderStyle: 'solid',
            borderColor: 'rgba(42, 54, 95, 0.95) transparent transparent transparent'
          }} />
        </div>
      )}
    </div>
  );
};

interface SinsalGridProps {
  data: {
    year: PillarData;
    month: PillarData;
    day: PillarData;
    hour: PillarData;
  };
}

const ELEMENT_COLORS: Record<string, string> = {
  wood: '#81b29a', fire: '#e07a5f', earth: '#D4A373', metal: '#6d6875', water: '#3d5a80'
};

const SinsalGrid: React.FC<SinsalGridProps> = ({ data }) => {
  const pillars = [
    { label: '생시', p: data.hour },
    { label: '생일', p: data.day },
    { label: '생월', p: data.month },
    { label: '생년', p: data.year }
  ];

  const renderSinsalList = (list: string[]) => {
    if (list.length === 0) return <span style={{ color: '#ccc', fontSize: '0.75rem' }}>✕</span>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
        {list.map((s, i) => (
          <TermTooltip key={i} term={s}>
            <span style={{ 
              fontSize: '0.78rem', 
              fontWeight: '600', 
              color: s.includes('귀인') ? 'var(--accent-gold)' : '#555',
              lineHeight: '1.2',
              wordBreak: 'keep-all'
            }}>
              {s}
            </span>
          </TermTooltip>
        ))}
      </div>
    );
  };

  return (
    <div style={{ 
      background: 'white', 
      borderRadius: '24px', 
      padding: '20px 12px', 
      boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
      border: '1px solid rgba(201,160,80,0.15)',
      margin: '20px 0'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--accent-indigo)', fontFamily: "'Nanum Myeongjo', serif", margin: 0 }}>신살과 길성</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(40px, 0.8fr) repeat(4, 1.2fr)', border: '1px solid #efefef', borderRadius: '12px', overflow: 'hidden' }}>
        {/* Header Row */}
        <div style={{ background: '#f8f9fa', padding: '10px 0', borderRight: '1px solid #efefef', borderBottom: '1px solid #efefef' }}></div>
        {pillars.map((item, i) => (
          <div key={i} style={{ 
            background: '#f8f9fa', 
            padding: '10px 0', 
            textAlign: 'center', 
            fontSize: '0.8rem', 
            fontWeight: '700', 
            color: '#666',
            borderRight: i < 3 ? '1px solid #efefef' : 'none',
            borderBottom: '1px solid #efefef'
          }}>
            {item.label}
          </div>
        ))}

        {/* Stem Character Row */}
        <div style={{ padding: '12px 0', background: '#fff', borderRight: '1px solid #efefef', borderBottom: '1px solid #efefef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '600', color: '#999' }}>천간</div>
        {pillars.map((item, i) => (
          <div key={i} style={{ 
            padding: '12px 0', 
            textAlign: 'center', 
            borderRight: i < 3 ? '1px solid #efefef' : 'none',
            borderBottom: '1px solid #efefef',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '1rem', fontWeight: '800', color: ELEMENT_COLORS[item.p.element.stem], fontFamily: "'Nanum Myeongjo', serif" }}>
              {item.p.stemKo}({item.p.stem})
            </span>
          </div>
        ))}

        {/* Stem Sinsal Row */}
        <div style={{ padding: '12px 0', background: '#fafafa', borderRight: '1px solid #efefef', borderBottom: '1px solid #efefef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '600', color: '#999' }}>길성</div>
        {pillars.map((item, i) => (
          <div key={i} style={{ 
            padding: '12px 0', 
            textAlign: 'center', 
            background: '#fafafa',
            borderRight: i < 3 ? '1px solid #efefef' : 'none',
            borderBottom: '1px solid #efefef',
            minHeight: '40px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {renderSinsalList(item.p.stemSinsals)}
          </div>
        ))}

        {/* Branch Character Row */}
        <div style={{ padding: '12px 0', background: '#fff', borderRight: '1px solid #efefef', borderBottom: '1px solid #efefef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '600', color: '#999' }}>지지</div>
        {pillars.map((item, i) => (
          <div key={i} style={{ 
            padding: '12px 0', 
            textAlign: 'center', 
            borderRight: i < 3 ? '1px solid #efefef' : 'none',
            borderBottom: '1px solid #efefef',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '1rem', fontWeight: '800', color: ELEMENT_COLORS[item.p.element.branch], fontFamily: "'Nanum Myeongjo', serif" }}>
              {item.p.branchKo}({item.p.branch})
            </span>
          </div>
        ))}

        {/* Branch Sinsal Row */}
        <div style={{ padding: '12px 0', background: '#fafafa', borderRight: '1px solid #efefef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '600', color: '#999' }}>길성</div>
        {pillars.map((item, i) => (
          <div key={i} style={{ 
            padding: '12px 0', 
            textAlign: 'center', 
            background: '#fafafa',
            borderRight: i < 3 ? '1px solid #efefef' : 'none',
            minHeight: '60px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {renderSinsalList(item.p.branchSinsals)}
          </div>
        ))}
      </div>

      <p style={{ fontSize: '0.72rem', color: '#999', marginTop: '12px', textAlign: 'center', lineHeight: '1.4' }}>
        * 각 기둥에 머무는 신살과 길성은 해당 시기의 운과 인생 전반의 환경을 상징합니다.
      </p>
    </div>
  );
};

export default SinsalGrid;
