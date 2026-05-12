const fs = require('fs');
const https = require('https');

let content = fs.readFileSync('songs.js', 'utf8');
let match = content.match(/const songDatabase = (\[[\s\S]*?\]);/);
let db = eval(match[1]);

async function checkUrl(url) {
    return new Promise((resolve) => {
        if (!url || !url.startsWith('http')) return resolve(false);
        const req = https.request(url, { method: 'HEAD' }, (res) => {
            resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.end();
    });
}

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

async function validateAndFix() {
    let changed = false;
    for (let i = 0; i < db.length; i++) {
        const song = db[i];
        console.log(`Checking [${i+1}/${db.length}] ${song.title}...`);
        const ok = await checkUrl(song.image);
        if (!ok) {
            console.log(`  !! Broken image: ${song.image}`);
            console.log(`  Fetching new cover for ${song.title}...`);
            const newCover = await fetchCover(song.title, song.artist);
            if (newCover) {
                song.image = newCover;
                changed = true;
                console.log(`  -> Fixed: ${newCover}`);
            } else {
                console.log(`  -> Failed to find new cover.`);
            }
        }
    }
    
    if (changed) {
        let newContent = `const songDatabase = ${JSON.stringify(db, null, 2)};`;
        fs.writeFileSync('songs.js', newContent, 'utf8');
        console.log("songs.js updated with fixed covers.");
    } else {
        console.log("All images are healthy.");
    }
}

validateAndFix();
