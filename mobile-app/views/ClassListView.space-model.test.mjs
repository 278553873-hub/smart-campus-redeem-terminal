import assert from 'node:assert/strict';
import fs from 'node:fs';

const classListSource = fs.readFileSync(new URL('./ClassListView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const constantsSource = fs.readFileSync(new URL('../constants.ts', import.meta.url), 'utf8');

const requireText = (source, needle, message) => {
  assert.ok(source.includes(needle), message);
};

requireText(classListSource, 'currentSpace: TeacherSpaceOption;', '班级列表必须接收当前班级来源。');
requireText(classListSource, 'classMembershipById: Record<string, TeacherClassMembership>;', '个人与协作来源必须提供班级归属关系。');
assert.ok(!classListSource.includes('ClassSourceTrigger'), '班级页不得继续展示班级来源切换入口。');
requireText(classListSource, '{visibleClasses.map(renderClassCard)}', '当前来源下应直接展示班级卡片。');
assert.ok(!classListSource.includes("renderClassSection('创建的班级'"), '“我创建的班级”来源下不应重复展示创建分组。');
assert.ok(!classListSource.includes("renderClassSection('加入的班级'"), '个人来源下不应混入加入的班级。');
assert.ok(!classListSource.includes("renderClassSection('协作班级'"), '协作来源下不应重复展示协作分组。');

requireText(classListSource, 'const showLeaderboard = canViewClassLeaderboard(currentSpace);', '排行榜显示条件必须来自统一空间权限规则。');
requireText(classListSource, "activeListTab === 'class' && showLeaderboard", '排行榜入口必须同时校验班级页签和空间能力。');
requireText(classListSource, 'const canManagePersonal = canManagePersonalClasses(currentSpace);', '个人版加号必须来自统一空间权限规则。');
requireText(classListSource, '显示${visibleClasses.length}/${classes.length}个班级', '个人来源的管理工具行应同时反馈班级显示数量。');
requireText(classListSource, 'open={canManagePersonal && showClassManagement}', '班级管理弹窗也必须校验当前为本人创建来源。');
assert.ok(!classListSource.includes('showPersonalClassActions'), '班级页不应残留旧的班级操作状态引用。');
assert.ok(!classListSource.includes('showAddClassActions'), '班级页不应残留仅表达添加语义的状态引用。');
requireText(classListSource, "{ label: '创建班级', icon: Plus, onClick: onCreateClass }", '个人版操作弹窗应包含创建班级。');
requireText(classListSource, "{ label: '加入班级', icon: LogIn, onClick: onJoinClass }", '个人版操作弹窗应包含加入班级。');
requireText(classListSource, "{ label: '显示设置', icon: SlidersHorizontal, onClick: () => setShowDisplaySettings(true) }", '班级操作弹窗必须保留显示设置。');
requireText(classListSource, 'canManagePersonal && classes.length > 0', '已有个人班级时才显示班级管理工具行。');

requireText(classListSource, 'getTeacherClassActionPolicy({', '更多操作必须根据来源、版本和班级角色生成。');
requireText(classListSource, 'activeActionPolicy.canMaintainClass', '班级维护操作必须受权限控制。');
requireText(classListSource, 'activeActionPolicy.canInviteParent', '邀请家长必须受权限控制。');
requireText(classListSource, "label: '邀请家长加入'", '协同管理应支持邀请家长。');
requireText(classListSource, 'onClick={() => onViewClassReport(classInfo.id)}', '所有可见班级都应在卡片外层提供班级报告。');
assert.ok(!classListSource.includes('const hasMoreActions = Object.values(classActionPolicy).some(Boolean);'), '更多按钮应始终提供班级号复制能力，管理操作再按权限生成。');

requireText(classListSource, 'formatClassCode(activeActionClass.classCode)', '更多操作抽屉应展示格式化班级号。');
requireText(classListSource, 'inline-flex min-h-[var(--tm-size-touch)] items-center gap-[var(--tm-space-2)]', '抽屉内班级号复制入口必须提供44像素触控热区。');
requireText(constantsSource, "classCode: `${g.year}${String(idx + 1).padStart(4, '0')}`", '班级数据必须提供8位班级号。');

requireText(appSource, 'CLASS_MEMBERSHIP_BY_SPACE', 'App 应维护个人和协作来源的班级归属。');
requireText(appSource, "personal: {\n        c_2025_1: 'created',\n    }", '个人来源只应包含自己创建的班级。');
assert.ok(!appSource.includes("c_2024_2: 'joined'"), '加入的班级应通过独立协作来源展示。');
requireText(appSource, "activeTeacherSpace.type === 'school'", '学校来源应保留学校班级集合。');
requireText(appSource, 'classes={activeSpaceClasses}', '班级列表必须接收当前来源对应的班级。');
assert.ok(!appSource.includes("(currentView === 'me' || currentView === 'class_list') && showTeacherSpaceSheet"), '班级页不得再挂载来源切换弹窗。');
requireText(appSource, "currentView === 'me' && showTeacherSpaceSheet", '班级来源切换应保留在“我的”页。');
requireText(appSource, 'if (!canManagePersonalClasses(activeTeacherSpace)) return;', '创建班级回调必须拒绝其他老师的协作来源和学校来源。');

console.log('ClassListView source, version and permission model assertions passed');
