# 校园智能积分兑换终端

这是校园智能积分兑换终端的前端项目，包含 PC 端、移动端和演示大屏等页面。

## 本地运行

1. 安装依赖：

   ```bash
   npm install
   ```

2. 配置本地环境变量：

   ```bash
   cp .env.example .env.local
   ```

   按需填写 `GEMINI_API_KEY` 等本地配置。

3. 启动开发环境：

   ```bash
   npm run dev
   ```

## 构建检查

```bash
npm run build
```

## 提交服务器说明

本项目里，“提交服务器”不是只推送 GitHub，而是指把当前版本构建后部署到演示服务器：

- 访问地址：`http://8.137.11.220:9001/`
- 服务器配置文件：`.deploy.local`
- 一键脚本：`一键同步代码到Github.command`

执行一键脚本会完成这些动作：

1. 构建生产版本。
2. 如有代码改动，创建本地 Git 提交。
3. 推送当前分支到 GitHub。
4. 同步 `dist/` 构建产物到服务器。
5. 使用 systemd（系统服务管理器）重启演示服务，并配置开机自启和异常退出自动恢复。
6. 验证 `http://8.137.11.220:9001/` 是否可访问。

以后如果需求里说“提交服务器”或“更新服务器”，应优先理解为部署到 `http://8.137.11.220:9001/`；GitHub 推送只是同步代码，不代表服务器已经更新。

### 网站服务维护

网站由部署用户的 `campus-smart-points-9001.service` 管理。部署脚本会启用用户服务的开机运行能力（linger），退出远程登录后仍然运行；进程退出后约 3 秒自动重启。服务器需要支持 systemd，并允许部署用户执行 `loginctl enable-linger`。

登录服务器后，可使用以下命令检查、重启和查看日志：

```bash
systemctl --user status campus-smart-points-9001.service
systemctl --user restart campus-smart-points-9001.service
journalctl --user -u campus-smart-points-9001.service -n 50 --no-pager
```

## 注意事项

- `.deploy.local` 包含服务器连接配置和密码，只保存在本机，不要提交到仓库。
- `logs/agent_detail/` 是本地沟通与操作日志目录，已被忽略，不要提交。
- 修改配置时需要同步检查 `.env.example` 和本地环境文件，避免配置说明缺失。
