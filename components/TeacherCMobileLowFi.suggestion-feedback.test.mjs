import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherCMobileLowFi.tsx', import.meta.url), 'utf8');
const failures = [];
const requireText = (text, message) => {
  if (!source.includes(text)) failures.push(message);
};

requireText("| 'suggestionFeedback'", '教师端页面枚举应新增建议反馈页。');
requireText("if (pageKey === 'suggestionFeedback') return '22';", '建议反馈页编号应为 22。');
requireText("{ title: '我的(个人版)', pages: ['minePersonal', 'teacherBasicInfoPersonal', 'suggestionFeedback'] }", '14A 流程应包含建议反馈。');
requireText("{ title: '我的(学校版)', pages: ['mineSchool', 'teacherBasicInfoSchool', 'mineSettings', 'subjectManagement', 'departmentManagement', 'coinIssuanceManagement', 'suggestionFeedback'] }", '14B 流程应包含建议反馈。');
requireText("suggestionFeedback: {", '应定义建议反馈页面元信息。');
requireText("modules: ['反馈内容', '上传图片', '图片数量', '提交按钮']", '建议反馈页面元信息应包含表单字段。');
requireText("type TeacherSuggestionFeedback = {", '应定义运营端承接的建议反馈数据结构。');
requireText('phone: string;', '运营端建议反馈数据结构应包含手机号。');
requireText("const [suggestionFeedbackText, setSuggestionFeedbackText] = useState('');", '建议反馈表单应有文本状态。');
requireText("const [suggestionFeedbackImages, setSuggestionFeedbackImages] = useState<string[]>([]);", '建议反馈表单应有图片状态。');
requireText("const [teacherSuggestionFeedbackRows, setTeacherSuggestionFeedbackRows] = useState<TeacherSuggestionFeedback[]>([", '运营端应有建议反馈列表状态。');
requireText("teacher: '李明老师', phone: '138****2468'", '运营端建议反馈初始数据应展示老师手机号。');
requireText("label: '建议反馈', icon: MessageCircle, onClick: () => navigate('suggestionFeedback')", '14A/14B 更多工具应新增建议反馈入口。');
requireText("if (page === 'suggestionFeedback')", '应渲染 22 建议反馈页。');
requireText('<ScreenHeader title="建议反馈" />', '建议反馈页应有页面标题。');
requireText('<span className="text-sm font-black text-gray-900">反馈内容</span>', '反馈内容应使用可见标签。');
requireText('aria-label="反馈内容"', '反馈内容输入应有无障碍标签。');
requireText('aria-required="true"', '反馈内容应标记必填。');
requireText('suggestionFeedbackImages.length < 5', '上传图片最多 5 张。');
requireText('{suggestionFeedbackImages.length}/5', '图片区域应显示 0-5 数量。');
requireText('addSuggestionFeedbackImage', '应支持上传图片占位。');
requireText('removeSuggestionFeedbackImage', '应支持删除已上传图片。');
requireText('disabled={!canSubmitSuggestion}', '反馈内容为空时提交按钮应禁用。');
requireText('submitSuggestionFeedback', '提交后应进入运营端承接列表。');
requireText("showClassActionToast('建议反馈已提交')", '提交后应给出成功反馈。');
requireText("opsPage, setOpsPage] = useState<'home' | 'personalUsers' | 'suggestionFeedback'>('home');", '运营端应新增建议反馈内部页状态。');
requireText("{ key: 'suggestionFeedback' as const, label: '建议反馈' }", '运营端侧边栏应新增建议反馈菜单。');
requireText("opsPage === 'suggestionFeedback'", '运营端应渲染建议反馈模块。');
requireText('老师姓名</div>', '运营端建议反馈表格应展示老师姓名列。');
requireText('手机号</div>', '运营端建议反馈表格应展示手机号列。');
requireText('版本</div>', '运营端建议反馈表格应展示版本列。');
requireText('反馈内容</div>', '运营端建议反馈表格应展示反馈内容列。');
requireText('图片</div>', '运营端建议反馈表格应展示图片数量列。');
requireText('状态</div>', '运营端建议反馈表格应展示状态列。');
requireText('操作</div>', '运营端建议反馈表格应展示操作列。');
requireText('markSuggestionFeedbackStatus', '运营端建议反馈应支持标记处理状态。');
requireText("row.status === '待处理' ? '已处理' : '待处理'", '建议反馈行内操作应在已处理和待处理之间切换。');
requireText("{row.status === '待处理' ? '标记为已处理' : '标记为待处理'}", '建议反馈行内操作应根据状态展示对应按钮文案。');
requireText('点击建议反馈进入 22 建议反馈表单，可填写文本并上传 1-5 张图片；提交后进入运营端建议反馈模块。', '14A/14B PRD 应说明建议反馈流转。');

const mineStart = source.indexOf("if (page === 'minePersonal' || page === 'mineSchool')");
const mineEnd = source.indexOf("if (page === 'teacherBasicInfoPersonal' || page === 'teacherBasicInfoSchool')", mineStart);
const mineBlock = source.slice(mineStart, mineEnd);
if (!mineBlock.includes("label: '建议反馈'")) {
  failures.push('建议反馈入口必须出现在 14A/14B 更多工具渲染块内。');
}

const feedbackStart = source.indexOf("if (page === 'suggestionFeedback')");
const feedbackEnd = source.indexOf("if (page === 'termManagement')", feedbackStart);
const feedbackBlock = source.slice(feedbackStart, feedbackEnd);
if (feedbackBlock.includes('备注') || feedbackBlock.includes('逻辑说明')) {
  failures.push('建议反馈表单不应展示备注或逻辑说明文案。');
}

if (failures.length) throw new Error(failures.join('\n'));
console.log('TeacherCMobileLowFi suggestion feedback assertions passed');
