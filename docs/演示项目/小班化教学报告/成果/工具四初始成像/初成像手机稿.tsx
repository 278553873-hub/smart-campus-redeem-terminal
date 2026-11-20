import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BookOpen, CalendarDays, ClipboardList, Flower2, HeartHandshake, Lightbulb, List, Pencil, Quote, ScanEye } from 'lucide-react';
import MobileBottomSheet from '../../../../../mobile-app/components/ui/MobileBottomSheet';
import MobileDatePickerSheet from '../../../../../mobile-app/components/ui/MobileDatePickerSheet';
import { mobileSheetActionClass } from '../../../../../mobile-app/components/ui/mobileSheetActionStyles';
import { teacherBrandCssVariables } from '../../../../../mobile-app/styles/teacherMobileTokens';
import { applyEditableChanges, clone, dateDisplay, dateInput, editorGroups, readField, restoreSaved, writeField } from './初成像编辑模型.mjs';

// iframe 不继承宿主的样式，独立手机稿直接读取同一份教师端令牌源。
if (typeof document !== 'undefined') {
  for (const [key, value] of Object.entries(teacherBrandCssVariables)) document.documentElement.style.setProperty(key, String(value));
}

type Report = any;
type EditorState = { section: string; draft: Report } | null;
const sectionIds = ['observations', 'card', 'five', 'three', 'light', 'watch', 'message'];
const icons = [ClipboardList, Quote, Flower2, Lightbulb, ScanEye, BookOpen, HeartHandshake];
const embedded: Report = typeof document === 'undefined' ? null : JSON.parse(document.getElementById('report-data')!.textContent!);

const text = (value: string) => value || '未填写';
function ReadText({ value, className = '' }: { value: string; className?: string }) {
  return <p className={`read-text ${className}${value ? '' : ' blank'}`}>{text(value)}</p>;
}
function Emphasis({ value }: { value: string }) {
  const [topic, ...body] = value.split('：');
  return body.length ? <><strong>{topic}：</strong>{body.join('：')}</> : <>{text(value)}</>;
}
function LightValue({ value }: { value: string }) {
  return <>{text(value).split(/(求真|从善|尚美|学活|乐健|悦群)/g).map((part, i) => /^(求真|从善|尚美|学活|乐健|悦群)$/.test(part) ? <strong key={i}>{part}</strong> : part)}</>;
}
function EditButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button type="button" className="edit-button" aria-label={`编辑${label}`} onClick={onClick}><Pencil size={14} aria-hidden="true" /><span>编辑</span></button>;
}

function ReportSection({ id, report, onEdit, children }: { id: string; report: Report; onEdit?: (id: string) => void; children: React.ReactNode }) {
  const Icon = icons[sectionIds.indexOf(id)];
  const full = report.labels.sections[id];
  const split = id === 'message' ? full.indexOf('（') : -1;
  return <section id={id} className={`report-section section-${id}`} aria-labelledby={`${id}-title`} tabIndex={-1}>
    <div className="section-header"><div className="section-heading"><Icon size={20} aria-hidden="true" />
      <h2 id={`${id}-title`}>{split >= 0 ? full.slice(0, split) : full}</h2></div>
      {onEdit && <EditButton label={full} onClick={() => onEdit(id)} />}
    </div>
    {split >= 0 && <p className="section-subtitle">{full.slice(split)}</p>}
    {children}
  </section>;
}

