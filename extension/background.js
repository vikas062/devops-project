// background.js - Fixed for auto integration and segregation
const API_URL = "http://localhost:5000/api/solve";

// Simple category guesser from title (can be improved)
function getCategory(title) {
    title = title.toLowerCase();
    if (title.includes("stack") || title.includes("parentheses")) return "Stack";
    if (title.includes("tree") || title.includes("traversal")) return "Tree";
    if (title.includes("graph") || title.includes("search")) return "Graph";
    if (title.includes("dp") || title.includes("dynamic programming")) return "DP";
    if (title.includes("array") || title.includes("sort")) return "Array";
    return "Other";
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.type === "SOLVE_DETECTED") {
        const payload = message.payload;
        console.log("CodeCanon Background: Received SOLVE_DETECTED", payload);

        // Add category
        payload.category = getCategory(payload.questionTitle || payload.title || "");

        // Update immediately that we are trying to sync
        payload.syncStatus = "loading";
        chrome.storage.local.set({ cc_last_detection: payload });

        // Send to backend
        fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
            .then(async response => {
                const data = await response.json();
                if (response.ok) {
                    console.log("CodeCanon solve push success", data);
                    payload.syncStatus = "success";
                    payload.syncMessage = "Successfully synced to dashboard!";
                    chrome.storage.local.set({ cc_last_detection: payload });

                    chrome.tabs.sendMessage(sender.tab.id, {
                        type: "SOLVE_STATUS",
                        status: "SUCCESS",
                        data
                    });
                } else if (response.status === 404) {
                    console.warn("CodeCanon question not tracked", data);
                    payload.syncStatus = "error";
                    payload.syncMessage = data.message || "Not tracked or Unlinked Handle";
                    chrome.storage.local.set({ cc_last_detection: payload });

                    chrome.tabs.sendMessage(sender.tab.id, {
                        type: "SOLVE_STATUS",
                        status: "NOT_TRACKED",
                        message: data.message
                    });
                } else {
                    console.warn("CodeCanon solve push failed", response.status, data);
                    payload.syncStatus = "error";
                    payload.syncMessage = data.message || "Server Error";
                    chrome.storage.local.set({ cc_last_detection: payload });

                    chrome.tabs.sendMessage(sender.tab.id, {
                        type: "SOLVE_STATUS",
                        status: "ERROR",
                        message: data.message || "Unknown error"
                    });
                }
            })
            .catch(error => {
                console.warn("CodeCanon solve push network error", error);
                payload.syncStatus = "error";
                payload.syncMessage = "Network/Server offline";
                chrome.storage.local.set({ cc_last_detection: payload });

                chrome.tabs.sendMessage(sender.tab.id, {
                    type: "SOLVE_STATUS",
                    status: "ERROR",
                    message: "Network error"
                });
            });

        // Return true for async
        return true;
    } else if (message.type === "UPDATE_POPUP") {
        // Content script explicitly asking to update the popup (e.g. pending state)
        chrome.storage.local.set({
            cc_last_detection: message.payload
        });
    }
});