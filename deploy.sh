#!/bin/bash
# My AI Dashboard - OCI Server Deploy Script
# Usage: sudo bash deploy.sh

set -e

echo "=== My AI Dashboard - Server Setup ==="

# 1. System update
echo "[1/5] System update..."
apt update && apt upgrade -y

# 2. Install Node.js (LTS)
echo "[2/5] Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi
echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"

# 3. Install dependencies
echo "[3/5] Installing dependencies..."
APP_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$APP_DIR/server"
npm ci --production

# 4. Create .env if not exists
echo "[4/5] Checking .env..."
if [ ! -f "$APP_DIR/server/.env" ]; then
    cp "$APP_DIR/.env.example" "$APP_DIR/server/.env"
    echo "⚠️  .env created from example. Please edit server/.env with your API keys."
fi

# 5. Build frontend
echo "[5/5] Building frontend..."
cd "$APP_DIR/client"
npm ci
npm run build

# Copy build to server/public
rm -rf "$APP_DIR/server/public"
cp -r "$APP_DIR/client/dist" "$APP_DIR/server/public"

# 6. Setup systemd service
echo "[6/6] Setting up systemd service..."
NODE_PATH=$(which node)

cat > /etc/systemd/system/my-ai-dashboard.service << EOF
[Unit]
Description=My AI Dashboard Server
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=$APP_DIR/server
ExecStart=$NODE_PATH src/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=$APP_DIR/server/.env

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable my-ai-dashboard
systemctl restart my-ai-dashboard

echo ""
echo "=== Deploy Complete ==="
echo "Service: my-ai-dashboard"
echo "Port: 5000"
echo "Status: $(systemctl is-active my-ai-dashboard)"
echo ""
echo "Commands:"
echo "  sudo systemctl status my-ai-dashboard"
echo "  sudo systemctl restart my-ai-dashboard"
echo "  sudo journalctl -u my-ai-dashboard -f"
