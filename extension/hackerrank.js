// hackerrank.js - Fixed for auto detection and submission
const API_URL = "http://localhost:5000/api/solve";

const getProblemTitle = () => {
  const titleEl = document.querySelector("h1") || document.querySelector(".challenge-name") || document.querySelector(".challenge-title");
  let title = titleEl ? titleEl.textContent.trim() : "";
  if (!title && document.title) {
    title = document.title.split("|")[0].replace("Solve", "").trim();
  }
  return title || getProblemSlug();
};

const getProblemSlug = () => {
  const match = window.location.pathname.match(/challenges\/([^/]+)/);
  return match ? match[1] : null;
};

const getHandle = () => {
  const profile = document.querySelector("a[data-analytics='NavBarProfile']") || document.querySelector("a[href*='/profile/']");
  if (profile) {
    const match = profile.getAttribute("href").match(/profile\/([^/]+)/);
    return match ? match[1] : null;
  }
  return null;
};

const hasAccepted = () => {
  // Check for success indicators specifically in HackerRank's submission UI
  if (document.querySelector(".success-indicator") || document.querySelector(".congratulations")) return true;

  const statusEls = document.querySelectorAll(".testcase-status, .status-title, .status");
  for (let el of statusEls) {
    const text = el.textContent.trim().toLowerCase();
    if (text === "accepted" || text === "success") {
      if (window.getComputedStyle(el).color.includes("rgb(0, 128, 0)") || window.getComputedStyle(el).color.includes("green") || el.classList.toString().includes("success")) {
        return true;
      }
    }
  }
  return false;
};

const hasAlreadySolved = () => {
  // HackerRank solved badges
  if (document.querySelector(".solved-badge") || document.querySelector(".ui-icon-check")) {
    return true;
  }

  const spanEls = document.querySelectorAll("span, p, div");
  for (let el of spanEls) {
    if (el.children.length === 0 && el.textContent.trim().toLowerCase() === "solved") {
      // ensure it's a green status marker
      if (window.getComputedStyle(el).color.includes("rgb(0, ") || window.getComputedStyle(el).color.includes("green") || document.querySelector(".status-solved")) {
        return true;
      }
    }
  }
  return false;
};

const updatePopup = (accepted) => {
  if (typeof chrome === "undefined" || !chrome.runtime) return;
  const payload = {
    platform: "HackerRank",
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
    platform: "HackerRank",
    questionTitle: getProblemTitle(),
    problemSlug: getProblemSlug(),
    handle: getHandle(),
    accepted: true,
    detectedAt: new Date().toISOString()
  };

  if (!payload.questionTitle) return;

  updatePopup(true);

  const key = `cc_hackerrank_${payload.problemSlug || payload.questionTitle}`;
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
      console.log("CodeCanon: HackerRank problem was already previously solved! Syncing retroactively.");
      initialCheckDone = true;
    } else {
      console.log("CodeCanon: Success detected in HackerRank from new submission!");
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