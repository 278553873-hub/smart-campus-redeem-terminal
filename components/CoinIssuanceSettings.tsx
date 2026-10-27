import { useGrowthCoinTerms } from './GrowthCoinBranding';
import GrowthCoinBrandFields, { useCoinBrandingEditor } from './GrowthCoinBrandFields';
import GrowthCoinRuleDescription from './GrowthCoinRuleDescription';
import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, InputNumber, Modal, Message, Radio, Select, Slider, Switch, Tabs } from '@arco-design/web-react';
import { Coins, Info } from 'lucide-react';
import type { CoinIssuanceConfig } from '../mobile-app/types';
import { getClassBudgetTotal } from '../mobile-app/domain/campusCoinIssuance';
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
    const [activeTab, setActiveTab] = useState('rules');
    const brandingEditor = useCoinBrandingEditor();
    const coinTerms = useGrowthCoinTerms();
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
    const sunshineAmount = Math.round(classBudgetTotal * draft.sunshineRatio / 100);
    const rankingAmount = classBudgetTotal - sunshineAmount;

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

    const notice = confirmation && getCoinRuleConfirmation(confirmation.before, confirmation.after);

    return (
        <div className="pc-form bg-white">
            <div className="flex items-center justify-between gap-6 border-b border-[#E5E6EB] px-6 py-5">
                <div className="min-w-0">
                    <h3 className="m-0 text-base font-semibold leading-6 text-[#1D2129]">开启成长币发放</h3>
                    <p className="mt-1 text-xs leading-5 text-[#86909C]">{GROWTH_COIN_ENABLE_HELP}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                    <span className={`text-sm ${draft.enabled ? 'text-[#00B42A]' : 'text-[#86909C]'}`}>
                        {draft.enabled ? '已开启' : '已关闭'}
                    </span>
                    <Switch
                        checked={draft.enabled}
                        onChange={(enabled) => { updateDraft({ enabled }); if (enabled) setActiveTab('rules'); }}
                        aria-label={'开启成长币发放'}
                    />
                </div>
            </div>

            <div>
                {draft.enabled && (
                    <Tabs type="card" lazyload={false} activeTab={activeTab} onChange={setActiveTab} className="pc-card-tabs-surface mt-4 mb-4" style={{ '--pc-tab-content-inline': '40px' } as React.CSSProperties}>
                        <Tabs.TabPane key="rules" title="发放规则">
                            <div className="space-y-4">
                            {pendingChange && <p role="status" className="text-sm text-[#4E5969]">以下包含此前未生效的修改，保存后将立即生效。</p>}
                        <Card>
                            <div className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-y-5">
                                <span className="text-sm text-[#4E5969]">发放方式</span>
                                <Radio.Group type="button" value={mode} onChange={mode => updateDraft({ mode })} aria-label="成长币发放方式">
                                    {GROWTH_COIN_MODES.map(item => <Radio key={item.value} value={item.value}>{item.label}</Radio>)}
                                </Radio.Group>
                            </div>
                            <p className="mt-4 text-xs leading-5 text-[#86909C]">
                                <GrowthCoinRuleDescription mode={mode} />
                            </p>
                        </Card>
                        {mode === 'score' ? (<>
                            <Card>
                                <h4 className="m-0 mb-5 text-base font-semibold leading-6 text-[#1D2129]">发放数量</h4>
                                <div className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-y-5">
                                    <span className="text-sm text-[#4E5969]">发放规则</span>
                                    <div className="flex items-center gap-2 whitespace-nowrap text-sm">
                                        <span>1分=</span>
                                        <InputNumber min={0.01} precision={2} value={scoreRule.coinsPerPoint}
                                            onChange={amount => updateDraft({ scoreRule: { ...scoreRule, coinsPerPoint: normalizeBudgetAmount(amount) } })}
                                            hideControl className="[&_.arco-input-inner-wrapper]:!px-1 [&_input]:!px-0 [&_input]:text-center"
                                            style={{ width: 88, flexShrink: 0 }} aria-label="每加1分获得的成长币" />
                                        <span>币</span>
                                    </div>
                                </div>
                            </Card>
                            <Card>
                                <h4 className="m-0 mb-5 text-base font-semibold leading-6 text-[#1D2129]">发放上限</h4>
                                <div className="grid auto-rows-[32px] grid-cols-[120px_minmax(0,1fr)] content-start items-center gap-y-5">
                                    <span className="text-sm text-[#4E5969]">限制发放数量</span>
                                    <Switch checked={scoreRule.limitEnabled} aria-label="限制发放数量"
                                        onChange={limitEnabled => updateDraft({ scoreRule: { ...scoreRule, limitEnabled } })} />
                                    {scoreRule.limitEnabled && <>
                                        <span className="text-sm text-[#4E5969]">上限规则</span>
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
                            </Card>
                        </>) : (<>
                        <Card>
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
                        </Card>

                        <Card>
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
                                    <span className="text-sm text-[#4E5969]">{coinTerms.name}</span>
                                </div>
                            </div>
                            {draft.budgetMode === 'per_student' && (
                                <div className="mt-5 flex items-start gap-2 border-t border-[#F2F3F5] pt-4 text-xs leading-5 text-[#86909C]">
                                    <Coins size={14} className="shrink-0 text-[#FF7D00]" />
                                    <p>
                                        {[30, 50].map((count, index) => (
                                            <React.Fragment key={count}>{index > 0 && '；'}如果一个班{count}人，则班级预算为 <span className="tabular-nums">{formatCoinAmount(draft.budgetAmount)} × {count} = {formatCoinAmount(draft.budgetAmount * count)} 币</span></React.Fragment>
                                        ))}。
                                    </p>
                                </div>
                            )}
                        </Card>

                        <Card>
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
                                    <div className="text-xs text-[#4E5969]">全班平分：<span className="text-xl font-semibold tabular-nums text-[#008A2E]">{formatCoinAmount(sunshineAmount)}币</span>{draft.budgetMode === 'per_student' && <span className="font-medium text-[#86909C]">（假设1个班{SAMPLE_CLASS_SIZE}人）</span>}</div>
                                </div>
                                <div className="border-l-2 border-[#FF7D00] bg-[#FFF7E8] px-4 py-3">
                                    <div className="text-xs text-[#4E5969]">奖池金额：</div>
                                    <div className="mt-1 text-xl font-semibold tabular-nums text-[#D25F00]">{formatCoinAmount(rankingAmount)}币</div>
                                </div>
                            </div>
                        </Card>
                        </>)}
                            </div>
                        </Tabs.TabPane>
                        <Tabs.TabPane key="branding" title="名称与图标">
                            <Card>
                                <GrowthCoinBrandFields editor={brandingEditor} variant="pc" />
                            </Card>
                        </Tabs.TabPane>
                    </Tabs>
                )}
            </div>

            {(!draft.enabled || activeTab === 'rules') && <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[#E5E6EB] px-6 py-4">
                <Button type="primary" disabled={brandingEditor.busy} onClick={handleSave}>保存</Button>
            </div>}
        <Modal visible={Boolean(confirmation)} title={notice?.title} maskClosable={!saving} escToExit={!saving} closable={!saving}
            onCancel={() => { if (!saving) setConfirmation(null); }}
            footer={<><Button disabled={saving} onClick={() => setConfirmation(null)}>取消</Button><Button type="primary" loading={saving} onClick={confirmSave}>同意并立即生效</Button></>}>
            {notice && <div className="space-y-4 text-sm leading-6 text-[#1D2129]">
                <p className="m-0 leading-7">{notice.message}</p>
            </div>}
        </Modal>
        </div>
    );
};

export default CoinIssuanceSettings;
