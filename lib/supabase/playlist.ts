import { createClient } from "./client";
import { PlaylistBlock } from "../types";

// Seed 3 popular Hindi songs as our playlist mock data fallback
export const MOCK_PLAYLIST: PlaylistBlock[] = [
  {
    blockId: "block-1",
    cityId: "raipur",
    youtubeId: "BddP6PYo2Gs", // Kesariya (official Brahmastra video ID)
    songTitle: "Kesariya",
    songArtist: "Arijit Singh, Pritam",
    songDurationS: 268,
    rjAudioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    jingleUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    rjTranscript: "Namaskar Raipur! Main hoon aapka AI RJ Priya. Kesariya gana suniye, aur weather Raipur mein mast hai!",
    newsHeadlines: ["Raipur smart telemetry systems upgraded.", "Local weather forecasts predict clear skies."],
    mood: "romantic",
    validFrom: "2026-05-24T00:00:00Z",
    validUntil: "2026-05-24T23:59:59Z",
  },
  {
    blockId: "block-2",
    cityId: "raipur",
    youtubeId: "Umqb9K3tT20", // Tum Hi Ho (official Aashiqui 2 video ID)
    songTitle: "Tum Hi Ho",
    songArtist: "Arijit Singh, Mithoon",
    songDurationS: 262,
    rjAudioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    jingleUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    rjTranscript: "Arijit Singh ka yeh bemisaal gana, sirf aapke liye Raipur ke grid par.",
    newsHeadlines: ["New cultural hub opening in Raipur central.", "Local sports academy selects top recruits."],
    mood: "soulful",
    validFrom: "2026-05-24T00:00:00Z",
    validUntil: "2026-05-24T23:59:59Z",
  },
  {
    blockId: "block-3",
    cityId: "raipur",
    youtubeId: "huxhqpWZ4Gs", // Zaalima (official Raees video ID)
    songTitle: "Zaalima",
    songArtist: "Arijit Singh, Harshdeep Kaur",
    songDurationS: 299,
    rjAudioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    jingleUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    rjTranscript: "Zaalima gana suniye aur mere sath bane rahiye Future Radio Raipur par.",
    newsHeadlines: ["Surat grid and Raipur soundwave sync completes.", "AI news forecasting launches at scale."],
    mood: "groove",
    validFrom: "2026-05-24T00:00:00Z",
    validUntil: "2026-05-24T23:59:59Z",
  },
];

const isSupabaseConfigured = () => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

// Map DB row to PlaylistBlock
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapRowToPlaylistBlock = (row: any): PlaylistBlock => ({
  blockId: row.block_id,
  cityId: row.city_id,
  youtubeId: row.youtube_id,
  songTitle: row.song_title,
  songArtist: row.song_artist,
  songDurationS: row.song_duration_s,
  rjAudioUrl: row.rj_audio_url,
  jingleUrl: row.jingle_url,
  rjTranscript: row.rj_transcript,
  newsHeadlines: row.news_headlines || [],
  mood: row.mood,
  validFrom: row.valid_from,
  validUntil: row.valid_until,
});

export async function getPlaylistBlocks(cityId: string): Promise<PlaylistBlock[]> {
  try {
    console.log(`[Supabase Playlist] Fetching live block for ${cityId} from multi-agent API...`);
    const res = await fetch(`/api/broadcast/generate?city=${cityId}`);
    if (!res.ok) throw new Error("API failed");
    
    const json = await res.json();
    if (json.success && json.block) {
      return [mapRowToPlaylistBlock(json.block)];
    }
  } catch (err) {
    console.error("[Supabase Playlist] Live API failed:", err);
  }

  // If the API fails, return empty array so we don't accidentally load 6-minute mock tracks
  return [];
}

export async function getBroadcastSchedule(cityId: string) {
  try {
    const supabase = createClient();
    // Offset by -15 minutes to prevent dropping the active block if the user's clock is skewed
    const fetchThreshold = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from("broadcast_schedule")
      .select("*")
      .eq("city_id", cityId)
      .gte("end_time", fetchThreshold)
      .order("start_time", { ascending: true })
      .limit(500);
    
    if (error) throw error;
    if (!data || data.length === 0) return [];

    return data;
  } catch (err) {
    console.error("[Supabase Playlist] Failed to fetch schedule:", err);
    return [];
  }
}

/**
 * Likes or unlikes a song block for the current authenticated user
 */
export async function toggleLikeSong(
  userId: string,
  songId: string,
  currentlyLiked: boolean
): Promise<boolean> {
  if (!isSupabaseConfigured() || !userId) {
    return true; // Mock success
  }

  const supabase = createClient();

  try {
    if (currentlyLiked) {
      const { error } = await supabase
        .from("user_likes")
        .delete()
        .eq("user_id", userId)
        .eq("item_type", "song")
        .eq("item_id", songId);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("user_likes")
        .insert({
          user_id: userId,
          item_type: "song",
          item_id: songId,
        });

      if (error) throw error;
    }
    return true;
  } catch (err) {
    console.error("[Supabase Playlist] Error toggling song like:", err);
    return false;
  }
}

/**
 * Gets a list of song IDs liked by the user
 */
export async function getUserLikedSongs(userId: string): Promise<string[]> {
  if (!isSupabaseConfigured() || !userId) {
    return [];
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("user_likes")
      .select("item_id")
      .eq("user_id", userId)
      .eq("item_type", "song");

    if (error) throw error;
    return data ? data.map((item: { item_id: string }) => item.item_id) : [];
  } catch (err) {
    console.error("[Supabase Playlist] Error getting user liked songs:", err);
    return [];
  }
}
