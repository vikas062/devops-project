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
    // SPOJ uses status codes like 'status_15' or explicitly prints 'accepted' in the status column
    const statusEls = document.querySelectorAll(".status_15, .status-accepted, td");
    for (let el of statusEls) {
        if (el.children.length === 0 || el.classList.contains("status_15")) {
            const text = el.textContent.trim().toLowerCase();
            if (text === "accepted" || el.classList.contains("status_15") || text === "ac") {
                // Check if colored green or marked as accepted class
                if (el.classList.contains("status_15") || window.getComputedStyle(el).color.includes("rgb(0, 128, 0)") || window.getComputedStyle(el).color.includes("green")) {
                    return true;
                }
            }
        }
    }
    return false;
};

const hasAlreadySolved = () => {
    // SPOJ shows a checkmark in the problem table or changes the problem title row color
    // Typically, on a problem page, we can see if the user has an AC entry in the bottom submissions table.
    const tableCells = document.querySelectorAll("td");
    for (let cell of tableCells) {
        if (cell.textContent.trim().toLowerCase() === "accepted" && (window.getComputedStyle(cell).color.includes("green") || cell.classList.contains("status_15"))) {
            return true;
        }
    }

    // Check for "solved" icon near the title
    if (document.querySelector(".fa-check, [title*='solved']")) {
        return true;
    }

    return false;
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
