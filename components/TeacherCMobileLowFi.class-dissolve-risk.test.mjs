import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherCMobileLowFi.tsx', import.meta.url), 'utf8');
const failures = [];
const requireText = (text, message) => {
  if (!source.includes(text)) failures.push(message);
};

requireText('只是想从首页移除这个班级？', '解散班级前应先提示可用显示设置替代。');
requireText('可以在 07A 右上角“+”里进入“显示设置”，取消该班级显示。', '替代路径应指向 07A 加号里的显示设置。');
requireText("type ClassDissolveStep = 'check' | 'final';", '解散班级应使用两步确认状态。');
requireText("const [classDissolveStep, setClassDissolveStep] = useState<ClassDissolveStep>('check');", '解散确认每次应从替代路径和条件确认开始。');
requireText('请先确认以下条件', '解散班级应在第二步明确前置条件。');
requireText('没有其他老师加入该班级', '解散条件应要求没有其他老师加入。');
requireText('没有任何家长绑定该班级学生', '解散条件应要求没有任何家长绑定。');
requireText('解散后将清空该班级信息和所有学生信息，且不可恢复。', '解散后果应明确清空班级和学生信息。');
requireText('输入英文 delete 确认解散', '解散确认应要求输入英文 delete。');
requireText('placeholder="delete"', '解散确认输入框占位应为 delete。');
requireText("disabled={isDissolveMode && classDissolveStep === 'final' && !canDissolve}", '只有最终确认步才需要输入 delete 后解锁按钮。');
requireText("const dissolvePrimaryLabel = classDissolveStep === 'check' ? '已确认，继续' : '确认解散班级';", '解散两步确认按钮文案应随步骤变化。');
requireText("if (isDissolveMode && classDissolveStep === 'check')", '第一步确认后才进入最终确认。');
requireText("setClassDissolveStep('final');", '第一步后应进入最终输入 delete 步骤。');
requireText("setClassDissolveStep('check');", '关闭或导航时应重置解散确认步骤。');

const exitSheetStart = source.indexOf('const renderClassExitSheet = () =>');
const exitSheetEnd = source.indexOf('const AiResultCard', exitSheetStart);
const exitSheet = source.slice(exitSheetStart, exitSheetEnd);

if (!exitSheet.includes('role="dialog"') || !exitSheet.includes('aria-modal="true"')) {
  failures.push('解散/退出确认必须保持可访问的 dialog 语义。');
}

if (!exitSheet.includes('text-red-600') || !exitSheet.includes('border-red-200') || !exitSheet.includes('bg-red-50')) {
  failures.push('解散后果应使用危险操作视觉层级，但不能只依赖颜色。');
}

const checkIndex = exitSheet.indexOf("classDissolveStep === 'check'");
const finalIndex = exitSheet.indexOf("classDissolveStep === 'final'");
if (!(checkIndex >= 0 && finalIndex > checkIndex)) {
  failures.push('解散班级弹窗应先确认替代路径和前置条件，再进入最终 delete 确认。');
}

const checkBlock = exitSheet.slice(checkIndex, finalIndex);
if (!checkBlock.includes('只是想从首页移除这个班级？') || !checkBlock.includes('请先确认以下条件')) {
  failures.push('解散第一步应同时包含首页显示替代路径和前置条件确认。');
}

if (!exitSheet.includes('type="button" onClick={close}')) {
  failures.push('高风险弹窗必须保留取消路径。');
}

if (failures.length) throw new Error(failures.join('\n'));
console.log('TeacherCMobileLowFi class dissolve risk assertions passed');
