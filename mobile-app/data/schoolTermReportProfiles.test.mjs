import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getSchoolStudentReportContent, getSchoolTermReportProfile } from './schoolTermReportProfiles.ts';
import { DEMO_CLASS_STUDENTS, getDemoClassStudent } from './demoClassStudents.ts';

const profile = getSchoolTermReportProfile('school-qinghe');
assert.ok(profile, '青禾实验小学应配置期末报告口径');

assert.deepEqual(profile.hiddenSections, ['subject-results', 'highlights', 'five-education-highlights'], '青禾实验小学期末报告不应展示学科成绩分布、高光时刻与五育发展亮点');

assert.deepEqual(
  profile.radarDimensions.map(item => item.label),
  ['健康向上', '乐学善思', '实践创新', '自主担当'],
  '五育雷达图应使用学校自己的四个一级指标',
);
for (const dimension of profile.radarDimensions) {
  for (const key of ['score', 'startScore', 'classAverageScore']) {
    assert.equal(typeof dimension[key], 'number', '雷达维度应包含' + key + '：' + dimension.label);
  }
}

// 固定演示学生
assert.deepEqual(
  DEMO_CLASS_STUDENTS['c_2024_1']?.map(student => student.name),
  ['杨悠然', '邹艾琳'],
  '2024级一班应固定杨悠然与邹艾琳两名学生',
);
assert.deepEqual(
  DEMO_CLASS_STUDENTS['c_2026_1']?.map(student => student.name),
  ['高奕可', '廖堇汐'],
  '一年级一班（2026级）应固定高奕可与廖堇汐两名学生',
);
assert.equal(getDemoClassStudent('c_2024_1', 0)?.name, '杨悠然', '花名册第 1 位应是杨悠然');
assert.equal(getDemoClassStudent('c_2024_1', 1)?.name, '邹艾琳', '花名册第 2 位应是邹艾琳');
assert.equal(getDemoClassStudent('c_2026_1', 3)?.name, '高奕可', '一年级一班的第 4 位应是高奕可');
assert.equal(getDemoClassStudent('c_2026_1', 4)?.name, '廖堇汐', '一年级一班的第 5 位应是廖堇汐');
assert.equal(getDemoClassStudent('c_2025_3', 0), undefined, '未配置的班级仍按姓名池生成花名册');

const demoStudents = [
  { name: '杨悠然', focus: '乐学善思', classId: 'c_2024_1' },
  { name: '邹艾琳', focus: '健康向上', classId: 'c_2024_1' },
  { name: '高奕可', focus: '乐学善思', classId: 'c_2026_1' },
  { name: '廖堇汐', focus: '健康向上', classId: 'c_2026_1' },
].map(item => ({ ...item, content: getSchoolStudentReportContent('school-qinghe', item.name) }));

assert.equal(getSchoolStudentReportContent('school-qinghe', '其他学生'), undefined, '未配置的学生沿用平台通用内容');

for (const student of demoStudents) {
  const content = student.content;
  assert.ok(content, student.name + '应配置报告内容');
  assert.ok((content.tags ?? []).length >= 3, student.name + '的报告应有自己的封面标签');
  assert.ok((content.growthAdvice ?? '').length > 60, student.name + '的报告应有自己的成长建议');
  assert.ok((content.parentActivityGuide ?? '').length > 60, student.name + '的报告应有自己的亲子活动指南');
  assert.ok(!/该生/.test(content.growthAdvice ?? ''), student.name + '的成长建议应直接与学生交流');

  const dimensions = content.dimensions ?? [];
  assert.equal(dimensions.length, 4, student.name + '的五育雷达应覆盖四个一级指标');

  const scores = dimensions.map(item => item.score);
  const focus = dimensions[scores.indexOf(Math.max(...scores))]?.label;
  assert.equal(focus, student.focus, student.name + '的侧重维度应是' + student.focus);
  assert.ok(
    Math.max(...scores) - Math.min(...scores) >= 20,
    student.name + '的五育雷达要能看出明显侧重，实际差值：' + (Math.max(...scores) - Math.min(...scores)),
  );

  for (const dimension of dimensions) {
    assert.ok(
      dimension.startScore < dimension.score,
      student.name + '的' + dimension.label + '期初应低于期末，体现成长性',
    );
    assert.ok(
      dimension.score - dimension.startScore >= 12,
      student.name + '的' + dimension.label + '成长幅度应可感知，实际：' + (dimension.score - dimension.startScore),
    );
  }
}

// 同班班级平均一致
for (const classId of ['c_2024_1', 'c_2026_1']) {
  const averages = demoStudents
    .filter(student => student.classId === classId)
    .map(student => (student.content?.dimensions ?? []).map(item => item.classAverageScore));
  assert.deepEqual(averages[0], averages[1], classId + ' 的班级平均应一致');
}

// 四名学生的报告内容两两不同
for (let i = 0; i < demoStudents.length; i += 1) {
  for (let j = i + 1; j < demoStudents.length; j += 1) {
    const left = demoStudents[i];
    const right = demoStudents[j];
    assert.notDeepEqual(left.content.tags, right.content.tags, left.name + '与' + right.name + '的封面标签应不同');
    assert.notEqual(left.content.growthAdvice, right.content.growthAdvice, left.name + '与' + right.name + '的成长建议应不同');
    assert.notEqual(left.content.parentActivityGuide, right.content.parentActivityGuide, left.name + '与' + right.name + '的亲子活动指南应不同');
    assert.notDeepEqual(
      left.content.dimensions?.map(item => item.score),
      right.content.dimensions?.map(item => item.score),
      left.name + '与' + right.name + '的五育得分应不同',
    );
  }
}

assert.equal(getSchoolTermReportProfile('school-star'), undefined, '未配置的学校应使用平台默认报告');

const viewSource = fs.readFileSync('mobile-app/views/TermReportView.tsx', 'utf8');
for (const prop of ['hiddenSections', 'radarDimensions', 'studentReportContent']) {
  assert.ok(viewSource.includes(prop), '期末报告应支持学校报告入参：' + prop);
}
assert.ok(viewSource.includes('showSubjectResults && subjectResultsCard'), '学科成绩分布应受学校配置控制');
assert.ok(viewSource.includes('schoolGrowthProps.showHighlights'), '高光时刻应受学校配置控制');
assert.ok(!viewSource.includes('FiveEducationFrameworkCard'), '期末报告不应再展示学校五育成长表现板块');

const constantsSource = fs.readFileSync('mobile-app/constants.ts', 'utf8');
assert.ok(constantsSource.includes('getDemoClassStudent(classId, i)'), '花名册应读取固定的演示学生');
assert.ok(constantsSource.includes('{ year: 2026, level: ' + String.fromCharCode(39) + '一年级' + String.fromCharCode(39) + ' }'), '一年级应是 2026 级');
assert.ok(!constantsSource.includes('demoStudent?.studentNo'), '学号应按班级年份自动生成，不再逐个指定');

const appSource = fs.readFileSync('mobile-app/App.tsx', 'utf8');
assert.ok(appSource.includes('getSchoolTermReportProfile(activeTeacherSpace.id)'), '教师手机端应按当前学校读取期末报告口径');
assert.ok(appSource.includes('getSchoolStudentReportContent(activeTeacherSpace.id, activeStudent.name)'), '教师手机端应按学生读取报告内容');
for (const prop of ['hiddenSections=', 'radarDimensions=', 'studentReportContent=']) {
  assert.ok(appSource.includes(prop), '教师手机端应把学校报告配置传给期末报告：' + prop);
}

console.log('学校期末报告口径测试通过');
