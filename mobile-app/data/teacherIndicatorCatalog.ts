import { MOCK_CLASS_EVALUATION_INDICATORS } from '../constants';
import { classReportIndicatorDemoPaths } from './classReportIndicatorDemo';

export type TeacherIndicatorScope = 'student' | 'class';

export interface TeacherIndicatorLeaf {
  id: string;
  name: string;
  positiveReason: string;
  negativeReason: string;
  examples: string[];
}

export interface TeacherIndicatorLevelTwo {
  id: string;
  name: string;
  children: TeacherIndicatorLeaf[];
}

export interface TeacherIndicatorLevelOne {
  id: string;
  name: string;
  children: TeacherIndicatorLevelTwo[];
}

export interface TeacherIndicatorCatalog {
  scope: TeacherIndicatorScope;
  title: string;
  levels: TeacherIndicatorLevelOne[];
}

interface IndicatorCopy {
  positiveReason: string;
  negativeReason: string;
  examples: string[];
}

const createId = (...parts: string[]) => parts.join('-').replace(/\s+/g, '-');

const studentCopyByName: Record<string, IndicatorCopy> = {
  '遵守纪律': {
    positiveReason: '能够自觉遵守课堂、集会和校园公共秩序，并对同学起到积极示范作用。',
    negativeReason: '违反课堂或校园秩序，经提醒后仍未改正，并对他人学习或活动造成影响。',
    examples: ['升旗仪式中全程保持安静，并主动提醒身边同学整理队列。', '课堂上多次随意离座，教师提醒后仍影响同学听讲。'],
  },
  '文明礼貌': {
    positiveReason: '日常交往中主动使用礼貌用语，尊重他人，在集体中传递文明友善的行为。',
    negativeReason: '对师生使用不文明语言或做出不尊重他人的行为，造成不良影响。',
    examples: ['进入办公室前主动敲门，离开时向老师致谢。'],
  },
  '友善交往': {
    positiveReason: '主动关心、帮助同学，能够理性沟通并协助解决同伴间的矛盾。',
    negativeReason: '故意排斥、嘲笑或欺负同学，对同伴关系造成实际伤害。',
    examples: ['发现新同学不熟悉活动流程，主动陪伴并完成小组任务。'],
  },
  '爱护公物': {
    positiveReason: '主动维护教室和校园公共设施，发现问题能及时报告或协助处理。',
    negativeReason: '故意损坏、不当使用公共设施，或发现明显损坏行为后参与、纵容。',
    examples: ['发现图书角书架松动后立即告知老师，并提醒同学暂停使用。'],
  },
};

const classCopyByName: Record<string, IndicatorCopy> = {
  '佩戴规范': {
    positiveReason: '班级学生进校、离校时红领巾佩戴整齐、规范，连续检查无需提醒。',
    negativeReason: '班级学生进校、离校未规范佩戴红领巾，按实际检查人次扣分。',
    examples: ['周一早晨全班学生红领巾佩戴规范，进校队列整齐。', '放学检查中发现3名学生未佩戴红领巾。'],
  },
  '图书管理': {
    positiveReason: '班级图书角分类清晰、借阅登记完整，图书数量和保管状态符合学校要求。',
    negativeReason: '班级图书数量不足，或出现明显卷角、翘边、污损且未及时处理。',
    examples: ['图书管理员完成当周盘点，借阅记录与实际图书一致。', '抽查发现2本图书封面严重污损，且未有处理记录。'],
  },
  '眼操品质': {
    positiveReason: '眼保健操期间全班准备及时，穴位、动作和节奏基本准确。',
    negativeReason: '眼保健操动作不正确或不整齐，根据检查中未达标人数按学校标准扣分。',
    examples: ['第二节课后全班按时开始眼操，检查中动作规范。', '抽查中发现6名学生穴位不准确，提醒后仍未调整。'],
  },
  '晨间清洁': {
    positiveReason: '早读前按时完成地面、桌椅和公共区域清洁，物品归位整齐。',
    negativeReason: '规定时间内未完成晨间清洁，或检查中发现明显垃圾、积灰和物品杂乱。',
    examples: ['早读前地面无纸屑，桌椅摆放整齐，垃圾已清运。'],
  },
};

const fallbackCopy = (levelOne: string, levelTwo: string, levelThree: string): IndicatorCopy => ({
  positiveReason: `在“${levelTwo}”相关活动中，“${levelThree}”表现突出且具有稳定示范作用，经核实后按学校标准记录。`,
  negativeReason: `在“${levelTwo}”相关活动中，“${levelThree}”未达到学校要求，经提醒后仍未改进时按实际情况记录。`,
  examples: [`${levelOne}评价中，如实记录与“${levelThree}”相关的具体行为、发生场景和实际结果。`],
});

const buildStudentCatalog = (): TeacherIndicatorCatalog => {
  const levels: TeacherIndicatorLevelOne[] = [];

  classReportIndicatorDemoPaths.forEach(([levelOneName, levelTwoName, levelThreeName]) => {
    let levelOne = levels.find(item => item.name === levelOneName);
    if (!levelOne) {
      levelOne = { id: createId('student', levelOneName), name: levelOneName, children: [] };
      levels.push(levelOne);
    }

    let levelTwo = levelOne.children.find(item => item.name === levelTwoName);
    if (!levelTwo) {
      levelTwo = { id: createId(levelOne.id, levelTwoName), name: levelTwoName, children: [] };
      levelOne.children.push(levelTwo);
    }

    const copy = studentCopyByName[levelThreeName] ?? fallbackCopy(levelOneName, levelTwoName, levelThreeName);
    levelTwo.children.push({
      id: createId(levelTwo.id, levelThreeName),
      name: levelThreeName,
      ...copy,
    });
  });

  return { scope: 'student', title: '学生评价指标', levels };
};

const buildClassCatalog = (): TeacherIndicatorCatalog => ({
  scope: 'class',
  title: '班级评价指标',
  levels: MOCK_CLASS_EVALUATION_INDICATORS.map(levelOne => ({
    id: createId('class', levelOne.name),
    name: levelOne.name,
    children: levelOne.children.map(levelTwo => ({
      id: createId('class', levelOne.name, levelTwo.name),
      name: levelTwo.name,
      children: levelTwo.children.map(levelThree => ({
        id: createId('class', levelOne.name, levelTwo.name, levelThree.name),
        name: levelThree.name,
        ...(classCopyByName[levelThree.name] ?? fallbackCopy(levelOne.name, levelTwo.name, levelThree.name)),
      })),
    })),
  })),
});

export const teacherIndicatorCatalogs: Record<TeacherIndicatorScope, TeacherIndicatorCatalog> = {
  student: buildStudentCatalog(),
  class: buildClassCatalog(),
};
