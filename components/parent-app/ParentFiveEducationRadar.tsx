import React from 'react';

type FiveEducationScores = Record<'德' | '智' | '体' | '美' | '劳', number>;

interface ParentFiveEducationRadarProps {
  scores: FiveEducationScores;
}

const radarTone: Record<keyof FiveEducationScores, string> = {
  德: '#F59E0B',
  智: '#3B82F6',
  体: '#10B981',
  美: '#EC4899',
  劳: '#65A30D',
};

const radarLabel: Record<keyof FiveEducationScores, string> = {
  德: '德育',
  智: '智育',
  体: '体育',
  美: '美育',
  劳: '劳育',
};

const averageScores: FiveEducationScores = {
  德: 84,
  智: 80,
  体: 75,
  美: 78,
  劳: 86,
};

const ParentFiveEducationRadar: React.FC<ParentFiveEducationRadarProps> = ({ scores }) => {
  const dimensions = (Object.keys(scores) as Array<keyof FiveEducationScores>).map(label => ({
    label,
    score: scores[label],
    average: averageScores[label],
    color: radarTone[label],
  }));
  const size = 286;
  const center = size / 2;
  const radius = 82;
  const levels = 5;

  const getPoint = (value: number, index: number, total: number, scale = 1) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const currentRadius = (Math.max(0, Math.min(value, 100)) / 100) * radius * scale;
    return {
      x: center + currentRadius * Math.cos(angle),
      y: center + currentRadius * Math.sin(angle),
    };
  };

  const dataPoints = dimensions
    .map((item, index) => {
      const point = getPoint(item.score, index, dimensions.length);
      return `${point.x},${point.y}`;
    })
    .join(' ');

  const averagePoints = dimensions
    .map((item, index) => {
      const point = getPoint(item.average, index, dimensions.length);
      return `${point.x},${point.y}`;
    })
    .join(' ');

  return (
    <div className="ParentFiveEducationRadar" aria-label="五育能力模型">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[#F59E0B]" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3.5a5.5 5.5 0 0 1 3.6 9.66L17 21l-5-2.6L7 21l1.4-7.84A5.5 5.5 0 0 1 12 3.5Z" />
            </svg>
          </span>
          <h2 className="truncate text-[18px] font-black leading-none text-slate-900">五育能力模型</h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" className="h-10 rounded-[9px] bg-slate-900 px-4 text-[13px] font-black text-white shadow-sm">年级平均</button>
          <button type="button" className="h-10 rounded-[9px] border border-slate-200 bg-white px-4 text-[13px] font-black text-slate-400 shadow-sm">上月对比</button>
        </div>
      </div>

      <div className="flex justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="h-[286px] w-[286px] overflow-visible">
          <defs>
            <linearGradient id="parentGrowthRadarFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#8DB7FF" stopOpacity="0.12" />
            </linearGradient>
          </defs>
          {[...Array(levels)].map((_, index) => (
            <polygon
              key={index}
              points={dimensions.map((_, dimensionIndex) => {
                const point = getPoint(100 * ((levels - index) / levels), dimensionIndex, dimensions.length);
                return `${point.x},${point.y}`;
              }).join(' ')}
              fill="transparent"
              stroke="#D9E3F0"
              strokeDasharray="5 6"
              strokeWidth="1.6"
            />
          ))}
          {dimensions.map((_, index) => {
            const point = getPoint(100, index, dimensions.length);
            return <line key={index} x1={center} y1={center} x2={point.x} y2={point.y} stroke="#D6E0EC" strokeWidth="1.6" />;
          })}
          <polygon points={averagePoints} fill="none" stroke="#94A3B8" strokeWidth="2.6" strokeDasharray="8 8" strokeLinejoin="round" />
          <polygon points={dataPoints} fill="url(#parentGrowthRadarFill)" stroke="#3B82F6" strokeWidth="4.5" strokeLinejoin="round" />
          {dimensions.map((item, index) => {
            const point = getPoint(item.score, index, dimensions.length);
            const labelPoint = getPoint(100, index, dimensions.length, 1.36);
            const scorePoint = getPoint(100, index, dimensions.length, 1.13);
            return (
              <g key={item.label}>
                <text x={scorePoint.x} y={scorePoint.y} textAnchor="middle" dominantBaseline="middle" fill={item.color} className="text-[18px] font-black">
                  {item.score}
                </text>
                <circle cx={point.x} cy={point.y} r="7.8" fill="#FFFFFF" stroke={item.color} strokeWidth="4.2" />
                <text x={labelPoint.x} y={labelPoint.y} textAnchor="middle" dominantBaseline="middle" className="fill-slate-500 text-[16px] font-black">
                  {radarLabel[item.label]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 flex items-center justify-center gap-7 text-[13px] font-black text-slate-600">
        <span className="flex items-center gap-2"><i className="h-4 w-4 rounded-full border-[3px] border-[#3B82F6] bg-white" />当前</span>
        <span className="flex items-center gap-2"><i className="h-px w-8 border-t-[3px] border-dashed border-slate-400" />年级平均</span>
      </div>
    </div>
  );
};

export default ParentFiveEducationRadar;
