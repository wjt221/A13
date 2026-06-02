const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const https = require('https');

const OUT = path.join(__dirname, 'assets', 'thumbs');
fs.mkdirSync(OUT, { recursive: true });

// name -> source (local file under assets/, or http URL)
const JOBS = {
  'us-open':      'assets/us-open.avif',
  'fbi':          'assets/fbi-event.avif',
  'holiday':      'assets/holiday-party.avif',
  'harvard':      'assets/harvard.avif',
  'valencia':     'assets/valencia.avif',
  'cranberry':    'assets/cranberry.avif',
  'stbarths':     'assets/St Barths.avif',
  'aspen':        'assets/aspen.avif',
  'wealth':       'assets/Family Trust & Estate.avif',
  'ai':           'assets/AI.avif',
  'scaling':      'https://images.unsplash.com/photo-1767021911618-3a9bcc9f3122?auto=format&fit=crop&w=900&q=80',
  'ceo':          'https://plus.unsplash.com/premium_photo-1661375171387-a40f423f465d?auto=format&fit=crop&w=900&q=80',
  'strategy':     'https://images.unsplash.com/photo-1759884247160-27b8465544b6?auto=format&fit=crop&w=900&q=80',
};

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchBuffer(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`${url} -> ${res.statusCode}`));
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function run() {
  for (const [name, src] of Object.entries(JOBS)) {
    try {
      let input;
      if (src.startsWith('http')) {
        input = await fetchBuffer(src);
      } else {
        input = fs.readFileSync(path.join(__dirname, src));
      }
      const outPath = path.join(OUT, `${name}.jpg`);
      await sharp(input)
        .resize(560, 520, { fit: 'cover', position: 'attention' })
        .jpeg({ quality: 82, mozjpeg: true })
        .toFile(outPath);
      const kb = Math.round(fs.statSync(outPath).size / 1024);
      console.log(`ok  ${name.padEnd(10)} ${kb} KB`);
    } catch (e) {
      console.log(`ERR ${name.padEnd(10)} ${e.message}`);
    }
  }
}
run();
