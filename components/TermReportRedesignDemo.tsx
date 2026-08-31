import React, { useMemo, useState } from 'react';
import {
  BookOpenCheck,
  Check,
  FileText,
  Footprints,
  MapPinned,
  Smartphone,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import PhoneMockup from './PhoneMockup';
import type { Student } from '../mobile-app/types';
import { teacherBrandCssVariables } from '../mobile-app/styles/teacherMobileTokens';
import TermReportView, {
  ReportBodyText,
  ReportCaption,
  ReportCard,
  ReportPageContainer,
  ReportSectionHeader,
  ReportTag,
  type TermReportAnchorItem,
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

const demoStudent: Student = {
  id: 'school-demo-li-yiyang',
  name: '李亦洋',
  gender: 'male',
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
  const [enabledModules, setEnabledModules] = useState<Record<CustomModuleId, boolean>>({
    'school-profile': true,
    'behavior-trace': true,
    'term-change': true,
    'school-achievement': true,
  });
  const [activeModuleId, setActiveModuleId] = useState<CustomModuleId | 'original'>('original');

  const additionalMobilePages = useMemo(
    () => createModulePages('mobile', enabledModules),
    [enabledModules],
  );
  const additionalA4Pages = useMemo(
    () => createModulePages('a4', enabledModules),
    [enabledModules],
  );
  const additionalMobileAnchorItems = useMemo<TermReportAnchorItem[]>(
    () => customModules
      .filter(module => enabledModules[module.id])
      .map(module => ({ id: `section-${module.id}`, label: module.label.replace('校本', '') })),
    [enabledModules],
  );

  const focusSection = (id: CustomModuleId | 'original') => {
    setActiveModuleId(id);
    const sectionId = id === 'original' ? 'section-growth' : `section-${id}`;
    requestAnimationFrame(() => {
      const scrollContainer = document.getElementById('report-scroll-container');
      const target = scrollContainer?.querySelector<HTMLElement>(`[id="${sectionId}"]`);
      if (!scrollContainer || !target) return;
      const targetTop = target.getBoundingClientRect().top
        - scrollContainer.getBoundingClientRect().top
        + scrollContainer.scrollTop;
      scrollContainer.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
    });
  };

  const toggleModule = (id: CustomModuleId) => {
    setEnabledModules(current => ({ ...current, [id]: !current[id] }));
    if (activeModuleId === id && enabledModules[id]) setActiveModuleId('original');
  };

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
            <button type="button" onClick={() => focusSection('original')} className={`flex min-h-14 w-full items-center justify-between rounded-md px-3 text-left ${activeModuleId === 'original' ? 'bg-red-50 text-red-700' : 'text-slate-700 hover:bg-slate-50'}`}>
              <span><span className="block text-sm font-semibold">原有报告</span><span className="mt-1 block text-[11px] text-slate-400">完整保留现有样式与交互</span></span>
              <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            </button>
            <div className="my-2 border-t border-slate-100" />
            {customModules.map(module => (
              <div key={module.id} className={`flex min-h-16 items-center rounded-md ${activeModuleId === module.id ? 'bg-red-50' : 'hover:bg-slate-50'}`}>
                <button type="button" onClick={() => enabledModules[module.id] && focusSection(module.id)} className="min-w-0 flex-1 px-3 py-2 text-left">
                  <span className={`block truncate text-sm font-semibold ${activeModuleId === module.id ? 'text-red-700' : 'text-slate-700'}`}>{module.label}</span>
                  <span className="mt-1 block text-[11px] text-slate-400">本次新增</span>
                </button>
                <button type="button" role="switch" aria-checked={enabledModules[module.id]} aria-label={`${enabledModules[module.id] ? '关闭' : '开启'}${module.label}`} onClick={() => toggleModule(module.id)} className={`relative mr-3 h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${enabledModules[module.id] ? 'bg-red-600' : 'bg-slate-300'}`}>
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${enabledModules[module.id] ? 'left-0.5 translate-x-4' : 'left-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
          <div className="mx-4 mt-2 border-t border-slate-100 pt-4">
            <div className="text-xs font-bold text-slate-700">原有内容</div>
            <div className="mt-3 space-y-2 text-xs text-slate-500">
              {['报告封面', '成长概览与学科结果', '总体评价', '未来成长建议', '学科详细报告'].map(item => (
                <div key={item} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-600" />{item}</div>
              ))}
            </div>
          </div>
        </aside>

        <section className={`min-h-0 bg-slate-100 ${previewMode === 'mobile' ? 'p-4 max-[720px]:p-2' : 'overflow-auto p-4'}`} aria-label={previewMode === 'mobile' ? '教师手机端报告预览' : 'A4报告预览'}>
          {previewMode === 'mobile' ? (
            <PhoneMockup showDeviceFrame contentTopInsetMode="status-bar">
              <TermReportView
                key="mobile-report"
                student={demoStudent}
                onBack={() => undefined}
                additionalMobilePages={additionalMobilePages}
                additionalA4Pages={additionalA4Pages}
                additionalMobileAnchorItems={additionalMobileAnchorItems}
                initialViewMode="mobile"
                showViewModeToggle={false}
              />
            </PhoneMockup>
          ) : (
            <div className="mx-auto h-full min-h-[620px] min-w-[794px] max-w-[920px] overflow-hidden shadow-sm">
              <TermReportView
                key="a4-report"
                student={demoStudent}
                onBack={() => undefined}
                additionalMobilePages={additionalMobilePages}
                additionalA4Pages={additionalA4Pages}
                additionalMobileAnchorItems={additionalMobileAnchorItems}
                initialViewMode="a4"
                showViewModeToggle={false}
              />
            </div>
          )}
        </section>

      </div>
    </main>
  );
};

export default TermReportRedesignDemo;
