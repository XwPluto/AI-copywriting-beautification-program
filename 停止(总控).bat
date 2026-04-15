@echo off

chcp 65001 >nul

setlocal



set "ROOT_DIR=%~dp0"

if "%ROOT_DIR:~-1%"=="\" set "ROOT_DIR=%ROOT_DIR:~0,-1%"

set "VIDEO_DIR=%ROOT_DIR%\video-downloader"

set "VIDEO_STOP=%VIDEO_DIR%\停止(团队).bat"



if not exist "%VIDEO_STOP%" (

  echo [错误] 未找到视频后端停止脚本：%VIDEO_STOP%

  pause

  exit /b 1

)



echo 正在停止视频后端...

call "%VIDEO_STOP%"



echo.

echo [完成] 总停止已执行

pause

endlocal

