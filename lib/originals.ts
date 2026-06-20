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
  try {
    const metaPath = path.join(process.cwd(), 'public', 'audio', 'originals', 'metadata.json');
    if (!fs.existsSync(metaPath)) return [];
    const data = fs.readFileSync(metaPath, 'utf8');
    const parsed = JSON.parse(data);
    
    // Filter out files that no longer exist
    const existingTracks = parsed.filter((track: any) => {
       try {
           const urlPath = track.streamUrl.split('?')[0];
           const decodedPath = decodeURIComponent(urlPath);
           const filePath = path.join(process.cwd(), 'public', decodedPath);
           return fs.existsSync(filePath);
       } catch (e) {
           return false;
       }
    });
    
    // Inject station tags on the fly based on user policy
    return existingTracks.map((track: any) => {
      let stations = ["global"]; // By default, most are global
      
      const t = track.title.toLowerCase();
      // Tain Sun & Dekhi Leb are Bagheli but have global appeal
      if (t.includes("tain sun") || t.includes("dekhi leb") || t.includes("bagheli jingle")) {
        stations = ["bagheli", "global"];
      }
      // "fr_" tracks are specifically marked for fallbacks but also belong to global
      if (t.startsWith("fr_")) {
         stations = ["global", "fallback"];
      }
      
      return { ...track, target_stations: stations };
    });
  } catch (e) {
    console.error('[Originals] Failed to load metadata', e);
    return [];
  }
}

export function getFallbackOriginal(targetEnergy?: number): string | null {
  const tracks = getOriginalTracks();
  const fallbacks = tracks.filter(t => t.title.toLowerCase().startsWith('fr_') || t.streamUrl.toLowerCase().includes('/fr_'));
  
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

export function getOriginalForStation(cityId: string, playedSongs: Set<string>, allowSpecial: boolean = true, onlyNew: boolean = false): OriginalTrack | null {
    const tracks = getOriginalTracks();
    
    const isTrackValid = (t: OriginalTrack, targetStation: string) => {
        if (!t.target_stations.includes(targetStation)) return false;
        if (targetStation === "global" && t.target_stations.includes("fallback")) return false;
        if (playedSongs.has(t.id) || playedSongs.has(t.streamUrl)) return false;
        
        if (onlyNew && !t.isNew) return false;
        
        const titleLower = t.title.toLowerCase();
        const isSpecial = titleLower.includes("dekhi leb") || titleLower.includes("tain sun");
        if (isSpecial && !allowSpecial) return false;
        
        return true;
    };
    
    // Exact match for regional priority
    let valid = tracks.filter(t => isTrackValid(t, cityId));
    
    // If no exact match (or if station is global), fallback to global tracks
    if (valid.length === 0 && cityId !== "global") {
        valid = tracks.filter(t => isTrackValid(t, "global"));
    }
    
    if (valid.length > 0) {
        const track = valid[Math.floor(Math.random() * valid.length)];
        playedSongs.add(track.id);
        playedSongs.add(track.streamUrl);
        return track;
    }
    return null;
}
