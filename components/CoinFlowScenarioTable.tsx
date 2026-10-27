import React from 'react';
import { COIN_FLOW_SCENARIOS } from '../shared/coinFlowScenarioExamples';
export default function CoinFlowScenarioTable({ query }: { query: string }) {
 const rows = COIN_FLOW_SCENARIOS.filter(row => JSON.stringify(row).toLowerCase().includes(query.trim().toLowerCase()));
 return <div>
  <p className="mb-3 text-xs leading-5 text-slate-500">每行包含完整展示结果，无需跨章节拼字段。金额与时间为演示值；无新增流水的场景会明确标出。涉及原记录时按时间倒序展示。</p>
  <div role="status" className="mb-3 text-xs text-slate-500">共 {rows.length} 个场景</div>
  <div className="overflow-x-auto rounded border border-slate-200">
   <table className="w-full min-w-[900px] border-collapse text-left text-xs leading-6">
    <thead className="bg-slate-50 text-slate-600"><tr><th scope="col" className="w-[23%] px-4 py-3">发生什么</th><th scope="col" className="w-[37%] px-4 py-3">完整流水样式</th><th scope="col" className="px-4 py-3">文案规则与测试结果</th></tr></thead>
    <tbody>{rows.map(row=><tr key={row.id} className="border-t border-slate-200 align-top">
     <td className="px-4 py-4"><div className="text-[11px] text-slate-500">{row.id} · {row.group}</div><div className="mt-1 text-sm font-semibold text-slate-900">{row.scenario}</div></td>
     <td className="px-4 py-4">{row.records.length ? <div className="space-y-3">{row.records.map((record,index)=><div key={index}>
      {record.owner && <div className="mb-1 text-xs font-semibold text-slate-500">{record.owner}</div>}
      <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
       <div className="flex items-start justify-between gap-3"><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold text-slate-900">{record.category}</span>{record.status && <span className="rounded bg-slate-100 px-1.5 text-[11px] text-slate-500">{record.status}</span>}</div><span className={`whitespace-nowrap text-base font-semibold tabular-nums ${record.amount.startsWith('+') ? 'text-amber-700':'text-rose-700'}`}>{record.amount} 币</span></div>
       <p className="mb-0 mt-1 text-sm leading-6 text-slate-600">{record.detail}</p>
       <p className="mb-0 mt-1 text-xs text-slate-400">{record.time}</p>
      </div>
     </div>)}</div>:<div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3"><div className="font-semibold text-slate-700">不新增流水</div><p className="mb-0 mt-1 text-slate-500">{row.expected}</p></div>}</td>
     <td className="space-y-3 px-4 py-4"><div><div className="font-semibold text-slate-500">规则</div><div className="break-words text-slate-800">{row.rule}</div></div><div><div className="font-semibold text-slate-500">检查结果</div><div className="text-slate-800">{row.expected}</div></div></td>
    </tr>)}</tbody>
   </table>
  </div>
  {!rows.length && <p className="py-6 text-center text-slate-500">没有匹配场景，请更换关键词。</p>}
 </div>;
}
