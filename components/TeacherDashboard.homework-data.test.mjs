import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherDashboard.tsx', import.meta.url), 'utf8');
const homeworkSectionStart = source.indexOf("{/* 作业数据 */}");
const homeworkSectionEnd = source.indexOf("{/* 考试数据 */}", homeworkSectionStart);
const homeworkSection = homeworkSectionStart >= 0 && homeworkSectionEnd > homeworkSectionStart
  ? source.slice(homeworkSectionStart, homeworkSectionEnd)
  : '';

const requireText = (needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

const forbidText = (needle, message) => {
  if (source.includes(needle)) throw new Error(message);
};

requireText("children: ['资料文件', '考试数据', '作业数据']", '数据中心应新增作业数据菜单。');
requireText("activeMenu === '考试数据' || activeMenu === '作业数据' || activeMenu === '设备基础配置'", '作业数据应复用 PC 数据页内容区边距。');
requireText("activeMenu === '作业数据'", '应渲染作业数据页面。');
requireText('Button, Cascader, DatePicker, Input, Select as ArcoSelect, Table', '作业数据列表页应使用 Arco 组件。');
requireText('<DatePicker', '作业日期筛选应使用 Arco DatePicker。');
requireText('<Cascader', '班级筛选应使用 Arco Cascader。');
requireText('<ArcoSelect', '科目筛选应使用 Arco Select。');
requireText('<Input', '录入人筛选应使用 Arco Input。');
requireText('<Table', '作业数据列表应使用 Arco Table。');
requireText('columns={homeworkTableColumns}', '作业数据表格应通过 columns 配置列。');
requireText("align: 'right' as const", '作业数据操作列应右对齐。');
requireText('border-t border-[#F2F3F5] mb-5 w-full', '作业数据筛选区和主操作区之间应有分割线。');
requireText('<Button type="primary" onClick={() => {}}>查询</Button>', '作业数据筛选区应包含查询主按钮。');
requireText('onClick={resetHomeworkListFilters}>重置</Button>', '作业数据筛选区应包含重置按钮。');
requireText('<Button type="primary" onClick={openHomeworkCreatePage}>新建作业记录</Button>', '新建作业记录应放在筛选分割线后的主操作区。');
requireText('[&_.arco-picker]:!border-[#E5E6EB] [&_.arco-picker]:!bg-white', '作业数据日期筛选默认态应保持白底和正常边框。');
requireText('[&_.arco-cascader-view]:!border-[#E5E6EB] [&_.arco-cascader-view]:!bg-white', '作业数据班级筛选默认态应保持白底和正常边框。');
requireText('[&_.arco-select-view]:!border-[#E5E6EB] [&_.arco-select-view]:!bg-white', '作业数据选择器默认态应保持白底和正常边框。');
requireText('[&_.arco-input-inner-wrapper]:!border-[#E5E6EB] [&_.arco-input-inner-wrapper]:!bg-white', '作业数据搜索框默认态应保持白底和正常边框。');
requireText('className="!border-[#E5E6EB] !bg-white !text-[#4E5969]" onClick={resetHomeworkListFilters}', '作业数据重置按钮应为白底默认按钮。');
requireText("value={homeworkSubjectFilter === '全部科目' ? undefined : homeworkSubjectFilter}", '科目筛选不应把全部科目作为真实选中值。');
requireText('HomeworkRecordRow', '应定义作业记录数据结构。');
requireText('homeworkStatusOptions', '作业完成情况应有独立状态枚举。');
requireText("['优', '良', '合格', '待合格', '未交']", '作业状态必须包含优、良、合格、待合格、未交。');
requireText('作业名称', '作业数据应支持可选作业名称。');
requireText('placeholder="例如：阅读理解"', '作业名称示例应体现可辅助识别知识掌握。');
requireText('newHomeworkName.trim() || \'-\'', '作业名称应允许不填写。');
requireText('homeworkSubjectFilter', '作业数据列表应支持科目筛选。');
requireText('newHomeworkSubject', '新建作业记录应选择科目。');
requireText('handleSaveHomeworkRecord', '应提供保存作业记录逻辑。');
requireText('handleFillHomeworkStudents', '应支持填充本班学生姓名。');
requireText('handleBatchSetHomeworkStatus', '应支持批量设置作业完成情况。');
requireText('homeworkStatusCounts', '查看页应展示各完成情况人数统计。');
requireText('暂无符合条件的作业记录', '列表空状态应针对作业数据。');
if (homeworkSection.includes('<table className="w-full border-collapse text-left text-sm font-normal text-[#4E5969]">')) {
  throw new Error('作业数据列表页不应继续使用手写 table。');
}
forbidText('作业名称：</span>\n                                                        <input', '作业名称不应标必填。');
