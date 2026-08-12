# 教师手机端图标交付说明

本交付面向 Vue 开发，所有图标均为独立 SVG 或 PNG 文件，不要求安装 React 或 `lucide-react`。

## 目录结构

| 目录 | 内容 |
| --- | --- |
| `lucide-icons/` | 教师手机端全部源码引用的 Lucide SVG，共 177 个去重文件 |
| `lucide-icons/by-source/` | 按教师端源码页面、组件分组的 SVG 副本，便于逐页查找 |
| `teacher-me-icons/` | “我的”页面按实际尺寸与品牌色整理的专用图标，不含管理工具入口图片 |
| `inline-icons/` | 原本直接写在页面中的静态 SVG，例如学期报告上传、删除和虚拟键盘图标 |
| `student-level-icons/` | 学生星星、月亮、太阳、皇冠等级图片 |

项目资源根目录中的 `ranking-crown-icon.png`、`ai-bot.png`、`ai-art-badge.png`、两类 AI 助理图标，以及三类报告入口 PNG，也属于教师端当前使用的专用图片图标，已随压缩包一并交付。

当前索引覆盖 80 个直接或间接使用 Lucide 的教师端源码文件。公共图标封装的间接引用已解析到最终页面，不需要 Vue 开发再追踪 React 组件。

## 专用图片图标

| 业务位置 | 文件 |
| --- | --- |
| 班级报告排行皇冠 | `ranking-crown-icon.png` |
| 学生等级 | `student-level-icons/star.png`、`moon.png`、`sun.png`、`crown.png` |
| 记录页 AI 入口 | `ai-bot.png` |
| AI 标识 | `ai-art-badge.png` |
| 班主任助理 | `ai-headteacher-assistant-icon.png` |
| 校长助理 | `ai-principal-assistant-icon.png` |
| 学生评价报表 | `school-report-v2.png` |
| 班级评价报表 | `class-evaluation-report.png` |
| 期末报告 | `term-report-v2.png` |
| 教师登录 | `teacher-login-icon.jpg` |

## 班级页面重点对照

### 班级列表与“班级更多操作”

页面分组目录：`lucide-icons/by-source/views/ClassListView/`

| 业务位置 | 图标文件 |
| --- | --- |
| 班级号复制 | `copy.svg` |
| 复制成功 | `check.svg` |
| 打开更多操作 | `more-horizontal.svg` |
| 查看班级详情 | `chevron-right.svg` |
| 关闭更多操作 | `x.svg` |
| 作业录入 | `file-text.svg` |
| 兑换奖励 | `gift.svg` |
| 批量修改学生、离校学生管理 | `users.svg` |
| 更新人脸数据 | `scan-face.svg` |
| 设置兑换密码 | `shield.svg` |
| 批量留档 | `folder-archive.svg` |
| 邀请老师加入 | `user-plus.svg` |
| 邀请家长加入 | `message-circle.svg` |
| 学生列表 | `users.svg` |
| 班级报告 | `bar-chart-3.svg` |

### 班级详情与“老师更多操作”

页面分组目录：`lucide-icons/by-source/views/ClassInfoView/`

| 业务位置 | 图标文件 |
| --- | --- |
| 复制班级号、复制邀请文案 | `copy.svg` |
| 老师更多操作 | `more-horizontal.svg` |
| 设为或取消副班主任 | `user-cog.svg` |
| 移除老师、解除家长绑定 | `trash-2.svg` |
| 转移班主任 | `repeat-2.svg` |
| 退出或解散班级 | `log-out.svg` |
| 邀请老师、邀请家长 | `user-plus.svg` |
| 微信分享 | `share-2.svg` |
| 二维码邀请 | `qr-code.svg` |
| 拨打家长电话 | `phone.svg` |
| 编辑家长信息 | `pencil.svg` |
| 返回、进入下一级 | `chevron-left.svg`、`chevron-right.svg` |

## 使用说明

- Vue 中可以直接使用 `<img src="...">`，也可以将 SVG 内容作为组件模板内联。
- 全量 Lucide SVG 使用 24×24 画布、2 像素线宽和 `#171513` 默认颜色；业务端可按页面语义修改根节点的 `stroke`。
- `manifest.json` 可按 Lucide 导出名反查文件；`source-index.json` 可按源码页面反查该页面使用的图标。
- `by-source` 中存在同名副本是为了按页交付方便；真正去重后的原文件位于 `lucide-icons/` 根目录。