function Editor({ state, setState, onSave, onCancel }: { state: EditorState; setState: React.Dispatch<React.SetStateAction<EditorState>>; onSave: () => boolean; onCancel: () => void }) {
  const retained = useRef<EditorState>(null);
  if (state) retained.current = state;
  const current = state ?? retained.current;
  const [error, setError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const groups = current ? editorGroups(current.draft, current.section) : [];
  const title = current?.section === 'cover' ? '封面信息' : current?.section === 'message' ? '成像寄语' : groups[0]?.title || '编辑报告';
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
        {groups.map((group: any, i: number) => <div className="field-group" key={`${current!.section}-${i}`}>
          {groups.length > 1 && <h3 className="field-group-title">{group.title}</h3>}
          <div className="field-group-body">{group.fields.map((field: any) => {
            const id = `field-${field.path.join('-')}`;
            const value = readField(current!.draft, field.path);
            return <div className="field" key={id}><label htmlFor={id}>{field.label}</label>
              {field.type === 'textarea' ? <textarea id={id} rows={Math.min(8, Math.max(3, Math.ceil(value.length / 19)))} value={value} onChange={(event) => update(field.path, event.target.value)} />
                : field.type === 'date' ? <button id={id} type="button" className="date-field" onClick={() => setShowDatePicker(true)}>{value || '选择日期'}<CalendarDays size={16} aria-hidden="true" /></button>
                : <input id={id} type={field.type} value={value} onChange={(event) => update(field.path, event.target.value)} />}
            </div>;
          })}</div>
        </div>)}
        {error && <p className="field-error" role="alert">{error}</p>}
    </form>
  </MobileBottomSheet><MobileDatePickerSheet open={isOpen && showDatePicker} mode="single" title="成像日期" shape="subtle" value={current ? dateInput(current.draft.data.date) : ''} showTodayButton={false} onConfirm={(value) => update(['data', 'date'], dateDisplay(value))} onClose={() => setShowDatePicker(false)} /></>;
}

export function App({ source = embedded }: { source?: Report }) {
  const initial = source;
  const query = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search);
  const embeddedInTeacher = query?.get('embed') === 'teacher';
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
  function edit(section: string) {
    opener.current = document.activeElement as HTMLElement;
    if (directory.current) directory.current.open = false;
    setEditor({ section, draft: clone(report) });
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
        <nav aria-label="报告目录"><button type="button" onClick={() => jump('cover')}>封面</button>{sectionIds.map((id) => <button type="button" key={id} onClick={() => jump(id)}>{report.labels.sections[id].split('（')[0]}</button>)}</nav>
      </details></div>
    </div></header>
    <main id="report-main" className={`report${embeddedInTeacher ? ' embedded-report' : ''}`} tabIndex={-1}>
      <section id="cover" className="cover" aria-label="封面" tabIndex={-1}>
        <p className="cover-message">{report.meta.motto}</p>
        <div className="cover-titles"><p className="school">{report.meta.school}</p><h1>{report.meta.title}</h1><p className="cover-sources">{report.meta.sources}</p></div>
        <img className="cover-art" src={report.coverImage} width="1254" height="1254" alt="学生主题封面插画" />
        <div className="cover-bottom"><div><h2 className="student-name">{report.meta.name}</h2><p className="student-class">{d.class}</p><p className="student-date">成像日期：{d.date}</p></div><EditButton label="封面信息" onClick={() => edit('cover')} /></div>
      </section>
      <ReportSection id="observations" report={report}>
        <div className="observation-list">{d.matrix.map((row: any, i: number) => <article className="observation" key={i}>
          <div className="subsection-header"><h3><span className="item-index" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>{row.dim}</h3><EditButton label={row.dim} onClick={() => edit(`observations:${i}`)} /></div>
          <dl className="source-list">{['parent', 'child', 'teacher'].filter((key) => row[key]).map((key) => <div className="source-row" key={key}><dt>{report.labels.sources[key]}</dt><dd>{row[key]}</dd></div>)}</dl>
          <div className="judgment"><p className="judgment-label">初步判断</p><p className="read-text"><Emphasis value={row.insight} /></p></div>
        </article>)}</div>
      </ReportSection>
      <ReportSection id="card" report={report}>
        <div className="quote-groups">{['parent', 'child', 'teacher'].map((key) => <article key={key} className="quote-group"><div className="subsection-header"><h3>{report.labels.quotes[key]}</h3><EditButton label={report.labels.quotes[key]} onClick={() => edit(`card:${key}`)} /></div>
          {d.quotes[key].map((item: any, i: number) => <ReadText key={i} value={typeof item === 'string' ? item : `${item.context}${item.context ? '：' : ''}${item.quote}`} />)}
        </article>)}</div>
      </ReportSection>
      <ReportSection id="five" report={report}>
        <div className="dimension-list">{d.five.map(([label, content]: string[], i: number) => {
          const match = /^(.*?)（(.*)）$/.exec(label);
          return <article key={i} className="dimension"><div className="dimension-symbol" aria-hidden="true">{match?.[1] || label}</div><div><div className="subsection-header"><h3>{match?.[2] || label}</h3><EditButton label={label} onClick={() => edit(`five:${i}`)} /></div><ReadText value={content} /></div></article>;
        })}</div>
      </ReportSection>
      <ReportSection id="three" report={report}>
        <div className="ability-list">{d.three.map(([label, content]: string[], i: number) => <article key={i} className="ability"><div className="subsection-header"><h3>{label}</h3><EditButton label={label} onClick={() => edit(`three:${i}`)} /></div><ReadText value={content} /></article>)}</div>
      </ReportSection>
      <ReportSection id="light" report={report}>
        <dl className="light-list">{['want', 'strong', 'parent', 'teacher'].map((key) => <div key={key} className="light-item"><dt className="subsection-header"><span>{report.labels.light[key].replace(/：$/, '')}</span><EditButton label={report.labels.light[key]} onClick={() => edit(`light:${key}`)} /></dt><dd><LightValue value={d.light[key]} /></dd></div>)}</dl>
        <article className="synthesis"><div className="subsection-header"><h3>{report.labels.synthesis.replace(/：$/, '')}</h3><EditButton label="交汇建议" onClick={() => edit('light:synthesis')} /></div><ReadText value={d.light.synthesis} /><p className="synthesis-note">{report.labels.lightNote}</p></article>
      </ReportSection>
      <ReportSection id="watch" report={report}>
        <p className="section-intro">{report.labels.watchHelp}</p><div className="watch-list">{d.watch.map((item: any, i: number) => <article key={i} className="watch-item"><span className="watch-number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><div><div className="subsection-header"><h3>{item.title}</h3><EditButton label={item.title} onClick={() => edit(`watch:${i}`)} /></div><ReadText value={item.text} /></div></article>)}</div>
      </ReportSection>
      <ReportSection id="message" report={report} onEdit={edit}>
        <div className="message-box"><p>这个孩子最让我印象深刻的三个特质是：<br /><span className="traits">{d.message.traits.map((trait: string, i: number) => <span key={i}>{['①', '②', '③'][i]}<span className="filled-answer">{text(trait)}</span></span>)}</span></p>
          <p>他/她来到我们面前时，最需要被理解的是：<br /><span className="filled-answer">{text(d.message.need)}</span></p>
          <p>我对接下来的陪伴，想先从<br /><span className="filled-answer">{text(d.message.begin)}</span>开始留意。</p></div>
      </ReportSection>
    </main>
    <div id="teacher-mobile-overlay-root" className="report-overlay-root" />
    <Editor state={editor} setState={setEditor} onSave={save} onCancel={closeEditor} />
    <div className={`toast${notice ? ' visible' : ''}`} role="status" aria-live="polite">{notice}</div>
  </>;
}

if (typeof document !== 'undefined') createRoot(document.getElementById('root')!).render(<App />);
