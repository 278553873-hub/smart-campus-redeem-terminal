export interface CoinFlowExample { category: string; amount: string; detail: string; time: string; status?: string; owner?: string; }
const record = (category: string, amount: string, detail: string, status?: string, owner?: string): CoinFlowExample => ({ category, amount, detail, time: '10月26日 09:35', status, owner });
const award = (detail = '加分奖励（德育 / 文明礼仪 / 尊师孝亲，+2分）', amount = '+2', status?: string, owner?: string) => record('成长嘉奖', amount, detail, status, owner);
const recovery = (detail: string, amount = '−2', owner?: string) => record('发币撤回', amount, detail, undefined, owner);
const original = (entry: CoinFlowExample): CoinFlowExample => ({ ...entry, time: '10月26日 09:30' });
interface CoinFlowScenario {
 id: string;
 group: string;
 scenario: string;
 rule: string;
 records: CoinFlowExample[];
 deductionRule?: string;

 caseStudy?: {
  coinsPerPoint: number;
  indicators: { path: string; before: number; after: number }[];
 };
}
/** 按文案和展示形态归并，不将计算或测试分支展开成重复样式。 */
const scenarios: CoinFlowScenario[] = [
 { id:'01', group:'收入', scenario:'加分奖励',
   rule:'完整三级指标及各项分值用“；”隔开，保留发币时的内容。修改或新增评价对象，给新学生发币时也使用此样式。',
   records:[award('加分奖励（德育 / 文明礼仪 / 尊师孝亲，+2分；智育 / 学习习惯 / 专注听讲，+3分）','+5')] },
 { id:'02', group:'收入', scenario:'每周奖励',
   rule:'日期格式：M月D日—M月D日。',
   records:[record('成长嘉奖','+20','每周奖励（10月26日—11月1日）')] },
 { id:'03', group:'收入', scenario:'每周奖励跨年',
   rule:'跨年时，两端均补年份：YYYY年M月D日—YYYY年M月D日。',
   records:[{...record('成长嘉奖','+20','每周奖励（2026年12月28日—2027年1月3日）'),time:'2027年1月4日 00:00'}] },
 { id:'04', group:'收入', scenario:'每月奖励',rule:'月份格式：YYYY年M月。',records:[record('成长嘉奖','+80','每月奖励（2026年10月）')] },
 { id:'05', group:'收入', scenario:'即时评价修改补发',
   rule:'只列增加分值的指标，用“；”隔开；按原发币规则补差额。补发另记收入，原记录金额和时间不变，不增加标签。',
   records:[award('评价修改补发（德育 / 文明礼仪 / 尊师孝亲，+1分；智育 / 学习习惯 / 专注听讲，+1分）','+4')],
   caseStudy: { coinsPerPoint: 2, indicators: [
    { path: '德育 / 文明礼仪 / 尊师孝亲', before: 2, after: 3 },
    { path: '智育 / 学习习惯 / 专注听讲', before: 3, after: 4 },
    { path: '德育 / 日常规范 / 文明用餐', before: 4, after: 4 },
   ] } },
 { id:'06', group:'收入', scenario:'老师手动发币',
   rule:'展示后台填写的奖励原因（必填）；多人按学生分别记账。',
   records:[record('班级奖励','+10','运动会奖励')] },
 { id:'07', group:'收入', scenario:'银行利息',rule:'活期、定期结息均展示“存款利息”，只记录利息，本金不计收入。',records:[record('银行利息','+5','存款利息')] },
 { id:'08', group:'收入', scenario:'货柜未出货退还',rule:'卡货或出货故障导致商品未掉落：保留原支出，另增等额收入冲抵。',records:[record('兑换退还','+20','未出货退还 · 笔记本×1')] },
 { id:'09', group:'支出', scenario:'货柜兑换',rule:'商品名×数量。',records:[record('货柜兑换','−30','铅笔×3')] },
 { id:'10', group:'支出', scenario:'班级兑换',rule:'奖励名×数量；多人兑换按学生分别记录。',records:[record('班级兑换','−10','免作业卡×1')] },
 { id:'11', group:'支出', scenario:'即时评价撤回',rule:'撤回即时评价，扣除该评价尚未撤回的奖励。',records:[recovery('评价撤回')] },
 { id:'12', group:'支出', scenario:'即时评价对象修改',rule:'修改或移除评价对象时，从原学生扣币；新增对象使用“加分奖励”样式发币。',records:[recovery('评价对象修改')] },
 { id:'13', group:'支出', scenario:'即时评价分数修改',rule:'加分减少、改为0分或扣分时，按原发币规则扣差额。',records:[recovery('评价分数修改')] },
 { id:'14', group:'关联状态', scenario:'原奖励撤回状态',
   rule:'当评价记录被修改以后，导致需要给学生扣币，那么原始的发币记录不删除，给学生扣币成功以后再在原始记录上增加标签“已撤回”。',
   records:[original(award('加分奖励（德育 / 文明礼仪 / 尊师孝亲，+5分）','+5','已撤回'))] },
 { id:'15', group:'关联状态', scenario:'货柜兑换已退还',rule:'保留原支出的金额和时间；退还收入到账后标记“已退还”，未到账不标记。',records:[original(record('货柜兑换','−20','笔记本×1','已退还'))] },
 { id:'16', group:'不新增流水', scenario:'不产生流水的情况',
   rule:'普通扣分、修改评价但币数未变，不产生流水。定期发币后修改或撤回历史评价，不扣币、不补发、不重新结算，原奖励状态不变。',records:[] },
];

const deductionRule = '实扣＝应撤回金额与当前可用余额的较小值。不扣存款、不抵扣未来奖励；可用为0时不扣币、不新增支出。';
export const COIN_FLOW_SCENARIOS: CoinFlowScenario[] = scenarios.map(scenario => (
 scenario.records.some(record => record.category === '发币撤回')
  ? { ...scenario, deductionRule }
  : scenario
));
