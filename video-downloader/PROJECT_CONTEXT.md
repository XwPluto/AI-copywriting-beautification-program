# PROJECT_CONTEXT

## 本轮推进（2026-04-15，隔离与精简版）

### 已完成
1. 已精简子模块脚本，仅保留核心可维护入口：
   - 保留：`部署初始化(Windows云主机).bat`、`启动(团队).bat`、`停止(团队).bat`、`启动(公网).bat`
   - 删除：`启动下载器.bat`、`停止下载器.bat`、`启动下载器-带CORS.bat`、`停止下载器-带CORS提示.bat`

2. 已建立子模块级规则隔离：
   - 新增并填写 `video-downloader/.Cursorrules`
   - 明确“仅改视频下载子模块，不误改主项目前端”
   - 明确“子模块变更仅更新本目录 PROJECT_CONTEXT.md”

### 当前说明
- 现在主项目与子模块边界已清晰：
  - 主项目：`AI copywriting beautification program`
  - 子模块：`AI copywriting beautification program/video-downloader`
- 日常使用建议：
  - 启动全项目：`../启动(总控).bat`
  - 停止全项目：`../停止(总控).bat`

## 本轮推进（2026-04-15，收尾总控版）

### 已完成
1. 已在 AI 项目根目录新增总控脚本：
   - `启动(总控).bat`：一键打开前端 `index.html` + 启动 `video-downloader\启动(团队).bat`
   - `停止(总控).bat`：一键调用 `video-downloader\停止(团队).bat`

2. 已新增旧目录清理脚本：
   - `清理旧目录(视频下载器).bat`
   - 用途：尝试停止占用旧路径的 Python 进程并删除 `D:\好玩的程序\Video automatic download program`

### 当前说明
- 由于 Windows 文件句柄占用，旧目录在自动删除时仍可能失败。
- 你可直接双击 `清理旧目录(视频下载器).bat` 执行收尾清理。
- 新架构已可按“AI 主项目 + video-downloader 子模块”方式稳定管理。

## 本轮推进（2026-04-15，目录迁移版）

### 已完成
1. 已将视频下载项目复制迁移到 AI 项目子目录：
   - 目标目录：`D:\好玩的程序\AI copywriting beautification program\video-downloader`

2. 已修复迁移后脚本路径（改为相对路径，后续再移动也可用）：
   - `启动(团队).bat`
   - `停止(团队).bat`
   - `启动下载器-带CORS.bat`
   - `停止下载器-带CORS提示.bat`
   - 核心改动：`APP_DIR` 从绝对路径改为 `%~dp0` 自动识别脚本所在目录

### 当前状态说明
- 因 Windows 文件占用限制，原目录 `D:\好玩的程序\Video automatic download program` 暂未自动删除。
- 但 `video-downloader` 子目录已可独立运行，已满足“作为 AI 项目子部件管理”的目标。
- 建议你确认新目录运行正常后，再手动删除旧目录（若删不掉，先关闭相关终端/进程再删）。

## 本轮推进（2026-04-15，部署落地版）

### 已完成
1. 已补齐 Windows 云主机一键部署启动链路：
   - `部署初始化(Windows云主机).bat`：创建 `.venv` + 安装 `requirements.txt`
   - `启动(公网).bat`：以 `0.0.0.0:8000` 启动 Uvicorn（公网监听）

2. 已补齐 Linux VPS systemd 模板：
   - `video-downloader.service.template`
   - 包含 `WorkingDirectory`、`ExecStart`、`CORS_ALLOW_ORIGINS`、自动重启策略

### 本轮产出文件
- `D:\好玩的程序\Video automatic download program\部署初始化(Windows云主机).bat`
- `D:\好玩的程序\Video automatic download program\启动(公网).bat`
- `D:\好玩的程序\Video automatic download program\video-downloader.service.template`

### 使用指引（超短版）
1. **Windows 云主机**：先双击 `部署初始化(Windows云主机).bat`，再双击 `启动(公网).bat`
2. **Linux VPS**：按模板落地 `/etc/systemd/system/video-downloader.service` 后执行：
   - `sudo systemctl daemon-reload`
   - `sudo systemctl enable video-downloader`
   - `sudo systemctl start video-downloader`
3. 验证：`http://<服务器IP或域名>:8000/api/health`

