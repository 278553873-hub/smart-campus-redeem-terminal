import assert from 'node:assert/strict';
import { splitAssistantReply } from './assistantReplyChunks.ts';

for (const text of [
    '本周哪些学生没有被评价到？',
    '请重点关注这几位学生的课堂表现。',
    '超长汉字文本测试换行\n下一行内容',
    '学生（本周）记录，AI assistant 记录52条。',
    '一。二！三？',
    '',
]) {
    const chunks = splitAssistantReply(text);
    assert.equal(chunks.join(''), text, '增量显示不得漏字、重复或改变空格换行');
    for (const chunk of chunks) {
        const chinese = chunk.replace(/[\s\p{P}]/gu, '');
        if (/^\p{Script=Han}+$/u.test(chinese)) {
            assert.ok(Array.from(chinese).length <= 4, '中文短段最多四字');
        }
    }
}
for (const chunk of splitAssistantReply('请重点关注学生的课堂表现')) {
    assert.ok(Array.from(chunk).length >= 2, '连续中文的句尾单字应重新并入短段');
}
const mixed = splitAssistantReply('使用ChatGPT查看2026年记录');
assert.ok(mixed.includes('ChatGPT'), '英文单词保持完整');
assert.ok(mixed.includes('2026'), '数字保持完整');
console.log('助理回复分段检查通过');
