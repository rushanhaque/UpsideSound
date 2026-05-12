const fs = require('fs');
const https = require('https');

let content = fs.readFileSync('songs.js', 'utf8');

content = content.replace(/Beyonc├⌐/g, 'Beyoncé');
content = content.replace(/Where Are ├£ Now/g, 'Where Are Ü Now');
content = content.replace(/Jack ├£/g, 'Jack Ü');
content = content.replace(/M├Ñneskin/g, 'Måneskin');
content = content.replace(/I DonΓÇÖt Wanna/g, "I Don't Wanna");

fs.writeFileSync('songs.js', content, 'utf8');

// Also try to refetch missing
let match = content.match(/const songDatabase = (\[[\s\S]*?\]);/);
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
    }
}
updateSongs();
