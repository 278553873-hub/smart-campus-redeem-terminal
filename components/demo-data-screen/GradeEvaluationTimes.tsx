import React from 'react';
import { ScreenPanel, formatScreenNumber } from './StudentEvaluationCharts';
import { getGradeEvaluationPage, type ScreenGradeEvaluationCount } from './studentEvaluationScreenGrades';
import { useScreenPanelPlayback } from './useScreenPanelPlayback';

export const GradeEvaluationTimesChart = ({ grades, page = 0 }: { grades: ScreenGradeEvaluationCount[]; page?: number }) => {
  const group = getGradeEvaluationPage(grades, page);
  const maximum = Math.max(1, ...grades.map(grade => grade.evaluationTimes));
  const topIds = new Set([...grades].filter(grade => grade.evaluationTimes > 0).sort((a, b) => b.evaluationTimes - a.evaluationTimes).slice(0, 3).map(grade => grade.id));
  return <ScreenPanel title="年级评价次数" detail={group.pages > 1 ? `${group.current + 1}/${group.pages}` : undefined}>
    {!grades.length ? <p className="demo-evaluation-screen-empty">暂无年级评价数据</p> :
      <ul className="demo-evaluation-screen-grade-records">
        {group.grades.map(grade => <li key={grade.id} className={topIds.has(grade.id) ? 'is-top-grade' : undefined} aria-label={`${grade.name}，评价${formatScreenNumber(grade.evaluationTimes)}次`}>
          <div className="demo-evaluation-screen-grade-column-area" aria-hidden="true">
            <div className="demo-evaluation-screen-grade-column" style={{ height: `${grade.evaluationTimes / maximum * 100}%` }}>
              <strong>{formatScreenNumber(grade.evaluationTimes)}</strong>
            </div>
          </div>
          <span className="demo-evaluation-screen-grade-name">{grade.name}</span>
        </li>)}
      </ul>}
  </ScreenPanel>;
};

export const GradeEvaluationTimes = ({ grades, visible, reducedMotion }: {
  grades: ScreenGradeEvaluationCount[]; visible: boolean; reducedMotion: boolean;
}) => {
  const pages = Math.max(1, Math.ceil(grades.length / 6));
  const playback = useScreenPanelPlayback(pages, visible, reducedMotion);
  return <div className="demo-evaluation-screen-grade-times" role="region" aria-label="各年级评价次数" tabIndex={pages > 1 ? 0 : undefined}
    onFocusCapture={() => playback.setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) playback.setFocused(false); }}
    onKeyDown={event => {
      if (pages < 2 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      playback.setActive(event.key === 'Home' ? 0 : event.key === 'End' ? pages - 1 : (playback.active + (event.key === 'ArrowRight' ? 1 : -1) + pages) % pages);
    }}>
    <GradeEvaluationTimesChart grades={grades} page={playback.active} />
  </div>;
};
