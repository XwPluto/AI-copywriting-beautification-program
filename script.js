const STORAGE_KEY = 'movieCopyBeautifierSettings';
const CLOUD_DRAFTS_LOCAL_KEY = 'movieCopyBeautifierCloudDrafts';
const CLOUD_AUTH_LOCAL_KEY = 'movieCopyBeautifierAuth';

// V2：Supabase 配置占位
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // 请替换为你的项目URL
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // 请替换为你的anon key

const SYSTEM_PROMPT = `角色设定：
你是一位顶级的影视解说文案专家和语言风格美化师。你擅长将口语化、逻辑松散的电影剪辑博主笔记，优化为节奏感强、有感染力、逻辑清晰的专业解说文案。

核心任务：
你的任务是“美化”，而非“重写”。你必须严格遵守以下核心原则：
1. 尊重并保留原文内容：绝对忠于用户提供的文案内容、观点、剧情顺序和核心信息。严禁添加原文中没有的剧情解读、人物分析或主观评价。
2. 专注语言表达：你的所有工作仅限于优化原文的语言表达，使其更流畅、生动、有节奏感，符合优秀电影解说文案的标准。
3. 保留用户口吻：在美化时，必须保留原文的第一人称或第二人称视角，以及用户独特的语气，如调侃、惊叹、吐槽等。

语言风格指南（请在处理时遵循以下风格）：
1. 口语化与节奏感：句子要短促有力，多断句。模仿自然说话的语气，多用反问、设问和感叹句来调动观众情绪。例如：“你猜怎么着？”“这你敢信？”
2. 关键词打磨：仔细打磨文案中的动词和形容词，用更具画面感和冲击力的词汇替代平淡的描述。
3. 结构优化：在保留所有剧情节点的前提下，合理使用“但是”、“然而”、“更绝的是”等连接词，增强文案的转折和悬念感。
4. 避免“AI味儿”：严禁使用任何“首先、其次、最后、总而言之”这类刻板的连接词，以及“这部影片深刻揭示了……”等说教式总结。

输出格式：
- 直接输出美化后的完整文案，无需任何前缀、后记或解释说明。`;

const DEFAULT_SETTINGS = {
  mode: 'cloud',
  provider: 'zhipu',
  apiKey: '',
  cloudModel: '',
  ollamaUrl: 'http://localhost:11434',
  ollamaModel: ''
};

const $ = (id) => document.getElementById(id);
const el = {
  appStatus: $('appStatus'),
  openSettingsBtn: $('openSettingsBtn'),
  closeSettingsBtn: $('closeSettingsBtn'),
  settingsModal: $('settingsModal'),
  modeSelect: $('modeSelect'),
  modeCards: document.querySelectorAll('[data-mode-card]'),
  cloudModePanel: $('cloudModePanel'),
  ollamaModePanel: $('ollamaModePanel'),
  providerSelect: $('providerSelect'),
  apiKeyInput: $('apiKeyInput'),
  cloudModelInput: $('cloudModelInput'),
  ollamaUrlInput: $('ollamaUrlInput'),
  ollamaModelSelect: $('ollamaModelSelect'),
  saveSettingsBtn: $('saveSettingsBtn'),
  testCloudBtn: $('testCloudBtn'),
  testOllamaBtn: $('testOllamaBtn'),
  exportSettingsBtn: $('exportSettingsBtn'),
  importSettingsBtn: $('importSettingsBtn'),
  includeApiKeyCheckbox: $('includeApiKeyCheckbox'),
  importSettingsInput: $('importSettingsInput'),
  settingsStatus: $('settingsStatus'),
  connectionStatus: $('connectionStatus'),
  inputText: $('inputText'),
  beautifyBtn: $('beautifyBtn'),
  copyBtn: $('copyBtn'),
  outputText: $('outputText'),
  errorMessage: $('errorMessage'),
  openOllamaHelpBtn: $('openOllamaHelpBtn'),
  ollamaHelpModal: $('ollamaHelpModal'),
  closeOllamaHelpBtn: $('closeOllamaHelpBtn'),
  openAuthBtn: $('openAuthBtn'),
  authModal: $('authModal'),
  closeAuthBtn: $('closeAuthBtn'),
  authLoginTab: $('authLoginTab'),
  authSignupTab: $('authSignupTab'),
  authEmailInput: $('authEmailInput'),
  authPasswordInput: $('authPasswordInput'),
  authSubmitBtn: $('authSubmitBtn'),
  authStatus: $('authStatus'),
  saveCloudBtn: $('saveCloudBtn'),
  openLibraryBtn: $('openLibraryBtn'),
  libraryDrawer: $('libraryDrawer'),
  closeLibraryBtn: $('closeLibraryBtn'),
  myDraftsTab: $('myDraftsTab'),
  teamDraftsTab: $('teamDraftsTab'),
  libraryList: $('libraryList')
};

