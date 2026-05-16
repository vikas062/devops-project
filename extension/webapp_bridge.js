// webapp_bridge.js
// Runs on the CodeCanon webapp domain.
// Listens for CC_SET_TOKEN postMessage from the React app after login,
// then forwards the JWT to background.js which saves it to chrome.storage.local.

window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  if (event.data?.type === "CC_SET_TOKEN" && event.data.token) {
    chrome.runtime.sendMessage({
      type: "SET_TOKEN",
      token: event.data.token
    }, (resp) => {
      if (chrome.runtime.lastError) return; // Extension not available
      console.log("CodeCanon: Token bridged to extension ✓");
    });
  }

  if (event.data?.type === "CC_CLEAR_TOKEN") {
    chrome.runtime.sendMessage({ type: "CLEAR_TOKEN" }, () => {});
  }
});
