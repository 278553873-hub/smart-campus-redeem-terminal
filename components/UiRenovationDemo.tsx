import React, { lazy, Suspense, useState } from 'react';

const TermReportRedesignDemo = lazy(() => import('./TermReportRedesignDemo'));

const renovationDemos = [
  {
    id: 'gradient',
    label: '渐变背景',
    section: 'showcase',
    src: '/demos/gradient-background-exploration.html',
    title: 'UI改造：手机端渐变背景方案',
  },
  {
    id: 'login-icon',
    label: '登录 Icon',
    section: 'showcase',
    src: '/demos/teacher-login-icon-inventory.html',
    title: 'UI改造：教师端登录 Icon 方案',
  },
  {
    id: 'tabs',
    label: 'Tab切换',
    section: 'inventory',
    src: '/demos/tab-switch-exploration.html',
    title: 'UI改造：教师手机端切换控件盘点',
  },
  {
    id: 'colors',
    label: '颜色系统',
    section: 'inventory',
    src: '/demos/color-system-inventory.html',
    title: 'UI改造：教师手机端颜色系统盘点',
  },
  {
    id: 'typography',
    label: '字体系统',
    section: 'inventory',
    src: '/demos/typography-system-inventory.html',
    title: 'UI改造：教师手机端字体系统盘点',
  },
  {
    id: 'radius',
    label: '圆角',
    section: 'inventory',
    src: '/demos/radius-inventory.html',
    title: 'UI改造：教师手机端圆角盘点',
  },
  {
    id: 'buttons',
    label: '按钮样式',
    section: 'inventory',
    src: '/demos/button-style-inventory.html',
    title: 'UI改造：教师手机端按钮样式盘点',
  },
  {
    id: 'modals',
    label: '弹窗样式',
    section: 'inventory',
    src: '/demos/modal-style-inventory.html',
    title: 'UI改造：教师手机端弹窗样式盘点',
  },
  {
    id: 'components',
    label: '组件与复用',
    section: 'inventory',
    src: '/demos/component-reuse-inventory.html',
    title: 'UI改造：教师手机端组件与复用盘点',
  },
  {
    id: 'term-report',
    label: '期末报告新样式',
    section: 'showcase',
    title: 'UI改造：学生期末成长报告新样式',
  },
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  section: 'showcase' | 'inventory';
  src?: string;
  title: string;
}>;

type RenovationDemoId = (typeof renovationDemos)[number]['id'];
type RenovationSectionId = 'showcase' | 'inventory';

const renovationSections: ReadonlyArray<{ id: RenovationSectionId; label: string }> = [
  { id: 'showcase', label: '方案展示' },
  { id: 'inventory', label: '盘点报告' },
];

const UiRenovationDemo: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState<RenovationSectionId>('showcase');
  const [activeDemoId, setActiveDemoId] = useState<RenovationDemoId>('gradient');
  const activeDemo = renovationDemos.find(demo => demo.id === activeDemoId) ?? renovationDemos[0];
  const activeDemos = renovationDemos.filter(demo => demo.section === activeSectionId);

  const handleSectionChange = (sectionId: RenovationSectionId) => {
    setActiveSectionId(sectionId);
    const firstDemo = renovationDemos.find(demo => demo.section === sectionId);
    if (firstDemo) setActiveDemoId(firstDemo.id);
  };

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();

    const offset = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = (index + offset + activeDemos.length) % activeDemos.length;
    const nextDemo = activeDemos[nextIndex];
    setActiveDemoId(nextDemo.id);
    event.currentTarget.parentElement
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [nextIndex]?.focus();
  };

  return (
    <main className="flex h-dvh w-full flex-col overflow-hidden bg-slate-50 text-slate-900">
      <header className="flex h-16 shrink-0 items-center border-b border-slate-200 bg-white px-4">
        <div className="flex min-w-0 flex-1 items-center gap-8">
          <h1 className="shrink-0 text-sm font-semibold text-slate-900 max-[520px]:hidden">UI改造</h1>
          <nav className="flex h-full items-stretch gap-1" role="tablist" aria-label="UI改造工作区">
            {renovationSections.map(section => {
              const isActive = section.id === activeSectionId;
              return (
                <button
                  key={section.id}
                  id={`renovation-section-${section.id}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="renovation-demo-panel"
                  onClick={() => handleSectionChange(section.id)}
                  className={`relative min-w-24 px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500 ${
                    isActive ? 'text-red-600' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {section.label}
                  {isActive && <span className="absolute inset-x-3 bottom-0 h-0.5 bg-red-600" aria-hidden="true" />}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="flex h-12 shrink-0 items-center border-b border-slate-200 bg-white px-4">
        <nav
          className="flex h-full max-w-full items-stretch gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label={`${renovationSections.find(section => section.id === activeSectionId)?.label ?? ''}分类`}
        >
          {activeDemos.map((demo, index) => {
            const isActive = demo.id === activeDemoId;
            return (
              <button
                key={demo.id}
                id={`renovation-tab-${demo.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls="renovation-demo-panel"
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveDemoId(demo.id)}
                onKeyDown={event => handleTabKeyDown(event, index)}
                className={`relative min-w-24 shrink-0 px-4 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500 ${
                  isActive ? 'text-red-600' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {demo.label}
                {isActive && <span className="absolute inset-x-4 bottom-0 h-0.5 bg-red-600" aria-hidden="true" />}
              </button>
            );
          })}
        </nav>
      </div>

      <section
        id="renovation-demo-panel"
        role="tabpanel"
        aria-labelledby={`renovation-tab-${activeDemo.id}`}
        className="min-h-0 flex-1"
      >
        {activeDemo.id === 'term-report' ? (
          <Suspense fallback={<div className="grid h-full place-items-center text-sm text-slate-500">正在加载报告方案...</div>}>
            <TermReportRedesignDemo />
          </Suspense>
        ) : (
          <iframe
            key={activeDemo.id}
            className="h-full w-full border-0"
            src={activeDemo.src}
            title={activeDemo.title}
          />
        )}
      </section>
    </main>
  );
};

export default UiRenovationDemo;
