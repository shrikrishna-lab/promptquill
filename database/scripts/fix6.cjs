const fs = require('fs');
const path = require('path');

const replacements = {
  // We provide the strings exactly as they appear in the file.
  'â• ': '═',
  'â” â” â” ': '━━━',
  'âš™ï¸ ': '⚙️',
  'âš ï¸ ': '⚠️',
  'â ±ï¸ ': '⏱️',
  'âœ ï¸ ': '✍️',
  'âš”ï¸ ': '⚔️',
  'â˜ ': '☐',
  'â Ž': '❌',
  'âœ…': '✅',
  'â–¼': '▼',
  'â–²': '▲',
  'â—„': '◄',
  'â–º': '►',
  'â˜ ': '☐',
  'â˜‘': '☑'
};

const targetFiles = [
  'src/pages/WrappedPage.jsx',
  'src/pages/LandingPage.jsx',
  'src/pages/Dashboard.jsx',
  'src/pages/SupportPage.jsx',
  'src/lib/ai.js'
];

targetFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    // Read the file as binary buffer, convert it to a latin1 string which preserves exact bytes,
    // then write it out safely? No, read as utf8.
    let content = fs.readFileSync(filePath, 'utf8');
    let m = false;
    for (const [bad, good] of Object.entries(replacements)) {
      if (content.includes(bad)) {
        content = content.split(bad).join(good);
        m = true;
      }
    }
    // Specific targeted replaces for the ones that might have spaced bytes
    // Just in case, let's also do a blanket replace for 'â• ' which is the border lines
    if (content.includes('â•')) {
      content = content.replace(/â•/g, '═');
      m = true;
    }
    if (content.includes('â”')) {
        content = content.replace(/â”/g, '━');
        m = true;
    }
    if (content.includes('â Œ')) {
        content = content.replace(/â Œ/g, '❌');
        m = true;
    }
    if (content.includes('âž¡ï¸')) {
        content = content.replace(/âž¡ï¸/g, '➡️');
        m = true;
    }
    if (content.includes('â€¢')) {
        content = content.replace(/â€¢/g, '•');
        m = true;
    }
    if (content.includes('â† ')) {
        content = content.replace(/â† /g, '←');
        m = true;
    }

    if (m) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed â-emojis in', file);
    }
  }
});
