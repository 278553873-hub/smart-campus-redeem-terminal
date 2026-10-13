import React from 'react';
import type { PrdFlow, PrdFlowBranch, PrdFlowStep } from './prdContent.ts';

const ActorLabel: React.FC<{ actor: string }> = ({ actor }) => (
  <span className="inline-flex shrink-0 items-center rounded-[var(--tm-radius-inner)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-page)] px-2 py-1 text-[11px] font-semibold text-[var(--tm-text-secondary)]">
    {actor}
  </span>
);

const StepBox: React.FC<{ step: PrdFlowStep; index: number; total: number }> = ({ step, index, total }) => (
  <li className="relative pl-8">
    {index < total - 1 && <span className="absolute left-3 top-8 bottom-[-10px] border-l border-dashed border-[var(--tm-border-subtle)]" aria-hidden="true" />}
    <span className="absolute left-0 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] text-[11px] font-bold tabular-nums text-[var(--tm-text-secondary)]" aria-hidden="true">{index + 1}</span>
    <div className={`mb-3 border border-[var(--tm-border-control)] bg-transparent px-[var(--tm-space-3)] py-[var(--tm-space-3)] ${step.kind === 'start' || step.kind === 'end' ? 'rounded-full' : step.kind === 'decision' ? 'rounded-none [clip-path:polygon(8%_0,92%_0,100%_50%,92%_100%,8%_100%,0_50%)]' : 'rounded-[var(--tm-radius-inner)]'}`}>
      <div className="flex flex-wrap items-center gap-2"><ActorLabel actor={step.actor} /><span className="text-[14px] font-semibold text-[var(--tm-text-primary)]">{step.title}</span></div>
      {step.detail && <p className="mt-1 text-[12px] font-medium leading-relaxed text-[var(--tm-text-secondary)]">{step.detail}</p>}
    </div>
  </li>
);

const BranchBlock: React.FC<{ branch: PrdFlowBranch }> = ({ branch }) => (
  <div className="relative rounded-[var(--tm-radius-inner)] border border-dashed border-[var(--tm-border-control)] bg-transparent p-[var(--tm-space-3)]">
    <span className="absolute -top-3 left-3 bg-[var(--tm-bg-surface)] px-1 text-[11px] font-bold text-[var(--tm-text-secondary)]">{branch.label}</span>
    <ul className="mt-1 flex flex-col gap-2">{branch.steps.map(step => <li key={step.id} className="flex flex-col gap-1"><div className="flex flex-wrap items-center gap-2"><ActorLabel actor={step.actor} /><span className="text-[13px] font-semibold text-[var(--tm-text-primary)]">{step.title}</span></div>{step.detail && <p className="pl-1 text-[12px] font-medium leading-relaxed text-[var(--tm-text-tertiary)]">{step.detail}</p>}</li>)}</ul>
  </div>
);

const FlowDiagram: React.FC<{ flow: PrdFlow }> = ({ flow }) => (
  <section aria-label={flow.title} className="rounded-[var(--tm-radius-card)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] p-[var(--tm-space-4)]">
    <h3 className="text-[16px] font-bold text-[var(--tm-text-primary)]">{flow.title}</h3>
    <p className="mt-1 text-[12px] font-medium text-[var(--tm-text-secondary)]">{flow.goal}</p>
    <ol className="mt-[var(--tm-space-4)]">{flow.steps.map((step, index) => <StepBox key={step.id} step={step} index={index} total={flow.steps.length} />)}</ol>
    {flow.branches && flow.branches.length > 0 && <div className="grid gap-2 sm:grid-cols-2">{flow.branches.map(branch => <BranchBlock key={branch.id} branch={branch} />)}</div>}
  </section>
);

export default FlowDiagram;
