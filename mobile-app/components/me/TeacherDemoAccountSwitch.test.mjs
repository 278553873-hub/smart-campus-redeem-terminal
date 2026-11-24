import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./TeacherDemoAccountSwitch.tsx', import.meta.url), 'utf8');
const inputClass = source.match(/const inputClass = '([^']+)'/)?.[1];
const sheetHeader = source.slice(source.indexOf('<MobileBottomSheet'), source.indexOf('<form id='));
const inputStyles = [...source.matchAll(/<input\b[\s\S]*?className=\{([^\n]+)\}/g)].map(([, style]) => style);

assert.match(sheetHeader, /title="问题排查"\s+onClose=\{closeSheet\}\s+flushContentBottom\s+footerSafeArea="device"\s+footer=\{/);
assert.match(sheetHeader, /form=\{`\$\{phoneId\}-form`\}[\s\S]*?className=\{`\$\{mobileSheetActionClass\} w-full/);
assert.match(source, /<form id=\{`\$\{phoneId\}-form`\} className="pt-\[var\(--tm-sheet-content-gap\)\]"/);
assert.match(inputClass, /h-\[var\(--tm-form-action-height\)\] w-full rounded-\[var\(--tm-form-control-radius\)\]/);
assert.match(inputClass, /\boutline-none\b/);
assert.doesNotMatch(inputClass, /focus(?:-visible|-within)?:(?:border|ring|outline|shadow)(?:-|\s|$)/);
assert.deepEqual(inputStyles, [
  '`${inputClass} ${fieldBorder(Boolean(error && !needsCode))}`',
  '`${inputClass} ${fieldBorder(Boolean(error))} pr-12`',
]);
