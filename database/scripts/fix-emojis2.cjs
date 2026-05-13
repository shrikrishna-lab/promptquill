const fs = require('fs');
const path = require('path');

const replacements = {
  // WrappedPage.jsx
  'ðŸ †': '🏆',

  // LandingPage.jsx & ai.js
  'ðŸŒ ': '🌍',
  'ðŸ›¡ï¸ ': '🛡️',
  'âš™ï¸ ': '⚙️',
  
  // Dashboard & ai
  'ðŸ” ': '🔍',
  'ðŸ —ï¸ ': '🏗️',
  'ðŸ› ï¸ ': '🛠️',
  'ðŸ—„ï¸ ': '🗄️',
  'ðŸ—£ï¸ ': '🗣️',
  'ðŸ“ ': '📋', // Exact Structure
  'ðŸ–¼ï¸ ': '🖼️',
  
  // ai.js specific
  'ðŸŽ®': '🎮',
  'ðŸ•¹ï¸ ': '🕹️',
  'ðŸ‘¾': '👾',
  'ðŸ—ºï¸ ': '🗺️',
  'ðŸ’°': '💰',
  'ðŸ¤–': '🤖',
  'ðŸš¨': '🚨',
  'ðŸ“…': '📅',
  'ðŸ“Œ': '📌',
  'ðŸ”§': '🔧',
  'ðŸ’¸': '💸',
  'ðŸ“ˆ': '📈',
  'ðŸ¥Š': '🥊',
  'ðŸ šï¸ ': '🐛', // Tech Debt Register
  
  // Extra specific check for 'ðŸ“ ' since it matches multiple
  'ðŸ“  Exact Structure': '📋 Exact Structure',
  'ðŸ“  90-Day': '📊 90-Day',
  'ðŸ“  Timing': '📈 Timing',
  
  // More leftover
  'âš¡': '⚡',
  'ðŸ§': '🧠'
};

const targetFiles = [
  'src/pages/WrappedPage.jsx',
  'src/pages/LandingPage.jsx',
  'src/pages/Dashboard.jsx',
  'src/lib/ai.js'
];

targetFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let m = false;
    for (const [bad, good] of Object.entries(replacements)) {
      if (content.includes(bad)) {
        content = content.split(bad).join(good);
        m = true;
      }
    }
    if (m) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed emojis in', file);
    }
  }
});
