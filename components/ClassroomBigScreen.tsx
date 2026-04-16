import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Dice5,
  HeartHandshake,
  Lightbulb,
  LogOut,
  MessageSquareWarning,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  WandSparkles,
  X,
  Trophy,
  Zap,
} from 'lucide-react';

type EvaluationTone = 'positive' | 'negative';

interface EvaluationOption {
  id: string;
  label: string;
  score: number;
  tone: EvaluationTone;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  surface: string;
}

interface StudentCardData {
  id: string;
  name: string;
  studentNo: string;
  score: number;
  lastRecord?: {
    label: string;
    score: number;
    tone: EvaluationTone;
    time: string;
  };
}

interface ClassroomData {
  id: string;
  name: string;
  students: StudentCardData[];
}

interface ClassroomBigScreenProps {
  onBackToAdmin: () => void;
  onExit: () => void;
}

const POSITIVE_OPTIONS: EvaluationOption[] = [
  { id: 'insight', label: '一点就通', score: 1, tone: 'positive', icon: Lightbulb, accent: 'text-amber-300', surface: 'bg-amber-500/20' },
  { id: 'answer', label: '举手答问', score: 1, tone: 'positive', icon: WandSparkles, accent: 'text-sky-300', surface: 'bg-sky-500/20' },
  { id: 'cooperation', label: '团队合作', score: 1, tone: 'positive', icon: Users, accent: 'text-emerald-300', surface: 'bg-emerald-500/20' },
  { id: 'help', label: '帮助他人', score: 1, tone: 'positive', icon: HeartHandshake, accent: 'text-rose-300', surface: 'bg-rose-500/20' },
  { id: 'focus', label: '注意力集中', score: 1, tone: 'positive', icon: Target, accent: 'text-indigo-300', surface: 'bg-indigo-500/20' },
  { id: 'thinking', label: '积极思考', score: 1, tone: 'positive', icon: Sparkles, accent: 'text-violet-300', surface: 'bg-violet-500/20' },
  { id: 'reading', label: '认真读书', score: 1, tone: 'positive', icon: ScanSearch, accent: 'text-teal-300', surface: 'bg-teal-500/20' },
  { id: 'discipline', label: '遵守纪律', score: 1, tone: 'positive', icon: ShieldCheck, accent: 'text-blue-300', surface: 'bg-blue-500/20' },
  { id: 'respect', label: '尊师孝亲', score: 2, tone: 'positive', icon: HeartHandshake, accent: 'text-pink-300', surface: 'bg-pink-500/20' },
];

const NEGATIVE_OPTIONS: EvaluationOption[] = [
  { id: 'distracted', label: '注意力分散', score: -1, tone: 'negative', icon: MessageSquareWarning, accent: 'text-slate-400', surface: 'bg-slate-700/50' },
  { id: 'talking', label: '课堂说话', score: -1, tone: 'negative', icon: MessageSquareWarning, accent: 'text-slate-400', surface: 'bg-slate-700/50' },
  { id: 'delay', label: '拖拉走神', score: -1, tone: 'negative', icon: ScanSearch, accent: 'text-slate-400', surface: 'bg-slate-700/50' },
  { id: 'discipline', label: '纪律待改进', score: -1, tone: 'negative', icon: ShieldCheck, accent: 'text-slate-400', surface: 'bg-slate-700/50' },
  { id: 'homework', label: '作业未准备', score: -2, tone: 'negative', icon: X, accent: 'text-slate-400', surface: 'bg-slate-700/50' },
  { id: 'inactive', label: '参与度不足', score: -1, tone: 'negative', icon: Users, accent: 'text-slate-400', surface: 'bg-slate-700/50' },
];

