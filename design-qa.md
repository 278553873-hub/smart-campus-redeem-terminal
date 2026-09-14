# 班级报告顶部筛选层级设计验收

- source visual truth path: `/Users/mayday/project/校园智能积分兑换终端/design-qa-class-report-tabs-reference.png`
- implementation screenshot path: `/Users/mayday/project/校园智能积分兑换终端/design-qa-class-report-filter-hierarchy.png`
- scrolled teacher state path: `/Users/mayday/project/校园智能积分兑换终端/design-qa-class-report-teacher-tabs-scrolled.png`
- comparison image path: `/Users/mayday/project/校园智能积分兑换终端/design-qa-class-report-tabs-comparison.png`
- viewport: `390 × 844`
- state: 教师手机端 > 班级 > 2025级一班 > 班级报告 > 全班汇总 > 本月

## Full-view comparison evidence

数据来源标签与时间范围容器均为纯白背景，不再使用浅粉或玻璃底。老师标签以主题红文字和下划线承载主筛选层级；日期选中态使用紧凑的主题红实底和反白文字，提升识别度。日期可见控件为 32 像素，外层保留 44 像素触控区域，顶部筛选整体高度保持收敛。390 像素宽度下无横向页面溢出、文字重叠或控件截断。

## Focused region comparison evidence

数据来源标签继续保留单行文字、底部分隔线与选中下划线；日期筛选保持无阴影，通过小面积主题红实底增强当前状态。两层筛选容器均使用教师端白色表面 Token，层级由所在位置、控件高度和状态形态共同区分。动态老师数量超过一屏时，首屏右侧自然露出下一位老师的部分姓名，点击后标签栏自动滚动并完整显示选中标签。

## Findings

- P0/P1/P2：无。
- P3：横向滚动到最后一位老师时，左侧保留部分上一标签作为可滚动提示；不影响识别和操作，保留当前行为。

## Required fidelity surfaces

| 检查项 | 结果 |
| --- | --- |
| Fonts and typography | 标签使用教师端紧凑字号和中等字重；选中状态不改变字号，不产生布局跳动 |
| Spacing and layout rhythm | 老师标签保持 44 像素高度；日期为 44 像素触控区包裹 32 像素可见控件；移除原 12 像素上间距与上下内边距 |
| Colors and tokens | 两层容器与未选中日期均为纯白；老师选中态使用主题红下划线，日期选中态使用主题红实底和反白文字；无浅粉背景和临时色值 |
| Image quality and asset fidelity | 参考图仅提供界面结构，无额外图片资产；实现未使用替代图形或自绘图标 |
| Copy and content | 顺序为“全班汇总、我的记录、周三论、张怡……”；只展示有评价记录的老师 |
| Responsiveness | 首屏右侧“王蕾”按钮露出约 43 像素，姓名文字部分可见；点击后滚动位置变为 129，标签完整进入可见区域 |
| Accessibility | 使用 `tablist`、`tab` 和 `aria-selected`；“我的记录”补充当前教师姓名作为无障碍标签 |

## Primary interactions tested

1. 初始进入报告：默认选中“全班汇总”，概况显示 447 条评价记录。
2. 点击“周三论”：标签选中状态更新，概况联动为 107 条评价记录。
3. 首屏右侧部分露出“王蕾”姓名，点击后标签栏滚动位置从 0 变为 129，标签完整可见且报表数据联动。
4. 页面 warning/error 日志为空。

## Comparison history

1. 首轮对比：参考结构与实现的标签层级、下划线、分隔线和信息顺序一致；主题色差异属于用户明确要求的 Token 映射，无 P0/P1/P2 问题。
2. 本轮优化：两层筛选统一纯白背景，日期筛选取消阴影，并通过 32/44 像素双层尺寸兼顾信息密度和触控可用性。
3. 状态增强：日期选中态改为主题红实心填充和反白文字，在不增加高度的前提下提升识别度。
4. 滑动提示：老师标签宽度收敛，使下一位老师的姓名在首屏右侧部分露出，不增加说明文字或额外图标。

final result: passed

---

# 货柜机吸顶效果专项自查

