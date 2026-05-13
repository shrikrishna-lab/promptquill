// Service Worker (Background Script)

// Add context menu item
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "savePrompt",
    title: "Save to Prompt Quill",
    contexts: ["selection"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "savePrompt") {
    // Get selected text
    const selectedText = info.selectionText;
    
    // Store in storage
    chrome.storage.local.set({ lastSelectedText: selectedText });
    
    // Open popup
    chrome.action.openPopup();
  }
});

// Listen for tab changes and inject content script
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.tabs.sendMessage(tabId, { action: 'checkExtension' }).catch(() => {
      // Content script not loaded, that's ok
    });
  }
});

// Periodic sync for cloud storage
chrome.alarms.create('syncPrompts', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'syncPrompts') {
    chrome.storage.sync.get(['authToken'], (result) => {
      if (result.authToken) {
        // Could sync saved prompts here
      }
    });
  }
});
