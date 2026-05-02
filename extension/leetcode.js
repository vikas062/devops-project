// leetcode.js - Fixed for auto detection and submission
const API_URL = "http://localhost:5000/api/solve";

const getProblemSlug = () => {
  const match = window.location.pathname.match(/problems\/([^/]+)/);
  return match ? match[1] : null;
};

// 1. Inject script to access page variables (window.leetcodeConfig)
const injectScript = () => {
  const script = document.createElement('script');
  script.textContent = `
    setTimeout(() => {
      const user = window.leetcodeConfig?.userName || window.__INITIAL_STATE__?.user?.username;
      window.postMessage({ type: "CC_USER_INFO", username: user }, "*");
    }, 1000); // Wait a bit for LeetCode to init
  `;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
};

let cachedHandle = null;

// 2. Listen for the handle
window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (event.data.type === "CC_USER_INFO" && event.data.username) {
    cachedHandle = event.data.username;
  }
});

injectScript();

const getHandle = () => {
  if (cachedHandle) return cachedHandle;
  return document.querySelector("a[href^='/u/']")?.getAttribute("href")?.split("/")[2] || null;
};

const getProblemTitle = () => {
  const titleEl = document.querySelector(".text-title-large") || document.querySelector("[data-cy='question-title']") || document.querySelector("h1");
  if (titleEl) {
    return titleEl.textContent.replace(/^\d+\.\s*/, "").trim();
  }
  if (document.title) {
    return document.title.split(" - ")[0].replace(/^\d+\.\s*/, "").trim();
  }
  return null;
};

const hasAccepted = () => {
  const bodyText = document.body?.innerText.toLowerCase() || "";
  return bodyText.includes("accepted") || bodyText.includes("success") || bodyText.includes("details") && bodyText.includes("runtime");
};

const hasAlreadySolved = () => {
  try {
    const tick = document.querySelector("svg.text-brand-orange");
    const tick2 = document.querySelector("svg.text-green-s");
    if (tick || tick2) return true;
  } catch (e) { }

  const bodyText = document.body?.innerText.toLowerCase() || "";
  return bodyText.includes("solved") || bodyText.includes("you have solved this problem");
};

const updatePopup = (accepted) => {
  if (typeof chrome === "undefined" || !chrome.runtime) return;
  const payload = {
    platform: "LeetCode",
    questionTitle: getProblemTitle(),
    problemSlug: getProblemSlug(),
    detectedAt: new Date().toISOString(),
    accepted: Boolean(accepted)
  };
  try {
    chrome.runtime.sendMessage({ type: "UPDATE_POPUP", payload });
  } catch (e) { }
};

const sendSolve = async () => {
  const payload = {
    platform: "LeetCode",
    questionTitle: getProblemTitle(),
    problemSlug: getProblemSlug(),
    handle: getHandle(),
    accepted: true,
    detectedAt: new Date().toISOString()
  };

  if (!payload.questionTitle) return;

  updatePopup(true);

  const key = `cc_leetcode_${payload.problemSlug || payload.questionTitle}`;
  if (sessionStorage.getItem(key)) return;

  try {
    chrome.runtime.sendMessage({
      type: "SOLVE_DETECTED",
      payload
    });
    sessionStorage.setItem(key, "1");
  } catch (err) {
    console.warn("CodeCanon: Extension context invalidated. Please reload the page.");
  }
};

let initialCheckDone = false;

const intervalId = setInterval(() => {
  if (typeof chrome === "undefined" || !chrome.runtime || !chrome.runtime.id) {
    clearInterval(intervalId);
    return;
  }
  const accepted = hasAccepted();
  const alreadySolved = !initialCheckDone && hasAlreadySolved();

  if (accepted || alreadySolved) {
    if (alreadySolved) {
      console.log("CodeCanon: LeetCode problem was already previously solved! Syncing retroactively.");
      initialCheckDone = true;
    } else {
      console.log("CodeCanon: 'Accepted' detected in LeetCode from new submission!");
    }
    sendSolve();
  } else {
    if (getProblemSlug()) {
      updatePopup(false);
      if (document.readyState === "complete") {
        initialCheckDone = true;
      }
    }
  }
}, 2000);