## 本轮推进（2026-04-15，按 B 方案继续）

### 已完成
1. 已审查 `AI copywriting beautification program` 当前结构：
   - 前端已存在“文案美化 / 视频下载”双模块切换入口；
   - 设置页已存在“视频下载后端地址”字段；
   - 前端已实现 `POST {videoApiBase}/api/download` 下载调用逻辑；
   - Cloudflare Pages 前端 + 独立后端调用路径已具备基础形态。

2. 已对视频后端做第一步可部署化整理：
   - 新增健康检查接口：`GET /api/health`（用于部署后巡检/监控）
   - 新增依赖锁定文件：`requirements.txt`

### 本轮产出文件
- `D:\好玩的程序\Video automatic download program\main.py`
  - 新增：`/api/health`
- `D:\好玩的程序\Video automatic download program\requirements.txt`
  - 内容：FastAPI / Uvicorn / yt-dlp / python-multipart 固定版本

### 下一步（建议直接执行）
1. 先把视频后端部署到可公网访问环境（Windows 云主机 或 Linux VPS 均可）
2. 启动后验证：
   - `GET /api/health` 返回 `ok: true`
   - `GET /docs` 可访问
3. 在 Cloudflare Pages 线上页面“设置 -> 视频下载后端地址”填入公网地址
4. 进行端到端联调：线上页面粘贴链接后可完成下载
5. 若联调失败，按文末“30 秒排查顺序”逐项排查

## 最终结论（截至今天）
- 原路线 **Docker + n8n + Cloudflare Tunnel + 前端 HTML** 已确认放弃；相关容器与镜像已清理。
- 新路线已落地并跑通：**FastAPI + yt-dlp + ffmpeg + 本机网页**。
- 当前状态：本机 `http://127.0.0.1:8000` 可正常“粘贴链接 -> 下载视频”。
- 终端出现的 `GET /.well-known/appspecific/com.chrome.devtools.json 404` 属于浏览器探测请求，**不影响功能**。

## 当前技术栈与版本（已确认）
- 操作系统：Windows 10.0.26200
- Shell：PowerShell
- Python：3.13（已创建 `.venv`）
- FastAPI：`0.135.3`
- Uvicorn：`0.44.0`
- yt-dlp：`2026.3.17`
- python-multipart：`0.0.26`
- ffmpeg：`8.1-full_build-www.gyan.dev`（本机可用）

## 今天遇到并解决的关键问题（关键原文 + 结论）
1. 虚拟环境激活失败：
   - `Activate.ps1 ... CommandNotFoundException`
   - 结论：当时 `.venv` 未正确创建；后续重建并成功进入虚拟环境。

2. 依赖安装中断：
   - `ConnectionResetError: [WinError 10054] 远程主机强迫关闭了一个现有的连接`
   - 结论：网络中断导致 pip 下载失败；重试后安装成功。

3. 应用加载失败：
   - `Error loading ASGI app. Attribute "app" not found in module "main"`
   - 结论：`main.py` 内容异常/未正确保存；重写后恢复正常。

4. 前端请求失败：
   - 页面报 `失败：Failed to fetch`
   - 结论：页面仍使用旧 Cloudflare Webhook 逻辑；已改为本地 FastAPI 接口并打通。

5. 清理 Docker 旧资源：
   - 清理后确认删除 `n8n-video-downloader` 容器和 `videoautomaticdownloadprogram-n8n:latest` 镜像。

## 当前已确认存在的项目文件（工作区）
路径：`D:\好玩的程序\Video automatic download program`

- `main.py`（当前主入口，内置前端页面 + `/api/download`）
- `download.html`（历史页面文件，当前不作为主入口）
- `启动下载器.bat`（一键启动）
- `停止下载器.bat`（精准停止 8000 端口进程）
- `.Cursorrules`
- `PROJECT_CONTEXT.md`
- `downloads/`（已下载视频输出目录）

## 今天对电脑/环境做出的修改（用于后续还原）
### A. 可确认修改
1. 已创建并使用虚拟环境：`.venv`
2. 已安装并验证：FastAPI / Uvicorn / yt-dlp / python-multipart
3. 已验证 `ffmpeg -version` 可执行
4. 已新增启动/停止脚本：
   - `启动下载器.bat`
   - `停止下载器.bat`
