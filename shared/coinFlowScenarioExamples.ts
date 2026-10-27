import { COIN_FLOW_REVIEW_SECTIONS } from './coinFlowReviewRules.ts';
export interface CoinFlowExample { category: string; amount: string; detail: string; time: string; status?: string; owner?: string; }
const record = (category: string, amount: string, detail: string, status?: string, owner?: string): CoinFlowExample => ({ category, amount, detail, time: '10月26日 09:35', status, owner });
const award = (detail = '加分奖励（尊师孝亲，+2分）', amount = '+2', status?: string, owner?: string) => record('成长嘉奖', amount, detail, status, owner);
const recovery = (detail: string, amount = '−2', owner?: string) => record('发币收回', amount, detail, undefined, owner);
const weekly = (status?: string) => record('成长嘉奖', '+20', '每周奖励（10月19日—10月25日）', status);
const original = (entry: CoinFlowExample): CoinFlowExample => ({ ...entry, time: '10月26日 09:30' });
const examples: Record<string, CoinFlowExample[]> = {
 A01:[award()], A02:[award('加分奖励（尊师孝亲等3项，+5分）','+5')], A03:[award()],
 A04:[award('加分奖励（评价加2分）')], A05:[award('加分奖励（主动参与班级集体…，+2分）')],
 A06:[award('加分奖励（尊师孝亲，+1.5分）','+1.5')], A07:[award('加分奖励（尊师孝亲，+5分）','+2')], A08:[],
 A09:[weekly()], A10:[record('成长嘉奖','+20','每周奖励（10月26日—11月1日）')],
 A11:[{...record('成长嘉奖','+20','每周奖励（2026年12月28日—2027年1月3日）'),time:'2027年1月4日 00:00'}],
 A12:[record('成长嘉奖','+80','每月奖励（2026年10月）')], A13:[weekly()], A14:[],
 A15:[award('评价修改补发（尊师孝亲，+1分）','+1')],
 A16:[award('评价修改补发（尊师孝亲等2项，+2分）','+2')],
 A17:[award('评价修改补发（增加1分）','+1')],
 A18:[award('评价修改补发（尊师孝亲，+3分）','+1')], A19:[],
 A20:[award(undefined,'+2',undefined,'小红')], A21:[award(undefined,'+2',undefined,'新增学生')],
 A22:[award('评价修改补发（主动参与班级集体…等2项，+1.5分）','+1.5')], A23:[],
 B01:[record('班级奖励','+10','运动会奖励')], B02:[record('班级奖励','+10','老师发放')],
 B03:[record('班级奖励','+10','运动会奖励',undefined,'每位学生分别展示')],
 B04:[record('银行利息','+5','存款到期利息')], B05:[record('银行利息','+5','存款到期利息')], B06:[],
 B07:[record('兑换退还','+10','撤回兑换 · 铅笔×1')],
 B08:[record('兑换退还','+20','未出货退还 · 笔记本×1')],
 B09:[record('兑换退还','+10','取消兑换退还 · 铅笔×1')], B10:[], B11:[],
 C01:[record('货柜兑换','−20','笔记本×1')], C02:[record('货柜兑换','−30','铅笔×3')],
 C03:[record('班级兑换','−10','免作业卡×1')], C04:[record('班级兑换','−10','免作业卡×1',undefined,'每位学生分别展示')],
 C05:[record('手动清空','−20','清空可用')], C06:[record('手动清空','−50','清空可用与已存')],
 C07:[record('手动清空','−20','清空可用')], C08:[record('手动清空','−30','清空已存')], C09:[],
 C10:[recovery('评价撤回收回')], C11:[recovery('评价删除收回')],
 C12:[recovery('评价对象修改收回', '−2','小明')], C13:[recovery('评价对象移除收回')],
 C14:[recovery('评价分数修改收回')], C15:[recovery('评价分数修改收回','−5')], C16:[], C17:[], C18:[], C19:[], C20:[],
 D01:[award()],
 D02:[recovery('评价撤回收回'), original(award(undefined,'+2','已收回'))],
 D03:[recovery('评价分数修改收回','−1'), original(award(undefined,'+2','部分收回'))],
 D04:[award('评价修改补发（尊师孝亲，+1分）','+1'), original(award(undefined,'+2','有补发'))],
 D05:[recovery('评价分数修改收回','−1'),{...award('评价修改补发（尊师孝亲，+2分）'),time:'10月26日 09:32'},original(award(undefined,'+2','有调整'))],
 D06:[record('兑换退还','+10','撤回兑换 · 铅笔×1'),original(record('班级兑换','−10','铅笔×1','已退还'))],
 D07:[], D08:[],
 D09:[recovery('评价对象修改收回','−2','小明'),award(undefined,'+2',undefined,'小红')],
 D10:[recovery('评价撤回收回'),original(award(undefined,'+2','已收回'))],
 D11:[recovery('评价对象修改收回','−2','小明'),award(undefined,'+2',undefined,'小红')],
 D12:[recovery('评价撤回收回'),original(award(undefined,'+2','已收回'))], D13:[], D14:[],
 E01:[],E02:[],E03:[],
 E04:[recovery('评价对象修改收回','−2','小明'),award(undefined,'+2',undefined,'小红')],
 E05:[recovery('评价分数修改收回','−1')],E06:[],E07:[recovery('评价撤回收回')], E08:[],E09:[],
 E10:[recovery('评价分数修改收回','−1')],E11:[],E12:[recovery('评价撤回收回')],E13:[],
 E14:[recovery('评价对象移除收回','−2','被移除学生')],
 T08:[], T09:[], T10:[record('银行利息','+5','存款到期利息')],T11:[record('手动清空','−50','清空可用与已存')],
};
export const COIN_FLOW_SCENARIOS = COIN_FLOW_REVIEW_SECTIONS
 .filter(section => ['growth','income','expense','states','boundaries','accounting'].includes(section.id))
 .flatMap(section => section.rows.filter(row => Object.hasOwn(examples,row[0])).map(row => ({
   id:row[0], group:section.title, scenario:row[1], rule:row[2], expected:row[3], records:examples[row[0]],
 })));
