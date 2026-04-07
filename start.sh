#!/bin/bash

# ==========================================
# 校园智能积分兑换终端 启动脚本
# ==========================================

# 确保脚本在项目根目录下运行
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 设置颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   校园智能积分兑换终端 启动程序   ${NC}"
echo -e "${GREEN}========================================${NC}"

# 1. 检查 Node.js 是否安装
if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}[错误] 未找到 Node.js，请先从 https://nodejs.org/ 安装。${NC}"
    read -p "按下回车键退出..."
    exit 1
fi

# 2. 检查 .env.local
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}[警告] 未找到 .env.local 文件。${NC}"
    echo "正在创建默认配置模板..."
    echo "GEMINI_API_KEY=PLACEHOLDER_API_KEY" > .env.local
    echo -e "${YELLOW}[提醒] 请务必在 .env.local 中填入您的 Gemini API Key。${NC}"
fi

# 3. 检查依赖并自动安装
if [ ! -d "node_modules" ]; then
    echo -e "${GREEN}[信息] 未检测到依赖库，正在自动安装 (npm install)...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}[错误] 依赖安装失败，请手动检查网络连接后重试。${NC}"
        read -p "按下回车键退出..."
        exit 1
    fi
fi

# 4. 启动项目
echo -e "${GREEN}[信息] 正在启动 Vite 交互式开发环境...${NC}"
npm run dev
