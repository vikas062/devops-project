// atcoder.js - New for AtCoder
const API_URL = "http://localhost:5000/api/solve";

const getProblemTitle = () => {
    let titleEl = document.querySelector("h2") || document.querySelector(".contest-title");
    let title = titleEl ? titleEl.textContent.trim() : "";
    if (!title && document.title) {
        title = document.title.split(" - ")[1] || document.title;
        title = title.trim();
    }
    return title || getProblemSlug();
};

const getProblemSlug = () => {
    const match = window.location.pathname.match(/tasks\/([^/]+)/);
    return match ? match[1] : null;
};

const getHandle = () => {
    const profile = document.querySelector("a[href*='/user/']");
    if (profile) {
        const match = profile.getAttribute("href").match(/user\/([^/]+)/);
        return match ? match[1] : null;
    }
    return null;
};

const hasAccepted = () => {
    // AtCoder submissions table uses specific classes for verdicts
    const verdictEls = document.querySelectorAll(".label-success, td.text-center");
    for (let el of verdictEls) {
        if (el.textContent.trim() === "AC") {
            // Check if it's explicitly green
            if (el.classList.contains("label-success") || window.getComputedStyle(el).color.includes("rgba(92, 184, 92") || window.getComputedStyle(el).color.includes("green")) {
                return true;
            }
        }
    }
    return false;
};

const hasAlreadySolved = () => {
    // In AtCoder problem lists and tables, they usually put a green tag or label for solved.
    const successLabels = document.querySelectorAll("span.label-success, td");
    for (let el of successLabels) {
        if (el.textContent.trim() === "AC" && (el.classList.contains("label-success") || window.getComputedStyle(el).color.includes("rgba(92, 184, 92") || window.getComputedStyle(el).color.includes("green"))) {
            return true;
        }
    }
    return false;
};

const updatePopup = (accepted) => {
    if (typeof chrome === "undefined" || !chrome.runtime) return;
    const payload = {
        platform: "AtCoder",
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
        platform: "AtCoder",
        questionTitle: getProblemTitle(),
        problemSlug: getProblemSlug(),
        handle: getHandle(),
        accepted: true,
        detectedAt: new Date().toISOString()
    };

    if (!payload.questionTitle) return;

    updatePopup(true);

    const key = `cc_atcoder_${payload.problemSlug || payload.questionTitle}`;
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
            console.log("CodeCanon: AtCoder problem was already previously solved! Syncing retroactively.");
            initialCheckDone = true;
        } else {
            console.log("CodeCanon: Success detected in AtCoder from new submission!");
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
