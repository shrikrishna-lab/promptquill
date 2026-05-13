const fs = require('fs');
const path = require('path');

function replaceIter(file, replacements) {
    let content = fs.readFileSync(path.join(__dirname, 'src', file), 'utf8');
    for (const [bad, good] of Object.entries(replacements)) {
        content = content.replace(bad, good);
    }
    fs.writeFileSync(path.join(__dirname, 'src', file), content, 'utf8');
}

// 1. WrappedPage
replaceIter('pages/WrappedPage.jsx', {
    "Your Best Idea ðŸ †": "Your Best Idea 🏆"
});

// 2. LandingPage
replaceIter('pages/LandingPage.jsx', {
    "icon: 'ðŸŒ ', title: 'Global Community'": "icon: '🌍', title: 'Global Community'",
    "icon: 'ðŸ›¡ï¸ ', title: 'Enterprise Support'": "icon: '🛡️', title: 'Enterprise Support'",
    ">ðŸ›¡ï¸ <": ">🛡️<",
    "i === 2 ? 'âš™ï¸ ' : i === 3 ? 'ðŸ“ '": "i === 2 ? '⚙️' : i === 3 ? '📈'"
});

// 3. Dashboard
replaceIter('pages/Dashboard.jsx', {
    "label: 'ðŸ”  Validate'": "label: '🔍 Validate'",
    "label: 'ðŸ —ï¸  Architecture'": "label: '🏗️ Architecture'"
});

// 4. ai.js
replaceIter('lib/ai.js', {
    "ðŸ”  Core User Flow": "🔍 Core User Flow",
    "ðŸ› ï¸  DEV BRIEF": "🛠️ DEV BRIEF",
    "ðŸ—„ï¸  Database Schema": "🗄️ Database Schema",
    "ðŸ—£ï¸  Voice + Tone": "🗣️ Voice + Tone",
    "ðŸ“  Exact Structure": "📋 Exact Structure",
    "ðŸ–¼ï¸  Visual Direction": "🖼️ Visual Direction",
    "ðŸ•¹ï¸  Platform": "🕹️ Platform",
    "ðŸ—ºï¸  MVP Content Scope": "🗺️ MVP Content Scope",
    "ðŸ”  Safety + Compliance": "🔍 Safety + Compliance",
    "ðŸ —ï¸  Request Flow": "🏗️ Request Flow",
    "ðŸ šï¸  Technical Debt Register": "🐛 Technical Debt Register"
});

console.log("All replacements attempted.");
