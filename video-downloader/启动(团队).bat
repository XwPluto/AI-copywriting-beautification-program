@echo off
chcp 65001 >nul
setlocal

set "APP_DIR=%~dp0"
if "%APP_DIR:~-1%"=="\" set "APP_DIR=%APP_DIR:~0,-1%"
set "PYTHON_EXE=%APP_DIR%\.venv\Scripts\python.exe"

REM ===== 可按需修改：允许访问此后端的前端域名（逗号分隔） =====
set "CORS_ALLOW_ORIGINS=https://ai-copywriting-beautification-program.pages.dev,http://127.0.0.1:8000,http://localhost:8000"

if not exist "%PYTHON_EXE%" (
  echo [错误] 未找到虚拟环境 Python：%PYTHON_EXE%
  echo 请先在项目目录创建 .venv
  pause
  exit /b 1
)

cd /d "%APP_DIR%"
echo 正在启动视频下载器服务（已启用 CORS）...
echo CORS_ALLOW_ORIGINS=%CORS_ALLOW_ORIGINS%
start "" "http://127.0.0.1:8000"
"%PYTHON_EXE%" -m uvicorn main:app --host 127.0.0.1 --port 8000

endlocal
