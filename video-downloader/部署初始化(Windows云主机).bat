@echo off
chcp 65001 >nul
setlocal

set "APP_DIR=%~dp0"
if "%APP_DIR:~-1%"=="\" set "APP_DIR=%APP_DIR:~0,-1%"
set "PYTHON_EXE=%APP_DIR%\.venv\Scripts\python.exe"

cd /d "%APP_DIR%"

echo [1/3] 检查 Python...
where python >nul 2>nul
if errorlevel 1 (
  echo [错误] 未检测到 python，请先安装 Python 3.11+
  pause
  exit /b 1
)

echo [2/3] 创建虚拟环境（若不存在）...
if not exist "%PYTHON_EXE%" (
  python -m venv .venv
  if errorlevel 1 (
    echo [错误] 创建虚拟环境失败
    pause
    exit /b 1
  )
)

echo [3/3] 安装依赖...
"%PYTHON_EXE%" -m pip install --upgrade pip
"%PYTHON_EXE%" -m pip install -r requirements.txt
if errorlevel 1 (
  echo [错误] 依赖安装失败
  pause
  exit /b 1
)

echo.
echo [完成] 初始化完成，可双击“启动(公网).bat”启动服务
pause
endlocal
