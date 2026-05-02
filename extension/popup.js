// popup.js - Fixed for better status display
const titleEl = document.getElementById("question-title");
const platformEl = document.getElementById("platform");
const slugEl = document.getElementById("slug");
const signalEl = document.getElementById("signal");
const detectedAtEl = document.getElementById("detected-at");
const statusEl = document.getElementById("status");
const clearBtn = document.getElementById("clear");

const updateUI = (data) => {
  if (!data) {
    titleEl.textContent = "No question detected yet";
    platformEl.textContent = "—";
    slugEl.textContent = "—";
    signalEl.textContent = "Idle";
    detectedAtEl.textContent = "—";
    statusEl.textContent = "Listening";
    statusEl.style.color = "";
    return;
  }

  titleEl.textContent = data.questionTitle || "Untitled";
  platformEl.textContent = data.platform || "—";
  slugEl.textContent = data.problemSlug ? `/${data.problemSlug}` : "—";
  signalEl.textContent = data.accepted ? "Accepted" : "Pending";
  detectedAtEl.textContent = new Date(data.detectedAt).toLocaleTimeString() || "—";

  if (data.syncStatus === "success") {
    statusEl.textContent = "Synced to Dashboard ✓";
    statusEl.style.color = "#4ade80"; // green
  } else if (data.syncStatus === "error") {
    statusEl.textContent = "Sync Error: " + (data.syncMessage || "Unknown");
    statusEl.style.color = "#ef4444"; // red
  } else if (data.syncStatus === "loading") {
    statusEl.textContent = "Syncing to backend...";
    statusEl.style.color = "#fbbf24"; // yellow/orange
  } else {
    statusEl.textContent = "Detected";
    statusEl.style.color = "";
  }
};

const load = async () => {
  const { cc_last_detection } = await chrome.storage.local.get("cc_last_detection");
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url) {
    updateUI(null);
    return;
  }
  const url = tab.url.toLowerCase();

  let match = false;
  const platforms = ["leetcode", "codeforces", "codechef", "geeksforgeeks", "hackerrank", "atcoder", "spoj"];

  for (let platform of platforms) {
    if (url.includes(platform)) {
      match = true;
      break;
    }
  }

  if (match) {
    updateUI(cc_last_detection);
  } else {
    updateUI(null);
  }
};

clearBtn.addEventListener("click", async () => {
  await chrome.storage.local.remove("cc_last_detection");
  updateUI(null);
});

document.getElementById("debug").addEventListener("click", async () => {
  const { cc_last_detection } = await chrome.storage.local.get("cc_last_detection");
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  alert(JSON.stringify({
    stored: cc_last_detection,
    currentTab: tab ? { title: tab.title, url: tab.url } : "No Tab"
  }, null, 2));
});

load();
