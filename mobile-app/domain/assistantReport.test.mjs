import fs from 'node:fs';
import ts from 'typescript';

const source = fs.readFileSync(new URL('./assistantReport.ts', import.meta.url), 'utf8');
const output = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ES2022,
  },
}).outputText;
const moduleUrl = `data:text/javascript;base64,${Buffer.from(output).toString('base64')}`;
const { parseAssistantReportDocument } = await import(moduleUrl);

const validPayload = {
  schemaVersion: '1.0',
  reportId: 'report-1',
  reportType: 'headteacher_weekly',
  status: 'generated',
  scope: { id: 'class-1', name: '一年级一班' },
  period: { label: '7月27日-8月2日' },
  generatedAt: '2026-08-03 07:00',
  promptVersion: 'headteacher-weekly-v1',
  dataSnapshotId: 'snapshot-1',
  notice: '内容由AI生成，仅供参考。',
  cards: [
    {
      key: 'student_insights',
      kind: 'insights',
      items: [{ id: 'student-1', title: '需要核实课堂投入', body: '不同任务阶段表现存在差异。', evidence: '来自2位教师的3条记录。' }],
    },
    {
      key: 'actions',
      kind: 'actions',
      items: [{ id: 'action-1', body: '安排一次延伸任务并观察完成情况。' }],
    },
    { key: 'unknown', kind: 'summary', body: '不应展示' },
  ],
};

const parsed = parseAssistantReportDocument(validPayload);
if (!parsed.success) throw new Error(`合法报告解析失败：${parsed.issues.join('、')}`);
if (parsed.data.cards.map(card => card.key).join(',') !== 'actions,student_insights') {
  throw new Error('报告区块没有按前端白名单顺序归一化。');
}
if (!parsed.issues.includes('部分未知或无效区块已忽略')) {
  throw new Error('未知区块应被忽略并留下校验记录。');
}

const invalidVersion = parseAssistantReportDocument({ ...validPayload, schemaVersion: '2.0' });
if (invalidVersion.success || !invalidVersion.issues.includes('报告协议版本不受支持')) {
  throw new Error('不受支持的协议版本必须进入错误态。');
}

const invalidContent = parseAssistantReportDocument({ ...validPayload, cards: [] });
if (invalidContent.success || !invalidContent.issues.includes('没有可展示的报告内容')) {
  throw new Error('空报告不得进入成功展示态。');
}

console.log('Assistant report contract assertions passed');
