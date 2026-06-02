const fs = require('fs');
const path = require('path');
const mm = require('music-metadata');

const dir = path.join(process.cwd(), 'public', 'audio', 'originals');
const metaPath = path.join(dir, 'metadata.json');

let metadataList = [];
if (fs.existsSync(metaPath)) {
  metadataList = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
}

const newFilesMapping = [
  { original: 'Purani Kitab - Romance 01.mp3', new: 'purani_kitab_1.mp3', title: 'Purani Kitab (Version 1)', energy: 0.5 },
  { original: 'Purani Kitab - Romance 02.mp3', new: 'purani_kitab_2.mp3', title: 'Purani Kitab (Version 2)', energy: 0.5 },
  { original: 'Future Radio - Progressive 01.mp3', new: 'fr_progressive_1.mp3', title: 'Progressive', energy: 0.8 },
  { original: 'Future Radio - Progressive 02.mp3', new: 'fr_progressive_2.mp3', title: 'Progressive', energy: 0.8 },
  { original: 'Future Radio - Metallic 01.mp3', new: 'fr_metallic_1.mp3', title: 'Metallic', energy: 0.9 },
  { original: 'Future Radio - Metallic 02.mp3', new: 'fr_metallic_2.mp3', title: 'Metallic', energy: 0.9 },
  { original: 'Future Radio - Indie Dance 01.mp3', new: 'fr_indie_dance_1.mp3', title: 'Indie Dance', energy: 0.7 },
  { original: 'Futre Radio Indie Dance 02.mp3', new: 'fr_indie_dance_2.mp3', title: 'Indie Dance', energy: 0.7 }
];

async function processFiles() {
  let added = 0;
  for (const item of newFilesMapping) {
    const oldPath = path.join(dir, item.original);
    const newPath = path.join(dir, item.new);
    
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
      
      const metadata = await mm.parseFile(newPath);
      const duration = Math.round((metadata.format.duration || 180) * 1000);
      
      let baseId = item.new.replace(/\.mp3$/, '');
      let finalTitle = item.title;
      if (item.title === 'Progressive' || item.title === 'Metallic' || item.title === 'Indie Dance') {
          const v = item.new.split('_').pop().replace('.mp3', '');
          finalTitle = `${item.title} (Version ${v})`;
      }

      metadataList.push({
        id: `original_${baseId}`,
        title: finalTitle,
        artist: 'TheFutureRadioNetwork',
        album: 'The Future Radio Originals',
        durationSeconds: Math.floor(duration / 1000),
        durationMs: duration,
        streamUrl: `/audio/originals/${item.new}`,
        artwork_url: '/logo-horizontal.png',
        coverArt: '/logo-horizontal.png',
        permalink: 'https://thefutureradio.com',
        energyScore: item.energy
      });
      added++;
    }
  }

  fs.writeFileSync(metaPath, JSON.stringify(metadataList, null, 2));
  console.log('Added', added, 'new original songs.');
}

processFiles().catch(console.error);