- review surface: 已登录货柜机的“星光超市”和“储蓄银行”内容页
- implementation screenshot path: `/Users/mayday/project/校园智能积分兑换终端/design-qa-terminal-login-buttons.png`（同一货柜机外壳与标题栏基准）
- viewport: Codex 内置浏览器货柜机预览；设备缩放后可视区域约 `423 x 752px`
- states: 初始展开态、滚动收起态、银行选择存款计划后滚动收起态

## Self-review findings and fixes

| 优先级 | 自查问题 | 修正与结果 |
| --- | --- | --- |
| P1 | 收起后顶部贴住标题栏、下方却保留间距，视觉节奏不对称 | 超市和银行统一使用 `8px` 逻辑间距；浏览器缩放后顶部与下方均实测约 `6.27px` |
| P2 | 顶部卡片使用 `transition-all`，收起时阴影、模糊、边框同时插值，容易产生抖动 | 改为仅过渡布局、透明度、位移、间距与滤镜；未发现无关属性跳变 |
| P2 | 紧凑余额/分类栏与滚动内容之间存在额外 `margin-top` | 超市紧凑余额栏改为 `mt-0`；银行分类栏在收起态使用统一 `mb-2`，内容节奏一致 |
| P3 | 极窄工作台下右侧 Demo 环境条仍可能靠近预览控件 | 预览控件已向内避让；当前窄屏实测保留约 `9px` 间距，不遮挡终端主操作 |

## Geometry evidence

- 星光超市滚动收起态：标题栏底部与紧凑余额栏顶部间距约 `6.27px`；紧凑余额栏底部与滚动内容起始边界间距约 `6.27px`。
- 储蓄银行滚动收起态：标题栏底部与紧凑余额/分类栏顶部间距约 `6.27px`；分类栏底部与滚动内容起始边界间距约 `6.27px`。
- 初始展开态仍保留较大的标题卡片呼吸空间，不牺牲首次进入时的品牌识别和余额可见性。

## Interaction and accessibility checks

1. 滚动超过阈值后，顶部大卡片收起，紧凑信息栏出现；回到顶部后恢复展开态。
2. 银行选择存款计划后，第二步内容展开并保持滚动容器连续，没有出现第二个滚动层。
3. 吸顶栏不覆盖“返回首页”标题栏，也不遮挡存款计划、商品卡片和确认操作。
4. 关键标题、余额、标签和操作仍使用现有语义结构；本轮浏览器控制台 warning/error 均为空。

## Evidence limit

内置浏览器截图已用于逐项视觉复核，但截图接口未提供可直接落盘的路径；本节的几何数据来自同一浏览器会话的实时 DOM 测量，未虚构额外截图文件。

final result: passed

---

# 班主任助理 V2 分类数据入口与排名表设计验收

- source visual truth paths:
  - `/var/folders/6j/jzy6dm_s61sfd605jnldswbh0000gn/T/codex-clipboard-f2202fa3-354f-4859-9ce0-0d56dfab3cd4.png`
  - `/var/folders/6j/jzy6dm_s61sfd605jnldswbh0000gn/T/codex-clipboard-200162c0-987d-41f7-8ccf-07bccaf3a233.png`
- implementation screenshot paths:
  - `/tmp/ai-headteacher-category-collapsed.png`
  - `/tmp/ai-headteacher-category-expanded.png`
- focused comparison path: `/tmp/ai-headteacher-category-control-comparison.png`
- viewport: `390 × 844` 手机屏幕
- state: 班主任助理 V2 首页分类数据收起态；分类数据展开态；健体班级扣分记录展开态

## Full-view comparison evidence

收起态中，“分类数据”以白色圆角胶囊置于数据卡右侧，与附件1的文字加下箭头形态一致。展开态中，右侧只保留白色44像素圆形上箭头，与附件2的交互层级一致。四列数据表在390像素宽度下无换行、截断或水平溢出；底部输入栏仍可见，高频对话入口未被展开内容挤出屏幕。

## Focused region comparison evidence

