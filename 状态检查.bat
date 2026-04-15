@echo off
chcp 65001 >nul
setlocal

echo 正在检查本地视频后端状态...
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r = Invoke-RestMethod -Uri 'http://127.0.0.1:8000/api/health' -TimeoutSec 3; Write-Host '[正常] 后端已运行：' ($r ^| ConvertTo-Json -Compress) } catch { Write-Host '[失败] 后端未运行，请先双击 启动工具(团队).bat 或 启动(总控).bat' }"

echo.
pause
endlocal
