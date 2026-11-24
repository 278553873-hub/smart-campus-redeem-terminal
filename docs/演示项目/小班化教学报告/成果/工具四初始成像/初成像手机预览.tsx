import React from 'react';
import { createRoot } from 'react-dom/client';
import PhoneMockup from '../../../../../components/PhoneMockup';
import { teacherBrandCssVariables } from '../../../../../mobile-app/styles/teacherMobileTokens';

const content = JSON.parse(document.getElementById('preview-content')!.textContent!);
createRoot(document.getElementById('root')!).render(
  <main className="preview-shell" style={teacherBrandCssVariables as React.CSSProperties}>
    <header className="preview-header"><h1>教师 · 手机端</h1><a href={content.href} target="_blank" rel="noopener">打开手机阅读版</a></header>
    <div className="preview-device">
      <PhoneMockup showDeviceFrame contentTopInsetMode="status-bar">
        <div className="preview-page-title">学生初成像</div>
        <iframe title="学生初成像报告正文" data-report-embed="teacher" srcDoc={content.html} className="report-frame" />
      </PhoneMockup>
    </div>
  </main>,
);
