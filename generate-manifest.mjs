import fs from 'fs';
import path from 'path';
import * as mm from 'music-metadata';

async function scanDirectory(dir, baseDir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(await scanDirectory(fullPath, baseDir));
      } else {
        if (file.endsWith('.mp3') || file.endsWith('.wav')) {
          const relativePath = fullPath.replace(baseDir, '').replace(/\\/g, '/');
          
          let duration = 200;
          let title = file.replace(/\.[^/.]+$/, "");
          let artist = "Future Radio";
          
          try {
            const metadata = await mm.parseFile(fullPath);
            duration = metadata.format.duration || 200;
            if (metadata.common.title) title = metadata.common.title;
            if (metadata.common.artist) artist = metadata.common.artist;
          } catch(e) {}
          
          results.push({
            path: relativePath,
            duration: duration,
            title: title,
            artist: artist
          });
        }
      }
    }
  } catch(e) {}
  return results;
}

async function run() {
  const baseVaultDir = path.join(process.cwd(), 'public', 'local_audio_vault');
  const baseAudioDir = path.join(process.cwd(), 'public', 'audio');

  const files = [];
  const vaultFiles = await scanDirectory(baseVaultDir, path.join(process.cwd(), 'public'));
  const audioFiles = await scanDirectory(baseAudioDir, path.join(process.cwd(), 'public'));
  
  files.push(...vaultFiles);
  files.push(...audioFiles);

  const manifest = { files };

  fs.writeFileSync(path.join(process.cwd(), 'public', 'audio-manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('Audio manifest generated successfully with metadata!');
}

run();
