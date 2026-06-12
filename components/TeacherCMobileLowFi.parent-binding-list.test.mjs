import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherCMobileLowFi.tsx', import.meta.url), 'utf8');
const failures = [];
const requireText = (text, message) => {
  if (!source.includes(text)) failures.push(message);
};

requireText("title: '家长绑定列表'", '10 页标题应为家长绑定列表（不区分管理员/非管理员）。');
requireText("if (pageKey === 'parentBindingList') return '10';", '家长绑定列表编号应为 10。');
requireText("if (page === 'parentBindingList') {", '页面渲染应只匹配 parentBindingList，不区分 member。');
requireText("navigate('parentBindingList')", '班级详情进入家长绑定列表应统一导航到 parentBindingList。');
requireText("已绑定{student.bindingCount}位家长", '绑定人数应展示为"已绑定X位家长"。');
requireText("未绑定/已绑定", '页面应有未绑定/已绑定 tab 或统计。');
requireText("邀请家长绑定按钮固定在页面底部", 'PRD 应说明邀请按钮固定底部。');
requireText("未绑定学生不展示 0 人", 'PRD 应说明未绑定不展示 0 人。');
requireText("页面不提供移除家长操作", 'PRD 应说明不提供移除操作。');
requireText("系统无法识别具体家长身份", 'PRD 应说明无法识别家长身份。');

// 不应存在 parentBindingListMember
if (source.includes("'parentBindingListMember'") || source.includes("parentBindingListMember")) {
  failures.push('不应存在 parentBindingListMember 页面。');
}

// 不应存在 activeParentRemove
if (source.includes('activeParentRemove')) {
  failures.push('不应存在 activeParentRemove 状态。');
}

// 不应存在 canRemove
if (source.includes('canRemove')) {
  failures.push('不应存在 canRemove 属性。');
}

// 不应存在 parentNames
if (source.includes('parentNames')) {
  failures.push('不应存在 parentNames 数据。');
}

if (source.includes("'妈妈'") || source.includes("'爸爸'")) {
  failures.push('不应使用妈妈/爸爸等虚构称呼。');
}

if (failures.length) throw new Error(failures.join('\n'));
console.log('TeacherCMobileLowFi parent binding list assertions passed');
