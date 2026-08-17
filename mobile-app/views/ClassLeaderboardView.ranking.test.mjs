import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./ClassLeaderboardView.tsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const pillSource = readFileSync(new URL('../components/ui/PillSelectionControl.tsx', import.meta.url), 'utf8');

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

for (const required of [
  'text-[var(--tm-brand-primary)]',
  '<PillSelectionControl',
  'ariaLabel="班级排行榜维度"',
  'bg-[var(--tm-page-plain-header-bg)]',
  'bg-[var(--tm-page-plain-content-bg)]',
]) {
  if (!source.includes(required)) {
    throw new Error(`班级排行榜切换控件应使用品牌红，并分离44像素触控区与32像素可见高度，缺少：${required}`);
  }
}

for (const required of [
  'min-h-[var(--tm-selection-touch-height)]',
  'h-[var(--tm-selection-pill-visible-height)]',
  'border-[var(--tm-selection-pill-active-border)] bg-[var(--tm-selection-pill-active-bg)] text-[var(--tm-selection-pill-active-text)]',
  'border-[var(--tm-selection-pill-inactive-border)] bg-[var(--tm-selection-pill-inactive-bg)] text-[var(--tm-selection-pill-inactive-text)]',
]) {
  if (!pillSource.includes(required)) throw new Error(`班级排行榜维度筛选缺少统一胶囊约束：${required}`);
}

if (source.indexOf('timeOptions.map') > source.lastIndexOf('<GradePicker')) {
  throw new Error('班级排行榜必须先展示日期切换，再展示年级筛选');
}

if (!appSource.includes("currentView === 'class_leaderboard' ? 'bg-[var(--tm-page-plain-header-bg)]'")) {
  throw new Error('班级排行榜标题栏必须使用纯白标题栏背景');
}

for (const forbidden of ['text-blue-', 'text-indigo-', 'bg-indigo-', '#5B50F6']) {
  if (source.includes(forbidden)) {
    throw new Error(`班级排行榜的品牌选中与操作状态不应继续使用蓝紫色：${forbidden}`);
  }
}
