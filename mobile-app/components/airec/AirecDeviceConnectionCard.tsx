import { ChevronRight, LoaderCircle } from 'lucide-react';
import { getAirecSyncPercent } from '../../domain/airecSync';
import type { AirecKnownDevice } from '../../domain/airecSync';
import type { AirecDeviceController } from '../../hooks/useAirecDemoDevice';
import './airecDevice.css';

const focusClass = '[-webkit-tap-highlight-color:transparent] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]';
const surfaceClass = 'min-h-16 w-full rounded-[var(--tm-radius-control-compact)] bg-[var(--tm-bg-surface)] px-[var(--tm-space-4)] text-[length:var(--tm-font-size-body)]';

/** 设备页原位反馈连接和同步，不承担详情导航。 */
export default function AirecDeviceConnectionCard({ device, controller }: { device: AirecKnownDevice; controller: AirecDeviceController }) {
    const { state, progress } = controller;
    const current = state.device?.id === device.id;
    const connected = current && state.connection === 'connected';
    const connecting = current && state.connection === 'connecting';
    const busy = state.stage === 'receiving' || state.stage === 'uploading';
    const syncing = current && busy;

    if (!connected && !syncing) return <button type="button" disabled={connecting}
        onClick={() => void controller.connect(device)} aria-label={connecting ? `${device.name}，连接中` : `连接${device.name}`}
        aria-busy={connecting} className={`${surfaceClass} flex items-center gap-[var(--tm-space-2)] text-left ${focusClass}`}>
        <span aria-hidden="true" className={`airec-status-dot ${connecting ? 'is-breathing text-[var(--tm-brand-secondary)]' : 'text-[var(--tm-text-disabled)]'}`} />
        <span role="status" className="min-w-0 flex-1">{connecting ? '连接中' : '未连接'}</span>
        {connecting ? <LoaderCircle className="h-4 w-4 shrink-0 animate-spin text-[var(--tm-text-secondary)] motion-reduce:animate-none" aria-hidden="true" />
            : <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" aria-hidden="true" />}
    </button>;

    const pending = Math.max(0, progress.total - progress.saved);
    const percent = getAirecSyncPercent(progress);
    const waitingNetwork = state.stage === 'waiting-network' && pending > 0;
    const failed = state.stage === 'error' && pending > 0;
    const status = syncing ? `同步中(${progress.saved}/${progress.total})` : waitingNetwork ? '等待联网' : failed ? '同步未完成' : '已连接';
    const dotColor = syncing || waitingNetwork ? 'text-[var(--tm-brand-secondary)]' : failed ? 'text-[var(--tm-status-negative)]' : 'text-[var(--tm-status-positive)]';

    return <div className={`${surfaceClass} flex flex-col justify-center ${syncing ? 'pb-[var(--tm-space-4)]' : ''}`}>
        <div className="flex min-h-16 items-center gap-[var(--tm-space-2)]">
            <span aria-hidden="true" className={`airec-status-dot ${dotColor} ${!waitingNetwork && !failed ? 'is-breathing' : ''}`} />
            <span role="status" className="min-w-0 flex-1 tabular-nums">{status}</span>
            {failed && <button type="button" onClick={() => void controller.sync()} aria-label={`${device.name}，重试同步`}
                className={`min-h-11 min-w-11 shrink-0 text-[var(--tm-brand-primary)] ${focusClass}`}>重试</button>}
        </div>
        {syncing && <div role="progressbar" aria-label={`${device.name}录音同步总体进度`} aria-valuetext={`已接收 ${progress.received}/${progress.total} 段，已保存 ${progress.saved}/${progress.total} 段`}
            aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} className="airec-sync-progress">
            <span aria-hidden="true" className="airec-sync-progress-fill" data-empty={percent === 0} style={{ transform: `scaleX(${percent / 100})` }} />
        </div>}
    </div>;
}
