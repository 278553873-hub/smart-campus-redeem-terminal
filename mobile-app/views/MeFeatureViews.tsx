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

const PageBody: React.FC<{ children: React.ReactNode; footer?: React.ReactNode }> = ({ children, footer }) => (
    <div className="flex min-h-full flex-col bg-[linear-gradient(180deg,#F8FCFF_0%,#FFFFFF_48%,#F6FAFD_100%)]">
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 pb-28 no-scrollbar">{children}</div>
        {footer && <div className="absolute inset-x-0 bottom-0 z-20 border-t border-white/80 bg-white/86 px-5 py-4 shadow-[0_-14px_34px_-28px_rgba(15,23,42,0.42)] backdrop-blur-xl">{footer}</div>}
    </div>
);

const WhitePanel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <section className={`overflow-hidden rounded-[24px] border border-white/90 bg-white shadow-[0_18px_42px_-34px_rgba(35,96,145,0.34)] ring-1 ring-slate-100/70 ${className}`}>
        {children}
    </section>
);

const SwitchControl: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
    <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-8 w-14 rounded-full p-1 transition ${checked ? 'bg-[#1E9AAA]' : 'bg-slate-200'}`}
        aria-label={label}
        aria-pressed={checked}
    >
        <span className={`block h-6 w-6 rounded-full bg-white shadow-sm transition ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
);

const ActionRow: React.FC<{ icon?: React.ElementType; title: string; value?: string; onClick?: () => void }> = ({ icon: Icon, title, value, onClick }) => (
    <button type="button" onClick={onClick} className="flex min-h-[54px] w-full items-center justify-between gap-3 border-b border-slate-100 px-4 text-left last:border-b-0 active:bg-slate-50">
        <span className="flex min-w-0 items-center gap-3 text-[14px] font-semibold text-slate-900">
            {Icon && <Icon className="h-4.5 w-4.5 shrink-0 text-slate-500" strokeWidth={2.1} />}
            <span className="truncate">{title}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2 text-[13px] font-medium text-slate-400">
            {value}
            <ChevronRight className="h-4 w-4" strokeWidth={2.1} />
        </span>
    </button>
);

export const MineSettingsView: React.FC<SettingsViewProps> = ({ onLogout }) => (
    <PageBody>
        <WhitePanel>
            <div className="px-4 py-3 text-[14px] font-bold text-slate-900">账号安全</div>
            <ActionRow icon={Shield} title="登录账号" value="139****0121" />
            <ActionRow icon={KeyRound} title="修改密码" />
        </WhitePanel>

        <WhitePanel>
            <ActionRow icon={Lock} title="隐私协议" />
            <ActionRow icon={BookOpen} title="用户协议" />
        </WhitePanel>

        <button type="button" onClick={onLogout} className="h-12 w-full rounded-[20px] border border-slate-100 bg-white text-[14px] font-semibold text-rose-500 shadow-[0_14px_32px_-28px_rgba(15,23,42,0.32)] active:bg-rose-50">
            退出登录
        </button>
    </PageBody>
);