const appState = {
  authMode: 'login',
  user: null,
  libraryTab: 'mine',
  currentLibraryItems: []
};

// =========================
// Supabase 客户端与开关
// =========================
let supabaseClient = null;

function isSupabaseEnabled() {
  return SUPABASE_URL && SUPABASE_ANON_KEY
    && !SUPABASE_URL.includes('YOUR_SUPABASE_URL')
    && !SUPABASE_ANON_KEY.includes('YOUR_SUPABASE_ANON_KEY')
    && Boolean(window.supabase);
}

function getSupabaseClient() {
  if (!isSupabaseEnabled()) return null;
  if (!supabaseClient) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseClient;
}

function normalizeSettings(s = {}) {
  return {
    mode: s.mode === 'ollama' ? 'ollama' : 'cloud',
    provider: ['zhipu', 'deepseek', 'volcengine'].includes(s.provider) ? s.provider : 'zhipu',
    apiKey: typeof s.apiKey === 'string' ? s.apiKey : '',
    cloudModel: typeof s.cloudModel === 'string' ? s.cloudModel : '',
    ollamaUrl: typeof s.ollamaUrl === 'string' && s.ollamaUrl.trim() ? s.ollamaUrl.trim() : DEFAULT_SETTINGS.ollamaUrl,
    ollamaModel: typeof s.ollamaModel === 'string' ? s.ollamaModel : ''
  };
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return normalizeSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function collectSettings() {
  return normalizeSettings({
    mode: el.modeSelect.value,
    provider: el.providerSelect.value,
    apiKey: el.apiKeyInput.value.trim(),
    cloudModel: el.cloudModelInput.value.trim(),
    ollamaUrl: el.ollamaUrlInput.value.trim(),
    ollamaModel: el.ollamaModelSelect.value
  });
}

function applySettings(s) {
  el.modeSelect.value = s.mode;
  el.providerSelect.value = s.provider;
  el.apiKeyInput.value = s.apiKey;
  el.cloudModelInput.value = s.cloudModel;
  el.ollamaUrlInput.value = s.ollamaUrl;
  el.ollamaModelSelect.dataset.pendingModel = s.ollamaModel || '';
  renderMode(s.mode);
}

function showError(text) {
  el.errorMessage.hidden = false;
  el.errorMessage.textContent = text;
}

function showMessage(text) {
  el.outputText.value = text;
  el.errorMessage.hidden = true;
  el.errorMessage.textContent = '';
}

function setConnection(text, type = 'normal') {
  el.connectionStatus.textContent = `连接状态：${text}`;
  el.connectionStatus.classList.remove('success', 'error');
  if (type === 'success') el.connectionStatus.classList.add('success');
  if (type === 'error') el.connectionStatus.classList.add('error');
}

function setLoading(loading) {
  el.beautifyBtn.disabled = loading;
  el.beautifyBtn.textContent = loading ? '处理中...' : '一键美化';
  if (loading) el.appStatus.textContent = 'AI 正在美化文案，请稍等...';
}

function renderMode(mode) {
  el.modeCards.forEach((card) => card.classList.toggle('is-active', card.getAttribute('data-mode-card') === mode));
  el.cloudModePanel.hidden = mode !== 'cloud';
  el.ollamaModePanel.hidden = mode !== 'ollama';
  el.appStatus.textContent = mode === 'cloud' ? '当前：云端 API 模式' : '当前：本地 Ollama 模式';
}

function openSettings() {
  el.settingsModal.hidden = false;
}

function closeSettings() {
  el.settingsModal.hidden = true;
}

function getOllamaBase() {
  return (el.ollamaUrlInput.value.trim() || DEFAULT_SETTINGS.ollamaUrl).replace(/\/$/, '');
}

async function fetchOllamaModels() {
  el.ollamaModelSelect.innerHTML = '<option value="">正在读取本地模型...</option>';
  try {
    const res = await fetch(`${getOllamaBase()}/api/tags`);
    if (!res.ok) throw new Error('service error');
    const data = await res.json();
    const models = Array.isArray(data.models) ? data.models : [];
    if (!models.length) {
      el.ollamaModelSelect.innerHTML = '<option value="">未发现本地模型，请先 pull 模型</option>';
      return;
    }
    el.ollamaModelSelect.innerHTML = models.map((m) => `<option value="${m.name || ''}">${m.name || ''}</option>`).join('');
    const pending = el.ollamaModelSelect.dataset.pendingModel || '';
    if (pending && models.some((m) => m.name === pending)) el.ollamaModelSelect.value = pending;
  } catch {
    el.ollamaModelSelect.innerHTML = '<option value="">未连接到 Ollama 服务</option>';
  }
}

async function cloudChat(text, s) {
  if (!s.apiKey) throw new Error('请先在设置里填写 API Key');

  let url = '';
  let model = '';

  if (s.provider === 'zhipu') {
    url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    model = s.cloudModel || 'glm-4-flash';
  } else if (s.provider === 'deepseek') {
    url = 'https://api.deepseek.com/chat/completions';
    model = s.cloudModel || 'deepseek-chat';
  } else {
    url = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
    model = s.cloudModel;
    if (!model) throw new Error('火山引擎需要填写“云端模型/接入点 ID”');
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${s.apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text }
      ],
      temperature: 0.7
    })
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`云端请求失败（${res.status}）${detail ? `：${detail.slice(0, 120)}` : ''}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('云端返回内容为空，请稍后重试');
  return content;
}

async function ollamaChat(text, s) {
  if (!s.ollamaModel) throw new Error('请先在设置里选择本地模型');
  const base = (s.ollamaUrl || DEFAULT_SETTINGS.ollamaUrl).replace(/\/$/, '');
  const res = await fetch(`${base}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: s.ollamaModel,
      stream: false,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text }
      ]
    })
  });
  if (!res.ok) throw new Error('本地模型调用失败，请检查 Ollama 服务地址和模型是否可用');
  const data = await res.json();
  const content = data?.message?.content?.trim();
  if (!content) throw new Error('本地模型没有返回有效内容，请重试一次');
  return content;
}

