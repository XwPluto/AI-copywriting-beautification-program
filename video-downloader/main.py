from pathlib import Path
import os
from fastapi import FastAPI, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
import yt_dlp

app = FastAPI(title="Video Downloader")

cors_origins_raw = os.getenv("CORS_ALLOW_ORIGINS", "")
cors_origins = [origin.strip() for origin in cors_origins_raw.split(",") if origin.strip()]
if cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

BASE_DIR = Path(__file__).resolve().parent
DOWNLOAD_DIR = BASE_DIR / "downloads"
DOWNLOAD_DIR.mkdir(exist_ok=True)

INDEX_HTML = """<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>视频下载器</title>
  <style>
    body { font-family: "Microsoft YaHei", sans-serif; max-width: 760px; margin: 40px auto; padding: 0 16px; }
    h1 { margin-bottom: 16px; }
    .row { display: flex; gap: 8px; }
    input { flex: 1; padding: 10px; font-size: 15px; }
    button { padding: 10px 16px; cursor: pointer; }
    #status { margin-top: 12px; color: #333; white-space: pre-wrap; }
  </style>
</head>
<body>
  <h1>视频下载器（FastAPI 本机版）</h1>
  <div class="row">
    <input id="url" placeholder="粘贴视频链接（YouTube/B站/X 等）" />
    <button id="btn">下载</button>
  </div>
  <div id="status"></div>

  <script>
    console.log("FASTAPI_LOCAL_V2");
    const btn = document.getElementById("btn");
    const urlInput = document.getElementById("url");
    const status = document.getElementById("status");

    btn.addEventListener("click", async () => {
      const url = urlInput.value.trim();
      if (!url) {
        status.textContent = "请先输入链接";
        return;
      }

      btn.disabled = true;
      status.textContent = "正在下载，请稍候...";

      try {
        const form = new FormData();
        form.append("url", url);

        const res = await fetch("/api/download", { method: "POST", body: form });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || `请求失败: ${res.status}`);
        }

        const blob = await res.blob();
        const cd = res.headers.get("Content-Disposition") || "";
        let filename = "video.mp4";
        const m = cd.match(/filename="?([^"]+)"?/);
        if (m && m[1]) filename = decodeURIComponent(m[1]);

        const a = document.createElement("a");
        const href = URL.createObjectURL(blob);
        a.href = href;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(href);

        status.textContent = `下载完成：${filename}`;
      } catch (e) {
        status.textContent = `失败：${e.message}`;
      } finally {
        btn.disabled = false;
      }
    });
  </script>
</body>
</html>
"""


@app.get("/", response_class=HTMLResponse)
def index():
    return HTMLResponse(INDEX_HTML)


@app.get("/api/health")
def health_check():
    return {
        "ok": True,
        "service": "video-downloader",
        "download_dir": str(DOWNLOAD_DIR),
    }


@app.post("/api/download")
def download_video(url: str = Form(...)):
    if not url.strip():
        raise HTTPException(status_code=400, detail="URL 不能为空")

    ydl_opts = {
        "outtmpl": str(DOWNLOAD_DIR / "%(title).120s.%(ext)s"),
        "format": "bestvideo+bestaudio/best",
        "merge_output_format": "mp4",
        "noplaylist": True,
        "quiet": True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            file_path = Path(ydl.prepare_filename(info))
            if not file_path.exists():
                mp4_path = file_path.with_suffix(".mp4")
                if mp4_path.exists():
                    file_path = mp4_path

        if not file_path.exists():
            raise HTTPException(status_code=500, detail="下载完成但未找到文件")

        return FileResponse(
            path=str(file_path),
            filename=file_path.name,
            media_type="application/octet-stream",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"下载失败: {e}")
