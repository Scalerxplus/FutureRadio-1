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

export function getRandomOriginalTrack(cityId: string, playedSongs: Set<string>) {
  const tracks = getOriginalTracks();
  if (!tracks.length) return null;

  // Filter based on cityId vibe
  let targetEnergyMin = 0;
  let targetEnergyMax = 1;

  if (cityId === 'chill' || cityId === 'romance') {
    targetEnergyMax = 0.65;
  } else if (cityId === 'party' || cityId === 'drive') {
    targetEnergyMin = 0.65;
  }

  const validTracks = tracks.filter(t => {
    if (playedSongs.has(t.id)) return false;
    const energy = t.energyScore || 0.5;
    return energy >= targetEnergyMin && energy <= targetEnergyMax;
  });

  if (validTracks.length === 0) return null;

  const selected = validTracks[Math.floor(Math.random() * validTracks.length)];
  return selected;
}
