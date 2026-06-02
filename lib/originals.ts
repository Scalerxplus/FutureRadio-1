import fs from 'fs';
import path from 'path';

export interface OriginalTrack {
  id: string;
  title: string;
  artist: string;
  durationMs: number;
  durationSeconds: number;
  streamUrl: string;
  energyScore: number;
  target_stations: string[];
}

let originalsCache: OriginalTrack[] | null = null;

export function getOriginalTracks(): OriginalTrack[] {
  if (originalsCache) return originalsCache;
  try {
    const metaPath = path.join(process.cwd(), 'public', 'audio', 'originals', 'metadata.json');
    if (!fs.existsSync(metaPath)) return [];
    const data = fs.readFileSync(metaPath, 'utf8');
    const parsed = JSON.parse(data);
    
    // Inject station tags on the fly based on user policy
    originalsCache = parsed.map((track: any) => {
      let stations = ["global"]; // By default, most are global
      
      const t = track.title.toLowerCase();
      // Tain Sun & Dekhi Leb are Bagheli but have global appeal
      if (t.includes("tain sun") || t.includes("dekhi leb")) {
        stations = ["bagheli", "global"];
      }
      // "fr_" tracks are specifically marked for fallbacks but also belong to global
      if (t.startsWith("fr_")) {
         stations = ["global", "fallback"];
      }
      
      return { ...track, target_stations: stations };
    });
    
    return originalsCache || [];
  } catch (e) {
    console.error('[Originals] Failed to load metadata', e);
    return [];
  }
}

export function getFallbackOriginal(targetEnergy?: number): string | null {
  const tracks = getOriginalTracks();
  let fallbacks = tracks.filter(t => t.title.toLowerCase().startsWith('fr_') || t.streamUrl.toLowerCase().includes('/fr_'));
  
  if (fallbacks.length > 0) {
     if (targetEnergy !== undefined) {
         fallbacks.sort((a, b) => Math.abs((a.energyScore || 0.5) - targetEnergy) - Math.abs((b.energyScore || 0.5) - targetEnergy));
         const topMatches = fallbacks.slice(0, Math.min(3, fallbacks.length));
         return topMatches[Math.floor(Math.random() * topMatches.length)].streamUrl;
     }
     return fallbacks[Math.floor(Math.random() * fallbacks.length)].streamUrl;
  }
  return null;
}

export function getOriginalForStation(cityId: string, playedSongs: Set<string>): OriginalTrack | null {
    const tracks = getOriginalTracks();
    
    // Exact match for regional priority
    let valid = tracks.filter(t => t.target_stations.includes(cityId) && !playedSongs.has(t.id));
    
    // If no exact match (or if station is global), fallback to global tracks
    if (valid.length === 0) {
        valid = tracks.filter(t => t.target_stations.includes("global") && !playedSongs.has(t.id) && !t.target_stations.includes("fallback"));
    }
    
    if (valid.length > 0) {
        const track = valid[Math.floor(Math.random() * valid.length)];
        playedSongs.add(track.id);
        return track;
    }
    return null;
}
