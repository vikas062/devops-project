// spoj.js - New for SPOJ
const API_URL = "http://localhost:5000/api/solve";

const getProblemTitle = () => {
    let titleEl = document.querySelector("h1") || document.querySelector(".problem-name");
    let title = titleEl ? titleEl.textContent.trim() : "";
    if (!title && document.title) {
        title = document.title;
        if (title.includes("Problem")) {
            title = title.split("Problem")[1].trim();
        }
    }
    return title || getProblemSlug();
};

const getProblemSlug = () => {
    const match = window.location.pathname.match(/problems\/([^/]+)/);
    return match ? match[1] : null;
};

const getHandle = () => {
    const profile = document.querySelector("a[href*='/users/']");
    if (profile) {
        const match = profile.getAttribute("href").match(/users\/([^/]+)/);
        return match ? match[1] : null;
    }
    return null;
};

const hasAccepted = () => {
    const text = document.body ? document.body.innerText.toLowerCase() : "";
    if (text.includes("status: accepted") || document.querySelector(".status_15") || text.includes("result: accepted")) return true;
    return false;
};

const hasAlreadySolved = () => {
    return !!(document.querySelector(".status_15") || document.querySelector(".fa-check"));
};

const updatePopup = (accepted) => {
    if (typeof chrome === "undefined" || !chrome.runtime) return;
    const payload = {
        platform: "SPOJ",
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
        platform: "SPOJ",
        questionTitle: getProblemTitle(),
        problemSlug: getProblemSlug(),
        handle: getHandle(),
        accepted: true,
        detectedAt: new Date().toISOString()
    };

    if (!payload.questionTitle) return;

    updatePopup(true);

    const key = `cc_spoj_${payload.problemSlug || payload.questionTitle}`;
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
            console.log("CodeCanon: SPOJ problem was already previously solved! Syncing retroactively.");
            initialCheckDone = true;
        } else {
            console.log("CodeCanon: Success detected in SPOJ from new submission!");
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