export const SubjectManagementView: React.FC<SubjectManagementViewProps> = ({ subjects, draggingSubjectId, onAdd, onEdit, onDelete, onDragStart, onDragOver, onDragEnd }) => (
    <PageBody>
        <WhitePanel className="p-3">
            <div className="space-y-2">
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
                        className={`flex min-h-[58px] items-center gap-2 rounded-2xl bg-slate-50 px-3 transition ${draggingSubjectId === item.id ? 'opacity-55' : 'opacity-100'}`}
                    >
                        <span className="flex h-10 w-8 shrink-0 cursor-grab items-center justify-center rounded-xl text-slate-400 active:cursor-grabbing" aria-label="拖动排序">
                            <GripVertical className="h-4.5 w-4.5" />
                        </span>
                        <button type="button" onClick={() => onEdit(item)} className="min-w-0 flex-1 truncate text-left text-[14px] font-semibold text-slate-900">{item.name}</button>
                        <button type="button" onClick={() => onEdit(item)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 active:bg-slate-100" aria-label={`修改${item.name}`}>
                            <Edit3 className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => onDelete(item)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-rose-500 active:bg-rose-50" aria-label={`删除${item.name}`}>
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}
                <button type="button" onClick={onAdd} className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/35 text-[14px] font-semibold text-[#1E9AAA] active:bg-cyan-50">
                    <Plus className="h-4 w-4" />
                    新增科目
                </button>
            </div>
        </WhitePanel>
    </PageBody>
);

export const DepartmentManagementView: React.FC<DepartmentManagementViewProps> = ({ departments, onAdd, onEdit, onDelete }) => (
    <PageBody>
        <WhitePanel className="p-3">
            <div className="space-y-2">
                {departments.map(item => (
                    <div key={item.id} className="flex min-h-[58px] items-center gap-2 rounded-2xl bg-slate-50 px-3">
                        <button type="button" onClick={() => onEdit(item)} className="min-w-0 flex-1 truncate text-left text-[14px] font-semibold text-slate-900">{item.name}</button>
                        <button type="button" onClick={() => onEdit(item)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 active:bg-slate-100" aria-label={`修改${item.name}`}>
                            <Edit3 className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => onDelete(item)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-rose-500 active:bg-rose-50" aria-label={`删除${item.name}`}>
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}
                <button type="button" onClick={onAdd} className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/35 text-[14px] font-semibold text-[#1E9AAA] active:bg-cyan-50">
                    <Plus className="h-4 w-4" />
                    新增部门
                </button>
            </div>
        </WhitePanel>
    </PageBody>
);

export const CoinIssuanceView: React.FC<CoinIssuanceViewProps> = ({ config, onChange, onSave }) => {
    const rankingRatio = 100 - config.sunshineRatio;
    const update = (patch: Partial<CoinIssuanceConfig>) => onChange({ ...config, ...patch });
    const sunshineAmount = Math.round(config.classBudget * config.sunshineRatio / 100);
    const rankingAmount = config.classBudget - sunshineAmount;

    return (
        <PageBody>
            <WhitePanel className="p-4">
                <div className="flex min-h-[52px] items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                        <span className="truncate text-[14px] font-bold text-slate-900">开启货币发放</span>
                        <CircleHelp className="h-4 w-4 shrink-0 text-slate-400" />
                    </div>
                    <SwitchControl checked={config.enabled} onChange={(enabled) => update({ enabled })} label="开启货币发放" />
                </div>
            </WhitePanel>

            {config.enabled && (
                <WhitePanel className="space-y-4 p-4">
                    <label className="block">
                        <span className="text-[13px] font-semibold text-slate-600">发放周期</span>
                        <select value={config.period} onChange={(event) => update({ period: event.target.value as CoinIssuanceConfig['period'] })} className="mt-2 h-12 w-full rounded-2xl border border-slate-100 bg-slate-50 px-3 text-[14px] font-semibold text-slate-900">
                            <option value="weekly">每周一发放</option>
                            <option value="monthly">每月一号发放</option>
                        </select>
                    </label>

                    <label className="block">
                        <span className="text-[13px] font-semibold text-slate-600">班级总预算</span>
                        <div className="mt-2 flex min-h-12 items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-3">
                            <input type="number" min={0} value={config.classBudget} onChange={(event) => update({ classBudget: Number(event.target.value || 0) })} className="h-9 min-w-0 flex-1 rounded-xl border border-slate-100 bg-white px-2 text-center text-[14px] font-bold text-slate-950" aria-label="班级总预算" />
                            <span className="shrink-0 text-[13px] font-semibold text-slate-500">币/班</span>
                        </div>
                    </label>

                    <label className="block rounded-2xl bg-slate-50 p-3">
                        <div className="flex items-center justify-between text-[14px] font-bold text-slate-900">
                            <span>阳光保底比例</span>
                            <span>{config.sunshineRatio}%</span>
                        </div>
                        <input type="range" min={0} max={100} step={1} value={config.sunshineRatio} onChange={(event) => update({ sunshineRatio: Number(event.target.value) })} className="mt-3 h-2 w-full accent-[#1E9AAA]" />
                        <div className="mt-2 text-[12px] font-semibold text-slate-500">全班平分：{sunshineAmount}币</div>
                    </label>

                    <div className="rounded-2xl bg-slate-50 p-3">
                        <div className="flex items-center justify-between text-[14px] font-bold text-slate-900">
                            <span>积分排行比例</span>
                            <span>{rankingRatio}%</span>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                            <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-cyan-400" style={{ width: `${rankingRatio}%` }} />
                        </div>
                        <div className="mt-2 text-[12px] font-semibold text-slate-500">奖池金额：{rankingAmount}币</div>
                    </div>

                    <button type="button" onClick={onSave} className="h-12 w-full rounded-[20px] bg-[#1E9AAA] text-[14px] font-bold text-white shadow-[0_16px_30px_-22px_rgba(30,154,170,0.86)] active:scale-[0.99]">
                        保存
                    </button>
                </WhitePanel>
            )}
        </PageBody>
    );
};

export const SuggestionFeedbackView: React.FC<SuggestionFeedbackViewProps> = ({ text, images, onTextChange, onAddImage, onRemoveImage, onSubmit }) => {
    const canSubmit = Boolean(text.trim());
    const canAddImage = images.length < 5;

    return (
        <PageBody
            footer={(
                <button type="button" disabled={!canSubmit} onClick={onSubmit} className={`h-12 w-full rounded-[20px] text-[14px] font-bold transition ${canSubmit ? 'bg-[#1E9AAA] text-white shadow-[0_16px_30px_-22px_rgba(30,154,170,0.86)] active:scale-[0.99]' : 'bg-slate-100 text-slate-400'}`}>
                    提交
                </button>
            )}
        >
            <WhitePanel className="p-4">
                <textarea value={text} onChange={(event) => onTextChange(event.target.value)} className="min-h-[156px] w-full resize-none bg-transparent text-[14px] leading-6 text-slate-900 outline-none placeholder:text-slate-400" placeholder="请输入建议或问题" aria-label="反馈内容" />
            </WhitePanel>

            <WhitePanel className="p-4">
                <div className="flex items-center justify-between">
                    <div className="text-[14px] font-bold text-slate-900">上传图片</div>
                    <div className="text-[12px] font-semibold text-slate-400">{images.length}/5</div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                    {images.map((image, index) => (
                        <div key={`${image}-${index}`} className="relative flex aspect-square items-center justify-center rounded-2xl bg-slate-50 text-[12px] font-semibold text-slate-500">
                            {image}
                            <button type="button" onClick={() => onRemoveImage(index)} className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-500 shadow-[0_8px_18px_-12px_rgba(15,23,42,0.42)]" aria-label={`删除第${index + 1}张反馈图片`}>
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ))}
                    {canAddImage && (
                        <button type="button" onClick={onAddImage} className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/35 text-[12px] font-semibold text-[#1E9AAA] active:bg-cyan-50" aria-label="上传反馈图片">
                            <ImagePlus className="h-5 w-5" />
                            上传图片
                        </button>
                    )}
                </div>
            </WhitePanel>
        </PageBody>
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
    <div className="absolute inset-0 z-[100] flex items-end bg-slate-950/20 px-4 pb-4 backdrop-blur-[2px]" onClick={onCancel}>
        <section className="w-full rounded-[28px] border border-white/90 bg-white p-4 shadow-[0_28px_80px_-42px_rgba(15,23,42,0.58)]" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
                <button type="button" onClick={onCancel} className="h-9 px-2 text-[13px] font-semibold text-slate-500">取消</button>
                <div className="text-[16px] font-bold text-slate-900">{title}</div>
                <button type="button" onClick={onConfirm} className="flex h-9 items-center gap-1 rounded-full bg-cyan-50 px-3 text-[13px] font-bold text-[#1E9AAA]">
                    <Check className="h-3.5 w-3.5" />
                    完成
                </button>
            </div>
            <input value={value} onChange={(event) => onChange(event.target.value)} autoFocus placeholder={placeholder} className="h-12 w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 text-[14px] font-semibold text-slate-900 outline-none focus:border-cyan-200" />
        </section>
    </div>
);

interface ConfirmSheetProps {
    title: string;
    onCancel: () => void;
    onConfirm: () => void;
}

export const DeleteConfirmSheet: React.FC<ConfirmSheetProps> = ({ title, onCancel, onConfirm }) => (
    <div className="absolute inset-0 z-[100] flex items-end bg-slate-950/20 px-4 pb-4 backdrop-blur-[2px]" onClick={onCancel}>
        <section className="w-full rounded-[28px] border border-white/90 bg-white p-4 shadow-[0_28px_80px_-42px_rgba(15,23,42,0.58)]" onClick={(event) => event.stopPropagation()}>
            <div className="px-2 pb-4 pt-1 text-center text-[16px] font-bold text-slate-900">{title}</div>
            <button type="button" onClick={onConfirm} className="h-12 w-full rounded-[20px] bg-rose-50 text-[14px] font-bold text-rose-500 active:bg-rose-100">
                删除
            </button>
            <button type="button" onClick={onCancel} className="mt-2 h-12 w-full rounded-[20px] bg-slate-50 text-[14px] font-bold text-slate-600 active:bg-slate-100">
                取消
            </button>
        </section>
    </div>
);
