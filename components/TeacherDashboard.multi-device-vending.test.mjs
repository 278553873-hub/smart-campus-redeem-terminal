import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherDashboard.tsx', import.meta.url), 'utf8');

const requireSnippet = (snippet, message) => {
  if (!source.includes(snippet)) {
    throw new Error(`[测试失败] 缺少预期代码片段: "${snippet}"，原因: ${message}`);
  }
};

// 1. 验证多设备基础状态与数据模型
requireSnippet('interface VendingDevice', '应定义VendingDevice多设备类型接口');
requireSnippet('教学楼 1 楼终端', '应初始化教学楼1楼终端');
requireSnippet('教学楼 2 楼终端', '应初始化教学楼2楼终端');
requireSnippet('综合楼 1 楼终端', '应初始化综合楼1楼终端');
requireSnippet("const [channelViewMode, setChannelViewMode] = useState<'overview' | 'detail'>('overview')", '应定义两级视图状态默认为overview');

// 2. 验证一级设备总览看板与全校汇总
requireSnippet('全校设备总数', '一级看板应展示全校设备总数汇总');
requireSnippet('正常运行设备', '一级看板应展示正常运行设备指标');
requireSnippet('全校库存告急货道', '一级看板应展示全校告急货道数');
requireSnippet('全校补货清单', '一级看板应提供全校补货清单入口按钮');
requireSnippet('一键补满全校', '一级看板应提供一键补满全校按钮');
requireSnippet('补满此柜', '设备卡片应提供单柜快速补货操作');
requireSnippet('货道配置', '设备卡片应提供进入二级货道配置的操作按钮');

// 3. 验证二级单设备拟真配置与联动操作
requireSnippet('返回设备总览', '二级页面应提供返回设备总览按钮');
requireSnippet('当前设备：', '二级页面应提供设备切换下拉选择框');
requireSnippet('同步配置到其他设备', '二级页面应提供跨设备一键复制配置按钮');
requireSnippet('补满当前柜', '二级页面应提供当前柜补满按钮');

// 4. 验证两大核心弹窗
requireSnippet('全校货柜补货汇总清单', '应包含全校缺货集中汇总弹窗');
requireSnippet('isCopyConfigModalOpen', '应包含跨设备同步配置弹窗');
requireSnippet('handleConfirmCopyConfig', '应实现跨设备同步配置落地方法');
requireSnippet('restockSummaryList', '应计算全校各设备缺货明细');

console.log('✅ 货柜超市管理多设备支持（方案一）所有断言测试通过！');
