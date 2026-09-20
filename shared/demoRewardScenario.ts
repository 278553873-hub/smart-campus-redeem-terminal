import {
  getClassBudgetTotal,
  getRankingReward,
  sumPositiveScores,
} from '../mobile-app/domain/campusCoinIssuance';
import { DEFAULT_COIN_ISSUANCE_CONFIG } from '../mobile-app/constants';

/**
 * 演示数据统一口径：所有演示金额都由「货币发放」的默认配置推导，
 * 货柜机首页、成长足迹中心、家长端共用这里的同一套数字，避免各页面写死不一致。
 */

/** 演示班级规模 */
export const DEMO_CLASS_STUDENT_COUNT = 40;

/** 演示班级预算：直接取「货币发放」默认配置 */
export const DEMO_CLASS_BUDGET = getClassBudgetTotal({
  budgetMode: DEFAULT_COIN_ISSUANCE_CONFIG.budgetMode,
  budgetAmount: DEFAULT_COIN_ISSUANCE_CONFIG.budgetAmount,
  classStudentCount: DEMO_CLASS_STUDENT_COUNT,
});

/** 阳光保底池 */
export const DEMO_SUNSHINE_POOL = DEMO_CLASS_BUDGET * DEFAULT_COIN_ISSUANCE_CONFIG.sunshineRatio / 100;

/** 阳光保底池由全班平分，0 分学生同样有份 */
export const DEMO_SUNSHINE_REWARD = DEMO_SUNSHINE_POOL / DEMO_CLASS_STUDENT_COUNT;

/** 积分排行池按全班正分比例分配 */
export const DEMO_RANKING_POOL = DEMO_CLASS_BUDGET - DEMO_SUNSHINE_POOL;

export interface DemoLeaderboardRow {
  rank: number;
  name: string;
  score: number;
  isSelf: boolean;
  isTarget: boolean;
}

/** 按积分排行池比例为每行算出得分奖励 */
export const withDemoRankingRewards = <T extends { score: number }>(rows: T[]) => {
  const totalPositiveScore = sumPositiveScores(rows.map(row => row.score));
  return rows.map(row => ({
    ...row,
    coins: getRankingReward({ rankingPool: DEMO_RANKING_POOL, score: row.score, totalPositiveScore }),
  }));
};

/** 演示场景（常态）：30 名有正分的学生 + 10 名 0 分学生 */
export const DEMO_LEADERBOARD_BASE: DemoLeaderboardRow[] = [
  { rank: 1, name: '张小宇', score: 85, isSelf: false, isTarget: false },
  { rank: 2, name: '李佳怡', score: 78, isSelf: false, isTarget: false },
  { rank: 3, name: '赵梓涵', score: 72, isSelf: false, isTarget: false },
  { rank: 4, name: '孙雨菲', score: 68, isSelf: false, isTarget: false },
  { rank: 5, name: '陈子轩', score: 65, isSelf: false, isTarget: false },
  { rank: 6, name: '林浩然', score: 64, isSelf: false, isTarget: false },
  { rank: 7, name: '郭星辰', score: 63, isSelf: false, isTarget: false },
  { rank: 8, name: '周雨桐', score: 63, isSelf: false, isTarget: false },
  { rank: 9, name: '吴佳琪', score: 62, isSelf: false, isTarget: false },
  { rank: 10, name: '徐博文', score: 61, isSelf: false, isTarget: false },
  { rank: 11, name: '王小明', score: 60, isSelf: false, isTarget: true },
  { rank: 12, name: '郑小磊', score: 45, isSelf: true, isTarget: false },
  { rank: 13, name: '刘诗语', score: 42, isSelf: false, isTarget: false },
  { rank: 14, name: '陈冠宇', score: 41, isSelf: false, isTarget: false },
  { rank: 15, name: '黄心怡', score: 40, isSelf: false, isTarget: false },
  { rank: 16, name: '张子豪', score: 38, isSelf: false, isTarget: false },
  { rank: 17, name: '林嘉欣', score: 38, isSelf: false, isTarget: false },
  { rank: 18, name: '周芷若', score: 35, isSelf: false, isTarget: false },
  { rank: 19, name: '王志祥', score: 34, isSelf: false, isTarget: false },
  { rank: 20, name: '杨超越', score: 33, isSelf: false, isTarget: false },
  { rank: 21, name: '赵俊杰', score: 30, isSelf: false, isTarget: false },
  { rank: 22, name: '钱多多', score: 28, isSelf: false, isTarget: false },
  { rank: 23, name: '孙悟空', score: 25, isSelf: false, isTarget: false },
  { rank: 24, name: '李白', score: 22, isSelf: false, isTarget: false },
  { rank: 25, name: '杜甫', score: 20, isSelf: false, isTarget: false },
  { rank: 26, name: '白居易', score: 18, isSelf: false, isTarget: false },
  { rank: 27, name: '辛弃疾', score: 12, isSelf: false, isTarget: false },
  { rank: 28, name: '李清照', score: 10, isSelf: false, isTarget: false },
  { rank: 29, name: '陆游', score: 8, isSelf: false, isTarget: false },
  { rank: 30, name: '苏轼', score: 5, isSelf: false, isTarget: false },
  ...Array.from({ length: 10 }).map((_, i) => ({
    rank: 31 + i,
    name: '学生 ' + (31 + i),
    score: 0,
    isSelf: false,
    isTarget: false,
  })),
];

/** 演示榜单（常态场景），每行已带得分奖励 */
export const DEMO_LEADERBOARD = withDemoRankingRewards(DEMO_LEADERBOARD_BASE);

const demoSelfRow = DEMO_LEADERBOARD.find(row => row.isSelf);

/** 演示学生本人：本月总分 */
export const DEMO_SELF_SCORE = demoSelfRow ? demoSelfRow.score : 0;

/** 演示学生本人：得分奖励 */
export const DEMO_SELF_SCORE_REWARD = demoSelfRow ? demoSelfRow.coins : 0;

/** 演示学生本人：阳光保底 + 得分奖励，即「预计可得」 */
export const DEMO_SELF_TOTAL_REWARD = DEMO_SUNSHINE_REWARD + DEMO_SELF_SCORE_REWARD;

