import assert from 'node:assert/strict';
import fs from 'node:fs';

const viewSource = fs.readFileSync(new URL('./ClassDetailView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const tokenSource = fs.readFileSync(new URL('../styles/teacherMobileTokens.ts', import.meta.url), 'utf8');
const guidelines = fs.readFileSync(new URL('../../design-system/teacher-mobile/TEACHER_MOBILE_UI_GUIDELINES.md', import.meta.url), 'utf8');

const requireText = (source, text, message) => assert.ok(source.includes(text), message);

requireText(viewSource, "type EvaluationRecountTarget = 'student' | 'group'", '学生和小组应复用同一重新计数流程状态。');
requireText(viewSource, 'canResetStudentEvaluationCounts: boolean', '学生重新计数权限应由应用层显式传入。');
requireText(appSource, "canResetStudentEvaluationCounts={selectedClassRole === 'headTeacher' || selectedClassRole === 'deputyHeadTeacher'}", '应用层应只向班主任和副班主任开放学生重新计数。');
requireText(viewSource, "!isActiveGroupPlanOwnedByCurrentTeacher", '小组重新计数应限制为当前方案创建者。');
requireText(viewSource, 'aria-label="学生更多操作"', '学生页普通态应提供轻量更多入口。');
requireText(viewSource, 'aria-label="小组更多操作"', '分组页普通态应提供轻量更多入口。');
requireText(viewSource, 'moreActionTarget', '卡片展示和重新计数应复用同一个页面操作菜单。');
requireText(viewSource, '重新计数', '更多操作中应明确展示重新计数。');
requireText(viewSource, "setRecountTarget(target)", '点击重新计数后应先进入专用对象选择状态。');
requireText(viewSource, "setRecountSelectedIds(new Set())", '重新计数选择不得复用批量评价对象。');
requireText(viewSource, "const isStudentSelectionActive = isSelectionMode || isStudentRecountSelection", '学生卡片应在独立重新计数状态下复用选择角标。');
requireText(viewSource, "const isGroupSelectionActive = isGroupSelectionMode || isGroupRecountSelection", '小组卡片应在独立重新计数状态下复用选择角标。');
requireText(viewSource, "重新计数（${recountSelectedCount}）", '选择状态底部应使用带已选数量的重新计数主操作。');
requireText(viewSource, 'handleToggleAllRecountGroups', '小组重新计数应支持全选和取消全选。');
requireText(viewSource, 'handleSelectAllVisibleStudents', '学生重新计数应复用全选能力。');
requireText(viewSource, 'setShowRecountConfirmation(true)', '选完对象后应直接打开一次确认弹窗。');
requireText(viewSource, '重置后不可恢复，我已知晓', '最终确认前应要求老师主动勾选不可恢复声明。');
requireText(viewSource, 'handleToggleRecountAcknowledgement(event.target.checked)', '知晓声明应使用可取消的复选框语义。');
requireText(viewSource, 'setRecountCountdown(5)', '打开确认弹窗时应从5秒开始倒计时。');
requireText(viewSource, "recountCountdown > 0 ? `${recountCountdown}秒后可确认` : '确认重新计数'", '进入弹窗后应在最终确认按钮内显示倒计时。');
requireText(viewSource, 'disabled={recountCountdown > 0}', '5秒倒计时未结束时最终确认按钮必须禁用。');
requireText(viewSource, "setRecountConfirmationNotice('请先勾选我已知晓')", '倒计时结束但未勾选时应使用弹窗内轻提示说明下一步。');
requireText(viewSource, '<MobileActionToast message={recountConfirmationNotice} />', '未勾选提示应显示在确认弹窗底部按钮上方。');
requireText(viewSource, '重新计数以后，卡片上的数字将清零。已有的评价记录、积分等不受影响。', '确认弹窗应使用简洁文案说明清零效果和不受影响的数据。');
assert.doesNotMatch(viewSource, /当前表扬次数|当前批评次数|recountObjectSummary|recountCurrentCounts/, '确认弹窗不应重复展示已选对象或当前评价次数。');
requireText(viewSource, 'createEvaluationCountCheckpoint', '确认后应记录新的统计起点。');
requireText(viewSource, 'getEvaluationCountsSinceCheckpoint', '卡片评价次数应按统计起点展示。');
requireText(viewSource, '已从现在开始重新计数', '成功后应明确反馈新的计数起点。');
requireText(tokenSource, "'--tm-recount-bottom-action-height': '52px'", '重新计数底部主操作高度应进入教师手机端Token。');
requireText(tokenSource, "'--tm-recount-bottom-action-max-width': '350px'", '重新计数底部主操作宽度应进入教师手机端Token。');
requireText(guidelines, '先表达管理意图、再选择对象的独立流程', '规范应明确重新计数的意图优先路径。');
requireText(guidelines, '不得塞入批量评价的`多选`状态', '规范应禁止重新计数复用批量评价入口。');
requireText(guidelines, '确认弹窗打开后立即开始5秒倒计时', '规范应固定弹窗打开即开始的倒计时要求。');

assert.doesNotMatch(viewSource, /setTimeout\([^)]*handleConfirmRecount/, '倒计时结束不得自动执行重新计数。');

console.log('ClassDetailView recount assertions passed');
