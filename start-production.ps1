<#
.SYNOPSIS
  Script triển khai và khởi chạy toàn bộ hệ thống Quản lý Sinh viên (Backend + Frontend)
.DESCRIPTION
  Khởi chạy đồng thời:
  1. Backend API (Express.js + MongoDB) tại http://localhost:5000
  2. Frontend Dashboard (Nuxt 4 Production) tại http://localhost:3000
#>

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  🚀 TRIỂN KHAI HỆ THỐNG QUẢN LÝ SINH VIÊN (PRODUCTION)  " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Kiểm tra build frontend
$outputServer = Join-Path $PSScriptRoot "frontend\.output\server\index.mjs"
if (-not (Test-Path $outputServer)) {
    Write-Host "📦 Chưa tìm thấy bản build Frontend. Đang build Nuxt 4..." -ForegroundColor Cyan
    npm run build:frontend
}

# 2. Khởi chạy Backend trong process riêng
Write-Host "🚀 Đang khởi động Backend Server (Port 5000)..." -ForegroundColor Green
$backendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; node index.js" -PassThru

# Chờ 3 giây để backend nạp DB
Start-Sleep -Seconds 3

# 3. Khởi chạy Frontend trong process riêng
Write-Host "🌐 Đang khởi động Frontend Nuxt 4 (Port 3000)..." -ForegroundColor Green
$frontendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; `$env:PORT=3000; node frontend/.output/server/index.mjs" -PassThru

Write-Host "`n✅ HỆ THỐNG ĐÃ ĐƯỢC TRIỂN KHAI VÀ KHỞI CHẠY THÀNH CÔNG!" -ForegroundColor Green
Write-Host "----------------------------------------------------------" -ForegroundColor Gray
Write-Host "📍 Frontend Nuxt 4 Dashboard : http://localhost:3000" -ForegroundColor Yellow
Write-Host "📍 Backend RESTful API      : http://localhost:5000" -ForegroundColor Yellow
Write-Host "📍 API Documentation        : http://localhost:5000/api" -ForegroundColor Yellow
Write-Host "📍 Web App Dashboard tĩnh   : http://localhost:5000" -ForegroundColor Yellow
Write-Host "📍 Health Check             : http://localhost:5000/health" -ForegroundColor Yellow
Write-Host "----------------------------------------------------------" -ForegroundColor Gray
Write-Host "Nhấn phím bất kỳ để mở trình duyệt xem hệ thống..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Start-Process "http://localhost:3000"
