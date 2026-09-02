export {};

interface SiteRule {
  id: string;
  pattern: string;
  enabled: boolean;
  createdAt: number;
}

interface LegacyDarkModeState {
  enabled: boolean;
  timestamp: number;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Preserve users' existing hostname preferences after upgrading to regex rules.
chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.sync.get(['siteRules', 'darkModeSites']);
  if (Array.isArray(stored.siteRules) || !stored.darkModeSites) return;

  const legacy = stored.darkModeSites as Record<string, LegacyDarkModeState>;
  const siteRules: SiteRule[] = Object.entries(legacy)
    .filter(([, state]) => state.enabled)
    .map(([hostname, state]) => ({
      id: crypto.randomUUID(),
      pattern: `^https?://${escapeRegExp(hostname)}(?::\\d+)?(?:/|$)`,
      enabled: true,
      createdAt: state.timestamp || Date.now(),
    }));

  await chrome.storage.sync.set({ siteRules });
  await chrome.storage.sync.remove('darkModeSites');
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'toggle-dark-mode') return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  chrome.tabs.sendMessage(tab.id, { action: 'toggle-dark-mode-once' }).catch(() => {});
});
