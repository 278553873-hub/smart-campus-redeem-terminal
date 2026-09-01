import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  BookOpenCheck,
  FileText,
  Footprints,
  GripVertical,
  LockKeyhole,
  MapPinned,
  Minus,
  Check,
  PencilLine,
  Plus,
  Smartphone,
  Sparkles,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import PhoneMockup from './PhoneMockup';
import type { Student } from '../mobile-app/types';
import { ASSETS } from '../mobile-app/assets/images';
import { teacherBrandCssVariables } from '../mobile-app/styles/teacherMobileTokens';
import MobileBottomSheet from '../mobile-app/components/ui/MobileBottomSheet';
import CompactSegmentedControl from '../mobile-app/components/ui/CompactSegmentedControl';
import {
  DEFAULT_ACTIVITY_MEDALS,
  DEFAULT_CLASS_MEDALS,
  DEFAULT_DAILY_MEDALS,
  DEFAULT_PLATFORM_MEDALS,
  DEFAULT_SCHOOL_MEDALS,
  DEFAULT_SEMESTER_MEDALS,
  type MedalDefinition,
  type MedalScope,
} from '../mobile-app/domain/medal';
import TermReportView, {
  ReportBodyText,
  ReportCaption,
  ReportCard,
  ReportPageContainer,
  ReportSectionHeader,
  ReportTag,
  type TermReportAnchorItem,
  type TermReportSectionId,
} from '../mobile-app/views/TermReportView';

type CustomModuleId = 'school-profile' | 'behavior-trace' | 'term-change' | 'school-achievement';
type ReportDisplayMode = 'mobile' | 'a4';

interface CustomReportPageProps {
  mode: ReportDisplayMode;
}

interface CustomModuleDefinition {
  id: CustomModuleId;
  label: string;
  purpose: string;
  source: string;
}

const customModules: CustomModuleDefinition[] = [
  {
    id: 'school-profile',
    label: '校本成长画像',
    purpose: '按学校的五个一级指标归纳学生特点，不将记录次数换算为能力分数。',
    source: '三级指标路径 + 行为记录',
  },
  {
    id: 'behavior-trace',
    label: '行为成长足迹',
    purpose: '选择代表性真实记录，并保留时间、教师与三级指标路径。',
    source: '教师原始记录 + 匹配指标',
  },
  {
    id: 'term-change',
    label: '学期成长变化',
    purpose: '对比同类行为在学期前后的表现变化，只呈现有证据支撑的结论。',
    source: '同类行为记录 + 记录时间',
  },
  {
    id: 'school-achievement',
    label: '校本专题成果',
    purpose: '聚合学校主题活动中的参与、完成和真实表现，不依赖称号系统。',
    source: '专题指标 + 活动行为记录',
  },
];

type ReportConfigSectionId = TermReportSectionId;

interface ReportConfigSection {
  id: ReportConfigSectionId;
  label: string;
  defaultEnabled: boolean;
  locked?: boolean;
}

const reportConfigSections: ReportConfigSection[] = [
  { id: 'cover', label: '封面', defaultEnabled: true, locked: true },
  { id: 'medals', label: '成长奖章', defaultEnabled: true },
  { id: 'teacher-attention', label: '教师关注', defaultEnabled: false },
  { id: 'growth-radar', label: '五育雷达图', defaultEnabled: true },
  { id: 'subject-results', label: '学科成绩', defaultEnabled: true },
  { id: 'school-achievement', label: '专题成果', defaultEnabled: false },
  { id: 'highlights', label: '高光时刻', defaultEnabled: false },
  { id: 'overall', label: '总体评价', defaultEnabled: true },
  { id: 'future-potential', label: '未来潜力', defaultEnabled: false },
  { id: 'growth-suggestions', label: '成长建议', defaultEnabled: true },
  { id: 'parent-activities', label: '亲子活动指南', defaultEnabled: true },
  { id: 'parent-feedback', label: '家长自评', defaultEnabled: false },
  { id: 'student-feedback', label: '学生自评', defaultEnabled: false },
];

const defaultEnabledSections = reportConfigSections.reduce<Record<ReportConfigSectionId, boolean>>(
  (result, section) => {
    result[section.id] = section.defaultEnabled;
    return result;
  },
  {} as Record<ReportConfigSectionId, boolean>,
);

interface ReportMedalItem {
  id: string;
  name: string;
  image: string;
  quantity: number;
}

