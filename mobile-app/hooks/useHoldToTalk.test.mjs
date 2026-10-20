import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// 在无需浏览器授权的环境中验证演示会话也接入真实音量服务。
const source = readFileSync(new URL('./useHoldToTalk.ts', import.meta.url), 'utf8').replace(/^import .*;\n/gm, '');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const module = await import(`data:text/javascript;base64,${Buffer.from(`
let reportLevel;
let starts = 0;
let stops = 0;
const useRef = current => ({ current });
const useState = value => [value, () => {}];
const useEffect = () => {};
const startMicrophoneLevel = callback => {
    starts++;
    reportLevel = callback;
    return () => { stops++; callback(0); };
};
export const meter = { emit: level => reportLevel(level), counts: () => ({ starts, stops }) };
${outputText}`).toString('base64')}`);
globalThis.window = {};
for (const action of ['release', 'cancel']) {
    const before = module.meter.counts();
    const voice = module.useHoldToTalk(() => {}, () => {}, {
        createSession: callbacks => ({ start() {}, release: callbacks.finish, cancel: callbacks.finish }),
    });
    voice.start(200);
    assert.equal(module.meter.counts().starts, before.starts + 1);
    module.meter.emit(0.2);
    assert.equal(voice.levelRef.current, 0.2);
    module.meter.emit(0.8);
    assert.equal(voice.levelRef.current, 0.8, '记录页音量必须持续传递给声纹');
    voice[action]();
    assert.equal(voice.levelRef.current, 0);
    assert.equal(module.meter.counts().stops, before.stops + 1, '松手和取消均释放音量采集');
}
console.log('记录页语音检查通过：演示会话接入音量、实时传递、松手及取消释放。');
