export {};

interface SiteRule {
  id: string;
  pattern: string;
  enabled: boolean;
  createdAt: number;
}

const currentSite = document.querySelector<HTMLElement>('#current-site')!;
const currentPattern = document.querySelector<HTMLElement>('#current-pattern')!;
const currentButton = document.querySelector<HTMLButtonElement>('#current-action')!;
const form = document.querySelector<HTMLFormElement>('#rule-form')!;
const patternInput = document.querySelector<HTMLInputElement>('#pattern')!;
const errorMessage = document.querySelector<HTMLElement>('#error')!;
const rulesList = document.querySelector<HTMLElement>('#rules')!;
const emptyState = document.querySelector<HTMLElement>('#empty')!;

let rules: SiteRule[] = [];
let currentUrl = '';
let suggestedPattern = '';
let currentTabId: number | undefined;

function queryActiveTab(): Promise<chrome.tabs.Tab | undefined> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (tabs: chrome.tabs.Tab[]) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolve(tabs[0]);
    };
    const fail = (error: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      reject(error instanceof Error ? error : new Error(String(error)));
    };
    const timeout = window.setTimeout(() => fail(new Error('The browser did not provide the active tab.')), 1500);

    try {
      const result = (chrome.tabs.query as unknown as (
        queryInfo: chrome.tabs.QueryInfo,
        callback: (tabs: chrome.tabs.Tab[]) => void,
      ) => void | Promise<chrome.tabs.Tab[]>)({ active: true, currentWindow: true }, (tabs) => {
        const error = chrome.runtime.lastError;
        if (error) fail(new Error(error.message));
        else finish(tabs);
      });
      if (result && typeof result.then === 'function') result.then(finish, fail);
    } catch (error) {
      fail(error);
    }
  });
}

function getSiteRules(): Promise<SiteRule[]> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (stored: { [key: string]: unknown }) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolve(Array.isArray(stored.siteRules) ? stored.siteRules as SiteRule[] : []);
    };
    const fail = (error: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      reject(error instanceof Error ? error : new Error(String(error)));
    };
    const timeout = window.setTimeout(() => fail(new Error('The browser did not provide extension storage.')), 1500);

    try {
      const result = (chrome.storage.sync.get as unknown as (
        keys: string,
        callback: (items: { [key: string]: unknown }) => void,
      ) => void | Promise<{ [key: string]: unknown }>)('siteRules', (stored) => {
        const error = chrome.runtime.lastError;
        if (error) fail(new Error(error.message));
        else finish(stored);
      });
      if (result && typeof result.then === 'function') result.then(finish, fail);
    } catch (error) {
      fail(error);
    }
  });
}

function setSiteRules(siteRules: SiteRule[]): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolve();
    };
    const fail = (error: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      reject(error instanceof Error ? error : new Error(String(error)));
    };
    const timeout = window.setTimeout(() => fail(new Error('The browser did not save the rule.')), 1500);

    try {
      const result = (chrome.storage.sync.set as unknown as (
        items: { siteRules: SiteRule[] },
        callback: () => void,
      ) => void | Promise<void>)({ siteRules }, () => {
        const error = chrome.runtime.lastError;
        if (error) fail(new Error(error.message));
        else finish();
      });
      if (result && typeof result.then === 'function') result.then(finish, fail);
    } catch (error) {
      fail(error);
    }
  });
}

