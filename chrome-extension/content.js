// Content script that runs on every page

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSelectedText") {
    const selectedText = window.getSelection().toString();
    sendResponse({ selectedText });
  }
});

// Add right-click context menu option
chrome.runtime.sendMessage({
  greeting: "hello"
}, response => {
  // Extension loaded
});

// Highlight selected text and show tooltip
document.addEventListener('mouseup', () => {
  const selectedText = window.getSelection().toString().trim();
  
  if (selectedText.length > 0 && selectedText.length < 1000) {
    // Store for popup
    chrome.storage.local.set({ lastSelectedText: selectedText });
  }
});
