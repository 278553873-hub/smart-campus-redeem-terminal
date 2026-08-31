import fs from 'node:fs';
import assert from 'node:assert/strict';

const viewSource = fs.readFileSync(new URL('./MedalIssuanceView.tsx', import.meta.url), 'utf8');
const medalDomainSource = fs.readFileSync(new URL('../domain/medal.ts', import.meta.url), 'utf8');
const classListSource = fs.readFileSync(new URL('./ClassListView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');

assert.match(classListSource, /label: '颁发奖章'/, '班级更多操作应提供颁发奖章入口。');
assert.match(classListSource, /onViewMedalIssuance/, '班级更多操作应将奖章发放交给路由层。');
assert.match(appSource, /'medal_issuance'/, '教师端应注册奖章发放页面路由。');
assert.doesNotMatch(viewSource, /公共奖章（校级）|自定义奖章（班级）/, '奖章选择界面不应展示旧版范围文案。');
assert.match(medalDomainSource, /icon: 'book'/, '奖章定义应包含图标。');
assert.match(viewSource, /CompactSegmentedControl/, '奖章分类应使用 Token 化的公共分段切换控件。');
assert.match(viewSource, /平台奖章/, '奖章分类应提供平台奖章。');
assert.match(viewSource, /学校奖章/, '奖章分类应提供学校奖章。');
assert.match(viewSource, /班级奖章/, '奖章分类应提供班级奖章。');
assert.match(medalDomainSource, /DEFAULT_PLATFORM_MEDALS/, '奖章定义应包含平台默认奖章。');
assert.match(medalDomainSource, /DEFAULT_SCHOOL_MEDALS/, '奖章定义应包含学校自设计奖章。');
assert.match(medalDomainSource, /MEDAL_DISPLAY_SPECS/, '奖章定义应提供跨页面展示规格。');
assert.match(medalDomainSource, /studentDetail: \{ iconSize: 32, itemMinHeight: 56, showQuantity: true \}/, '学生详情应展示32像素图标和累计数量。');
assert.match(medalDomainSource, /termReport: \{ iconSize: 24, itemMinHeight: 40, showQuantity: true \}/, '期末报告应使用24像素图标并展示累计数量。');
assert.match(viewSource, /新增班级奖章/, '班级奖章应提供班主任新增入口。');
assert.match(viewSource, /奖章名称/, '新增班级奖章应填写名称。');
assert.match(viewSource, /选择图标/, '新增班级奖章应选择图标。');
assert.doesNotMatch(viewSource, /classInfo\.name/, '奖章页顶部不应重复展示班级名称。');
assert.match(viewSource, /selectedMedalIds/, '奖章选择应维护多选状态。');
assert.match(viewSource, /aria-pressed=\{selected\}/, '奖章卡应暴露选中状态。');
assert.match(viewSource, /min-h-\[100px\]/, '奖章卡应保持稳定的触控尺寸。');
assert.match(viewSource, /flex-col/, '奖章卡应采用图标在上、名称在下的上下结构。');
assert.match(viewSource, /选择学生/, '底部主操作应先引导选择学生。');
assert.match(viewSource, /StudentCompactSelectGrid/, '页面应复用公共学生多选组件。');
assert.match(viewSource, /搜索学生/, '学生选择应支持按姓名或学号搜索。');
assert.match(viewSource, /颁发成功/, '颁发成功后应提供反馈。');

console.log('MedalIssuanceView assertions passed');
