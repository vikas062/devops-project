// codeforces.js - New for Codeforces
const API_URL = "http://localhost:5000/api/solve";

const getProblemTitle = () => {
    let titleEl = document.querySelector(".problem-title") || document.querySelector(".title") || document.querySelector("h1");
    let title = titleEl ? titleEl.textContent.trim() : "";

    if (!title && document.title) {
        title = document.title;
        if (title.endsWith(" - Codeforces")) title = title.replace(" - Codeforces", "").trim();
        if (title.startsWith("Problem - ")) title = title.replace("Problem - ", "").trim();
    }
    return title || getProblemSlug();
};

const getProblemSlug = () => {
    const match = window.location.pathname.match(/contest\/(\d+)\/problem\/(\w+)/);
    return match ? `${match[1]}-${match[2]}` : null;
};

const getHandle = () => {
    const profile = document.querySelector("a[href*='/profile/']");
    if (profile) {
        const match = profile.getAttribute("href").match(/profile\/([^/]+)/);
        return match ? match[1] : null;
    }
    return null;
};

const hasAccepted = () => {
    const text = document.body ? document.body.innerText.toLowerCase() : "";
    if (text.includes("pretests passed") || 
        text.includes("happy new year!") || 
        text.includes("verdict: accepted") ||
        document.querySelector(".verdict-accepted")) {
        return true;
    }
    return false;
};

const hasAlreadySolved = () => {
    const statusBox = document.querySelector(".status-frame-datatable, .status");
    if (statusBox && statusBox.querySelector(".verdict-accepted")) return true;

    const sideboxes = document.querySelectorAll(".roundbox");
    for (let box of sideboxes) {
        if (box.textContent.toLowerCase().includes("last submissions")) {
            if (box.querySelector(".verdict-accepted, [style*='color: green'], [style*='color:green']")) {
                return true;
            }
        }
    }
    return false;
};

const updatePopup = (accepted) => {
    if (typeof chrome === "undefined" || !chrome.runtime) return;
    const payload = {
        platform: "Codeforces",
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
        platform: "Codeforces",
        questionTitle: getProblemTitle(),
        problemSlug: getProblemSlug(),
        handle: getHandle(),
        accepted: true,
        detectedAt: new Date().toISOString()
    };

    if (!payload.questionTitle) return;

    updatePopup(true);

    const key = `cc_codeforces_${payload.problemSlug || payload.questionTitle}`;
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
            console.log("CodeCanon: Codeforces problem was already previously solved! Syncing retroactively.");
            initialCheckDone = true;
        } else {
            console.log("CodeCanon: Success detected in Codeforces from new submission!");
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
