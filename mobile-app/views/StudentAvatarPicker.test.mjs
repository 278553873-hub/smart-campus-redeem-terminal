import assert from 'node:assert/strict';
import fs from 'node:fs';

const catalogSource = fs.readFileSync('mobile-app/assets/studentAvatarCatalog.ts', 'utf8');
const assetsSource = fs.readFileSync('mobile-app/assets/images.ts', 'utf8');
const editSource = fs.readFileSync('mobile-app/views/StudentBasicEditView.tsx', 'utf8');

const girlAvatarImports = catalogSource.match(/student-avatars\/girls\/girl-(?:01-ponytail|02-twin-ponytail|03-bun|04-short|05-long|06-braid)-\d{2}-[a-z-]+\.jpg/g) ?? [];
const boyAvatarImports = catalogSource.match(/student-avatars\/boys\/boy-(?:01-very-short|02-textured-short|03-side-part|04-fringe|05-curly)-\d{2}-[a-z-]+\.jpg/g) ?? [];
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

for (const avatarImport of [...girlAvatarImports, ...boyAvatarImports]) {
  assert.ok(fs.existsSync(`mobile-app/assets/resources/${avatarImport}`), `缺少头像资源：${avatarImport}`);
}

console.log('学生系统头像分组与更换流程校验通过。');
