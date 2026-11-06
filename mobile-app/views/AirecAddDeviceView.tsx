import { LoaderCircle, Mic, RefreshCw } from 'lucide-react';
import type { AirecDevice } from '../domain/airecSync';
import type { AirecDeviceController } from '../hooks/useAirecDemoDevice';
import AirecDeviceArtwork from '../components/airec/AirecDeviceArtwork';

export default function AirecAddDeviceView({ controller, onConnected }: { controller: AirecDeviceController; onConnected: () => void }) {
    const { state } = controller;
    const scanning = state.discovery === 'scanning';
    const connecting = state.connection === 'connecting';
    const handleConnect = async (device: AirecDevice) => {
        if (await controller.connect(device, 'discovery')) onConnected();
    };
    return <div className="h-full min-h-0 overflow-y-auto px-[var(--tm-space-4)] pb-[calc(var(--tm-space-6)+env(safe-area-inset-bottom))]" data-view-scroll-root>
        <section className="pb-[var(--tm-space-6)] pt-[var(--tm-space-5)] text-center">
            <AirecDeviceArtwork scanning={scanning} />
            <div className="mt-[var(--tm-space-5)]" role="status" aria-live="polite">
                <h3 className="text-[length:var(--tm-font-size-group-title)] font-semibold text-[var(--tm-text-primary)]">{connecting ? '正在连接麦克风…' : scanning || state.devices.length > 0 ? '选择要连接的麦克风' : '暂未找到设备'}</h3>
                <p className="mt-[var(--tm-space-2)] text-[length:var(--tm-font-size-body)] leading-6 text-[var(--tm-text-secondary)]">打开麦克风，放在手机附近。</p>
            </div>
        </section>
        <div className="flex min-h-11 items-center justify-between gap-3 text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">
            <span>附近的设备</span>
            {!scanning && <button type="button" onClick={() => void controller.scan()} className="flex min-h-11 items-center gap-1 px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"><RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />重新扫描</button>}
        </div>
        <p className="sr-only" role="status">{scanning ? '正在扫描附近设备' : '扫描已结束'}，已发现 {state.devices.length} 台设备</p>
        <ol className="space-y-[var(--tm-layout-list-gap-compact)]" aria-label="附近可添加的设备" aria-busy={scanning}>
            {state.devices.map(device => {
                const current = state.device?.id === device.id;
                const connected = current && state.connection === 'connected';
                const deviceConnecting = current && connecting;
                return <li key={device.id} className="airec-discovered-device rounded-[var(--tm-radius-card-compact)] bg-[var(--tm-bg-surface)]">
                    <button type="button" disabled={deviceConnecting || connected} onClick={() => void handleConnect(device)} aria-label={`连接${device.name}`}
                        className="flex min-h-[var(--tm-airec-device-row-height)] w-full items-center gap-3 px-[var(--tm-space-4)] py-[var(--tm-space-2)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] disabled:opacity-60">
                        <Mic className="h-5 w-5 shrink-0 text-[var(--tm-text-secondary)]" aria-hidden="true" />
                        <span className="min-w-0 flex-1 break-all text-[length:var(--tm-font-size-card-title)] font-semibold text-[var(--tm-text-primary)]">{device.name}</span>
                        {connecting && current ? <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-label="正在连接" /> : <span className="shrink-0 text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-brand-primary)]">{connected ? '已连接' : '连接'}</span>}
                    </button>
                </li>;
            })}
        </ol>
        {!scanning && state.devices.length === 0 && <p className="py-[var(--tm-space-4)] text-[length:var(--tm-font-size-body)] leading-6 text-[var(--tm-text-secondary)]">确认设备已开机，并检查是否正被其他手机使用，再重新扫描。</p>}
        {state.error && <p role="alert" className="mt-[var(--tm-space-3)] text-[length:var(--tm-font-size-body)] leading-6 text-[var(--tm-status-negative-strong)]">{state.error}</p>}
    </div>;
}
