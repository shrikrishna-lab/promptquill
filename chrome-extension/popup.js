// Configure your backend URL here
const BACKEND_URL = 'http://localhost:5000';

// Get selected text from the page
chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
  chrome.tabs.sendMessage(tabs[0].id, {action: "getSelectedText"}, (response) => {
    if (response && response.selectedText) {
      document.getElementById('promptContent').value = response.selectedText;
    }
  });
});

// Save prompt
document.getElementById('save-btn').addEventListener('click', async () => {
  const promptContent = document.getElementById('promptContent').value;
  const promptTitle = document.getElementById('promptTitle').value;
  const promptCategory = document.getElementById('promptCategory').value;
  const promptDescription = document.getElementById('promptDescription').value;
  const isPublic = document.getElementById('isPublic').checked;

  if (!promptContent.trim()) {
    showStatus('❌ Please select or paste some text', 'error');
    return;
  }

  if (!promptTitle.trim()) {
    showStatus('❌ Please give your prompt a title', 'error');
    return;
  }

  try {
    // Get auth token from storage
    const { authToken } = await chrome.storage.sync.get('authToken');

    if (!authToken) {
      showStatus('❌ Please login on PromptQuill first', 'error');
      return;
    }

    // Send to backend
    const response = await fetch(`${BACKEND_URL}/api/prompts/save`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: promptTitle,
        description: promptDescription,
        content: promptContent,
        category: promptCategory,
        is_public: isPublic
      })
    });

    if (response.ok) {
      showStatus('✅ Prompt saved! Visit PromptQuill to see it.', 'success');
      setTimeout(() => window.close(), 2000);
    } else {
      showStatus('❌ Failed to save prompt', 'error');
    }
  } catch (err) {
    console.error('Error:', err);
    showStatus('❌ Error saving prompt', 'error');
  }
});

// Close popup
document.getElementById('close-btn').addEventListener('click', () => {
  window.close();
});

// Get context menu selection on right-click
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSelectedText") {
    const selectedText = window.getSelection().toString();
    sendResponse({ selectedText });
  }
});

function showStatus(message, type) {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = `status show ${type}`;
  
  if (type === 'error') {
    setTimeout(() => statusEl.classList.remove('show'), 4000);
  }
}
