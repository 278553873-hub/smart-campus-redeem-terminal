import React, { useMemo } from 'react';

interface DimensionData {
  label: string;
  score: number;
}

interface FiveEducationRadarSimpleProps {
  dimensions: DimensionData[];
  startDimensions?: DimensionData[]; // 期初数据
}

const FiveEducationRadarSimple: React.FC<FiveEducationRadarSimpleProps> = ({ dimensions, startDimensions }) => {
  const size = 280;
  const center = size / 2;
  const radius = 95;
  const levels = 4;

  const getCoordinates = (value: number, index: number, total: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const r = (Math.max(value, 15) / 100) * radius; // 最小值15，避免图形消失
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const generatePoints = (data: DimensionData[]) => {
    return data.map((s, i) => {
      const coords = getCoordinates(s.score, i, data.length);
      return `${coords.x},${coords.y}`;
    }).join(' ');
  };

  const endPoints = generatePoints(dimensions);
  const startPoints = startDimensions ? generatePoints(startDimensions) : '';

  return (
    <div className="flex flex-col items-center justify-center relative">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* 1. 背景网格 */}
        {[...Array(levels)].map((_, i) => (
          <polygon
            key={i}
            points={dimensions.map((_, idx) => {
              const val = 100 * ((levels - i) / levels);
              const c = getCoordinates(val, idx, dimensions.length);
              return `${c.x},${c.y}`;
            }).join(' ')}
            fill={i === 0 ? "#F8FAFC" : "transparent"}
            stroke="#E2E8F0"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}

        {/* 2. 轴线 */}
        {dimensions.map((_, i) => {
          const end = getCoordinates(100, i, dimensions.length);
          return (
            <line
              key={i}
              x1={center} y1={center}
              x2={end.x} y2={end.y}
              stroke="#E2E8F0"
              strokeWidth="1"
            />
          );
        })}

        {/* 3. 期初数据层 (橙色虚线框) */}
        {startDimensions && (
          <g>
            <polygon
              points={startPoints}
              fill="transparent"
              stroke="#F97316"
              strokeWidth="2"
              strokeDasharray="4 2"
              className="opacity-40"
            />
            {startDimensions.map((s, i) => {
              const coords = getCoordinates(s.score, i, startDimensions.length);
              return (
                <circle
                  key={i}
                  cx={coords.x} cy={coords.y}
                  r="3"
                  fill="#F97316"
                  className="opacity-40"
                />
              );
            })}
          </g>
        )}

        {/* 4. 期末数据层 (蓝色填充) */}
        <g>
          <polygon
            points={endPoints}
            fill="rgba(59, 130, 246, 0.2)"
            stroke="#3B82F6"
            strokeWidth="2.5"
          />
          {dimensions.map((s, i) => {
            const coords = getCoordinates(s.score, i, dimensions.length);
            const labelCoords = getCoordinates(115, i, dimensions.length);

            return (
              <g key={i}>
                <circle
                  cx={coords.x} cy={coords.y}
                  r="4"
                  fill="white"
                  stroke="#3B82F6"
                  strokeWidth="2"
                />
                <text
                  x={labelCoords.x}
                  y={labelCoords.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[12px] font-bold fill-slate-500"
                >
                  {s.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* 图例 */}
      <div className="flex gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="text-[10px] font-bold text-slate-400">期末评价</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-0.5 bg-orange-500 border-t border-dashed border-orange-500"></div>
          <span className="text-[10px] font-bold text-slate-400">期初评价</span>
        </div>
      </div>
    </div>
  );
};


export default FiveEducationRadarSimple;
