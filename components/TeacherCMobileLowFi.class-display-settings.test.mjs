import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherCMobileLowFi.tsx', import.meta.url), 'utf8');
const failures = [];
const requireText = (text, message) => {
  if (!source.includes(text)) failures.push(message);
};

requireText("const [showPersonalClassDisplaySheet, setShowPersonalClassDisplaySheet] = useState(false);", '07A 应有首页班级显示设置弹窗状态。');
requireText("const [showPersonalClassActionSheet, setShowPersonalClassActionSheet] = useState(false);", '07A 应有班级操作弹窗状态。');
requireText("const [personalVisibleClassCodes, setPersonalVisibleClassCodes] = useState<string[]>(['58273914', '73948162']);", '07A 应用班级号记录首页显示班级。');
requireText("const visiblePersonalClassCards = personalClassCards.filter((item) => personalVisibleClassCodes.includes(item.code));", '07A 首页列表应只展示已选择显示的班级。');
requireText("const createdClassCards = visibleSourceClassCards.filter((item) => item.isCreator);", '07A 创建的班级分组应基于当前来源班级。');
requireText("const joinedClassCards = visibleSourceClassCards.filter((item) => !item.isCreator);", '07A 加入的班级分组应基于当前来源班级。');
requireText('aria-label="打开班级操作"', '07A 右上角应使用加号打开班级操作弹层。');
requireText('<Plus size={20} />', '07A 右上角班级操作入口应使用加号 icon。');
requireText('aria-label="班级操作"', '07A 班级操作应收敛到底部弹层。');
requireText('<h3 className="text-base font-black">班级操作</h3>', '班级操作弹层应有明确标题。');
requireText('<span className="flex items-center gap-2"><Plus size={17} />创建班级</span>', '班级操作弹层应包含创建班级。');
requireText('<span className="flex items-center gap-2"><LogIn size={17} />加入班级</span>', '班级操作弹层应包含加入班级。');
requireText('<span className="flex items-center gap-2"><SlidersHorizontal size={17} />显示设置</span>', '班级操作弹层应包含显示设置。');
requireText("setShowPersonalClassActionSheet(false);\n                      navigate('classCreate');", '点击创建班级应关闭操作弹层并进入创建班级。');
requireText("setShowPersonalClassActionSheet(false);\n                      navigate('classJoin');", '点击加入班级应关闭操作弹层并进入加入班级。');
requireText("setShowPersonalClassActionSheet(false);\n                      setShowPersonalClassDisplaySheet(true);", '点击显示设置应关闭操作弹层并打开显示班级弹层。');
requireText('aria-label="显示班级"', '显示设置应收敛到底部弹窗。');
requireText('<h3 className="text-base font-black">显示班级</h3>', '底部弹窗内可展示显示班级标题。');
requireText("setPersonalVisibleClassCodes((codes) => (", '底部弹窗应支持切换班级是否在首页显示。');
requireText('aria-pressed={checked}', '班级显示项应有选中状态。');
requireText('暂无显示班级', '隐藏全部班级后 07A 应有极简空状态。');
requireText('完成</button>', '底部弹窗应提供完成按钮。');

const classListRenderStart = source.indexOf("if (page === 'classListPersonal' || page === 'classListSchool')");
const classListRenderEnd = source.indexOf("if (page === 'classDetail' || page === 'classDetailMember'", classListRenderStart);
const classListRender = source.slice(classListRenderStart, classListRenderEnd);
const personalOnlyStart = classListRender.indexOf('aria-label="打开班级操作"') - 500;
const personalOnlyEnd = classListRender.indexOf('{isSchoolList && (', personalOnlyStart);
const personalTopBlock = classListRender.slice(personalOnlyStart, personalOnlyEnd);

if (personalTopBlock.includes('<ScreenHeader') || personalTopBlock.includes('<h1') || personalTopBlock.includes('<h2') || personalTopBlock.includes('班级列表（个人版）')) {
  failures.push('07A 主页面只新增按钮，不应增加页面标题或标题区。');
}

if (personalTopBlock.includes('选择') || personalTopBlock.includes('哪些班级') || personalTopBlock.includes('首页列表') || personalTopBlock.includes('毕业')) {
  failures.push('07A 主页面按钮区不应出现说明型文案，避免挤压空间。');
}

if (personalTopBlock.includes('ClassEntryCard') || personalTopBlock.includes('创建班级') || personalTopBlock.includes('加入班级') || personalTopBlock.includes('显示设置') || personalTopBlock.includes('SlidersHorizontal')) {
  failures.push('07A 主页面操作区只应保留加号入口，不应直接展示创建、加入或显示设置。');
}

if (!classListRender.includes('className="flex items-center justify-between gap-3"') || !classListRender.includes('className="flex h-11 w-11 items-center justify-center rounded-full')) {
  failures.push('07A 加号入口应放在右上角，并保证 44px 触控热区。');
}

const createdSectionStart = classListRender.indexOf('创建的班级');
const classListAfterSections = classListRender.slice(createdSectionStart);
if (classListAfterSections.includes('设置首页显示班级') || classListAfterSections.includes('显示</button>')) {
  failures.push('07A 班级分组标题右侧不应再展示显示按钮，显示设置应进入加号弹层。');
}

if (failures.length) throw new Error(failures.join('\n'));
console.log('TeacherCMobileLowFi class display settings assertions passed');
