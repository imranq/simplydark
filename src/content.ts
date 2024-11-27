var SIMPLYDARK_OVERLAY_ID = 'darkModeOverlay1233';

var SIMPLYDARK_OVERLAY_CSS = `
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

function createOverlay(): HTMLDivElement {
  console.log("[Simply Dark] Creating overlay");
  const overlay = document.createElement("div");
  overlay.id = SIMPLYDARK_OVERLAY_ID;
  overlay.setAttribute("style", SIMPLYDARK_OVERLAY_CSS);
  return overlay;
}

function isPDF(): boolean {
  return location.pathname.toLowerCase().endsWith('.pdf');
}

function handlePDFMode(): void {
  console.log("[Simply Dark] Handling PDF mode");
  let overlay = document.getElementById(SIMPLYDARK_OVERLAY_ID);
  if (overlay) {
    overlay.remove();
    return;
  }

  const pdfViewer = document.querySelector('embed[type="application/x-google-chrome-pdf"]');
  console.log(pdfViewer);
  overlay = document.createElement('div');
  overlay.id = SIMPLYDARK_OVERLAY_ID;
  overlay.setAttribute('style', SIMPLYDARK_OVERLAY_CSS);

  if (pdfViewer?.parentElement) {
    pdfViewer.parentElement.insertBefore(overlay, pdfViewer.nextSibling);
  } else {
    document.documentElement.appendChild(overlay);
  }
}

function toggleDarkMode(): void {
  console.log("[Simply Dark] Toggle called");
  
  if (isPDF()) {
    console.log("[Simply Dark] PDF detected");
    handlePDFMode();
    return;
  }

  const existingOverlay = document.getElementById(SIMPLYDARK_OVERLAY_ID);
  if (existingOverlay) {
    console.log("[Simply Dark] Removing existing overlay");
    existingOverlay.remove();
    return;
  }

  console.log("[Simply Dark] Adding overlay for non-PDF");
  const overlay = createOverlay();
  document.body.appendChild(overlay);
}

interface DarkModeMessage {
  action: string;
}

chrome.runtime.onMessage.addListener((message: DarkModeMessage) => {
  console.log("[Simply Dark] Received message:", message);
  if (message.action === "toggle-dark-mode") {
    toggleDarkMode();
  }
});

console.log("[Simply Dark] Content script loaded");