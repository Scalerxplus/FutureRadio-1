import fs from 'fs';
import path from 'path';

function scanDirectory(dir, baseDir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(scanDirectory(fullPath, baseDir));
      } else {
        if (file.endsWith('.mp3') || file.endsWith('.wav')) {
          results.push(fullPath.replace(baseDir, '').replace(/\\/g, '/'));
        }
      }
    });
  } catch(e) {}
  return results;
}

const baseVaultDir = path.join(process.cwd(), 'public', 'local_audio_vault');
const baseAudioDir = path.join(process.cwd(), 'public', 'audio');

const manifest = {
  files: scanDirectory(baseVaultDir, path.join(process.cwd(), 'public')).concat(scanDirectory(baseAudioDir, path.join(process.cwd(), 'public')))
};

fs.writeFileSync(path.join(process.cwd(), 'public', 'audio-manifest.json'), JSON.stringify(manifest, null, 2));
console.log('Audio manifest generated successfully!');
