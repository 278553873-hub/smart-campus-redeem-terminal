
import React, { useState } from 'react';
import { Smartphone, Camera, ChevronLeft, History, User, FileText, Sparkles, LogOut, CheckCircle2, ShieldCheck, BookOpen, Clock, LayoutDashboard, Settings, MoreHorizontal as MoreHorizontalLucide, ArrowRight, Stars, Zap, BrainCircuit, Globe } from 'lucide-react';
import PhoneMockup from './PhoneMockup';

/**
 * Standard iOS Font Mappings (pt to tailwind)
 * Large Title: 34pt  -> text-[34px]
 * Title 1:     28pt  -> text-[28px]
 * Title 2:     22pt  -> text-[22px]
 * Title 3:     20pt  -> text-[20px]
 * Headline:    17pt+B-> text-[17px] font-bold
 * Body:        17pt  -> text-[17px]
 * Callout:     16pt  -> text-[16px]
 * Subhead:     15pt  -> text-[15px]
 * Footnote:    13pt  -> text-[13px]
 * Caption 1:   12pt  -> text-[12px]
 * Caption 2:   11pt  -> text-[11px]
 * 
 * Using Default iOS System Fonts (-apple-system, SF Pro)
 */

type Screen = 'login' | 'binding' | 'home' | 'correction' | 'result' | 'history';

interface CorrectionRecord {
  id: string;
  date: string;
  essayTitle: string;
  grade: string;
  score: number;
  aiComment: string;
  requirements: string[];
}

const MOCK_RECORDS: CorrectionRecord[] = [
  {
    id: 'rec_1',
    date: '2026-03-27',
    essayTitle: 'My Favorite Food',
    grade: '四年级',
    score: 92,
    aiComment: '本文基本符合四年级作文能力要求。句式完整，单词拼写准确。建议：可以尝试使用更多连接词，让逻辑更顺畅。',
    requirements: ['能够正确使用主谓宾结构', '掌握常见介词的使用', '词汇量覆盖教材核心词']
  },
  {
    id: 'rec_2',
    date: '2026-03-20',
    essayTitle: 'A Rainy Day',
    grade: '四年级',
    score: 88,
    aiComment: '描述生动，能够运用本学期所学词汇。标点符号使用需要更严谨。',
    requirements: ['能够正确使用过去式', '掌握并列句的使用']
  }
];

