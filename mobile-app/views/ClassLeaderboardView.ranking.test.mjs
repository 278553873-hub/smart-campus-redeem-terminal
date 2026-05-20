import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./ClassLeaderboardView.tsx', import.meta.url), 'utf8');

for (const required of [
  'const getRankedClasses =',
  '.sort((left, right) => right.score - left.score',
  'let previousScore: number | null = null',
  'let previousRank = 0',
  'previousScore === item.score ? previousRank : index + 1',
  'const [showFullRanking, setShowFullRanking] = useState(false)',
  'onClick={() => setShowFullRanking(true)}',
  '全部班级排名',
  'data.rankings.map((cls) =>',
]) {
  if (!source.includes(required)) {
    throw new Error(`班级排行榜需要支持降序排序、并列名次和全部排名弹窗，缺少：${required}`);
  }
}

if (source.includes('rank: i + 1')) {
  throw new Error('班级排行榜名次不能在模拟数据生成时按原始顺序写死，应排序后重新计算并列名次');
}

if (source.includes('sortedItems[index - 1].rank')) {
  throw new Error('并列名次不能读取排序原始数据上的上一条 rank，否则并列项会得到空值，导致排名数字和背景消失');
}
