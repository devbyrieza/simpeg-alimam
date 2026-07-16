#!/bin/bash
# ========================================
# DEPLOYMENT SCRIPT - AL-IMAM
# ========================================

# Konfigurasi
SERVER="root@72.61.141.50"
PROJECT_DIR="/root/apps/alimam"

echo "🚀 Memulai deployment Al-Imam ke $SERVER..."

# 1. Sync file ke server menggunakan rsync
# Mengecualikan folder yang tidak perlu untuk mempercepat proses
echo "📦 Sinkronisasi file..."
rsync -avz --delete \
  --exclude '.git/' \
  --exclude 'node_modules/' \
  --exclude '.next/' \
  --exclude '.env' \
  ./ $SERVER:$PROJECT_DIR

# 2. Build dan Restart Container di server
echo "🏗️ Membangun dan merestart container di server..."
ssh $SERVER "cd $PROJECT_DIR && docker compose up -d --build"

echo "✨ Deployment Al-Imam Selesai!"
