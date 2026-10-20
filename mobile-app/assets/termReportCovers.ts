import type { Student } from '../types';
import { ASSETS } from './images';
import primaryLowerBoy from './resources/term-report-covers/primary-lower-boy-discovery-v2.png';
import primaryLowerGirl from './resources/term-report-covers/primary-lower-girl-discovery-v2.png';
import primaryMiddleBoy from './resources/term-report-covers/primary-middle-boy-sailing-v2.png';
import primaryMiddleGirl from './resources/term-report-covers/primary-middle-girl-drawing-v2.png';
import primaryUpperBoy from './resources/term-report-covers/primary-upper-boy-building.png';
import primaryUpperGirl from './resources/term-report-covers/primary-upper-girl-reading.png';
import middleBoy from './resources/term-report-covers/junior-boy-creation.png';
import middleGirl from './resources/term-report-covers/junior-girl-astronomy.png';

// 统一按确认后的年龄归属选图，同时供手机与 A4 封面使用。
const COVER_SCENES: Readonly<Record<string, Readonly<Record<Student['gender'], string>>>> = {
  'primary-lower': { male: primaryLowerBoy, female: primaryLowerGirl },
  'primary-middle': { male: primaryMiddleBoy, female: primaryMiddleGirl },
  'primary-upper': { male: primaryUpperBoy, female: primaryUpperGirl },
  middle: { male: middleBoy, female: middleGirl },
};

export function getTermReportCover(student: Pick<Student, 'gender' | 'grade'>) {
  const grade = student.grade.trim();
  const stage = /^(?:小学)?[一二12]年级$/.test(grade) ? 'primary-lower'
    : /^(?:小学)?[三四34]年级$/.test(grade) ? 'primary-middle'
      : /^(?:小学)?[五六56]年级$/.test(grade) ? 'primary-upper'
        : /^(?:[七八九789]年级|初[一二三123])$/.test(grade) ? 'middle' : 'standard';
  const scene = COVER_SCENES[stage]?.[student.gender];
  return {
    src: scene ?? (student.gender === 'male' ? ASSETS.COVER.BOY : ASSETS.COVER.GIRL),
    isScene: Boolean(scene),
    stage,
  };
}
