const fs = require('fs');
const https = require('https');

// Extract songDatabase from songs.js
let content = fs.readFileSync('songs.js', 'utf8');
let match = content.match(/const songDatabase = (\[[\s\S]*?\]);/);
if (!match) {
    console.error("Could not parse songs.js");
    process.exit(1);
}

let db = eval(match[1]);

async function fetchCover(title, artist) {
    return new Promise((resolve) => {
        let query = encodeURIComponent(`${title} ${artist}`);
        let url = `https://itunes.apple.com/search?term=${query}&entity=song&limit=1`;
        
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    let json = JSON.parse(data);
                    if (json.results && json.results.length > 0) {
                        let artwork = json.results[0].artworkUrl100;
                        resolve(artwork.replace('100x100bb', '600x600bb'));
                    } else {
                        resolve(null);
                    }
                } catch(e) {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
    });
}

async function updateSongs() {
    let changed = false;
    for (let i = 0; i < db.length; i++) {
        if (db[i].image && db[i].image.includes('source.unsplash.com')) {
            console.log(`Fetching cover for ${db[i].title} - ${db[i].artist}`);
            let cover = await fetchCover(db[i].title, db[i].artist);
            if (cover) {
                db[i].image = cover;
                changed = true;
                console.log(`-> Found: ${cover}`);
            } else {
                console.log(`-> Not found`);
            }
        }
    }
    
    if (changed) {
        let newContent = `const songDatabase = ${JSON.stringify(db, null, 2)};`;
        fs.writeFileSync('songs.js', newContent, 'utf8');
        console.log("songs.js updated successfully.");
    } else {
        console.log("No changes made.");
    }
}

updateSongs();