async function testCloud() {
  const s = collectSettings();
  el.testCloudBtn.disabled = true;
  setConnection('正在测试云端连接...');
  try {
    await cloudChat('把这句话保持原意优化一下：今天这段剪辑节奏还可以再紧一点。', s);
    setConnection('云端连接正常，可用', 'success');
  } catch (e) {
    setConnection(`云端测试失败：${e.message}`, 'error');
  } finally {
    el.testCloudBtn.disabled = false;
  }
}

async function testOllama() {
  el.testOllamaBtn.disabled = true;
  setConnection('正在测试 Ollama 连接...');
  try {
    const res = await fetch(`${getOllamaBase()}/api/tags`);
    if (!res.ok) throw new Error('no response');
    const data = await res.json();
    const n = Array.isArray(data.models) ? data.models.length : 0;
    setConnection(n ? `Ollama 连接正常，已发现 ${n} 个模型` : 'Ollama 已连接，但未发现模型，请先 pull 模型', n ? 'success' : 'error');
    await fetchOllamaModels();
  } catch {
    setConnection('Ollama 测试失败：请确保已安装并运行 Ollama', 'error');
  } finally {
    el.testOllamaBtn.disabled = false;
  }
}

function exportSettings() {
  const s = collectSettings();
  const includeKey = !!el.includeApiKeyCheckbox?.checked;
  const safe = { ...s, apiKey: includeKey ? s.apiKey : '' };
  const payload = { app: 'movie-copy-beautifier', version: 1, exportedAt: new Date().toISOString(), includeApiKey: includeKey, settings: safe };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `beautifier-settings-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  el.settingsStatus.textContent = includeKey ? '设置已导出（包含 API Key）' : '设置已导出（未包含 API Key）';
}

async function importSettings(file) {
  if (!file) return;
  try {
    const p = JSON.parse(await file.text());
    const raw = p?.settings ?? p ?? {};
    const hasApiKey = typeof raw.apiKey === 'string' && raw.apiKey.trim().length > 0;
    if (hasApiKey) {
      const ok = window.confirm('检测到导入文件包含 API Key。为安全起见，确认继续导入吗？');
      if (!ok) {
        el.settingsStatus.textContent = '已取消导入（检测到 API Key）';
        setConnection('导入已取消', 'error');
        return;
      }
    }
    const s = normalizeSettings(raw);
    applySettings(s);
    saveSettings(s);
    el.settingsStatus.textContent = '设置导入成功并已保存';
    setConnection('未测试');
    await fetchOllamaModels();
  } catch {
    el.settingsStatus.textContent = '导入失败：文件格式不正确';
    setConnection('导入失败，请选择有效的 JSON 文件', 'error');
  }
}

// =========================
// V2：本地帮助弹窗 + 账号 + 文案库
// =========================
function openModal(modalEl) {
  if (!modalEl) return;
  modalEl.hidden = false;
}

function closeModal(modalEl) {
  if (!modalEl) return;
  modalEl.hidden = true;
}

function loadLocalAuth() {
  try {
    return JSON.parse(localStorage.getItem(CLOUD_AUTH_LOCAL_KEY) || 'null');
  } catch {
    return null;
  }
}

async function loadCurrentUser() {
  const sb = getSupabaseClient();
  if (!sb) {
    try {
      return JSON.parse(localStorage.getItem(CLOUD_AUTH_LOCAL_KEY) || 'null');
    } catch {
      return null;
    }
  }
  const { data } = await sb.auth.getUser();
  return data?.user || null;
}

function saveLocalAuth(user) {
  localStorage.setItem(CLOUD_AUTH_LOCAL_KEY, JSON.stringify(user));
}

function updateAuthStatus() {
  const text = appState.user ? `已登录：${appState.user.email}` : '未登录';
  if (el.authStatus) el.authStatus.textContent = text;
}

function setAuthMode(mode) {
  appState.authMode = mode;
  el.authLoginTab?.classList.toggle('is-active', mode === 'login');
  el.authSignupTab?.classList.toggle('is-active', mode === 'signup');
  if (el.authSubmitBtn) el.authSubmitBtn.textContent = mode === 'login' ? '登录' : '注册';
}

function loadLocalDrafts() {
  try {
    const raw = localStorage.getItem(CLOUD_DRAFTS_LOCAL_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveLocalDrafts(list) {
  localStorage.setItem(CLOUD_DRAFTS_LOCAL_KEY, JSON.stringify(list));
}

function shortText(text = '') {
  const t = String(text).trim();
  return t.length > 20 ? `${t.slice(0, 20)}...` : t;
}

function renderLibraryList() {
  if (!el.libraryList) return;
  const items = appState.currentLibraryItems || [];

  if (!items.length) {
    el.libraryList.innerHTML = '<p class="library-empty">暂无记录。先美化一条文案并点击“保存到云空间”吧。</p>';
    return;
  }

  el.libraryList.innerHTML = items
    .sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at))
    .map((item) => {
      const id = item.id;
      const input = item.input ?? item.input_text ?? '';
      const output = item.output ?? item.output_text ?? '';
      const createdAt = item.createdAt ?? item.created_at;
      return `
      <article class="library-item" data-id="${id}">
        <div class="library-item-meta">${new Date(createdAt).toLocaleString()}</div>
        <div>原文：${shortText(input)}</div>
        <div>美化：${shortText(output)}</div>
        <div class="library-item-actions">
          <button class="ghost-btn" type="button" data-action="view" data-id="${id}">查看</button>
          <button class="ghost-btn" type="button" data-action="copy" data-id="${id}">复制</button>
          <button class="ghost-btn" type="button" data-action="delete" data-id="${id}">删除</button>
        </div>
      </article>
    `;
    }).join('');
}

async function refreshLibraryData() {
  const client = getSupabaseClient();

  if (!client) {
    const all = loadLocalDrafts();
    appState.currentLibraryItems = appState.libraryTab === 'team'
      ? all.filter((x) => x.isPublic)
      : all.filter((x) => !appState.user || x.owner === appState.user.email);
    renderLibraryList();
    return;
  }

  if (!appState.user) {
    appState.currentLibraryItems = [];
    renderLibraryList();
    return;
  }

  const query = appState.libraryTab === 'team'
    ? client.from('copy_drafts').select('*').eq('is_shared', true).order('created_at', { ascending: false })
    : client.from('copy_drafts').select('*').eq('user_id', appState.user.id).order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) {
    showError(`读取文案失败：${error.message}`);
    return;
  }

  appState.currentLibraryItems = data || [];
  renderLibraryList();
}
async function saveCurrentDraftToCloud() {
  const input = el.inputText.value.trim();
  const output = el.outputText.value.trim();
  if (!input || !output) {
    showError('请先生成美化结果，再保存到云空间。');
    return;
  }
  if (!appState.user) {
    showError('请先登录，再保存到云空间。');
    openModal(el.authModal);
    return;
  }

  const client = getSupabaseClient();
  if (!client) {
    const list = loadLocalDrafts();
    list.push({
      id: `draft_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
      owner: appState.user.email,
      input,
      output,
      isPublic: true,
      createdAt: new Date().toISOString()
    });
    saveLocalDrafts(list);
    el.appStatus.textContent = '已保存到云空间（本地模拟）';
    await refreshLibraryData();
    return;
  }

  const { error } = await client.from('copy_drafts').insert({
    user_id: appState.user.id,
    user_email: appState.user.email,
    input_text: input,
    output_text: output,
    is_shared: true
  });

  if (error) {
    showError(`云空间保存失败：${error.message}`);
    return;
  }

  el.appStatus.textContent = '已保存到云空间';
  await refreshLibraryData();
}
async function handleAuthSubmit() {
  const email = el.authEmailInput?.value.trim();
  const password = el.authPasswordInput?.value.trim();
  if (!email || !password) {
    if (el.authStatus) el.authStatus.textContent = '请填写邮箱和密码';
    return;
  }

  const client = getSupabaseClient();
  if (!client) {
    const user = { email, loggedAt: new Date().toISOString() };
    appState.user = user;
    saveLocalAuth(user);
    updateAuthStatus();
    if (el.authStatus) el.authStatus.textContent = appState.authMode === 'login' ? '登录成功（本地模拟）' : '注册成功（本地模拟）';
    closeModal(el.authModal);
    await refreshLibraryData();
    return;
  }

  if (appState.authMode === 'signup') {
    const { error } = await client.auth.signUp({ email, password });
    if (el.authStatus) el.authStatus.textContent = error ? `注册失败：${error.message}` : '注册成功，请先邮箱验证，再登录';
    return;
  }

  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    if (el.authStatus) el.authStatus.textContent = `登录失败：${error.message}`;
    return;
  }

  appState.user = await loadCurrentUser();
  updateAuthStatus();
  if (el.authStatus) el.authStatus.textContent = '登录成功';
  closeModal(el.authModal);
  await refreshLibraryData();
}
async function handleLibraryActionClick(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const action = target.getAttribute('data-action');
  const id = target.getAttribute('data-id');
  if (!action || !id) return;

  const item = (appState.currentLibraryItems || []).find((x) => String(x.id) === String(id));
  if (!item) return;

  const input = item.input ?? item.input_text ?? '';
  const output = item.output ?? item.output_text ?? '';

  if (action === 'view') {
    el.inputText.value = input;
    el.outputText.value = output;
    el.libraryDrawer.hidden = true;
    el.appStatus.textContent = '已载入文案记录';
    return;
  }

  if (action === 'copy') {
    navigator.clipboard.writeText(output || '').then(() => {
      el.appStatus.textContent = '文案已复制';
    }).catch(() => {
      showError('复制失败，请手动复制。');
    });
    return;
  }

  if (action === 'delete') {
    const client = getSupabaseClient();
    if (!client) {
      const next = loadLocalDrafts().filter((x) => String(x.id) !== String(id));
      saveLocalDrafts(next);
      await refreshLibraryData();
      el.appStatus.textContent = '记录已删除';
      return;
    }

    const { error } = await client.from('copy_drafts').delete().eq('id', id);
    if (error) {
      showError(`删除失败：${error.message}`);
      return;
    }

    await refreshLibraryData();
    el.appStatus.textContent = '记录已删除';
  }
}
// 事件
el.openSettingsBtn.addEventListener('click', async () => {
  openSettings();
  await fetchOllamaModels();
});
el.closeSettingsBtn.addEventListener('click', closeSettings);
el.settingsModal.addEventListener('click', (e) => {
  if (e.target === el.settingsModal) closeSettings();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !el.settingsModal.hidden) closeSettings();
  if (e.key === 'Escape' && el.ollamaHelpModal && !el.ollamaHelpModal.hidden) closeModal(el.ollamaHelpModal);
  if (e.key === 'Escape' && el.authModal && !el.authModal.hidden) closeModal(el.authModal);
  if (e.key === 'Escape' && el.libraryDrawer && !el.libraryDrawer.hidden) el.libraryDrawer.hidden = true;
});