5. Docker 历史 n8n 相关资源已清理（容器、镜像、网络）

### B. 可能仍存在（按需处理）
1. Docker Desktop 程序本体是否保留（可按需卸载）
2. cloudflared 程序本体是否保留（当前新路线不依赖）

## 当前可用的日常使用方式（已验证）
### 方式 1：命令行启动
```powershell
cd "D:\好玩的程序\Video automatic download program"
$env:CORS_ALLOW_ORIGINS="https://ai-copywriting-beautification-program.pages.dev,http://127.0.0.1:8000,http://localhost:8000"
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```
浏览器访问：`http://127.0.0.1:8000`

### 方式 2：双击脚本（推荐团队使用）
- 双击 `启动(团队).bat` 启动（已内置 CORS 配置）
- 双击 `停止(团队).bat` 停止（会先显示当前 CORS 配置，再停止 8000 端口进程）

### 方式 3：历史脚本（兼容入口）
- `启动下载器.bat`：已改为自动跳转到 `启动(团队).bat`
- `停止下载器.bat`：已改为自动跳转到 `停止(团队).bat`

## 你已明确的后续需求（重要）
1. 另一个项目路径：`D:\好玩的程序\AI copywriting beautification program`
2. 该项目 **已通过 Cloudflare Pages 线上部署**。
3. 后续目标：将本项目（视频下载）与“AI 文案美化”项目融合，并上线。
4. 约束要求：
   - 两个功能互不影响
   - 团队成员可稳定使用
   - 按 **B 方案**推进（中等完整度：模块隔离 + 可部署 + 可维护）

## 融合项目的工程判断（本轮结论）
- 可行，但需注意：Cloudflare Pages 本质是静态托管，`yt-dlp + ffmpeg` 通常需要后端运行环境。
- 高概率采用：
  - 前端继续在 Cloudflare Pages
  - 视频下载后端独立部署（FastAPI 服务）
  - 前端通过 API 调用后端下载能力
- 这是下一轮开发的核心架构方向。

## 下一轮新对话建议起点（用于复原记忆）
请在新对话第一条直接粘贴以下内容：

1) `D:\好玩的程序\Video automatic download program\PROJECT_CONTEXT.md`
2) 明确指令：
   - “按 B 方案开始融合 `AI copywriting beautification program` 与 `Video automatic download program`。”
   - “先审查 `AI copywriting beautification program` 的前后端结构，再给文件级改造计划，然后分步落地代码。”

## 下一轮第一阶段待办（建议执行顺序）
1. 审查 `AI copywriting beautification program` 代码结构（入口、路由、部署配置）
2. 确认当前线上部署是否有可用后端（若无则新增独立 FastAPI 服务）
3. 在现有 UI 中新增“视频下载”模块入口（Tab/菜单）
4. 接入下载 API：提交任务、下载回传、错误处理
5. 团队可用性收尾：启动文档、依赖锁定、基础运维说明

## 上线检查清单（5条，部署当天逐项确认）
1. **后端可用性**：视频下载后端公网地址可访问，`/docs` 可打开。
2. **CORS 配置**：`CORS_ALLOW_ORIGINS` 已包含 Cloudflare Pages 正式域名（必要时含自定义域名）。
3. **前端配置**：AI 项目“设置”中的“视频下载后端地址”已填写为公网后端地址并保存。
4. **功能联调**：线上页面可完成“粘贴链接 -> 下载视频”，并能看到明确成功/失败提示。
5. **团队操作**：本地运维同学可用 `启动(团队).bat` / `停止(团队).bat` 完成启停，历史脚本跳转正常。

## 故障时 30 秒排查顺序（超短版）
1. **先看服务是否在跑**：双击 `启动(团队).bat`，确认终端无报错并保持运行。
2. **再看后端地址**：AI 页面“设置 -> 视频下载后端地址”是否为当前可访问公网地址。
3. **再看 CORS**：后端 `CORS_ALLOW_ORIGINS` 是否包含当前前端域名。
4. **再看连通性**：浏览器直接打开后端 `/docs`，若打不开优先处理后端部署/网络。
5. **最后看平台限制**：若仅个别链接失败，通常是源站限制或 `yt-dlp` 规则变化，先换链接复测。
