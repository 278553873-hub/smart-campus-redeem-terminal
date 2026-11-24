import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BookOpen, CalendarDays, ClipboardList, Flower2, Lightbulb, List, Pencil, Quote, ScanEye } from 'lucide-react';
import MobileBottomSheet from '../../../../../mobile-app/components/ui/MobileBottomSheet';
import { MobileCard } from '../../../../../mobile-app/components/ui/MobileCard';
import MobileDatePickerSheet from '../../../../../mobile-app/components/ui/MobileDatePickerSheet';
import { mobileSheetActionClass } from '../../../../../mobile-app/components/ui/mobileSheetActionStyles';
import { teacherBrandCssVariables } from '../../../../../mobile-app/styles/teacherMobileTokens';
import { applyEditableChanges, clone, dateDisplay, dateInput, editorGroups, readField, restoreSaved, writeField } from './初成像编辑模型.mjs';
import { cardAppearanceAttributes, defaultReportAppearance, reportSectionIds } from './初成像样式';
import type { ReportAppearance, ReportCardId, ReportSectionId } from './初成像样式';

// iframe 不继承宿主的样式，独立手机稿直接读取同一份教师端令牌源。
if (typeof document !== 'undefined') {
  for (const [key, value] of Object.entries(teacherBrandCssVariables)) document.documentElement.style.setProperty(key, String(value));
}

type Report = any;
type EditorState = { section: ReportCardId; draft: Report; groupIndex: number } | null;
const sectionIcons = { observations: ClipboardList, card: Quote, five: Flower2, three: Lightbulb, light: ScanEye, watch: BookOpen };
const sourceKeys = ['parent', 'child', 'teacher'];
const lightKeys = ['want', 'strong', 'parent', 'teacher'];
const embedded: Report = typeof document === 'undefined' ? null : JSON.parse(document.getElementById('report-data')!.textContent!);

const text = (value: string) => value || '未填写';
function ReadText({ value }: { value: string }) {
  return <p className={`read-text${value ? '' : ' blank'}`}>{text(value)}</p>;
}
function Emphasis({ value }: { value: string }) {
  const [topic, ...body] = value.split('：');
  return body.length ? <><strong>{topic}：</strong>{body.join('：')}</> : <>{text(value)}</>;
}
function EditButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button type="button" className="edit-button" aria-label={`编辑${label}`} onClick={onClick}><Pencil size={14} aria-hidden="true" /><span>编辑</span></button>;
}

function ReportCard({ id, title, appearance, onEdit, children }: {
  id: ReportSectionId; title: string; appearance: ReportAppearance; onEdit: (id: ReportSectionId) => void; children: React.ReactNode;
}) {
  const Icon = id === 'message' ? null : sectionIcons[id];
  return <section id={id} className="report-section" aria-labelledby={`${id}-title`} tabIndex={-1} {...cardAppearanceAttributes(appearance, id)}>
    <MobileCard shape="subtle" padding="none" className="report-card">
      <header className="card-heading">
        <div className="card-title">
          {Icon && <Icon size={18} aria-hidden="true" />}
          <h2 id={`${id}-title`}>{title}</h2>
        </div>
        <EditButton label={title} onClick={() => onEdit(id)} />
      </header>
      <div className="card-values">{children}</div>
    </MobileCard>
  </section>;
}

