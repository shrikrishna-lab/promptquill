const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
if (!fs.existsSync(pagesDir)) {
    console.error("Pages directory not found: " + pagesDir);
    process.exit(1);
}

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));
let modifiedCount = 0;

files.forEach(file => {
    const p = path.join(pagesDir, file);
    let content = fs.readFileSync(p, 'utf8');
    
    // Convert strict desktop-only modal width sizes (400px - 699px)
    // to width: '100%', maxWidth: '___px'
    let newContent = content.replace(/width:\s*['"]([456]\d\d)px['"]/g, "width: '100%', maxWidth: '$1px'");
    
    // Also convert padding: '40px' on massive modals to a responsive padding (wait, let's leave padding alone)

    if (content !== newContent) {
        fs.writeFileSync(p, newContent);
        console.log('Updated ' + file);
        modifiedCount++;
    }
});

console.log('Fixed modal widths in ' + modifiedCount + ' files.');
