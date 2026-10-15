import { IMAGE_SAMPLES } from './data';

const escapeXml = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]!);

/** 可读的虚构文档图片，避免用附件名称或与教师无关的证书代替图片输入。 */
export function demoInputImage(id: string, teacherName: string, date: string) {
  const incomplete = id === 'lesson-incomplete';
  const sample = IMAGE_SAMPLES.find(item => item.id === (incomplete ? 'lesson' : id)) ?? IMAGE_SAMPLES[0];
  const lines = [incomplete ? '授课教师：未填写' : `教师：${teacherName}`, ...sample.lines.filter(line => !incomplete || !line.includes('本人贡献')), `日期：${date}`];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="760" height="520" viewBox="0 0 760 520"><rect width="760" height="520" fill="#ebe8e2"/><g transform="translate(30 24)"><rect width="700" height="472" rx="4" fill="#fffefb"/><rect x="22" y="22" width="656" height="428" fill="none" stroke="#d6cbb9" stroke-width="2"/><g font-family="PingFang SC,Microsoft YaHei,sans-serif" fill="#303b43"><text x="350" y="76" font-size="18" text-anchor="middle">玉林中学</text><text x="350" y="122" font-size="30" font-weight="600" text-anchor="middle">${escapeXml(sample.heading)}</text><path d="M100 148H600" stroke="#d6cbb9"/>${lines.map((line, index) => `<text x="82" y="${194 + index * 44}" font-size="23">${escapeXml(line)}</text>`).join('')}<text x="610" y="422" text-anchor="end" font-size="15" fill="#84908e">演示样张</text></g></g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
