/**
 * 演示学生姓名池
 *
 * 终端花名册、报告页点名、班主任助理的回答都从这一份名单取名字，
 * 保证同一个班级在各处看到的都是同一批学生，不会出现两套名单。
 */

export interface MockStudentNameEntry {
    n: string;
    g: 'male' | 'female';
}

const PRIMARY_NAMES: MockStudentNameEntry[] = [
    { n: '刘新宇', g: 'male' },
    { n: '张子轩', g: 'male' }, { n: '王梓涵', g: 'female' }, { n: '李欣怡', g: 'female' }, { n: '刘浩宇', g: 'male' },
    { n: '陈思睿', g: 'male' }, { n: '杨一诺', g: 'female' }, { n: '赵宇轩', g: 'male' }, { n: '黄子墨', g: 'male' },
    { n: '周雨桐', g: 'female' }, { n: '吴佳泽', g: 'male' }, { n: '徐心怡', g: 'female' }, { n: '孙浩然', g: 'male' },
    { n: '胡梓萱', g: 'female' }, { n: '朱宇航', g: 'male' }, { n: '高俊杰', g: 'male' }, { n: '林诗涵', g: 'female' },
    { n: '何子涵', g: 'female' }, { n: '郭博文', g: 'male' }, { n: '马铭泽', g: 'male' }, { n: '罗依诺', g: 'female' },
    { n: '梁皓轩', g: 'male' }, { n: '宋雨泽', g: 'male' }, { n: '郑若曦', g: 'female' }, { n: '谢子萱', g: 'female' },
    { n: '韩宇辰', g: 'male' }, { n: '唐欣妍', g: 'female' }, { n: '冯子墨', g: 'male' }, { n: '于思涵', g: 'female' },
    { n: '董浩宇', g: 'male' }, { n: '萧萧', g: 'female' }, { n: '程子睿', g: 'male' }, { n: '曹梦瑶', g: 'female' },
    { n: '袁致远', g: 'male' }, { n: '邓诗琪', g: 'female' }, { n: '许皓', g: 'male' }, { n: '傅语嫣', g: 'female' },
    { n: '沈煜祺', g: 'male' }, { n: '曾子瑶', g: 'female' }, { n: '彭云天', g: 'male' }, { n: '欧阳慕晴', g: 'female' },
];

export const MOCK_STUDENT_NAME_POOL: MockStudentNameEntry[] = [
    ...PRIMARY_NAMES,
    { n: '李明', g: 'male' }, { n: '张伟', g: 'male' }, { n: '王刚', g: 'male' }, { n: '李丽', g: 'female' },
    { n: '陈晨', g: 'female' }, { n: '刘方', g: 'male' }, { n: '赵敏', g: 'female' }, { n: '孙权', g: 'male' },
    { n: '周瑜', g: 'male' }, { n: '诸葛亮', g: 'male' }, { n: '黄蓉', g: 'female' }, { n: '郭靖', g: 'male' },
    { n: '杨过', g: 'male' }, { n: '小龙女', g: 'female' }, { n: '张无忌', g: 'male' }, { n: '韦小宝', g: 'male' },
];

/** 同一个班级始终按同一段姓名池取值，保证每次打开看到的是同一批学生。 */
export const getMockClassSeed = (classId: string): number => (
    classId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
);

export const getMockStudentNameAt = (classId: string, index: number): MockStudentNameEntry => (
    MOCK_STUDENT_NAME_POOL[(getMockClassSeed(classId) + index) % MOCK_STUDENT_NAME_POOL.length]
);

/** 按花名册顺序取出全班姓名（已去重，便于按名字点名）。 */
export const getMockStudentNamesForClass = (classId: string, studentCount: number): string[] => {
    const names: string[] = [];
    const seen = new Set<string>();
    for (let index = 0; index < Math.max(0, studentCount); index += 1) {
        const name = getMockStudentNameAt(classId, index).n;
        if (seen.has(name)) continue;
        seen.add(name);
        names.push(name);
    }
    return names;
};
