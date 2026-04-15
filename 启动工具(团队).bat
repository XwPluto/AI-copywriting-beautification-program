@echo off
chcp 65001 >nul
setlocal

set "ROOT_DIR=%~dp0"
if "%ROOT_DIR:~-1%"=="\" set "ROOT_DIR=%ROOT_DIR:~0,-1%"

echo [1/2] 检查本地视频后端状态...
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/health' -TimeoutSec 2 ^| Out-Null; exit 0 } catch { exit 1 }"
if %errorlevel% neq 0 (
  echo 后端未运行，正在启动总控...
  start "" "%ROOT_DIR%\启动(总控).bat"
  timeout /t 2 /nobreak >nul
) else (
  echo 后端已运行，直接打开前端页面...
  start "" "%ROOT_DIR%\index.html"
)

echo [2/2] 已完成，请在页面中切换到“视频下载”使用。
pause
endlocal
