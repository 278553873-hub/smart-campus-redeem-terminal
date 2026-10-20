import React, { useEffect, useState } from 'react';
import MobilePageHeader from '../components/ui/MobilePageHeader';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import MobileToast from '../components/ui/MobileToast';
import { SwitchControl } from './MeFeatureViews';
import SchoolCoverSettings, { type SchoolCoverDraft } from '../components/term-report/SchoolCoverSettings';
import { getTeacherSchoolGradeOptions, getTeacherSpaceMenuPolicy, type TeacherSpaceOption } from '../domain/teacherSpaceAccess';
import CoverPreview from '../components/term-report/CoverPreview';
import { simplifyReportAppearance, type ReportAppearance } from '../domain/termReportAppearance';
import { readReportAppearance, saveReportAppearance } from '../services/termReportAppearanceStore';
import '../components/term-report/reportManagement.css';

export default function ReportManagementView({ currentSpace, onBack }: { currentSpace: TeacherSpaceOption; onBack: () => void }) {
  const [config, setConfig] = useState(() => simplifyReportAppearance(readReportAppearance(currentSpace.id, currentSpace.title)));
  const [schoolDraft, setSchoolDraft] = useState<SchoolCoverDraft | null>(null);
  const [schoolBusy, setSchoolBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [discard, setDiscard] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [undo, setUndo] = useState<ReportAppearance | null>(null);
  const back = () => {
    if (schoolBusy) return;
    if (editing) {
      if (schoolDraft) setDiscard(true); else setEditing(false);
    } else onBack();
  };
  const grade = getTeacherSchoolGradeOptions(currentSpace)?.[0] ?? '一年级';
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(''), 2400); return () => window.clearTimeout(timer); }, [toast]);
  const save = () => {
    if (!schoolDraft || schoolBusy) return;
    try {
      const saved = saveReportAppearance(currentSpace.id, { ...config, ...schoolDraft, schoolName: currentSpace.title });
      setUndo(config); setConfig(saved); setSchoolDraft(null); setError(''); setToast('已保存'); setEditing(false);
    } catch (cause) { setError((cause as Error).message); }
  };
  const undoLastChange = () => {
    if (!undo || schoolBusy) return;
    try { setConfig(saveReportAppearance(currentSpace.id, undo)); setUndo(null); setToast('已撤销上次修改'); setError(''); }
    catch (cause) { setError((cause as Error).message); }
  };
  const allowed = currentSpace.type === 'school' && getTeacherSpaceMenuPolicy(currentSpace).moreTools.includes('reportManagement');
  if (!allowed) return <div className="report-management"><MobilePageHeader title="报告配置" onBack={onBack} /><p className="p-5 text-sm">请切换到有报告配置权限的学校空间。</p></div>;
  return <div className="report-management">
    <MobilePageHeader title={editing ? '编辑封面' : '报告配置'} onBack={back} />
    <div className={`report-management__body ${config.enabled ? 'report-management__body--workspace' : ''}`}>
      {!editing && <section className="report-management__surface !py-2">
        <div className="flex min-h-12 items-center justify-between gap-3"><span className="font-semibold">个性化封面配置</span><SwitchControl checked={config.enabled} label="个性化封面配置" onChange={enabled => {
          if (schoolBusy) return;
          try { setConfig(saveReportAppearance(currentSpace.id, { ...config, enabled })); setError(''); } catch (cause) { setError((cause as Error).message); }
        }} /></div>
      </section>}
      {config.enabled && (editing
        ? <SchoolCoverSettings config={{ ...config, schoolName: currentSpace.title }} draft={schoolDraft} grade={grade} onSave={save} saveError={error} onChange={next => { setSchoolDraft(next); setError(''); }} onBusyChange={setSchoolBusy} onUndo={undo && !schoolDraft ? undoLastChange : undefined} />
        : <section className="school-cover-workspace school-cover-overview" aria-label="封面预览">
          <CoverPreview fit config={config} style={config.defaultCover} grade={grade} gender="male" overlay={<button className="school-cover-overview__edit" onClick={() => { setError(''); setEditing(true); }}>编辑封面</button>} />
        </section>)}
      {error && !editing && <p role="alert" className="report-management__error">{error}</p>}
    </div>
    <MobileToast message={toast} />
    {discard && <MobileBottomSheet open title="放弃未保存的修改？" onClose={() => setDiscard(false)} footer={<div className="flex gap-3"><button className="report-management__button flex-1" onClick={() => setDiscard(false)}>继续编辑</button><button className="report-management__button flex-1" onClick={() => { setSchoolDraft(null); setError(''); setDiscard(false); setEditing(false); }}>放弃修改</button></div>}>{null}</MobileBottomSheet>}
  </div>;
}
