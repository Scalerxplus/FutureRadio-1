const fs = require('fs');
const path = require('path');
const mm = require('music-metadata');

const dir = path.join(process.cwd(), 'public', 'audio', 'originals');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.mp3'));

let metadataList = [];

const counters = {
  tain_sun: 1,
  main_tum: 1,
  dekhi_leb: 1,
  dhuaan: 1
};

async function processFiles() {
  for (const file of files) {
    if (file.toLowerCase().includes('sweeper')) continue;

    let baseName = '';
    let title = '';
    let energyScore = 0.5;

    if (file.includes('कोरेक्स')) {
      title = 'Tain Sun';
      baseName = `tain_sun_${counters.tain_sun++}`;
      energyScore = 0.8; 
    } else if (file.includes('खिड़की की परछाई')) {
      title = 'Main Tum Aur Hum';
      baseName = `main_tum_aur_hum_${counters.main_tum++}`;
      energyScore = 0.5; 
    } else if (file.includes('छाले')) {
      title = 'Dekhi Leb';
      baseName = `dekhi_leb_${counters.dekhi_leb++}`;
      energyScore = 0.6;
    } else if (file.includes('लाइट बंद')) {
      title = 'Dhuaan';
      baseName = `dhuaan_${counters.dhuaan++}`;
      energyScore = 0.7;
    } else {
      continue;
    }

    const newFilename = `${baseName}.mp3`;
    const oldPath = path.join(dir, file);
    const newPath = path.join(dir, newFilename);
    
    fs.renameSync(oldPath, newPath);

    const metadata = await mm.parseFile(newPath);
    const duration = Math.round((metadata.format.duration || 180) * 1000);

    // Extract correct counter key for formatting
    let counterKey = '';
    if (baseName.startsWith('tain_sun')) counterKey = 'tain_sun';
    if (baseName.startsWith('main_tum')) counterKey = 'main_tum';
    if (baseName.startsWith('dekhi_leb')) counterKey = 'dekhi_leb';
    if (baseName.startsWith('dhuaan')) counterKey = 'dhuaan';

    metadataList.push({
      id: `original_${baseName}`,
      title: `${title} (Version ${counters[counterKey] - 1})`,
      artist: 'TheFutureRadioNetwork',
      album: 'The Future Radio Originals',
      durationSeconds: Math.floor(duration / 1000),
      durationMs: duration,
      streamUrl: `/audio/originals/${newFilename}`,
      artwork_url: '/logo-horizontal.png',
      coverArt: '/logo-horizontal.png',
      permalink: 'https://thefutureradio.com',
      energyScore: energyScore
    });
  }

  fs.writeFileSync(path.join(dir, 'metadata.json'), JSON.stringify(metadataList, null, 2));
  console.log('Processed', metadataList.length, 'original songs.');
}

processFiles().catch(console.error);
