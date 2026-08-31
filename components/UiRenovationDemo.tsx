import React, { lazy, Suspense, useState } from 'react';

const TermReportRedesignDemo = lazy(() => import('./TermReportRedesignDemo'));

const renovationDemos = [
  {
    id: 'gradient',
    label: '渐变背景',
    src: '/demos/gradient-background-exploration.html',
    title: 'UI改造：手机端渐变背景方案',
  },
  {
    id: 'login-icon',
    label: '登录 Icon',
    src: '/demos/teacher-login-icon-inventory.html',
    title: 'UI改造：教师端登录 Icon 方案',
  },
  {
    id: 'tabs',
    label: 'Tab切换',
    src: '/demos/tab-switch-exploration.html',
    title: 'UI改造：教师手机端切换控件盘点',
  },
  {
    id: 'colors',
    label: '颜色系统',
    src: '/demos/color-system-inventory.html',
    title: 'UI改造：教师手机端颜色系统盘点',
  },
  {
    id: 'typography',
    label: '字体系统',
    src: '/demos/typography-system-inventory.html',
    title: 'UI改造：教师手机端字体系统盘点',
  },
  {
    id: 'radius',
    label: '圆角',
    src: '/demos/radius-inventory.html',
    title: 'UI改造：教师手机端圆角盘点',
  },
  {
    id: 'buttons',
    label: '按钮样式',
    src: '/demos/button-style-inventory.html',
    title: 'UI改造：教师手机端按钮样式盘点',
  },
  {
    id: 'modals',
    label: '弹窗样式',
    src: '/demos/modal-style-inventory.html',
    title: 'UI改造：教师手机端弹窗样式盘点',
  },
  {
    id: 'term-report',
    label: '期末报告新样式',
    title: 'UI改造：学生期末成长报告新样式',
  },
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  src?: string;
  title: string;
}>;

type RenovationDemoId = (typeof renovationDemos)[number]['id'];

const UiRenovationDemo: React.FC = () => {
  const [activeDemoId, setActiveDemoId] = useState<RenovationDemoId>('gradient');
  const activeDemo = renovationDemos.find(demo => demo.id === activeDemoId) ?? renovationDemos[0];

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();

    const offset = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = (index + offset + renovationDemos.length) % renovationDemos.length;
    const nextDemo = renovationDemos[nextIndex];
    setActiveDemoId(nextDemo.id);
    event.currentTarget.parentElement
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [nextIndex]?.focus();
  };

  return (
    <main className="flex h-dvh w-full flex-col overflow-hidden bg-slate-50">
      <header className="relative flex h-14 shrink-0 items-center justify-center border-b border-slate-200 bg-white px-4">
        <h1 className="absolute left-5 text-sm font-semibold text-slate-900 max-[520px]:sr-only">
          UI改造
        </h1>
        <nav
          className="flex h-full max-w-full items-stretch overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="UI改造方案"
        >
          {renovationDemos.map((demo, index) => {
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
                className={`relative min-w-24 shrink-0 px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500 ${
                  isActive ? 'text-red-600' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {demo.label}
                {isActive && <span className="absolute inset-x-4 bottom-0 h-0.5 bg-red-600" aria-hidden="true" />}
              </button>
            );
          })}
        </nav>
      </header>

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
