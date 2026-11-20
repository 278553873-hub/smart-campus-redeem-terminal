import React, { useState } from 'react';
import MobilePageHeader from '../components/ui/MobilePageHeader';
import { initialImagingReportScope } from '../data/studentInitialImagingReport';

interface StudentInitialImagingReportViewProps {
  spaceId: string;
  studentId: string;
  onBack: () => void;
}

// Vite 会将独立 H5 作为静态资源一并发布；无需另行部署报告目录。
const reportURL = new URL('../../docs/演示项目/小班化教学报告/成果/工具四初始成像/吴浩_工具四_初始成像_手机阅读版.html', import.meta.url).href;

const StudentInitialImagingReportView: React.FC<StudentInitialImagingReportViewProps> = ({ spaceId, studentId, onBack }) => {
  const [loaded, setLoaded] = useState(false);
  const url = new URL(reportURL);
  url.searchParams.set('embed', 'teacher');
  url.searchParams.set('scope', initialImagingReportScope(spaceId, studentId));
  const source = url.href;
  return <div className="flex min-h-0 flex-1 flex-col bg-[var(--tm-page-plain-content-bg)]" data-student-initial-imaging-report>
    <MobilePageHeader title="学生初成像" onBack={onBack} />
    <iframe key={source} src={source} onLoad={() => setLoaded(true)} title="吴浩的学生初成像示例报告，可编辑生成内容" className="min-h-0 w-full flex-1 border-0 bg-white" aria-busy={!loaded} />
  </div>;
};

export default StudentInitialImagingReportView;
