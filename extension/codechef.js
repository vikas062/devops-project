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
    // 1. Most robust check: check body text for the exact success pattern
    const bodyText = document.body ? document.body.innerText || "" : "";
    if (bodyText.includes("Correct Answer") && bodyText.includes("Submission ID:")) {
        return true;
    }
    if (bodyText.includes("Status: Correct Answer") || bodyText.includes("Result: Correct Answer")) {
        return true;
    }

    // 2. Iterate through elements to find "Correct Answer" or "Accepted" with green styles or success classes
    const allTextEls = document.querySelectorAll("span, div, p, h2, h3, h4");
    for (let el of allTextEls) {
        if (el.childNodes.length <= 5) {
            const text = el.textContent.trim().toLowerCase();
            if (text === "correct answer" || text === "accepted") {
                // Check if the element or its parent has a success-related class or green coloration
                let currentEl = el;
                for (let i = 0; i < 3 && currentEl; i++) {
                    const style = window.getComputedStyle(currentEl);
                    const color = style.color || "";
                    const bg = style.backgroundColor || "";
                    const cls = typeof currentEl.className === "string" ? currentEl.className.toLowerCase() : "";

                    if (
                        cls.includes("success") || cls.includes("correct") || cls.includes("accepted") ||
                        color.includes("green") || color.includes("rgb(0, 169") || color.includes("rgb(34, 197") || color.includes("rgb(0, ") ||
                        (bg.includes("rgb(") && bg !== "rgba(0, 0, 0, 0)")
                    ) {
                        return true;
                    }
                    currentEl = currentEl.parentElement;
                }
            }
        }
    }

    return false;
};

const hasAlreadySolved = () => {
    // 1. Look for the green checkmark SVG path CodeChef uses for solved problems
    const svgs = document.querySelectorAll("svg");
    for (let svg of svgs) {
        const svgHTML = svg.outerHTML.toLowerCase();
        // Look for typical green colors like #4caf50 or #2e7d32 inside an SVG path next to the title
        if ((svgHTML.includes("#4caf50") || svgHTML.includes("green") || svgHTML.includes("#2e7d32")) && svgHTML.includes("check")) {
            // ensure it's in the header/title area
            if (svg.closest("h1, h2, header, [class*='problem-header'], [class*='title']")) {
                return true;
            }
        }
    }

    // 2. Check strict text matches
    const bodyText = document.body ? (document.body.innerText || "").toLowerCase() : "";
    if (bodyText.includes("you have solved this problem") || bodyText.includes("already solved this problem")) {
        return true;
    }

    // 3. Specifically look for [class*='solved'] or "Solved" text elements
    const labels = document.querySelectorAll("[class*='solved']");
    for (let label of labels) {
        if (label.textContent.trim().toLowerCase() === "solved") {
            return true;
        }
    }

    const allLeaves = document.querySelectorAll("span, div");
    for (let el of allLeaves) {
        if (el.children.length === 0 && el.textContent.trim().toLowerCase() === "solved") {
            const style = window.getComputedStyle(el);
            const cls = typeof el.className === "string" ? el.className.toLowerCase() : "";
            if ((style.color && style.color.includes("rgb(")) || (style.backgroundColor && style.backgroundColor.includes("rgb(")) || cls.includes("solved")) {
                return true;
            }
        }
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
