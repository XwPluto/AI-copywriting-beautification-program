@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set "APP_DIR=%~dp0"
if "%APP_DIR:~-1%"=="\" set "APP_DIR=%APP_DIR:~0,-1%"
set "START_SCRIPT=%APP_DIR%\启动(团队).bat"
set "PORT=8000"
set "PID="
set "CORS_LINE="

if exist "%START_SCRIPT%" (
  for /f "usebackq delims=" %%L in (`findstr /i /c:"CORS_ALLOW_ORIGINS" "%START_SCRIPT%"`) do (
    set "CORS_LINE=%%L"
    goto :showCors
  )
)

:showCors
echo 当前 CORS 配置来源：%START_SCRIPT%
if defined CORS_LINE (
  echo !CORS_LINE!
) else (
  echo [提示] 未读取到 CORS_ALLOW_ORIGINS，可能尚未创建“启动(团队).bat”。
)
echo.

for /f "tokens=5" %%a in ('netstat -ano ^| findstr /r /c:":%PORT% .*LISTENING"') do (
  set "PID=%%a"
  goto :kill
)

echo 未找到占用 %PORT% 端口的进程，无需停止。
pause
exit /b 0

:kill
echo 检测到 %PORT% 端口进程 PID=%PID%
taskkill /F /PID %PID%
if %errorlevel%==0 (
  echo 已成功停止下载器服务（PID=%PID%）。
) else (
  echo 停止失败，请尝试以管理员身份运行。
)

pause
endlocal
