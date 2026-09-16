import React, { useEffect, useMemo, useState } from 'react';
import { Button, InputNumber, Message, Radio, Slider, Switch } from '@arco-design/web-react';
import { Coins, Info } from 'lucide-react';
import type { CoinIssuanceConfig } from '../mobile-app/types';
import { getClassBudgetTotal } from '../mobile-app/domain/campusCoinIssuance';

interface CoinIssuanceSettingsProps {
    value: CoinIssuanceConfig;
    onChange: (value: CoinIssuanceConfig) => void;
}

const SAMPLE_CLASS_SIZE = 50;

const formatCoinAmount = (amount: number) => (
    Number.isInteger(amount) ? amount.toLocaleString() : amount.toFixed(2).replace(/\.?0+$/, '')
);

const normalizePositiveInteger = (value: number | undefined) => (
    Number.isFinite(value) && Number(value) > 0 ? Math.max(1, Math.floor(Number(value))) : 1
);

const normalizeBudgetAmount = (value: number | undefined) => (
    Number.isFinite(value) && Number(value) > 0 ? Math.max(0.01, Math.round(Number(value) * 100) / 100) : 1
);

const CoinIssuanceSettings: React.FC<CoinIssuanceSettingsProps> = ({ value, onChange }) => {
    const [draft, setDraft] = useState(value);

    useEffect(() => {
        setDraft(value);
    }, [value]);

    const rankingRatio = 100 - draft.sunshineRatio;
    const classBudgetTotal = useMemo(() => getClassBudgetTotal({
        budgetMode: draft.budgetMode,
        budgetAmount: draft.budgetAmount,
        classStudentCount: SAMPLE_CLASS_SIZE,
    }), [draft.budgetAmount, draft.budgetMode]);
    const sunshineAmount = Math.round(classBudgetTotal * draft.sunshineRatio / 100);
    const rankingAmount = classBudgetTotal - sunshineAmount;

    const updateDraft = (patch: Partial<CoinIssuanceConfig>) => {
        const nextValue = { ...draft, ...patch };
        setDraft(nextValue);
        onChange(nextValue);
    };

    const updateSunshineRatio = (sunshineRatio: number) => {
        updateDraft({ sunshineRatio: Math.max(0, Math.min(100, Math.round(sunshineRatio))) });
    };

    const handleSave = () => {
        onChange(draft);
        Message.success('自动发放规则已保存');
    };

    return (
        <div className="bg-white">
            <div className="flex items-center justify-between gap-6 border-b border-[#E5E6EB] px-6 py-5">
                <div className="min-w-0">
                    <h3 className="m-0 text-base font-semibold leading-6 text-[#1D2129]">开启校园币发放</h3>
                    <p className="mt-1 text-xs leading-5 text-[#86909C]">开启后，系统将按设置的周期和预算自动向学生发放校园币</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                    <span className={`text-sm ${draft.enabled ? 'text-[#00B42A]' : 'text-[#86909C]'}`}>
                        {draft.enabled ? '已开启' : '已关闭'}
                    </span>
                    <Switch
                        checked={draft.enabled}
                        onChange={(enabled) => updateDraft({ enabled })}
                        aria-label="开启校园币发放"
                    />
                </div>
            </div>

            <div className="px-6">
                {draft.enabled && (
                    <div>
                        <section className="border-b border-[#E5E6EB] py-6">
                            <h4 className="m-0 mb-5 text-base font-semibold leading-6 text-[#1D2129]">发放条件</h4>
                            <div className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-y-5">
                                <span className="text-sm text-[#4E5969]">发放周期</span>
                                <Radio.Group
                                    type="button"
                                    value={draft.period}
                                    onChange={(period) => updateDraft({ period: period as CoinIssuanceConfig['period'] })}
                                >
                                    <Radio value="weekly">每周一发放</Radio>
                                    <Radio value="monthly">每月一号发放</Radio>
                                </Radio.Group>

                                <span className="text-sm text-[#4E5969]">发放门槛</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-[#1D2129]">
                                        {draft.period === 'weekly' ? '本周至少评价' : '本月至少评价'}
                                    </span>
                                    <InputNumber
                                        min={1}
                                        precision={0}
                                        value={draft.minimumEvaluationCount}
                                        onChange={(count) => updateDraft({ minimumEvaluationCount: normalizePositiveInteger(count) })}
                                        style={{ width: 88 }}
                                        aria-label={`${draft.period === 'weekly' ? '本周' : '本月'}评价次数`}
                                    />
                                    <span className="text-sm text-[#4E5969]">次</span>
                                </div>
                            </div>
                            <div className="mt-5 flex items-start gap-2 border-t border-[#F2F3F5] pt-4 text-xs leading-5 text-[#86909C]">
                                <Info size={14} className="mt-0.5 shrink-0" />
                                <span>一次评价可包含多名学生，按老师发起的评价行为计 1 次。</span>
                            </div>
                        </section>

                        <section className="border-b border-[#E5E6EB] py-6">
                            <h4 className="m-0 mb-5 text-base font-semibold leading-6 text-[#1D2129]">发放数量</h4>
                            <div className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-y-5">
                                <span className="text-sm text-[#4E5969]">预算设置</span>
                                <Radio.Group
                                    type="button"
                                    value={draft.budgetMode}
                                    onChange={(budgetMode) => updateDraft({
                                        budgetMode: budgetMode as CoinIssuanceConfig['budgetMode'],
                                        budgetAmount: budgetMode === 'per_student' ? 10 : 500,
                                    })}
                                >
                                    <Radio value="per_class">按班</Radio>
                                    <Radio value="per_student">按人</Radio>
                                </Radio.Group>

                                <span className="text-sm text-[#4E5969]">
                                    {draft.budgetMode === 'per_student' ? '每人预算' : '每班预算'}
                                </span>
                                <div className="flex items-center gap-2">
                                    <InputNumber
                                        min={0.01}
                                        precision={2}
                                        value={draft.budgetAmount}
                                        onChange={(amount) => updateDraft({ budgetAmount: normalizeBudgetAmount(amount) })}
                                        style={{ width: 160 }}
                                        aria-label={draft.budgetMode === 'per_student' ? '每人预算' : '每班预算'}
                                    />
                                    <span className="text-sm text-[#4E5969]">校园币</span>
                                </div>
                            </div>
                            {draft.budgetMode === 'per_student' && (
                                <div className="mt-5 flex items-center gap-2 border-t border-[#F2F3F5] pt-4 text-xs leading-5 text-[#86909C]">
                                    <Coins size={14} className="shrink-0 text-[#FF7D00]" />
                                    <span>
                                        一个班50人，则班级预算为 <span className="tabular-nums">{formatCoinAmount(draft.budgetAmount)}</span> × 50 = <span className="tabular-nums">{formatCoinAmount(classBudgetTotal)}</span> 币
                                    </span>
                                </div>
                            )}
                        </section>

                        <section className="border-b border-[#E5E6EB] py-6">
                            <div className="mb-5 flex items-center justify-between">
                                <h4 className="m-0 text-base font-semibold leading-6 text-[#1D2129]">奖励分配</h4>
                                <span className="text-xs text-[#86909C]">两项比例合计 100%</span>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-[160px_minmax(0,1fr)_80px] items-center gap-x-5">
                                    <span className="text-sm text-[#4E5969]">阳光保底比例</span>
                                    <Slider
                                        min={0}
                                        max={100}
                                        value={draft.sunshineRatio}
                                        onChange={(ratio) => updateSunshineRatio(Number(ratio))}
                                        aria-label={`阳光保底比例 ${draft.sunshineRatio}%`}
                                    />
                                    <InputNumber
                                        min={0}
                                        max={100}
                                        precision={0}
                                        value={draft.sunshineRatio}
                                        onChange={(ratio) => updateSunshineRatio(Number(ratio))}
                                        suffix="%"
                                        aria-label="阳光保底比例"
                                    />
                                    <p className="col-span-3 m-0 text-xs leading-5 text-[#86909C]">每个学生无论评价如何，都可以获得的成长奖励</p>
                                </div>

                                <div className="grid grid-cols-[160px_minmax(0,1fr)_80px] items-center gap-x-5">
                                    <span className="text-sm text-[#4E5969]">积分排行比例</span>
                                    <Slider
                                        min={0}
                                        max={100}
                                        value={rankingRatio}
                                        onChange={(ratio) => updateSunshineRatio(100 - Number(ratio))}
                                        aria-label={`积分排行比例 ${rankingRatio}%`}
                                    />
                                    <InputNumber
                                        min={0}
                                        max={100}
                                        precision={0}
                                        value={rankingRatio}
                                        onChange={(ratio) => updateSunshineRatio(100 - Number(ratio))}
                                        suffix="%"
                                        aria-label="积分排行比例"
                                    />
                                    <p className="col-span-3 m-0 text-xs leading-5 text-[#86909C]">评分为正的学生，按比例分配的排名奖励</p>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[#F2F3F5] pt-5">
                                <div className="border-l-2 border-[#00B42A] bg-[#F2FFEA] px-4 py-3">
                                    <div className="text-xs text-[#4E5969]">全班平分：</div>
                                    <div className="mt-1 text-xl font-semibold tabular-nums text-[#008A2E]">{formatCoinAmount(sunshineAmount)}币</div>
                                </div>
                                <div className="border-l-2 border-[#FF7D00] bg-[#FFF7E8] px-4 py-3">
                                    <div className="text-xs text-[#4E5969]">奖池金额：</div>
                                    <div className="mt-1 text-xl font-semibold tabular-nums text-[#D25F00]">{formatCoinAmount(rankingAmount)}币</div>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </div>

            {draft.enabled && (
                <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[#E5E6EB] px-6 py-4">
                    <Button type="primary" onClick={handleSave}>保存规则</Button>
                </div>
            )}
        </div>
    );
};

export default CoinIssuanceSettings;
