import CoinFlowScenarioTable from './CoinFlowScenarioTable';
import React, { useMemo, useState } from 'react';
import { Button, Input, Modal, Select } from '@arco-design/web-react';
import { ClipboardList } from 'lucide-react';
import { COIN_FLOW_REVIEW_SECTIONS } from '../shared/coinFlowReviewRules';

// 演示控件最高为9999；规则遮罩和弹窗必须覆盖它们。
const REVIEW_OVERLAY_LAYER = 10000;

/** 仅挂载在演示壳层，交付说明不进入教师业务界面。 */
export default function CoinFlowReviewNotes() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'scenarios' | 'rules'>('scenarios');
  const [sectionId, setSectionId] = useState('all');
  const sections = useMemo(() => COIN_FLOW_REVIEW_SECTIONS
    .filter(section => sectionId === 'all' || section.id === sectionId)
    .map(section => ({ ...section, rows: section.rows.filter(row => !query.trim() || `${section.title} ${row.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase())) }))
    .filter(section => section.rows.length), [query, sectionId]);
  const count = sections.reduce((sum, section) => sum + section.rows.length, 0);
  return <>
    <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog"
      className="flex min-h-11 w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-[12px] font-semibold text-slate-700">
      <ClipboardList className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>校园币流水 · 开发与测试规则</span>
    </button>
    <Modal visible={open} title="校园币流水 · 开发与测试规则" onCancel={() => setOpen(false)}
      maskStyle={{ zIndex: REVIEW_OVERLAY_LAYER }}
      wrapStyle={{ zIndex: REVIEW_OVERLAY_LAYER + 1 }}
      style={{ width: 1120, maxWidth: 'calc(100vw - 32px)' }}
      footer={<Button type="primary" onClick={() => setOpen(false)}>关闭</Button>}>
      <div className="space-y-4">
        <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-slate-800">
          <p className="m-0 font-semibold">已确认：定期结算已经发币后，编辑、删除或撤回历史评价，不收回、不补发、不重新结算。</p>
          <p className="m-0 text-xs text-slate-600">本面板随演示页面交付，供开发与测试查阅；其余内容为场景方案，不代表功能已经实现。“待确认”条目不能作为已确定的开发或验收规则。</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type={view === 'scenarios' ? 'primary' : 'default'} onClick={() => setView('scenarios')}>按场景看完整样式</Button>
          <Button type={view === 'rules' ? 'primary' : 'default'} onClick={() => setView('rules')}>详细规则与待确认事项</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {view === 'rules' && <Select aria-label="选择规则章节" value={sectionId} onChange={setSectionId} style={{ width: 240 }}
            options={[{ value: 'all', label: '全部章节' }, ...COIN_FLOW_REVIEW_SECTIONS.map(section => ({ value: section.id, label: section.title }))]} />}
          <Input.Search aria-label="搜索场景、规则或编号" placeholder="搜索场景、文案或编号，如 A15、撤回" allowClear value={query} onChange={setQuery} style={{ width: 360, maxWidth: '100%' }} />
          {view === 'rules' && <span role="status" className="text-xs text-slate-500">{count} 条规则</span>}
        </div>
        <div className="max-h-[58vh] space-y-6 overflow-y-auto pr-2" tabIndex={0} aria-label="规则表格内容">
          {view === 'scenarios' && <CoinFlowScenarioTable query={query} />}
          {view === 'rules' && sections.map(section => <section key={section.id} aria-labelledby={`coin-review-${section.id}`}>
            <h3 id={`coin-review-${section.id}`} className="mb-3 text-sm font-semibold text-slate-900">{section.title}</h3>
            <div className="overflow-x-auto rounded border border-slate-200">
              <table className="w-full min-w-[760px] border-collapse text-left text-xs leading-6">
                <thead className="bg-slate-50 text-slate-600"><tr>{section.columns.map((column, index) => <th key={column} scope="col" className={`px-3 py-2 font-semibold ${index === 0 ? 'w-16' : ''}`}>{column}</th>)}</tr></thead>
                <tbody>{section.rows.map(row => <tr key={row[0]} className="border-t border-slate-200 align-top">
                  {row.map((cell, index) => <td key={index} className={`px-3 py-2 ${index === 0 ? 'whitespace-nowrap font-semibold text-slate-500' : 'text-slate-800'}`}>{cell}</td>)}
                </tr>)}</tbody>
              </table>
            </div>
          </section>)}
          {view === 'rules' && !count && <p className="py-8 text-center text-sm text-slate-500">没有匹配规则，请更换关键词或选择全部章节。</p>}
        </div>
      </div>
    </Modal>
  </>;
}
