import React, { useId, useRef } from 'react';
import type { ScreenInsightDigest } from './studentEvaluationScreenInsights';
import './aiEducationInsights.css';

export const AiEducationInsights = ({ digest, active = 0, onSelect, onFocusChange }: {
  digest: ScreenInsightDigest; active?: number; page?: number; onSelect?: (index: number) => void; onFocusChange?: (focused: boolean) => void;
}) => {
  const id = `demo-insights-${useId().replace(/:/g, '')}`;
  const selected = Math.max(0, active) % Math.max(1, digest.insights.length);
  const insight = digest.insights[selected];
  const topics = useRef<Array<HTMLButtonElement | null>>([]);
  return <aside className="demo-evaluation-screen-panel demo-insight-panel" aria-labelledby={`${id}-heading`}
    onFocusCapture={() => onFocusChange?.(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) onFocusChange?.(false); }}>
    <div className="demo-insight-header">
      <div className="demo-insight-identity">
        <span className="demo-insight-ai-mark" aria-hidden="true">AI</span>
        <h2 id={`${id}-heading`} aria-label="AI 育人分析">育人分析</h2>
      </div>
      {digest.periodLabel && <span className="demo-insight-period">{digest.periodLabel}</span>}
    </div>
    {!insight ? <p className="demo-evaluation-screen-empty">暂无可展示的育人分析</p> : <>
      <div className="demo-insight-topics" role="tablist" aria-label="育人洞察专题">
        {digest.insights.map((item, index) => <button type="button" key={item.id} role="tab" id={`${id}-tab-${index}`} aria-selected={index === selected} aria-controls={`${id}-content`}
          ref={element => { topics.current[index] = element; }} tabIndex={index === selected ? 0 : -1}
          onKeyDown={event => {
            const target = event.key === 'ArrowRight' ? (index + 1) % digest.insights.length
              : event.key === 'ArrowLeft' ? (index - 1 + digest.insights.length) % digest.insights.length
                : event.key === 'Home' ? 0 : event.key === 'End' ? digest.insights.length - 1 : null;
            if (target === null) return;
            event.preventDefault();
            onSelect?.(target);
            topics.current[target]?.focus();
          }} onClick={() => onSelect?.(index)}>{item.topic}</button>)}
      </div>
      <div className="demo-insight-content" id={`${id}-content`} role="tabpanel" aria-labelledby={`${id}-tab-${selected}`} aria-live="off" tabIndex={0}>
        {!insight.items.length ? <p className="demo-evaluation-screen-empty">暂无可展示的{insight.topic}</p> :
          <div className={`demo-insight-items ${insight.id === 'growth' ? 'demo-insight-highlights' : ''}`}>
            {insight.items.map(item => <section className="demo-insight-item" key={item.id}>
              <div className="demo-insight-conclusion">
                {insight.id === 'observation' ? <>
                  <h3 className="demo-insight-section-heading">AI洞察</h3>
                  <h4 className="demo-insight-finding-title">{item.headline}</h4>
                </> : <h3>{item.headline}</h3>}
                <p className="demo-insight-summary">{item.summary}</p>
              </div>
              {insight.id === 'observation' && item.action && <div className="demo-insight-suggestion">
                <h3 className="demo-insight-section-heading">AI建议</h3>
                <h4 className="demo-insight-advice-title">{item.action.title}</h4>
                <p className="demo-insight-action-task">{item.action.body}</p>
              </div>}
            </section>)}
          </div>}

      </div>
    </>}
  </aside>;
};
