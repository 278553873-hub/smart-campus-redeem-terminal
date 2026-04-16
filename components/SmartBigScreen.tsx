
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  ChevronDown, 
  Check, 
  Dices, 
  X, 
  ArrowLeft,
  Sparkles,
  LayoutGrid,
  Monitor,
  User,
  Mars,
  Venus,
  Search,
  ChevronRight,
  ChevronLeft,
  Filter,
  Plus,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Settings,
  Pencil,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';

declare global { interface Window { confetti: any; } }

interface StudentData {
  id: string;
  name: string;
  studentNo: string;
  gender: 'male' | 'female';
  initial: string;
  surname: string;
}

interface EvaluationOption {
  id: string;
  label: string;
  type: 'positive' | 'negative';
}

interface SmartBigScreenProps {
  onBack: () => void;
}

const CLASSES = ['2025级1班', '2025级2班', '2025级3班'];

const INITIALS_MAP: Record<string, string> = {
  '林': 'L', '王': 'W', '陈': 'C', '蔡': 'C', '周': 'Z', '赵': 'Z', '孙': 'S', '李': 'L', 
  '吴': 'W', '郑': 'Z', '何': 'H', '谢': 'X', '陶': 'T', '唐': 'T', '张': 'Z', '刘': 'L', 
  '杨': 'Y', '黄': 'H', '高': 'G', '马': 'M', '那': 'N', '晓': 'X', '建': 'J', '丽': 'L', '郭': 'G', '丁': 'D', '徐': 'X'
};

const DEFAULT_OPTIONS: EvaluationOption[] = [
  { id: '1', label: '积极发言', type: 'positive' },
  { id: '2', label: '认真听讲', type: 'positive' },
  { id: '3', label: '遵守纪律', type: 'positive' },
  { id: '4', label: '乐于助人', type: 'positive' },
  { id: '5', label: '积极思考', type: 'positive' },
  { id: '6', label: '开小差', type: 'negative' },
  { id: '7', label: '讲小话', type: 'negative' },
  { id: '8', label: '纪律欠佳', type: 'negative' },
];

const GENERATE_MOCK_DATA = (className: string): StudentData[] => {
  const surnames = ['林', '王', '陈', '蔡', '周', '赵', '孙', '李', '吴', '郑', '何', '谢', '陶', '唐', '张', '刘', '杨', '黄', '高', '马', '郭', '丁', '徐'];
  const names = ['俊杰', '可欣', '子墨', '雨桐', '一凡', '语晨', '沐阳', '思齐', '书瑶', '皓宇', '安然', '梓萱', '传雄', '晶莹', '源', '辉', '力宏', '燕姿', '杰伦', '紫棋', '晓辉', '健敏', '建国', '红兵', '丽华', '志强', '明月', '海清', '天佑', '梦琪'];
  const result: StudentData[] = [];
  const usedNames = new Set<string>();
  const seed = className.includes('1') ? 40 : className.includes('2') ? 38 : 42;
  while (result.length < seed) {
    const s = surnames[Math.floor(Math.random() * surnames.length)];
    const n = names[Math.floor(Math.random() * names.length)];
    const fullName = `${s}${n}`;
    if (!usedNames.has(fullName)) {
      usedNames.add(fullName);
      result.push({
        id: `${className}-${result.length + 1}`,
        name: fullName,
        studentNo: `202501${(result.length + 1).toString().padStart(2, '0')}`,
        gender: Math.random() > 0.5 ? 'male' : 'female',
        initial: INITIALS_MAP[s] || '?',
        surname: s
      });
    }
  }
  return result;
};

const getNameGradient = (name: string) => {
  const surname = name.slice(0, 1);
  const gradients = ['from-[#4c8bf5] to-[#3b7ae0]', 'from-[#f54c9b] to-[#e03b8a]', 'from-[#2ccb72] to-[#25b364]', 'from-[#f5a623] to-[#e08e0b]', 'from-[#9b4cf5] to-[#863be0]', 'from-[#4caaf5] to-[#3b93e0]'];
  let hash = 0;
  for (let i = 0; i < surname.length; i++) hash = surname.charCodeAt(i) + ((hash << 5) - hash);
  return gradients[Math.abs(hash) % gradients.length];
};

