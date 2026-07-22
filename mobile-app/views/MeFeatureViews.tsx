import React from 'react';
import {
    BookOpen,
    Check,
    ChevronRight,
    CircleHelp,
    Edit3,
    GripVertical,
    ImagePlus,
    KeyRound,
    Lock,
    Plus,
    Shield,
    Trash2,
    X,
} from 'lucide-react';

export interface SchoolSubjectItem {
    id: string;
    name: string;
}

export interface SchoolDepartmentItem {
    id: string;
    name: string;
}

export interface CoinIssuanceConfig {
    enabled: boolean;
    period: 'weekly' | 'monthly';
    classBudget: number;
    sunshineRatio: number;
}

interface SettingsViewProps {
    onLogout: () => void;
}

interface SubjectManagementViewProps {
    subjects: SchoolSubjectItem[];
    draggingSubjectId: string | null;
    onAdd: () => void;
    onEdit: (item: SchoolSubjectItem) => void;
    onDelete: (item: SchoolSubjectItem) => void;
    onDragStart: (id: string) => void;
    onDragOver: (targetId: string) => void;
    onDragEnd: () => void;
}

interface DepartmentManagementViewProps {
    departments: SchoolDepartmentItem[];
    onAdd: () => void;
    onEdit: (item: SchoolDepartmentItem) => void;
    onDelete: (item: SchoolDepartmentItem) => void;
}

interface CoinIssuanceViewProps {
    config: CoinIssuanceConfig;
    onChange: (config: CoinIssuanceConfig) => void;
    onSave: () => void;
}

interface SuggestionFeedbackViewProps {
    text: string;
    images: string[];
    onTextChange: (text: string) => void;
    onAddImage: () => void;
    onRemoveImage: (index: number) => void;
    onSubmit: () => void;
}

const FeaturePageBody: React.FC<{ children: React.ReactNode; footer?: React.ReactNode }> = ({ children, footer }) => (
    <div className="relative flex min-h-full flex-col text-[var(--tm-text-primary)]">
        <div className={`flex-1 space-y-4 overflow-y-auto px-5 py-4 no-scrollbar ${footer ? 'pb-28' : 'pb-8'}`}>{children}</div>
        {footer && <div className="absolute inset-x-0 bottom-0 z-20 border-t border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-glass)] px-5 py-4 shadow-[0_-10px_28px_-24px_var(--tm-shadow-neutral-color)] backdrop-blur-xl">{footer}</div>}
    </div>
);

const FeaturePanel: React.FC<{ children: React.ReactNode; className?: string; allowOverflow?: boolean }> = ({ children, className = '', allowOverflow = false }) => (
    <section className={`${allowOverflow ? 'overflow-visible' : 'overflow-hidden'} rounded-[24px] bg-[var(--tm-bg-surface-glass)] shadow-[0_12px_32px_-26px_var(--tm-shadow-neutral-color)] backdrop-blur-sm ${className}`}>
        {children}
    </section>
);

const featurePrimaryButtonClass = 'flex h-12 w-full items-center justify-center gap-2 rounded-[20px] bg-[var(--tm-brand-primary)] text-[14px] font-bold text-white shadow-[0_16px_30px_-24px_var(--tm-shadow-brand-color)] transition active:scale-[0.99] active:bg-[var(--tm-brand-primary-pressed)]';
const featureListRowClass = 'flex min-h-[60px] items-center gap-1 border-b border-[var(--tm-border-subtle)]/70 px-3 last:border-b-0';
const featureEditButtonClass = 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tm-text-secondary)] transition active:bg-[var(--tm-brand-primary-soft)] active:text-[var(--tm-brand-primary)]';
const featureDeleteButtonClass = 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tm-status-negative)] transition active:bg-[var(--tm-status-negative-soft)]';

