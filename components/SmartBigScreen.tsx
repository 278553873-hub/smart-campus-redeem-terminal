
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
  History,
  RotateCcw,
  CheckSquare
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
  category: string;
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
  // 表扬选项 (15个)
  { id: 'p1', label: '积极举手', category: '发言表达', type: 'positive' },
  { id: 'p2', label: '大胆发言', category: '发言表达', type: 'positive' },
  { id: 'p3', label: '声音响亮', category: '发言表达', type: 'positive' },
  { id: 'p4', label: '表达清晰', category: '发言表达', type: 'positive' },
  { id: 'p10', label: '主动参与', category: '发言表达', type: 'positive' },

  { id: 'p5', label: '认真倾听', category: '听课状态', type: 'positive' },
  { id: 'p6', label: '专注听讲', category: '听课状态', type: 'positive' },
  { id: 'p9', label: '勤于思考', category: '听课状态', type: 'positive' },

  { id: 'p7', label: '坐姿端正', category: '行为纪律', type: 'positive' },
  { id: 'p11', label: '合作积极', category: '行为纪律', type: 'positive' },
  { id: 'p12', label: '准备充分', category: '行为纪律', type: 'positive' },
  { id: 'p13', label: '知错就改', category: '行为纪律', type: 'positive' },
  { id: 'p14', label: '遵守纪律', category: '行为纪律', type: 'positive' },

  { id: 'p8', label: '书写工整', category: '学习态度', type: 'positive' },
  { id: 'p15', label: '作业认真', category: '学习态度', type: 'positive' },

  // 待改进选项 (12个)
  { id: 'n4', label: '随意插话', category: '发言表达', type: 'negative' },
  { id: 'n11', label: '消极旁观', category: '发言表达', type: 'negative' },
  { id: 'n12', label: '声音微弱', category: '发言表达', type: 'negative' },

  { id: 'n1', label: '注意力涣散', category: '听课状态', type: 'negative' },
  { id: 'n5', label: '不倾听他人', category: '听课状态', type: 'negative' },
  { id: 'n8', label: '小动作多', category: '听课状态', type: 'negative' },

  { id: 'n2', label: '交头耳语', category: '行为纪律', type: 'negative' },
  { id: 'n3', label: '坐姿松散', category: '行为纪律', type: 'negative' },
  { id: 'n9', label: '准备拖沓', category: '行为纪律', type: 'negative' },

  { id: 'n6', label: '书写潦草', category: '学习态度', type: 'negative' },
  { id: 'n7', label: '做事拖拉', category: '学习态度', type: 'negative' },
  { id: 'n10', label: '作业敷衍', category: '学习态度', type: 'negative' },
];

