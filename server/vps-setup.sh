#!/bin/bash
set -e

echo "=== GamingTask VPS Setup ==="

# Docker インストール（未インストールの場合のみ）
if ! command -v docker &> /dev/null; then
  echo "[1/4] Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
else
  echo "[1/4] Docker already installed: $(docker --version)"
fi

# リポジトリが存在しなければ clone、存在すれば pull
if [ ! -d "/root/gamingtask" ]; then
  echo "[2/4] Cloning repository..."
  git clone https://github.com/rakusa053/gamingtask.git /root/gamingtask
else
  echo "[2/4] Pulling latest code..."
  git -C /root/gamingtask pull origin main
fi

cd /root/gamingtask/server

# .env.production が存在しない場合は SCP済みのものを使う
if [ ! -f ".env.production" ]; then
  echo "ERROR: .env.production が見つかりません。"
  echo "  scp コマンドで先に転送してください:"
  echo "  scp server/.env.production root@[2400:8500:2002:3316:163:44:110:220]:/root/gamingtask/server/.env.production"
  exit 1
fi

echo "[3/4] Starting Docker Compose..."
docker compose -f docker-compose.prod.yml pull 2>/dev/null || true
docker compose -f docker-compose.prod.yml up -d --build

echo "[4/4] Checking status..."
sleep 3
docker compose -f docker-compose.prod.yml ps

echo ""
echo "=== Done! ==="
echo "API test: curl http://[2400:8500:2002:3316:163:44:110:220]/api/tasks"
echo "(401 Unauthorized が返れば正常)"