function createId(): string {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function makeCurrentSitePattern(url: string): string {
  const parsed = new URL(url);
  if (parsed.protocol === 'file:') {
    return `^${escapeRegExp(url)}`;
  }
  return `^${escapeRegExp(parsed.protocol)}//${escapeRegExp(parsed.hostname)}(?::\\d+)?(?:/|$)`;
}

function matches(pattern: string, url: string): boolean {
  try {
    return new RegExp(pattern, 'i').test(url);
  } catch {
    return false;
  }
}

async function save(): Promise<void> {
  await setSiteRules(rules);
}

function applyRulesToCurrentTab(): void {
  if (currentTabId === undefined) return;

  chrome.tabs.sendMessage(currentTabId, { action: 'apply-saved-rules' }, () => {
    if (!chrome.runtime.lastError) return;

    // Pages that were open when the extension was installed/reloaded do not
    // have the declared content script yet, so inject it once on demand.
    chrome.scripting.executeScript({
      target: { tabId: currentTabId! },
      files: ['content.js'],
    }, () => {
      // Reading lastError prevents an expected error from becoming an
      // uncaught console warning on protected browser pages.
      void chrome.runtime.lastError;
    });
  });
}

async function saveAndRender(): Promise<void> {
  errorMessage.textContent = '';
  try {
    await save();
    applyRulesToCurrentTab();
    render();
  } catch (error) {
    errorMessage.textContent = error instanceof Error ? `Could not save: ${error.message}` : 'Could not save this rule.';
  }
}

function render(): void {
  const matchingRule = rules.find((rule) => rule.enabled && matches(rule.pattern, currentUrl));
  currentButton.textContent = matchingRule ? 'Remove matching rule' : 'Add current site';
  currentButton.classList.toggle('danger', Boolean(matchingRule));

  rulesList.replaceChildren();
  emptyState.hidden = rules.length > 0;

  for (const rule of rules) {
    const item = document.createElement('li');
    item.className = 'rule';

    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.checked = rule.enabled;
    toggle.title = rule.enabled ? 'Disable rule' : 'Enable rule';
    toggle.addEventListener('change', async () => {
      rule.enabled = toggle.checked;
      await saveAndRender();
    });

    const pattern = document.createElement('code');
    pattern.textContent = rule.pattern;
    pattern.title = rule.pattern;

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'icon-button';
    remove.textContent = '×';
    remove.title = 'Delete rule';
    remove.setAttribute('aria-label', `Delete ${rule.pattern}`);
    remove.addEventListener('click', async () => {
      rules = rules.filter((candidate) => candidate.id !== rule.id);
      await saveAndRender();
    });

    item.append(toggle, pattern, remove);
    rulesList.append(item);
  }
}

currentButton.addEventListener('click', async () => {
  const matchingRule = rules.find((rule) => rule.enabled && matches(rule.pattern, currentUrl));
  if (matchingRule) {
    rules = rules.filter((rule) => rule.id !== matchingRule.id);
  } else {
    rules.unshift({
      id: createId(),
      pattern: suggestedPattern,
      enabled: true,
      createdAt: Date.now(),
    });
  }
  await saveAndRender();
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const pattern = patternInput.value.trim();
  try {
    new RegExp(pattern);
  } catch {
    errorMessage.textContent = 'Enter a valid regular expression.';
    patternInput.focus();
    return;
  }

  errorMessage.textContent = '';
  rules.unshift({
    id: createId(),
    pattern,
    enabled: true,
    createdAt: Date.now(),
  });
  patternInput.value = '';
  await saveAndRender();
});

async function initialize(): Promise<void> {
  try {
    const tab = await queryActiveTab();
    currentTabId = tab?.id;
    const url = tab?.url || '';
    const parsed = new URL(url);
    if (!['http:', 'https:', 'file:'].includes(parsed.protocol)) throw new Error();
    currentUrl = url;
    suggestedPattern = makeCurrentSitePattern(url);
    currentSite.textContent = parsed.hostname || parsed.pathname.split('/').pop() || 'Local file';
    currentPattern.textContent = suggestedPattern;
    currentButton.disabled = false;
  } catch {
    currentSite.textContent = 'This page cannot be changed';
    currentPattern.textContent = '';
    currentButton.disabled = true;
  }

  try {
    rules = await getSiteRules();
  } catch (error) {
    errorMessage.textContent = error instanceof Error ? `Could not load saved rules: ${error.message}` : 'Could not load saved rules.';
  }
  render();
}

void initialize();
