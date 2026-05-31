const APP_NAME = 'FutureRadio';

let audiusHost: string | null = null;

async function getAudiusHost(): Promise<string> {
  if (audiusHost) return audiusHost;
  try {
    const res = await fetch('https://api.audius.co');
    const json = await res.json();
    audiusHost = json.data[0];
    return audiusHost as string;
  } catch (err) {
    console.error("Failed to get Audius host, using default.", err);
    return 'https://discoveryprovider.audius.co';
  }
}

export interface AudiusTrack {
  id: string;
  title: string;
  artist: string;
  durationSeconds: number;
  streamUrl: string;
  permalink: string;
  license: string;
}

export async function searchAudiusTrack(query: string, maxRetries = 3): Promise<AudiusTrack[]> {
  const host = await getAudiusHost();
  const encodedQuery = encodeURIComponent(query);
  const searchUrl = `${host}/v1/tracks/search?query=${encodedQuery}&app_name=${APP_NAME}&limit=30`;

  let attempt = 0;
  let delay = 1000;

  while (attempt < maxRetries) {
    try {
      const res = await fetch(searchUrl);
      
      // If rate limited, throw an error to trigger the retry block
      if (res.status === 429 || res.status >= 500) {
        throw new Error(`HTTP ${res.status} from Audius`);
      }

      const json = await res.json();
      
      if (json.data && json.data.length > 0) {
        // Strict OML Compliance: Filter out "All Rights Reserved"
        const legalTracks = json.data.filter((track: any) => 
          !track.license || track.license.toLowerCase() !== 'all rights reserved'
        );

        if (legalTracks.length > 0) {
          return legalTracks.map((track: any) => ({
            id: track.id,
            title: track.title,
            artist: track.user?.name || "Unknown Artist",
            durationSeconds: track.duration,
            streamUrl: `${host}/v1/tracks/${track.id}/stream?app_name=${APP_NAME}`,
            permalink: track.permalink || `https://audius.co/${track.user?.handle}/${track.permalink || track.id}`,
            license: track.license || "CC-BY"
          }));
        }
      }
      return []; // Return empty if no results, not a retryable error
    } catch (error) {
      attempt++;
      console.warn(`[Audius] Failed search attempt ${attempt} for '${query}':`, error);
      if (attempt >= maxRetries) {
        console.error(`[Audius] All ${maxRetries} retries failed for '${query}'.`);
        return [];
      }
      // Wait before retrying (exponential backoff: 1s, 2s, 4s)
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
  return [];
}
