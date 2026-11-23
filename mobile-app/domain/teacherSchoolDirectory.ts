import { TEACHER_SPACE_OPTIONS } from '../data/teacherSpaces.ts';

export interface BEndSchoolOption {
  id: string;
  name: string;
}

/** 已开通学校版（B端）的学校清单，用于个人版完善信息时避免重复建校。 */
export const B_END_SCHOOL_OPTIONS: readonly BEndSchoolOption[] = TEACHER_SPACE_OPTIONS
  .filter(space => space.type === 'school')
  .map(space => ({ id: space.id, name: space.title }));

export const normalizeSchoolName = (value: string): string => value.replace(/\s+/g, '').toLowerCase();

export const findBEndSchools = (
  keyword: string,
  options: readonly BEndSchoolOption[] = B_END_SCHOOL_OPTIONS,
): BEndSchoolOption[] => {
  const query = normalizeSchoolName(keyword);
  if (!query) return [];
  return options
    .filter(option => normalizeSchoolName(option.name).includes(query))
    .slice(0, 5);
};
