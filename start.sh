#!/bin/bash

echo "╔══════════════════════════════════════╗"
echo "║     CHAR HACK BOT ⭐7 SAO ⭐       ║"
echo "╚══════════════════════════════════════╝"
echo ""

# Kiểm tra file bot.js đã config chưa
if grep -q "TOKEN_CUA_BAN" bot.js; then
    echo "⚠️  CHƯA CẤU HÌNH TOKEN!"
    echo "📝 Sửa file bot.js, thay TOKEN_CUA_BAN bằng token thật"
    echo ""
    exit 1
fi

echo "🚀 Đang khởi động..."
echo ""

# Chạy server trong background
node server.js &
SERVER_PID=$!
echo "✅ Server PID: $SERVER_PID"

# Đợi server khởi động
sleep 2

# Chạy bot
node bot.js &
BOT_PID=$!
echo "✅ Bot PID: $BOT_PID"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║          ĐANG CHẠY...              ║"
echo "║  Server: http://localhost:3000     ║"
echo "║  Bot Discord: Online               ║"
echo "╚══════════════════════════════════════╝"
echo ""
echo "📋 Nhấn Ctrl+C để dừng"

# Giữ terminal
wait
