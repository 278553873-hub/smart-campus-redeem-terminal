import React, { useMemo, useState } from 'react';
import { Radio } from '@arco-design/web-react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { COIN_FLOW_SCENARIOS } from '../shared/coinFlowScenarioExamples';

const categories = {
 income: ['全部', '成长嘉奖', '班级奖励', '银行利息', '兑换退还'],
 expense: ['全部', '货柜兑换', '班级兑换', '发币撤回'],
};
const entries = COIN_FLOW_SCENARIOS.flatMap(scenario => scenario.records.map((record, index) => ({
 key: `${scenario.id}-${index}`, scenario, record,
 direction: record.amount.startsWith('+') ? 'income' : 'expense',
})));
const noFlowScenarios = COIN_FLOW_SCENARIOS.filter(scenario => !scenario.records.length);

/** 演示壳层中的流水样式预览，选中记录后查看其唯一一份处理规则。 */
export default function CoinFlowScenarioPreview() {
 const [direction, setDirection] = useState<'income' | 'expense'>('income');
 const [category, setCategory] = useState('全部');
 const [selectedKey, setSelectedKey] = useState<string | null>(null);
 const [noFlowId, setNoFlowId] = useState<string | null>(null);
 const filtered = useMemo(() => entries.filter(entry => entry.direction === direction && (category === '全部' || entry.record.category === category)), [direction, category]);
 const selected = filtered.find(entry => entry.key === selectedKey) ?? filtered[0];
 const scenario = noFlowScenarios.find(row => row.id === noFlowId) ?? selected?.scenario;
 const selectDirection = (value: 'income' | 'expense') => {
  setDirection(value); setCategory('全部'); setSelectedKey(null); setNoFlowId(null);
 };
 return <div className="grid gap-5 md:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
  <div className="min-w-0 space-y-4">
  <section aria-label="校园币流水预览" className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
   <div className="border-b border-slate-200 bg-white px-4 py-4">
    <h2 className="mb-4 text-center text-base font-semibold text-slate-900">校园币明细</h2>
    <Radio.Group type="button" value={direction} onChange={selectDirection} aria-label="收支筛选">
     <Radio value="income">收入</Radio><Radio value="expense">支出</Radio>
    </Radio.Group>
    <div className="mt-3 flex flex-wrap gap-x-1 gap-y-2" role="group" aria-label="流水分类筛选">
     {categories[direction].map(value => <button type="button" key={value} aria-pressed={category === value}
      onClick={() => { setCategory(value); setSelectedKey(null); setNoFlowId(null); }}
      className={`min-h-9 rounded-lg px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${category === value ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>{value}</button>)}
    </div>
   </div>
   <div className="max-h-[51vh] overflow-y-auto p-3" aria-label={`${direction === 'income' ? '收入' : '支出'}流水`}>
    <div className="overflow-hidden rounded-lg bg-white">
     {filtered.map(({ key, record, scenario: row }) => {
      const active = !noFlowId && selected?.key === key;
      return <button type="button" key={key} aria-pressed={active} aria-label={`${row.scenario}，${record.detail}，${record.amount}币`}
       onClick={() => { setSelectedKey(key); setNoFlowId(null); }}
       className={`flex w-full gap-3 border-b border-slate-100 px-3 py-4 text-left last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 ${active ? 'bg-blue-50 ring-1 ring-inset ring-blue-200' : 'hover:bg-slate-50'}`}>
       <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${direction === 'income' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`} aria-hidden="true">
        {direction === 'income' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
       </span>
       <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2"><span className="flex flex-wrap items-center gap-1.5"><span className="text-sm font-semibold text-slate-900">{record.category}</span>{record.status && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500">{record.status}</span>}</span><span className={`shrink-0 text-base font-semibold tabular-nums ${direction === 'income' ? 'text-amber-700' : 'text-rose-700'}`}>{record.amount}</span></span>
        <span className="mt-1 block whitespace-pre-line text-sm leading-6 text-slate-600">{record.detail}</span>
        <span className="mt-1 block text-xs text-slate-400">{record.time}</span>
       </span>
      </button>;
     })}
    </div>
    {!filtered.length && <p className="py-10 text-center text-sm text-slate-500">暂无流水</p>}

   </div>
  </section>
    {noFlowScenarios.map(row => <button key={row.id} type="button" aria-pressed={noFlowId === row.id} onClick={() => setNoFlowId(row.id)}
     className={`min-h-14 w-full rounded-xl border border-slate-200 px-4 py-4 text-left text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${noFlowId === row.id ? 'bg-blue-50 text-blue-800 ring-1 ring-inset ring-blue-200' : 'bg-white text-slate-700 hover:bg-slate-50'}`}>{row.scenario}</button>)}
  </div>
  <aside aria-label="选中场景的展示和处理规则" className="max-h-[72vh] space-y-4 overflow-y-auto">
   {scenario && <section className="rounded-lg border border-slate-200 bg-white p-5">
    <div className="text-xs text-slate-500">{scenario.id} · {scenario.group}</div>
    <h3 className="mb-3 mt-2 text-base font-semibold text-slate-900">{scenario.scenario}</h3>
    {selected?.record.owner && !noFlowId && <p className="mb-3 text-xs text-slate-500">{selected.record.owner}</p>}
    <p className="m-0 text-sm leading-7 text-slate-700">{scenario.rule}</p>
    {scenario.deductionRule && <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3">
     <div className="mb-1 text-sm font-semibold text-slate-800">实扣规则</div>
     <p className="m-0 text-sm leading-7 text-slate-700">{scenario.deductionRule}</p>
     <p className="mb-0 mt-2 text-xs leading-6 text-slate-500">例如：应撤回5币，可用2币，实扣2币</p>
    </div>}
    {scenario.caseStudy && (() => {
     const example = scenario.caseStudy;
     const beforeScore = example.indicators.reduce((sum, item) => sum + item.before, 0);
     const afterScore = example.indicators.reduce((sum, item) => sum + item.after, 0);
     return <div className="mt-5 border-t border-slate-200 pt-4">
      <h4 className="mb-2 text-sm font-semibold text-slate-900">具体案例</h4>
      <p className="mb-3 text-xs leading-6 text-slate-600">原发币规则：1分＝{example.coinsPerPoint}币。老师修改了同一次评价的分值：</p>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
       <table className="w-full min-w-[360px] border-collapse text-left text-xs leading-5">
        <thead className="bg-slate-50 text-slate-600"><tr>
         {['指标', '原分值', '修改后', '流水中的分值'].map(title => <th key={title} scope="col" className="px-2 py-2 font-semibold">{title}</th>)}
        </tr></thead>
        <tbody>{example.indicators.map(item => <tr key={item.path} className="border-t border-slate-200 align-top">
         <th scope="row" className="px-2 py-3 font-normal text-slate-700">{item.path}</th>
         <td className="whitespace-nowrap px-2 py-3">+{item.before}分</td>
         <td className="whitespace-nowrap px-2 py-3">+{item.after}分</td>
         <td className="px-2 py-3">{item.after > item.before ? `+${item.after - item.before}分（${item.after}−${item.before}）` : '未变，不展示'}</td>
        </tr>)}</tbody>
       </table>
      </div>
      <div className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
       <p className="m-0">原已发{beforeScore * example.coinsPerPoint}币，修改后应发{afterScore * example.coinsPerPoint}币，本次补发<strong>{(afterScore - beforeScore) * example.coinsPerPoint}币</strong>。</p>
       <p className="m-0">说明中的两个“+1分”是各指标增加的分值，不是修改后的总分；右侧“+{(afterScore - beforeScore) * example.coinsPerPoint}”是本次到账币数：{afterScore * example.coinsPerPoint}−{beforeScore * example.coinsPerPoint}＝{(afterScore - beforeScore) * example.coinsPerPoint}币。</p>
      </div>
     </div>;
    })()}

   </section>}

  </aside>
 </div>;
}
