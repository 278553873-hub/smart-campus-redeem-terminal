import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// 测试实际事件处理函数，验证关窗没有丢失评价记录或计分；无需启动浏览器。
const source = readFileSync(new URL('../SmartBigScreen.tsx', import.meta.url), 'utf8');
const ast = ts.createSourceFile('SmartBigScreen.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let initializer;
function findHandler(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(ast) === 'handleEvaluationSelect') initializer = node.initializer;
  ts.forEachChild(node, findHandler);
}
findHandler(ast);
assert.ok(initializer);
const handlerSource = ts.transpile(`(${initializer.getText(ast)})`, { target: ts.ScriptTarget.ES2022 });
const students = [{ id: 's1', name: '同学甲' }, { id: 's2', name: '同学乙' }];
for (const [type, multiple] of [['positive', false], ['negative', false], ['positive', true], ['negative', true]]) {
  const events = [];
  let records = [];
  const expectedIds = multiple ? ['s1', 's2'] : ['s1'];
  const context = {
    students, groups: [], isMultiSelect: multiple,
    selectedIds: multiple ? expectedIds : [],
    evalStudent: multiple ? null : students[0], evalGroup: null, viewMode: 'student',
    setEvalRecords(update) { records = update(records); events.push('record'); },
    updateStudentPerformance(ids, score) {
      assert.deepEqual([...ids], expectedIds);
      assert.equal(score, type === 'positive' ? 1 : -1);
      events.push('score');
    },
    syncPetEvaluation(record) { assert.deepEqual([...record.studentIds], expectedIds); assert.ok(record.recordedAt); events.push('pet'); },
    updateGroupPerformance() {}, fireCelebration() {}, fireRaindropHint() {},
    setIsGlobalRaining() {}, audioRefs: { current: {} }, setTimeout() {},
    handleCloseEvaluation() { events.push('close'); },
  };
  const select = vm.runInNewContext(handlerSource, context);
  select({ id: 'option', label: '快捷评价', type, category: '课堂表现' });
  assert.equal(records.length, 1, '一次点击只生成一条评价记录');
  assert.deepEqual([...records[0].studentIds], expectedIds);
  assert.equal(records[0].scoreChange, type === 'positive' ? 1 : -1);
  assert.deepEqual(events, ['pet', 'record', 'score', 'close'], '完成记录与计分后同步关窗，不等待延迟回调');
}
console.log('单人及多人快捷评价：表扬与待改进均记录计分后立即关闭检查通过');
