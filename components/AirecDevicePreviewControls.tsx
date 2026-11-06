import { useEffect, useId, useState } from 'react';
import { AIREC_DEMO_CONTROL_EVENT, AIREC_DEMO_STATE_EVENT, AIREC_DEMO_STATE_REQUEST_EVENT, type AirecDemoScenario } from '../mobile-app/services/airecDemoAdapter';

const scenarios: Array<{ id: AirecDemoScenario; label: string }> = [
    { id: 'never-added', label: '未添加' },
    { id: 'connected', label: '已连接·无同步任务' },
    { id: 'syncing', label: '已连接·有同步任务' },
    { id: 'disconnected', label: '已添加·未连接' },
];

/** 演示工具位于手机外，不属于 App 产品页面。 */
export default function AirecDevicePreviewControls() {
    const [selected, setSelected] = useState<AirecDemoScenario | null>(null);
    const groupId = useId();
    useEffect(() => {
        const update = (event: Event) => setSelected((event as CustomEvent<AirecDemoScenario | null>).detail);
        window.addEventListener(AIREC_DEMO_STATE_EVENT, update);
        window.dispatchEvent(new Event(AIREC_DEMO_STATE_REQUEST_EVENT));
        return () => window.removeEventListener(AIREC_DEMO_STATE_EVENT, update);
    }, []);
    return <section className="w-full rounded-2xl border border-slate-200/80 bg-white/90 p-3" aria-label="蓝牙设备演示配置">
        <fieldset>
            <legend className="text-xs font-semibold text-slate-700">设备交互演示</legend>
            <div className="mt-2 grid gap-1">
                {scenarios.map(scenario => <label key={scenario.id} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-2 text-xs font-medium text-slate-700 ${selected === scenario.id ? 'bg-slate-100' : ''}`}>
                    <input type="radio" name={groupId} value={scenario.id} checked={selected === scenario.id} disabled={!selected}
                        onChange={() => window.dispatchEvent(new CustomEvent(AIREC_DEMO_CONTROL_EVENT, { detail: scenario.id }))}
                        className="h-3.5 w-3.5 shrink-0 accent-slate-700" />
                    {scenario.label}
                </label>)}
            </div>
        </fieldset>
    </section>;
}
