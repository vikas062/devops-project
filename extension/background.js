// background.js — CodeCanon Extension Background Worker

// Detect API URL: use production if not dev
const API_BASE = "https://dsa-compass-server.onrender.com/api";
const LOCAL_BASE = "http://localhost:5000/api";

// Get stored token from chrome.storage.local
const getToken = () =>
  new Promise(resolve =>
    chrome.storage.local.get("cc_token", ({ cc_token }) => resolve(cc_token || null))
  );

// Get stored API base (user may override to local)
const getApiBase = () =>
  new Promise(resolve =>
    chrome.storage.local.get("cc_api_base", ({ cc_api_base }) => resolve(cc_api_base || API_BASE))
  );

// Simple DSA category guesser from title
function getCategory(title) {
  if (!title) return "Other";
  title = title.toLowerCase();
  if (title.includes("stack") || title.includes("parenthes")) return "Stack";
  if (title.includes("tree") || title.includes("traversal") || title.includes("bst")) return "Tree";
  if (title.includes("graph") || title.includes("bfs") || title.includes("dfs")) return "Graph";
  if (title.includes("dp") || title.includes("dynamic programming") || title.includes("knapsack")) return "DP";
  if (title.includes("array") || title.includes("sort") || title.includes("binary search")) return "Array";
  if (title.includes("string") || title.includes("palindrome") || title.includes("anagram")) return "String";
  if (title.includes("link") || title.includes("node") || title.includes("list")) return "LinkedList";
  if (title.includes("heap") || title.includes("priority")) return "Heap";
  return "Other";
}

// Main message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  // ── SOLVE_DETECTED: Extension detected an accepted submission ──
  if (message.type === "SOLVE_DETECTED") {
    (async () => {
      const payload = { ...message.payload };
      console.log("CodeCanon: SOLVE_DETECTED", payload);

      payload.category = getCategory(payload.questionTitle || "");
      payload.syncStatus = "loading";
      await chrome.storage.local.set({ cc_last_detection: payload });

      // Notify tab immediately so toast shows loading
      if (sender.tab?.id) {
        chrome.tabs.sendMessage(sender.tab.id, { type: "SOLVE_STATUS", status: "LOADING" }).catch(() => {});
      }

      const token = await getToken();
      const apiBase = await getApiBase();

      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      try {
        const response = await fetch(`${apiBase}/solve`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
          console.log("CodeCanon: Solve synced ✓", data);
          payload.syncStatus = "success";
          payload.syncMessage = "Synced to dashboard!";
          await chrome.storage.local.set({ cc_last_detection: payload });
          if (sender.tab?.id) {
            chrome.tabs.sendMessage(sender.tab.id, { type: "SOLVE_STATUS", status: "SUCCESS", data }).catch(() => {});
          }
        } else if (response.status === 401 || response.status === 403) {
          console.warn("CodeCanon: Not authenticated. Ask user to login via popup.");
          payload.syncStatus = "error";
          payload.syncMessage = "Login to CodeCanon to sync solves.";
          await chrome.storage.local.set({ cc_last_detection: payload });
          if (sender.tab?.id) {
            chrome.tabs.sendMessage(sender.tab.id, { type: "SOLVE_STATUS", status: "AUTH_REQUIRED" }).catch(() => {});
          }
        } else if (response.status === 404) {
          console.warn("CodeCanon: Question not in canonical library.", data);
          payload.syncStatus = "error";
          payload.syncMessage = data.message || "Question not tracked yet.";
          await chrome.storage.local.set({ cc_last_detection: payload });
          if (sender.tab?.id) {
            chrome.tabs.sendMessage(sender.tab.id, { type: "SOLVE_STATUS", status: "NOT_TRACKED", message: data.message }).catch(() => {});
          }
        } else {
          payload.syncStatus = "error";
          payload.syncMessage = data.message || "Server error";
          await chrome.storage.local.set({ cc_last_detection: payload });
          if (sender.tab?.id) {
            chrome.tabs.sendMessage(sender.tab.id, { type: "SOLVE_STATUS", status: "ERROR", message: data.message }).catch(() => {});
          }
        }
      } catch (err) {
        console.warn("CodeCanon: Network error", err.message);
        payload.syncStatus = "error";
        payload.syncMessage = "Network error. Is the server running?";
        await chrome.storage.local.set({ cc_last_detection: payload });
        if (sender.tab?.id) {
          chrome.tabs.sendMessage(sender.tab.id, { type: "SOLVE_STATUS", status: "ERROR", message: "Network error" }).catch(() => {});
        }
      }

      sendResponse({ ok: true });
    })();

    return true; // Keep message channel open for async
  }

  // ── UPDATE_POPUP: Content script updating popup state ──
  if (message.type === "UPDATE_POPUP") {
    chrome.storage.local.set({ cc_last_detection: message.payload });
    sendResponse({ ok: true });
    return false;
  }

  // ── SET_TOKEN: Webapp sends token when user logs in ──
  // The webapp's frontend can trigger this via a content script on login page,
  // OR popup.js handles login directly.
  if (message.type === "SET_TOKEN") {
    chrome.storage.local.set({ cc_token: message.token }, () => {
      console.log("CodeCanon: Token saved from webapp.");
      sendResponse({ ok: true });
    });
    return true;
  }

  // ── CLEAR_TOKEN: Logout ──
  if (message.type === "CLEAR_TOKEN") {
    chrome.storage.local.remove(["cc_token", "cc_last_detection"], () => {
      sendResponse({ ok: true });
    });
    return true;
  }

  // ── SET_API_BASE: Switch between local/prod ──
  if (message.type === "SET_API_BASE") {
    chrome.storage.local.set({ cc_api_base: message.base }, () => {
      sendResponse({ ok: true });
    });
    return true;
  }
});