对照图已将两张附件与实现控件置于同一画布。实现复用同类白色表面、全圆角、中性次级文字和线性箭头；控件尺寸按项目教师手机端44像素触控令牌归一，因实现全屏截图包含手机壳缩放，对照图中实现控件视觉尺寸更小，不属于实际组件尺寸偏差。

## Findings

未发现 P0、P1 或 P2 问题。

## Required fidelity surfaces

- Fonts and typography: 入口文案使用13像素中等字重；表头10像素、数据行12像素，四列均单行完整显示。
- Spacing and layout rhythm: 入口与圆形收起按钮均保留44像素触控高度；指标列自适应，分数、年级排名和全校排名使用稳定列宽。
- Colors and visual tokens: 控件使用教师手机端白色表面、次级文字、控件阴影和班主任助理玻璃表面 Token，无临时硬编码色值。
- Image quality and asset fidelity: 附件中没有需要复制的位图素材；上下箭头使用项目现有线性图标库，线宽和尺寸与参考一致。
- Copy and content: 入口统一为“分类数据”；展开后不显示“评比大项”，只展示“指标 / 分数/总分 / 年级排名 / 全校排名”。

## Primary interactions tested

- 点击“分类数据”可展开四列数据，点击圆形上箭头可收起。
- 点击“健体班级”可展开3条扣分记录，再次点击可收起。
- 入口断言、领域数据测试和生产构建通过。
- 浏览器 warning/error 日志为空。

## Comparison history

1. 首轮：原得分进度图与用户期望的四列信息结构不符；改为分类数据表，增加年级排名和全校排名。
2. 浏览器首轮：整数分值显示为“20.0/20.0”，且点击行留下过强绿色焦点框；改为“20/20”紧凑格式，焦点反馈收敛为浅表面变化。
3. 最终轮：收起态、展开态和扣分下钻均已实机画布复核；无可操作的 P0/P1/P2 问题。

final result: passed

---

# 学校数据报表设计验收

- Source visual truth:
  - `/var/folders/6j/jzy6dm_s61sfd605jnldswbh0000gn/T/codex-clipboard-14c9e0a7-884d-4264-9137-44d558fddd94.png`
  - `/var/folders/6j/jzy6dm_s61sfd605jnldswbh0000gn/T/codex-clipboard-2274a1ff-2157-4742-a7d6-9434560c34dd.png`
- Implementation screenshots:
  - `/tmp/leader-report-seam-top-fixed.png`
  - `/tmp/leader-report-seam-scrolled-fixed.png`
- Viewport: 393 x 852 phone surface, rendered in the Codex in-app browser.
- State: Teacher usage report, default state and sticky state after 650px inner scroll.

## Full-view comparison evidence

- The title bar, report-type tabs, and period filters remain a compact continuous white surface.
- The report content scrolls beneath the sticky filters without showing through between the title bar and filters.
- Section actions remain secondary to 17px card headings and do not wrap or collide with titles.

## Focused region comparison evidence

- Section actions use 14px medium brand-red text, a 16px library chevron, 6px text/icon spacing, transparent background, and a 44px touch target.
- The fixed title bar and sticky filter overlap by approximately 1 CSS pixel. Browser measurements after scrolling showed the app outer scroll at 0, inner report scroll at 650, and no positive seam between the two surfaces.

## Comparison history

1. Earlier P2: section action text was visually smaller than the reference and the arrow sat too close to the label.
   - Fix: increased the action from 13px to 14px and spacing from 4px to 6px.
   - Post-fix evidence: all five section actions share the same component and measured styles.
2. Earlier P1: the title bar and sticky filter could expose scrolling content through their boundary.
   - Fix: removed the app-level second scroll layer, corrected the 44px title-bar box model, and overlapped the sticky surface by 1px.
   - Post-fix evidence: outer overflow is hidden; title/filter seam measured below zero at both default and scrolled states.

## Required fidelity surfaces

