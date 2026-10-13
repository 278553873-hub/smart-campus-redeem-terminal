/**
 * 演示班级的固定学生
 *
 * 花名册默认按姓名池生成；需要长期对照查看的班级，在这里固定成真实姓名，
 * 保证每次打开看到的都是同一批学生，也方便给这些学生配置各自的报告内容。
 */
export interface DemoClassStudent {
  /** 花名册里的位置，从 0 开始 */
  index: number;
  name: string;
  gender: 'male' | 'female';
}

export const DEMO_CLASS_STUDENTS: Record<string, readonly DemoClassStudent[]> = {
  'c_2024_1': [
    { index: 0, name: '杨悠然', gender: 'female' },
    { index: 1, name: '邹艾琳', gender: 'female' },
  ],
  'c_2026_1': [
    { index: 3, name: '高奕可', gender: 'female' },
    { index: 4, name: '廖堇汐', gender: 'female' },
  ],
};

export const getDemoClassStudent = (classId: string, index: number): DemoClassStudent | undefined => (
  DEMO_CLASS_STUDENTS[classId]?.find(student => student.index === index)
);
