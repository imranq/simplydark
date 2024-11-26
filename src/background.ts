// src/background.ts
async function sendToggleMessage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  console.log("Running dark mode script");
  chrome.tabs.sendMessage(tab.id, { action: "toggle-dark-mode" });
}

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-dark-mode") sendToggleMessage();
});

chrome.action.onClicked.addListener(() => {
  console.log("Running dark mode script");
  sendToggleMessage();
});