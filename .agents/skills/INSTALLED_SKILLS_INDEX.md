# 项目 Skill 安装记录

本记录登记 2026-11-06 为当前项目新增的两个 skill。安装范围为本项目的 `.agents/skills/`，不修改全局 skill 目录或索引。

| Skill | 来源目录 | 固定提交版本 | 许可证 |
| --- | --- | --- | --- |
| `frontend-design-codex` | [KilimiaoSix/agent-skills · skills/frontend-design-codex](https://github.com/KilimiaoSix/agent-skills/tree/6095b91576c0295edd8a431d1e8f12abd077c509/skills/frontend-design-codex) | `6095b91576c0295edd8a431d1e8f12abd077c509` | Apache-2.0，随包保留 `LICENSE` 与 `NOTICE` |
| `high-end-visual-design` | [Leonxlnx/taste-skill-classics · skills/soft-skill](https://github.com/Leonxlnx/taste-skill-classics/tree/5e08c9383dc4ad7fc0df70e1ac8cfa09ec356305/skills/soft-skill) | `5e08c9383dc4ad7fc0df70e1ac8cfa09ec356305` | MIT，从上游同一提交补充仓库根目录的 `LICENSE` |

## 调用方式

可在当前项目的对话中按需明确点名调用：

- `$frontend-design-codex`：产品界面的设计、实现与验证。
- `$high-end-visual-design`：具有明确视觉风格要求的精致展示页面。

`high-end-visual-design` 的上游 `agents/openai.yaml` 设置 `allow_implicit_invocation: false`，仅在明确点名时调用；`frontend-design-codex` 保留上游的默认调用配置。

## 维护说明

- 保留上游完整 skill 目录，包括说明、调用配置及示例；安装目录按 skill 名称命名。
- 更新时从表中来源获取新版本，同步更新固定提交版本和许可证记录。
- 执行 skill 时仍遵守项目 `AGENTS.md` 的适用规则，包括设计评审、规范冲突说明和浏览器自动化授权要求。
- 本文件仅记录这两个新增 skill；项目原有的 `impeccable` 保持原状。
