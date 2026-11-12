import assert from 'node:assert/strict';
import { build } from 'esbuild';

const bundle = await build({
  entryPoints: ['mobile-app/domain/studentFaceLibrary.ts'],
  bundle: true, platform: 'node', format: 'esm', write: false, logLevel: 'silent',
  plugins: [{
    name: 'face-test-assets',
    setup(builder) {
      builder.onLoad({ filter: /assets\/images\.ts$/ }, () => ({
        contents: 'export const ASSETS = { AVATAR: { FACE_SAMPLE_BOYS: ["face-boy-1.jpg", "face-boy-2.jpg"], FACE_SAMPLE_GIRLS: ["face-girl-1.jpg"] } };',
        loader: 'js',
      }));
    },
  }],
});
const {
  applyFaceAvatars, clearStudentFace, getStudentFaceLibraryVersion, getStudentFaceSrc,
  isStudentFaceRecorded, markStudentFaceRecorded, resolveStudentAvatar,
  seedClassFaceLibrary, subscribeStudentFaceLibrary,
} = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));

const students = [
  { id: 's1', name: '张三', gender: 'male', avatar: 'student-avatar-1.svg' },
  { id: 's2', name: '李四', gender: 'female', avatar: 'student-avatar-2.svg' },
  { id: 's3', name: '王五', gender: 'male', avatar: 'student-avatar-3.svg' },
];
const originalStudents = structuredClone(students);
seedClassFaceLibrary('class-a', students);
const projectedStudents = applyFaceAvatars(students);
assert.notEqual(projectedStudents[0].avatar, students[0].avatar);
assert.equal(projectedStudents[2], students[2], '未录入学生继续使用原资料');

let notified = 0;
const unsubscribe = subscribeStudentFaceLibrary(() => notified++);
const initialVersion = getStudentFaceLibraryVersion();
clearStudentFace('s1');
assert.equal(isStudentFaceRecorded('s1'), false, '清除后变为待录入');
assert.equal(getStudentFaceSrc('s1'), undefined, '共享人脸库不再保留采集照');
assert.equal(isStudentFaceRecorded('s2'), true, '不影响其他学生');
assert.equal(notified, 1, '通知其它页面更新');
assert.equal(getStudentFaceLibraryVersion(), initialVersion + 1);
assert.equal(resolveStudentAvatar(projectedStudents[0]), students[0].avatar, '已有列表投影也不能回退到旧采集照');
assert.equal(applyFaceAvatars(projectedStudents)[0].avatar, students[0].avatar, '重复应用头像映射仍还原独立头像');
assert.deepEqual(students, originalStudents, '不修改学生资料');

clearStudentFace('s1');
clearStudentFace('unknown');
assert.equal(notified, 1, '重复清除或清除不存在学生不重复通知');
seedClassFaceLibrary('class-a', students);
assert.equal(isStudentFaceRecorded('s1'), false, '返回班级页面不会被演示初始化重新录入');
assert.equal(students.filter(student => isStudentFaceRecorded(student.id)).length, 1);

markStudentFaceRecorded(students[0], 'class-a');
assert.equal(isStudentFaceRecorded('s1'), true, '清除后仍可重新录入');
assert.equal(notified, 2);
const projectedAgain = applyFaceAvatars(projectedStudents);
clearStudentFace('s1');
assert.equal(resolveStudentAvatar(projectedAgain[0]), students[0].avatar, '重新录入再清除也不残留上一张采集照');

const withoutAvatar = { id: 'no-avatar', name: '无头像学生', gender: 'female' };
markStudentFaceRecorded(withoutAvatar, 'class-a');
const [projectedWithoutAvatar] = applyFaceAvatars([withoutAvatar]);
clearStudentFace(withoutAvatar.id);
assert.equal(resolveStudentAvatar(projectedWithoutAvatar), undefined, '无独立头像时清除后显示缺省形象');

unsubscribe();
console.log('学生人脸清除、跨页通知、头像还原及重新录入检查通过');
