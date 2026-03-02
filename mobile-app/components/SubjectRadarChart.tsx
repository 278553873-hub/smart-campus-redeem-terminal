import React, { useMemo } from 'react';

interface DimensionData {
  label: string;      // 维度名称, 如 "认字写字"
  score: number;      // 实际得分
  fullScore: number;  // 满分
}

interface SubjectRadarChartProps {
  dimensions: DimensionData[];
}

const SubjectRadarChart: React.FC<SubjectRadarChartProps> = ({ dimensions }) => {
  // 配置
  const size = 280;
  const center = size / 2;
  const radius = 100;

  // 计算得分率并确定颜色，并进行归一化处理
  const processedData = useMemo(() => {
    return dimensions.map(dim => {
      const rate = dim.fullScore > 0 ? (dim.score / dim.fullScore) * 100 : 0;

      // 归一化到1-5刻度，舍去小数
      const normalizedScore = Math.floor((rate / 100) * 5);
      const clampedScore = Math.max(1, Math.min(5, normalizedScore)); // 确保在1-5范围内

      let color = '#10B981'; // 默认绿色
      let status = 'excellent'; // excellent, good, warning, weak

      if (rate >= 95) {
        color = '#10B981'; // 绿色: 达到满分
        status = 'excellent';
      } else if (rate >= 85) {
        color = '#3B82F6'; // 蓝色: 表现良好
        status = 'good';
      } else if (rate >= 70) {
        color = '#F59E0B'; // 黄色: 有提升空间
        status = 'warning';
      } else {
        color = '#EF4444'; // 红色: 需要加强
        status = 'weak';
      }

      return {
        ...dim,
        rate: Math.max(rate, 15), // 最小值保证图形可见
        actualRate: rate, // 保存真实得分率用于判断
        normalizedScore: clampedScore, // 归一化分数 1-5
        color,
        status
      };
    });
  }, [dimensions]);

  // 坐标计算 - 基于1-5刻度
  const getCoordinates = (normalizedScore: number, index: number, total: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const r = (normalizedScore / 5) * radius; // 归一化到1-5刻度
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  // 生成多边形点 - 基于归一化分数
  const generatePoints = (data: typeof processedData) => {
    return data
      .map((item, i) => {
        const coords = getCoordinates(item.normalizedScore, i, data.length);
        return `${coords.x},${coords.y}`;
      })
      .join(' ');
  };

  const dataPoints = generatePoints(processedData);

  // 标签位置计算 (放在雷达图外围)
  const getLabelPosition = (index: number, total: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const labelRadius = radius + 30; // 标签距离中心更远
    return {
      x: center + labelRadius * Math.cos(angle),
      y: center + labelRadius * Math.sin(angle)
    };
  };

  return (
    <div className="flex flex-col items-center justify-center relative">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        {/* 1. 背景参考圆环 - 1到5的刻度线 */}
        {[1, 2, 3, 4, 5].map((level) => (
          <circle
            key={`level-${level}`}
            cx={center}
            cy={center}
            r={(radius * level) / 5}
            fill="none"
            stroke={level === 5 ? '#D1FAE5' : level === 4 ? '#DBEAFE' : level === 3 ? '#FEF3C7' : '#FEE2E2'}
            strokeWidth={level === 5 ? '20' : level === 4 ? '15' : level === 3 ? '15' : '10'}
            opacity="0.3"
          />
        ))}

        {/* 刻度参考线 (虚线) - 标识1到5刻度 */}
        {[1, 2, 3, 4, 5].map((level) => (
          <circle
            key={`ref-${level}`}
            cx={center}
            cy={center}
            r={(radius * level) / 5}
            fill="none"
            stroke="#94A3B8"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.4"
          />
        ))}

        {/* 2. 轴线 */}
        {processedData.map((_, i) => {
          const end = getCoordinates(100, i, processedData.length);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={end.x}
              y2={end.y}
              stroke="#E2E8F0"
              strokeWidth="1"
            />
          );
        })}

        {/* 3. 数据多边形 (带渐变填充) */}
        <defs>
          <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
          </radialGradient>
        </defs>

        <polygon
          points={dataPoints}
          fill="url(#radarGradient)"
          stroke="#3B82F6"
          strokeWidth="2"
          strokeLinejoin="round"
          className="animate-in fade-in zoom-in duration-500"
        />

        {/* 4. 顶点圆点 (带颜色区分) + 分值标注 */}
        {processedData.map((item, i) => {
          const coords = getCoordinates(item.normalizedScore, i, processedData.length);

          // 计算分值标注位置（在数据点外侧更远的位置，避免遮挡）
          const angle = (Math.PI * 2 * i) / processedData.length - Math.PI / 2;
          const scoreRadius = ((item.normalizedScore / 5) * radius) + 25; // 增加到25px避免遮挡
          const scorePos = {
            x: center + scoreRadius * Math.cos(angle),
            y: center + scoreRadius * Math.sin(angle)
          };

          return (
            <g key={i}>
              {/* 数据点圆圈 */}
              <circle
                cx={coords.x}
                cy={coords.y}
                r="5"
                fill={item.color}
                stroke="white"
                strokeWidth="2"
                className="animate-in zoom-in duration-500"
                style={{ animationDelay: `${i * 50}ms` }}
              />

              {/* 分值标注 - 显示归一化分数，带白色背景避免遮挡 */}
              <g>
                {/* 白色背景圆 */}
                <circle
                  cx={scorePos.x}
                  cy={scorePos.y}
                  r="10"
                  fill="white"
                  opacity="0.9"
                />
                {/* 分数文字 */}
                <text
                  x={scorePos.x}
                  y={scorePos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[13px] font-bold"
                  fill={item.color}
                >
                  {item.normalizedScore}
                </text>
              </g>
            </g>
          );
        })}

        {/* 5. 维度标签 - 带颜色和状态图标 */}
        {processedData.map((item, i) => {
          const pos = getLabelPosition(i, processedData.length);

          // 根据状态选择标签颜色
          let labelColor = '#475569'; // 默认灰色
          let icon = '●'; // 默认圆点

          if (item.status === 'excellent') {
            labelColor = '#059669'; // 绿色
            icon = '●'; // 实心圆
          } else if (item.status === 'good') {
            labelColor = '#2563EB'; // 蓝色
            icon = '●';
          } else if (item.status === 'warning') {
            labelColor = '#D97706'; // 橙色
            icon = '▲'; // 三角形
          } else if (item.status === 'weak') {
            labelColor = '#DC2626'; // 红色
            icon = '▼'; // 倒三角
          }

          return (
            <g key={i}>
              {/* 标签文字 */}
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[11px] font-bold"
                fill={labelColor}
              >
                {item.label}
              </text>

              {/* 状态图标 */}
              <text
                x={pos.x}
                y={pos.y + 12}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[10px]"
                fill={labelColor}
              >
                {icon}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default SubjectRadarChart;