const MEDAL_IMAGE_ASSETS: Record<string, string> = {
  'platform-deyu-star': ASSETS.MEDALS.PLATFORM_DEYU_STAR,
  'platform-zhiyu-star': ASSETS.MEDALS.PLATFORM_ZHIYU_STAR,
  'platform-tiyu-star': ASSETS.MEDALS.PLATFORM_TIYU_STAR,
  'platform-meiyu-star': ASSETS.MEDALS.PLATFORM_MEIYU_STAR,
  'platform-laoyu-star': ASSETS.MEDALS.PLATFORM_LAOYU_STAR,
  'platform-three-good-student': ASSETS.MEDALS.SEMESTER_THREE_GOOD,
  'platform-excellent-cadre': ASSETS.MEDALS.SEMESTER_CADRE,
  'platform-excellent-young-pioneer': ASSETS.MEDALS.SEMESTER_YOUNG_PIONEER,
  'platform-excellent-student': ASSETS.MEDALS.SEMESTER_EXCELLENT_STUDENT,
  'platform-progress-star': ASSETS.MEDALS.DAILY_PROGRESS,
  'platform-diligent-star': ASSETS.MEDALS.DAILY_DILIGENT,
  'platform-civilized-star': ASSETS.MEDALS.DAILY_CIVILIZED,
  'platform-disciplined-star': ASSETS.MEDALS.DAILY_DISCIPLINED,
  'platform-friendly-star': ASSETS.MEDALS.DAILY_FRIENDLY,
  'platform-sports-talent': ASSETS.MEDALS.ACTIVITY_SPORTS,
  'platform-art-talent': ASSETS.MEDALS.ACTIVITY_ART,
  'platform-tech-talent': ASSETS.MEDALS.ACTIVITY_TECH,
  'platform-reading-talent': ASSETS.MEDALS.ACTIVITY_READING,
  'platform-performance-talent': ASSETS.MEDALS.ACTIVITY_PERFORMANCE,
};

const REPORT_MEDAL_NAME_OVERRIDES: Record<string, string> = {
  'platform-deyu-star': '成正少年',
  'platform-zhiyu-star': '成智少年',
  'platform-tiyu-star': '成健少年',
  'platform-meiyu-star': '成雅少年',
  'platform-laoyu-star': '成技少年',
};

const medalOptionFromDefinition = (definition: MedalDefinition): Omit<ReportMedalItem, 'quantity'> => ({
  id: definition.id,
  name: REPORT_MEDAL_NAME_OVERRIDES[definition.id] ?? definition.name,
  // 班级/学校奖章可能没有预置图片，沿用教师端默认奖章图标作为占位。
  image: MEDAL_IMAGE_ASSETS[definition.id] ?? ASSETS.MEDALS.PLATFORM_DEYU_STAR,
});

const medalCatalog: Record<MedalScope, Omit<ReportMedalItem, 'quantity'>[]> = {
  platform: [...DEFAULT_PLATFORM_MEDALS, ...DEFAULT_SEMESTER_MEDALS, ...DEFAULT_DAILY_MEDALS, ...DEFAULT_ACTIVITY_MEDALS].map(medalOptionFromDefinition),
  school: DEFAULT_SCHOOL_MEDALS.map(medalOptionFromDefinition),
  class: DEFAULT_CLASS_MEDALS.map(medalOptionFromDefinition),
};

const medalOptions = Object.values(medalCatalog).flat();

const initialReportMedals: ReportMedalItem[] = [
  { ...medalOptions[0], quantity: 1 },
  { ...medalOptions[1], quantity: 1 },
  { ...medalOptions[2], quantity: 1 },
  { ...medalOptions[3], quantity: 1 },
  { ...medalOptions[4], quantity: 1 },
];

interface ReportMedalsPageProps {
  mode: ReportDisplayMode;
  medals: ReportMedalItem[];
  onChange: (medalId: string, quantity: number) => void;
  onRemove: (medalId: string) => void;
  onAdd: (medal: ReportMedalItem) => void;
  embedded?: boolean;
}

