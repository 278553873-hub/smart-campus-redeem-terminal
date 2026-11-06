import { BluetoothOff, Check, Mic, Plus } from 'lucide-react';
import { getAirecSyncPercent } from '../domain/airecSync';
import type { AirecDeviceController } from '../hooks/useAirecDemoDevice';

export default function AirecDeviceStatus({ controller }: { controller: AirecDeviceController }) {
    const { state, progress } = controller;
    const busy = state.stage === 'receiving' || state.stage === 'uploading';
    const percent = getAirecSyncPercent(progress);
    const hasDevice = state.knownDevices.length > 0;
    const connected = state.connection === 'connected';
    const pending = progress.total - progress.saved;
    const label = !hasDevice ? '未添加' : !connected ? '未连接' : busy ? `同步 ${percent}%` : '已连接';
    const status = connected ? '蓝牙已连接' : '蓝牙未连接';
    const hasProgress = connected && busy && progress.total > 0;

    return <div role="status" aria-label={`蓝牙麦克风：${label}，${status}`}
        className="ml-auto flex min-h-11 shrink-0 items-center gap-1 whitespace-nowrap pl-2 text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-secondary)]">
        <span className="relative flex h-8 w-8 items-center justify-center">
            {hasProgress && <svg viewBox="0 0 32 32" className="absolute inset-0 h-8 w-8 -rotate-90" role="progressbar" aria-label="录音同步总体进度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
                <circle cx="16" cy="16" r="14" fill="none" stroke="var(--tm-border-subtle)" strokeWidth="2" />
                <circle cx="16" cy="16" r="14" fill="none" stroke="var(--tm-brand-primary)" strokeWidth="2" strokeLinecap="round" pathLength="100" strokeDasharray="100" strokeDashoffset={100 - percent} opacity={percent > 0 ? 1 : 0} className="transition-[stroke-dashoffset] [transition-duration:var(--tm-duration-fast)] motion-reduce:transition-none" />
            </svg>}
            {hasDevice && !connected ? <BluetoothOff className="h-4 w-4" aria-hidden="true" /> : <Mic className="h-4 w-4" aria-hidden="true" />}
            {!hasDevice && <Plus className="absolute bottom-0.5 right-0 h-3 w-3 rounded-full bg-[var(--tm-bg-page)]" aria-hidden="true" />}
            {connected && !hasProgress && pending === 0 && <Check className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[var(--tm-bg-page)] text-[var(--tm-status-positive-strong)]" aria-hidden="true" />}
        </span>
        <span className={hasProgress ? 'tabular-nums text-[var(--tm-brand-primary)]' : ''}>{label}</span>
    </div>;
}
