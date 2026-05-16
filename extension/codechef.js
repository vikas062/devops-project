// codechef.js - New for CodeChef
const API_URL = "http://localhost:5000/api/solve";

const getProblemTitle = () => {
    // 1. Try to find the h1 specifically within the problem statement area
    let titleEl = document.querySelector("h1:not([class*='logo'])") ||
        document.querySelector("h2[class*='problem-name']") ||
        document.querySelector(".problem-name") ||
        document.querySelector("[class*='problem__title'] span");

    let title = titleEl ? titleEl.textContent.trim() : "";

    // 2. Fallback to document.title
    if (!title && document.title) {
        let docTitle = document.title;
        // e.g. "Queen and Stable Relationships | CodeChef"
        docTitle = docTitle.split('|')[0].trim();
        // Remove trailing " Coding Problem" or " - CodeChef" if any
        docTitle = docTitle.replace(/ Coding Problem$/i, "").trim();
        docTitle = docTitle.replace(/ - CodeChef$/i, "").trim();
        title = docTitle;
    }

    return title || getProblemSlug(); // Fall back to slug if all else fails
};

const getProblemSlug = () => {
    // Standard matches: /problems/XYZ, /practice/course/.../problems/XYZ
    const match = window.location.pathname.match(/problems\/([^/]+)/);
    return match ? match[1] : null;
};

const getHandle = () => {
    // 1. Check anchor tags in navbar
    const profile = document.querySelector("a[href*='/users/']");
    if (profile) {
        const match = profile.getAttribute("href").match(/users\/([^/]+)/);
        if (match && match[1] !== "login") return match[1];
    }
    // 2. Check newer UI username spans
    const nameEl = document.querySelector(".user-name, .username, [class*='user-name']");
    if (nameEl && nameEl.textContent.trim()) {
        return nameEl.textContent.trim();
    }
    // 3. Check local storage if accessible (some platforms store user handle here)
    try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const userObj = JSON.parse(userStr);
            if (userObj.username) return userObj.username;
        }
    } catch (e) { }

    return null;
};

const hasAccepted = () => {
    const text = document.body ? document.body.innerText.toLowerCase() : "";
    if (text.includes("correct answer") || 
        text.includes("100 pts") || 
        text.includes("100 points") ||
        document.querySelector("[class*='success']") || 
        document.querySelector("[class*='correct']")) {
        return true;
    }
    return false;
};

const hasAlreadySolved = () => {
    const svgs = document.querySelectorAll("svg");
    for (let svg of svgs) {
        const svgHTML = svg.outerHTML.toLowerCase();
        if ((svgHTML.includes("#4caf50") || svgHTML.includes("green") || svgHTML.includes("#2e7d32")) && svgHTML.includes("check")) {
            if (svg.closest("h1, h2, header, [class*='problem-header'], [class*='title']")) return true;
        }
    }

    const text = document.body ? document.body.innerText.toLowerCase() : "";
    if (text.includes("you have solved this problem") || text.includes("already solved this problem")) {
        return true;
    }

    const labels = document.querySelectorAll("[class*='solved']");
    for (let label of labels) {
        if (label.textContent.trim().toLowerCase() === "solved") return true;
    }

    return false;
};

const updatePopup = (accepted) => {
    if (typeof chrome === "undefined" || !chrome.runtime) return;
    const payload = {
        platform: "CodeChef",
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
        platform: "CodeChef",
        questionTitle: getProblemTitle(),
        problemSlug: getProblemSlug(),
        handle: getHandle(),
        accepted: true,
        detectedAt: new Date().toISOString()
    };

    if (!payload.questionTitle) return;

    updatePopup(true);

    const key = `cc_codechef_${payload.problemSlug || payload.questionTitle}`;
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
            console.log("CodeCanon: CodeChef problem was already previously solved! Syncing retroactively.");
            initialCheckDone = true;
        } else {
            console.log("CodeCanon: Success detected in CodeChef from new submission!");
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
