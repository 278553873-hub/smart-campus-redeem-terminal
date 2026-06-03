#!/bin/bash
set -euo pipefail

# ==========================================
# 校园智能积分兑换终端：一键提交、同步 GitHub 并部署演示服务器
# ==========================================

cd "$(dirname "$0")"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
  echo -e "${GREEN}$1${NC}"
}

warn() {
  echo -e "${YELLOW}$1${NC}"
}

fail() {
  echo -e "${RED}$1${NC}"
  read -p "按回车键关闭窗口..."
  exit 1
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    fail "[错误] 缺少命令：$1，请先安装或联系技术人员处理。"
  fi
}

run_expect() {
  local remote_command="$1"
  DEPLOY_PASSWORD="$DEPLOY_PASSWORD" \
  DEPLOY_REMOTE_COMMAND="$remote_command" \
  expect <<EOF_EXPECT
set timeout 120
set cmd \$env(DEPLOY_REMOTE_COMMAND)
spawn ssh -p $DEPLOY_SSH_PORT -o StrictHostKeyChecking=accept-new $DEPLOY_USER@$DEPLOY_HOST \$cmd
expect {
  -re "(?i)password:" { send "\$env(DEPLOY_PASSWORD)\r"; exp_continue }
  eof
}
catch wait result
exit [lindex \$result 3]
EOF_EXPECT
}

rsync_with_password() {
  local source_path="$1"
  local target_path="$2"
  DEPLOY_PASSWORD="$DEPLOY_PASSWORD" expect <<EOF_EXPECT
set timeout -1
spawn rsync -az --delete --partial -e "ssh -p $DEPLOY_SSH_PORT -o StrictHostKeyChecking=accept-new" $source_path $DEPLOY_USER@$DEPLOY_HOST:$target_path
expect {
  -re "(?i)password:" { send "\$env(DEPLOY_PASSWORD)\r"; exp_continue }
  eof
}
catch wait result
exit [lindex \$result 3]
EOF_EXPECT
}

