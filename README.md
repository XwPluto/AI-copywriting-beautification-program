# 电影剪辑团队文案美化工具 V2.0

一个纯前端单页工具（`HTML + CSS + JS`），支持：
- 云端 API 文案美化（智谱 / DeepSeek / 火山 ARK）
- 本地 Ollama 模式
- 设置本地保存/导入导出
- 模式 B 使用帮助弹窗
- 登录/注册弹窗（当前为本地模拟）
- 文案库抽屉（我的文案 / 团队共享简化版，本地模拟）

> 说明：当前项目可直接双击 `index.html` 使用。若要上云部署，请按下方步骤操作。

---

## 一、推送到 GitHub

1. 在项目目录打开终端：

```bash
git init
git add .
git commit -m "feat: upgrade to v2"
```

2. 在 GitHub 新建仓库（例如：`movie-copy-beautifier`）后执行：

```bash
git branch -M main
git remote add origin https://github.com/<你的用户名>/<你的仓库名>.git
git push -u origin main
```

---

## 二、通过 Vercel 一键部署

1. 打开 [Vercel](https://vercel.com)
2. 点击 **Add New... → Project**
3. 选择并导入你的 GitHub 仓库
4. Framework Preset 选 **Other**（纯静态站点）
5. 点击 **Deploy**

部署完成后会得到一个公网访问链接。

---

## 三、环境变量配置（如需）

当前代码中的 Supabase 配置在 `script.js` 顶部是占位符：

```js
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

如果你后续接入真实 Supabase，建议：

1. 在 Vercel 项目中打开 **Settings → Environment Variables**
2. 添加：
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
3. 在代码中读取这些变量（若你后续改为构建流程）

> 当前是纯静态直接运行版本，默认使用本地模拟登录与本地文案库，不依赖后端即可使用。

---

## 四、本地使用方式

1. 直接双击 `index.html`
2. 点击右上角 `设置` 填写云端 API Key
3. 输入草稿，点击 `一键美化`
4. 通过 `复制结果` 或 `保存到云空间（本地模拟）` 使用结果

---

## 五、后续接入 Supabase（建议）

你可以在 `script.js` 中把以下本地模拟逻辑替换为 Supabase：
- `handleAuthSubmit`（登录/注册）
- `saveCurrentDraftToCloud`（保存文案）
- `renderLibraryList` 的数据来源

这样就能实现真实团队共享与跨设备同步。
