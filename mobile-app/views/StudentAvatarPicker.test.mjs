import assert from 'node:assert/strict';
import fs from 'node:fs';

const catalogSource = fs.readFileSync('mobile-app/assets/studentAvatarCatalog.ts', 'utf8');
const assetsSource = fs.readFileSync('mobile-app/assets/images.ts', 'utf8');
const editSource = fs.readFileSync('mobile-app/views/StudentBasicEditView.tsx', 'utf8');

const girlAvatarImports = catalogSource.match(/student-girl-\d{2}\.jpg/g) ?? [];
const boyAvatarImports = catalogSource.match(/student-boy-avatar-\d{2}\.jpg/g) ?? [];
assert.equal(girlAvatarImports.length, 20, '应完整导入 20 张女生系统头像。');
assert.equal(boyAvatarImports.length, 20, '应完整导入 20 张男生系统头像。');

const expectedGroupOrder = ["label: '马尾'", "label: '双马尾'", "label: '丸子头'", "label: '短发'", "label: '长发与发箍'", "label: '编发'"];
let previousGroupIndex = -1;
for (const groupLabel of expectedGroupOrder) {
  const groupIndex = catalogSource.indexOf(groupLabel);
  assert.ok(groupIndex > previousGroupIndex, `头像分组顺序错误：${groupLabel}`);
  previousGroupIndex = groupIndex;
}

const expectedBoyGroupOrder = ["label: '极短发'", "label: '短碎发'", "label: '侧分'", "label: '刘海'", "label: '卷发'"];
previousGroupIndex = -1;
for (const groupLabel of expectedBoyGroupOrder) {
  const groupIndex = catalogSource.indexOf(groupLabel);
  assert.ok(groupIndex > previousGroupIndex, `男生头像分组顺序错误：${groupLabel}`);
  previousGroupIndex = groupIndex;
}

assert.match(assetsSource, /SYSTEM_GIRL_GROUPS: studentGirlAvatarGroups/);
assert.match(assetsSource, /SYSTEM_BOY_GROUPS: studentBoyAvatarGroups/);
assert.match(editSource, /ASSETS\.AVATAR\.SYSTEM_BOY_GROUPS/);
assert.match(editSource, /MobileBottomSheet/);
assert.match(editSource, /系统头像/);
assert.match(editSource, /上传头像/);
assert.match(editSource, /使用此头像/);
assert.match(editSource, /拍照/);
assert.match(editSource, /从相册选择/);
assert.match(editSource, /aria-pressed={isSelected}/);
assert.doesNotMatch(editSource, /cycleMockAvatar/);
assert.doesNotMatch(editSource, /ASSETS\.AVATAR\.BOYS\.map/);

for (let index = 1; index <= 20; index += 1) {
  const fileName = `student-girl-${String(index).padStart(2, '0')}.jpg`;
  assert.ok(fs.existsSync(`mobile-app/assets/resources/student-avatars/girls/${fileName}`), `缺少头像资源：${fileName}`);
}

for (let index = 1; index <= 20; index += 1) {
  const fileName = `student-boy-avatar-${String(index).padStart(2, '0')}.jpg`;
  assert.ok(fs.existsSync(`mobile-app/assets/resources/student-avatars/boys/${fileName}`), `缺少头像资源：${fileName}`);
}

console.log('学生系统头像分组与更换流程校验通过。');
