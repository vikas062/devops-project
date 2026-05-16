// leetcode.js - CodeCanon LeetCode Content Script

const getProblemSlug = () => {
  const match = window.location.pathname.match(/\/problems\/([^/]+)/);
  return match ? match[1] : null;
};

// Inject into page context to read LeetCode's internal state
const injectScript = () => {
  const script = document.createElement('script');
  script.textContent = `
    (function() {
      let attempts = 0;
      const tryGetUser = () => {
        attempts++;
        const user = window.leetcodeConfig?.userName
          || window.__INITIAL_STATE__?.user?.username
          || document.querySelector('a[href^="/u/"]')?.getAttribute('href')?.split('/')[2];
        if (user) {
          window.postMessage({ type: "CC_LC_USER", username: user }, "*");
        } else if (attempts < 10) {
          setTimeout(tryGetUser, 800);
        }
      };
      tryGetUser();
    })();
  `;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
};

let cachedHandle = null;

window.addEventListener("message", (event) => {
  if (event.source === window && event.data?.type === "CC_LC_USER" && event.data.username) {
    cachedHandle = event.data.username;
  }
});

injectScript();

const getHandle = () => {
  if (cachedHandle) return cachedHandle;
  // Fallback: read from nav link
  return document.querySelector("a[href^='/u/']")?.getAttribute("href")?.split("/")[2] || null;
};

const getProblemTitle = () => {
  // Prefer specific LeetCode title selectors
  const selectors = [
    "a[href*='/problems/'] div.text-title-large",
    ".text-title-large a",
    ".text-title-large",
    "[data-cy='question-title']",
    ".css-v3d350",
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el?.textContent?.trim()) {
      return el.textContent.replace(/^\d+\.\s*/, "").trim();
    }
  }
  // Fallback: parse document.title ("1. Two Sum - LeetCode" → "Two Sum")
  if (document.title) {
    return document.title.split(" - ")[0].replace(/^\d+\.\s*/, "").trim();
  }
  return null;
};

// FIXED: Precise accepted detection — only triggers on the submission result page
const hasAccepted = () => {
  // Method 1: Check for specific submission result container
  const resultStatus = document.querySelector(
    "[data-e2e-locator='submission-result'], .text-green-s, [class*='accepted']"
  );
  if (resultStatus) {
    const text = resultStatus.textContent?.trim().toLowerCase();
    if (text === "accepted") return true;
  }

  // Method 2: Check the result header text specifically (not body-wide)
  const resultContainers = document.querySelectorAll(
    "[class*='result'], [class*='submission-result'], [class*='SuccessView']"
  );
  for (const el of resultContainers) {
    if (el.children.length <= 5) { // Narrow scope
      const text = el.textContent.trim().toLowerCase();
      if (text.startsWith("accepted")) return true;
    }
  }

  // Method 3: URL changed to /submissions/ with accepted state
  if (window.location.pathname.includes("/submissions/")) {
    const successEl = document.querySelector(".text-green-s, [data-status='Accepted']");
    if (successEl) return true;
  }

  return false;
};

const hasAlreadySolved = () => {
  // Green checkmark SVG on problem page
  const greenCheck = document.querySelector(
    "svg.text-brand-orange, svg.text-green-s, [class*='checkmark'][class*='green'], [class*='solved']"
  );
  return !!greenCheck;
};

const updatePopup = (accepted) => {
  if (typeof chrome === "undefined" || !chrome.runtime) return;
  try {
    chrome.runtime.sendMessage({
      type: "UPDATE_POPUP",
      payload: {
        platform: "LeetCode",
        questionTitle: getProblemTitle(),
        problemSlug: getProblemSlug(),
        detectedAt: new Date().toISOString(),
        accepted: Boolean(accepted)
      }
    });
  } catch (e) {}
};

const sendSolve = () => {
  const title = getProblemTitle();
  const slug = getProblemSlug();
  if (!title) return;

  const key = `cc_lc_${slug || title}`;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, "1");

  updatePopup(true);

  try {
    chrome.runtime.sendMessage({
      type: "SOLVE_DETECTED",
      payload: {
        platform: "LeetCode",
        questionTitle: title,
        problemSlug: slug,
        handle: getHandle(),
        accepted: true,
        detectedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.warn("CodeCanon: Extension context invalidated.");
  }
};

let initialCheckDone = false;
let solveAlreadySent = false;

const intervalId = setInterval(() => {
  if (typeof chrome === "undefined" || !chrome.runtime?.id) {
    clearInterval(intervalId);
    return;
  }

  if (solveAlreadySent) return; // Stop polling after first send

  const accepted = hasAccepted();
  const alreadySolved = !initialCheckDone && hasAlreadySolved();

  if (accepted || alreadySolved) {
    if (alreadySolved) {
      console.log("CodeCanon [LeetCode]: Previously solved — syncing retroactively.");
      initialCheckDone = true;
    } else {
      console.log("CodeCanon [LeetCode]: New Accepted submission detected!");
    }
    sendSolve();
    solveAlreadySent = true;
  } else {
    if (getProblemSlug()) {
      updatePopup(false);
      if (document.readyState === "complete") initialCheckDone = true;
    }
  }
}, 2000);