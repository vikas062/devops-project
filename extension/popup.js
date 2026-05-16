// popup.js — CodeCanon Extension Popup

const $ = id => document.getElementById(id);

// ── View toggle ──
const showAuthView = () => {
  $("auth-view").style.display = "block";
  $("main-view").style.display = "none";
};
const showMainView = (username) => {
  $("auth-view").style.display = "none";
  $("main-view").style.display = "block";
  if (username) $("user-badge").textContent = `@${username}`;
};

// ── Load stored API base & set select ──
const loadApiBase = async () => {
  const { cc_api_base } = await chrome.storage.local.get("cc_api_base");
  const select = $("api-select");
  if (select && cc_api_base) {
    for (const opt of select.options) {
      if (opt.value === cc_api_base) { opt.selected = true; break; }
    }
  }
};

// ── Login ──
$("login-btn").addEventListener("click", async () => {
  const emailOrUser = $("login-email").value.trim();
  const password = $("login-password").value;
  const errEl = $("login-error");
  const btn = $("login-btn");

  if (!emailOrUser || !password) {
    errEl.textContent = "Please fill in both fields.";
    errEl.style.display = "block";
    return;
  }

  btn.textContent = "Logging in...";
  btn.disabled = true;
  errEl.style.display = "none";

  const { cc_api_base } = await chrome.storage.local.get("cc_api_base");
  const apiBase = cc_api_base || "https://dsa-compass-server.onrender.com/api";

  try {
    const res = await fetch(`${apiBase}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailOrUser, password })
    });
    const data = await res.json();

    if (res.ok && data.token) {
      await chrome.storage.local.set({
        cc_token: data.token,
        cc_username: data.user?.username || emailOrUser
      });
      showMainView(data.user?.username || emailOrUser);
      loadDetection();
    } else {
      errEl.textContent = data.message || "Login failed. Check credentials.";
      errEl.style.display = "block";
    }
  } catch (err) {
    errEl.textContent = "Network error. Is the server reachable?";
    errEl.style.display = "block";
  } finally {
    btn.textContent = "Login";
    btn.disabled = false;
  }
});

// ── API Base toggle ──
$("api-select").addEventListener("change", async (e) => {
  await chrome.storage.local.set({ cc_api_base: e.target.value });
  chrome.runtime.sendMessage({ type: "SET_API_BASE", base: e.target.value });
});

// ── Logout ──
$("logout-btn").addEventListener("click", async () => {
  await chrome.storage.local.remove(["cc_token", "cc_username", "cc_last_detection"]);
  showAuthView();
});

// ── Clear detection ──
$("clear").addEventListener("click", async () => {
  await chrome.storage.local.remove("cc_last_detection");
  updateDetectionUI(null);
});

// ── Debug ──
$("debug").addEventListener("click", async () => {
  const stored = await chrome.storage.local.get(null);
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  alert(JSON.stringify({
    token: stored.cc_token ? "✓ Set" : "✗ Missing",
    username: stored.cc_username,
    api_base: stored.cc_api_base,
    last_detection: stored.cc_last_detection,
    currentTab: tab?.url
  }, null, 2));
});

// ── Detection display ──
const updateDetectionUI = (data) => {
  if (!data) {
    $("question-title").textContent = "No question detected yet";
    $("platform").textContent = "—";
    $("slug").textContent = "—";
    $("signal").textContent = "Idle";
    $("detected-at").textContent = "—";
    $("status").textContent = "Listening...";
    $("status").className = "status-bar";
    return;
  }

  $("question-title").textContent = data.questionTitle || "Untitled";
  $("platform").textContent = data.platform || "—";
  $("slug").textContent = data.problemSlug ? `/${data.problemSlug}` : "—";
  $("signal").textContent = data.accepted ? "✅ Accepted" : "⏳ Pending";
  $("detected-at").textContent = data.detectedAt ? new Date(data.detectedAt).toLocaleTimeString() : "—";

  const statusEl = $("status");
  if (data.syncStatus === "success") {
    statusEl.textContent = "✓ Synced to dashboard!";
    statusEl.className = "status-bar success";
  } else if (data.syncStatus === "error") {
    statusEl.textContent = "✗ " + (data.syncMessage || "Sync failed");
    statusEl.className = "status-bar error";
  } else if (data.syncStatus === "loading") {
    statusEl.textContent = "⟳ Syncing...";
    statusEl.className = "status-bar loading";
  } else {
    statusEl.textContent = "Detected — awaiting submission result";
    statusEl.className = "status-bar";
  }
};

const loadDetection = async () => {
  const { cc_last_detection } = await chrome.storage.local.get("cc_last_detection");
  updateDetectionUI(cc_last_detection || null);
};

// ── Init ──
(async () => {
  await loadApiBase();

  const { cc_token, cc_username } = await chrome.storage.local.get(["cc_token", "cc_username"]);
  if (cc_token) {
    showMainView(cc_username);
    await loadDetection();
  } else {
    showAuthView();
  }
})();
