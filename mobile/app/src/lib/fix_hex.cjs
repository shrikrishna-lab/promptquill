const fs = require('fs');

const file = 'ai.js';
let content = fs.readFileSync(file, 'utf-8');
const before = content.length;

let fixes = 0;

// Use hex escapes to avoid source parsing issues
const patterns = [
  ['\ud83e\udde0', '🧠'],
  ['\ud83d\udc64', '👤'],
  ['\ud83d\udeab', '🚫'],
  ['\ud83d\udcc8', '📊'],
  ['\ud83d\udccf', '📝'],
  ['\ud83d\udca1', '💡'],
  ['\ud83d\udee0\ufe0f', '🛠️'],
  ['\ud83d\udce6', '📦'],
  ['\ud83d\udccc', '📌'],
  ['\ud83d\uddc4\ufe0f', '🗄️'],
  ['\ud83d\udde3\ufe0f', '🗣️'],
  ['\ud83d\udccb', '📋'],
  ['\ud83d\udcac', '💬'],
  ['\ud83d\udce3', '📣'],
  ['\ud83d\udcf1', '📱'],
  ['\ud83d\udf79\ufe0f', '🕹️'],
  ['\ud83d\udcbe', '💾'],
  ['\ud83d\udddA\ufe0f', '🗺️'],
  ['\ud83d\udcc5', '📅'],
  ['\ud83e\udd16', '🤖'],
  ['\ud83c\udfaf', '🎯'],
  ['\ud83c\udfA8', '🎨'],
  ['\ud83c\udfae', '🎮'],
  ['\ud83d\udcb0', '💰'],
];

for (const [hex, emoji] of patterns) {
  if (content.includes(hex)) {
    const count = (content.match(new RegExp(hex, 'g')) || []).length;
    content = content.split(hex).join(emoji);
    fixes++;
    console.log('✓ Replaced hex pattern ' + fixes);
  }
}

fs.writeFileSync(file, content, 'utf-8');
console.log('Completed: ' + fixes + ' types');
