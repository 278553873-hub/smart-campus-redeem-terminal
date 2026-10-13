import React from 'react';
import { PRD_EVALUATION_DIMENSIONS, PRD_FLOWS, PRD_ROLES, PRD_SUBMISSION_TYPES } from './prdContent.ts';
import FlowDiagram from './FlowDiagram.tsx';

/** PRD 当前只承载学校人员的业务建模，规则与字段待角色流程确认后再展开。 */
const PrdView: React.FC = () => (
  <div className="h-full overflow-y-auto bg-[var(--tm-bg-page)]">
    <div className="mx-auto w-full max-w-[1000px] px-[var(--tm-space-6)] pb-[var(--tm-space-8)] pt-[var(--tm-space-5)]">
      <header>
        <p className="text-[12px] font-semibold tracking-wide text-[var(--tm-brand-primary)]">教师评价 · 业务建模</p>
        <h1 className="mt-2 text-[26px] font-bold leading-tight text-[var(--tm-text-primary)]">角色、职责与流程</h1>
        <p className="mt-2 max-w-[760px] text-[14px] font-medium leading-relaxed text-[var(--tm-text-secondary)]">
          先确认学校人员之间如何发起、处理、核验、反馈和复盘，再继续细化字段、指标和计分规则。图中只表达业务参与者，不展开系统和人工智能实现。
        </p>
      </header>
      <section aria-label="学校人员角色与职责" className="mt-[var(--tm-space-6)]">
        <h2 className="text-[20px] font-bold text-[var(--tm-text-primary)]">一、学校人员角色</h2>
        <div className="mt-[var(--tm-space-3)] overflow-hidden rounded-[var(--tm-radius-card)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)]">
          <table className="w-full border-collapse text-left">
            <thead><tr className="border-b border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-soft)]"><th className="w-[220px] px-[var(--tm-space-4)] py-[var(--tm-space-3)] text-[12px] font-bold text-[var(--tm-text-secondary)]">角色</th><th className="px-[var(--tm-space-4)] py-[var(--tm-space-3)] text-[12px] font-bold text-[var(--tm-text-secondary)]">职责边界</th></tr></thead>
            <tbody>{PRD_ROLES.map(role => <tr key={role.id} className="border-b border-[var(--tm-border-subtle)] align-top last:border-b-0"><td className="px-[var(--tm-space-4)] py-[var(--tm-space-3)] text-[13px] font-bold text-[var(--tm-text-primary)]">{role.name}</td><td className="px-[var(--tm-space-4)] py-[var(--tm-space-3)]"><p className="text-[13px] font-medium leading-relaxed text-[var(--tm-text-primary)]">{role.goal}</p><p className="mt-1 text-[12px] font-medium leading-relaxed text-[var(--tm-text-secondary)]">{role.abilities.join('；')}</p></td></tr>)}</tbody>
          </table>
        </div>
      </section>
      <section aria-label="教师评价维度" className="mt-[var(--tm-space-6)]">
        <h2 className="text-[20px] font-bold text-[var(--tm-text-primary)]">二、教师评价维度</h2>
        <p className="mt-1 text-[13px] font-medium text-[var(--tm-text-secondary)]">评价数据来自教师档案、教学、教研和管理业务，不由教师单方面提交。</p>
        <div className="mt-[var(--tm-space-3)] overflow-hidden rounded-[var(--tm-radius-card)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)]">
          <table className="w-full border-collapse text-left"><thead><tr className="border-b border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-soft)]"><th className="w-[140px] px-[var(--tm-space-4)] py-3 text-[12px] font-bold text-[var(--tm-text-secondary)]">维度</th><th className="px-4 py-3 text-[12px] font-bold text-[var(--tm-text-secondary)]">数据来源</th><th className="w-[260px] px-4 py-3 text-[12px] font-bold text-[var(--tm-text-secondary)]">参与人员与评价方式</th></tr></thead><tbody>{PRD_EVALUATION_DIMENSIONS.map(item => <tr key={item.id} className="border-b border-[var(--tm-border-subtle)] align-top last:border-b-0"><td className="px-4 py-3 text-[13px] font-bold text-[var(--tm-text-primary)]">{item.name}</td><td className="px-4 py-3 text-[12px] font-medium leading-relaxed text-[var(--tm-text-secondary)]">{item.evidenceSources.join('、')}</td><td className="px-4 py-3 text-[12px] font-medium leading-relaxed text-[var(--tm-text-secondary)]">{item.participants.join('、')}；{item.evaluationMode}</td></tr>)}</tbody></table>
        </div>
      </section>
      <section aria-label="教师可提交的数据" className="mt-[var(--tm-space-6)]">
        <h2 className="text-[20px] font-bold text-[var(--tm-text-primary)]">三、教师可提交的数据</h2>
        <p className="mt-1 text-[13px] font-medium text-[var(--tm-text-secondary)]">教师提交的是事实、证据和发展行动；只有成果材料在学校确认后，才可能进入计分或正式评价。</p>
        <div className="mt-[var(--tm-space-3)] grid gap-3 sm:grid-cols-2">
          {PRD_SUBMISSION_TYPES.map(item => (
            <article key={item.id} className="rounded-[var(--tm-radius-card)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] p-[var(--tm-space-4)]">
              <h3 className="text-[15px] font-bold text-[var(--tm-text-primary)]">{item.name}</h3>
              <p className="mt-1 text-[12px] font-medium leading-relaxed text-[var(--tm-text-secondary)]">{item.purpose}</p>
              <p className="mt-2 text-[12px] font-medium leading-relaxed text-[var(--tm-text-primary)]"><span className="font-semibold">示例：</span>{item.examples.join('、')}</p>
              <dl className="mt-2 grid gap-1 text-[12px] leading-relaxed"><div><dt className="inline font-semibold text-[var(--tm-text-tertiary)]">证据：</dt><dd className="inline text-[var(--tm-text-secondary)]">{item.requiredEvidence}</dd></div><div><dt className="inline font-semibold text-[var(--tm-text-tertiary)]">处理：</dt><dd className="inline text-[var(--tm-text-secondary)]">{item.reviewOwner}</dd></div><div><dt className="inline font-semibold text-[var(--tm-text-tertiary)]">评价：</dt><dd className="inline text-[var(--tm-text-secondary)]">{item.scoring}</dd></div></dl>
            </article>
          ))}
        </div>
      </section>
      <section aria-label="角色业务流程图" className="mt-[var(--tm-space-6)]">
        <h2 className="text-[20px] font-bold text-[var(--tm-text-primary)]">四、角色业务流程图</h2>
        <p className="mt-1 text-[13px] font-medium text-[var(--tm-text-secondary)]">线框只表示角色之间的业务交接；实线框是主步骤，虚线框是分支结果。系统、人工智能和技术实现暂不纳入本轮建模。</p>
        <div className="mt-[var(--tm-space-3)] grid gap-[var(--tm-space-4)]">{PRD_FLOWS.map(flow => <FlowDiagram key={flow.id} flow={flow} />)}</div>
      </section>
    </div>
  </div>
);

export default PrdView;
