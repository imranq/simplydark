"use strict";
function injectPDFDarkMode(tabId) {
    chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
            const overlayId = 'darkModeOverlay1233';
            let overlay = document.getElementById(overlayId);
            if (overlay) {
                overlay.remove();
                return;
            }
            overlay = document.createElement('div');
            overlay.id = overlayId;
            const css = `
        position: fixed !important;
        pointer-events: none !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background-color: white !important;
        mix-blend-mode: difference !important;
        z-index: 2147483647 !important;
      `;
            overlay.setAttribute('style', css);
            document.documentElement.appendChild(overlay);
            // Add enforcing styles
            const style = document.createElement('style');
            style.textContent = `
        #${overlayId} {
          position: fixed !important;
          z-index: 2147483647 !important;
          pointer-events: none !important;
          mix-blend-mode: difference !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
        }
      `;
            document.head.appendChild(style);
        }
    });
}
function sendToggleMessage() {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const activeTab = tabs[0];
        if (!activeTab.id)
            return;
        console.log("Running dark mode script");
        chrome.tabs.sendMessage(activeTab.id, { action: "toggle-dark-mode" });
    });
}
// Listen for keyboard command
chrome.commands.onCommand.addListener((command) => {
    if (command === "toggle-dark-mode") {
        sendToggleMessage();
    }
});
// Listen for extension icon click
chrome.action.onClicked.addListener(() => {
    console.log("Running dark mode script");
    sendToggleMessage();
});
// Listen for PDF injection requests
chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.action === "inject-pdf-script" && sender.tab?.id) {
        console.log("Injecting PDF dark mode script");
        injectPDFDarkMode(sender.tab.id);
    }
});