const INITIAL_CLASSROOMS: ClassroomData[] = [
  {
    id: 'class-1',
    name: '一年级（1）班',
    students: [
      ['林俊杰', '20260101'], ['王可欣', '20260102'], ['陈子墨', '20260103'], ['周雨桐', '20260104'],
      ['赵一凡', '20260105'], ['孙语晨', '20260106'], ['李沐阳', '20260107'], ['吴思齐', '20260108'],
      ['郑书瑶', '20260109'], ['何皓宇', '20260110'], ['谢安然', '20260111'], ['唐梓萱', '20260112'],
      ['彭乐言', '20260113'], ['邓景行', '20260114'], ['许星禾', '20260115'], ['高若汐', '20260116'],
      ['马嘉诚', '20260117'], ['叶子豪', '20260118'], ['苏美琪', '20260119'], ['韩冬冬', '20260120'],
      ['梁静茹', '20260121'], ['郭德纲', '20260122'], ['周杰伦', '20260123'], ['陈奕迅', '20260124'],
    ].map(([name, studentNo], index) => ({
      id: `class-1-${index + 1}`,
      name,
      studentNo,
      score: 10 + (index % 5),
    })),
  },
  {
    id: 'class-2',
    name: '一年级（2）班',
    students: [
      ['江芷晴', '20260201'], ['罗俊希', '20260202'], ['蒋文哲', '20260203'], ['龚语彤', '20260204'],
      ['曹书宸', '20260205'], ['冯嘉禾', '20260206'], ['程以宁', '20260207'], ['韩星野', '20260208'],
      ['吕知夏', '20260209'], ['郭逸凡', '20260210'], ['马思源', '20260211'], ['袁欣悦', '20260212'],
      ['朱奕航', '20260213'], ['郝可可', '20260214'], ['梁慕言', '20260215'], ['董心妍', '20260216'],
    ].map(([name, studentNo], index) => ({
      id: `class-2-${index + 1}`,
      name,
      studentNo,
      score: 8 + (index % 6),
    })),
  },
];

const STUDENT_COLORS = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-sky-500 to-blue-600',
];

const getStudentGradient = (name: string) => {
  const total = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return STUDENT_COLORS[total % STUDENT_COLORS.length];
};

const getInitial = (name: string) => Array.from(name)[0] ?? '?';

const getCurrentTimeLabel = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