const SmartBigScreen: React.FC<SmartBigScreenProps> = ({ onBack }) => {
  const [currentClass, setCurrentClass] = useState(CLASSES[0]);
  const [isClassMenuOpen, setIsClassMenuOpen] = useState(false);
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filterType, setFilterType] = useState<'none' | 'initial' | 'surname'>('none');
  const [filterValue, setFilterValue] = useState<string | null>(null);
  const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female'>('all');
  
  const [evaluationModalOpen, setEvaluationModalOpen] = useState(false);
  const [evalStudent, setEvalStudent] = useState<StudentData | null>(null);
  const [evalTab, setEvalTab] = useState<'positive' | 'negative'>('positive');
  const [isManagerMode, setIsManagerMode] = useState(false);
  const [options, setOptions] = useState<EvaluationOption[]>(DEFAULT_OPTIONS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempLabel, setTempLabel] = useState('');
  const [feedbackEffect, setFeedbackEffect] = useState<{ id: string, type: 'positive' | 'negative', time: number } | null>(null);
  const [isGlobalRaining, setIsGlobalRaining] = useState(false);
  const [randomModalOpen, setRandomModalOpen] = useState(false);
  const [randomStudent, setRandomStudent] = useState<StudentData | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const students = useMemo(() => GENERATE_MOCK_DATA(currentClass), [currentClass]);

  useEffect(() => {
    if (!window.confetti) {
      const script = document.createElement('script');
      script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const filteredStudents = useMemo(() => {
    let result = students;
    if (filterType === 'initial') result = result.filter(s => s.initial === filterValue);
    if (filterType === 'surname') result = result.filter(s => s.surname === filterValue);
    if (filterGender !== 'all') result = result.filter(s => s.gender === filterGender);
    return result;
  }, [students, filterType, filterValue, filterGender]);

  const groupedSurnameIndexes = useMemo(() => {
    const groups: Record<string, string[]> = {};
    students.forEach(s => {
      if (!groups[s.initial]) groups[s.initial] = [];
      if (!groups[s.initial].includes(s.surname)) groups[s.initial].push(s.surname);
    });
    return Object.keys(groups).sort().map(initial => ({ initial, surnames: groups[initial].sort() }));
  }, [students]);

  const resetFilters = () => {
    setFilterType('none');
    setFilterValue(null);
    setFilterGender('all');
  };

  const fireCelebration = () => {
    if (window.confetti) {
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { zIndex: 9999, spread: 40, ticks: 100, gravity: 0.9, scalar: 1.2, startVelocity: 60 };
      const interval: any = setInterval(function() {
        if (Date.now() > animationEnd) return clearInterval(interval);
        const pc = 40 * ((animationEnd - Date.now()) / duration);
        window.confetti({ ...defaults, particleCount: pc, angle: 50, origin: { x: 0, y: 1 } });
        window.confetti({ ...defaults, particleCount: pc, angle: 130, origin: { x: 1, y: 1 } });
      }, 200);
      new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3').play().catch(() => {});
    }
  };

  const fireRaindropHint = (studentId: string) => {
    setFeedbackEffect({ id: studentId, type: 'negative', time: Date.now() });
    setIsGlobalRaining(true);
    new Audio('https://assets.mixkit.co/active_storage/sfx/731/731-preview.mp3').play().catch(() => {});
    setTimeout(() => { setFeedbackEffect(null); setIsGlobalRaining(false); }, 1800);
  };

  const handleEvaluationSelect = (option: EvaluationOption) => {
    if (option.type === 'positive') fireCelebration(); else if (evalStudent) fireRaindropHint(evalStudent.id);
    setTimeout(() => setEvaluationModalOpen(false), 200);
  };

  const handleCardClick = (student: StudentData) => {
    if (isMultiSelect) setSelectedIds(p => p.includes(student.id) ? p.filter(i => i !== student.id) : [...p, student.id]);
    else { setEvalStudent(student); setEvaluationModalOpen(true); setEvalTab('positive'); setIsManagerMode(false); }
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
    resetFilters();
  };

  return (
    <div className="fixed inset-0 bg-[#f0f3f6] font-sans text-slate-800 overflow-hidden flex flex-col">
      {/* 视差雨幕 略... */}
      {isGlobalRaining && (
        <div className="fixed inset-0 z-[110] pointer-events-none overflow-hidden animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-blue-600/5 backdrop-blur-[0.3px]" />
           {[...Array(15)].map((_, i) => (<div key={`b-${i}`} className="absolute w-[1px] bg-blue-300/20 rounded-full animate-raindrop-layered" style={{ left: `${Math.random() * 100}%`, top: '-100px', height: '100px', animationDuration: '0.9s', animationDelay: `${Math.random()}s` }} />))}
           {[...Array(12)].map((_, i) => (<div key={`m-${i}`} className="absolute w-[2px] bg-gradient-to-b from-blue-400/10 via-blue-400/50 to-blue-500/60 rounded-full animate-raindrop-layered shadow-[0_0_6px_rgba(59,130,246,0.2)]" style={{ left: `${Math.random() * 100}%`, top: '-100px', height: '60px', animationDuration: '0.6s', animationDelay: `${Math.random()}s` }} />))}
           {[...Array(8)].map((_, i) => (<div key={`f-${i}`} className="absolute w-[3px] bg-gradient-to-b from-blue-300/40 via-blue-500 to-blue-600 rounded-full animate-raindrop-layered shadow-[0_0_10px_rgba(59,130,246,0.3)]" style={{ left: `${Math.random() * 100}%`, top: '-100px', height: '50px', animationDuration: '0.4s', animationDelay: `${Math.random()}s` }} />))}
        </div>
      )}

      {/* 顶部中央导航层 略... */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-4 relative">
          <div className="bg-blue-600/5 p-1.5 rounded-lg text-blue-600"><Monitor size={18} /></div>
          <div className="relative">
            <button onClick={() => setIsClassMenuOpen(!isClassMenuOpen)} className={`flex items-center gap-2 transition-all px-2 py-1 rounded-lg ${isClassMenuOpen ? 'bg-blue-50' : 'hover:bg-slate-50'}`}><h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">{currentClass}</h1><ChevronDown className={`w-5 h-5 text-slate-300 transition-transform ${isClassMenuOpen ? 'rotate-180' : ''}`} /></button>
            {isClassMenuOpen && (
              <><div className="fixed inset-0 z-[60]" onClick={() => setIsClassMenuOpen(false)} /><div className="absolute top-12 left-0 w-56 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-100 p-1.5 z-[70] animate-in slide-in-from-top-2 duration-200">
                {CLASSES.map(cls => (<button key={cls} onClick={() => { setCurrentClass(cls); setIsClassMenuOpen(false); setSelectedIds([]); resetFilters(); }} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all ${currentClass === cls ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50 font-bold'}`}><span className="text-sm">{cls}</span>{currentClass === cls && <Check size={16} strokeWidth={3} />}</button>))}
              </div></>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-[13px]"><button onClick={onBack} className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] text-white rounded-lg font-bold shadow-sm hover:bg-[#1d4ed8] active:scale-95 transition-all"><ArrowLeft size={16} /><span>返回管理后台</span></button><div className="h-6 w-px bg-slate-200 mx-1" /><span className="text-slate-600 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">管理员 [成都七中初中附属小学]</span><div className="w-8 h-8 bg-[#4c8bf5] rounded-full flex items-center justify-center text-white shrink-0"><User size={16} strokeWidth={3} /></div></div>
      </header>

      {/* 核心区 */}
      <div className="flex-1 flex overflow-hidden relative">
        <section className={`flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar flex flex-col items-center scroll-stable pt-6`}>
          <div className="max-w-[1920px] w-full flex flex-col items-center">
             <div className="grid grid-cols-[repeat(auto-fill,160px)] justify-center gap-6 pb-20 w-full relative">
               <div className="col-span-full h-10 flex items-center justify-end overflow-hidden">
                  {!isSidebarOpen && (
                    <button onClick={() => setIsSidebarOpen(true)} className="h-10 flex items-center gap-2 px-6 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-500 hover:text-blue-600 hover:border-blue-400 transition-all active:scale-95">
                      <Search size={16} /><span className="text-sm font-black tracking-tight">快速定位学生</span>
                    </button>
                  )}
               </div>

               {filteredStudents.map(student => {
                 const isFocused = feedbackEffect?.id === student.id && feedbackEffect.type === 'negative';
                 return (
                   <div key={student.id} onClick={() => handleCardClick(student)} className={`w-[160px] relative bg-white rounded-[1.5rem] p-5 pb-5 transition-all flex flex-col items-center gap-4 cursor-pointer border-2 shadow-[0_4px_15px_rgba(0,0,0,0.02)] active:scale-95 ${isFocused ? 'border-blue-400 bg-blue-50/30' : 'border-white hover:scale-105 hover:border-blue-500 hover:shadow-xl'} ${selectedIds.includes(student.id) ? 'border-blue-500 shadow-lg scale-105 z-10' : ''}`}>
                     {isMultiSelect && (<div className={`absolute top-3 right-3 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${selectedIds.includes(student.id) ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-200 bg-white/80 text-slate-300'}`}><Check size={14} strokeWidth={3} /></div>)}
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-md bg-gradient-to-br shrink-0 ${getNameGradient(student.name)}`}>{student.name.slice(0, 1)}</div>
                     <div className="text-center w-full flex flex-col items-center gap-2"><h3 className="text-[17px] font-bold text-slate-800 tracking-tight leading-none truncate w-full">{student.name}</h3><div className="flex items-center justify-center gap-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100/50 w-full hover:bg-blue-50 transition-colors"><span className="text-[11px] font-bold text-slate-400 font-mono tracking-tighter">{student.studentNo}</span>{student.gender === 'male' ? <Mars size={12} className="text-[#4c8bf5]" strokeWidth={3} /> : <Venus size={12} className="text-[#f54c9b]" strokeWidth={3} />}</div></div>
                   </div>
                 );
               })}
             </div>
          </div>
        </section>

        {/* 侧边收回按钮 */}
        {isSidebarOpen && (
          <button onClick={handleSidebarClose} className="absolute right-[320px] top-1/2 -translate-y-1/2 h-24 w-8 bg-white rounded-l-2xl shadow-[-10px_0_30px_rgba(0,0,0,0.05)] border border-r-0 border-slate-100 flex items-center justify-center text-slate-200 hover:text-blue-500 transition-all z-[90] animate-in fade-in slide-in-from-right-2 duration-300"><ChevronRightIcon size={20} /></button>
        )}

        <aside className={`bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.01)] relative transition-all duration-300 ease-in-out flex flex-col overflow-hidden ${isSidebarOpen ? 'w-[320px] opacity-100 border-l border-slate-100' : 'w-0 opacity-0 border-l-0'}`}>
          <div className="w-[320px] flex-1 overflow-y-auto px-6 pt-10 pb-10 custom-scrollbar shrink-0">
             <div className="flex flex-col items-center gap-8">
              <div className="flex gap-4">
                {/* 重点修复 1：增加“全部”按钮宽度 (w-24)，解决文字拥挤问题 */}
                {/* 重点修复 2：字号从 text-xl 调整为 text-[17px]，与学生卡片姓名一致 */}
                <button 
                  onClick={() => setFilterGender('all')} 
                  className={`w-24 h-14 rounded-full flex items-center justify-center text-[17px] font-bold transition-all ${filterGender === 'all' ? 'bg-[#4c8bf5] text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:border-blue-400'}`}
                >
                  全部
                </button>
                <button 
                  onClick={() => setFilterGender(filterGender === 'male' ? 'all' : 'male')} 
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${filterGender === 'male' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-blue-500 border border-blue-50 hover:border-blue-200'}`}
                >
                  <Mars size={24} strokeWidth={3} />
                </button>
                <button 
                  onClick={() => setFilterGender(filterGender === 'female' ? 'all' : 'female')} 
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${filterGender === 'female' ? 'bg-pink-600 text-white shadow-lg' : 'bg-white text-pink-500 border border-pink-50 hover:border-pink-200'}`}
                >
                  <Venus size={24} strokeWidth={3} />
                </button>
              </div>
              <div className="w-full h-px bg-slate-100" />
              <div className="flex flex-col gap-6 w-full px-2">
                {groupedSurnameIndexes.map(item => (
                  <div key={item.initial} className="flex items-start gap-4">
                    <button 
                      onClick={() => { if (filterType === 'initial' && filterValue === item.initial) resetFilters(); else { setFilterType('initial'); setFilterValue(item.initial); } }} 
                      className={`w-14 h-14 rounded-full flex items-center justify-center text-[17px] font-bold border transition-all shrink-0 ${filterType === 'initial' && filterValue === item.initial ? 'bg-[#4c8bf5] border-blue-500 text-white' : 'bg-[#eef8ff] text-blue-600 border-transparent hover:border-blue-500'}`}
                    >
                      {item.initial}
                    </button>
                    <div className="flex flex-wrap gap-3">{item.surnames.map(sur => (
                      <button 
                        key={sur} 
                        onClick={() => { if (filterType === 'surname' && filterValue === sur) resetFilters(); else { setFilterType('surname'); setFilterValue(sur); } }} 
                        className={`w-14 h-14 rounded-full flex items-center justify-center text-[17px] font-bold border transition-all ${filterType === 'surname' && filterValue === sur ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-500'}`}
                      >
                        {sur}
                      </button>
                    ))}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* 点评弹窗 略... */}
      {evaluationModalOpen && evalStudent && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/10 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-[680px] bg-white rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.1)] overflow-hidden animate-in zoom-in-95 duration-300 border border-white">
            <div className="px-10 pt-10 pb-6 flex items-center justify-between border-b border-slate-50">
               <div className="flex items-center gap-5">
                 {isManagerMode ? ( <div className="bg-slate-100 p-3 rounded-2xl text-slate-500"><Settings size={28} /></div> ) : ( <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-md bg-gradient-to-br ${getNameGradient(evalStudent.name)}`}>{evalStudent.name.slice(0, 1) || '?'}</div> )}
                 <div><h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-2">{isManagerMode ? '管理选项' : evalStudent.name}</h2><span className="text-[11px] font-bold text-slate-300 font-mono tracking-tighter uppercase">{evalStudent.studentNo}</span></div>
               </div>
               <div className="flex items-center gap-4">
                  {!isManagerMode ? (<><div className="flex bg-slate-100 p-1 rounded-xl gap-1"><button onClick={() => setEvalTab('positive')} className={`px-5 py-2 rounded-lg font-black text-xs transition-all ${evalTab === 'positive' ? 'bg-white text-[#2ccb72] shadow-sm' : 'text-slate-400'}`}>表扬</button><button onClick={() => setEvalTab('negative')} className={`px-5 py-2 rounded-lg font-black text-xs transition-all ${evalTab === 'negative' ? 'bg-white text-[#f54c9b] shadow-sm' : 'text-slate-400'}`}>待改进</button></div><button onClick={() => setIsManagerMode(true)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 hover:text-blue-500 transition-all focus:outline-none"><Settings size={18} /></button></>) : (<button onClick={() => setIsManagerMode(false)} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all">保存</button>)}
               </div>
            </div>
            <div className="px-10 py-8 max-h-[500px] overflow-y-auto custom-scrollbar">
               {!isManagerMode ? (<div className="grid grid-cols-2 gap-4 w-full">{options.filter(o => o.type === evalTab).map(option => (<button key={option.id} onClick={() => handleEvaluationSelect(option)} className="h-20 bg-slate-50 border-2 border-transparent rounded-[1.5rem] flex items-center justify-center text-lg font-black text-slate-600 hover:bg-white hover:border-blue-500 hover:text-blue-600 hover:shadow-xl hover:shadow-blue-100 transition-all">{option.label}</button>))}</div>) : (
                 <div className="space-y-8"><div><div className="flex items-center justify-between mb-4 px-2"><span className="text-sm font-bold text-slate-400">选项列表</span><button onClick={() => { setOptions([...options, { id: Date.now().toString(), label: '新选项', type: 'positive' }]); }} className="text-xs font-black text-blue-600">+ 新增</button></div><div className="grid grid-cols-1 gap-2">{options.map(opt => (<div key={opt.id} className="group flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-white border border-transparent hover:border-slate-100 transition-all">{editingId === opt.id ? (<input autoFocus value={tempLabel} onChange={(e) => setTempLabel(e.target.value)} onBlur={() => setEditingId(null)} onKeyDown={(e) => { if (e.key === 'Enter' && tempLabel.trim()) { setOptions(options.map(o => o.id === editingId ? { ...o, label: tempLabel } : o)); setEditingId(null); } }} className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-1 text-sm font-bold text-slate-700 outline-none" />) : (<span className="text-sm font-bold text-slate-600 px-3">{opt.label}</span>)}<div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all"><button onClick={() => { setEditingId(opt.id); setTempLabel(opt.label); }} className="p-2 text-slate-300 hover:text-blue-500 transition-all"><Pencil size={14} /></button><button onClick={() => setOptions(options.filter(o => o.id !== opt.id))} className="p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={14} /></button></div></div>))}</div></div></div>
               )}
            </div>
            <button onClick={() => { setEvaluationModalOpen(false); setIsManagerMode(false); }} className="w-full h-16 bg-slate-50 border-t border-slate-100 text-slate-400 font-bold hover:bg-slate-100 transition-all">关闭</button>
          </div>
        </div>
      )}

      {/* 底部控制 略... */}
      <footer className="px-10 py-6 shrink-0 flex items-center justify-center bg-white border-t border-slate-100 z-50">
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl gap-3 shadow-inner">
          <button onClick={() => { setIsMultiSelect(!isMultiSelect); if (isMultiSelect) setSelectedIds([]); }} className={`flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-black text-sm transition-all focus:outline-none ${isMultiSelect ? 'bg-[#2563eb] text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-100 shadow-sm hover:text-blue-600'}`}>
            <LayoutGrid size={18} />{isMultiSelect ? '取消' : '多选'}
          </button>
          <div className="w-px h-6 bg-slate-200" />
          <button onClick={() => { setRandomModalOpen(true); setIsRolling(true); setRandomStudent(null); let count = 0; const interval = setInterval(() => { setRandomStudent(students[Math.floor(Math.random() * students.length)]); count++; if (count > 25) { clearInterval(interval); setIsRolling(false); } }, 80); }} className="flex items-center gap-2.5 px-8 py-3.5 bg-white text-slate-600 rounded-xl font-black text-sm border border-slate-100 shadow-sm hover:text-[#f5a623] active:scale-95 transition-all focus:outline-none"><Dices size={18} />随机点名</button>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; }
        .scroll-stable { scrollbar-gutter: stable; }
        @keyframes raindrop-layered {
          0% { transform: translateY(0); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 0.8; }
          100% { transform: translateY(120vh); opacity: 0; }
        }
        .animate-raindrop-layered { animation: raindrop-layered linear infinite; }
      `}</style>
    </div>
  );
};

export default SmartBigScreen;
