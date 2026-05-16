// toast.js - CodeCanon in-page notification
chrome.runtime.onMessage.addListener((request) => {
    if (request.type === "SOLVE_STATUS") {
        showToast(request.status, request.message);
    }
});

function showToast(status, message) {
    // Remove any existing toast
    const existing = document.getElementById("codecanon-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "codecanon-toast";
    Object.assign(toast.style, {
        position: "fixed",
        bottom: "30px",
        right: "30px",
        padding: "14px 22px",
        borderRadius: "12px",
        color: "white",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontWeight: "600",
        fontSize: "14px",
        zIndex: "2147483647",
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        transform: "translateY(60px)",
        opacity: "0",
        pointerEvents: "none",
        maxWidth: "340px",
        lineHeight: "1.4"
    });

    const configs = {
        SUCCESS: {
            bg: "linear-gradient(135deg, #10b981, #059669)",
            border: "#34d399",
            icon: "✨",
            text: "Solve synced to CodeCanon!"
        },
        LOADING: {
            bg: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            border: "#a78bfa",
            icon: "⟳",
            text: "Syncing to CodeCanon..."
        },
        NOT_TRACKED: {
            bg: "linear-gradient(135deg, #d97706, #b45309)",
            border: "#fbbf24",
            icon: "📋",
            text: message || "Question not in library yet"
        },
        AUTH_REQUIRED: {
            bg: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            border: "#60a5fa",
            icon: "🔑",
            text: "Login to CodeCanon extension to sync"
        },
        ERROR: {
            bg: "linear-gradient(135deg, #ef4444, #dc2626)",
            border: "#f87171",
            icon: "⚠️",
            text: message || "Sync failed"
        }
    };

    const cfg = configs[status] || configs.ERROR;
    toast.style.background = cfg.bg;
    toast.style.border = `1px solid ${cfg.border}`;
    toast.innerHTML = `<span style="margin-right:8px;font-size:16px;">${cfg.icon}</span>${cfg.text}`;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.transform = "translateY(0)";
        toast.style.opacity = "1";
    });

    const duration = status === "LOADING" ? 10000 : 4500;
    setTimeout(() => {
        toast.style.transform = "translateY(20px)";
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 400);
    }, duration);
}