- Fonts and typography: passed; action hierarchy remains below card titles.
- Spacing and layout rhythm: passed; section actions align consistently and the top surfaces are continuous.
- Colors and visual tokens: passed; actions use the teacher-mobile brand token with no local hardcoded color.
- Image quality and asset fidelity: passed; no raster asset is required, and the arrow uses the existing icon library.
- Copy and content: passed; `查看班级明细`, `查看全部`, and `查看完整名单` remain unchanged.
- Primary interactions: passed; class detail and indicator full-list drawers open correctly.
- Console errors: none.

## Findings

No remaining P0, P1, or P2 visual mismatch was found.

final result: passed

---

# 当前 Product Design 验收状态

- active review: 教师手机端值周安排
- result: V1 紧凑月历、单周多人排班、教师搜索、暂不安排与未安排筛选均已验收

final result: passed

---

# 教师手机端值周安排设计验收

- source visual truth path: `/var/folders/6j/jzy6dm_s61sfd605jnldswbh0000gn/T/codex-clipboard-a18fba72-694b-4a76-ade7-e8c507b0ddc3.png`
- focused comparison path: `/Users/mayday/project/校园智能积分兑换终端/design-qa-weekly-duty-comparison.png`
- implementation screenshot paths:
  - `/Users/mayday/project/校园智能积分兑换终端/design-qa-weekly-duty-v1-calendar.jpg`
  - `/Users/mayday/project/校园智能积分兑换终端/design-qa-weekly-duty-v1-calendar-filtered.jpg`
  - `/Users/mayday/project/校园智能积分兑换终端/design-qa-weekly-duty-v1-unassigned-option.jpg`
  - `/Users/mayday/project/校园智能积分兑换终端/design-qa-weekly-duty-v1-teacher-search.jpg`
- viewport: `390 x 844`，教师手机端真实手机壳模式
- state: `2026年8月` 紧凑月历、只看未安排、暂不安排、姓名搜索状态

## Visible result

月历保留附件的两列网格结构，周块从 92 像素压缩到 76 像素。顶部删除“7/27周 已安排”统计，只保留未安排筛选。已安排周使用低饱和成功色底、成功色姓名和勾选图标，未安排周使用中性灰，当前选中周使用品牌红实底。

V1 取消列表和批量排班，页面直接进入月历。“值周安排”归入“我的 → 更多工具”，并按使用频率排在货币发放、问卷采集之后。每周支持配置多位教师：一位显示完整姓名，两位显示两位姓名，三位及以上显示“首位姓名等N人”。教师选择抽屉标题只显示日期范围，“暂不安排老师”固定在标题栏；正文直接从姓名搜索开始，支持连续多选，底部通过“保存（N人）”统一提交。成功结果通过周块内容即时更新反馈，不重复显示成功 Toast。

## Before and after

| Before | After |
| --- | --- |
| 附件只用彩色圆点表达教师与状态 | 周块直接显示教师姓名或“未安排”，无需记忆颜色含义 |
| 周块内重复显示“本周” | 周块删除重复标签，用右上角“本周”按钮完成定位 |
| 演示数据使用“陈老师 / 李老师”简称 | 周块和教师列表统一显示“陈思敏 / 李连 / 张全有”等完整姓名 |
| 几十位教师只能长距离滚动查找 | 抽屉顶部增加姓名即时搜索，输入“刘”只展示 4 位刘姓教师 |
| 每周只能配置一位教师 | 教师列表保持固定顺序，顶部独立展示已选教师且搜索后不丢失，底部统一保存；月历按人数紧凑显示摘要 |
| “当前安排 + 清空”操作不直观 | 抽屉标题栏固定展示白底、主题色文字和主题色边框的“暂不安排老师”轻量按钮；外层保留 44 像素触控区，内部可见高度为 28 像素、圆角为 8 像素，选中时使用主题色浅底 |
| 抽屉标题重复显示“值周老师” | 标题只保留周日期范围，正文直接从教师搜索开始 |
| 值周安排占用高频管理工具区域 | 迁入更多工具，并按货币发放、问卷采集、值周安排等使用频率排序 |
| V1 同时展示列表和批量排班 | 取消列表页签和批量能力，仅保留直观的月历主流程 |
| 已安排和未安排都是近似中性表面 | 已安排使用成功浅底 + 勾选图标，未安排使用中性灰，选中使用品牌红 |
| 顶部展示“7/27周 已安排” | 删除排班统计，只保留“只看未安排”筛选 |
| 周块 92 像素高，视觉偏胖 | 压缩为 76 像素，仍高于 44 像素触控下限 |
| 本周入口更像普通文字 | 改为中性实面、控件阴影和 44 像素触控高度的明确按钮 |
| 交互控件缺少一致反馈 | 月份箭头、周块、本周按钮、开关、搜索框和教师行均保留 44 像素触控区，按压缩放统一为 0.96 |

