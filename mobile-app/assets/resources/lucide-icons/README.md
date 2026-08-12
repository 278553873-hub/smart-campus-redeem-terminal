# 教师手机端 Lucide 图标资源包

本目录包含 `mobile-app` 代码中出现过的全部 `lucide-react` 导入图标，供未安装该图标库的开发环境直接使用。

- 图标数量：177 个
- 文件格式：SVG（矢量图）
- 标准画布：24 x 24 px
- 默认颜色：`#171513`
- 默认线宽：2 px
- 来源版本：`lucide-react@0.563.0`

`manifest.json` 记录每个图标的 Lucide 导出名称、资源文件名及当前使用文件。文件名统一使用小写短横线格式，例如 `UserRound` 对应 `user-round.svg`。

`source-index.json` 和 `by-source/` 按教师端源码页面、组件整理图标。页面通过公共 `components/Icons.tsx` 间接使用的 Lucide 图标也已归入对应页面，例如班级更多操作中的作业、奖励、学生管理、人脸、密码和邀请图标。

说明：

- 仅排除 `LucideIcon` 类型声明，不过滤业务文件中暂未使用的预留导入。
- Lucide 同时提供不带 `Icon` 和带 `Icon` 的导出别名，因此少量文件图形相同，但文件名与项目代码中的导出名称一一对应。
- 不同页面如需品牌红、状态色或其他线宽，可直接修改 SVG 根节点的 `stroke` 与 `stroke-width`。
- `LICENSE` 为 Lucide 原始开源许可文件。
- 项目更新 Lucide 图标引用后，在项目根目录运行 `node scripts/export-mobile-lucide-icons.mjs` 可重新生成本目录。
