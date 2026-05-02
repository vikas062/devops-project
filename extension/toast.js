// toast.js - Shared UI component for injecting solve status directly into the DOM
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "SOLVE_STATUS") {
        showToast(request.status, request.message);
    }
});

function showToast(status, message) {
    // Prevent multiple identical toasts
    if (document.getElementById("codecanon-toast")) {
        document.getElementById("codecanon-toast").remove();
    }

    const toast = document.createElement("div");
    toast.id = "codecanon-toast";
    toast.style.position = "fixed";
    toast.style.bottom = "30px";
    toast.style.right = "30px";
    toast.style.padding = "16px 24px";
    toast.style.borderRadius = "12px";
    toast.style.color = "white";
    toast.style.fontFamily = "system-ui, -apple-system, sans-serif";
    toast.style.fontWeight = "600";
    toast.style.fontSize = "15px";
    toast.style.zIndex = "2147483647"; // Max z-index
    toast.style.boxShadow = "0 10px 25px rgba(0,0,0,0.2)";
    toast.style.transition = "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    toast.style.transform = "translateY(50px)";
    toast.style.opacity = "0";
    toast.style.pointerEvents = "none";

    // Add glowing effects based on status
    if (status === "SUCCESS") {
        toast.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)"; // Emerald green
        toast.style.border = "1px solid #34d399";
        toast.innerHTML = `<span style="margin-right:8px;font-size:18px;">✨</span> CodeCanon: Solve Synced!`;
    } else {
        toast.style.background = "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"; // Red
        toast.style.border = "1px solid #f87171";
        toast.innerHTML = `<span style="margin-right:8px;font-size:18px;">⚠️</span> CodeCanon: ${message || "Sync Failed"}`;
    }

    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.style.transform = "translateY(0)";
        toast.style.opacity = "1";
    });

    // Animate out
    setTimeout(() => {
        toast.style.transform = "translateY(20px)";
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 400);
    }, 4500);
}
