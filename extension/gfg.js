// gfg.js - CodeCanon GFG Content Script

const getProblemSlug = () => {
  const match = window.location.pathname.match(/\/problems?\/([^/]+)/);
  return match ? match[1] : null;
};

const getProblemTitle = () => {
  // GFG title patterns:  "Problem Name | Practice | GeeksforGeeks"
  if (document.title && document.title.includes("|")) {
    return document.title.split("|")[0].trim();
  }
  const el = document.querySelector(
    ".problems_header_content__title__L2cR2, .problem-tab__title, h1.problems_header_content__title__L2cR2, h3.problems_header_content__title__L2cR2, h1"
  );
  if (el?.textContent?.trim()) return el.textContent.trim();
  return getProblemSlug()?.replace(/-/g, " ") || null;
};

const getHandle = () => {
  // GFG profile link pattern: /user/username
  const link = document.querySelector("a[href*='/user/']");
  if (link) {
    const m = link.getAttribute("href").match(/\/user\/([^/?#]+)/);
    if (m) return m[1];
  }
  return null;
};

const hasAccepted = () => {
  const bodyText = document.body ? document.body.innerText.toLowerCase() : "";
  if (bodyText.includes("problem solved successfully") || 
      bodyText.includes("correct answer") || 
      (bodyText.includes("execution time") && bodyText.includes("correct"))) {
    return true;
  }

  const successEls = document.querySelectorAll("[class*='success'], [class*='correct'], [class*='solved']");
  for (const el of successEls) {
    const text = el.textContent.trim().toLowerCase();
    if (text.includes("correct") || text.includes("solved")) return true;
  }
  return false;
};

const hasAlreadySolved = () => {
  const bodyText = document.body ? document.body.innerText.toLowerCase() : "";
  if (bodyText.includes("problem solved successfully")) return true;
  
  return !!(
    document.querySelector(".problems_header_content__solved__L2cR2") ||
    document.querySelector("[class*='solved'][class*='badge']") ||
    document.querySelector("[class*='check'][class*='green']") ||
    document.querySelector(".header-content__solved") ||
    document.querySelector("svg[color='green']")
  );
};

const updatePopup = (accepted) => {
  if (typeof chrome === "undefined" || !chrome.runtime) return;
  try {
    chrome.runtime.sendMessage({
      type: "UPDATE_POPUP",
      payload: {
        platform: "GFG",
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

  const key = `cc_gfg_${slug || title}`;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, "1");

  updatePopup(true);

  try {
    chrome.runtime.sendMessage({
      type: "SOLVE_DETECTED",
      payload: {
        platform: "GFG",
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
  if (solveAlreadySent) return;

  const accepted = hasAccepted();
  const alreadySolved = !initialCheckDone && hasAlreadySolved();

  if (accepted || alreadySolved) {
    if (alreadySolved) {
      console.log("CodeCanon [GFG]: Previously solved — syncing retroactively.");
      initialCheckDone = true;
    } else {
      console.log("CodeCanon [GFG]: New accepted submission detected!");
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