const ParentApp: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('login');
  const [parentName, setParentName] = useState<string>('');
  const [studentInfo, setStudentInfo] = useState<{ schoolCode: string; name: string; studentId: string } | null>(null);
  const [history, setHistory] = useState<CorrectionRecord[]>(MOCK_RECORDS);
  const [activeRecord, setActiveRecord] = useState<CorrectionRecord | null>(null);

  const renderHeader = (title: string, showBack = true) => (
    <div className="h-[52px] bg-white/70 backdrop-blur-xl border-b border-white/20 flex items-center justify-between px-4 shrink-0 sticky top-0 z-[45]">
      <div className="flex items-center">
        {showBack && (
          <button onClick={() => setScreen('home')} className="w-10 h-10 -ml-2 active:bg-slate-100 rounded-2xl transition-all mr-1 flex items-center justify-center">
            <ChevronLeft size={24} className="text-slate-800" />
          </button>
        )}
        <h1 className="text-[17px] font-bold text-slate-800 tracking-tight">{title}</h1>
      </div>
      <button className="p-2 text-slate-400 active:text-indigo-500">
        <MoreHorizontalLucide size={22} />
      </button>
    </div>
  );

  const renderContent = () => {
    switch (screen) {
      case 'login':
        return (
          <div className="flex-1 bg-white mb-[83px] flex flex-col items-center justify-center p-8 gap-12 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[40%] bg-indigo-200/30 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-[-5%] right-[-10%] w-[50%] h-[30%] bg-purple-200/30 rounded-full blur-[80px]"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-400 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-100 mb-8 animate-pulse">
                <BrainCircuit size={48} className="text-white" />
              </div>
              
              <div className="text-center">
                <h2 className="text-[34px] font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight mb-4">智批作文</h2>
                <div className="flex flex-col items-center gap-2">
                   <div className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[13px] font-bold tracking-widest flex items-center gap-2 uppercase">
                     <Zap size={14} /> AI Guardian
                   </div>
                   <p className="text-[17px] text-slate-400 mt-2 font-medium">专为 K9 设计的智慧辅导中心</p>
                </div>
              </div>
            </div>

            <div className="w-full relative z-10 space-y-4 pt-4">
              <button 
                onClick={() => { setScreen('binding'); setParentName('王明'); }} 
                className="w-full h-[60px] bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[1.75rem] flex items-center justify-center gap-3 font-semibold text-[17px] active:scale-95 transition-all shadow-xl shadow-indigo-100"
              >
                微信一键开启智慧守护
              </button>
              <p className="text-slate-400 text-[12px] text-center font-medium px-8 opacity-60 leading-relaxed">
                开启即代表您同意智批服务协议与数据保护政策
              </p>
            </div>
          </div>
        );

      case 'binding':
        return (
          <div className="flex-1 bg-[#F8FAFF] flex flex-col p-6 gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/50 rounded-full blur-3xl"></div>
            
            <div className="space-y-1.5 relative z-10 pt-4">
              <h2 className="text-[28px] font-bold text-slate-900 leading-tight">同步成长足迹</h2>
              <p className="text-indigo-400 font-semibold text-[15px] flex items-center gap-2">
                <Globe size={16} /> 数字化校园 · 信息核验中心
              </p>
            </div>
            
            <div className="flex flex-col gap-6 relative z-10">
              {[
                { label: '学校编码', placeholder: '请输入 6 位专属代码' },
                { label: '学生姓名', placeholder: '请输入孩子真实姓名' },
                { label: '学号/ID', placeholder: '请输入校园卡学号' }
              ].map((field, i) => (
                <div key={i} className="space-y-2">
                  <label className="text-[15px] font-semibold text-slate-500 ml-1 flex items-center gap-2 uppercase tracking-tight">
                    {field.label}
                  </label>
                  <input 
                    type="text" 
                    placeholder={field.placeholder}
                    className="w-full h-[52px] bg-white border-2 border-slate-100 rounded-[1.25rem] px-5 font-bold text-[16px] text-slate-800 placeholder:text-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all shadow-sm"
                  />
                </div>
              ))}
            </div>

            <button 
              onClick={() => { setScreen('home'); setStudentInfo({ schoolCode: 'BS2024', name: '郑小磊', studentId: '202208' }); }} 
              className="mt-4 w-full h-[56px] bg-[#22C55E] text-white rounded-[1.25rem] font-bold text-[17px] active:scale-95 transition-all shadow-xl shadow-green-100 flex items-center justify-center gap-3"
            >
              完成绑定并开启云批改
              <ArrowRight size={20} />
            </button>
          </div>
        );

      case 'home':
        return (
          <div className="flex-1 bg-[#F8FAFF] flex flex-col overflow-y-auto pb-[130px] relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[100px] pointer-events-none"></div>
            
            {renderHeader('智慧看板', false)}
            
            <div className="p-4 space-y-6 relative z-10">
              {/* Profile Card - iOS Style Elevation */}
              <div className="bg-white rounded-[2rem] p-6 shadow-[0_12px_40px_rgba(99,102,241,0.06)] border border-slate-50 relative overflow-hidden">
                <div className="absolute -right-4 -top-8 w-40 h-40 bg-gradient-to-br from-indigo-50/50 to-transparent rounded-full opacity-60"></div>
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-14 h-14 rounded-[1.25rem] bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100 relative">
                    <User size={28} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[22px] font-bold text-slate-900 leading-none tracking-tight">{parentName}家长</h3>
                    <div className="inline-flex items-center gap-1.5 mt-1.5 bg-indigo-50 px-2.5 py-0.5 rounded-lg">
                       <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest">Active AI</span>
                       <div className="w-1 h-1 rounded-full bg-indigo-300"></div>
                       <span className="text-slate-400 text-[11px] font-medium">Today</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-[#F9FBFF] rounded-[1.5rem] p-4 border border-indigo-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm bg-indigo-100">
                      <img src="https://i.pravatar.cc/100?u=郑小磊" alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-bold text-[16px] text-slate-800 leading-none">{studentInfo?.name}</div>
                      <div className="text-[12px] font-semibold text-indigo-400 mt-1.5 uppercase tracking-widest leading-none">四年级 · 一班</div>
                    </div>
                  </div>
                  <div className="bg-white px-3 py-1.5 rounded-[12px] shadow-sm border border-slate-50 flex items-center gap-1.5 active:scale-95 transition-all">
                     <span className="text-[13px] font-bold text-[#22C55E]">Growth: A+</span>
                  </div>
                </div>
              </div>

              {/* Action Area - Visual Balance */}
              <div className="space-y-4">
                <div 
                  onClick={() => setScreen('correction')} 
                  className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[2rem] p-6 transition-all active:scale-[0.97] cursor-pointer shadow-xl shadow-indigo-200 relative overflow-hidden"
                >
                  <div className="absolute right-[-5%] bottom-[-5%] w-[40%] h-[60%] bg-white/10 rounded-full blur-[30px]"></div>
                  <div className="flex items-center gap-5 relative z-10">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-[1.5rem] flex items-center justify-center border border-white/20 shadow-inner">
                      <Camera size={28} className="text-white" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[20px] font-bold text-white leading-none mb-1">拍照批改</h4>
                      <p className="text-indigo-100 font-semibold text-[13px] opacity-90">AI 瞬时生成作文综合评分报告</p>
                    </div>
                  </div>
                </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-[1.75rem] p-5 border border-slate-50 flex flex-col gap-3 active:scale-95 transition-all cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.03)] active:border-amber-200">
                        <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center ring-1 ring-amber-100 border-2 border-white shadow-sm">
                            <BookOpen size={20} />
                        </div>
                        <div className="font-bold text-[16px] text-slate-800">作文题库</div>
                    </div>
                    <div className="bg-white rounded-[1.75rem] p-5 border border-slate-50 flex flex-col gap-3 active:scale-95 transition-all cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.03)] active:border-sky-200">
                        <div className="w-10 h-10 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center ring-1 ring-sky-100 border-2 border-white shadow-sm">
                             <Settings size={20} />
                        </div>
                        <div className="font-bold text-[16px] text-slate-800">批改偏好</div>
                    </div>
                </div>
              </div>

              {/* History Section Standardized */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-[20px] font-bold text-slate-800 flex items-center gap-2.5">
                    <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                    最近批阅记录
                  </h4>
                  <button className="text-indigo-600 font-bold text-[13px] px-3 py-1.5 bg-indigo-50 rounded-full active:bg-indigo-100 transition-all font-semibold">查看全部</button>
                </div>
                
                <div className="space-y-3">
                  {history.map(rec => (
                    <div 
                      key={rec.id} 
                      onClick={() => { setActiveRecord(rec); setScreen('result'); }}
                      className="bg-white px-5 py-4 rounded-[1.75rem] border border-slate-50 flex items-center gap-4 active:bg-indigo-50/20 transition-all cursor-pointer shadow-sm group"
                    >
                      <div className="w-14 h-14 bg-slate-50 text-indigo-500 rounded-[1.25rem] flex items-center justify-center active:bg-indigo-600 active:text-white transition-all duration-300">
                        <FileText size={24} strokeWidth={2} />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-slate-900 text-[17px] leading-tight mb-1">{rec.essayTitle}</div>
                        <div className="flex items-center gap-3">
                          <span className="text-[12px] font-medium text-slate-400">{rec.date}</span>
                          <span className="text-[12px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg">AI: {rec.score}</span>
                        </div>
                      </div>
                      <ChevronLeft size={16} className="text-slate-200 rotate-180" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'result':
        const displayData = activeRecord || history[0];
        return (
          <div className="flex-1 bg-white flex flex-col overflow-y-auto pb-[130px] relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-[100px] pointer-events-none opacity-40"></div>
            
            {renderHeader('深度诊断报告')}
            
            <div className="p-4 space-y-6 relative z-10">
              {/* iOS Style Badges */}
              <div className="flex items-center justify-between px-1">
                <div className="inline-flex items-center gap-2 bg-[#22C55E] text-white px-4 py-2 rounded-full shadow-lg shadow-green-100">
                  <CheckCircle2 size={18} className="text-white/80" />
                  <span className="text-[15px] font-bold">判定达标：{displayData.grade}优秀</span>
                </div>
                <div className="text-slate-400 text-[13px] font-semibold uppercase tracking-widest">{displayData.date}</div>
              </div>

              {/* Score Display Standardized */}
              <div className="bg-white rounded-[2rem] p-8 shadow-[0_15px_45px_rgba(0,0,0,0.05)] border border-slate-50 relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-50 rounded-full blur-2xl opacity-60"></div>
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="space-y-1.5">
                    <h3 className="text-[20px] font-bold text-slate-800">深度学习诊断</h3>
                    <div className="flex gap-1 text-indigo-400 opacity-80">
                      {[1,2,3,4,5].map(s => <Stars key={s} size={16} fill={s <= 4 ? "currentColor" : "none"} />)}
                    </div>
                  </div>
                  <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white rounded-[1.75rem] flex flex-col items-center justify-center shadow-xl shadow-indigo-100 border-[3px] border-white">
                    <span className="text-[11px] font-bold opacity-50 uppercase tracking-widest leading-none mb-1">Score</span>
                    <span className="text-[34px] font-bold leading-none">{displayData.score}</span>
                  </div>
                </div>

                <div className="mt-8 p-5 bg-[#F9FBFF] rounded-[1.75rem] border border-indigo-50/50 relative">
                  <div className="absolute top-[-10px] left-6 px-3 py-0.5 bg-white border border-indigo-50 rounded-full text-[10px] font-bold text-indigo-500 uppercase tracking-widest">AI Assessment</div>
                  <p className="text-[17px] text-slate-700 font-semibold leading-relaxed">“ {displayData.aiComment} ”</p>
                </div>
              </div>

              {/* Requirement Cards Standardized */}
              <div className="bg-[#FBFCFF] rounded-[2rem] p-7 border border-indigo-50/50 space-y-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 bg-white text-indigo-500 rounded-[1.25rem] flex items-center justify-center shadow-sm border border-indigo-50">
                    <BrainCircuit size={28} />
                  </div>
                  <div>
                    <h3 className="text-[20px] font-bold text-slate-800 leading-none mb-1.5">多维能力诊断</h3>
                    <p className="text-slate-400 text-[12px] font-semibold uppercase tracking-widest leading-none">Capacity Assessment</p>
                  </div>
                </div>
                
                <div className="space-y-3.5">
                  {displayData.requirements.map((req, i) => (
                    <div key={i} className="flex gap-4 bg-white p-4 rounded-[1.25rem] border border-indigo-50 transition-all active:bg-indigo-50 shadow-sm">
                      <div className="w-6 h-6 rounded-[8px] bg-emerald-50 text-emerald-500 flex-shrink-0 flex items-center justify-center border border-emerald-100/50">
                        <CheckCircle2 size={16} />
                      </div>
                      <span className="text-[15px] font-semibold text-slate-600 leading-snug">{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 mb-10">
                <button 
                  onClick={() => setScreen('home')}
                  className="h-[56px] bg-white border border-slate-100 text-slate-500 rounded-[1.25rem] font-bold text-[17px] active:bg-slate-50 active:scale-95 transition-all shadow-sm"
                >
                  继续上传
                </button>
                <button onClick={() => setScreen('home')} className="h-[56px] bg-indigo-600 text-white rounded-[1.25rem] font-bold text-[17px] active:opacity-90 active:scale-95 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2">
                  <span className="text-white">同步云库</span>
                  <ArrowRight size={20} className="text-white/60" />
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-screen h-[100dvh] bg-[#EDF1F7] flex items-center justify-center overflow-hidden p-4">
      <PhoneMockup>
        <div className="flex-1 flex flex-col relative overflow-hidden bg-white">
          {renderContent()}

          {/* iOS Style Glass Bottom Bar */}
          {(screen === 'home' || screen === 'history') && (
            <div className="absolute bottom-0 left-0 w-full h-[90px] px-6 pb-[36px] z-50">
              <div className="absolute inset-0 bg-white/40 backdrop-blur-2xl border-t border-white/30 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]"></div>
              
              <div className="relative h-full flex items-center justify-between pointer-events-none">
                {/* Tab 1 */}
                <button 
                  onClick={() => setScreen('home')}
                  className={`w-[72px] flex flex-col items-center justify-center gap-1 transition-all pointer-events-auto active:scale-90 ${screen === 'home' ? 'text-indigo-600' : 'text-slate-400 opacity-60'}`}
                >
                  <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-all ${screen === 'home' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'active:bg-indigo-50/50'}`}>
                    <LayoutDashboard size={26} strokeWidth={screen === 'home' ? 2.5 : 2} />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest mt-0.5">看板</span>
                </button>

                {/* Primary Action Fix: Absolute Center */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-11 pointer-events-auto">
                  <button 
                    onClick={() => setScreen('correction')}
                    className="w-[78px] h-[78px] bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-full flex items-center justify-center shadow-[0_15px_30px_rgba(99,102,241,0.3)] border-[6px] border-white active:scale-90 transition-all"
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 active:opacity-100 transition-opacity"></div>
                    <Camera size={32} className="text-white" strokeWidth={2.5} />
                  </button>
                  <div className="absolute inset-0 -z-10 animate-ping opacity-10 bg-indigo-500 rounded-full scale-[1.2]"></div>
                </div>

                {/* Tab 2 */}
                <button 
                  onClick={() => setScreen('history')}
                  className={`w-[72px] flex flex-col items-center justify-center gap-1 transition-all pointer-events-auto active:scale-90 ${screen === 'history' ? 'text-indigo-600' : 'text-slate-400 opacity-60'}`}
                >
                   <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-all ${screen === 'history' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'active:bg-indigo-50/50'}`}>
                    <History size={26} strokeWidth={screen === 'history' ? 2.5 : 2} />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest mt-0.5">动态</span>
                </button>
              </div>
              
              {/* iOS Home Indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-900/10 rounded-full"></div>
            </div>
          )}
        </div>
      </PhoneMockup>
    </div>
  );
};

export default ParentApp;