## Flow health

1. 进入值周安排：健康。管理员与校级负责人可从“我的 → 更多工具”进入，普通教师不显示入口。
2. 浏览月历与筛选：健康。8 月显示 6 个相交自然周；筛选后已安排周透明度为 `0.34`，网格位置不变。
3. 查找教师：健康。输入“刘”后仅展示刘飞、刘畅、刘思远、刘雨欣，结果只包含头像和完整姓名。
4. 设置或暂不安排教师：健康。“暂不安排老师”始终位于日期标题右侧；教师列表允许连续选中和取消并始终保持固定顺序，搜索框下方固定展示可移除的已选教师摘要，搜索不会清空已选项。点击底部“保存（N人）”后关闭抽屉并更新周块；暂不安排通过清空临时选择后统一保存。关闭抽屉不写入临时修改，成功不重复显示 Toast。

## Fidelity and accessibility

| 检查项 | 结果 |
| --- | --- |
| Layout | 两列 76 像素周块保持紧凑网格；抽屉标题栏承载日期、白色实体“暂不安排老师”按钮与关闭，正文只保留搜索和教师结果 |
| Typography | 日期、周次和进度使用等宽数字；姓名与状态层级低于日期，姓名不使用简称 |
| Tokens | 周块高度、已安排与未安排表面、选中阴影、弱化透明度、本周按钮、暂不安排按钮的默认/已选/按压/边界/阴影与教师行高均由 `--tm-duty-*` 管理 |
| Motion | 只过渡缩放、颜色、阴影和透明度，不使用 `transition: all`；按压缩放为 0.96 |
| Touch targets | 交互控件底层尺寸不低于 44 像素；手机壳截图中的可见尺寸因整体缩放而变小 |
| Semantics | 筛选使用 `switch`，周块与教师结果使用按钮语义，抽屉使用模态对话框，保存反馈使用 `status` |
| Search | 搜索框按姓名子串即时过滤；无结果时显示“未找到相关教师” |

截图只能确认可见层级和语义结构，不能单独证明完整的读屏体验；键盘焦点闭环由公共底部抽屉实现，仍建议在真实小程序容器发布前补一次读屏设备验证。

## Findings

- P0 / P1 / P2：无。
- P3：手机壳模式会整体缩放应用画布，截图中的 44 像素触控区测量约为 35.6 像素；这是演示外壳缩放，不是业务组件尺寸偏差。

final result: passed

---

# 货柜机登录方式预览与入口按钮设计验收

- source visual truth paths:
  - `/var/folders/6j/jzy6dm_s61sfd605jnldswbh0000gn/T/codex-clipboard-55180586-a231-481a-bd35-2de04d3ba19d.png`
  - `/var/folders/6j/jzy6dm_s61sfd605jnldswbh0000gn/T/codex-clipboard-9a509666-4db5-4c57-a632-0ce1500df112.png`
- implementation screenshot path: `/Users/mayday/project/校园智能积分兑换终端/design-qa-terminal-login-buttons.png`
- comparison image path: `/Users/mayday/project/校园智能积分兑换终端/design-qa-terminal-login-buttons-comparison.png`
- viewport: `1280 x 720` 宽屏完整控件；`900 x 720` 窄屏折叠控件
- state: 货柜机欢迎页，默认“仅密码”；并逐项验证“仅人脸”“仅密码”和“两种方式”

## Full-view comparison evidence

