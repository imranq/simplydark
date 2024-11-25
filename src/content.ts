let darkModeOverlay: HTMLDivElement | null = null;

function createOverlay(): HTMLDivElement {
  console.log("[Dark Mode] Creating overlay");
  const overlay = document.createElement("div");
  const css = `
        position: fixed;
        pointer-events: none;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: white;
        mix-blend-mode: difference;
        z-index: 2147483647;
    `;
  overlay.setAttribute("id", "darkModeOverlay1233");
  overlay.setAttribute("style", css);
  return overlay;
}

function isPDF(): boolean {
  const isPDFPath = location.pathname.toLowerCase().endsWith('.pdf');
  console.log("[Dark Mode] PDF Detection:", isPDFPath);
  return isPDFPath;
}

function injectPDFScript(): void {
  console.log("[Dark Mode] Injecting PDF script");
  chrome.runtime.sendMessage({ action: "inject-pdf-script" });
}

function toggleDarkMode(): void {
  console.log("[Dark Mode] Toggle called");
  
  if (isPDF()) {
    console.log("[Dark Mode] PDF detected, using script injection");
    injectPDFScript(); //needed
    return;
  }

  if (darkModeOverlay) {
    console.log("[Dark Mode] Removing existing overlay");
    darkModeOverlay.remove();
    darkModeOverlay = null;
    return;
  }

  console.log("[Dark Mode] Adding overlay for non-PDF");
  darkModeOverlay = createOverlay();
  document.body.appendChild(darkModeOverlay);
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message: { action: string }) => {
  console.log("[Dark Mode] Received message:", message);
  if (message.action === "toggle-dark-mode") {
    toggleDarkMode();
  }
});

console.log("[Dark Mode] Content script loaded");   