#!/bin/bash
cd "$(dirname "$0")"
echo "🚀 正在尝试同步代码到 GitHub..."
git push origin main
if [ $? -eq 0 ]; then
  echo "✅ 同步成功！"
else
  echo "❌ 同步失败，请检查您的网络连接或代理设置。"
fi
read -p "按回车键关闭窗口..."
