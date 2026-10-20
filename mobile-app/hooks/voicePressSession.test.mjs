import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('./voicePressSession.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { createVoicePressSession } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
function setup() {
    const sent = [];
    let errors = 0;
    const recognition = { start() {}, stop() {}, abort() {} };
    const session = createVoicePressSession(recognition, { submit: text => sent.push(text), fail: () => errors++, finish() {} });
    const result = text => recognition.onresult?.({ results: [Object.assign([{ transcript: text }], { isFinal: true })] });
    session.start();
    return { recognition, session, sent, result, errors: () => errors };
}
{
    const s = setup();
    s.result('本周班级表现');
    s.recognition.onend();
    assert.deepEqual(s.sent, [], '识别提前完成不能提前发送');
    s.session.release();
    s.session.release();
    assert.deepEqual(s.sent, ['本周班级表现'], '松手后仅发送一次');
}
{
    const s = setup();
    s.session.release();
    s.result('迟到的最终结果');
    s.recognition.onend();
    assert.deepEqual(s.sent, ['迟到的最终结果'], '松手后等待最终转写');
}
{
    const s = setup();
    const lateResult = s.recognition.onresult;
    const lateEnd = s.recognition.onend;
    s.result('不应发送');
    s.session.cancel();
    lateResult({ results: [[{ transcript: '迟到回调' }]] });
    lateEnd();
    s.session.release();
    assert.deepEqual(s.sent, [], '取消或失焦后不能发送迟到结果');
    assert.equal(s.errors(), 0);
}
{
    const s = setup();
    s.recognition.onerror();
    s.session.release();
    assert.deepEqual(s.sent, []);
    assert.equal(s.errors(), 1, '识别失败回落文字输入');
}
console.log('语音按住会话检查通过：松手发送、提前结束、迟到结果、取消和失败。');
