import React, { useState, useEffect, useMemo } from 'react';
import { DetailedReportSection, Student, SubjectGrade } from '../types';
import { Sparkles, Edit3, Check, X, Award, Star, TrendingUp } from 'lucide-react';
import SubjectRadarChart from '../components/SubjectRadarChart';

interface ReportDetailViewProps {
  student: Student;
  subject: string;
  initialData: DetailedReportSection[];
  scores: any[];
  allSubjects: SubjectGrade[]; // Passed from parent for the switcher
  onSwitchSubject: (subject: string) => void;
}

const ReportDetailView: React.FC<ReportDetailViewProps> = ({
  student,
  subject,
  initialData,
  scores,
  allSubjects,
  onSwitchSubject
}) => {

  // Local state to handle editing
  const [sections, setSections] = useState<DetailedReportSection[]>(initialData);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  // Sync state when subject (initialData) changes
  useEffect(() => {
    setSections(initialData);
    setEditingIndex(null);
    setEditValue("");
  }, [initialData]);

  // 解析学科维度数据
  const parsedDimensions = useMemo(() => {
    // 根据学科类型返回对应的维度数据
    if (subject === '语文') {
      return [
        { label: '认字写字', score: 4, fullScore: 4 },
        { label: '背诵默写', score: 6, fullScore: 6 },
        { label: '课外阅读', score: 4, fullScore: 6 },
        { label: '口语交际', score: 4, fullScore: 4 },
        { label: '习作表达', score: 6.5, fullScore: 10 },
        { label: '期末检测', score: 52.5, fullScore: 70 },
      ];
    } else if (subject === '数学') {
      return [
        { label: '课堂观察', score: 6, fullScore: 10 },
        { label: '作业情况', score: 18, fullScore: 20 },
        { label: '数学阅读', score: 5, fullScore: 5 },
        { label: '数学设计', score: 5, fullScore: 5 },
        { label: '数学思维', score: 4, fullScore: 5 },
        { label: '数学应用', score: 4, fullScore: 5 },
      ];
    } else if (subject === '英语') {
      return [
        { label: '课堂表现', score: 10, fullScore: 10 },
        { label: '家庭作业', score: 8, fullScore: 10 },
        { label: '单词识记', score: 9, fullScore: 10 },
        { label: '书写作业', score: 9, fullScore: 10 },
        { label: '期末检测', score: 51, fullScore: 60 },
      ];
    } else if (subject === '道法') {
      return [
        { label: '课堂表现', score: 18, fullScore: 20 },
        { label: '作业完成', score: 9, fullScore: 10 },
        { label: '实践活动', score: 9, fullScore: 10 },
        { label: '期末检测', score: 53, fullScore: 60 },
      ];
    } else if (subject === '科学') {
      return [
        { label: '平时成绩', score: 30, fullScore: 30 },
        { label: '活动手册', score: 18, fullScore: 20 },
        { label: '期末考试', score: 40.25, fullScore: 50 },
      ];
    } else if (subject === '体育') {
      return [
        { label: '课堂表现', score: 9, fullScore: 10 },
        { label: '运动技能', score: 18, fullScore: 20 },
        { label: '体能测试', score: 26, fullScore: 30 },
        { label: '团队协作', score: 9, fullScore: 10 },
      ];
    } else if (subject === '音乐') {
      return [
        { label: '演唱表现', score: 18, fullScore: 20 },
        { label: '演奏技能', score: 17, fullScore: 20 },
        { label: '音乐鉴赏', score: 14, fullScore: 15 },
        { label: '课堂参与', score: 14, fullScore: 15 },
        { label: '期末考核', score: 27, fullScore: 30 },
      ];
    } else if (subject === '美术') {
      return [
        { label: '创作能力', score: 18, fullScore: 20 },
        { label: '审美鉴赏', score: 14, fullScore: 15 },
        { label: '课堂表现', score: 14, fullScore: 15 },
      ];
    } else if (subject === '信息技术') {
      return [
        { label: '操作技能', score: 19, fullScore: 20 },
        { label: '编程思维', score: 17, fullScore: 20 },
        { label: '作品质量', score: 28, fullScore: 30 },
      ];
    } else if (subject === '生安心理') {
      return [
        { label: '安全意识', score: 19, fullScore: 20 },
        { label: '心理健康', score: 18, fullScore: 20 },
        { label: '实践能力', score: 13, fullScore: 15 },
      ];
    }
    // 默认返回通用维度
    return [
      { label: '平时表现', score: 18, fullScore: 20 },
      { label: '作业完成', score: 27, fullScore: 30 },
      { label: '期末检测', score: 43, fullScore: 50 },
    ];
  }, [subject]);

  // 计算综合等级
  const grade = useMemo(() => {
    if (parsedDimensions.length === 0) return '优';

    // 计算总得分和总满分
    const totalScore = parsedDimensions.reduce((sum, dim) => sum + dim.score, 0);
    const totalFullScore = parsedDimensions.reduce((sum, dim) => sum + dim.fullScore, 0);

    // 计算得分率
    const scoreRate = totalFullScore > 0 ? (totalScore / totalFullScore) * 100 : 0;

    // 根据得分率确定等级
    // 参考评价标准: 优≥85%, 良70-85%, 合格60-70%
    if (scoreRate >= 85) {
      return '优';
    } else if (scoreRate >= 70) {
      return '良';
    } else if (scoreRate >= 60) {
      return '合格';
    } else {
      return '待提升';
    }
  }, [parsedDimensions]);

  // 获取section样式
  const getSectionStyle = (title: string) => {
    if (title === '学科评价') {
      return 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200';
    }
    if (title === '表现亮点') {
      return 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200';
    }
    if (title === '提升建议' || title === '发展与提升') {
      return 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200';
    }
    return 'bg-white border-slate-100';
  };

  // 获取section图标
  const getSectionIcon = (title: string) => {
    if (title === '学科评价') {
      return <Award className="w-8 h-8" />;
    }
    if (title === '表现亮点') {
      return <Star className="w-8 h-8" />;
    }
    if (title === '提升建议' || title === '发展与提升') {
      return <TrendingUp className="w-8 h-8" />;
    }
    return <Sparkles className="w-8 h-8" />;
  };

  const handleEditClick = (index: number) => {
      setEditingIndex(index);
      setEditValue(sections[index].content);
  };

  const handleSave = (index: number) => {
      const newSections = [...sections];
      newSections[index] = { ...newSections[index], content: editValue };
      setSections(newSections);
      setEditingIndex(null);
      setEditValue("");
  };

  const handleCancel = () => {
      setEditingIndex(null);
      setEditValue("");
  };

  return (
    <div className="pb-10 min-h-screen bg-[#F8FAFC]">
      
      {/* 1. Header Area with Gradient & Switcher */}
      <div className="bg-slate-900 pt-safe pb-6 rounded-b-[2rem] shadow-2xl relative overflow-hidden">
         
         {/* Abstract Tech Background */}
         <div className="absolute inset-0 opacity-20">
             <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500 rounded-full blur-[80px]"></div>
             <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-500 rounded-full blur-[80px]"></div>
         </div>

         <div className="relative z-10 px-4 pt-4">
             {/* Title */}
             <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white leading-tight">
                  2024—2025 学年度下期
                </h2>
                <div className="mt-2 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-blue-200">
                   {student.name} · {subject}
                </div>
             </div>

             {/* Horizontal Subject Switcher */}
             <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar mask-gradient-sides">
                 {allSubjects.map((sub) => {
                     const isActive = sub.subject === subject;
                     return (
                        <button
                            key={sub.subject}
                            onClick={() => onSwitchSubject(sub.subject)}
                            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                                isActive 
                                ? 'bg-white text-slate-900 shadow-lg scale-105' 
                                : 'bg-white/10 text-slate-300 /20'
                            }`}
                        >
                            {sub.subject}
                        </button>
                     );
                 })}
             </div>
         </div>
      </div>

      {/* 学科雷达图 - 新增 */}
      {parsedDimensions.length > 0 && (
        <div className="px-4 -mt-4 relative z-10 mb-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            {/* 等级展示 - 醒目位置 */}
            <div className="flex items-center justify-center mb-3">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white shadow-lg ${
                grade === '优' ? 'bg-gradient-to-r from-amber-400 to-orange-400' :
                grade === '良' ? 'bg-gradient-to-r from-blue-400 to-cyan-400' :
                grade === '合格' ? 'bg-gradient-to-r from-green-400 to-teal-400' :
                'bg-gradient-to-r from-gray-400 to-slate-400'
              }`}>
                <Award className="w-5 h-5" />
                <span className="text-lg font-bold">综合等级: {grade}</span>
              </div>
            </div>

            <SubjectRadarChart dimensions={parsedDimensions} />

            {/* 图例 - 简化版 */}
            <div className="mt-4 px-2">
              <div className="flex justify-center items-center gap-4 text-xs flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-green-600 font-bold">●</span>
                  <span className="text-slate-700">优秀</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-blue-600 font-bold">●</span>
                  <span className="text-slate-700">良好</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-orange-600 font-bold">▲</span>
                  <span className="text-slate-700">待提升</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-red-600 font-bold">▼</span>
                  <span className="text-slate-700">需加强</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 -mt-4 relative z-10 space-y-4">

        {/* Report Content Sections - 优化显示 */}
        {sections.map((section, index) => (
          <div
            key={index}
            className={`rounded-2xl p-5 shadow-sm border relative overflow-hidden transition-all ${getSectionStyle(section.title)}`}
          >
             {/* 背景装饰图标 - 调整位置避免重叠 */}
             <div className="absolute bottom-3 right-3 opacity-5 text-slate-400 pointer-events-none">
                {getSectionIcon(section.title)}
             </div>

             <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-2">
                    <span className="text-blue-500">
                        <Sparkles className="w-4 h-4" />
                    </span>
                    <h3 className="text-base font-bold text-slate-800">{section.title}</h3>
                </div>

                {/* Edit Controls - Always Visible for Mobile */}
                {editingIndex === index ? (
                     <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                         <button 
                            onClick={() => handleSave(index)}
                            className="p-2 bg-green-50 text-green-600 rounded-full active:bg-green-100 border border-green-200 transition-colors"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                         <button 
                            onClick={handleCancel}
                            className="p-2 bg-red-50 text-red-600 rounded-full active:bg-red-100 border border-red-200 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                     </div>
                 ) : (
                     <button 
                        onClick={() => handleEditClick(index)}
                        className="p-2 text-slate-300 active:text-blue-600 active:bg-blue-50 rounded-full transition-all"
                     >
                        <Edit3 className="w-4 h-4" />
                     </button>
                 )}
             </div>

             {/* Content Area - Editable vs View */}
             {editingIndex === index ? (
                 <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full min-h-[150px] p-4 text-sm text-slate-700 bg-white/50 border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 leading-relaxed resize-none animate-in fade-in duration-200"
                    autoFocus
                 />
             ) : (
                <div className="text-sm text-slate-700 leading-7 whitespace-pre-line font-normal text-justify relative z-10">
                    {section.content}
                </div>
             )}
          </div>
        ))}

        <div className="pt-4 pb-8 text-center">
            <span className="text-[10px] text-slate-400">内容由AI生成</span>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailView;