import React, { useState } from 'react';
import TeacherLoginView from './UiRenovationTeacherLoginView';
import PhoneMockup from './PhoneMockup';

const PublicLoginDemo: React.FC = () => {
  const [previewVersion, setPreviewVersion] = useState(0);
  const [loginComplete, setLoginComplete] = useState(false);

  const resetPreview = () => {
    setLoginComplete(false);
    setPreviewVersion(version => version + 1);
  };

  return (
    <section className="flex h-full min-h-0 flex-col" aria-label="登录页预览">
      <header className="flex min-h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6">
        <h2 className="text-sm font-semibold text-slate-900">登录页</h2>
        <div className="flex items-center gap-4">
          <span role="status" className="text-sm font-medium text-[var(--tm-status-positive-strong)]">
            {loginComplete ? '登录成功' : ''}
          </span>
          <button
            type="button"
            onClick={resetPreview}
            className="flex min-h-11 items-center rounded-[var(--tm-radius-control)] px-3 text-sm font-semibold text-[var(--tm-brand-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
          >
            重新预览
          </button>
        </div>
      </header>
      <div className="teacher-mobile-app min-h-0 flex-1 bg-white p-4">
        <PhoneMockup showDeviceFrame contentTopInsetMode="none" screenOverlayRootId="teacher-mobile-overlay-root">
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--tm-bg-surface)]">
            <TeacherLoginView
              key={previewVersion}
              onLogin={() => {
                setLoginComplete(true);
                setPreviewVersion(version => version + 1);
              }}
            />
          </div>
        </PhoneMockup>
      </div>
    </section>
  );
};

export default PublicLoginDemo;
