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
}

export async function searchAudiusTrack(query: string): Promise<AudiusTrack[]> {
  try {
    const host = await getAudiusHost();
    const encodedQuery = encodeURIComponent(query);
    const searchUrl = `${host}/v1/tracks/search?query=${encodedQuery}&app_name=${APP_NAME}&limit=30`;
    
    const res = await fetch(searchUrl);
    const json = await res.json();
    
    if (json.data && json.data.length > 0) {
      return json.data.map((track: any) => ({
        id: track.id,
        title: track.title,
        artist: track.user.name,
        durationSeconds: track.duration,
        streamUrl: `${host}/v1/tracks/${track.id}/stream?app_name=${APP_NAME}`
      }));
    }
    return [];
  } catch (error) {
    console.error(`[Audius] Failed to search for ${query}:`, error);
    return [];
  }
}
