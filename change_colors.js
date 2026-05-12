const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf8');

// Replace hex codes
css = css.replace(/#ff1a1a/gi, '#800020'); // Wine / Burgundy
css = css.replace(/#ff3a3a/gi, '#a32638'); // Lighter Wine for text
css = css.replace(/#ff0000/gi, '#800000'); // Maroon

// Replace rgb/rgba values
// 255, 30, 30 -> 128, 0, 32 (Wine)
css = css.replace(/255,\s*30,\s*30/g, '128, 0, 32');
// 255, 0, 0 -> 128, 0, 0 (Maroon)
css = css.replace(/255,\s*0,\s*0/g, '128, 0, 0');
// 255, 50, 50 -> 140, 20, 50 (Lighter Wine)
css = css.replace(/255,\s*50,\s*50/g, '140, 20, 50');

fs.writeFileSync('style.css', css, 'utf8');
console.log("Colors updated");
