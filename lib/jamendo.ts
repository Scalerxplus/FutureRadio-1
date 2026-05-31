export interface JamendoTrack {
  id: string;
  name: string;
  artist_name: string;
  duration: number;
  audio: string;
  shareurl: string;
  license_ccurl: string;
}

// Public client_id for testing Jamendo API. In production, this should be an env variable.
const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID || '56d30c95';

export async function searchJamendoTrack(query: string, maxRetries = 3): Promise<any[]> {
  const encodedQuery = encodeURIComponent(query);
  const searchUrl = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=30&tags=${encodedQuery}&include=musicinfo`;

  let attempt = 0;
  let delay = 1000;

  while (attempt < maxRetries) {
    try {
      const res = await fetch(searchUrl, { next: { revalidate: 3600 } }); // Cache for 1 hour to prevent rate limits
      
      if (res.status === 429 || res.status >= 500) {
        throw new Error(`HTTP ${res.status} from Jamendo`);
      }

      const json = await res.json();
      
      if (json.results && json.results.length > 0) {
        // Map to our common AudiusTrack interface used by the rest of the app
        const mappedTracks = json.results.map((track: JamendoTrack) => ({
          id: `jamendo-${track.id}`,
          title: track.name,
          artist: track.artist_name,
          durationSeconds: track.duration,
          streamUrl: track.audio,
          permalink: track.shareurl,
          license: track.license_ccurl || 'CC-BY'
        }));

        return mappedTracks;
      }
      return [];
    } catch (err) {
      console.warn(`[Jamendo] Attempt ${attempt + 1} failed:`, err);
      attempt++;
      if (attempt >= maxRetries) {
        console.error(`[Jamendo] All ${maxRetries} attempts failed.`);
        return [];
      }
      await new Promise(res => setTimeout(res, delay));
      delay *= 2; 
    }
  }
  return [];
}
