import assert from 'node:assert/strict';
import {
  TERMINAL_SHOP_LAYOUT_PREVIEW_STORAGE_KEY,
  TERMINAL_SHOP_LAYOUT_PREVIEW_UPDATED_EVENT,
  readTerminalShopLayoutPreset,
  readTerminalShopLayoutPresetId,
  writeTerminalShopLayoutPresetId,
} from './terminalShopLayoutPreview.ts';
import { DEFAULT_TERMINAL_SHOP_LAYOUT_PRESET_ID } from './terminalShopLayout.ts';

// 1. 没有浏览器环境（纯 node / 预渲染）时一律回退默认版式，不能抛错
assert.equal(readTerminalShopLayoutPresetId(), DEFAULT_TERMINAL_SHOP_LAYOUT_PRESET_ID);
assert.equal(writeTerminalShopLayoutPresetId('2x4'), '2x4');

// 2. 有 localStorage 时读写一致，并派发事件让货柜机画面同步刷新
const storage = new Map();
const events = [];
globalThis.window = {
  localStorage: {
    getItem: key => (storage.has(key) ? storage.get(key) : null),
    setItem: (key, value) => { storage.set(key, String(value)); },
  },
  dispatchEvent: event => { events.push(event); return true; },
};

assert.equal(readTerminalShopLayoutPresetId(), DEFAULT_TERMINAL_SHOP_LAYOUT_PRESET_ID, '没存过时应回退默认版式');
assert.equal(writeTerminalShopLayoutPresetId('3x3'), '3x3');
assert.equal(storage.get(TERMINAL_SHOP_LAYOUT_PREVIEW_STORAGE_KEY), '3x3', '选择应写入 localStorage，刷新后仍然保留');
assert.equal(readTerminalShopLayoutPresetId(), '3x3');
assert.deepEqual(
  { columns: readTerminalShopLayoutPreset().columns, rows: readTerminalShopLayoutPreset().rows },
  { columns: 3, rows: 3 },
);
assert.equal(events.length, 1, '切换版式应派发一次同步事件');
assert.equal(events[0].type, TERMINAL_SHOP_LAYOUT_PREVIEW_UPDATED_EVENT);

// 3. 存档被写坏时回退默认，不能把页面打崩
storage.set(TERMINAL_SHOP_LAYOUT_PREVIEW_STORAGE_KEY, '9x9');
assert.equal(readTerminalShopLayoutPresetId(), DEFAULT_TERMINAL_SHOP_LAYOUT_PRESET_ID);
assert.equal(writeTerminalShopLayoutPresetId('9x9'), DEFAULT_TERMINAL_SHOP_LAYOUT_PRESET_ID, '非法版式应归一成默认版式');

// 4. localStorage 不可用（隐私模式）时也不能抛错
globalThis.window = {
  localStorage: {
    getItem: () => { throw new Error('blocked'); },
    setItem: () => { throw new Error('blocked'); },
  },
  dispatchEvent: () => true,
};
assert.equal(readTerminalShopLayoutPresetId(), DEFAULT_TERMINAL_SHOP_LAYOUT_PRESET_ID);
assert.equal(writeTerminalShopLayoutPresetId('2x4'), '2x4');

console.log('✅ 货柜机版式演示开关断言测试通过（默认回退、读写一致、事件同步、异常兜底）');
