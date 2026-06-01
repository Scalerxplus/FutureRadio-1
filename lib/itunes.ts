import { AudiusTrack } from "./audius";

const FALLBACK_PODCAST: AudiusTrack = {
  id: "system-fallback-podcast-1",
  title: "Future Radio Tech Update",
  artist: "Future Radio News Desk",
  durationSeconds: 180,
  streamUrl: "/audio/fallbacks/Future_Radio_2.mp3",
  artwork_url: "",
  permalink: ""
};

export async function searchPodcastEpisode(query: string, excludeIds: Set<string>): Promise<AudiusTrack> {
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=podcast&entity=podcastEpisode&limit=50`;
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error("iTunes API failed");
    
    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      return FALLBACK_PODCAST;
    }

    // Filter results to find an episode UNDER 12 minutes (720,000 ms), with a valid MP3 URL, and not recently played
    const MAX_DURATION_MS = 12 * 60 * 1000;
    
    const validEpisodes = data.results.filter((ep: any) => {
        if (!ep.episodeUrl || !ep.episodeUrl.includes(".mp3")) return false;
        if (!ep.trackTimeMillis || ep.trackTimeMillis > MAX_DURATION_MS) return false;
        if (excludeIds.has(ep.trackId.toString())) return false;
        return true;
    });

    if (validEpisodes.length === 0) {
        // If no short episodes found, just return the fallback to prevent engine crash
        return FALLBACK_PODCAST;
    }

    // Pick a random valid episode
    const selected = validEpisodes[Math.floor(Math.random() * validEpisodes.length)];

    return {
      id: selected.trackId.toString(),
      title: selected.trackName || "Podcast Episode",
      artist: selected.collectionName || "Unknown Show",
      durationSeconds: Math.floor((selected.trackTimeMillis || 180000) / 1000),
      streamUrl: selected.episodeUrl,
      artwork_url: selected.artworkUrl600 || selected.artworkUrl160 || "",
      permalink: selected.trackViewUrl || ""
    };

  } catch (err) {
    console.error("[iTunes API] Search failed:", err);
    return FALLBACK_PODCAST;
  }
}