el.modeSelect.addEventListener('change', () => renderMode(el.modeSelect.value));
el.ollamaUrlInput.addEventListener('blur', fetchOllamaModels);

el.saveSettingsBtn.addEventListener('click', () => {
  saveSettings(collectSettings());
  el.settingsStatus.textContent = '已保存到本地浏览器';
  el.appStatus.textContent = '设置已保存（LocalStorage）';
});

el.testCloudBtn.addEventListener('click', testCloud);
el.testOllamaBtn.addEventListener('click', testOllama);
el.exportSettingsBtn.addEventListener('click', exportSettings);
el.importSettingsBtn.addEventListener('click', () => el.importSettingsInput.click());
el.importSettingsInput.addEventListener('change', async () => {
  await importSettings(el.importSettingsInput.files?.[0]);
  el.importSettingsInput.value = '';
});

el.beautifyBtn.addEventListener('click', async () => {
  const draft = el.inputText.value.trim();
  if (!draft) return showError('你还没粘贴草稿内容，先把文案贴到上面的输入框吧。');

  const s = collectSettings();
  saveSettings(s);
  setLoading(true);
  showMessage('');

  try {
    const result = s.mode === 'cloud' ? await cloudChat(draft, s) : await ollamaChat(draft, s);
    showMessage(result);
    el.appStatus.textContent = '美化完成';
  } catch (e) {
    showError(`网络好像开小差了，检查一下设置是否正确：${e.message}`);
    el.appStatus.textContent = '美化失败';
  } finally {
    setLoading(false);
  }
});