当前实现延续参考图的“卡片内标题 + 灰底横向三段选择 + 白色选中项”结构，并放在货柜机右侧。标题完全位于卡片内容区，不再跨越边框；三个选项始终单行展示。登录页三个入口统一使用相同宽度、`72px` 逻辑高度、`16px` 圆角、`20px` 字号和 `24px` 图标，只通过主按钮、浅色次按钮、白底描边按钮表达层级。默认“仅密码”时只展示实心蓝“账号密码登录”和描边“查看商品”。

同画布对照图同时包含分段选择参考、原穿模问题和当前完整页面，未发现标题穿模、选项换行或三个入口尺寸不一致。

## Focused region comparison evidence

无需额外裁切图：同画布对照图左侧已经按组件范围展示两张源图，右侧完整实现中的预览控件和三个按钮仍可清晰核对。内置浏览器测量结果如下：

| 检查项 | 结果 |
| --- | --- |
| 两种方式按钮尺寸 | 三个入口均为约 `262.4 x 49.2px`，这是 `72px` 逻辑高度经过货柜机整体预览缩放后的结果 |
| 圆角 | 三个入口均为 `16px` |
| 仅人脸 | 显示实心蓝“开始刷脸”和描边“查看商品” |
| 仅密码 | 显示实心蓝“账号密码登录”和描边“查看商品” |
| 两种方式 | 实心蓝主登录、浅蓝次登录、白底描边商品入口，尺寸与排版一致 |
| 窄屏 | 预览器收为 `126 x 44px` 当前方式按钮，位于设备右侧并与环境切换条保留约 `9px` 间距；展开后仍为横向三段选择 |

## Primary interactions tested

1. 在三种登录配置间切换，登录入口随学校能力正确增减，商品入口始终保留。
2. 游客点击“查看商品”后进入商品列表，页面不展示“星光超市”余额卡片。
3. 游客点击商品后打开登录弹窗，默认展示密码登录；“两种方式”下可切换人脸识别。
4. 学号和密码分别填写任意非空内容后登录成功，返回原商品位置并直接打开该商品的确认支付。
5. 取消确认支付后，登录态商品页恢复“星光超市”和 `245.5` 成长币余额信息。
6. 内置浏览器控制台错误：无。
7. 星光超市滚动收起后，紧凑余额栏顶部与标题栏底部坐标一致；储蓄银行滚动收起后，紧凑余额和分类栏顶部也与标题栏底部坐标一致。

## Comparison history

- P1：原预览使用边框标题与纵向选项，标题穿过边框且占用空间偏大。已改为卡片内标题和横向三段选择；宽屏常驻、窄屏渐进展开。复验通过。
- P1：两种登录方式同时开启时，三个入口高度与视觉语言不统一，刷脸按钮阴影偏重。已统一尺寸、圆角、字号、图标和按压反馈，仅保留必要的主次层级。复验通过。
- P2：新预览组件反向引用 `App.tsx` 类型，组件边界不清晰。类型已下沉到预览组件并由 `App.tsx` 仅作类型导入。构建与静态回归测试通过。
- P2：预览控件原位于设备左侧，默认选择“两种方式”。已按最新要求移至设备右侧、默认改为“仅密码”，并在窄屏避开最右侧环境切换条。复验通过。
- P2：超市和银行的紧凑栏收起后仍分别保留 `32px` 和 `24px` 顶部间距，且上下节奏不一致。已在滚动收起态统一为 `8px` 逻辑间距（设备缩放后上下实测约 `6.27px`），初始态布局不变；两页吸顶坐标复验通过。
- P2：吸顶收起使用 `transition-all`，可能让阴影、模糊和边框同时插值造成视觉抖动。已改为仅过渡尺寸、透明度、间距、位移和滤镜等必要属性；浏览器复验无跳变。

## Findings

- P0 / P1 / P2：无。
- P3：在极窄的 Demo 工作台宽度下，展开的预览浮层可能接近设备外壳边缘；不影响终端内的真实用户操作，当前 `900px` 验收视口未遮挡主要登录按钮。
- 内置浏览器截图接口可直接完成视觉核对但不提供持久化路径；项目中的实现截图由本机 Chromium 对同一 URL、同一 `1280 x 720` 视口生成，并已在内置浏览器中逐项交互复核。

final result: passed
