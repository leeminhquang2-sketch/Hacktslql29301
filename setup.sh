#!/bin/bash

echo "╔══════════════════════════════════════╗"
echo "║     CHAR HACK BOT - SETUP ⭐7      ║"
echo "╚══════════════════════════════════════╝"
echo ""

# Kiểm tra Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js chưa được cài đặt!"
    echo "📥 Cài Node.js: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js: $(node -v)"
echo ""

# Cài dependencies
echo "📦 Đang cài đặt dependencies..."
npm install

echo ""
echo "✅ Cài đặt hoàn tất!"
echo ""
echo "📝 Cấu hình bot:"
echo "   1. Mở file bot.js"
echo "   2. Sửa TOKEN_CUA_BAN thành token Discord"
echo ""
echo "🚀 Chạy lệnh: bash start.sh"
