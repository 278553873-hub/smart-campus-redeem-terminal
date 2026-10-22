import training from '../assets/resources/teacher-growth-samples/01-training-certificate.jpg';
import online from '../assets/resources/teacher-growth-samples/02-online-learning.jpg';
import research from '../assets/resources/teacher-growth-samples/03-research-completion.jpg';
import award from '../assets/resources/teacher-growth-samples/05-teaching-award.jpg';
import paper from '../assets/resources/teacher-growth-samples/06-journal-article.jpg';
import honor from '../assets/resources/teacher-growth-samples/07-professional-honor.jpg';
import practice from '../assets/resources/teacher-growth-samples/08-teaching-practice.jpg';
import notes from '../assets/resources/teacher-growth-samples/09-teaching-research-notes.jpg';
import reading from '../assets/resources/teacher-growth-samples/10-personal-reading.jpg';
import studentAward from '../assets/resources/teacher-growth-samples/13-student-award.jpg';
import { LEGACY_IMAGE_SAMPLES } from './imageSamples';

const images: Record<string, string> = {
  'training-certificate': training, 'online-learning': online, 'research-completion': research,
  'teaching-award': award, 'journal-article': paper, 'professional-honor': honor,
  'teaching-practice': practice, 'teaching-research-notes': notes,
  'personal-reading': reading, 'student-award': studentAward,
};

const escapeXml = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]!);

/** 新材料引用固定实图；旧记录按原对象和日期还原，不冒用张敏材料。 */
export function demoInputImage(id: string, teacherName: string, date: string) {
  if (images[id]) return images[id];
  const incomplete = id === 'lesson-incomplete';
  const sample = LEGACY_IMAGE_SAMPLES.find(item => item.id === (incomplete ? 'lesson' : id));
  if (!sample) return undefined;
  const lines = [incomplete ? '授课教师：未填写' : `教师：${teacherName}`, ...sample.lines.filter(line => !incomplete || !line.includes('本人贡献')), `日期：${date}`];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="760" height="520" viewBox="0 0 760 520"><rect width="760" height="520" fill="#ebe8e2"/><g transform="translate(30 24)"><rect width="700" height="472" rx="4" fill="#fffefb"/><rect x="22" y="22" width="656" height="428" fill="none" stroke="#d6cbb9" stroke-width="2"/><g font-family="PingFang SC,Microsoft YaHei,sans-serif" fill="#303b43"><text x="350" y="76" font-size="18" text-anchor="middle">玉林中学</text><text x="350" y="122" font-size="30" font-weight="600" text-anchor="middle">${escapeXml(sample.heading)}</text><path d="M100 148H600" stroke="#d6cbb9"/>${lines.map((line, index) => `<text x="82" y="${194 + index * 44}" font-size="23">${escapeXml(line)}</text>`).join('')}<text x="610" y="422" text-anchor="end" font-size="15" fill="#84908e">演示样张</text></g></g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
