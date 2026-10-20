import React from 'react';
import type { Student } from '../../types';
import { getTermReportCover } from '../../assets/termReportCovers';
import { TERM_REPORT_PERIOD } from '../../domain/termReportTags';
import { DEFAULT_COVER_STYLE, resolveCoverStyle, resolveCoverImage, type CoverStyle, type ReportAppearance } from '../../domain/termReportAppearance';
import './termReportCover.css';

interface Props {
  student: Student;
  classLabel?: string;
  mode?: 'mobile' | 'a4';
  tags: readonly string[];
  onEditTags?: () => void;
  appearance?: ReportAppearance;
  coverStyle?: CoverStyle;
  hideArtwork?: boolean;
  artworkOverlay?: React.ReactNode;
}

export default function TermReportCover({ student, classLabel, mode = 'mobile', tags, onEditTags, appearance, coverStyle, hideArtwork = false, artworkOverlay }: Props) {
  const style = coverStyle ?? (appearance ? resolveCoverStyle(appearance, student.grade) : DEFAULT_COVER_STYLE);
  const artworkHidden = hideArtwork || style.artwork === 'none';
  const illustrationStudent = style.artwork === 'preset' && style.preset ? style.preset : student;
  const cover = getTermReportCover(illustrationStudent);
  const imageSettings = resolveCoverImage(style, student.gender);
  const customImage = imageSettings ? appearance?.assets[imageSettings.imageId] : undefined;
  const logo = appearance?.logoId ? appearance.assets[appearance.logoId] : undefined;
  return (
    <section className={`report-page-container term-report-cover term-report-cover--${mode} ${mode === 'a4' ? 'page-break' : ''}`} data-gender={illustrationStudent.gender} data-stage={cover.stage} data-theme={style.theme} data-custom-art={customImage ? 'true' : undefined} data-art-layout={customImage ? imageSettings?.layout : 'cutout'} style={{ '--cover-image-scale': customImage && imageSettings ? imageSettings.scale / 100 : 1, '--cover-image-x': `${style.imageOffsetX ?? 0}%`, '--cover-image-y': `${style.imageOffsetY ?? 0}%`, '--cover-image-rotation': `${style.imageRotation ?? 0}deg` } as React.CSSProperties} aria-label={`${student.name}的学期成长手册封面`}>
      <div className="term-report-cover__wash" aria-hidden="true" />
      {appearance?.schoolName && <div className="term-report-cover__school">
        {logo && <img src={logo.src} alt="学校标识" />}
        <span>{appearance.schoolName}</span>
      </div>}
      <header className="term-report-cover__heading">
        <p className="term-report-cover__term">{TERM_REPORT_PERIOD.label}</p>
        <h1 className="term-report-cover__title"><span>学期</span><span>成长手册<i aria-hidden="true" /></span></h1>
      </header>
      <div className="term-report-cover__art" style={artworkHidden ? { aspectRatio: '1' } : undefined}>
        {!artworkHidden && <img src={customImage?.src ?? cover.src} alt="" width={1254} height={1254} draggable={false} />}
        {artworkOverlay}
      </div>
      <footer className="term-report-cover__identity">
        <h2 className="term-report-cover__name">{student.name}</h2>
        <div className="term-report-cover__details">
          <p className="term-report-cover__class"><span>{classLabel || student.class}</span><span aria-hidden="true">·</span><span>{student.grade}</span></p>
          {onEditTags && <button type="button" onClick={onEditTags} className="term-report-cover__edit print:hidden" aria-label="编辑素养标签">编辑</button>}
        </div>
        <ul className="term-report-cover__traits" aria-label="素养标签">
          {tags.map((tag, index) => <li key={`${index}-${tag}`} className={`term-report-cover__trait term-report-cover__trait--${index % 3}`}>
            <span>{tag}</span>
          </li>)}
        </ul>
      </footer>
    </section>
  );
}
