
import React, { useState, useEffect, useMemo, useRef } from 'react';
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

interface EvalRecord {
  id: string;
  studentNames: string[];
  optionLabel: string;
  type: 'positive' | 'negative';
  time: string;
  source: 'manual' | 'voice';
  originalInput: string;
  aiScorePath: string;
  aiScoreValue: string;
}

interface GroupData {
  id: string;
  name: string;
  memberCount: number;
  memberIds: string[];
  planId: string;
  planName: string;
  subject: string;
  teacherName: string;
}

interface GroupPlan {
  id: string;
  className: string;
  subject: string;
  teacherName: string;
  planName: string;
  groupPrefix: string;
  groups: GroupData[];
}

interface SmartBigScreenProps {
  onBack: () => void;
  embedded?: boolean;
}

const VoiceMicGlyph: React.FC<{ muted?: boolean; className?: string }> = ({ muted = false, className = '' }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z" />
    <path d="M5 11a7 7 0 0 0 14 0" />
    <path d="M12 18v3" />
    <path d="M8 21h8" />
    {muted && <path d="M4 4l16 16" />}
  </svg>
);

const VoiceWaveGlyph: React.FC<{ level: number }> = ({ level }) => {
  const bars = [0.35, 0.65, 1, 0.78, 0.48];
  return (
    <div className="relative z-10 flex h-8 w-9 items-center justify-center gap-1">
      {bars.map((weight, index) => {
        const height = 8 + Math.round(level * weight * 22);
        return (
          <span
            key={index}
            className="w-1.5 rounded-full bg-white transition-[height] duration-75 ease-out"
            style={{ height: `${height}px` }}
          />
        );
      })}
    </div>
  );
};

const CLASSES = ['2025级1班', '2025级2班', '2025级3班'];
const CARD_WIDTH = 160;
const CARD_GAP = 24;
const FILTER_SIDEBAR_WIDTH = 320;

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