const SwitchControl: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
    <button
        type="button"
        onClick={() => onChange(!checked)}
        className="flex h-11 w-14 items-center justify-center transition active:scale-95"
        aria-label={label}
        aria-pressed={checked}
    >
        <span className={`relative block h-7 w-12 rounded-full p-[3px] transition ${checked ? 'bg-[var(--tm-brand-primary)]' : 'bg-[var(--tm-bg-surface-muted)]'}`}>
            <span className={`block h-[22px] w-[22px] rounded-full bg-white shadow-sm transition ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </span>
    </button>
);

const ActionRow: React.FC<{ icon?: React.ElementType; title: string; value?: string; onClick?: () => void }> = ({ icon: Icon, title, value, onClick }) => (
    <button type="button" onClick={onClick} className="flex min-h-[54px] w-full items-center justify-between gap-3 border-b border-[var(--tm-border-subtle)] px-4 text-left last:border-b-0 active:bg-[var(--tm-bg-surface-soft)]">
        <span className="flex min-w-0 items-center gap-3 text-[14px] font-semibold text-[var(--tm-text-primary)]">
            {Icon && <Icon className="h-4.5 w-4.5 shrink-0 text-[var(--tm-text-secondary)]" strokeWidth={2.1} />}
            <span className="truncate">{title}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2 text-[13px] font-medium text-[var(--tm-text-tertiary)]">
            {value}
            <ChevronRight className="h-4 w-4" strokeWidth={2.1} />
        </span>
    </button>
);

export const MineSettingsView: React.FC<SettingsViewProps> = ({ onLogout }) => (
    <FeaturePageBody>
        <FeaturePanel>
            <div className="px-4 py-3 text-[14px] font-bold text-[var(--tm-text-primary)]">账号安全</div>
            <ActionRow icon={Shield} title="登录账号" value="139****0121" />
            <ActionRow icon={KeyRound} title="修改密码" />
        </FeaturePanel>

        <FeaturePanel>
            <ActionRow icon={Lock} title="隐私协议" />
            <ActionRow icon={BookOpen} title="用户协议" />
        </FeaturePanel>

        <button type="button" onClick={onLogout} className="h-12 w-full rounded-[20px] bg-[var(--tm-bg-surface-glass)] text-[14px] font-semibold text-[var(--tm-status-negative)] shadow-[0_12px_32px_-26px_var(--tm-shadow-neutral-color)] backdrop-blur-sm transition active:scale-[0.99] active:bg-[var(--tm-status-negative-soft)]">
            退出登录
        </button>
    </FeaturePageBody>
);

export const SubjectManagementView: React.FC<SubjectManagementViewProps> = ({ subjects, draggingSubjectId, onAdd, onEdit, onDelete, onDragStart, onDragOver, onDragEnd }) => (
    <FeaturePageBody>
        <FeaturePanel>
            <div>
                {subjects.map(item => (
                    <div
                        key={item.id}
                        draggable
                        onDragStart={() => onDragStart(item.id)}
                        onDragOver={(event) => {
                            event.preventDefault();
                            onDragOver(item.id);
                        }}
                        onDragEnd={onDragEnd}
                        className={`${featureListRowClass} transition ${draggingSubjectId === item.id ? 'bg-[var(--tm-brand-primary-soft)] opacity-70' : 'bg-transparent opacity-100'}`}
                    >
                        <span className="flex h-11 w-9 shrink-0 cursor-grab items-center justify-center text-[var(--tm-text-disabled)] active:cursor-grabbing active:text-[var(--tm-brand-primary)]" aria-label="拖动排序">
                            <GripVertical className="h-4.5 w-4.5" />
                        </span>
                        <button type="button" onClick={() => onEdit(item)} className="min-w-0 flex-1 truncate text-left text-[14px] font-semibold text-[var(--tm-text-primary)]">{item.name}</button>
                        <button type="button" onClick={() => onEdit(item)} className={featureEditButtonClass} aria-label={`修改${item.name}`}>
                            <Edit3 className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => onDelete(item)} className={featureDeleteButtonClass} aria-label={`删除${item.name}`}>
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </FeaturePanel>
        <button type="button" onClick={onAdd} className={featurePrimaryButtonClass}>
            <Plus className="h-4 w-4" />
            新增科目
        </button>
    </FeaturePageBody>
);

export const DepartmentManagementView: React.FC<DepartmentManagementViewProps> = ({ departments, onAdd, onEdit, onDelete }) => (
    <FeaturePageBody>
        <FeaturePanel>
            <div>
                {departments.map(item => (
                    <div key={item.id} className={`${featureListRowClass} pl-4`}>
                        <button type="button" onClick={() => onEdit(item)} className="min-w-0 flex-1 truncate text-left text-[14px] font-semibold text-[var(--tm-text-primary)]">{item.name}</button>
                        <button type="button" onClick={() => onEdit(item)} className={featureEditButtonClass} aria-label={`修改${item.name}`}>
                            <Edit3 className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => onDelete(item)} className={featureDeleteButtonClass} aria-label={`删除${item.name}`}>
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </FeaturePanel>
        <button type="button" onClick={onAdd} className={featurePrimaryButtonClass}>
            <Plus className="h-4 w-4" />
            新增部门
        </button>
    </FeaturePageBody>
);

export const CoinIssuanceView: React.FC<CoinIssuanceViewProps> = ({ config, onChange, onSave }) => {
    const [showIssuanceHelp, setShowIssuanceHelp] = React.useState(false);
    const issuanceHelpId = React.useId();
    const rankingRatio = 100 - config.sunshineRatio;
    const update = (patch: Partial<CoinIssuanceConfig>) => onChange({ ...config, ...patch });
    const sunshineAmount = Math.round(config.classBudget * config.sunshineRatio / 100);
    const rankingAmount = config.classBudget - sunshineAmount;

    return (
        <FeaturePageBody>
            <FeaturePanel className="relative z-10 px-4 py-2" allowOverflow>
                <div className="flex min-h-[60px] items-center justify-between gap-3">
                    <div className="relative flex min-w-0 items-center gap-1">
                        <span className="truncate text-[14px] font-bold text-[var(--tm-text-primary)]">开启货币发放</span>
                        <button
                            type="button"
                            className="flex h-11 w-11 shrink-0 touch-manipulation select-none items-center justify-center rounded-full text-[var(--tm-text-disabled)] outline-none transition active:bg-[var(--tm-brand-primary-soft)] active:text-[var(--tm-brand-primary)] focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary-soft-strong)]"
                            aria-label="查看货币发放说明"
                            aria-describedby={showIssuanceHelp ? issuanceHelpId : undefined}
                            aria-expanded={showIssuanceHelp}
                            onPointerDown={() => setShowIssuanceHelp(true)}
                            onPointerUp={() => setShowIssuanceHelp(false)}
                            onPointerCancel={() => setShowIssuanceHelp(false)}
                            onPointerLeave={() => setShowIssuanceHelp(false)}
                            onFocus={() => setShowIssuanceHelp(true)}
                            onBlur={() => setShowIssuanceHelp(false)}
                            onContextMenu={(event) => event.preventDefault()}
                        >
                            <CircleHelp className="h-4 w-4" aria-hidden="true" />
                        </button>
                        {showIssuanceHelp && (
                            <div id={issuanceHelpId} role="tooltip" className="pointer-events-none absolute left-0 top-full z-30 w-[260px] max-w-[calc(100vw-64px)] rounded-2xl bg-[var(--tm-text-primary)] px-3.5 py-3 text-[12px] font-medium leading-5 text-white shadow-[0_14px_32px_-20px_var(--tm-shadow-neutral-color)]">
                                开启后，系统将按设置的周期和预算自动向班级发放货币。
                            </div>
                        )}
                    </div>
                    <SwitchControl checked={config.enabled} onChange={(enabled) => update({ enabled })} label="开启货币发放" />
                </div>
            </FeaturePanel>

            {config.enabled && (
                <FeaturePanel className="space-y-4 p-4">
                    <label className="block">
                        <span className="text-[13px] font-semibold text-[var(--tm-text-secondary)]">发放周期</span>
                        <select value={config.period} onChange={(event) => update({ period: event.target.value as CoinIssuanceConfig['period'] })} className="mt-2 h-12 w-full rounded-2xl border-0 bg-[var(--tm-bg-surface-soft)] px-4 text-[14px] font-semibold text-[var(--tm-text-primary)] outline-none focus:ring-2 focus:ring-[var(--tm-brand-primary-soft-strong)]">
                            <option value="weekly">每周一发放</option>
                            <option value="monthly">每月一号发放</option>
                        </select>
                    </label>

                    <label className="block">
                        <span className="text-[13px] font-semibold text-[var(--tm-text-secondary)]">班级总预算</span>
                        <div className="mt-2 flex min-h-12 items-center gap-2 rounded-2xl bg-[var(--tm-bg-surface-soft)] px-4 focus-within:ring-2 focus-within:ring-[var(--tm-brand-primary-soft-strong)]">
                            <input type="number" min={0} value={config.classBudget} onChange={(event) => update({ classBudget: Number(event.target.value || 0) })} className="h-9 min-w-0 flex-1 border-0 bg-transparent px-1 text-left text-[14px] font-bold tabular-nums text-[var(--tm-text-primary)] outline-none" aria-label="班级总预算" />
                            <span className="shrink-0 text-[13px] font-semibold text-[var(--tm-brand-reward-strong)]">币/班</span>
                        </div>
                    </label>

                    <label className="block border-t border-[var(--tm-border-subtle)] pt-4">
                        <div className="flex items-center justify-between text-[14px] font-bold text-[var(--tm-text-primary)]">
                            <span>阳光保底比例</span>
                            <span className="tabular-nums text-[var(--tm-brand-primary)]">{config.sunshineRatio}%</span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={100}
                            step={1}
                            value={config.sunshineRatio}
                            onChange={(event) => update({ sunshineRatio: Number(event.target.value) })}
                            className="mt-1 h-11 w-full cursor-pointer appearance-none border-0 bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary-soft-strong)] [&::-moz-range-progress]:border-0 [&::-moz-range-progress]:bg-transparent [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[var(--tm-brand-primary)] [&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:border-0 [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:border-0 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:-mt-1.5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:bg-[var(--tm-brand-primary)]"
                            style={{
                                backgroundImage: `linear-gradient(to right, var(--tm-brand-primary) 0%, var(--tm-brand-primary) ${config.sunshineRatio}%, var(--tm-brand-primary-soft-strong) ${config.sunshineRatio}%, var(--tm-brand-primary-soft-strong) 100%)`,
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '100% 8px',
                            }}
                            aria-label={`阳光保底比例 ${config.sunshineRatio}%`}
                        />
                        <div className="mt-2 text-[12px] font-semibold text-[var(--tm-text-secondary)]">全班平分：<span className="tabular-nums text-[var(--tm-brand-reward-strong)]">{sunshineAmount}币</span></div>
                    </label>

                    <div className="border-t border-[var(--tm-border-subtle)] pt-4">
                        <div className="flex items-center justify-between text-[14px] font-bold text-[var(--tm-text-primary)]">
                            <span>积分排行比例</span>
                            <span className="tabular-nums text-[var(--tm-brand-reward-strong)]">{rankingRatio}%</span>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--tm-brand-reward-soft)]">
                            <div className="h-full rounded-full bg-[var(--tm-brand-reward)]" style={{ width: `${rankingRatio}%` }} />
                        </div>
                        <div className="mt-2 text-[12px] font-semibold text-[var(--tm-text-secondary)]">奖池金额：<span className="tabular-nums text-[var(--tm-brand-reward-strong)]">{rankingAmount}币</span></div>
                    </div>

                    <button type="button" onClick={onSave} className={featurePrimaryButtonClass}>
                        保存
                    </button>
                </FeaturePanel>
            )}
        </FeaturePageBody>
    );
};

export const SuggestionFeedbackView: React.FC<SuggestionFeedbackViewProps> = ({ text, images, onTextChange, onAddImage, onRemoveImage, onSubmit }) => {
    const canSubmit = Boolean(text.trim());
    const canAddImage = images.length < 5;

    return (
        <FeaturePageBody
            footer={(
                <button type="button" disabled={!canSubmit} onClick={onSubmit} className={`h-12 w-full rounded-[20px] text-[14px] font-bold transition ${canSubmit ? 'bg-[var(--tm-brand-primary)] text-white shadow-[0_16px_30px_-24px_var(--tm-shadow-brand-color)] active:scale-[0.99] active:bg-[var(--tm-brand-primary-pressed)]' : 'bg-[var(--tm-bg-surface-muted)] text-[var(--tm-text-disabled)]'}`}>
                    提交
                </button>
            )}
        >
            <FeaturePanel className="p-4 focus-within:shadow-[0_0_0_2px_var(--tm-brand-primary-soft-strong),0_12px_32px_-26px_var(--tm-shadow-neutral-color)]">
                <textarea value={text} onChange={(event) => onTextChange(event.target.value)} className="min-h-[156px] w-full resize-none bg-transparent text-[14px] leading-6 text-[var(--tm-text-primary)] outline-none placeholder:text-[var(--tm-text-disabled)]" placeholder="请输入建议或问题" aria-label="反馈内容" />
            </FeaturePanel>

            <FeaturePanel className="p-4">
                <div className="flex items-center justify-between">
                    <div className="text-[14px] font-bold text-[var(--tm-text-primary)]">上传图片</div>
                    <div className="text-[12px] font-semibold tabular-nums text-[var(--tm-text-disabled)]">{images.length}/5</div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                    {images.map((image, index) => (
                        <div key={`${image}-${index}`} className="relative flex aspect-square items-center justify-center rounded-2xl bg-[var(--tm-bg-surface-soft)] text-[12px] font-semibold text-[var(--tm-text-secondary)]">
                            {image}
                            <button type="button" onClick={() => onRemoveImage(index)} className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--tm-status-negative)] text-white shadow-[0_8px_18px_-12px_var(--tm-shadow-neutral-color)]" aria-label={`删除第${index + 1}张反馈图片`}>
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ))}
                    {canAddImage && (
                        <button type="button" onClick={onAddImage} className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--tm-brand-primary-soft-strong)] bg-white text-[12px] font-semibold text-[var(--tm-brand-primary)] transition active:bg-[var(--tm-brand-primary-soft)]" aria-label="上传反馈图片">
                            <ImagePlus className="h-5 w-5" />
                            上传图片
                        </button>
                    )}
                </div>
            </FeaturePanel>
        </FeaturePageBody>
    );
};

interface EditSheetProps {
    title: string;
    value: string;
    placeholder: string;
    onChange: (value: string) => void;
    onCancel: () => void;
    onConfirm: () => void;
}

export const TextEditSheet: React.FC<EditSheetProps> = ({ title, value, placeholder, onChange, onCancel, onConfirm }) => (
    <div className="absolute inset-0 z-[100] flex items-end bg-[var(--tm-mask)] px-4 pb-4 backdrop-blur-[2px]" onClick={onCancel}>
        <section className="w-full rounded-[28px] bg-[var(--tm-bg-surface-glass)] p-4 shadow-[0_28px_80px_-42px_var(--tm-shadow-neutral-color)] backdrop-blur-xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
                <button type="button" onClick={onCancel} className="h-9 px-2 text-[13px] font-semibold text-[var(--tm-text-secondary)]">取消</button>
                <div className="text-[16px] font-bold text-[var(--tm-text-primary)]">{title}</div>
                <button type="button" onClick={onConfirm} className="flex h-9 items-center gap-1 rounded-full bg-[var(--tm-brand-primary-soft)] px-3 text-[13px] font-bold text-[var(--tm-brand-primary)] active:bg-[var(--tm-brand-primary-soft-strong)]">
                    <Check className="h-3.5 w-3.5" />
                    完成
                </button>
            </div>
            <input value={value} onChange={(event) => onChange(event.target.value)} autoFocus placeholder={placeholder} className="h-12 w-full rounded-2xl border-0 bg-[var(--tm-bg-surface-soft)] px-4 text-[14px] font-semibold text-[var(--tm-text-primary)] outline-none placeholder:text-[var(--tm-text-disabled)] focus:ring-2 focus:ring-[var(--tm-brand-primary-soft-strong)]" />
        </section>
    </div>
);

interface ConfirmSheetProps {
    title: string;
    onCancel: () => void;
    onConfirm: () => void;
}

export const DeleteConfirmSheet: React.FC<ConfirmSheetProps> = ({ title, onCancel, onConfirm }) => (
    <div className="absolute inset-0 z-[100] flex items-end bg-[var(--tm-mask)] px-4 pb-4 backdrop-blur-[2px]" onClick={onCancel}>
        <section className="w-full rounded-[28px] bg-[var(--tm-bg-surface-glass)] p-4 shadow-[0_28px_80px_-42px_var(--tm-shadow-neutral-color)] backdrop-blur-xl" onClick={(event) => event.stopPropagation()}>
            <div className="px-2 pb-4 pt-1 text-center text-[16px] font-bold text-[var(--tm-text-primary)]">{title}</div>
            <button type="button" onClick={onConfirm} className="h-12 w-full rounded-[20px] bg-[var(--tm-status-negative-soft)] text-[14px] font-bold text-[var(--tm-status-negative)] active:bg-[var(--tm-status-negative)] active:text-white">
                删除
            </button>
            <button type="button" onClick={onCancel} className="mt-2 h-12 w-full rounded-[20px] bg-[var(--tm-bg-surface-soft)] text-[14px] font-bold text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-muted)]">
                取消
            </button>
        </section>
    </div>
);
