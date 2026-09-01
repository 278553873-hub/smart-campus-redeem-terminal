import assert from 'node:assert/strict';
import fs from 'node:fs';

const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const classListSource = fs.readFileSync(new URL('./ClassListView.tsx', import.meta.url), 'utf8');
const recordSource = fs.readFileSync(new URL('./ClassRecordLogView.tsx', import.meta.url), 'utf8');
const inputSource = fs.readFileSync(new URL('./RecordInputView.tsx', import.meta.url), 'utf8');
const detailSource = fs.readFileSync(new URL('./student-team/StudentTeamDetailView.tsx', import.meta.url), 'utf8');
const editorSource = fs.readFileSync(new URL('./student-team/StudentTeamEditorView.tsx', import.meta.url), 'utf8');
const managementActionsSource = fs.readFileSync(new URL('./student-team/StudentTeamManagementActions.tsx', import.meta.url), 'utf8');
const typeSource = fs.readFileSync(new URL('../types.ts', import.meta.url), 'utf8');

const requireText = (source, needle, message) => {
  assert.ok(source.includes(needle), message);
};

requireText(classListSource, "value: 'class'", '班级页必须保留老师可理解的“班级”页签。');
requireText(classListSource, "label: '班级'", '班级页签必须展示“班级”文案。');
requireText(classListSource, "value: 'team'", '班级页必须提供“社团与团队”页签。');
requireText(classListSource, "label: '社团与团队'", '团队页签必须展示“社团与团队”文案。');
requireText(classListSource, '<MobileSlidingSegmentedControl', '班级与社团页签必须使用公共滑块控件。');
assert.ok(!classListSource.includes('ClassSourceTrigger'), '班级页顶部不得继续提供来源切换。');
requireText(classListSource, 'h-[var(--mini-program-title-bar-height,44px)] items-center [padding-right:var(--mini-program-capsule-right-inset,0px)]', '班级与社团页签必须和微信原生胶囊处于同一标题栏。');
requireText(classListSource, "activeListTab: 'class' | 'team';", '班级页签必须由导航层持有，返回团队列表时不得重置。');
requireText(appSource, "const [classListTab, setClassListTab]", 'App 必须保存班级页签状态。');
requireText(classListSource, "activeListTab === 'team' && visibleStudentTeams.map(renderStudentTeamCard)", '社团与团队页签必须展示权限过滤后的团队列表。');
requireText(classListSource, 'showParticipatingTeamsOnly', '管理人员必须能用轻量勾选框筛选自己参与的团队。');
requireText(classListSource, '我参与的', '团队筛选文案必须符合老师认知。');
requireText(classListSource, 'isSchoolManager', '普通老师不应展示无意义的参与团队筛选。');
requireText(typeSource, 'export interface SchoolStudentTeam', '学校社团与团队必须使用独立领域模型。');
requireText(typeSource, "status: 'active' | 'archived';", '解散团队必须采用归档状态，保留历史评价。');
requireText(typeSource, "visibility: 'collaborators' | 'management';", '团队必须保存老师主动选择的可见范围。');
requireText(typeSource, 'ownerId: string;', '团队必须使用稳定教师编号判断创建人。');
requireText(typeSource, 'collaboratorIds: string[];', '团队必须保存受邀协作老师。');

requireText(editorSource, 'classes: ClassInfo[];', '创建团队必须接收学校内多个班级。');
requireText(editorSource, 'const [selectedIds, setSelectedIds]', '跨班切换时必须保留已选成员。');
requireText(editorSource, 'activeStudents.forEach(student =>', '成员选择必须支持按班全选。');
requireText(editorSource, "allActiveSelected ? '取消全选' : '全选'", '团队选人应统一使用“全选 / 取消全选”文案。');
assert.ok(!editorSource.includes('全选本班') && !editorSource.includes('取消全班'), '团队选人不应使用局限于本班的旧文案。');
requireText(editorSource, '谁可以看到', '创建团队必须要求老师选择可见范围。');
requireText(editorSource, '仅自己和协作老师', '私密范围文案必须符合老师认知。');
requireText(editorSource, '管理人员也可见', '公开范围文案必须明确管理人员也可查看。');
requireText(editorSource, "useState<SchoolStudentTeam['visibility'] | null>", '新建团队的可见范围不得预设默认值。');
requireText(editorSource, "export type StudentTeamEditorMode = 'create' | 'settings' | 'members';", '创建、团队设置与调整学生必须使用明确的渐进流程模式。');
requireText(editorSource, 'open: boolean;', '团队编辑器必须作为公共弹窗挂载，不得继续作为独立页面。');
requireText(editorSource, '<MobileBottomSheet', '创建团队必须复用公共底部弹窗。');
requireText(editorSource, "type EditorPage = 'details' | 'members' | 'exact-search';", '新建团队必须在同一弹窗内渐进披露基础信息、成员选择与精确查找。');
requireText(editorSource, "setPage('members')", '基础信息完成后必须在当前弹窗进入学生选择。');
requireText(editorSource, "? '选择学生'", '创建首屏必须只保留进入学生选择的唯一主操作。');
requireText(editorSource, '`完成（${selectedIds.size}人）`', '第二步主操作必须明确展示已选人数。');
requireText(editorSource, 'placeholder="例如：篮球社"', '名称示例必须与新建分组统一使用中文冒号。');
requireText(editorSource, "setPage('exact-search')", '跨班精确查找必须作为当前弹窗内的子页面渐进披露。');
assert.ok(!editorSource.includes('open={showOtherStudents}'), '跨班精确查找不得叠加第二层底部弹窗。');
requireText(editorSource, '输入完整姓名', '无权限班级学生只能通过完整姓名精确查找。');
requireText(editorSource, 'student.name.trim() === submittedExactName', '无权限学生检索不得使用模糊匹配。');
assert.ok(!editorSource.includes('搜索姓名或学号'), '跨班成员检索不得使用学号。');
assert.ok(!editorSource.includes('类型'), '创建团队不得要求老师理解或选择团队类型。');

