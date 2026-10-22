/** 中文按词组合成 2–4 字短段，英文单词与数字保持完整，标点跟随前段。 */
export function splitAssistantReply(text: string): string[] {
    const segments = typeof Intl.Segmenter === 'function'
        ? Array.from(new Intl.Segmenter('zh-CN', { granularity: 'word' }).segment(text), item => item.segment)
        : text.match(/\p{Script=Han}{1,2}|[\p{L}\p{M}\p{N}]+|./gus) ?? [];
    const chunks: string[] = [];
    let pending = '';
    const flush = () => { if (pending) chunks.push(pending); pending = ''; };
    for (const segment of segments) {
        if (/^\p{Script=Han}+$/u.test(segment)) {
            const chars = Array.from(segment);
            while (chars.length) {
                const room = 4 - Array.from(pending).length;
                pending += chars.splice(0, room).join('');
                if (Array.from(pending).length >= 2) flush();
            }
        } else if (/^[\s\p{P}]+$/u.test(segment)) {
            flush();
            if (chunks.length) chunks[chunks.length - 1] += segment;
            else chunks.push(segment);
        } else {
            flush();
            chunks.push(segment);
        }
    }
    flush();
    // 处理句尾余下的单字：与前段合并，或将四字前段调整成三字加两字。
    for (let index = 1; index < chunks.length; index += 1) {
        const current = chunks[index].match(/^(\p{Script=Han})([\s\p{P}]*)$/u);
        const previous = chunks[index - 1];
        if (!current || !/^\p{Script=Han}{2,4}$/u.test(previous)) continue;
        const chars = Array.from(previous);
        if (chars.length < 4) {
            chunks.splice(index - 1, 2, previous + chunks[index]);
            index -= 1;
        } else {
            chunks[index - 1] = chars.slice(0, -1).join('');
            chunks[index] = chars.at(-1) + chunks[index];
        }
    }
    return chunks;
}
