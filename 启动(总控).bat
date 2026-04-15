@echo off

chcp 65001 >nul

setlocal



set "ROOT_DIR=%~dp0"

if "%ROOT_DIR:~-1%"=="\" set "ROOT_DIR=%ROOT_DIR:~0,-1%"

set "VIDEO_DIR=%ROOT_DIR%\video-downloader"

set "VIDEO_START=%VIDEO_DIR%\启动(团队).bat"



if not exist "%VIDEO_START%" (

  echo [错误] 未找到视频后端启动脚本：%VIDEO_START%

  pause

  exit /b 1

)



echo 正在启动视频后端（独立窗口）...

start "Video Downloader" cmd /k "\"%VIDEO_START%\""



echo 正在打开 AI 文案前端页面...

start "" "%ROOT_DIR%\index.html"



echo.

echo [完成] 总启动已执行：前端已打开，后端在新窗口运行

pause

endlocal

