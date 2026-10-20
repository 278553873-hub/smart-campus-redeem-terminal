import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('./microphoneLevel.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { getMicrophoneLevel, startMicrophoneLevel } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const sound = amplitude => Float32Array.from({ length: 1024 }, (_, index) => amplitude * Math.sin(index * 0.2));
assert.equal(getMicrophoneLevel(sound(0)), 0);
assert.equal(getMicrophoneLevel(sound(0.001)), 0, '底噪不能制造波动');
assert.ok(getMicrophoneLevel(sound(0.02)) < getMicrophoneLevel(sound(0.08)), '声纹强度必须随真实音量增加');
assert.equal(getMicrophoneLevel(sound(2)), 1, '较大输入必须限制幅度');

function fixture() {
    let resolveStream;
    let rejectStream;
    let amplitude = 0;
    let frameId = 0;
    let stoppedTracks = 0;
    let closedContexts = 0;
    let disconnected = 0;
    const frames = new Map();
    const levels = [];
    const stream = { getTracks: () => [{ stop: () => stoppedTracks++ }] };
    const analyser = {
        fftSize: 1024,
        getFloatTimeDomainData: samples => samples.set(sound(amplitude)),
        disconnect: () => disconnected++,
    };
    const context = {
        state: 'running',
        resume: async () => {},
        close: async () => { closedContexts++; context.state = 'closed'; },
        createAnalyser: () => analyser,
        createMediaStreamSource: () => ({ connect() {}, disconnect: () => disconnected++ }),
    };
    const pendingStream = new Promise((resolve, reject) => { resolveStream = resolve; rejectStream = reject; });
    const stop = startMicrophoneLevel(level => levels.push(level), {
        getStream: () => pendingStream,
        createContext: () => context,
        requestFrame: callback => { frames.set(++frameId, callback); return frameId; },
        cancelFrame: id => frames.delete(id),
    });
    return {
        stop, levels,
        allow: async () => { resolveStream(stream); await Promise.resolve(); },
        deny: async () => { rejectStream(new Error('denied')); await Promise.resolve(); await Promise.resolve(); },
        tick(value, time) {
            amplitude = value;
            const callbacks = [...frames.values()];
            frames.clear();
            callbacks.forEach(callback => callback(time));
        },
        resources: () => ({ stoppedTracks, closedContexts, disconnected, frames: frames.size }),
    };
}
{
    const meter = fixture();
    await meter.allow();
    meter.tick(0, 0);
    assert.equal(meter.levels.at(-1), 0);
    meter.tick(0.02, 40);
    const quiet = meter.levels.at(-1);
    meter.tick(0.12, 80);
    assert.ok(meter.levels.at(-1) > quiet);
    for (let frame = 3; frame < 35; frame++) meter.tick(0, frame * 40);
    assert.equal(meter.levels.at(-1), 0, '停止说话后回到平直状态');
    meter.stop();
    meter.stop();
    assert.deepEqual(meter.resources(), { stoppedTracks: 1, closedContexts: 1, disconnected: 2, frames: 0 });
}
{
    const meter = fixture();
    meter.stop();
    await meter.allow();
    assert.deepEqual(meter.resources(), { stoppedTracks: 1, closedContexts: 1, disconnected: 0, frames: 0 }, '松手后才允许权限，不能泄漏麦克风');
    assert.deepEqual(meter.levels, [0]);
}
{
    const meter = fixture();
    await meter.deny();
    assert.equal(meter.resources().closedContexts, 1);
    assert.deepEqual(meter.levels, [0], '拒绝权限时不能模拟音量');
}
console.log('麦克风音量检查通过：真实采样强弱、静音回落、资源释放、迟到授权、权限拒绝。');
