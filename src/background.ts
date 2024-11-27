async function sendToggleMessage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  
  console.log("Running dark mode script");
  
  // First, inject the content script if it hasn't been injected yet
  await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
  });
  
  // Then send the toggle message
  chrome.tabs.sendMessage(tab.id, { action: "toggle-dark-mode" });
}

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-dark-mode") sendToggleMessage();
});

chrome.action.onClicked.addListener(() => {
  console.log("Running dark mode script");
  sendToggleMessage();
});