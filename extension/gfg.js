// gfg.js - Fixed for auto detection and submission
const API_URL = "http://localhost:5000/api/solve";

const getProblemTitle = () => {
  // GFG structure changes often, document title is most reliable fallback
  // Format: "Problem Name | Practice | GeeksforGeeks"
  if (document.title && document.title.includes("|")) {
    return document.title.split("|")[0].trim();
  }

  const titleEl = document.querySelector(".problem-title") || document.querySelector("h3");
  if (titleEl) return titleEl.textContent.trim();

  return null;
};

const getProblemSlug = () => {
  const match = window.location.pathname.match(/problems\/([^/]+)/);
  return match ? match[1] : null;
};

const getHandle = () => {
  const profile = document.querySelector("a[href*='user/']");
  if (profile) {
    const match = profile.getAttribute("href").match(/user\/([^/]+)/);
    return match ? match[1] : null;
  }
  return null;
};

const hasAccepted = () => {
  // Check for success indicators
  const successEls = document.querySelectorAll(".alert-success, .success-message, [data-cy='success']");
  for (let el of successEls) {
    const text = el.textContent.toLowerCase();
    if (text.includes("accepted") || text.includes("correct") || text.includes("success")) return true;
  }
  return false;
};

const hasAlreadySolved = () => {
  // Check if problem is already solved (e.g., "You have solved this problem" or green checkmark)
  const solvedEls = document.querySelectorAll(".solved-indicator, .green-check");
  return solvedEls.length > 0;
};

const updatePopup = (accepted) => {
  if (typeof chrome === "undefined" || !chrome.runtime) return;

  try {
    const payload = {
      platform: "GFG",
      questionTitle: getProblemTitle(),
      problemSlug: getProblemSlug(),
      detectedAt: new Date().toISOString(),
      accepted: Boolean(accepted)
    };
    chrome.runtime.sendMessage({ type: "UPDATE_POPUP", payload });
  } catch (err) {
    console.warn("CodeCanon: Failed to update popup state.", err);
  }
};

const sendSolve = async () => {
  const payload = {
    platform: "GFG",
    questionTitle: getProblemTitle(),
    problemSlug: getProblemSlug(),
    handle: getHandle(),
    accepted: true, // Since we detected success
    detectedAt: new Date().toISOString()
  };

  if (!payload.questionTitle) return;

  updatePopup(true);

  const key = `cc_gfg_${payload.problemSlug || payload.questionTitle}`;
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
      console.log("CodeCanon: GFG problem was already previously solved! Syncing retroactively.");
      initialCheckDone = true;
    } else {
      console.log("CodeCanon: Success detected in GFG from new submission!");
    }
    sendSolve();
  } else {
    // Only update to false if we have a problem loaded
    if (getProblemSlug()) {
      updatePopup(false);
      if (document.readyState === "complete") {
        initialCheckDone = true;
      }
    }
  }
}, 2000);