interface DarkModeState {
  enabled: boolean;
  timestamp: number;
}

interface DarkModeStorage {
  [domain: string]: DarkModeState;
}

async function getDomain(url: string): Promise<string> {
  try {
    const urlObj = new URL(url);
    // For local files, use the full path as the "domain"
    if (urlObj.protocol === 'file:') {
      return url;
    }
    return urlObj.hostname;
  } catch {
    return '';
  }
}

async function getDarkModeState(domain: string): Promise<boolean> {
  const result = await chrome.storage.sync.get('darkModeSites');
  const sites: DarkModeStorage = result.darkModeSites || {};
  return sites[domain]?.enabled || false;
}

async function toggleDarkModeForDomain(domain: string): Promise<void> {
  const result = await chrome.storage.sync.get('darkModeSites');
  const sites: DarkModeStorage = result.darkModeSites || {};
  
  if (sites[domain]?.enabled) {
    delete sites[domain];
  } else {
    sites[domain] = {
      enabled: true,
      timestamp: Date.now()
    };
  }
  
  await chrome.storage.sync.set({ darkModeSites: sites });
}

async function sendToggleMessage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url) return;
  
  const domain = await getDomain(tab.url);
  if (!domain) return;

  console.log("Running dark mode script");
  
  // First, inject the content script if it hasn't been injected yet
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  });
  
  // Toggle the domain's dark mode state
  await toggleDarkModeForDomain(domain);
  
  // Then send the toggle message with the new state
  const isDarkMode = await getDarkModeState(domain);
  chrome.tabs.sendMessage(tab.id, { 
    action: "toggle-dark-mode",
    state: isDarkMode
  });
}

// Check dark mode state when a tab is updated
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const domain = await getDomain(tab.url);
    if (!domain) return;

    const isDarkMode = await getDarkModeState(domain);
    if (isDarkMode) {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js']
      });
      
      chrome.tabs.sendMessage(tabId, { 
        action: "toggle-dark-mode",
        state: true
      });
    }
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-dark-mode") sendToggleMessage();
});

chrome.action.onClicked.addListener(() => {
  console.log("Running dark mode script");
  sendToggleMessage();
});
