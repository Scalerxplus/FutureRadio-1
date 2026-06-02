import fs from 'fs';
import path from 'path';

let originalsCache: any[] | null = null;

export function getOriginalTracks() {
  if (originalsCache) return originalsCache;
  try {
    const metaPath = path.join(process.cwd(), 'public', 'audio', 'originals', 'metadata.json');
    const data = fs.readFileSync(metaPath, 'utf8');
    originalsCache = JSON.parse(data);
    return originalsCache || [];
  } catch (e) {
    console.error('[Originals] Failed to load metadata', e);
    return [];
  }
}

export function getHourlyOriginalsQueue(cityId: string, playedSongs: Set<string>) {
  const tracks = getOriginalTracks();
  if (!tracks.length) return [];

  const queue: any[] = [];

  const addRandomVersion = (titlePrefix: string, count: number) => {
    let available = tracks.filter(t => t.title.startsWith(titlePrefix) && !playedSongs.has(t.id));
    if (available.length < count) {
       available = tracks.filter(t => t.title.startsWith(titlePrefix));
    }
    available.sort(() => Math.random() - 0.5);
    for(let i = 0; i < count && i < available.length; i++) {
        queue.push(available[i]);
        playedSongs.add(available[i].id);
    }
  };

  if (cityId === 'global' || cityId === 'party' || cityId === 'drive') {
      addRandomVersion("Tain Sun", 2);
      addRandomVersion("Dekhi Leb", 2);
      addRandomVersion("Dhuaan", 1);
      addRandomVersion("Progressive", 1);
      addRandomVersion("Metallic", 1);
      addRandomVersion("Indie Dance", 1);
  } else if (cityId === 'chill' || cityId === 'romance' || cityId === 'love') {
      addRandomVersion("Main Tum Aur Hum", 2);
      addRandomVersion("Purani Kitab", 1);
  }
  
  return queue.sort(() => Math.random() - 0.5);
}
