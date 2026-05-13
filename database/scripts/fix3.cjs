const fs = require('fs');
const path = require('path');

let f1 = path.join(__dirname, 'src', 'pages', 'WrappedPage.jsx');
let d1 = fs.readFileSync(f1, 'utf8');
d1 = d1.replace(/Your Best Idea [^<]+<\/h2>/, 'Your Best Idea 🏆</h2>');
fs.writeFileSync(f1, d1, 'utf8');

let f2 = path.join(__dirname, 'src', 'pages', 'LandingPage.jsx');
let d2 = fs.readFileSync(f2, 'utf8');
d2 = d2.replace(/icon: '.*?', title: 'Global Community'/g, "icon: '🌍', title: 'Global Community'");
d2 = d2.replace(/icon: '.*?', title: 'Enterprise Support'/g, "icon: '🛡️', title: 'Enterprise Support'");
d2 = d2.replace(/>.*?</, ">🛡️<"); // need to replace the 48px one
fs.writeFileSync(f2, d2, 'utf8');

console.log('Fixed WrappedPage & LandingPage manually.');