append_deploy_log() {
  mkdir -p logs/agent_detail
  cat >> logs/agent_detail/deployment.md <<EOF_LOG

## $(date '+%Y-%m-%d %H:%M:%S') 一键提交并部署
- 动作：执行 \`一键同步代码到Github.command\`。
- 分支：$(git branch --show-current 2>/dev/null || echo unknown)。
- 提交：$(git rev-parse --short HEAD 2>/dev/null || echo unknown)。
- 构建：\`npm run build\` 已完成。
- 部署目录：\`$DEPLOY_APP_DIR\`。
- 访问地址：$DEPLOY_PUBLIC_URL
EOF_LOG
}

log "========================================"
log "  一键提交、同步 GitHub 并部署演示服务器"
log "========================================"

for cmd in git npm node rsync expect ssh curl; do
  require_command "$cmd"
done

if [ ! -f ".deploy.local" ]; then
  cat > .deploy.local <<'EOF_CONFIG'
# 本地一键提交并部署配置；此文件被 *.local 忽略，不要提交到 GitHub。
DEPLOY_HOST=8.137.11.220
DEPLOY_SSH_PORT=58385
DEPLOY_USER=yangyang
DEPLOY_PASSWORD=YOUR_SERVER_PASSWORD
DEPLOY_APP_DIR=/home/yangyang/campus-smart-points
DEPLOY_WEB_PORT=9001
DEPLOY_PUBLIC_URL=http://8.137.11.220:9001/
EOF_CONFIG
  chmod 600 .deploy.local
  fail "[错误] 已创建 .deploy.local 模板，请先填入服务器密码后再重新运行。"
fi

# shellcheck disable=SC1091
source .deploy.local

: "${DEPLOY_HOST:?缺少 DEPLOY_HOST}"
: "${DEPLOY_SSH_PORT:?缺少 DEPLOY_SSH_PORT}"
: "${DEPLOY_USER:?缺少 DEPLOY_USER}"
: "${DEPLOY_PASSWORD:?缺少 DEPLOY_PASSWORD}"
: "${DEPLOY_APP_DIR:?缺少 DEPLOY_APP_DIR}"
: "${DEPLOY_WEB_PORT:?缺少 DEPLOY_WEB_PORT}"
: "${DEPLOY_PUBLIC_URL:?缺少 DEPLOY_PUBLIC_URL}"

CURRENT_BRANCH="$(git branch --show-current)"
if [ -z "$CURRENT_BRANCH" ]; then
  fail "[错误] 当前不在有效 Git 分支上。"
fi

warn "[提示] 这个脚本会把当前所有改动提交到 GitHub，并同步更新演示服务器。"
read -p "请输入提交说明（直接回车使用默认说明）：" COMMIT_MESSAGE
if [ -z "$COMMIT_MESSAGE" ]; then
  COMMIT_MESSAGE="更新演示版本 $(date '+%Y-%m-%d %H:%M')"
fi

log "[1/7] 安装依赖检查..."
if [ ! -d "node_modules" ]; then
  npm install
fi

log "[2/7] 构建生产版本..."
npm run build
find dist -name .DS_Store -delete

log "[3/7] 准备 Git 提交..."
git add -A
if git diff --cached --quiet; then
  warn "[提示] 没有检测到需要提交的新改动，将直接推送并部署当前版本。"
else
  git commit -m "$COMMIT_MESSAGE"
fi

log "[4/7] 推送到 GitHub..."
git push origin "$CURRENT_BRANCH"

log "[5/7] 同步构建产物到服务器..."
TMP_REMOTE_DEPLOY_FILE="$(mktemp /tmp/campus-smart-points-remote-deploy.XXXXXX.sh)"
cat > "$TMP_REMOTE_DEPLOY_FILE" <<EOF_REMOTE_DEPLOY
#!/bin/bash
set -euo pipefail
APP_DIR="$DEPLOY_APP_DIR"
WEB_PORT="$DEPLOY_WEB_PORT"
MODE="\${1:-restart}"
mkdir -p "\$APP_DIR/dist" "\$APP_DIR/logs"
if [ "\$MODE" = "prepare" ]; then
  exit 0
fi
cd "\$APP_DIR"
if [ -f app.pid ] && kill -0 "\$(cat app.pid)" 2>/dev/null; then
  kill "\$(cat app.pid)" || true
  sleep 1
fi
nohup env PORT="\$WEB_PORT" WEB_ROOT="\$APP_DIR/dist" node "\$APP_DIR/server.mjs" > "\$APP_DIR/logs/app-\$WEB_PORT.log" 2>&1 &
echo \$! > app.pid
sleep 1
ss -ltnp 2>/dev/null | grep ":\$WEB_PORT" || true
curl -I --max-time 5 "http://127.0.0.1:\$WEB_PORT/" | head -6
EOF_REMOTE_DEPLOY
chmod +x "$TMP_REMOTE_DEPLOY_FILE"
rsync_with_password "$TMP_REMOTE_DEPLOY_FILE" "/home/$DEPLOY_USER/campus-smart-points-remote-deploy.sh"
run_expect "bash /home/$DEPLOY_USER/campus-smart-points-remote-deploy.sh prepare"
rsync_with_password "dist/" "$DEPLOY_APP_DIR/dist/"

TMP_SERVER_FILE="$(mktemp /tmp/campus-smart-points-server.XXXXXX.mjs)"
cat > "$TMP_SERVER_FILE" <<'EOF_SERVER'
import http from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const port = Number(process.env.PORT || 9001);
const root = resolve(process.env.WEB_ROOT || join(process.cwd(), 'dist'));
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.glb': 'model/gltf-binary',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const cleaned = normalize(decoded).replace(/^(\.\.(\/|\\|$))+/, '');
  return resolve(join(root, cleaned));
}

const server = http.createServer((req, res) => {
  try {
    const requested = safePath(req.url || '/');
    let filePath = requested.startsWith(root) ? requested : join(root, 'index.html');
    if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
      filePath = join(root, 'index.html');
    }
    const type = mime[extname(filePath)] || 'application/octet-stream';
    const cache = filePath.endsWith('index.html') ? 'no-cache' : 'public, max-age=31536000, immutable';
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': cache });
    createReadStream(filePath).pipe(res);
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Server error');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Campus Smart Points app listening on 0.0.0.0:${port}, root=${root}`);
});
EOF_SERVER

rsync_with_password "$TMP_SERVER_FILE" "$DEPLOY_APP_DIR/server.mjs"
rm -f "$TMP_SERVER_FILE" "$TMP_REMOTE_DEPLOY_FILE"

log "[6/7] 重启服务器演示服务..."
run_expect "bash /home/$DEPLOY_USER/campus-smart-points-remote-deploy.sh restart"

log "[7/7] 验证公网访问..."
if curl -I --max-time 15 "$DEPLOY_PUBLIC_URL" | grep -q "200 OK"; then
  append_deploy_log
  log "✅ 已提交到 GitHub，并成功部署到服务器。"
  log "访问地址：$DEPLOY_PUBLIC_URL"
else
  fail "[错误] 服务器已重启，但公网访问验证失败，请检查端口或服务器安全组。"
fi

read -p "按回车键关闭窗口..."