el.copyBtn.addEventListener('click', async () => {
  if (!el.outputText.value.trim()) return showError('现在还没有可复制的内容，先生成一版文案再试试。');
  try {
    await navigator.clipboard.writeText(el.outputText.value);
    el.appStatus.textContent = '结果已复制';
    el.errorMessage.hidden = true;
  } catch {
    showError('复制失败了，可能是浏览器暂时不允许，请手动复制一下。');
  }
});

// V2 事件：Ollama 使用帮助
el.openOllamaHelpBtn?.addEventListener('click', () => openModal(el.ollamaHelpModal));
el.closeOllamaHelpBtn?.addEventListener('click', () => closeModal(el.ollamaHelpModal));
el.ollamaHelpModal?.addEventListener('click', (e) => {
  if (e.target === el.ollamaHelpModal) closeModal(el.ollamaHelpModal);
});

// V2 事件：登录/注册
el.openAuthBtn?.addEventListener('click', () => openModal(el.authModal));
el.closeAuthBtn?.addEventListener('click', () => closeModal(el.authModal));
el.authModal?.addEventListener('click', (e) => {
  if (e.target === el.authModal) closeModal(el.authModal);
});
el.authLoginTab?.addEventListener('click', () => setAuthMode('login'));
el.authSignupTab?.addEventListener('click', () => setAuthMode('signup'));
el.authSubmitBtn?.addEventListener('click', handleAuthSubmit);

// V2 事件：文案库
el.openLibraryBtn?.addEventListener('click', async () => {
  el.libraryDrawer.hidden = false;
  await refreshLibraryData();
});
el.closeLibraryBtn?.addEventListener('click', () => {
  el.libraryDrawer.hidden = true;
});
el.myDraftsTab?.addEventListener('click', async () => {
  appState.libraryTab = 'mine';
  el.myDraftsTab.classList.add('is-active');
  el.teamDraftsTab.classList.remove('is-active');
  await refreshLibraryData();
});
el.teamDraftsTab?.addEventListener('click', async () => {
  appState.libraryTab = 'team';
  el.teamDraftsTab.classList.add('is-active');
  el.myDraftsTab.classList.remove('is-active');
  await refreshLibraryData();
});
el.libraryList?.addEventListener('click', handleLibraryActionClick);
el.saveCloudBtn?.addEventListener('click', saveCurrentDraftToCloud);

(async () => {
  const s = loadSettings();
  applySettings(s);
  el.settingsStatus.textContent = '已读取本地设置';
  setConnection('未测试');
  await fetchOllamaModels();
  await refreshLibraryData();
})();