const GENERATE_MOCK_DATA = (className: string): StudentData[] => {
  const surnames = ['林', '王', '陈', '蔡', '周', '赵', '孙', '李', '吴', '郑', '何', '谢', '陶', '唐', '张', '刘', '杨', '黄', '高', '马', '郭', '丁', '徐'];
  const names = ['俊杰', '可欣', '子墨', '雨桐', '一凡', '语晨', '沐阳', '思齐', '书瑶', '皓宇', '安然', '梓萱', '传雄', '晶莹', '源', '辉', '力宏', '燕姿', '杰伦', '紫棋', '晓辉', '健敏', '建国', '红兵', '丽华', '志强', '明月', '明哲', '天佑', '梦琪'];
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
  const [managerSelectedCategory, setManagerSelectedCategory] = useState('发言表达');
  const [categories, setCategories] = useState(['发言表达', '听课状态', '行为纪律', '学习态度']);
  const [options, setOptions] = useState<EvaluationOption[]>(DEFAULT_OPTIONS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempLabel, setTempLabel] = useState('');
  const [tempCategory, setTempCategory] = useState('');
  const [editingCategoryName, setEditingCategoryName] = useState<string | null>(null);
  const [tempCategoryName, setTempCategoryName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [newOptionLabel, setNewOptionLabel] = useState('');
  const [feedbackEffect, setFeedbackEffect] = useState<{ id: string, type: 'positive' | 'negative', time: number } | null>(null);
  const [isGlobalRaining, setIsGlobalRaining] = useState(false);
  const [randomModalOpen, setRandomModalOpen] = useState(false);
  const [randomStudents, setRandomStudents] = useState<StudentData[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [isRandomFanOpen, setIsRandomFanOpen] = useState(false);
  const [evalRecords, setEvalRecords] = useState<{ id: string, studentNames: string[], optionLabel: string, type: 'positive' | 'negative', time: string }[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

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
      const interval: any = setInterval(function () {
        if (Date.now() > animationEnd) return clearInterval(interval);
        const pc = 40 * ((animationEnd - Date.now()) / duration);
        window.confetti({ ...defaults, particleCount: pc, angle: 50, origin: { x: 0, y: 1 } });
        window.confetti({ ...defaults, particleCount: pc, angle: 130, origin: { x: 1, y: 1 } });
      }, 200);
      new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3').play().catch(() => { });
    }
  };

  const fireRaindropHint = (studentId: string) => {
    setFeedbackEffect({ id: studentId, type: 'negative', time: Date.now() });
    setIsGlobalRaining(true);
    new Audio('https://assets.mixkit.co/active_storage/sfx/731/731-preview.mp3').play().catch(() => { });
    setTimeout(() => { setFeedbackEffect(null); setIsGlobalRaining(false); }, 1800);
  };

  const handleEvaluationSelect = (option: EvaluationOption) => {
    const now = new Date();
    const newRecord = {
      id: Date.now().toString(),
      studentNames: isMultiSelect ? students.filter(s => selectedIds.includes(s.id)).map(s => s.name) : [evalStudent!.name],
      optionLabel: option.label,
      type: option.type,
      time: `${now.getFullYear()}年${(now.getMonth() + 1).toString().padStart(2, '0')}月${now.getDate().toString().padStart(2, '0')}日 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    };
    setEvalRecords(prev => [newRecord, ...prev].slice(0, 15));

    if (option.type === 'positive') {
      fireCelebration();
    } else {
      if (isMultiSelect && selectedIds.length > 1) {
        setIsGlobalRaining(true);
        new Audio('https://assets.mixkit.co/active_storage/sfx/731/731-preview.mp3').play().catch(() => { });
        setTimeout(() => setIsGlobalRaining(false), 1800);
      } else if (evalStudent) {
        fireRaindropHint(evalStudent.id);
      }
    }

    setTimeout(() => {
      setEvaluationModalOpen(false);
      if (isMultiSelect) {
        setIsMultiSelect(false);
        setSelectedIds([]);
      }
    }, 200);
  };

  const handleCardClick = (student: StudentData) => {
    if (isMultiSelect) setSelectedIds(p => p.includes(student.id) ? p.filter(i => i !== student.id) : [...p, student.id]);
    else { setEvalStudent(student); setEvaluationModalOpen(true); setEvalTab('positive'); setIsManagerMode(false); }
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
    resetFilters();
  };

  const handleRandomCall = (count = 1) => {
    setRandomModalOpen(true);
    setIsRolling(true);
    setRandomStudents([]);
    setIsRandomFanOpen(false);

    let step = 0;
    const totalSteps = 25;

    const roll = () => {
      const shuffled = [...students].sort(() => 0.5 - Math.random());
      setRandomStudents(shuffled.slice(0, count));
      step++;

      if (step < totalSteps) {
        const delay = step < 15 ? 70 : 70 + (step - 15) * 40;
        setTimeout(roll, delay);
      } else {
        setIsRolling(false);
        new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3').play().catch(() => { });
      }
    };
    roll();
  };

  return (
    <div className="fixed inset-0 bg-[#f0f3f6] font-sans text-slate-800 overflow-hidden flex flex-col">
      {isGlobalRaining && (
        <div className="fixed inset-0 z-[110] pointer-events-none overflow-hidden animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-blue-600/5 backdrop-blur-[0.3px]" />
          {[...Array(15)].map((_, i) => (<div key={`b-${i}`} className="absolute w-[1px] bg-blue-300/20 rounded-full animate-raindrop-layered" style={{ left: `${Math.random() * 100}%`, top: '-100px', height: '100px', animationDuration: '0.9s', animationDelay: `${Math.random()}s` }} />))}
          {[...Array(12)].map((_, i) => (<div key={`m-${i}`} className="absolute w-[2px] bg-gradient-to-b from-blue-400/10 via-blue-400/50 to-blue-500/60 rounded-full animate-raindrop-layered shadow-[0_0_6px_rgba(59,130,246,0.2)]" style={{ left: `${Math.random() * 100}%`, top: '-100px', height: '60px', animationDuration: '0.6s', animationDelay: `${Math.random()}s` }} />))}
          {[...Array(8)].map((_, i) => (<div key={`f-${i}`} className="absolute w-[3px] bg-gradient-to-b from-blue-300/40 via-blue-500 to-blue-600 rounded-full animate-raindrop-layered shadow-[0_0_10px_rgba(59,130,246,0.3)]" style={{ left: `${Math.random() * 100}%`, top: '-100px', height: '50px', animationDuration: '0.4s', animationDelay: `${Math.random()}s` }} />))}
        </div>
      )}

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
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-md bg-gradient-to-br shrink-0 ${getNameGradient(student.name)}`}>{student.name.slice(0, 1) || '?'}</div>
                    <div className="text-center w-full flex flex-col items-center gap-2"><h3 className="text-[17px] font-bold text-slate-800 tracking-tight leading-none truncate w-full">{student.name}</h3><div className="flex items-center justify-center gap-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100/50 w-full hover:bg-blue-50 transition-colors"><span className="text-[11px] font-bold text-slate-400 font-mono tracking-tighter">{student.studentNo}</span>{student.gender === 'male' ? <Mars size={12} className="text-[#4c8bf5]" strokeWidth={3} /> : <Venus size={12} className="text-[#f54c9b]" strokeWidth={3} />}</div></div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {isSidebarOpen && (
          <button onClick={handleSidebarClose} className="absolute right-[320px] top-1/2 -translate-y-1/2 h-24 w-8 bg-white rounded-l-2xl shadow-[-10px_0_30px_rgba(0,0,0,0.05)] border border-r-0 border-slate-100 flex items-center justify-center text-slate-200 hover:text-blue-500 transition-all z-[90] animate-in fade-in slide-in-from-right-2 duration-300"><ChevronRight size={20} /></button>
        )}

        <aside className={`bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.01)] relative transition-all duration-300 ease-in-out flex flex-col overflow-hidden ${isSidebarOpen ? 'w-[320px] opacity-100 border-l border-slate-100' : 'w-0 opacity-0 border-l-0'}`}>
          <div className="w-[320px] flex-1 overflow-y-auto px-6 pt-10 pb-10 custom-scrollbar shrink-0">
            <div className="flex flex-col items-center gap-8">
              <div className="flex gap-4">
                <button onClick={() => setFilterGender('all')} className={`w-24 h-14 rounded-full flex items-center justify-center text-[17px] font-bold transition-all ${filterGender === 'all' ? 'bg-[#4c8bf5] text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:border-blue-400'}`}>全部</button>
                <button onClick={() => setFilterGender(filterGender === 'male' ? 'all' : 'male')} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${filterGender === 'male' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-blue-500 border border-blue-50 hover:border-blue-200'}`}><Mars size={24} strokeWidth={3} /></button>
                <button onClick={() => setFilterGender(filterGender === 'female' ? 'all' : 'female')} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${filterGender === 'female' ? 'bg-pink-600 text-white shadow-lg' : 'bg-white text-pink-500 border border-pink-50 hover:border-pink-200'}`}><Venus size={24} strokeWidth={3} /></button>
              </div>
              <div className="w-full h-px bg-slate-100" />
              <div className="flex flex-col gap-6 w-full px-2">
                {groupedSurnameIndexes.map(item => (
                  <div key={item.initial} className="flex items-start gap-4">
                    <button onClick={() => { if (filterType === 'initial' && filterValue === item.initial) { setFilterType('none'); setFilterValue(null); } else { setFilterType('initial'); setFilterValue(item.initial); } }} className={`w-14 h-14 rounded-full flex items-center justify-center text-[17px] font-bold border transition-all shrink-0 ${filterType === 'initial' && filterValue === item.initial ? 'bg-[#4c8bf5] border-blue-500 text-white' : 'bg-[#eef8ff] text-blue-600 border-transparent hover:border-blue-500'}`}>{item.initial}</button>
                    <div className="flex flex-wrap gap-3">{item.surnames.map(sur => (
                      <button key={sur} onClick={() => { if (filterType === 'surname' && filterValue === sur) { setFilterType('none'); setFilterValue(null); } else { setFilterType('surname'); setFilterValue(sur); } }} className={`w-14 h-14 rounded-full flex items-center justify-center text-[17px] font-bold border transition-all ${filterType === 'surname' && filterValue === sur ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-500'}`}>{sur}</button>
                    ))}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className={`fixed inset-0 z-[100] bg-slate-900/10 backdrop-blur-sm transition-opacity duration-300 ${historyOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setHistoryOpen(false)} />
        <aside className={`fixed right-0 top-0 bottom-0 w-[360px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-[101] flex flex-col border-l border-slate-100 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${historyOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="px-6 py-8 flex flex-col gap-1 border-b border-slate-50 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-blue-600/5 rounded-xl flex items-center justify-center text-blue-600"><History size={18} strokeWidth={2.5} /></div>
                <h3 className="text-lg font-black text-slate-700 tracking-tight">近期点评记录</h3>
              </div>
              <button onClick={() => setHistoryOpen(false)} className="w-9 h-9 flex items-center justify-center hover:bg-slate-50 rounded-xl text-slate-400 transition-all"><X size={20} /></button>
            </div>
            <p className="text-[11px] font-bold text-slate-400 mt-2 px-0.5 leading-relaxed">仅显示您在此班级 ({currentClass}) 的最近 15 条点评记录。误评后可点击“撤回”删除。</p>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-3 bg-slate-50/30">
            {evalRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-4">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center"><History size={32} strokeWidth={1.5} /></div>
                <span className="text-sm font-bold">暂无点评记录</span>
              </div>
            ) : (
              evalRecords.map((record, idx) => (
                <div key={record.id} className="group p-4 rounded-2xl border border-slate-100 bg-white hover:border-blue-500 hover:shadow-xl hover:scale-[1.02] transition-all relative animate-in fade-in slide-in-from-bottom-1 duration-300" style={{ animationDelay: `${idx * 40}ms` }}>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-bold text-slate-300 font-mono tracking-tight">{record.time}</span>
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ${record.type === 'positive' ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>{record.type === 'positive' ? '表扬' : '待改进'}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">{record.studentNames.map(name => (<span key={name} className="text-xs font-bold text-slate-500">@{name}</span>))}</div>
                    <p className="text-[15px] font-black text-slate-800 leading-tight pr-10">{record.optionLabel}</p>
                  </div>
                  <button onClick={() => { setEvalRecords(prev => prev.filter(r => r.id !== record.id)); setToastMsg(`已撤回点评「${record.optionLabel}」`); setTimeout(() => setToastMsg(null), 3000); }} className="absolute bottom-4 right-3.5 flex items-center gap-1 text-[11px] font-bold text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"><RotateCcw size={12} strokeWidth={3} />撤回</button>
                </div>
              ))
            )}
          </div>
          {evalRecords.length > 0 && (
            <div className="p-5 border-t border-slate-50 bg-white">
              <button onClick={() => { setEvalRecords(prev => prev.slice(1)); setToastMsg(`已撤回最近一次点评`); setTimeout(() => setToastMsg(null), 3000); }} className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-50 text-slate-500 rounded-xl font-bold text-sm hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-[0.98]"><RotateCcw size={14} strokeWidth={3} />撤回最近一次点评</button>
            </div>
          )}
        </aside>
      </div>

      <div className={`fixed inset-0 z-[120] flex items-center justify-center transition-all duration-300 ${evaluationModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => { setEvaluationModalOpen(false); setIsManagerMode(false); }} />
        <div className={`w-[840px] bg-white rounded-[2.5rem] shadow-[0_60px_120px_-20px_rgba(0,0,0,0.25)] overflow-hidden border border-white relative transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${evaluationModalOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} onClick={e => e.stopPropagation()}>
          <div className="px-10 py-[24px] flex items-center justify-between border-b border-slate-100 bg-white min-h-[72px]">
            <div className="flex items-center gap-3 flex-1">
              {isManagerMode ? (<div className="bg-slate-50 p-2 rounded-xl text-slate-400 border border-slate-100 flex items-center justify-center w-11 h-11"><Settings size={20} strokeWidth={1.5} /></div>) : (isMultiSelect && selectedIds.length > 1) ? (<div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg font-black shadow-sm bg-gradient-to-br from-blue-500 to-blue-700"><Users size={20} strokeWidth={2.5} /></div>) : (<div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg font-black shadow-sm bg-gradient-to-br from-green-400 to-green-600`}>{evalStudent?.name.slice(0, 1) || '?'}</div>)}
              <div className="flex flex-col justify-center"><div className="flex items-center gap-1.5 translate-y-0.5"><h2 className="text-lg font-black text-slate-700 tracking-tight leading-none">{isManagerMode ? '管理选项' : (isMultiSelect && selectedIds.length > 1 ? '批量点评' : evalStudent?.name)}</h2>{!isManagerMode && (!isMultiSelect || selectedIds.length <= 1) && (evalStudent?.gender === 'male' ? <Mars size={14} className="text-blue-500" strokeWidth={3} /> : <Venus size={14} className="text-pink-500" strokeWidth={3} />)}</div>{!isManagerMode && (!isMultiSelect || selectedIds.length <= 1) && (<span className="text-[10px] font-bold text-slate-300 font-mono tracking-tighter uppercase mt-1">{evalStudent?.studentNo}</span>)}{!isManagerMode && isMultiSelect && selectedIds.length > 1 && (<span className="text-[12px] font-bold text-blue-500 mt-1">已选择 {selectedIds.length} 位学生</span>)}</div>
            </div>
            <div className="flex-1 flex justify-center"><div className="flex bg-slate-100 p-1 rounded-xl gap-0.5 w-[220px]"><button onClick={() => setEvalTab('positive')} className={`flex-1 py-2 rounded-lg font-black text-sm transition-all ${evalTab === 'positive' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-500'}`}>表扬</button><button onClick={() => setEvalTab('negative')} className={`flex-1 py-2 rounded-lg font-black text-sm transition-all ${evalTab === 'negative' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-500'}`}>待改进</button></div></div>
            <div className="flex-1 flex items-center justify-end gap-2 text-slate-400">{isManagerMode ? (<button onClick={() => { setIsManagerMode(false); setNewCategoryName(null); setEditingCategoryName(null); }} className="w-9 h-9 flex items-center justify-center hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all active:scale-90"><ArrowLeft size={20} strokeWidth={2} /></button>) : (<button onClick={() => { setIsManagerMode(true); setManagerSelectedCategory(categories[0]); }} className="w-9 h-9 flex items-center justify-center hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all active:scale-90"><Settings size={20} strokeWidth={2} /></button>)}<button onClick={() => { setEvaluationModalOpen(false); setIsManagerMode(false); setNewCategoryName(null); }} className="w-9 h-9 flex items-center justify-center hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all active:scale-90"><X size={22} strokeWidth={2} /></button></div>
          </div>
          <div className="overflow-hidden bg-[#f8fafc]">
            {!isManagerMode ? (
              <div className="space-y-8 px-10 py-8">
                {categories.map((cat, idx) => {
                  const catOptions = options.filter(o => o.type === evalTab && o.category === cat);
                  if (catOptions.length === 0) return null;
                  const indicatorColors = ['bg-blue-500', 'bg-violet-500', 'bg-orange-500', 'bg-pink-500', 'bg-emerald-500'];
                  return (
                    <div key={cat} className="space-y-4">
                      <div className="flex items-center gap-2.5 ml-1"><div className={`w-1.5 h-4 ${indicatorColors[idx % indicatorColors.length]} rounded-full`} /><span className="text-[13px] font-black text-slate-400 uppercase tracking-widest">{cat}</span></div>
                      <div className="grid grid-cols-5 gap-4 w-full">{catOptions.map(option => (<button key={option.id} onClick={() => handleEvaluationSelect(option)} className={`group h-14 bg-white border-2 border-white rounded-2xl flex items-center justify-center px-3 text-center shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all active:scale-95 hover:border-blue-500 hover:shadow-lg hover:scale-[1.03]`}><span className="text-[15px] font-bold text-slate-700 group-hover:text-blue-600 transition-colors leading-tight">{option.label}</span></button>))}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-[480px]">
                <div className="w-[200px] border-r border-slate-100 bg-white flex flex-col shrink-0 overflow-x-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50"><span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">评价维度</span><button onClick={() => { if (newCategoryName === null) setNewCategoryName(''); }} className="w-6 h-6 flex items-center justify-center text-blue-500 hover:bg-blue-50 rounded-lg transition-all active:scale-90"><Plus size={14} strokeWidth={3} /></button></div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
                    {categories.map((cat, idx) => {
                      const isActive = managerSelectedCategory === cat;
                      const tabCount = options.filter(o => o.type === evalTab && o.category === cat).length;
                      const indicatorColors = ['bg-blue-500', 'bg-violet-500', 'bg-orange-500', 'bg-pink-500', 'bg-emerald-500'];
                      return (
                        <div key={cat} onClick={() => setManagerSelectedCategory(cat)} className={`group flex items-center gap-3 px-5 py-3.5 cursor-pointer transition-all relative ${isActive ? 'bg-blue-50/80' : 'hover:bg-slate-50'}`}>{isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-500 rounded-r-full" />}<div className={`w-1.5 h-1.5 rounded-full shrink-0 ${indicatorColors[idx % indicatorColors.length]}`} /><span className={`text-sm font-bold flex-1 truncate transition-colors ${isActive ? 'text-blue-600' : 'text-slate-600'}`}>{cat}</span><span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${isActive ? 'text-blue-500 bg-blue-100' : 'text-slate-300 bg-slate-100'}`}>{tabCount}</span><button onClick={(e) => { e.stopPropagation(); if (categories.length <= 1) return; const catCount = options.filter(o => o.type === evalTab && o.category === cat).length; const tabLabel = evalTab === 'positive' ? '表扬' : '待改进'; if (catCount > 0) { setToastMsg(`「${cat}」的${tabLabel}下还有 ${catCount} 个评价项，请先清空后再删除。`); setTimeout(() => setToastMsg(null), 3000); return; } const otherTab = evalTab === 'positive' ? 'negative' : 'positive'; const otherCount = options.filter(o => o.type === otherTab && o.category === cat).length; const otherLabel = otherTab === 'positive' ? '表扬' : '待改进'; if (otherCount > 0) { setToastMsg(`「${cat}」的${otherLabel}下还有 ${otherCount} 个评价项，请先清空后再删除。`); setTimeout(() => setToastMsg(null), 3000); return; } const newCats = categories.filter(c => c !== cat); setCategories(newCats); if (isActive) setManagerSelectedCategory(newCats[0]); }} className="w-5 h-5 flex items-center justify-center text-slate-200 hover:text-rose-500 rounded transition-all opacity-0 group-hover:opacity-100 shrink-0"><X size={12} strokeWidth={2} /></button></div>
                      );
                    })}
                    {newCategoryName !== null && (<div className="flex items-center gap-3 px-5 py-3.5 bg-blue-50/50 overflow-hidden"><div className="w-1.5 h-1.5 rounded-full shrink-0 bg-blue-400" /><input autoFocus value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} onBlur={() => { const name = newCategoryName.trim(); if (name && !categories.includes(name)) { setCategories([...categories, name]); setManagerSelectedCategory(name); } setNewCategoryName(null); }} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') setNewCategoryName(null); }} placeholder="输入维度名称" className="min-w-0 w-full text-sm font-bold text-blue-600 bg-transparent border-b border-blue-400 outline-none py-0.5 placeholder:text-blue-300" /></div>)}
                  </div>
                </div>
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between px-8 py-4 border-b border-slate-50 bg-white"><div className="flex items-center gap-2">{editingCategoryName === managerSelectedCategory ? (<input autoFocus value={tempCategoryName} onChange={(e) => setTempCategoryName(e.target.value)} onBlur={() => { if (tempCategoryName.trim() && tempCategoryName !== managerSelectedCategory) { const newName = tempCategoryName.trim(); setCategories(categories.map(c => c === managerSelectedCategory ? newName : c)); setOptions(options.map(o => o.category === managerSelectedCategory ? { ...o, category: newName } : o)); setManagerSelectedCategory(newName); } setEditingCategoryName(null); }} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} className="text-sm font-black text-slate-700 bg-transparent border-b-2 border-blue-500 outline-none py-0.5 w-[120px]" />) : (<><span className="text-sm font-black text-slate-700">{managerSelectedCategory}</span><button onClick={() => { setEditingCategoryName(managerSelectedCategory); setTempCategoryName(managerSelectedCategory); }} className="w-5 h-5 flex items-center justify-center text-slate-300 hover:text-blue-500 transition-all"><Pencil size={11} /></button></>)}</div><button onClick={() => { setIsAddingOption(true); setNewOptionLabel(''); }} className="text-xs font-black text-blue-600 hover:scale-105 transition-transform flex items-center gap-1 active:scale-95"><Plus size={14} strokeWidth={3} />新增</button></div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {(options.filter(o => o.type === evalTab && o.category === managerSelectedCategory).length > 0 || isAddingOption) ? (
                      <div className="grid grid-cols-3 gap-4">
                        {options.filter(o => o.type === evalTab && o.category === managerSelectedCategory).map(opt => (
                          <div key={opt.id} className="group relative">
                            <div className={`h-14 bg-white border-2 ${editingId === opt.id ? 'border-blue-500 shadow-sm' : 'border-white hover:border-slate-200'} rounded-2xl flex items-center justify-center px-4 text-center shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all relative`}>{editingId === opt.id ? (<input autoFocus value={tempLabel} onChange={(e) => setTempLabel(e.target.value)} onBlur={() => { if (tempLabel.trim()) setOptions(options.map(o => o.id === editingId ? { ...o, label: tempLabel } : o)); setEditingId(null); }} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} className="w-full h-full text-center text-[15px] font-bold text-blue-600 bg-transparent outline-none" />) : (<span className="text-[15px] font-bold text-slate-700">{opt.label}</span>)}{editingId !== opt.id && (<div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all"><button onClick={() => { setEditingId(opt.id); setTempLabel(opt.label); }} className="w-6 h-6 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm"><Pencil size={11} /></button><button onClick={() => setOptions(options.filter(o => o.id !== opt.id))} className="w-6 h-6 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-300 transition-all shadow-sm"><Trash2 size={11} /></button></div>)}</div>
                          </div>
                        ))}
                        {isAddingOption && (<div className="group relative"><div className="h-14 bg-white border-2 border-blue-500 shadow-sm rounded-2xl flex items-center justify-center px-4 text-center"><input autoFocus value={newOptionLabel} onChange={(e) => setNewOptionLabel(e.target.value)} onBlur={() => { const label = newOptionLabel.trim(); if (label) { setOptions([...options, { id: Date.now().toString(), label, category: managerSelectedCategory, type: evalTab }]); } setIsAddingOption(false); setNewOptionLabel(''); }} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') { setIsAddingOption(false); setNewOptionLabel(''); } }} placeholder="输入评价名称" className="w-full h-full text-center text-[15px] font-bold text-blue-600 bg-transparent outline-none placeholder:text-blue-300" /></div></div>)}
                      </div>
                    ) : (<div className="flex flex-col items-center justify-center h-full text-slate-300 gap-3 py-20"><div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center"><Plus size={20} strokeWidth={1.5} /></div><span className="text-xs font-bold">暂无评价项，点击上方新增</span></div>)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`fixed inset-0 z-[150] flex items-center justify-center transition-all duration-500 ${randomModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" onClick={() => { if (!isRolling) setRandomModalOpen(false); }} />
        <div className={`w-[580px] h-[640px] bg-[#f8faff] rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col items-center relative overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${randomModalOpen ? 'scale-100 translate-y-0' : 'scale-90 translate-y-12'}`}>
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
          <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
          <button onClick={() => setRandomModalOpen(false)} className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center bg-white/50 backdrop-blur-md rounded-full text-slate-400 hover:text-blue-600 hover:scale-110 active:scale-95 transition-all z-20 border border-white"><X size={20} strokeWidth={3} /></button>
          <div className="flex-1 flex flex-col items-center justify-center pt-8 gap-8 w-full relative">
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full transition-all duration-1000 ${isRolling ? 'bg-blue-500/20 scale-110 blur-3xl opacity-100' : 'bg-amber-400/10 scale-100 blur-2xl opacity-60'}`} />
            <div className={`w-full px-12 z-10 grid gap-6 transition-all duration-500 ${randomStudents.length === 1 ? 'grid-cols-1 justify-items-center' : randomStudents.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {randomStudents.map((student, idx) => (
                <div key={student.id} className="flex flex-col items-center gap-3 animate-in zoom-in-50 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className={`rounded-full flex items-center justify-center text-white font-black relative transition-all duration-300 ${isRolling ? 'scale-95 blur-[0.5px]' : 'scale-100 shadow-xl'} ${getNameGradient(student.name)} ${randomStudents.length === 1 ? 'w-44 h-44 text-7xl' : randomStudents.length <= 4 ? 'w-32 h-32 text-5xl' : 'w-24 h-24 text-3xl'}`}>
                    {student.name.slice(0, 1)}
                    {isRolling && idx === 0 && (<div className="absolute inset-[-8px] rounded-full border-[4px] border-blue-400/30 border-t-blue-500 animate-spin" style={{ animationDuration: '0.6s' }} />)}
                  </div>
                  <div className="text-center">
                    <h3 className={`font-black text-slate-800 tracking-tight transition-all ${randomStudents.length === 1 ? 'text-[64px] leading-tight' : randomStudents.length <= 4 ? 'text-3xl' : 'text-xl'} ${isRolling ? 'blur-sm opacity-30' : 'blur-0 opacity-100'}`}>{student.name}</h3>
                    {!isRolling && randomStudents.length > 1 && <span className="text-[10px] font-bold text-slate-400 font-mono tracking-widest">{student.studentNo}</span>}
                  </div>
                </div>
              ))}
              {randomStudents.length === 0 && isRolling && (<div className="col-span-full flex flex-col items-center gap-4"><div className="w-32 h-32 rounded-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-300"><Dices size={48} /></div><span className="text-slate-400 font-black tracking-widest animate-pulse">正在筛选...</span></div>)}
            </div>
            {!isRolling && randomStudents.length === 1 && (<div className="z-10 animate-in fade-in slide-in-from-top-4 duration-700"><div className="flex items-center justify-center gap-3 py-2.5 px-6 bg-slate-100/50 rounded-2xl border border-white/50"><span className="text-slate-400 font-mono text-sm tracking-[0.2em] font-bold">{randomStudents[0].studentNo}</span><div className="w-1 h-1 rounded-full bg-slate-300" /><span className="text-slate-500 font-black text-sm">{currentClass}</span></div></div>)}
          </div>
          <div className="h-44 w-full px-12 pb-12 flex flex-col gap-4 relative z-10">
            {!isRolling && randomStudents.length > 0 ? (
              <div className="flex flex-col gap-5 animate-in slide-in-from-bottom-6 duration-700">
                <button
                  onClick={() => {
                    const count = randomStudents.length;
                    setRandomModalOpen(false);
                    setTimeout(() => {
                      if (count === 1) { setEvalStudent(randomStudents[0]); setEvaluationModalOpen(true); setEvalTab('positive'); setIsManagerMode(false); }
                      else { setIsMultiSelect(true); setSelectedIds(randomStudents.map(s => s.id)); setEvalStudent(randomStudents[0]); setEvaluationModalOpen(true); setEvalTab('positive'); setIsManagerMode(false); }
                    }, 400);
                  }}
                  className="w-full h-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-[0_20px_40px_rgba(37,99,235,0.4)] hover:shadow-[0_25px_50px_rgba(37,99,235,0.5)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
                >
                  <div className="bg-white/20 p-2 rounded-xl group-hover:rotate-12 transition-transform"><Plus size={24} strokeWidth={3} /></div>
                  立刻为{randomStudents.length > 1 ? `这 ${randomStudents.length} 位同学` : '他/她'}评价
                </button>
                <div className="text-center">
                  <button onClick={() => handleRandomCall(randomStudents.length)} className="text-xs font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-[0.2em] border-b-2 border-transparent hover:border-blue-200 pb-0.5">不满意？重来一次</button>
                </div>
              </div>
            ) : (<div className="h-full flex items-center justify-center"><div className="flex gap-2 text-blue-300 animate-pulse font-black text-sm tracking-widest">正在挑选...</div></div>)}
          </div>
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]"><div className="absolute top-1/4 left-10 w-20 h-20 border-4 border-blue-500 rounded-full rotate-45" /><div className="absolute bottom-1/3 right-10 w-16 h-16 border-4 border-blue-500 rounded-lg -rotate-12" /></div>
        </div>
      </div>

      {toastMsg && (
        <div className="fixed top-8 left-1/2 z-[200] toast-slide-down" style={{ transform: 'translateX(-50%)' }}>
          <div className="px-5 py-3 bg-white rounded-xl shadow-[0_6px_24px_rgba(0,0,0,0.12)] border border-slate-100 flex items-center gap-3"><div className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center shrink-0"><span className="text-[11px] font-black text-white">!</span></div><span className="text-sm font-medium text-slate-700 whitespace-nowrap">{toastMsg}</span></div>
        </div>
      )}

      <footer className="px-10 py-6 shrink-0 flex items-center justify-between bg-white border-t border-slate-100 z-50">
        <div className="w-[120px]" />
        {isMultiSelect ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl gap-2 shadow-inner">
              <button onClick={() => { if (selectedIds.length === filteredStudents.length) setSelectedIds([]); else setSelectedIds(filteredStudents.map(s => s.id)); }} className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-sm transition-all focus:outline-none ${selectedIds.length === filteredStudents.length && filteredStudents.length > 0 ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-100 shadow-sm hover:text-blue-600'}`}><Check size={16} strokeWidth={3} />全选</button>
              <div className="w-px h-6 bg-slate-200" />
              <button onClick={() => { if (selectedIds.length > 0) { const firstStudent = students.find(s => s.id === selectedIds[0]); if (firstStudent) { setEvalStudent(firstStudent); setEvaluationModalOpen(true); setEvalTab('positive'); setIsManagerMode(false); } } }} disabled={selectedIds.length === 0} className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-black text-sm transition-all focus:outline-none ${selectedIds.length > 0 ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-95' : 'bg-slate-50 text-slate-300 cursor-not-allowed'}`}>点评{selectedIds.length > 0 && <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs ml-1">{selectedIds.length}人</span>}</button>
              <div className="w-px h-6 bg-slate-200" />
              <button onClick={() => { setIsMultiSelect(false); setSelectedIds([]); }} className="flex items-center gap-2 px-6 py-3.5 bg-white text-slate-500 rounded-xl font-black text-sm border border-slate-100 shadow-sm hover:text-rose-500 active:scale-95 transition-all focus:outline-none"><X size={16} strokeWidth={2.5} />取消</button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { setIsMultiSelect(true); setSelectedIds([]); }}
              className="flex items-center gap-2.5 px-8 py-3.5 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-black text-[15px] hover:text-blue-600 hover:border-blue-300 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
            >
              <CheckSquare size={18} />
              批量评价
            </button>

            <div
              className="relative"
              onMouseEnter={() => setIsRandomFanOpen(true)}
              onMouseLeave={() => setIsRandomFanOpen(false)}
            >
              <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-6 w-64 h-64 pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isRandomFanOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-50'}`}>
                {[1, 2, 3, 4, 5, 6, 7].map((num, i) => {
                  const angle = -70 + (i * 23.3);
                  const dist = 95;
                  const x = Math.sin(angle * Math.PI / 180) * dist;
                  const y = -Math.cos(angle * Math.PI / 180) * dist;
                  return (
                    <button
                      key={num}
                      onClick={() => handleRandomCall(num)}
                      className="absolute left-1/2 top-1/2 w-12 h-12 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.1)] hover:border-amber-400 hover:text-amber-500 hover:scale-110 active:scale-90 transition-all pointer-events-auto group z-20"
                      style={{
                        transform: isRandomFanOpen ? `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` : 'translate(-50%, -50%)',
                        transitionDelay: `${i * 30}ms`
                      }}
                    >
                      <span className="text-sm font-black">{num}<span className="text-[10px] ml-0.5">人</span></span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => handleRandomCall(1)}
                className={`flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-black text-[15px] border-2 transition-all focus:outline-none ${isRandomFanOpen ? 'bg-amber-50 border-amber-300 text-amber-500 shadow-xl -translate-y-0.5' : 'bg-white border-slate-100 text-slate-600 hover:text-amber-500 hover:border-amber-200 hover:shadow-lg hover:-translate-y-0.5'}`}
              >
                <Dices size={18} />随机点名
              </button>
            </div>
          </div>
        )}

        <div className="w-[120px] flex justify-end">
          {!isMultiSelect && (
            <button
              onClick={() => setHistoryOpen(true)}
              className="flex flex-col items-center justify-center gap-1 text-slate-300 hover:text-slate-500 transition-all active:scale-95 group"
            >
              <div className="w-10 h-10 bg-slate-50 group-hover:bg-slate-100 rounded-full flex items-center justify-center transition-colors">
                <RotateCcw size={16} strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-bold">撤销点评</span>
            </button>
          )}
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; }
        .scroll-stable { scrollbar-gutter: stable; }
        @keyframes raindrop-layered { 0% { transform: translateY(0); opacity: 0; } 15% { opacity: 1; } 85% { opacity: 0.8; } 100% { transform: translateY(120vh); opacity: 0; } }
        .animate-raindrop-layered { animation: raindrop-layered linear infinite; }
        @keyframes toast-slide-down { 0% { opacity: 0; margin-top: -16px; } 100% { opacity: 1; margin-top: 0; } }
        .toast-slide-down { animation: toast-slide-down 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default SmartBigScreen;
