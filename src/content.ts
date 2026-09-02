'use strict';

const OVERLAY_ID = 'darkModeOverlay1233';

const OVERLAY_CSS = `
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

let darkModeOverlay: HTMLDivElement | null = null;
let sessionOverride: boolean | null = null;

interface SiteRule {
  id: string;
  pattern: string;
  enabled: boolean;
  createdAt: number;
}

function createOverlay(): HTMLDivElement {
  console.log("[Simply Dark] Creating overlay");
  const overlay = document.createElement("div");
  overlay.id = OVERLAY_ID;
  overlay.setAttribute("style", OVERLAY_CSS);
  return overlay;
}

function isPDF(): boolean {
  return location.pathname.toLowerCase().endsWith('.pdf');
}

function handlePDFMode(enable: boolean): void {
  console.log("[Simply Dark] Handling PDF mode");
  let overlay = document.getElementById(OVERLAY_ID);
  
  if (!enable && overlay) {
    overlay.remove();
    return;
  }

  if (enable && !overlay) {
    const pdfViewer = document.querySelector('embed[type="application/x-google-chrome-pdf"]');
    overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.setAttribute('style', OVERLAY_CSS);

    if (pdfViewer?.parentElement) {
      pdfViewer.parentElement.insertBefore(overlay, pdfViewer.nextSibling);
    } else {
      document.documentElement.appendChild(overlay);
    }
  }
}

function setDarkMode(enable: boolean): void {
  console.log("[Simply Dark] Setting dark mode:", enable);
  
  if (isPDF()) {
    console.log("[Simply Dark] PDF detected");
    handlePDFMode(enable);
    return;
  }

  if (!enable && darkModeOverlay) {
    console.log("[Simply Dark] Removing existing overlay");
    darkModeOverlay.remove();
    darkModeOverlay = null;
    return;
  }

  if (enable && !darkModeOverlay) {
    console.log("[Simply Dark] Adding overlay for non-PDF");
    darkModeOverlay = createOverlay();
    (document.body || document.documentElement).appendChild(darkModeOverlay);
  }
}

interface DarkModeMessage {
  action: string;
  state?: boolean;
}

chrome.runtime.onMessage.addListener((message: DarkModeMessage) => {
  console.log("[Simply Dark] Received message:", message);
  if (message.action === "toggle-dark-mode") {
    setDarkMode(message.state || false);
  }
  if (message.action === "toggle-dark-mode-once") {
    sessionOverride = !Boolean(document.getElementById(OVERLAY_ID));
    setDarkMode(sessionOverride);
  }
  if (message.action === 'apply-saved-rules') {
    sessionOverride = null;
    void applySavedRules();
  }
});

function matchesRule(url: string, rule: SiteRule): boolean {
  if (!rule.enabled) return false;
  try {
    return new RegExp(rule.pattern, 'i').test(url);
  } catch {
    return false;
  }
}

function getSiteRules(): Promise<SiteRule[]> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get('siteRules', (result) => {
      const error = chrome.runtime.lastError;
      if (error) reject(new Error(error.message));
      else resolve(Array.isArray(result.siteRules) ? result.siteRules : []);
    });
  });
}

async function applySavedRules(): Promise<void> {
  if (sessionOverride !== null) {
    setDarkMode(sessionOverride);
    return;
  }
  try {
    const rules = await getSiteRules();
    setDarkMode(rules.some((rule) => matchesRule(location.href, rule)));
  } catch (error) {
    console.error('[Simply Dark] Could not load saved rules:', error);
  }
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.siteRules) {
    sessionOverride = null;
    void applySavedRules();
  }
});

void applySavedRules();
console.log("[Simply Dark] Content script loaded");