const ReportMedalsPage: React.FC<ReportMedalsPageProps> = ({ mode, medals, onChange, onRemove, onAdd, embedded = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [medalScope, setMedalScope] = useState<MedalScope>('platform');
  const [draftQuantities, setDraftQuantities] = useState<Record<string, number>>(() => Object.fromEntries(medals.map(medal => [medal.id, medal.quantity])));
  useEffect(() => {
    setDraftQuantities(Object.fromEntries(medals.map(medal => [medal.id, medal.quantity])));
  }, [medals]);
  const updateQuantity = (medalId: string, quantity: number) => {
    setDraftQuantities(current => ({ ...current, [medalId]: quantity }));
    onChange(medalId, quantity);
  };
  const medalRows = isEditing
    ? medals.filter(medal => medal.quantity > 0).map(medal => ({ ...medal, quantity: draftQuantities[medal.id] ?? medal.quantity }))
    : medals.filter(medal => medal.quantity > 0);
  const availableMedals = medalCatalog[medalScope].filter(option => !medals.some(medal => medal.id === option.id && medal.quantity > 0));

  const medalContent = (
    <ReportCard className="report-medals-card">
    <>
      <ReportSectionHeader
        title="成长奖章"
        subTitle="Medals"
        icon={Award}
        rightElement={(
          <button
            type="button"
            onClick={() => setIsEditing(current => !current)}
            className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-[12px] font-bold transition-colors ${isEditing ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            {isEditing ? <Check className="h-3.5 w-3.5" /> : <PencilLine className="h-3.5 w-3.5" />}
            <span>{isEditing ? '完成' : '编辑'}</span>
          </button>
        )}
      />
      {isEditing && (
        <div className="mb-3 flex justify-end">
          <button type="button" onClick={() => setIsAddOpen(true)} className="flex h-8 items-center gap-1.5 rounded-lg bg-slate-100 px-3 text-xs font-bold text-slate-700 hover:bg-slate-200">
            <Plus className="h-3.5 w-3.5" />添加奖章
          </button>
        </div>
      )}
      {medalRows.length > 0 ? (
        <div className="grid grid-cols-3 gap-x-3 gap-y-4">
            {medalRows.map(medal => (
            <div key={medal.id} className="relative flex min-h-[116px] min-w-0 flex-col items-center justify-center gap-1 px-1 py-3">
              <img src={medal.image} alt="" className="h-12 w-12 shrink-0 object-contain" />
              {!isEditing && medal.quantity > 1 && <span className="absolute right-1 top-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold leading-none text-slate-500">×{medal.quantity}</span>}
              <div className="relative w-full min-w-0 text-center">
                <span className="break-words text-[11px] font-bold leading-4 text-slate-800">{medal.name}</span>
              </div>
              {isEditing && (
                <div className="mt-1 flex h-7 items-center gap-1">
                  <button type="button" onClick={() => updateQuantity(medal.id, Math.max(1, medal.quantity - 1))} className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50" aria-label={`减少${medal.name}数量`} title={`减少${medal.name}数量`}><Minus className="h-3 w-3" /></button>
                  <span className="min-w-4 text-center text-xs font-black text-slate-900">{medal.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(medal.id, medal.quantity + 1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50" aria-label={`增加${medal.name}数量`} title={`增加${medal.name}数量`}><Plus className="h-3 w-3" /></button>
                </div>
              )}
              {isEditing && (
                <button type="button" onClick={() => onRemove(medal.id)} className="absolute right-0.5 top-1 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label={`删除${medal.name}`} title={`删除${medal.name}`}>
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-4 text-center text-sm text-slate-400">暂无奖章</div>
      )}
      {/* MobileBottomSheet renders role="dialog" and focus management for this flow. */}
      <MobileBottomSheet
        open={isAddOpen}
        title="添加奖章"
        onClose={() => setIsAddOpen(false)}
        size="tall"
        contentInset="compact"
        contentTone="plain"
      >
        <div className="sticky top-0 z-10 bg-[var(--tm-page-plain-content-bg)] pb-3 pt-2">
          <CompactSegmentedControl
            value={medalScope}
            items={[
              { value: 'platform' as const, label: '平台奖章' },
              { value: 'school' as const, label: '学校奖章' },
              { value: 'class' as const, label: '班级奖章' },
            ]}
            onChange={setMedalScope}
            ariaLabel="奖章来源"
            fullWidth
            density="compact"
            motion="sliding"
          />
        </div>
        {availableMedals.length > 0 ? (
          <div className="grid grid-cols-3 gap-x-2 gap-y-3 pb-6">
            {availableMedals.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => { onAdd({ ...option, quantity: 1 }); setIsAddOpen(false); }}
                className="flex min-h-[104px] min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-center transition-colors hover:bg-white active:bg-slate-100"
              >
                <img src={option.image} alt="" className="h-12 w-12 object-contain" />
                <span className="break-words text-[12px] font-semibold leading-4 text-slate-700">{option.name}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[220px] items-center justify-center text-sm text-slate-400">暂无{medalScope === 'school' ? '学校' : medalScope === 'class' ? '班级' : '平台'}奖章</div>
        )}
      </MobileBottomSheet>
    </>
    </ReportCard>
  );

  return embedded ? (
    <div id="section-medals" className="scroll-mt-[100px]">
      {medalContent}
    </div>
  ) : (
    <ReportPageContainer mode={mode} id={mode === 'mobile' ? 'section-medals' : undefined} compactMobile={mode === 'mobile'}>
      {medalContent}
    </ReportPageContainer>
  );
};


const demoStudent: Student = {
  id: 'school-demo-li-yiyang',
  name: '李亦洋',
  gender: 'female',
  grade: '五年级',
  class: '2021级二班',
  studentNo: '20210200324',
};

const profileItems = [
  { label: '成正', color: 'orange' as const, title: '主动担当，文明有礼', detail: '在值日、同伴协作与公共事务中，逐渐从按要求完成走向主动发现并补位。' },
  { label: '成智', color: 'blue' as const, title: '善于探究，表达清楚', detail: '在学科学习与数学文化节活动中，能提出不同思路并向同伴说明方法。' },
  { label: '成健', color: 'green' as const, title: '坚持参与，重视协作', detail: '在日常锻炼和足球活动中保持投入，能在团队变化中主动支持队友。' },
  { label: '成雅', color: 'purple' as const, title: '稳定投入，乐于合作', detail: '在音乐活动中保持自己的声部，也愿意帮助同伴找到节奏。' },
  { label: '成技', color: 'green' as const, title: '动手有序，主动收尾', detail: '完成生活技能任务时逐渐减少依赖，并能主动整理工具与操作环境。' },
];

const behaviorRecords = [
  { date: '3月12日', teacher: '班主任王老师', text: '课后主动整理讲台，并提醒值日同学检查工具摆放。', path: '成正 / 德育常规 / 责任担当' },
  { date: '4月18日', teacher: '数学李老师', text: '数学文化节小组展示中，用两种方法讲解同一道题。', path: '成智 / 数学 / 数学文化节' },
  { date: '5月22日', teacher: '劳动周老师', text: '劳动实践课独立完成配菜和翻炒，并主动清理操作台。', path: '成技 / 劳动与生活 / 生活技能' },
  { date: '6月5日', teacher: '体育刘老师', text: '足球联赛训练中主动补位，并在失球后鼓励队友继续配合。', path: '成健 / 身体健康 / 运动特长' },
];

const SchoolGrowthProfilePage: React.FC<CustomReportPageProps> = ({ mode }) => (
  <ReportPageContainer mode={mode} id={mode === 'mobile' ? 'section-school-profile' : undefined}>
    <ReportSectionHeader title="校本成长画像" subTitle="School Profile" icon={MapPinned} badge="本校指标" />
    <ReportCaption className="mb-4">根据本学期真实行为记录，归纳在学校五个育人维度中的具体表现</ReportCaption>
    <ReportCard noPadding className="overflow-hidden">
      {profileItems.map((item, index) => (
        <div key={item.label} className={`flex gap-3 p-4 ${index < profileItems.length - 1 ? 'border-b border-slate-100' : ''}`}>
          <div className="shrink-0 pt-0.5"><ReportTag color={item.color}>{item.label}</ReportTag></div>
          <div className="min-w-0">
            <div className="text-[13px] font-bold text-slate-800">{item.title}</div>
            <div className="mt-1 text-xs leading-relaxed text-slate-500">{item.detail}</div>
          </div>
        </div>
      ))}
    </ReportCard>
  </ReportPageContainer>
);

const BehaviorTracePage: React.FC<CustomReportPageProps> = ({ mode }) => (
  <ReportPageContainer mode={mode} id={mode === 'mobile' ? 'section-behavior-trace' : undefined}>
    <ReportSectionHeader title="行为成长足迹" subTitle="Growth Trace" icon={Footprints} badge="真实记录" />
    <ReportCaption className="mb-4">从完整记录中选择能够代表本学期成长特点的行为证据</ReportCaption>
    <ReportCard noPadding className="overflow-hidden">
      {behaviorRecords.map((record, index) => (
        <div key={`${record.date}-${record.path}`} className={`p-4 ${index < behaviorRecords.length - 1 ? 'border-b border-slate-100' : ''}`}>
          <div className="flex items-center justify-between gap-3 text-[10px] font-bold text-slate-400">
            <span>{record.date}</span><span>{record.teacher}</span>
          </div>
          <ReportBodyText className="mt-2 text-left">{record.text}</ReportBodyText>
          <div className="mt-2 text-[10px] font-bold text-blue-600">{record.path}</div>
        </div>
      ))}
    </ReportCard>
  </ReportPageContainer>
);

const TermChangePage: React.FC<CustomReportPageProps> = ({ mode }) => (
  <ReportPageContainer mode={mode} id={mode === 'mobile' ? 'section-term-change' : undefined}>
    <ReportSectionHeader title="学期成长变化" subTitle="Term Change" icon={TrendingUp} badge="行为对比" />
    <ReportCaption className="mb-4">对比学期前后同类行为，描述可由记录验证的变化</ReportCaption>
    <div className="space-y-4">
      <ReportCard>
        <div className="text-sm font-bold text-slate-800">公共事务参与</div>
        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="rounded-lg bg-slate-50 p-3 text-center text-xs leading-relaxed text-slate-500">接受分工后完成</div>
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          <div className="rounded-lg bg-emerald-50 p-3 text-center text-xs font-bold leading-relaxed text-emerald-700">主动发现并补位</div>
        </div>
        <div className="mt-3 text-[10px] text-slate-400">依据 3 月与 6 月同类行为记录</div>
      </ReportCard>
      <ReportCard>
        <div className="text-sm font-bold text-slate-800">任务表达方式</div>
        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="rounded-lg bg-slate-50 p-3 text-center text-xs leading-relaxed text-slate-500">给出自己的答案</div>
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          <div className="rounded-lg bg-emerald-50 p-3 text-center text-xs font-bold leading-relaxed text-emerald-700">解释方法并回应提问</div>
        </div>
        <div className="mt-3 text-[10px] text-slate-400">依据课堂与数学文化节记录</div>
      </ReportCard>
    </div>
  </ReportPageContainer>
);

const SchoolAchievementPage: React.FC<CustomReportPageProps> = ({ mode }) => (
  <ReportPageContainer mode={mode} id={mode === 'mobile' ? 'section-school-achievement' : undefined}>
    <ReportSectionHeader title="校本专题成果" subTitle="School Projects" icon={BookOpenCheck} badge="学校可配置" />
    <ReportCaption className="mb-4">聚合学校重点活动中的参与、完成情况与代表性表现</ReportCaption>
    <div className="space-y-4">
      {[
        ['数学文化节', '完成小组解题展示与现场讲解', '成智 / 数学 / 数学文化节'],
        ['劳动技能', '独立完成本学期生活技能实践', '成技 / 劳动与生活 / 生活技能'],
        ['足球联赛', '持续参加训练并形成协作表现', '成健 / 身体健康 / 运动特长'],
      ].map(([title, result, path]) => (
        <ReportCard key={title}>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Sparkles className="h-4 w-4" /></div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-800">{title}</div>
              <div className="mt-1 text-xs leading-relaxed text-slate-600">{result}</div>
              <div className="mt-2 text-[10px] font-bold text-blue-600">{path}</div>
            </div>
          </div>
        </ReportCard>
      ))}
    </div>
  </ReportPageContainer>
);

const modulePageComponentMap: Record<CustomModuleId, React.FC<CustomReportPageProps>> = {
  'school-profile': SchoolGrowthProfilePage,
  'behavior-trace': BehaviorTracePage,
  'term-change': TermChangePage,
  'school-achievement': SchoolAchievementPage,
};

const createModulePages = (mode: ReportDisplayMode, enabledModules: Record<CustomModuleId, boolean>) => (
  customModules
    .filter(module => enabledModules[module.id])
    .map(module => {
      const Page = modulePageComponentMap[module.id];
      return <Page key={`${mode}-${module.id}`} mode={mode} />;
    })
);

const TermReportRedesignDemo: React.FC = () => {
  const [previewMode, setPreviewMode] = useState<ReportDisplayMode>('mobile');
  const [enabledSections, setEnabledSections] = useState<Record<ReportConfigSectionId, boolean>>(defaultEnabledSections);
  const [sectionOrder, setSectionOrder] = useState<ReportConfigSectionId[]>(() => reportConfigSections.map(section => section.id));
  const [activeSectionId, setActiveSectionId] = useState<ReportConfigSectionId>('cover');
  const [draggingSectionId, setDraggingSectionId] = useState<ReportConfigSectionId | null>(null);
  const [reportMedals, setReportMedals] = useState<ReportMedalItem[]>(initialReportMedals);

  const orderedReportConfigSections = sectionOrder
    .map(id => reportConfigSections.find(section => section.id === id))
    .filter((section): section is ReportConfigSection => Boolean(section));

  const additionalMobilePages = useMemo(
    () => createModulePages('mobile', {
      'school-profile': false,
      'behavior-trace': false,
      'term-change': false,
      'school-achievement': enabledSections['school-achievement'],
    }),
    [enabledSections],
  );
  const additionalA4Pages = useMemo(
    () => createModulePages('a4', {
      'school-profile': false,
      'behavior-trace': false,
      'term-change': false,
      'school-achievement': enabledSections['school-achievement'],
    }),
    [enabledSections],
  );
  const additionalMedalMobilePages = useMemo(
    () => enabledSections.medals ? [<ReportMedalsPage key="mobile-medals" mode="mobile" medals={reportMedals} onChange={(medalId, quantity) => setReportMedals(current => current.map(medal => medal.id === medalId ? { ...medal, quantity } : medal))} onRemove={medalId => setReportMedals(current => current.filter(medal => medal.id !== medalId))} onAdd={medal => setReportMedals(current => [...current, medal])} />] : [],
    [enabledSections.medals, reportMedals],
  );
  const additionalMedalA4Pages = useMemo(
    () => enabledSections.medals ? [<ReportMedalsPage key="a4-medals" mode="a4" medals={reportMedals} onChange={(medalId, quantity) => setReportMedals(current => current.map(medal => medal.id === medalId ? { ...medal, quantity } : medal))} onRemove={medalId => setReportMedals(current => current.filter(medal => medal.id !== medalId))} onAdd={medal => setReportMedals(current => [...current, medal])} />] : [],
    [enabledSections.medals, reportMedals],
  );
  const additionalMedalMobileContent = useMemo(
    () => enabledSections.medals ? <ReportMedalsPage mode="mobile" medals={reportMedals} onChange={(medalId, quantity) => setReportMedals(current => current.map(medal => medal.id === medalId ? { ...medal, quantity } : medal))} onRemove={medalId => setReportMedals(current => current.filter(medal => medal.id !== medalId))} onAdd={medal => setReportMedals(current => [...current, medal])} embedded /> : null,
    [enabledSections.medals, reportMedals],
  );
  const additionalMedalA4Content = useMemo(
    () => enabledSections.medals ? <ReportMedalsPage mode="a4" medals={reportMedals} onChange={(medalId, quantity) => setReportMedals(current => current.map(medal => medal.id === medalId ? { ...medal, quantity } : medal))} onRemove={medalId => setReportMedals(current => current.filter(medal => medal.id !== medalId))} onAdd={medal => setReportMedals(current => [...current, medal])} embedded /> : null,
    [enabledSections.medals, reportMedals],
  );
  const additionalMedalMobileAnchorItems = useMemo<TermReportAnchorItem[]>(
    () => enabledSections.medals ? [{ id: 'section-medals', label: '成长奖章' }] : [],
    [enabledSections.medals],
  );
  const additionalMobileAnchorItems = useMemo<TermReportAnchorItem[]>(
    () => enabledSections['school-achievement']
      ? [{ id: 'section-school-achievement', label: '专题成果' }]
      : [],
    [enabledSections],
  );

  const focusSection = (id: ReportConfigSectionId) => {
    setActiveSectionId(id);
    requestAnimationFrame(() => {
      const scrollContainer = document.getElementById('report-scroll-container');
      if (id === 'cover') {
        scrollContainer?.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const sectionId = id === 'teacher-attention'
        ? 'section-teacher'
        : id === 'growth-radar'
          ? 'section-growth-radar'
          : id === 'subject-results'
            ? 'section-subject-results'
              : id === 'school-achievement'
                ? 'section-school-achievement'
              : id === 'medals'
                ? 'section-medals'
              : id === 'highlights'
                ? 'section-highlights'
                : id === 'overall'
                  ? 'section-overall'
                  : id === 'future-potential'
                    ? 'section-future'
                    : id === 'growth-suggestions'
                      ? 'section-future-suggestions'
                      : id === 'parent-activities'
                        ? 'section-activities'
                        : id === 'parent-feedback'
                          ? 'section-parent'
                          : 'section-student';
      const target = scrollContainer?.querySelector<HTMLElement>(`[id="${sectionId}"]`);
      if (!scrollContainer || !target) return;
      const targetTop = target.getBoundingClientRect().top
        - scrollContainer.getBoundingClientRect().top
        + scrollContainer.scrollTop;
      scrollContainer.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
    });
  };

  const toggleSection = (id: ReportConfigSectionId) => {
    if (id === 'cover') return;
    setEnabledSections(current => ({ ...current, [id]: !current[id] }));
    if (activeSectionId === id && enabledSections[id]) setActiveSectionId('cover');
  };

  const handleSectionDragStart = (event: React.DragEvent<HTMLDivElement>, id: ReportConfigSectionId) => {
    if (id === 'cover') {
      event.preventDefault();
      return;
    }
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', id);
    setDraggingSectionId(id);
  };

  const handleSectionDrop = (event: React.DragEvent<HTMLDivElement>, targetId: ReportConfigSectionId) => {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData('text/plain') as ReportConfigSectionId;
    if (!sourceId || sourceId === targetId || sourceId === 'cover' || targetId === 'cover') return;

    setSectionOrder(currentOrder => {
      const nextOrder = currentOrder.filter(id => id !== sourceId);
      const targetIndex = nextOrder.indexOf(targetId);
      nextOrder.splice(targetIndex < 0 ? nextOrder.length : targetIndex, 0, sourceId);
      return nextOrder[0] === 'cover' ? nextOrder : ['cover', ...nextOrder.filter(id => id !== 'cover')];
    });
  };

  const handleSectionDragEnd = () => setDraggingSectionId(null);

  return (
    <main className="flex h-full min-h-0 flex-col bg-slate-100" style={teacherBrandCssVariables as React.CSSProperties}>
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 max-[520px]:px-3">
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold text-slate-900">期末报告样式配置</h1>
          <p className="mt-0.5 truncate text-xs text-slate-500">基于学校指标的可配置报告预览</p>
        </div>
        <div className="flex shrink-0 items-center">
          <div className="flex h-9 items-center rounded-md bg-slate-100 p-1" role="group" aria-label="报告预览样式">
            <button
              type="button"
              aria-pressed={previewMode === 'mobile'}
              onClick={() => setPreviewMode('mobile')}
              className={`flex h-7 items-center gap-1.5 rounded px-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${previewMode === 'mobile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Smartphone className="h-3.5 w-3.5" />手机端
            </button>
            <button
              type="button"
              aria-pressed={previewMode === 'a4'}
              onClick={() => setPreviewMode('a4')}
              className={`flex h-7 items-center gap-1.5 rounded px-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${previewMode === 'a4' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <FileText className="h-3.5 w-3.5" />A4版
            </button>
          </div>
        </div>
      </header>

      <div className={`grid min-h-0 flex-1 ${previewMode === 'mobile' ? 'grid-cols-[260px_minmax(420px,1fr)] max-[1080px]:grid-cols-[240px_minmax(400px,1fr)] max-[720px]:grid-cols-1' : 'grid-cols-[260px_minmax(794px,1fr)] max-[1080px]:grid-cols-[220px_minmax(794px,1fr)] max-[900px]:grid-cols-1'}`}>
        <aside className={`min-h-0 overflow-y-auto border-r border-slate-200 bg-white ${previewMode === 'mobile' ? 'max-[720px]:hidden' : 'max-[900px]:hidden'}`} aria-label="报告板块配置">
          <div className="border-b border-slate-100 px-4 py-4">
            <h2 className="text-sm font-bold text-slate-900">报告板块</h2>
          </div>
          <div className="p-2">
            {orderedReportConfigSections.map(section => {
              const isEnabled = enabledSections[section.id];
              const isActive = activeSectionId === section.id;
              return (
                <div
                  key={section.id}
                  draggable={!section.locked}
                  onDragStart={event => handleSectionDragStart(event, section.id)}
                  onDragOver={event => event.preventDefault()}
                  onDrop={event => handleSectionDrop(event, section.id)}
                  onDragEnd={handleSectionDragEnd}
                  className={`flex min-h-12 items-center rounded-md border border-transparent ${isActive ? 'bg-red-50' : 'hover:bg-slate-50'} ${draggingSectionId === section.id ? 'border-dashed border-red-300 bg-red-50/70 opacity-60' : ''}`}
                >
                  <span
                    className={`flex h-10 w-8 shrink-0 cursor-grab items-center justify-center text-slate-400 active:cursor-grabbing ${section.locked ? 'invisible' : ''}`}
                    aria-label={section.locked ? undefined : `拖动排序${section.label}`}
                    title={section.locked ? undefined : `拖动排序${section.label}`}
                  >
                    <GripVertical className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <button
                    type="button"
                    onClick={() => focusSection(section.id)}
                    className={`min-w-0 flex-1 px-3 py-2 text-left text-sm font-semibold ${isActive ? 'text-red-700' : 'text-slate-700'}`}
                  >
                    <span className="block truncate">{section.label}</span>
                  </button>
                  {section.locked ? (
                    <span className="mr-3 flex h-8 w-8 items-center justify-center text-slate-400" aria-label="封面固定开启">
                      <LockKeyhole className="h-4 w-4" />
                    </span>
                  ) : (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isEnabled}
                      aria-label={`${isEnabled ? '关闭' : '开启'}${section.label}`}
                      onClick={() => toggleSection(section.id)}
                      className={`relative mr-3 h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${isEnabled ? 'bg-red-600' : 'bg-slate-300'}`}
                    >
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${isEnabled ? 'left-0.5 translate-x-4' : 'left-0.5'}`} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        <section className={`min-h-0 bg-slate-100 ${previewMode === 'mobile' ? 'p-4 max-[720px]:p-2' : 'overflow-auto p-4'}`} aria-label={previewMode === 'mobile' ? '教师手机端报告预览' : 'A4报告预览'}>
          {previewMode === 'mobile' ? (
            <PhoneMockup showDeviceFrame contentTopInsetMode="status-bar">
              <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
                <TermReportView
                  key="mobile-report"
                  student={demoStudent}
                  onBack={() => undefined}
                  additionalMobilePages={additionalMobilePages}
                  additionalA4Pages={additionalA4Pages}
                  additionalMobileAnchorItems={additionalMobileAnchorItems}
                  additionalMedalMobilePages={additionalMedalMobilePages}
                  additionalMedalA4Pages={additionalMedalA4Pages}
                  additionalMedalMobileAnchorItems={additionalMedalMobileAnchorItems}
                  additionalMedalMobileContent={additionalMedalMobileContent}
                  additionalMedalA4Content={additionalMedalA4Content}
                  initialViewMode="mobile"
                  showViewModeToggle={false}
                  enabledSections={enabledSections}
                  sectionOrder={sectionOrder}
                  showLegacyOptionalSections={false}
                  compactConfiguredMobileSections
                  hideEndMarker
                />
                <div id="teacher-mobile-overlay-root" className="pointer-events-none absolute inset-0 z-[1000]" />
              </div>
            </PhoneMockup>
          ) : (
            <div className="mx-auto h-full min-h-[620px] min-w-[794px] max-w-[920px] overflow-hidden shadow-sm">
              <div className="relative h-full min-h-0 overflow-hidden">
                <TermReportView
                  key="a4-report"
                  student={demoStudent}
                  onBack={() => undefined}
                  additionalMobilePages={additionalMobilePages}
                  additionalA4Pages={additionalA4Pages}
                  additionalMobileAnchorItems={additionalMobileAnchorItems}
                  additionalMedalMobilePages={additionalMedalMobilePages}
                  additionalMedalA4Pages={additionalMedalA4Pages}
                  additionalMedalMobileAnchorItems={additionalMedalMobileAnchorItems}
                  additionalMedalMobileContent={additionalMedalMobileContent}
                  additionalMedalA4Content={additionalMedalA4Content}
                  initialViewMode="a4"
                  showViewModeToggle={false}
                  enabledSections={enabledSections}
                  sectionOrder={sectionOrder}
                  showLegacyOptionalSections={false}
                  hideEndMarker
                />
                <div id="teacher-mobile-overlay-root" className="pointer-events-none absolute inset-0 z-[1000]" />
              </div>
            </div>
          )}
        </section>

      </div>
    </main>
  );
};

export default TermReportRedesignDemo;
