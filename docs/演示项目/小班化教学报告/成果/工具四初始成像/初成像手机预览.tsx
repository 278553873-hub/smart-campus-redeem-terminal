import React from 'react';
import { createRoot } from 'react-dom/client';
import PhoneMockup from '../../../../../components/PhoneMockup';

const content = JSON.parse(document.getElementById('preview-content')!.textContent!);
createRoot(document.getElementById('root')!).render(
  <main className="preview-shell">
    <header className="preview-header"><h1>教师 · 手机端</h1><a href={content.href} target="_blank" rel="noopener">打开手机阅读版</a></header>
    <div className="preview-device">
      <PhoneMockup showDeviceFrame hideCapsule contentTopInsetMode="status-bar">
        <iframe title="可编辑的学生初成像报告" srcDoc={content.html} className="report-frame" />
      </PhoneMockup>
    </div>
  </main>,
);
