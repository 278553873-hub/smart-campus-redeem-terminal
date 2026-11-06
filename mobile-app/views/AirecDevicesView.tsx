import { Plus } from 'lucide-react';
import { sortAirecDevices } from '../domain/airecSync';
import type { AirecDeviceController } from '../hooks/useAirecDemoDevice';
import AirecDeviceArtwork from '../components/airec/AirecDeviceArtwork';
import AirecDeviceConnectionCard from '../components/airec/AirecDeviceConnectionCard';
import { mobileSheetActionClass } from '../components/ui/mobileSheetActionStyles';

export default function AirecDevicesView({ controller, onAddDevice }: { controller: AirecDeviceController; onAddDevice: () => void }) {
    const { state } = controller;
    const connectedId = state.connection === 'connected' ? state.device?.id : undefined;
    const devices = sortAirecDevices(state.knownDevices, connectedId);
    return <div className="flex h-full min-h-0 flex-col text-[var(--tm-text-primary)]">
        <div className="min-h-0 flex-1 overflow-y-auto px-[var(--tm-space-4)] py-[var(--tm-space-4)]" data-view-scroll-root>
            {devices.length === 0 ? <section className="grid min-h-full grid-rows-[minmax(var(--tm-space-6),2fr)_auto_minmax(var(--tm-space-8),3fr)] text-center" aria-label="暂无已添加设备">
                <div className="row-start-2">
                    <AirecDeviceArtwork compact />
                    <p role="status" className="mt-[var(--tm-space-4)] text-[length:var(--tm-font-size-body)] font-normal leading-6 text-[var(--tm-text-secondary)]">还没有添加设备</p>
                </div>
            </section> : <ol className="space-y-[var(--tm-layout-card-gap)]" aria-label="曾连接的设备">
                {devices.map(device => {
                    const current = state.device?.id === device.id;
                    const connected = current && state.connection === 'connected';
                    const connecting = current && state.connection === 'connecting';
                    return <li key={device.id} data-device-id={device.id} className="rounded-[var(--tm-radius-card-compact)] bg-[var(--tm-bg-surface-muted)] p-[var(--tm-space-3)]">
                        <div className="flex min-h-[128px] items-center gap-[var(--tm-space-4)] px-[var(--tm-space-2)] py-[var(--tm-space-4)]">
                            <div className={`shrink-0 ${connected || connecting ? '' : 'opacity-40'}`}><AirecDeviceArtwork size="device" /></div>
                            <h3 className="min-w-0 break-all text-[length:var(--tm-font-size-group-title)] font-semibold leading-7">{device.name}</h3>
                        </div>
                        <AirecDeviceConnectionCard device={device} controller={controller} />
                    </li>;
                })}
            </ol>}
            {state.error && <p role="alert" className="mt-[var(--tm-space-4)] text-[length:var(--tm-font-size-body)] leading-6 text-[var(--tm-status-negative-strong)]">{state.error}</p>}
        </div>
        <footer className="shrink-0 bg-[var(--tm-bg-surface)] px-[var(--tm-space-4)] pb-[calc(var(--tm-space-4)+env(safe-area-inset-bottom))] pt-[var(--tm-space-3)]">
            <button type="button" onClick={onAddDevice} className={`${mobileSheetActionClass} flex w-full items-center justify-center gap-2 bg-[var(--tm-brand-primary)] font-semibold text-[var(--tm-text-inverse)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]`}><Plus className="h-5 w-5" aria-hidden="true" />添加设备</button>
        </footer>
    </div>;
}