const ClassroomBigScreen: React.FC<ClassroomBigScreenProps> = ({ onBackToAdmin, onExit }) => {
  const [classrooms, setClassrooms] = useState(INITIAL_CLASSROOMS);
  const [activeClassId, setActiveClassId] = useState(INITIAL_CLASSROOMS[0].id);
  const [isClassMenuOpen, setIsClassMenuOpen] = useState(false);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [evaluationTone, setEvaluationTone] = useState<EvaluationTone>('positive');
  const [modalStudentIds, setModalStudentIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState('');
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeClassroom = classrooms.find((item) => item.id === activeClassId) ?? classrooms[0];
  const selectedStudents = activeClassroom.students.filter((student) => selectedStudentIds.includes(student.id));
  const modalStudents = activeClassroom.students.filter((student) => modalStudentIds.includes(student.id));

  const evaluationOptions = useMemo(
    () => (evaluationTone === 'positive' ? POSITIVE_OPTIONS : NEGATIVE_OPTIONS),
    [evaluationTone]
  );

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = (message: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  const resetSelection = () => {
    setSelectedStudentIds([]);
    setMultiSelectMode(false);
  };

  const handleSwitchClass = (classId: string) => {
    setActiveClassId(classId);
    setIsClassMenuOpen(false);
    setModalStudentIds([]);
    resetSelection();
  };

  const handleStudentClick = (studentId: string) => {
    if (multiSelectMode) {
      setSelectedStudentIds((prev) =>
        prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
      );
      return;
    }

    setEvaluationTone('positive');
    setModalStudentIds([studentId]);
  };

  const handleRandomSelect = () => {
    if (activeClassroom.students.length === 0) {
      return;
    }

    const randomStudent = activeClassroom.students[Math.floor(Math.random() * activeClassroom.students.length)];
    setEvaluationTone('positive');
    setModalStudentIds([randomStudent.id]);
    setSelectedStudentIds([]);
    setMultiSelectMode(false);
  };

  const handleApplyEvaluation = (option: EvaluationOption) => {
    if (modalStudentIds.length === 0) {
      return;
    }

    const actionTime = getCurrentTimeLabel();

    setClassrooms((prev) =>
      prev.map((classroom) => {
        if (classroom.id !== activeClassId) {
          return classroom;
        }

        return {
          ...classroom,
          students: classroom.students.map((student) => {
            if (!modalStudentIds.includes(student.id)) {
              return student;
            }

            return {
              ...student,
              score: Math.max(0, student.score + option.score),
              lastRecord: {
                label: option.label,
                score: option.score,
                tone: option.tone,
                time: actionTime,
              },
            };
          }),
        };
      })
    );

    const targetLabel = modalStudentIds.length === 1 ? modalStudents[0]?.name ?? '该学生' : `${modalStudentIds.length}名学生`;
    showToast(`已记录 ${targetLabel}：${option.label} ${option.score > 0 ? `+${option.score}` : option.score}`);
    setModalStudentIds([]);
    resetSelection();
  };

  const openBatchEvaluation = () => {
    if (selectedStudentIds.length === 0) {
      return;
    }

    setEvaluationTone('positive');
    setModalStudentIds(selectedStudentIds);
  };

  return (
    <div className="min-h-screen bg-[#070912] text-white selection:bg-indigo-500/30 overflow-hidden flex flex-col font-sans">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Header Bar */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/60">
                {activeClassroom.name}
              </h1>
              <div className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                Live Terminal
              </div>
            </div>
            <p className="text-sm font-medium text-white/40 mt-1">智慧校校园即时评价系统 · 课堂大屏模式</p>
          </div>
          
          <div className="h-10 w-px bg-white/10 mx-2" />
          
          <div className="flex items-center gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 flex flex-col">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">学生人数</span>
              <span className="text-lg font-black text-white/90 leading-tight">{activeClassroom.students.length} <small className="text-xs font-medium opacity-50">人</small></span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 flex flex-col">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">当前教师</span>
              <span className="text-lg font-black text-white/90 leading-tight">林俊杰老师</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsClassMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-white/80 active:scale-95 transition-all active:bg-white/10"
          >
            <Users className="h-4 w-4" />
            切换班级
          </button>
          <button
            type="button"
            onClick={onBackToAdmin}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-white/80 active:scale-95 transition-all active:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            后台管理
          </button>
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-500 text-white text-sm font-black active:scale-95 transition-all"
          >
            <LogOut className="h-4 w-4" />
            退出
          </button>
        </div>

        {isClassMenuOpen && (
          <div className="absolute right-8 top-[calc(100%+12px)] z-50 w-72 rounded-3xl border border-white/10 bg-[#161b22]/95 backdrop-blur-xl p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {classrooms.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSwitchClass(item.id)}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left transition-all active:scale-[0.98] ${
                  item.id === activeClassId 
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div>
                  <div className="font-bold text-lg leading-tight">{item.name}</div>
                  <div className="text-xs font-medium opacity-50 mt-1">{item.students.length} 名学生在线</div>
                </div>
                {item.id === activeClassId && <CheckCircle2 className="h-5 w-5" />}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto mt-2 px-8 pb-32 custom-scrollbar">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 py-6">
          {activeClassroom.students.map((student) => {
            const isSelected = selectedStudentIds.includes(student.id);
            const isPositive = student.lastRecord?.tone === 'positive';
            const gradient = getStudentGradient(student.name);

            return (
              <button
                key={student.id}
                type="button"
                onClick={() => handleStudentClick(student.id)}
                className={`group relative flex flex-col p-4 rounded-[2rem] border transition-all duration-300 active:scale-95 ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                    : 'bg-white/5 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xl font-black text-white shadow-lg`}>
                    {getInitial(student.name)}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-white/30 tracking-tighter uppercase">Score</span>
                    <span className="text-2xl font-black text-white leading-none mt-1">{student.score}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-xl font-black tracking-tight text-white/90 truncate">{student.name}</div>
                  <div className="text-[10px] font-bold text-white/30 mt-1 uppercase tracking-widest">#{student.studentNo.slice(-4)}</div>
                </div>

                {student.lastRecord ? (
                  <div className={`mt-3 py-2 px-3 rounded-2xl border flex flex-col gap-1 transition-all ${
                    isPositive 
                      ? 'bg-emerald-500/10 border-emerald-500/30' 
                      : 'bg-rose-500/10 border-rose-500/30'
                  }`}>
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <span className={`text-[11px] font-black truncate max-w-[70%] ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {student.lastRecord.label}
                      </span>
                      <span className={`text-xs font-black ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {student.lastRecord.score > 0 ? `+${student.lastRecord.score}` : student.lastRecord.score}
                      </span>
                    </div>
                    <span className="text-[9px] font-medium text-white/30">{student.lastRecord.time} 发表</span>
                  </div>
                ) : (
                  <div className="mt-3 py-2 px-3 rounded-2xl border border-dashed border-white/10 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white/20 italic">暂无记录</span>
                  </div>
                )}

                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center border-2 border-[#070912] shadow-lg animate-in zoom-in duration-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </main>

      {/* Floating Control Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-4xl px-4">
        <div className="bg-[#1a1f2e]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 pl-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${multiSelectMode ? 'bg-indigo-500 text-white' : 'bg-white/5 text-white/40'}`}>
              {multiSelectMode ? <CheckCircle2 className="h-6 w-6" /> : <Users className="h-6 w-6" />}
            </div>
            <div>
              <div className="text-sm font-black text-white/90">{multiSelectMode ? `已选中 ${selectedStudentIds.length} 位学生` : '单人快速评价'}</div>
              <div className="text-[11px] font-medium text-white/40">{multiSelectMode ? '点击上方卡片增减，然后点击右侧评分' : '点击学生卡片即可打开评价弹窗'}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 pr-1">
            <button
              type="button"
              onClick={() => {
                setMultiSelectMode((prev) => {
                  const nextValue = !prev;
                  if (!nextValue) setSelectedStudentIds([]);
                  return nextValue;
                });
              }}
              className={`px-6 py-4 rounded-3xl font-black text-sm transition-all active:scale-95 ${
                multiSelectMode 
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                  : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
              }`}
            >
              {multiSelectMode ? '退出多选' : '批量评价'}
            </button>
            
            <button
              type="button"
              onClick={handleRandomSelect}
              className="w-14 h-14 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 active:scale-95 active:bg-white/10 transition-all"
              title="随机点名"
            >
              <Dice5 className="h-6 w-6" />
            </button>

            {multiSelectMode && (
              <button
                type="button"
                onClick={openBatchEvaluation}
                disabled={selectedStudentIds.length === 0}
                className={`px-8 py-4 rounded-3xl flex items-center gap-2 font-black text-sm transition-all active:scale-95 ${
                  selectedStudentIds.length > 0
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'bg-white/5 text-white/20 cursor-not-allowed opacity-50'
                }`}
              >
                <Zap className="h-4 w-4" />
                立即点评 ({selectedStudentIds.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Evaluation Modal */}
      {modalStudentIds.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-6xl bg-[#161b22] border border-white/10 rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-10 py-8 border-b border-white/5 bg-white/2">
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center ${evaluationTone === 'positive' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {evaluationTone === 'positive' ? <Trophy className="h-8 w-8" /> : <MessageSquareWarning className="h-8 w-8" />}
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tight">
                    {modalStudentIds.length === 1 ? `点评 ${modalStudents[0]?.name}` : `批量点评 ${modalStudentIds.length} 人`}
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <button 
                      onClick={() => setEvaluationTone('positive')}
                      className={`px-5 py-2 rounded-full text-xs font-black transition-all ${evaluationTone === 'positive' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-white/40'}`}
                    >
                      表扬表彰
                    </button>
                    <button 
                      onClick={() => setEvaluationTone('negative')}
                      className={`px-5 py-2 rounded-full text-xs font-black transition-all ${evaluationTone === 'negative' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-white/5 text-white/40'}`}
                    >
                      待改进项
                    </button>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setModalStudentIds([])}
                className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all active:scale-90"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-10">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {evaluationOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleApplyEvaluation(option)}
                      className="group relative flex flex-col items-center justify-center p-6 rounded-[2.5rem] bg-white/3 border border-white/5 hover:border-white/20 transition-all active:scale-95 text-center overflow-hidden"
                    >
                      <div className={`mb-4 w-20 h-20 rounded-full flex items-center justify-center ${option.surface} transition-transform group-hover:scale-110`}>
                        <Icon className={`h-10 w-10 ${option.accent}`} />
                      </div>
                      <div className="text-lg font-black text-white/90 tracking-tight">{option.label}</div>
                      <div className={`mt-2 px-3 py-1 rounded-full text-xs font-black ${option.tone === 'positive' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                        {option.score > 0 ? `+${option.score}` : option.score}
                      </div>
                      
                      {/* Hover decoration */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })}
              </div>

              {/* Selected List Tags */}
              <div className="mt-10 flex flex-wrap gap-2 items-center bg-black/20 p-4 rounded-3xl border border-white/5">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mr-2">涉及名单:</span>
                {modalStudents.map(s => (
                  <span key={s.id} className="px-3 py-1.5 rounded-xl bg-white/5 text-xs font-bold text-white/60 border border-white/5">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[60] px-8 py-4 bg-emerald-500 rounded-3xl shadow-[0_20px_50px_rgba(16,185,129,0.3)] flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="h-5 w-5 text-white" />
          <span className="text-white font-black text-sm tracking-tight">{toastMessage}</span>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
};

export default ClassroomBigScreen;