assert.ok(!detailSource.includes('contextLabel={student.class}'), '团队成员卡不得展示原班级。');
requireText(detailSource, "from '../../components/student/StudentRosterCard'", '团队成员页必须复用班级花名册学生卡。');
requireText(detailSource, '全选', '团队成员页必须沿用班级列表的多选工具。');
requireText(detailSource, '反选', '团队成员页必须沿用班级列表的反选工具。');
requireText(detailSource, '学生卡片展示', '团队成员页必须沿用学生卡片展示设置。');
requireText(managementActionsSource, '调整学生', '创建人的成员维护必须使用独立入口。');
requireText(managementActionsSource, '团队设置', '创建人的基础信息维护必须使用独立入口。');
assert.ok(!detailSource.includes('编辑名称与成员'), '团队更多操作不得继续进入混合编辑长页面。');
requireText(managementActionsSource, '邀请协作老师', '只有创建人应获得协作评价邀请入口。');
requireText(detailSource, '<MenuIcon className="h-5 w-5" />', '团队详情更多操作必须放在多选旁边并复用班级工具栏图标。');
assert.ok(!detailSource.includes('MoreHorizontal'), '团队详情标题栏不得放置另一套更多操作。');
requireText(classListSource, 'aria-label={`${team.name}更多操作`}', '团队卡片必须使用独立的三点更多入口。');
requireText(classListSource, '<WechatMoreIcon className="h-5 w-5" />', '团队卡片必须与班级卡片复用微信三点图标。');
requireText(appSource, 'canManageSelectedStudentTeam', '团队编辑、邀请和解散必须按创建人权限控制。');
requireText(appSource, 'onUpdate={handleUpdateStudentTeam}', '团队设置与调整学生必须在当前页面弹窗内保存。');
assert.ok(!appSource.includes("'student_team_editor'"), '团队创建与维护不得保留独立页面路由。');
requireText(appSource, "isSchoolManager && team.visibility === 'management'", '管理人员只能看到明确向管理人员公开的团队。');
requireText(appSource, "const selectedStudentTeamCandidateIds = selectedStudentTeamStudents.map(student => student.id);", '团队录入候选范围必须等于当前有效成员。');
requireText(appSource, "currentView === 'student_team_detail' ? selectedStudentTeamCandidateIds : []", '只有团队成员页录入时才应注入团队候选范围。');
requireText(inputSource, 'candidateStudentIds?: string[];', '原有录入控件必须接收候选成员编号。');
requireText(inputSource, 'candidateStudentIds,', '语音、拍照和文字提交必须原样回传候选成员编号。');
requireText(appSource, "setCurrentView('student_team_detail');", '团队录入完成后必须回到团队成员页。');

assert.ok(!recordSource.includes('社团与团队'), '记录页不得增加社团与团队入口。');
assert.ok(!recordSource.includes('candidateStudentIds'), '记录页展示流程不得承担团队候选范围识别。');

const featureSources = [appSource, classListSource, detailSource, editorSource, managementActionsSource].join('\n');
for (const forbiddenCopy of ['特殊群体', '群组类型', '可评价学生名单', '行政班']) {
  assert.ok(!featureSources.includes(forbiddenCopy), `页面不得出现“${forbiddenCopy}”。`);
}

console.log('Student team flow assertions passed');