function ContentGroup({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return <div className={`content-group ${className}`}>
    <h3>{title}</h3>
    {children}
  </div>;
}

function Editor({ state, setState, onSave, onCancel }: { state: EditorState; setState: React.Dispatch<React.SetStateAction<EditorState>>; onSave: () => boolean; onCancel: () => void }) {
  const retained = useRef<EditorState>(null);
  if (state) retained.current = state;
  const current = state ?? retained.current;
  const [error, setError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const groups = current ? editorGroups(current.draft, current.section) : [];
  const title = current?.section === 'cover' ? '封面信息' : current?.draft.labels.sections[current.section]?.split('（')[0] || '编辑报告';
  const showGroupPicker = current?.section === 'observations' && groups.length > 1;
  const visibleGroups = showGroupPicker ? [groups[current.groupIndex]] : groups;
  const isOpen = state !== null;
  useEffect(() => {
    setError('');
    if (!isOpen) return;
    const scroll = window.scrollY;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; window.scrollTo(0, scroll); };
  }, [isOpen]);
  const update = (path: Array<string | number>, value: string) => { setError(''); setState((current) => current ? { ...current, draft: writeField(current.draft, path, value) } : null); };
  return <><MobileBottomSheet open={isOpen && !showDatePicker} title={title} onClose={onCancel} showHandle={false} footer={
    <div className="editor-actions"><button type="button" className={`${mobileSheetActionClass} secondary-button`} onClick={onCancel}>取消</button><button type="submit" form="report-editor-form" className={`${mobileSheetActionClass} primary-button`}>保存修改</button></div>
  }>
    <form id="report-editor-form" className="editor-fields" onSubmit={(event) => {
      event.preventDefault();
      if (!state?.draft.meta.name.trim()) { setError('请填写学生姓名。'); return; }
      if (!onSave()) setError('保存失败，请重试；修改仍保留在编辑框中。');
    }}>
        {showGroupPicker && (
          <div className="field editor-group-picker">
            <label htmlFor="report-observation-group">观察主题</label>
            <select id="report-observation-group" value={current.groupIndex} onChange={(event) => {
              const groupIndex = Number(event.currentTarget.value);
              setState((value) => value ? { ...value, groupIndex } : value);
            }}>
              {groups.map((group, i) => <option key={group.title} value={i}>{group.title}</option>)}
            </select>
          </div>
        )}
        {visibleGroups.map((group, i) => <fieldset className="field-group" key={`${current!.section}-${showGroupPicker ? current!.groupIndex : i}`}>
          {!showGroupPicker && groups.length > 1 && <legend className="field-group-title">{group.title}</legend>}
          <div className="field-group-body">{group.fields.map((field: any) => {
            const id = `field-${field.path.join('-')}`;
            const value = readField(current!.draft, field.path);
            return <div className="field" key={id}><label htmlFor={id}>{field.label}</label>
              {field.type === 'textarea' ? <textarea id={id} rows={Math.min(8, Math.max(3, Math.ceil(value.length / 19)))} value={value} onChange={(event) => update(field.path, event.target.value)} />
                : field.type === 'date' ? <button id={id} type="button" className="date-field" onClick={() => setShowDatePicker(true)}>{value || '选择日期'}<CalendarDays size={16} aria-hidden="true" /></button>
                : <input id={id} type={field.type} value={value} onChange={(event) => update(field.path, event.target.value)} />}
            </div>;
          })}</div>
        </fieldset>)}
        {error && <p className="field-error" role="alert">{error}</p>}
    </form>
  </MobileBottomSheet><MobileDatePickerSheet open={isOpen && showDatePicker} mode="single" title="成像日期" shape="subtle" value={current ? dateInput(current.draft.data.date) : ''} showTodayButton={false} onConfirm={(value) => update(['data', 'date'], dateDisplay(value))} onClose={() => setShowDatePicker(false)} /></>;
}

export function App({ source = embedded, appearance = defaultReportAppearance }: { source?: Report; appearance?: ReportAppearance }) {
  const initial = source;
  const query = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search);
  const embeddedInTeacher = query?.get('embed') === 'teacher'
    || (typeof window !== 'undefined' && window.frameElement?.getAttribute('data-report-embed') === 'teacher');
  const storageId = query?.get('scope') ? `${initial.storageId}:${query.get('scope')}` : initial.storageId;
  const [report, setReport] = useState<Report>(() => {
    try { return restoreSaved(initial, localStorage.getItem(storageId)); } catch { return initial; }
  });
  const [editor, setEditor] = useState<EditorState>(null);
  const [notice, setNotice] = useState('');
  const directory = useRef<HTMLDetailsElement>(null);
  const topbar = useRef<HTMLElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const d = report.data;
  const titles = report.labels.sections;
  const mottoStart = titles.message.indexOf('（');
  const messageTitle = mottoStart < 0 ? titles.message : titles.message.slice(0, mottoStart);
  const messageSubtitle = mottoStart < 0 ? '' : titles.message.slice(mottoStart);
  useEffect(() => { document.title = `${report.meta.name}｜${report.meta.title}`; }, [report.meta.name, report.meta.title]);
  useEffect(() => {
    const update = () => document.documentElement.style.setProperty('--header-height', `${topbar.current?.offsetHeight ?? 64}px`);
    update();
    const observer = new ResizeObserver(update);
    if (topbar.current) observer.observe(topbar.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const closeMenus = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && event.key !== 'Escape') return;
      [directory.current].forEach((element) => {
        if (!element?.open || (event instanceof MouseEvent && element.contains(event.target as Node))) return;
        element.open = false;
        if (event instanceof KeyboardEvent) element.querySelector('summary')?.focus({ preventScroll: true });
      });
    };
    document.addEventListener('click', closeMenus);
    document.addEventListener('keydown', closeMenus);
    return () => { document.removeEventListener('click', closeMenus); document.removeEventListener('keydown', closeMenus); clearTimeout(noticeTimer.current); };
  }, []);
  function notify(value: string) { clearTimeout(noticeTimer.current); setNotice(value); noticeTimer.current = setTimeout(() => setNotice(''), 4200); }
  function persist(next: Report) {
    try {
      localStorage.setItem(storageId, JSON.stringify({ revision: initial.revision, savedAt: Date.now(), report: next }));
      setReport(next);
      notify('已保存到当前浏览器');
      return true;
    } catch { return false; }
  }
  function edit(section: ReportCardId) {
    opener.current = document.activeElement as HTMLElement;
    if (directory.current) directory.current.open = false;
    setEditor({ section, draft: clone(report), groupIndex: 0 });
  }
  function closeEditor() { setEditor(null); requestAnimationFrame(() => opener.current?.focus({ preventScroll: true })); }
  function save() {
    if (!persist(applyEditableChanges(initial, editor!.draft))) return false;
    closeEditor();
    return true;
  }
  function jump(id: string) {
    if (directory.current) directory.current.open = false;
    requestAnimationFrame(() => { const target = document.getElementById(id); target?.scrollIntoView({ block: 'start' }); target?.focus({ preventScroll: true }); });
  }
  return <>
    <a href="#report-main" className="skip-link">跳至报告正文</a>
    <header ref={topbar} className={`topbar${embeddedInTeacher ? ' embedded-topbar' : ''}`}><div className="topbar-inner"><span className="bar-title">{report.meta.name} · {report.meta.title}</span>
      <div className="bar-actions"><details ref={directory} className="popover directory"><summary aria-label="报告目录"><List size={19} aria-hidden="true" /></summary>
        <nav aria-label="报告目录"><button type="button" onClick={() => jump('cover')}>封面</button>{reportSectionIds.map((id) => <button type="button" key={id} onClick={() => jump(id)}>{titles[id].split('（')[0]}</button>)}</nav>
      </details></div>
    </div></header>
    <div className="report-page" data-page-texture={appearance.pageTexture}>
      <main id="report-main" className="report" tabIndex={-1}>
        <section id="cover" className="cover" aria-label="封面" tabIndex={-1} {...cardAppearanceAttributes(appearance, 'cover')}>
          <MobileCard shape="subtle" padding="none" className="cover-card">
            <p className="cover-message">{report.meta.motto}</p>
            <div className="cover-titles">
              <p className="school">{report.meta.school}</p>
              <h1>{report.meta.title}</h1>
              <p className="cover-sources">{report.meta.sources}</p>
            </div>
            <img className="cover-art" src={report.coverImage} width="1254" height="1254" alt="学生主题封面插画" />
            <div className="cover-details">
              <h2 className="student-name">{report.meta.name}</h2>
              <p className="student-class">{d.class}</p>
              <p className="student-date">成像日期：{d.date}</p>
            </div>
            <EditButton label="封面信息" onClick={() => edit('cover')} />
          </MobileCard>
        </section>
        <ReportCard id="observations" title={titles.observations} appearance={appearance} onEdit={edit}>
          {d.matrix.map((row: any) => (
            <ContentGroup key={row.dim} title={row.dim} className="observation-group">
              <dl className="details-list">
                {sourceKeys.filter((key) => row[key]).map((key) => (
                  <div key={key}><dt>{report.labels.sources[key]}</dt><dd>{row[key]}</dd></div>
                ))}
                <div className="judgment"><dt>初步判断</dt><dd><Emphasis value={row.insight} /></dd></div>
              </dl>
            </ContentGroup>
          ))}
        </ReportCard>
        <ReportCard id="card" title={titles.card} appearance={appearance} onEdit={edit}>
          {sourceKeys.map((key) => (
            <ContentGroup key={key} title={report.labels.quotes[key]}>
              {d.quotes[key].map((item: any, i: number) => (
                <ReadText key={i} value={typeof item === 'string' ? item : item.context ? `${item.context}：${item.quote}` : item.quote} />
              ))}
            </ContentGroup>
          ))}
        </ReportCard>
        {(['five', 'three'] as const).map((id) => (
          <ReportCard key={id} id={id} title={titles[id]} appearance={appearance} onEdit={edit}>
            {d[id].map(([label, content]: string[]) => (
              <ContentGroup key={label} title={label}>
                <ReadText value={content} />
              </ContentGroup>
            ))}
          </ReportCard>
        ))}
        <ReportCard id="light" title={titles.light} appearance={appearance} onEdit={edit}>
          <dl className="light-directions">
            {lightKeys.map((key) => (
              <div key={key}>
                <dt>{report.labels.light[key].replace(/：$/, '')}</dt>
                <dd>{text(d.light[key])}</dd>
              </div>
            ))}
          </dl>
          <ContentGroup title={report.labels.synthesis.replace(/：$/, '')} className="synthesis">
            <ReadText value={d.light.synthesis} />
            <p className="card-note">{report.labels.lightNote}</p>
          </ContentGroup>
        </ReportCard>
        <ReportCard id="watch" title={titles.watch} appearance={appearance} onEdit={edit}>
          <p className="card-note">{report.labels.watchHelp}</p>
          {d.watch.map((item: any, i: number) => (
            <ContentGroup key={i} title={item.title}>
              <ReadText value={item.text} />
            </ContentGroup>
          ))}
        </ReportCard>
        <ReportCard id="message" title={messageTitle} appearance={appearance} onEdit={edit}>
          {messageSubtitle && <p className="card-note">{messageSubtitle}</p>}
          <div className="message-box">
            <p>这个孩子最让我印象深刻的三个特质是：<br /><span className="traits">{d.message.traits.map((trait: string, i: number) => <span key={i}>{['①', '②', '③'][i]}<span className="filled-answer">{text(trait)}</span></span>)}</span></p>
            <p>他/她来到我们面前时，最需要被理解的是：<br /><span className="filled-answer">{text(d.message.need)}</span></p>
            <p>我对接下来的陪伴，想先从<br /><span className="filled-answer">{text(d.message.begin)}</span>开始留意。</p>
          </div>
        </ReportCard>
      </main>
    </div>
    <div id="teacher-mobile-overlay-root" className="report-overlay-root" />
    <Editor state={editor} setState={setEditor} onSave={save} onCancel={closeEditor} />
    <div className={`toast${notice ? ' visible' : ''}`} role="status" aria-live="polite">{notice}</div>
  </>;
}

if (typeof document !== 'undefined') createRoot(document.getElementById('root')!).render(<App />);
