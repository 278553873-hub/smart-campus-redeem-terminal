import React, { useMemo } from 'react';

interface SubjectGradesChartProps {
  subjects: {
    subject: string;
    grade: string; // '优', '良', '合格', '待提升'
  }[];
  onSubjectClick?: (subject: string) => void; // 点击学科查看详情（外部跳转）
  showClickHint?: boolean; // 是否显示点击提示
}

const SubjectGradesChart: React.FC<SubjectGradesChartProps> = ({ subjects, onSubjectClick, showClickHint = true }) => {
  // 等级映射到颜色
  const gradeMapping = {
    '优': { color: '#059669', bgColor: '#F0FDF4', label: '优' }, // Emerald
    '良': { color: '#2563EB', bgColor: '#EFF6FF', label: '良' }, // Blue
    '合格': { color: '#D97706', bgColor: '#FFFBEB', label: '合格' }, // Amber
    '待提升': { color: '#DC2626', bgColor: '#FEF2F2', label: '待提升' }, // Red
  };

  return (
    <div className="w-full">
      {/* 标题 */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700">学科成绩分布</h3>
      </div>

      {/* 网格布局 (3列) */}
      <div className="grid grid-cols-3 gap-2.5">
        {subjects.map((sub, index) => {
          const mapping = gradeMapping[sub.grade as keyof typeof gradeMapping] || gradeMapping['合格'];
          
          return (
            <button
              key={index}
              onClick={() => onSubjectClick?.(sub.subject)}
              className={`
                flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all
                ${onSubjectClick ? 'cursor-pointer active:scale-95' : ''}
              `}
              style={{ backgroundColor: mapping.bgColor }}
            >
              <div className="text-[13px] font-bold mb-1" style={{ color: '#334155' }}>
                {sub.subject}
              </div>
              <div className="text-[13px] font-black" style={{ color: mapping.color }}>
                {sub.grade}
              </div>
            </button>
          );
        })}
      </div>

      {/* 查看详情提示 */}
      {onSubjectClick && showClickHint && (
        <div className="mt-4 text-center">
          <span className="text-[10px] text-slate-400 font-medium">
            💡 点击学科方块查看详细学科分析报告
          </span>
        </div>
      )}
    </div>
  );
};


export default SubjectGradesChart;
