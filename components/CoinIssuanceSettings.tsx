import GrowthCoinRuleDescription from './GrowthCoinRuleDescription';
import React, { useEffect, useMemo, useState } from 'react';
import { Button, InputNumber, Modal, Message, Radio, Select, Slider, Switch } from '@arco-design/web-react';
import type { CoinIssuanceConfig } from '../mobile-app/types';
import { getClassBudgetTotal, roundCoinAmount } from '../mobile-app/domain/campusCoinIssuance';
import { getGrowthCoinMode, getScoreCoinRule, GROWTH_COIN_ENABLE_HELP, GROWTH_COIN_MODES } from '../shared/growthCoinRules';

interface CoinIssuanceSettingsProps {
    value: CoinIssuanceConfig;
    onChange: (value: CoinIssuanceConfig) => void;
}

import { getEditableGrowthCoinConfig, saveGrowthCoinRule, getEffectiveGrowthCoinConfig } from '../shared/growthCoinRuleSchedule';

import { getCoinRuleConfirmation } from '../shared/coinRuleConfirmation';

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
    const [draft, setDraft] = useState(() => getEditableGrowthCoinConfig(value));
    const [confirmation, setConfirmation] = useState<{ before: CoinIssuanceConfig; after: CoinIssuanceConfig } | null>(null);
    const [saving, setSaving] = useState(false);
    const savingRef = React.useRef(false);
    const pendingChange = value.pendingChange && Date.parse(value.pendingChange.effectiveAt) > Date.now() ? value.pendingChange : undefined;

    useEffect(() => {
        setDraft(getEditableGrowthCoinConfig(value));
    }, [value]);

    const mode = getGrowthCoinMode(draft);
    const scoreRule = getScoreCoinRule(draft);
    const rankingRatio = 100 - draft.sunshineRatio;
    const classBudgetTotal = useMemo(() => getClassBudgetTotal({
        budgetMode: draft.budgetMode,
        budgetAmount: draft.budgetAmount,
        classStudentCount: SAMPLE_CLASS_SIZE,
    }), [draft.budgetAmount, draft.budgetMode]);
    const sunshineAmount = roundCoinAmount(classBudgetTotal * draft.sunshineRatio / 100);
    const rankingAmount = roundCoinAmount(classBudgetTotal - sunshineAmount);

    const updateDraft = (patch: Partial<CoinIssuanceConfig>) => {
        const nextValue = { ...draft, ...patch };
        setDraft(nextValue);
    };

    const updateSunshineRatio = (sunshineRatio: number) => {
        updateDraft({ sunshineRatio: Math.max(0, Math.min(100, Math.round(sunshineRatio))) });
    };

    const handleSave = () => {
        const result = saveGrowthCoinRule(value, draft);
        if (result.notice) {
            setConfirmation({ before: getEffectiveGrowthCoinConfig(value), after: result.config });
        } else Message.success('保存成功');
    };

    const confirmSave = async () => {
        if (!confirmation || savingRef.current) return;
        savingRef.current = true;
        setSaving(true);
        try {
            await onChange(saveGrowthCoinRule(value, confirmation.after).config);
            setConfirmation(null);
            Message.success('新规则已生效');
        } catch {
            Message.error('保存失败，原规则仍然有效，请重试');
        } finally { savingRef.current = false; setSaving(false); }
    };

    const hasUnsavedChanges = Boolean(saveGrowthCoinRule(value, draft).notice);
    const notice = confirmation && getCoinRuleConfirmation(confirmation.before, confirmation.after);

    return (
        <div className="pc-form pc-coin-settings bg-white">
            <div className="flex items-center justify-between gap-6 border-b border-[#E5E6EB] px-6 py-6">
                <div className="min-w-0">
                    <h3 className="m-0 text-base font-semibold leading-6 text-[var(--color-text-1)]">开启自动发放</h3>
                    <p className="mt-1 text-[13px] leading-5 text-[var(--color-text-2)]">{GROWTH_COIN_ENABLE_HELP}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm text-[var(--color-text-2)]">
                        {hasUnsavedChanges ? '未保存' : value.enabled ? '已开启' : '已关闭'}
                    </span>
                    <Switch
                        checked={draft.enabled}
                        onChange={(enabled) => updateDraft({ enabled })}
                        aria-label={'开启自动发放'}
                    />
                </div>
            </div>

            <div>
                {draft.enabled && (
                    <div className="px-6">
                            <div className="pc-coin-settings-sections">
                            {pendingChange && <p role="status" className="text-sm text-[var(--color-text-2)]">以下包含此前未生效的修改，保存后将立即生效。</p>}
                        <section className="pc-coin-settings-section">
                            <div className="pc-coin-settings-fields">
                                <span className="text-sm text-[var(--color-text-2)]">发放方式</span>
                                <Radio.Group type="button" value={mode} onChange={mode => updateDraft({ mode })} aria-label="成长币发放方式">
                                    {GROWTH_COIN_MODES.map(item => <Radio key={item.value} value={item.value}>{item.label}</Radio>)}
                                </Radio.Group>
                            </div>
                            <p className="pc-coin-settings-field-help mt-4 text-[13px] leading-5 text-[var(--color-text-2)]">
                                <GrowthCoinRuleDescription mode={mode} />
                            </p>
                        </section>
                        {mode === 'score' ? (<>
                            <section className="pc-coin-settings-section">
                                <h4 className="m-0 mb-4 text-base font-semibold leading-6 text-[var(--color-text-1)]">发放数量</h4>
                                <div className="pc-coin-settings-fields">
                                    <span className="text-sm text-[var(--color-text-2)]">发放规则</span>
                                    <div className="flex items-center gap-2 whitespace-nowrap text-sm">
                                        <span>1分=</span>
                                        <InputNumber min={0.01} precision={2} value={scoreRule.coinsPerPoint}
                                            onChange={amount => updateDraft({ scoreRule: { ...scoreRule, coinsPerPoint: normalizeBudgetAmount(amount) } })}
                                            hideControl className="[&_.arco-input-inner-wrapper]:!px-1 [&_input]:!px-0 [&_input]:text-center"
                                            style={{ width: 88, flexShrink: 0 }} aria-label="每加1分获得的成长币" />
                                        <span>币</span>
                                    </div>
                                </div>
                            </section>
                            <section className="pc-coin-settings-section">
                                <h4 className="m-0 mb-4 text-base font-semibold leading-6 text-[var(--color-text-1)]">发放上限</h4>
                                <div className="pc-coin-settings-fields">
                                    <span className="text-sm text-[var(--color-text-2)]">限制发放数量</span>
                                    <Switch checked={scoreRule.limitEnabled} aria-label="限制发放数量"
                                        onChange={limitEnabled => updateDraft({ scoreRule: { ...scoreRule, limitEnabled } })} />
                                    {scoreRule.limitEnabled && <>
                                        <span className="text-sm text-[var(--color-text-2)]">上限规则</span>
                                        <div className="flex items-center gap-2 whitespace-nowrap text-sm">
                                            <Select value={scoreRule.limitPeriod} aria-label="发放上限周期" style={{ width: 88 }}
                                                onChange={limitPeriod => updateDraft({ scoreRule: { ...scoreRule, limitPeriod } })}
                                                options={[{ value: 'daily', label: '每天' }, { value: 'weekly', label: '每周' }, { value: 'monthly', label: '每月' }]} />
                                            <span>每人</span>
                                            <InputNumber min={0.01} precision={2} value={scoreRule.limitAmount}
                                                onChange={amount => updateDraft({ scoreRule: { ...scoreRule, limitAmount: normalizeBudgetAmount(amount) } })}
                                                hideControl className="[&_.arco-input-inner-wrapper]:!px-1 [&_input]:!px-0 [&_input]:text-center"
                                                style={{ width: 88, flexShrink: 0 }} aria-label="每人每周期发放上限" />
                                            <span>币</span>
                                        </div>
                                    </>}
                                </div>
                            </section>
                        </>) : (<>
                        <section className="pc-coin-settings-section">
                            <h4 className="m-0 mb-4 text-base font-semibold leading-6 text-[var(--color-text-1)]">发放条件</h4>
                            <div className="pc-coin-settings-fields">
                                <span className="text-sm text-[var(--color-text-2)]">发放周期</span>
                                <Radio.Group
                                    type="button"
                                    value={draft.period}
                                    onChange={(period) => updateDraft({ period: period as CoinIssuanceConfig['period'] })}
                                >
                                    <Radio value="weekly">每周一发放</Radio>
                                    <Radio value="monthly">每月一号发放</Radio>
                                </Radio.Group>

                                <span className="text-sm text-[var(--color-text-2)]">发放门槛</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-[var(--color-text-1)]">
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
                                    <span className="text-sm text-[var(--color-text-2)]">次</span>
                                </div>
                            </div>
                            <div className="pc-coin-settings-field-help mt-4 flex items-start gap-2 text-[13px] leading-5 text-[var(--color-text-2)]">
                                <span>班主任评价“全班50名同学积极参加锻炼”，算作1次评价</span>
                            </div>
                        </section>

                        <section className="pc-coin-settings-section">
                            <h4 className="m-0 mb-4 text-base font-semibold leading-6 text-[var(--color-text-1)]">发放数量</h4>
                            <div className="pc-coin-settings-fields">
                                <span className="text-sm text-[var(--color-text-2)]">预算设置</span>
                                <Radio.Group
                                    type="button"
                                    value={draft.budgetMode}
                                    onChange={(budgetMode) => updateDraft({
                                        budgetMode: budgetMode as CoinIssuanceConfig['budgetMode'],
                                        budgetAmount: budgetMode === 'per_student' ? 10 : 500,
                                    })}
                                >
                                    <Radio value="per_student">按人</Radio>
                                    <Radio value="per_class">按班</Radio>
                                </Radio.Group>

                                <span className="text-sm text-[var(--color-text-2)]">
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
                                    <span className="text-sm text-[var(--color-text-2)]">币</span>
                                </div>
                            </div>
                            {draft.budgetMode === 'per_student' && (
                                <div className="pc-coin-settings-field-help mt-4 flex items-start gap-2 text-[13px] leading-5 text-[var(--color-text-2)]">
                                    <p>
                                        {[30, 50].map((count, index) => (
                                            <React.Fragment key={count}>{index > 0 && '；'}如果一个班{count}人，则班级预算为 <span className="tabular-nums">{formatCoinAmount(draft.budgetAmount)} × {count} = {formatCoinAmount(draft.budgetAmount * count)} 币</span></React.Fragment>
                                        ))}。
                                    </p>
                                </div>
                            )}
                        </section>

                        <section className="pc-coin-settings-section">
                            <div className="mb-4 flex items-center justify-between">
                                <h4 className="m-0 text-base font-semibold leading-6 text-[var(--color-text-1)]">奖励分配</h4>
                            </div>

                            <div className="space-y-6">
                                <div className="pc-coin-settings-ratio">
                                    <span className="text-sm text-[var(--color-text-2)]">阳光保底比例</span>
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
                                    <p className="col-span-3 m-0 pc-coin-settings-field-help text-[13px] leading-5 text-[var(--color-text-2)]">每个学生无论评价如何，都可以获得的成长奖励</p>
                                </div>

                                <div className="pc-coin-settings-ratio">
                                    <span className="text-sm text-[var(--color-text-2)]">积分排行比例</span>
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
                                    <p className="col-span-3 m-0 pc-coin-settings-field-help text-[13px] leading-5 text-[var(--color-text-2)]">评分为正的学生，按比例分配的排名奖励</p>
                                </div>
                            </div>

                            <div className="pc-coin-settings-example">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-[var(--color-text-2)]">全班平分：</span><span className="ml-3 font-semibold tabular-nums">{formatCoinAmount(sunshineAmount)}币</span>{draft.budgetMode === 'per_student' && <span className="text-[13px] text-[var(--color-text-2)]">（假设1个班{SAMPLE_CLASS_SIZE}人）</span>}</div>
                                    <div><span className="text-[var(--color-text-2)]">奖池金额：</span><span className="ml-3 font-semibold tabular-nums">{formatCoinAmount(rankingAmount)}币</span>{draft.budgetMode === 'per_student' && <span className="text-[13px] text-[var(--color-text-2)]">（假设1个班{SAMPLE_CLASS_SIZE}人）</span>}</div>
                                </div>
                            </div>
                        </section>
                        </>)}
                            </div>
                    </div>
                )}
            </div>

            <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[#E5E6EB] px-6 py-4">
                {hasUnsavedChanges && <span role="status" className="text-[13px] text-[var(--color-text-2)]">有未保存的修改</span>}
                <Button type="primary" onClick={handleSave}>保存规则</Button>
            </div>
        <Modal visible={Boolean(confirmation)} title={notice?.title} maskClosable={!saving} escToExit={!saving} closable={!saving}
            onCancel={() => { if (!saving) setConfirmation(null); }}
            footer={<><Button disabled={saving} onClick={() => setConfirmation(null)}>取消</Button><Button type="primary" loading={saving} onClick={confirmSave}>同意并立即生效</Button></>}>
            {notice && <div className="space-y-4 text-sm leading-6 text-[var(--color-text-1)]">
                <p className="m-0 leading-7">{notice.message}</p>
            </div>}
        </Modal>
        </div>
    );
};

export default CoinIssuanceSettings;
