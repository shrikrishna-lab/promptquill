# Prompt Quill Chrome Extension

## Features

- 💾 **One-Click Save** - Select any text on the web and save it as a prompt
- 🔄 **Context Menu Integration** - Right-click → "Save to Prompt Quill"
- 🌐 **Cloud Sync** - Automatically sync with your PromptQuill account
- 🔐 **Privacy First** - Only saved prompts you explicitly choose to save
- 👥 **Community Sharing** - Optionally share prompts with the community

## Installation

### Development

1. Open `chrome://extensions/` in your browser
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select this `chrome-extension` folder

### Usage

1. Select any text on a webpage
2. Right-click and choose "Save to Prompt Quill"
3. Add a title, category, and optional description
4. Choose to make it public or keep it private
5. Click "Save Prompt"

Alternatively:
- Click the Prompt Quill icon in the top-right
- Paste or select text
- Fill in the details and save

## File Structure

```
chrome-extension/
├── manifest.json      # Extension configuration
├── popup.html         # Popup UI
├── popup.js          # Popup logic
├── content.js        # Page injection script
├── background.js     # Service worker/background tasks
└── images/           # Icons (16x16, 48x48, 128x128)
```

## Permissions Explained

- `activeTab` - Access the current tab to get selected text
- `scripting` - Inject content into pages
- `storage` - Save auth tokens and preferences
- `contextMenus` - Add right-click menu items

## Future Enhancements

- [ ] Keyboard shortcut (Ctrl+Shift+P to save)
- [ ] Search saved prompts locally
- [ ] Offline sync queue
- [ ] Prompt templates
- [ ] Batch import from other sites
- [ ] Highlight color customization