const shuffleItems = <T,>(items: T[]): T[] => {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

const pickRandomUniqueItems = <T extends { id: string }>(
  items: T[],
  count: number,
  excludeIds: string[] = []
): T[] => {
  const excludeSet = new Set(excludeIds);
  return shuffleItems(items.filter(item => !excludeSet.has(item.id))).slice(0, count);
};

const buildRollingResults = <T extends { id: string }>(
  prev: T[],
  pool: T[],
  safeCount: number,
  step: number,
  baseSteps: number,
  stagger: number
) => {
  const next = [...prev];
  const currentRollingIndices: number[] = [];
  const lockedIds: string[] = [];

  for (let i = 0; i < safeCount; i++) {
    const stopAt = baseSteps + i * stagger;
    if (step < stopAt) {
      currentRollingIndices.push(i);
    } else if (next[i]) {
      lockedIds.push(next[i].id);
    }
  }

  const replacements = pickRandomUniqueItems(pool, currentRollingIndices.length, lockedIds);
  currentRollingIndices.forEach((slotIndex, replacementIndex) => {
    if (replacements[replacementIndex]) {
      next[slotIndex] = replacements[replacementIndex];
    }
  });

  return { next, currentRollingIndices };
};

const getDeckWidth = (containerWidth: number, cardWidth: number, gap: number) => {
  if (containerWidth <= 0) return 0;
  const columns = Math.max(1, Math.floor((containerWidth + gap) / (cardWidth + gap)));
  return columns * cardWidth + Math.max(0, columns - 1) * gap;
};

const GENERATE_MOCK_GROUP_PLANS = (className: string, students: StudentData[]): GroupPlan[] => {
  const templates = [
    { subject: '语文', teacherName: '王老师', planName: '朗读方案', groupPrefix: '朗读', groupCount: 20, membersPerGroup: 2, rotateOffset: 0 },
    { subject: '语文', teacherName: '王老师', planName: '背诵方案', groupPrefix: '背诵', groupCount: 3, membersPerGroup: 4, rotateOffset: 7 },
    { subject: '数学', teacherName: '周老师', planName: '口算方案', groupPrefix: '口算', groupCount: 4, membersPerGroup: 4, rotateOffset: 11 },
    { subject: '英语', teacherName: '陈老师', planName: '对话方案', groupPrefix: '对话', groupCount: 4, membersPerGroup: 4, rotateOffset: 17 }
  ];

  if (students.length === 0) return [];

  return templates.map((template, templateIndex) => {
    const planId = `${className}-plan-${templateIndex + 1}`;
    const groups: GroupData[] = Array.from({ length: template.groupCount }, (_, groupIndex) => {
      const memberIds = Array.from({ length: template.membersPerGroup }, (_, memberIndex) => {
        const studentIndex = (template.rotateOffset + groupIndex * template.membersPerGroup + memberIndex) % students.length;
        return students[studentIndex].id;
      });

      return {
        id: `${planId}-group-${groupIndex + 1}`,
        name: `${template.groupPrefix} ${groupIndex + 1} 组`,
        memberCount: memberIds.length,
        memberIds,
        planId,
        planName: template.planName,
        subject: template.subject,
        teacherName: template.teacherName
      };
    });

    return {
      id: planId,
      className,
      subject: template.subject,
      teacherName: template.teacherName,
      planName: template.planName,
      groupPrefix: template.groupPrefix,
      groups
    };
  });
};

const GroupCard: React.FC<{
  group: GroupData;
  memberNames?: string[];
  selected?: boolean;
  isSelectable?: boolean;
  isRolling?: boolean;
  onClick?: () => void;
  className?: string;
  compact?: boolean;
}> = ({
  group,
  memberNames = [],
  selected = false,
  isSelectable = false,
  isRolling = false,
  onClick,
  className = '',
  compact = false
}) => {
  const visibleNameCount = compact ? 2 : 3;
  const visibleNames = memberNames.slice(0, visibleNameCount);
  const memberSummary = visibleNames.length > 0
    ? `${visibleNames.join('、')}${memberNames.length > visibleNames.length ? `等${group.memberCount}人` : ` 共${group.memberCount}人`}`
    : `共${group.memberCount}人`;

  const baseClassName = compact
    ? 'w-[260px] h-[112px] rounded-[1.25rem] px-5 gap-4'
    : 'w-full h-[120px] rounded-[1.5rem] px-6 gap-5';

  const checkClassName = compact
    ? 'top-3 right-3 w-5 h-5 rounded-md'
    : 'top-4 right-4 w-5 h-5 rounded-md';

  return (
    <div
      onClick={onClick}
      className={`relative bg-white flex items-center border-2 shadow-[0_8px_20px_rgba(0,0,0,0.03)] transition-all ${baseClassName} ${selected ? 'border-blue-500 shadow-lg z-10' : 'border-white hover:border-blue-500 hover:shadow-xl'} ${isRolling ? 'animate-random-card-shuffle' : ''} ${onClick ? 'cursor-pointer active:scale-95' : ''} ${className}`}
    >
      {isSelectable && (
        <div className={`absolute border flex items-center justify-center transition-all ${checkClassName} ${selected ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-200 bg-white/80 text-slate-300'}`}>
          <Check size={12} strokeWidth={4} />
        </div>
      )}
      <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-black shadow-md bg-gradient-to-br from-indigo-500 to-purple-600 shrink-0">
        {group.name.slice(0, 1)}
      </div>
      <div className="flex flex-col gap-2 overflow-hidden min-w-0 flex-1">
        <div className="flex items-center gap-2 min-w-0 pr-5">
          <h3 className="text-[17px] font-bold text-slate-800 tracking-tight leading-none truncate">
            {group.name}
          </h3>
          <span className="shrink-0 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-black text-blue-600 border border-blue-100">
            {group.memberCount}人
          </span>
        </div>
        <div className="flex items-center gap-1.5 min-w-0 rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-1.5">
          <Users size={12} className="shrink-0 text-slate-400" strokeWidth={2.6} />
          <span className="truncate text-[12px] font-bold leading-none text-slate-600" title={memberNames.join('、')}>
            {memberSummary}
          </span>
        </div>
      </div>
    </div>
  );
};

const StudentCard: React.FC<{
  student: StudentData;
  selected?: boolean;
  isSelectable?: boolean;
  isFocused?: boolean;
  isRolling?: boolean;
  onClick?: () => void;
}> = ({
  student,
  selected = false,
  isSelectable = false,
  isFocused = false,
  isRolling = false,
  onClick
}) => {
  const genderIcon = student.gender === 'male'
    ? <Mars size={12} className="text-[#4c8bf5]" strokeWidth={3} />
    : <Venus size={12} className="text-[#f54c9b]" strokeWidth={3} />;

  return (
    <div
      onClick={onClick}
      className={`w-[160px] h-[180px] relative bg-white rounded-[2rem] p-5 pt-6 flex flex-col items-center gap-3.5 border-2 shadow-[0_8px_20px_rgba(0,0,0,0.03)] ${isFocused ? 'border-blue-400 bg-blue-50/30' : 'border-white hover:border-blue-500 hover:shadow-xl'} ${selected ? 'border-blue-500 shadow-lg z-10' : ''} ${isRolling ? 'animate-random-card-shuffle' : ''} ${onClick ? 'cursor-pointer active:scale-95 transition-all' : ''}`}
    >
      {isSelectable && (
        <div className={`absolute top-3 right-3 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${selected ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-200 bg-white/80 text-slate-300'}`}>
          <Check size={14} strokeWidth={3} />
        </div>
      )}
      <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center text-white text-2xl font-black shadow-lg bg-gradient-to-br shrink-0 ${getNameGradient(student.name)}`}>
        {student.name.slice(0, 1) || '?'}
      </div>
      <div className="text-center w-full flex flex-col items-center gap-2">
        <h3 className={`text-[17px] font-bold text-slate-800 tracking-tight leading-none truncate w-full ${isRolling ? 'opacity-80' : ''}`}>{student.name}</h3>
        <div className="flex items-center justify-center gap-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100/50 w-full max-w-[120px]">
          <span className="text-[11px] font-bold text-slate-400 font-mono tracking-tighter">{student.studentNo}</span>
          {genderIcon}
        </div>
      </div>
    </div>
  );
};

const SmartBigScreen: React.FC<SmartBigScreenProps> = ({ onBack, embedded = false }) => {
  const [currentClass, setCurrentClass] = useState(CLASSES[0]);
  const [viewMode, setViewMode] = useState<'student' | 'group'>('student');
  const [isClassMenuOpen, setIsClassMenuOpen] = useState(false);
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filterType, setFilterType] = useState<'none' | 'initial' | 'surname'>('none');
  const [filterValue, setFilterValue] = useState<string | null>(null);
  const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female'>('all');
  const [selectedGroupPlanId, setSelectedGroupPlanId] = useState<string | null>(null);
  const [isGroupPlanMenuOpen, setIsGroupPlanMenuOpen] = useState(false);

  const [evaluationModalOpen, setEvaluationModalOpen] = useState(false);
  const [evalStudent, setEvalStudent] = useState<StudentData | null>(null);
  const [evalGroup, setEvalGroup] = useState<GroupData | null>(null);
  const [groupDetailsModalOpen, setGroupDetailsModalOpen] = useState(false);
  const [selectedGroupMemberIds, setSelectedGroupMemberIds] = useState<string[]>([]);
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
  const [randomGroups, setRandomGroups] = useState<GroupData[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [randomCount, setRandomCount] = useState(1);
  const [isRandomPickerOpen, setIsRandomPickerOpen] = useState(false);
  const [randomTick, setRandomTick] = useState(0);
  const [rollingIndices, setRollingIndices] = useState<number[]>([]);
  const [evalRecords, setEvalRecords] = useState<EvalRecord[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [voiceDockPosition, setVoiceDockPosition] = useState<{ x: number; y: number } | null>(null);
  const randomRollTimerRef = useRef<number | null>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const speechRecognitionRef = useRef<any | null>(null);
  const voiceFinalizedRef = useRef(false);
  const voiceTranscriptRef = useRef('');
  const voiceListeningRef = useRef(false);
  const voiceStreamRef = useRef<MediaStream | null>(null);
  const voiceAudioContextRef = useRef<AudioContext | null>(null);
  const voiceLevelFrameRef = useRef<number | null>(null);
  const demoRecordClassRef = useRef<string | null>(null);
  const voiceDockRef = useRef<HTMLDivElement | null>(null);
  const voiceDragRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    width: 64,
    height: 64,
    moved: false
  });
  const deckContainerRef = useRef<HTMLDivElement | null>(null);
  const [deckContainerWidth, setDeckContainerWidth] = useState(0);

  const students = useMemo(() => GENERATE_MOCK_DATA(currentClass), [currentClass]);
  const studentNameById = useMemo(() => new Map(students.map(student => [student.id, student.name])), [students]);
  const groupPlans = useMemo(() => GENERATE_MOCK_GROUP_PLANS(currentClass, students), [currentClass, students]);
  const activeGroupPlan = useMemo(
    () => groupPlans.find(plan => plan.id === selectedGroupPlanId) || groupPlans[0] || null,
    [groupPlans, selectedGroupPlanId]
  );
  const groups = useMemo(() => activeGroupPlan?.groups || [], [activeGroupPlan]);
  const getGroupMemberNames = (group: GroupData) => group.memberIds
    .map(id => studentNameById.get(id))
    .filter((name): name is string => Boolean(name));

  useEffect(() => {
    if (demoRecordClassRef.current === currentClass || students.length < 3) return;
    demoRecordClassRef.current = currentClass;
    const now = new Date();
    const formatDemoTime = (offsetMinutes: number) => {
      const time = new Date(now.getTime() - offsetMinutes * 60 * 1000);
      return `${time.getFullYear()}年${(time.getMonth() + 1).toString().padStart(2, '0')}月${time.getDate().toString().padStart(2, '0')}日 ${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
    };
    const [firstStudent, secondStudent, thirdStudent] = students;
    setEvalRecords([
      {
        id: `demo-voice-${currentClass}`,
        studentNames: [firstStudent.name, secondStudent.name],
        optionLabel: '积极举手',
        type: 'positive',
        time: formatDemoTime(2),
        source: 'voice',
        originalInput: `${firstStudent.name}和${secondStudent.name}这节课主动举手发言，表达也很清楚`,
        aiScorePath: '智育-课堂表现-积极参与',
        aiScoreValue: '+1'
      },
      {
        id: `demo-manual-${currentClass}`,
        studentNames: [thirdStudent.name],
        optionLabel: '专注听讲',
        type: 'positive',
        time: formatDemoTime(6),
        source: 'manual',
        originalInput: `${thirdStudent.name}｜专注听讲`,
        aiScorePath: '智育-课堂表现-积极参与',
        aiScoreValue: '+1'
      }
    ]);
  }, [currentClass, students]);

  useEffect(() => {
    if (!window.confetti) {
      const script = document.createElement('script');
      script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js";
      script.async = true;
      document.body.appendChild(script);
    }
    
    // Preload audio and set initial volumes
    const sounds = {
      praise: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
      rain: 'https://assets.mixkit.co/active_storage/sfx/731/731-preview.mp3',
      finish: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
      click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'
    };
    
    Object.entries(sounds).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.load();
      if (key === 'finish') audio.volume = 0.25; 
      else if (key === 'praise') audio.volume = 0.4;
      else if (key === 'rain') audio.volume = 0.3;
      else if (key === 'click') audio.volume = 0.2;
      audioRefs.current[key] = audio;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (randomRollTimerRef.current !== null) {
        window.clearTimeout(randomRollTimerRef.current);
      }
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      if (voiceLevelFrameRef.current !== null) {
        window.cancelAnimationFrame(voiceLevelFrameRef.current);
      }
      voiceStreamRef.current?.getTracks().forEach(track => track.stop());
      voiceAudioContextRef.current?.close().catch(() => { });
    };
  }, []);

  useEffect(() => {
    const node = deckContainerRef.current;
    if (!node) return;
    let frameId: number | null = null;

    const updateWidth = () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      frameId = window.requestAnimationFrame(() => {
        const nextWidth = getDeckWidth(node.clientWidth, CARD_WIDTH, CARD_GAP);
        setDeckContainerWidth(prev => (prev === nextWidth ? prev : nextWidth));
        frameId = null;
      });
    };

    updateWidth();

    const observer = new ResizeObserver(() => {
      updateWidth();
    });

    observer.observe(node);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (groupPlans.length === 0) {
      setSelectedGroupPlanId(null);
      return;
    }
    if (!selectedGroupPlanId || !groupPlans.some(plan => plan.id === selectedGroupPlanId)) {
      setSelectedGroupPlanId(groupPlans[0].id);
    }
  }, [groupPlans, selectedGroupPlanId]);

  useEffect(() => {
    setSelectedIds([]);
    setIsMultiSelect(false);
    setEvalGroup(null);
    setSelectedGroupMemberIds([]);
    setIsGroupPlanMenuOpen(false);
  }, [selectedGroupPlanId]);

  const filteredStudents = useMemo(() => {
    let result = students;
    if (filterType === 'initial') result = result.filter(s => s.initial === filterValue);
    if (filterType === 'surname') result = result.filter(s => s.surname === filterValue);
    if (filterGender !== 'all') result = result.filter(s => s.gender === filterGender);
    return result;
  }, [students, filterType, filterValue, filterGender]);

  const randomPool = useMemo(
    () => viewMode === 'student' ? (filteredStudents.length > 0 ? filteredStudents : students) : groups,
    [viewMode, filteredStudents, students, groups]
  );

  const sharedDeckWidth = deckContainerWidth;

  const groupCardSpan = sharedDeckWidth >= 344 ? 2 : 1;

  const maxRandomSelectableCount = useMemo(() => {
    if (randomPool.length === 0) return 0;
    if (randomPool.length === 1) return 1;
    return Math.min(7, randomPool.length - 1);
  }, [randomPool.length]);

  const randomQuickCounts = useMemo(
    () => Array.from({ length: maxRandomSelectableCount }, (_, index) => index + 1),
    [maxRandomSelectableCount]
  );

  useEffect(() => {
    if (maxRandomSelectableCount === 0) {
      setRandomCount(1);
      return;
    }
    setRandomCount(prev => Math.min(prev, maxRandomSelectableCount));
  }, [maxRandomSelectableCount]);

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
      const audio = audioRefs.current['praise'];
      if (audio) { audio.currentTime = 0; audio.play().catch(() => { }); }
    }
  };

  const fireRaindropHint = (studentId: string) => {
    setFeedbackEffect({ id: studentId, type: 'negative', time: Date.now() });
    setIsGlobalRaining(true);
    const audio = audioRefs.current['rain'];
    if (audio) { audio.currentTime = 0; audio.play().catch(() => { }); }
    setTimeout(() => { setFeedbackEffect(null); setIsGlobalRaining(false); }, 1800);
  };

  const handleEvaluationSelect = (option: EvaluationOption) => {
    const now = new Date();
    const studentNames = viewMode === 'student' 
      ? (isMultiSelect ? students.filter(s => selectedIds.includes(s.id)).map(s => s.name) : [evalStudent!.name])
      : (isMultiSelect ? groups.filter(g => selectedIds.includes(g.id)).map(g => g.name) : [evalGroup!.name]);

    const newRecord = {
      id: Date.now().toString(),
      studentNames,
      optionLabel: option.label,
      type: option.type,
      time: `${now.getFullYear()}年${(now.getMonth() + 1).toString().padStart(2, '0')}月${now.getDate().toString().padStart(2, '0')}日 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
      source: 'manual' as const,
      originalInput: `${studentNames.join('、')}｜${option.label}`,
      aiScorePath: '智育-课堂表现-积极参与',
      aiScoreValue: option.type === 'positive' ? '+1' : '-1'
    };
    setEvalRecords(prev => [newRecord, ...prev].slice(0, 15));

    if (option.type === 'positive') {
      fireCelebration();
    } else {
      if (isMultiSelect && selectedIds.length > 1) {
        setIsGlobalRaining(true);
        const audio = audioRefs.current['rain'];
        if (audio) { audio.currentTime = 0; audio.play().catch(() => { }); }
        setTimeout(() => setIsGlobalRaining(false), 1800);
      } else if (viewMode === 'student' && evalStudent) {
        fireRaindropHint(evalStudent.id);
      } else if (viewMode === 'group' && evalGroup) {
        setIsGlobalRaining(true);
        const audio = audioRefs.current['rain'];
        if (audio) { audio.currentTime = 0; audio.play().catch(() => { }); }
        setTimeout(() => setIsGlobalRaining(false), 1800);
      }
    }

    setTimeout(() => {
      handleCloseEvaluation();
    }, 200);
  };

  const getSpeechRecognitionCtor = () => {
    const speechWindow = window as any;
    return speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
  };

  const getMicrophoneErrorMessage = (error: unknown) => {
    const errorName = error instanceof DOMException ? error.name : '';
    if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') return '麦克风权限被浏览器或系统拒绝';
    if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') return '未检测到可用麦克风设备';
    if (errorName === 'NotReadableError' || errorName === 'TrackStartError') return '麦克风可能被其他应用占用';
    if (errorName === 'OverconstrainedError') return '当前麦克风设备不满足采集条件';
    if (errorName === 'SecurityError') return '当前页面不允许使用麦克风';
    return '语音采集未成功，请检查浏览器和系统麦克风权限';
  };

  const formatRecordTime = () => {
    const now = new Date();
    return `${now.getFullYear()}年${(now.getMonth() + 1).toString().padStart(2, '0')}月${now.getDate().toString().padStart(2, '0')}日 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const splitSpokenNames = (value: string) => value
    .split(/[、和与及,，]/)
    .map(name => name.trim())
    .filter(Boolean);

  const inferVoiceOption = (text: string) => {
    const normalized = text.replace(/\s/g, '');
    const matchedOption = options.find(option => normalized.includes(option.label.replace(/\s/g, '')));
    if (matchedOption) return { label: matchedOption.label, type: matchedOption.type };

    const negativeRules = [
      { keywords: ['吵架', '争吵', '冲突'], label: '上课吵架', type: 'negative' as const },
      { keywords: ['说话', '讲话', '聊天', '交头接耳'], label: '交头耳语', type: 'negative' as const },
      { keywords: ['不认真', '走神', '注意力不集中'], label: '注意力涣散', type: 'negative' as const },
      { keywords: ['插话', '抢话'], label: '随意插话', type: 'negative' as const }
    ];
    const positiveRules = [
      { keywords: ['积极举手', '举手发言', '主动发言'], label: '积极举手', type: 'positive' as const },
      { keywords: ['表现优异', '表现优秀', '表现很好', '表现很棒'], label: '表现优异', type: 'positive' as const },
      { keywords: ['合作', '协作'], label: '合作积极', type: 'positive' as const },
      { keywords: ['声音响亮'], label: '声音响亮', type: 'positive' as const },
      { keywords: ['表达清楚', '表达清晰'], label: '表达清晰', type: 'positive' as const },
      { keywords: ['认真听讲', '专注'], label: '专注听讲', type: 'positive' as const }
    ];
    const rule = [...negativeRules, ...positiveRules].find(item => item.keywords.some(keyword => normalized.includes(keyword)));
    return rule ? { label: rule.label, type: rule.type } : { label: text.trim(), type: evalTab };
  };

  const inferVoiceTargets = (text: string) => {
    const normalized = text.replace(/\s/g, '');
    const matchedGroup = groups.find(group => {
      const groupName = group.name.replace(/\s/g, '');
      const compactGroupName = groupName.replace(/(\D+?)0?(\d+)组/, '$1$2组');
      return normalized.includes(groupName) || normalized.includes(compactGroupName);
    });
    if (matchedGroup) return { names: [matchedGroup.name], studentIds: matchedGroup.memberIds };

    const matchedStudents = students.filter(student => normalized.includes(student.name));
    const excludeMatch = normalized.match(/(?:除了|除)(.+?)(?:以外|外)/);
    const excludeNames = excludeMatch ? splitSpokenNames(excludeMatch[1]) : [];
    const excludedIds = students
      .filter(student => excludeNames.some(name => student.name.includes(name) || student.surname === name))
      .map(student => student.id);
    const isClassWide = normalized.includes(currentClass) || normalized.includes('全班') || normalized.includes('其余学生') || normalized.includes('其他学生') || normalized.includes('全体学生');

    if (isClassWide) {
      const targets = students.filter(student => !excludedIds.includes(student.id));
      return { names: targets.map(student => student.name), studentIds: targets.map(student => student.id) };
    }

    if (matchedStudents.length > 0) {
      return { names: matchedStudents.map(student => student.name), studentIds: matchedStudents.map(student => student.id) };
    }

    const spokenNameMatch = normalized.match(/^(.+?)(?:上课|课堂|表现|积极|都|均|一起|的时候)/);
    const spokenNames = spokenNameMatch ? splitSpokenNames(spokenNameMatch[1]) : [];
    if (spokenNames.length > 0 && spokenNames.length <= 6) return { names: spokenNames, studentIds: [] };

    return { names: [], studentIds: [] };
  };

  const handleVoiceEvaluation = (text: string) => {
    const label = text.trim().replace(/[，。,.\s]+$/g, '');
    if (!label) {
      setToastMsg('没有识别到有效点评内容，请再试一次');
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }

    const targets = inferVoiceTargets(label);
    if (targets.names.length === 0) {
      setToastMsg('AI 未识别到明确评价对象，请说出学生姓名、小组名或班级范围');
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }

    const option = inferVoiceOption(label);
    setEvalRecords(prev => [{
      id: `voice-${Date.now()}`,
      studentNames: targets.names,
      optionLabel: option.label,
      type: option.type,
      time: formatRecordTime(),
      source: 'voice',
      originalInput: label,
      aiScorePath: '智育-课堂表现-积极参与',
      aiScoreValue: option.type === 'positive' ? '+1' : '-1'
    }, ...prev].slice(0, 15));

    if (option.type === 'positive') {
      fireCelebration();
    } else if (targets.studentIds.length === 1) {
      fireRaindropHint(targets.studentIds[0]);
    } else {
      setIsGlobalRaining(true);
      const audio = audioRefs.current['rain'];
      if (audio) { audio.currentTime = 0; audio.play().catch(() => { }); }
      setTimeout(() => setIsGlobalRaining(false), 1800);
    }

    const targetText = targets.names.length > 3 ? `${targets.names.slice(0, 3).join('、')}等${targets.names.length}人` : targets.names.join('、');
    setToastMsg(`AI 已识别：${targetText}｜${option.label}`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const stopVoiceLevelMeter = () => {
    if (voiceLevelFrameRef.current !== null) {
      window.cancelAnimationFrame(voiceLevelFrameRef.current);
      voiceLevelFrameRef.current = null;
    }
    voiceStreamRef.current?.getTracks().forEach(track => track.stop());
    voiceStreamRef.current = null;
    voiceAudioContextRef.current?.close().catch(() => { });
    voiceAudioContextRef.current = null;
    setVoiceLevel(0);
  };

  const startVoiceLevelMeter = async () => {
    if (!navigator.mediaDevices?.getUserMedia) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    voiceStreamRef.current = stream;
    const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextCtor) return;

    const audioContext = new AudioContextCtor();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.72;
    const source = audioContext.createMediaStreamSource(stream);
    const data = new Uint8Array(analyser.fftSize);
    source.connect(analyser);
    voiceAudioContextRef.current = audioContext;

    const updateLevel = () => {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let index = 0; index < data.length; index += 1) {
        const normalized = (data[index] - 128) / 128;
        sum += normalized * normalized;
      }
      const rms = Math.sqrt(sum / data.length);
      setVoiceLevel(Math.min(1, rms * 5));
      voiceLevelFrameRef.current = window.requestAnimationFrame(updateLevel);
    };

    updateLevel();
  };

  const stopVoiceCapture = (submitCurrent = false) => {
    if (submitCurrent && voiceTranscriptRef.current.trim() && !voiceFinalizedRef.current) {
      voiceFinalizedRef.current = true;
      handleVoiceEvaluation(voiceTranscriptRef.current);
    }
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }
    voiceListeningRef.current = false;
    stopVoiceLevelMeter();
    setIsVoiceListening(false);
  };

  const startVoiceCapture = async () => {
    const SpeechRecognitionCtor = getSpeechRecognitionCtor();
    if (!SpeechRecognitionCtor) {
      setToastMsg('当前浏览器不支持语音识别，请使用最新版 Chrome 浏览器访问本地地址');
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }

    voiceFinalizedRef.current = false;
    voiceTranscriptRef.current = '';
    setVoiceTranscript('');

    try {
      await startVoiceLevelMeter();
    } catch (error) {
      stopVoiceLevelMeter();
      console.warn('麦克风权限获取失败', error);
      setToastMsg(getMicrophoneErrorMessage(error));
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'zh-CN';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      voiceListeningRef.current = true;
      setIsVoiceListening(true);
    };
    recognition.onresult = (event: any) => {
      let nextTranscript = '';
      for (let index = 0; index < event.results.length; index += 1) {
        nextTranscript += event.results[index][0]?.transcript || '';
      }
      voiceTranscriptRef.current = nextTranscript.trim();
      setVoiceTranscript(nextTranscript.trim());
    };
    recognition.onerror = (event: any) => {
      voiceListeningRef.current = false;
      stopVoiceLevelMeter();
      setIsVoiceListening(false);
      console.warn('语音识别失败', event);
      setToastMsg('语音识别未成功，请检查浏览器麦克风权限后重试');
      setTimeout(() => setToastMsg(null), 3000);
    };
    recognition.onend = () => {
      if (voiceListeningRef.current) {
        try {
          recognition.start();
          return;
        } catch {
          voiceListeningRef.current = false;
        }
      }
      stopVoiceLevelMeter();
      setIsVoiceListening(false);
    };

    speechRecognitionRef.current = recognition;
    recognition.start();
  };

  const toggleVoiceCapture = () => {
    if (isVoiceListening) stopVoiceCapture(true);
    else startVoiceCapture();
  };

  const clampVoiceDockPosition = (x: number, y: number, width: number, height: number) => ({
    x: Math.min(Math.max(12, x), Math.max(12, window.innerWidth - width - 12)),
    y: Math.min(Math.max(12, y), Math.max(12, window.innerHeight - height - 12))
  });

  const handleVoiceDockPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    const rect = voiceDockRef.current?.getBoundingClientRect();
    if (!rect) return;
    voiceDragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: rect.left,
      originY: rect.top,
      width: rect.width,
      height: rect.height,
      moved: false
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleVoiceDockPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = voiceDragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) drag.moved = true;
    setVoiceDockPosition(clampVoiceDockPosition(drag.originX + dx, drag.originY + dy, drag.width, drag.height));
  };

  const handleVoiceDockPointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = voiceDragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    voiceDragRef.current = { ...drag, active: false };
    event.currentTarget.releasePointerCapture(event.pointerId);
    if (!drag.moved) toggleVoiceCapture();
  };

  const handleVoiceDockPointerCancel = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = voiceDragRef.current;
    if (drag.pointerId === event.pointerId) {
      voiceDragRef.current = { ...drag, active: false };
    }
  };

  useEffect(() => {
    if ((evaluationModalOpen || groupDetailsModalOpen || randomModalOpen) && isVoiceListening) {
      stopVoiceCapture(false);
    }
  }, [evaluationModalOpen, groupDetailsModalOpen, randomModalOpen, isVoiceListening]);

  useEffect(() => {
    const handleResize = () => {
      setVoiceDockPosition(prev => {
        if (!prev) return prev;
        const rect = voiceDockRef.current?.getBoundingClientRect();
        return clampVoiceDockPosition(prev.x, prev.y, rect?.width || 64, rect?.height || 64);
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCloseEvaluation = () => {
    stopVoiceCapture(false);
    setVoiceTranscript('');
    setEvaluationModalOpen(false);
    setIsManagerMode(false);
    setEvalStudent(null);
    setEvalGroup(null);
    setNewCategoryName(null);
    setEditingId(null);
    if (isMultiSelect) {
      setIsMultiSelect(false);
      setSelectedIds([]);
    }
  };

  const handleCardClick = (student: StudentData) => {
    if (isMultiSelect) setSelectedIds(p => p.includes(student.id) ? p.filter(i => i !== student.id) : [...p, student.id]);
    else { setEvalGroup(null); setEvalStudent(student); setEvaluationModalOpen(true); setEvalTab('positive'); setIsManagerMode(false); }
  };

  const handleGroupCardClick = (group: GroupData) => {
    if (isMultiSelect) setSelectedIds(p => p.includes(group.id) ? p.filter(i => i !== group.id) : [...p, group.id]);
    else { 
      setEvalGroup(group); 
      setSelectedGroupMemberIds([...group.memberIds]); 
      setGroupDetailsModalOpen(true); 
    }
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
    resetFilters();
  };

  const clearRandomRollTimer = () => {
    if (randomRollTimerRef.current !== null) {
      window.clearTimeout(randomRollTimerRef.current);
      randomRollTimerRef.current = null;
    }
  };

  const closeRandomModal = ({ preserveSelection = false }: { preserveSelection?: boolean } = {}) => {
    clearRandomRollTimer();
    setIsRolling(false);
    setRandomModalOpen(false);
    setRandomCount(1);
    setIsRandomPickerOpen(false);
    if (!preserveSelection) {
      setIsMultiSelect(false);
      setSelectedIds([]);
    }
  };

  const handleRandomCall = (count = 1) => {
    const pool = randomPool;
    const safeCount = Math.min(count, maxRandomSelectableCount);

    if (safeCount === 0) {
      setToastMsg(`当前没有可点名的${viewMode === 'student' ? '学生' : '小组'}。`);
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }

    clearRandomRollTimer();
    setRandomModalOpen(true);
    setIsRolling(true);
    setRollingIndices([...Array(safeCount).keys()]);
    setRandomCount(safeCount);
    setIsRandomPickerOpen(false);
    
    const initialShuffled = shuffleItems(pool).slice(0, safeCount);
    if (viewMode === 'student') setRandomStudents(initialShuffled as StudentData[]);
    else setRandomGroups(initialShuffled as GroupData[]);
    
    setRandomTick(0);

    let step = 0;
    const baseSteps = 12; 
    const stagger = 6;    
    const totalSteps = baseSteps + (safeCount - 1) * stagger;

    const roll = () => {
      step++;
      setRandomTick(prev => prev + 1);

      if (viewMode === 'student') {
        setRandomStudents(prev => {
          const { next, currentRollingIndices } = buildRollingResults(
            prev,
            pool as StudentData[],
            safeCount,
            step,
            baseSteps,
            stagger
          );
          setRollingIndices(currentRollingIndices);
          return next;
        });
      } else {
        setRandomGroups(prev => {
          const { next, currentRollingIndices } = buildRollingResults(
            prev,
            pool as GroupData[],
            safeCount,
            step,
            baseSteps,
            stagger
          );
          setRollingIndices(currentRollingIndices);
          return next;
        });
      }

      if (step >= totalSteps) {
        clearRandomRollTimer();
        setIsRolling(false);
        setRollingIndices([]);
        const audio = audioRefs.current['finish'];
        if (audio) { audio.currentTime = 0; audio.play().catch(() => { }); }
        
        // 确保使用最新的随机结果进行多选
        setIsMultiSelect(true);
        if (viewMode === 'student') {
          setRandomStudents(final => {
            setSelectedIds(final.map(s => s.id));
            return final;
          });
        } else {
          setRandomGroups(final => {
            setSelectedIds(final.map(g => g.id));
            return final;
          });
        }
        return;
      }

      const delay = 60 + Math.min(step * 4, 150);
      randomRollTimerRef.current = window.setTimeout(roll, delay);
    };
    
    randomRollTimerRef.current = window.setTimeout(roll, 100);
  };

  const currentRandomIds = viewMode === 'student' ? randomStudents.map(student => student.id) : randomGroups.map(group => group.id);
  const hasRandomResults = currentRandomIds.length > 0;
  const allRandomSelected = hasRandomResults && currentRandomIds.every(id => selectedIds.includes(id));
  const selectedRandomCount = currentRandomIds.filter(id => selectedIds.includes(id)).length;
  const embeddedToolbarMinWidth = viewMode === 'group' ? 'min-w-[240px]' : 'min-w-[220px]';
  const deckShellStyle = sharedDeckWidth > 0 ? { width: `${sharedDeckWidth}px`, maxWidth: '100%' } : { width: '100%', maxWidth: '100%' };
  const sidebarTiming = { transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' } as const;

  const classSwitcher = (
    <div className="relative">
      <button
        onClick={() => setIsClassMenuOpen(!isClassMenuOpen)}
        className={`h-11 min-w-[220px] max-w-[260px] flex items-center justify-between gap-3 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-all active:scale-95 ${
          isClassMenuOpen ? 'border-blue-300 bg-blue-50 text-blue-700' : 'hover:border-blue-300 hover:text-blue-600'
        }`}
      >
        <span className="truncate text-sm font-black tracking-tight">{currentClass}</span>
        <ChevronDown className={`w-4 h-4 shrink-0 text-slate-300 transition-transform ${isClassMenuOpen ? 'rotate-180' : ''}`} />
      </button>
      {isClassMenuOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setIsClassMenuOpen(false)} />
          <div className="absolute top-14 left-0 w-56 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-100 p-1.5 z-[70] animate-in slide-in-from-top-2 duration-200">
            {CLASSES.map(cls => (
              <button
                key={cls}
                onClick={() => {
                  setCurrentClass(cls);
                  setIsClassMenuOpen(false);
                  setSelectedIds([]);
                  setIsGroupPlanMenuOpen(false);
                  resetFilters();
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all active:scale-95 ${
                  currentClass === cls ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50 font-bold'
                }`}
              >
                <span className="text-sm">{cls}</span>
                {currentClass === cls && <Check size={16} strokeWidth={3} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );

  const viewModeSwitcher = (
    <div className="inline-flex bg-white/85 backdrop-blur-md p-1 rounded-2xl border border-slate-200 shadow-sm">
      <button
        onClick={() => { setViewMode('student'); setSelectedIds([]); setIsMultiSelect(false); setIsGroupPlanMenuOpen(false); }}
        className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-black text-sm transition-all ${viewMode === 'student' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <User size={18} strokeWidth={2.5} />学生
      </button>
      <button
        onClick={() => { setViewMode('group'); setSelectedIds([]); setIsMultiSelect(false); setIsSidebarOpen(false); resetFilters(); }}
        className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-black text-sm transition-all ${viewMode === 'group' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <Users size={18} strokeWidth={2.5} />小组
      </button>
    </div>
  );

  const modeUtilityControl = (
    <>
      {!isSidebarOpen && viewMode === 'student' && (
        <button onClick={() => setIsSidebarOpen(true)} className="h-10 min-w-[220px] flex items-center justify-center gap-2 px-6 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-500 hover:text-blue-600 hover:border-blue-400 transition-all active:scale-95">
          <Search size={16} /><span className="text-sm font-black tracking-tight">快速定位学生</span>
        </button>
      )}
      {viewMode === 'group' && (
        <div className="relative">
          {isGroupPlanMenuOpen && <div className="fixed inset-0 z-[60]" onClick={() => setIsGroupPlanMenuOpen(false)} />}
          <button
            onClick={() => setIsGroupPlanMenuOpen(open => !open)}
            className="h-10 min-w-[240px] max-w-[320px] px-4 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-all active:scale-95 flex items-center justify-between gap-3 relative z-[70]"
          >
            <span className="truncate text-sm font-black">{activeGroupPlan?.planName || '选择方案'}</span>
            <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform ${isGroupPlanMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          <div className={`absolute top-12 right-0 w-[320px] bg-white rounded-[1.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-slate-100 p-1.5 z-[70] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${isGroupPlanMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
            {groupPlans.map(plan => (
              <button
                key={plan.id}
                onClick={() => {
                  setSelectedGroupPlanId(plan.id);
                  setIsGroupPlanMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all active:scale-95 ${plan.id === activeGroupPlan?.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span className="text-sm font-black truncate">{plan.planName}</span>
                {plan.id === activeGroupPlan?.id ? <Check size={16} strokeWidth={3} /> : <span className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
      {((isSidebarOpen && viewMode === 'student') || (!isSidebarOpen && viewMode !== 'student' && viewMode !== 'group')) && (
        <div className={`h-10 ${embeddedToolbarMinWidth}`} />
      )}
    </>
  );

  const showPageVoiceButton = !evaluationModalOpen && !groupDetailsModalOpen && !randomModalOpen && !historyOpen;
  return (
    <div className={`${embedded ? 'w-full h-full' : 'fixed inset-0'} bg-[#f0f3f6] font-sans text-slate-800 overflow-hidden flex flex-col`}>
      {isGlobalRaining && (
        <div className="fixed inset-0 z-[110] pointer-events-none overflow-hidden animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-blue-600/5 backdrop-blur-[0.2px]" />
          {[...Array(6)].map((_, i) => (<div key={`b-${i}`} className="absolute w-[1px] bg-blue-300/20 rounded-full animate-raindrop-layered will-change-transform" style={{ left: `${Math.random() * 100}%`, top: '-100px', height: '100px', animationDuration: '0.9s', animationDelay: `${Math.random()}s` }} />))}
          {[...Array(5)].map((_, i) => (<div key={`m-${i}`} className="absolute w-[2px] bg-gradient-to-b from-blue-400/10 via-blue-400/50 to-blue-500/60 rounded-full animate-raindrop-layered shadow-[0_0_6px_rgba(59,130,246,0.2)] will-change-transform" style={{ left: `${Math.random() * 100}%`, top: '-100px', height: '60px', animationDuration: '0.6s', animationDelay: `${Math.random()}s` }} />))}
          {[...Array(4)].map((_, i) => (<div key={`f-${i}`} className="absolute w-[3px] bg-gradient-to-b from-blue-300/40 via-blue-500 to-blue-600 rounded-full animate-raindrop-layered shadow-[0_0_10px_rgba(59,130,246,0.3)] will-change-transform" style={{ left: `${Math.random() * 100}%`, top: '-100px', height: '50px', animationDuration: '0.4s', animationDelay: `${Math.random()}s` }} />))}
        </div>
      )}

      {!embedded && (
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-50">
          <div className="flex items-center gap-4 relative">
            <div className="bg-blue-600/5 p-1.5 rounded-lg text-blue-600"><Monitor size={18} /></div>
            {classSwitcher}
          </div>
          <div className="flex items-center gap-4 text-[13px]">
            <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] text-white rounded-lg font-bold shadow-sm hover:bg-[#1d4ed8] active:scale-95 transition-all"><ArrowLeft size={16} /><span>返回管理后台</span></button>
            <div className="h-6 w-px bg-slate-200 mx-1" />
            <span className="text-slate-600 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">管理员 [成都七中初中附属小学]</span>
            <div className="w-8 h-8 bg-[#4c8bf5] rounded-full flex items-center justify-center text-white shrink-0"><User size={16} strokeWidth={3} /></div>
          </div>
        </header>
      )}

      <div className="flex-1 flex overflow-hidden relative">
        <section className={`flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar flex flex-col items-center scroll-stable pt-6`}>
          <div className="max-w-[1920px] w-full flex flex-col items-center">
            <div ref={deckContainerRef} className="w-full relative">
              <div className={`mx-auto flex max-w-full flex-col ${embedded ? 'gap-6' : 'gap-0'}`} style={deckShellStyle}>
                {embedded && (
                  <div className="grid grid-cols-[minmax(220px,260px)_1fr_minmax(220px,320px)] items-center gap-6">
                    <div className="flex justify-start">
                      {classSwitcher}
                    </div>
                    <div className="flex justify-center">
                      {viewModeSwitcher}
                    </div>
                    <div className="flex justify-end">
                      {modeUtilityControl}
                    </div>
                  </div>
                )}
                <div className={`grid grid-cols-[repeat(auto-fill,var(--card-width))] ${viewMode === 'student' ? 'justify-center' : 'justify-start'} gap-6 pb-20 relative`} style={{ '--card-width': `${CARD_WIDTH}px` } as any}>
                  {!embedded && (
                    <div className="col-span-full relative h-[60px] mb-0">
                      <div className="absolute inset-x-0 top-0 h-full">
                        <div className="absolute left-1/2 top-0 -translate-x-1/2 z-10 scale-110">
                          {viewModeSwitcher}
                        </div>

                        <div className="absolute right-0 bottom-0 flex justify-end relative">
                          {modeUtilityControl}
                        </div>
                      </div>
                    </div>
                  )}

                  {viewMode === 'student' ? filteredStudents.map(student => {
                    const isFocused = feedbackEffect?.id === student.id && feedbackEffect.type === 'negative';
                    return (
                      <StudentCard
                        key={student.id}
                        student={student}
                        selected={selectedIds.includes(student.id)}
                        isSelectable={isMultiSelect}
                        isFocused={isFocused}
                        onClick={() => handleCardClick(student)}
                      />
                    );
                  }) : groups.length > 0 ? groups.map(group => (
                    <div key={group.id} className={groupCardSpan === 2 ? 'col-span-2' : 'col-span-1'}>
                      <GroupCard
                        group={group}
                        memberNames={getGroupMemberNames(group)}
                        selected={selectedIds.includes(group.id)}
                        isSelectable={isMultiSelect}
                        compact={groupCardSpan === 1}
                        onClick={() => handleGroupCardClick(group)}
                      />
                    </div>
                  )) : (
                    <div className="col-span-full flex justify-center py-24">
                      <div className="w-full max-w-[680px] rounded-[2rem] border border-dashed border-slate-200 bg-white/70 px-10 py-14 text-center shadow-[0_12px_36px_rgba(15,23,42,0.03)]">
                        <div className="w-16 h-16 mx-auto rounded-[1.5rem] bg-slate-100 text-slate-300 flex items-center justify-center">
                          <Users size={28} strokeWidth={2.2} />
                        </div>
                        <h3 className="text-[24px] font-black text-slate-700 tracking-tight mt-5">当前方案下暂无小组</h3>
                        <p className="text-[13px] font-bold text-slate-400 mt-2">
                          {activeGroupPlan ? `请在「${activeGroupPlan.planName}」下补充小组后再进行点评或随机点名。` : '请先选择一个小组方案。'}
                        </p>
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              </div>
            </div>
          </section>

        <button
          onClick={handleSidebarClose}
          className={`absolute top-1/2 z-[90] h-24 w-8 -translate-y-1/2 rounded-l-2xl border border-r-0 border-slate-100 bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.05)] flex items-center justify-center text-slate-200 transition-[transform,opacity,color] duration-500 hover:text-blue-500 ${isSidebarOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-full opacity-0 pointer-events-none'}`}
          style={{ ...sidebarTiming, right: `${FILTER_SIDEBAR_WIDTH}px`, willChange: 'transform' }}
        >
          <ChevronRight size={20} />
        </button>

        <div
          className={`relative shrink-0 overflow-hidden transition-[width] duration-500 ${isSidebarOpen ? 'opacity-100' : 'opacity-100'}`}
          style={{ ...sidebarTiming, width: isSidebarOpen ? `${FILTER_SIDEBAR_WIDTH}px` : '0px' }}
        >
          <aside
            className={`absolute inset-y-0 right-0 w-[320px] bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.01)] flex flex-col overflow-hidden border-l border-slate-100 transition-[transform,opacity] duration-500 ${isSidebarOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-full opacity-0 pointer-events-none'}`}
            style={{ ...sidebarTiming, willChange: 'transform' }}
          >
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
        </div>

        <div className={`fixed inset-0 z-[100] bg-slate-900/10 backdrop-blur-sm transition-opacity duration-300 ${historyOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setHistoryOpen(false)} />
        <aside className={`fixed right-0 top-0 bottom-0 w-[400px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-[101] flex flex-col border-l border-slate-100 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${historyOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="px-6 py-6 flex flex-col gap-1 border-b border-slate-50 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-blue-600/5 rounded-xl flex items-center justify-center text-blue-600"><History size={18} strokeWidth={2.5} /></div>
                <h3 className="text-lg font-black text-slate-700 tracking-tight">点评记录</h3>
              </div>
              <button onClick={() => setHistoryOpen(false)} className="w-9 h-9 flex items-center justify-center hover:bg-slate-50 rounded-xl text-slate-400 transition-all"><X size={20} /></button>
            </div>
            <p className="text-[11px] font-bold text-slate-400 mt-1 px-0.5 leading-relaxed">最近 15 条，展示原始录入与 AI 分析结果。</p>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 bg-slate-50/40">
            {evalRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-4">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center"><History size={32} strokeWidth={1.5} /></div>
                <span className="text-sm font-bold">暂无点评记录</span>
              </div>
            ) : (
              evalRecords.map((record, idx) => {
                const visibleNames = record.studentNames.slice(0, 4);
                const hiddenNameCount = Math.max(0, record.studentNames.length - visibleNames.length);
                return (
                  <div key={record.id} className="group rounded-2xl border border-slate-100 bg-white p-3 shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all hover:border-blue-500 hover:shadow-xl hover:scale-[1.01] animate-in fade-in slide-in-from-bottom-1 duration-300" style={{ animationDelay: `${idx * 32}ms` }}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-black ${record.source === 'voice' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500'}`}>{record.source === 'voice' ? '语音录入' : '点选录入'}</span>
                        <span className="truncate text-[11px] font-bold text-slate-300 font-mono tracking-tight">{record.time}</span>
                      </div>
                      <button
                        onClick={() => {
                          setEvalRecords(prev => prev.filter(r => r.id !== record.id));
                          setToastMsg(`已撤销点评「${record.optionLabel}」`);
                          setTimeout(() => setToastMsg(null), 3000);
                        }}
                        className="shrink-0 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-[11px] font-black text-slate-400 transition-all hover:border-rose-100 hover:bg-rose-50 hover:text-rose-500 active:scale-95"
                      >
                        撤销
                      </button>
                    </div>

                    <div className="mt-2 rounded-xl bg-slate-50 px-3 py-2">
                      <div className="text-[10px] font-black tracking-widest text-slate-400">原始录入</div>
                      <p className="mt-1 line-clamp-2 text-[13px] font-bold leading-snug text-slate-700">{record.originalInput}</p>
                    </div>

                    <div className="mt-2 rounded-xl border border-blue-100 bg-blue-50/40 px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[10px] font-black tracking-widest text-blue-400">AI 分析</div>
                        <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-black ${record.type === 'positive' ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>{record.type === 'positive' ? '表扬' : '待改进'}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="mr-0.5 text-[11px] font-black text-slate-400">对象</span>
                        {visibleNames.map(name => (
                          <span key={name} className="rounded-full border border-blue-100 bg-white px-2 py-0.5 text-[12px] font-black text-blue-600 shadow-sm">{name}</span>
                        ))}
                        {hiddenNameCount > 0 && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[12px] font-black text-blue-600">等{record.studentNames.length}人</span>}
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-3 rounded-lg bg-white px-2.5 py-1.5 border border-blue-100">
                        <span className="truncate text-[12px] font-black text-slate-700">详细分数：{record.aiScorePath}</span>
                        <span className={`shrink-0 rounded-md px-2 py-0.5 text-[12px] font-black ${record.aiScoreValue.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>{record.aiScoreValue}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      </div>

      <div className={`fixed inset-0 z-[120] flex items-center justify-center ${evaluationModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={handleCloseEvaluation} />
        <div className={`w-[840px] bg-white rounded-[2.5rem] shadow-[0_60px_120px_-20px_rgba(0,0,0,0.25)] overflow-hidden border border-white relative transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${evaluationModalOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} onClick={e => e.stopPropagation()}>
          <div className="px-10 py-[24px] flex items-center justify-between border-b border-slate-100 bg-white min-h-[72px]">
            <div className="flex items-center gap-3 flex-1">
              {isManagerMode ? (
                <div className="bg-slate-50 p-2 rounded-xl text-slate-400 border border-slate-100 flex items-center justify-center w-11 h-11"><Settings size={20} strokeWidth={1.5} /></div>
              ) : (isMultiSelect && selectedIds.length > 1) ? (
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg font-black shadow-sm bg-gradient-to-br from-blue-500 to-blue-700">
                  <Users size={20} strokeWidth={2.5} />
                </div>
              ) : viewMode === 'student' || evalStudent ? (
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg font-black shadow-sm bg-gradient-to-br ${getNameGradient(evalStudent?.name || '')}`}>
                  {evalStudent?.name.slice(0, 1) || '?'}
                </div>
              ) : (
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg font-black shadow-sm bg-gradient-to-br from-indigo-500 to-purple-600">
                  <Users size={20} strokeWidth={2.5} />
                </div>
              )}
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-1.5 translate-y-0.5">
                  <h2 className="text-lg font-black text-slate-700 tracking-tight leading-none">
                    {isManagerMode ? '管理选项' : (isMultiSelect && selectedIds.length > 1 ? `批量点评 (${(viewMode === 'student' || (selectedIds.length > 0 && students.some(s => s.id === selectedIds[0]))) ? '学生' : '小组'})` : (evalStudent ? evalStudent.name : evalGroup?.name))}
                  </h2>
                  {!isManagerMode && evalStudent && (!isMultiSelect || selectedIds.length <= 1) && (evalStudent?.gender === 'male' ? <Mars size={14} className="text-blue-500" strokeWidth={3} /> : <Venus size={14} className="text-pink-500" strokeWidth={3} />)}
                </div>
                {!isManagerMode && evalStudent && (!isMultiSelect || selectedIds.length <= 1) && (<span className="text-[10px] font-bold text-slate-300 font-mono tracking-tighter uppercase mt-1">{evalStudent?.studentNo}</span>)}
                {!isManagerMode && isMultiSelect && selectedIds.length > 1 && (<span className="text-[12px] font-bold text-blue-500 mt-1">已选择 {selectedIds.length} 位{(viewMode === 'student' || (selectedIds.length > 0 && students.some(s => s.id === selectedIds[0]))) ? '学生' : '小组'}</span>)}
              </div>
            </div>
            <div className="flex-1 flex justify-center"><div className="flex bg-slate-100 p-1 rounded-xl gap-0.5 w-[220px]"><button onClick={() => setEvalTab('positive')} className={`flex-1 py-2 rounded-lg font-black text-sm transition-all ${evalTab === 'positive' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-500'}`}>表扬</button><button onClick={() => setEvalTab('negative')} className={`flex-1 py-2 rounded-lg font-black text-sm transition-all ${evalTab === 'negative' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-500'}`}>待改进</button></div></div>
            <div className="flex-1 flex items-center justify-end gap-2 text-slate-400">{isManagerMode ? (<button onClick={() => { setIsManagerMode(false); setNewCategoryName(null); setEditingCategoryName(null); }} className="w-9 h-9 flex items-center justify-center hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all active:scale-90"><ArrowLeft size={20} strokeWidth={2} /></button>) : (<button onClick={() => { setIsManagerMode(true); setManagerSelectedCategory(categories[0]); }} className="w-9 h-9 flex items-center justify-center hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all active:scale-90"><Settings size={20} strokeWidth={2} /></button>)}<button onClick={handleCloseEvaluation} className="w-9 h-9 flex items-center justify-center hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all active:scale-90"><X size={22} strokeWidth={2} /></button></div>
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

      {showPageVoiceButton && (
        <div
          ref={voiceDockRef}
          className={`fixed z-[80] flex items-end gap-3 ${voiceDockPosition ? '' : 'right-10 bottom-28'}`}
          style={voiceDockPosition ? { left: `${voiceDockPosition.x}px`, top: `${voiceDockPosition.y}px` } : undefined}
        >
          <div className={`max-w-[320px] rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-[0_16px_40px_rgba(15,23,42,0.10)] transition-all ${isVoiceListening ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0 pointer-events-none'}`}>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[12px] font-black text-slate-500">录音采集中</span>
            </div>
            <p className="mt-1.5 text-[16px] font-black leading-snug text-slate-800">
              点击结束
            </p>
          </div>
          <button
            onPointerDown={handleVoiceDockPointerDown}
            onPointerMove={handleVoiceDockPointerMove}
            onPointerUp={handleVoiceDockPointerUp}
            onPointerCancel={handleVoiceDockPointerCancel}
            className={`relative flex h-16 w-16 touch-none select-none items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_20px_40px_rgba(37,99,235,0.34)] transition-all hover:bg-blue-700 active:scale-95 cursor-grab active:cursor-grabbing ${isVoiceListening ? 'ring-8 ring-blue-500/15' : ''}`}
            title={isVoiceListening ? '停止语音录入' : '开始语音录入'}
            aria-label={isVoiceListening ? '停止语音录入' : '开始语音录入'}
          >
            {isVoiceListening && <span className="absolute inset-0 rounded-full bg-blue-400/30 animate-ping" />}
            {isVoiceListening ? <VoiceWaveGlyph level={voiceLevel} /> : <VoiceMicGlyph className="relative z-10 h-7 w-7" />}
          </button>
        </div>
      )}

      <div className={`fixed inset-0 z-[140] flex items-center justify-center ${groupDetailsModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setGroupDetailsModalOpen(false)} />
        <div className={`w-[840px] bg-white rounded-[2.5rem] shadow-[0_60px_120px_-20px_rgba(0,0,0,0.25)] overflow-hidden border border-white relative transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${groupDetailsModalOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
          <div className="px-10 py-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                <Users size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">{evalGroup?.name}</h2>
                <p className="text-[12px] font-bold text-slate-400 mt-1">共有 {evalGroup?.memberCount} 名组员</p>
              </div>
            </div>
            <button onClick={() => setGroupDetailsModalOpen(false)} className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-xl text-slate-400 transition-all"><X size={24} /></button>
          </div>
          <div className="p-10 bg-slate-50/50">
            <div className="flex flex-wrap justify-center gap-6 max-h-[400px] overflow-y-auto custom-scrollbar py-4">
              {evalGroup?.memberIds.map(id => {
                const student = students.find(s => s.id === id);
                if (!student) return null;
                return (
                  <StudentCard 
                    key={id}
                    student={student}
                    selected={selectedGroupMemberIds.includes(id)}
                    isSelectable={true}
                    onClick={() => {
                      setSelectedGroupMemberIds(prev => prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]);
                    }}
                  />
                );
              })}
            </div>
          </div>
          <div className="px-10 py-6 border-t border-slate-100 bg-white flex items-center justify-between">
            <button 
              onClick={() => {
                if (selectedGroupMemberIds.length === evalGroup?.memberIds.length) setSelectedGroupMemberIds([]);
                else setSelectedGroupMemberIds([...(evalGroup?.memberIds || [])]);
              }}
              className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-sm hover:bg-slate-200 transition-all"
            >
              {selectedGroupMemberIds.length === evalGroup?.memberIds.length ? '取消全选' : '全选组员'}
            </button>
            <button 
              disabled={selectedGroupMemberIds.length === 0}
              onClick={() => {
                setGroupDetailsModalOpen(false);
                setTimeout(() => {
                  setIsMultiSelect(true);
                  setSelectedIds([...selectedGroupMemberIds]);
                  setEvalStudent(students.find(s => s.id === selectedGroupMemberIds[0]) || null);
                  setEvaluationModalOpen(true);
                }, 300);
              }}
              className={`px-10 py-3 rounded-xl font-black text-base transition-all ${selectedGroupMemberIds.length > 0 ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-95' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
            >
              评价所选成员 ({selectedGroupMemberIds.length})
            </button>
          </div>
        </div>
      </div>

      <div className={`fixed inset-0 z-[150] flex items-center justify-center ${randomModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" onClick={() => { if (!isRolling) closeRandomModal(); }} />
        <div className={`w-[840px] min-h-[540px] bg-white rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border border-white relative overflow-hidden flex flex-col transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${randomModalOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
          <button onClick={() => { if (!isRolling) closeRandomModal(); }} disabled={isRolling} className={`absolute top-7 right-7 w-10 h-10 flex items-center justify-center rounded-xl transition-all z-50 border ${isRolling ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed' : 'bg-white text-slate-400 border-slate-100 hover:text-blue-600 hover:border-blue-200 active:scale-95'}`}><X size={20} strokeWidth={3} /></button>
          
          <div className="px-10 pt-10 pb-4 shrink-0">
            <div className="flex flex-col items-center gap-2 text-center">
              <h2 className="text-[30px] font-black text-slate-800 tracking-tight">随机点名</h2>
            </div>
          </div>

          <div className="flex-1 overflow-visible px-10 py-10 flex flex-col justify-center">
            <div className={`grid justify-items-center content-center gap-x-12 gap-y-4 ${randomCount === 1 ? 'grid-cols-1' : randomCount <= 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {[...Array(randomCount)].map((_, idx) => {
                  const student = randomStudents[idx];
                  const isSingle = randomCount === 1;
                  const isItemRolling = rollingIndices.includes(idx);
                  const isFinished = student && !isItemRolling;
                  
                  return (
                    <div
                      key={idx}
                      className={`relative group transition-all duration-300 ${isSingle ? 'scale-[1.1]' : ''}`}
                    >
                      {/* 槽位标签：直接定位在槽位正上方 */}
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap z-30 pointer-events-none">
                        <span className={`text-[12px] font-black uppercase tracking-[0.2em] px-3 py-0.5 rounded-full border shadow-sm transition-all duration-500 ${isFinished ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>第 {idx + 1} {viewMode === 'student' ? '位' : '组'}</span>
                      </div>

                      {/* 槽位容器 (可见虚线框 -> 金色完成框) */}
                      <div className={`${viewMode === 'student' ? 'w-[180px] h-[195px]' : 'w-[300px] h-[140px]'} rounded-[2rem] flex flex-col items-center justify-center transition-all duration-500 relative`}>
                        <div className={`absolute inset-0 rounded-[2rem] transition-all duration-500 ${isFinished ? 'border-2 border-amber-400 bg-amber-50/20 animate-gold-finish-burst' : 'border-2 border-dashed border-slate-200 bg-white'}`} />
                        {(!student && !randomGroups[idx] || isItemRolling) && (
                          <div className="relative z-10 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-200">
                            {viewMode === 'student' ? <User size={24} /> : <Users size={24} />}
                          </div>
                        )}
                        
                        {(viewMode === 'student' ? student : randomGroups[idx]) && (
                          <div className="absolute inset-0 p-3 flex items-center justify-center animate-in fade-in duration-300 z-10">
                            {viewMode === 'student' ? (
                              <StudentCard 
                                student={student} 
                                isRolling={false} 
                                isSelectable={!isRolling}
                                selected={selectedIds.includes(student.id)}
                                onClick={() => {
                                  if (!isRolling && !isItemRolling) {
                                    setSelectedIds(prev => prev.includes(student.id) ? prev.filter(id => id !== student.id) : [...prev, student.id]);
                                  }
                                }}
                              />
                            ) : (
                              <GroupCard
                                group={randomGroups[idx]}
                                memberNames={getGroupMemberNames(randomGroups[idx])}
                                isRolling={false}
                                isSelectable={!isRolling}
                                compact={true}
                                selected={selectedIds.includes(randomGroups[idx].id)}
                                onClick={() => {
                                  if (!isRolling && !isItemRolling) {
                                    const gId = randomGroups[idx].id;
                                    setSelectedIds(prev => prev.includes(gId) ? prev.filter(id => id !== gId) : [...prev, gId]);
                                  }
                                }}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="px-10 py-4 h-[90px] flex items-center justify-center shrink-0 border-t border-slate-100/50 bg-white/50 backdrop-blur-sm">
            {!isRolling && hasRandomResults ? (
              <div className="flex flex-col items-center gap-4 w-full animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center bg-slate-100/80 p-1 rounded-2xl gap-1.5 shadow-inner">
                  {/* 全选 / 取消全选 */}
                  <button 
                    onClick={() => {
                      if (allRandomSelected) {
                        setSelectedIds(prev => prev.filter(id => !currentRandomIds.includes(id)));
                      } else {
                        const otherSelected = selectedIds.filter(id => !currentRandomIds.includes(id));
                        setSelectedIds([...otherSelected, ...currentRandomIds]);
                      }
                    }} 
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all focus:outline-none ${allRandomSelected ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-100 shadow-sm hover:text-blue-600'}`}
                  >
                    <Check size={14} strokeWidth={3} />
                    {allRandomSelected ? '取消' : '全选'}
                  </button>
                  
                  <div className="w-px h-5 bg-slate-200 mx-0.5" />
                  
                  {/* 批量点评 */}
                  <button 
                    onClick={() => {
                      const batchSelectedIds = currentRandomIds.filter(id => selectedIds.includes(id));
                      if (batchSelectedIds.length > 0) {
                        const firstSelectedId = batchSelectedIds[0];
                        const firstItem = viewMode === 'student' 
                          ? (students.find(s => s.id === firstSelectedId) || randomStudents[0])
                          : (groups.find(g => g.id === firstSelectedId) || randomGroups[0]);
                        
                        closeRandomModal({ preserveSelection: true });
                        setTimeout(() => {
                          setIsMultiSelect(true);
                          setSelectedIds(batchSelectedIds);
                          if (viewMode === 'student') {
                            setEvalStudent(firstItem as StudentData);
                            setEvalGroup(null);
                          } else {
                            setEvalGroup(firstItem as GroupData);
                            setEvalStudent(null);
                          }
                          setEvaluationModalOpen(true); 
                          setEvalTab('positive'); 
                          setIsManagerMode(false);
                        }, 400);
                      }
                    }} 
                    disabled={selectedRandomCount === 0}
                    className={`flex items-center gap-2 px-7 py-2.5 rounded-xl font-black text-sm transition-all focus:outline-none ${selectedRandomCount > 0 ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-95' : 'bg-slate-50 text-slate-300 cursor-not-allowed'}`}
                  >
                    批量点评
                    {selectedRandomCount > 0 && viewMode === 'student' && (
                      <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs ml-0.5">
                        {selectedRandomCount}人
                      </span>
                    )}
                    {selectedRandomCount > 0 && viewMode === 'group' && (
                      <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs ml-0.5">
                        {selectedRandomCount}组
                      </span>
                    )}
                  </button>
                  
                  <div className="w-px h-5 bg-slate-200 mx-0.5" />
                  
                  {/* 重抽一次 */}
                  <button 
                    onClick={() => handleRandomCall(viewMode === 'student' ? randomStudents.length : randomGroups.length)} 
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-500 rounded-xl font-black text-sm border border-slate-100 shadow-sm hover:text-amber-500 active:scale-95 transition-all focus:outline-none"
                  >
                    <RotateCcw size={14} strokeWidth={3} />
                    重抽
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="flex gap-2 text-slate-300 animate-pulse font-black text-sm tracking-[0.18em]">正在挑选...</div>
              </div>
            )}
          </div>
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
              <button 
                onClick={() => { 
                  const pool = viewMode === 'student' ? filteredStudents : groups;
                  if (selectedIds.length === pool.length) setSelectedIds([]); 
                  else setSelectedIds(pool.map(item => item.id)); 
                }} 
                className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-sm transition-all focus:outline-none ${((viewMode === 'student' && selectedIds.length === filteredStudents.length && filteredStudents.length > 0) || (viewMode === 'group' && selectedIds.length === groups.length && groups.length > 0)) ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-100 shadow-sm hover:text-blue-600'}`}
              >
                <Check size={16} strokeWidth={3} />全选
              </button>
              <div className="w-px h-6 bg-slate-200" />
              <button 
                onClick={() => { 
                  if (selectedIds.length > 0) { 
                    const isStudentSelection = students.some(s => s.id === selectedIds[0]);
                    const firstItem = isStudentSelection
                      ? students.find(s => s.id === selectedIds[0])
                      : groups.find(g => g.id === selectedIds[0]);
                    if (firstItem) { 
                      if (isStudentSelection) { setEvalStudent(firstItem as StudentData); setEvalGroup(null); }
                      else { setEvalGroup(firstItem as GroupData); setEvalStudent(null); }
                      setEvaluationModalOpen(true); 
                      setEvalTab('positive'); 
                      setIsManagerMode(false); 
                    } 
                  } 
                }} 
                disabled={selectedIds.length === 0} 
                className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-black text-sm transition-all focus:outline-none ${selectedIds.length > 0 ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-95' : 'bg-slate-50 text-slate-300 cursor-not-allowed'}`}
              >
                点评{selectedIds.length > 0 && <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs ml-1">{selectedIds.length}{(viewMode === 'student' || students.some(s => s.id === selectedIds[0])) ? '人' : '组'}</span>}
              </button>
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
              onMouseEnter={() => setIsRandomPickerOpen(true)}
              onMouseLeave={() => setIsRandomPickerOpen(false)}
            >
              <div className="absolute bottom-full right-0 mb-0 h-4 w-[360px]" />
              <div
                className={`absolute bottom-full right-0 mb-3 inline-flex rounded-[1.6rem] border border-amber-100 bg-white/95 backdrop-blur-md px-3 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.12)] transition-all duration-300 ease-out ${isRandomPickerOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'}`}
              >
                <div className="flex items-center gap-2">
                  {randomQuickCounts.map(num => {
                    const isAvailable = num <= maxRandomSelectableCount;
                    const isActive = randomCount === num;

                    return (
                      <button
                        key={num}
                        onClick={() => {
                          setRandomCount(num);
                          handleRandomCall(num);
                        }}
                        disabled={!isAvailable}
                        aria-pressed={isActive}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-all border active:scale-95 ${isAvailable ? (isActive ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-200/70' : 'bg-white text-slate-500 border-slate-200 hover:text-amber-600 hover:border-amber-300 hover:-translate-y-0.5') : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'}`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => handleRandomCall(randomCount)}
                onFocus={() => setIsRandomPickerOpen(true)}
                disabled={maxRandomSelectableCount === 0}
                className={`flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-black text-[15px] border-2 transition-all focus:outline-none ${isRandomPickerOpen ? 'bg-amber-50 border-amber-300 text-amber-600 shadow-xl -translate-y-0.5' : maxRandomSelectableCount > 0 ? 'bg-white border-slate-100 text-slate-600 hover:text-amber-500 hover:border-amber-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-95' : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'}`}
              >
                <Dices size={18} />
                随机点{viewMode === 'student' ? '名' : '组'}
                <span className={`px-2.5 py-1 rounded-xl text-xs font-black ${maxRandomSelectableCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'}`}>
                  {randomCount}{viewMode === 'student' ? '人' : '组'}
                </span>
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
                <History size={16} strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-bold">点评记录</span>
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
        @keyframes random-card-shuffle { 0% { transform: translateY(0) scale(1); filter: blur(0px); } 35% { transform: translateY(-8px) scale(1.02); filter: blur(0.4px); } 70% { transform: translateY(6px) scale(0.99); filter: blur(0.6px); } 100% { transform: translateY(0) scale(1); filter: blur(0px); } }
        .animate-random-card-shuffle { animation: random-card-shuffle 0.38s ease-in-out infinite; }
        @keyframes random-scan { 0% { transform: translateX(-50%) translateY(-24px); opacity: 0; } 15% { opacity: 1; } 50% { transform: translateX(-50%) translateY(140px); opacity: 0.9; } 85% { opacity: 1; } 100% { transform: translateX(-50%) translateY(300px); opacity: 0; } }
        .animate-random-scan { animation: random-scan 1.2s ease-in-out infinite; }
        @keyframes gold-finish-burst { 0% { box-shadow: 0 0 0 0 rgba(251,191,36,0); } 30% { box-shadow: 0 0 0 20px rgba(251,191,36,0.4); } 60% { box-shadow: 0 0 0 40px rgba(251,191,36,0); } 100% { box-shadow: 0 0 0 0 rgba(251,191,36,0); } }
        .animate-gold-finish-burst { animation: gold-finish-burst 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
        .will-change-transform { will-change: transform; }
      `}</style>
    </div>
  );
};

export default SmartBigScreen;
