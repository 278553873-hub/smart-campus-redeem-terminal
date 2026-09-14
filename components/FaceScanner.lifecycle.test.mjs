import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./FaceScanner.tsx', import.meta.url), 'utf8');
const failures = [];

if (!source.includes('const onSuccessRef = useRef(onSuccess)') || !source.includes('onSuccessRef.current = onSuccess')) {
  failures.push('人脸识别成功回调应保持稳定，不能因终端倒计时刷新而反复重启识别。');
}

if (!source.includes('successTimer = setTimeout') || !source.includes('if (successTimer) clearTimeout(successTimer)')) {
  failures.push('关闭或切换人脸登录弹窗后，应取消尚未执行的自动登录回调。');
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('face scanner lifecycle assertions passed');
