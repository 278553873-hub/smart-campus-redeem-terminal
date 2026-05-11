# 手机端剩余页面规范落地分批计划

## 原则

不对所有页面做机械替换。手机端规范落地按风险分批：先处理设置/列表/功能入口类页面，再处理记录流和报表类页面的通用部分。报告封面、证书、海报式页面属于 `PHONE_UI_GUIDELINES.md` 允许例外，不做全局字号硬收敛。

## 第一批：低风险列表/设置类

范围：
- `mobile-app/views/MyFilesView.tsx`
- `mobile-app/views/bank-password/BankPasswordView.tsx`
- `mobile-app/views/face-update/FaceUpdateView.tsx`
- `mobile-app/views/reward-verification/RewardVerificationView.tsx`
- `mobile-app/views/ClassListView.tsx`

目标：
- 菜单/列表项文字不使用过重字重。
- 短辅助值走右侧或弱文字。
- 图标容器尽量统一到 `IconBadge` 或规范尺寸。
- 普通卡片阴影不使用过重 `shadow-xl/2xl`。

## 第二批：首页/学生详情/记录列表

范围：
- `mobile-app/views/DashboardView.tsx`
- `mobile-app/views/ClassDetailView.tsx`
- `mobile-app/views/ClassRecordLogView.tsx`
- `mobile-app/views/ClassLeaderboardView.tsx`
- `mobile-app/views/EvaluationRecordsLogView.tsx`

目标：
- 普通列表卡片向 `MobileCard` 语义靠拢。
- AI 结果卡、记录流糖果风格保留为例外，但必须局部封装/命名。
- 操作按钮和图标按钮保证 44px 热区和 active 反馈。
- 去掉明显的页面级一次性重阴影。

## 第三批：报表/文档类

范围：
- `mobile-app/views/ClassReportView.tsx`
- `mobile-app/views/ReportDetailView.tsx`
- `mobile-app/views/TermReportView.tsx`
- `mobile-app/components/SubjectGradesChart.tsx`
- `mobile-app/components/SubjectRadarChart.tsx`
- `mobile-app/components/FiveEducationRadarSimple.tsx`

目标：
- 保留报告封面、导出预览、图表说明的特殊排版。
- 只收敛普通按钮、顶部栏、普通卡片、列表项。
- 不强行替换报告正文中的设计型字号。

## 验收

每批完成后执行：
- 静态检查关键硬编码是否减少。
- `npm run build`。
- 记录日志到 `logs/agent_detail/mobile_design_system_audit_2026-05-08.md`。
