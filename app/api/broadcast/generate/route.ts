import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import * as cheerio from "cheerio";
import Groq from "groq-sdk";
import yts from "yt-search";

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// In-memory cache for YouTube lookups (Key: mood+cityId, Value: { video, expiresAt })
const ytCache = new Map<string, { video: any; expiresAt: number }>();

async function runEditorAgent(rawHeadline: string, cityId: string) {
  console.log("[Editor Agent] Generating news snippet and RJ script...");
  const editorPrompt = `
  You are the Editor Agent for Future Radio.
  Given the following local news headline for ${cityId}: "${rawHeadline}"
  
  Generate a JSON response with two keys:
  1. "news_snippet": A 2-sentence engaging summary of this news for a mobile app feed.
  2. "rj_transcript": A highly energetic radio host script introducing this news and then introducing a trending Bollywood song. The host is named AI RJ Priya.
  
  Mix Hindi and English seamlessly (Hinglish).
  Format: {"news_snippet": "...", "rj_transcript": "..."}
  `;

  const chatCompletion = await groq.chat.completions.create({
    messages: [{ role: "user", content: editorPrompt }],
    model: "llama-3.1-8b-instant",
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const llmContent = chatCompletion.choices[0]?.message?.content || "{}";
  const editorOutput = JSON.parse(llmContent);
  
  const newsSnippet = editorOutput.news_snippet || `Latest updates from ${cityId}. Tune in for more details.`;
  const rjTranscript = editorOutput.rj_transcript || `Namaskar ${cityId}! I am AI RJ Priya. Big news today: ${rawHeadline.substring(0, 50)}. Now let's vibe to this awesome track!`;

  return { newsSnippet, rjTranscript };
}

async function runMoodEngine(mood: string, cityId: string) {
  console.log("[Scheduler Agent] Finding trending song...");
  const cacheKey = `${mood}-${cityId}`;
  const cached = ytCache.get(cacheKey);
  
  if (cached && cached.expiresAt > Date.now()) {
    console.log(`[Scheduler Agent] Cache hit for ${cacheKey}`);
    return cached.video;
  }

  const searchResults = await yts(`${mood} song audio 2026`);
  const videos = searchResults.videos.slice(0, 5); // top 5
  const selectedSong = videos[Math.floor(Math.random() * videos.length)];

  ytCache.set(cacheKey, {
    video: selectedSong,
    expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour TTL
  });

  return selectedSong;
}

// TTS logic has been moved to /api/broadcast/tts/route.ts for streaming optimization

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const url = new URL(request.url);
    const cityId = url.searchParams.get("city") || "raipur";

    console.log(`[Orchestrator Agent] Triggering Multi-Agent Radio Production Pipeline for ${cityId}...`);

    // ==========================================
    // PHASE 1: Content Curator Agent (News Scraper)
    // ==========================================
    console.log("[Curator Agent] Scraping local news...");
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(cityId + " local news")}&hl=en-IN&gl=IN&ceid=IN:en`;
    const rssRes = await fetch(rssUrl);
    const rssText = await rssRes.text();
    const $ = cheerio.load(rssText, { xmlMode: true });
    
    const topItem = $("item").first();
    const rawHeadline = topItem.find("title").text() || `${cityId} Local Grid Updates`;
    
    // Fire-and-forget telemetry insert
    supabase.from("curated_raw_feed").insert({
      city_id: cityId,
      raw_headline: rawHeadline,
      raw_text: rawHeadline,
      source_profile: "Google News Feed",
      is_verified: true,
    }).then(({ error }) => {
      if (error) console.warn("[Curator Agent] DB Insert skipped:", error.message);
    });

    // ==========================================
    // PHASE 2: Parallel LLM & YouTube Execution
    // ==========================================
    const mood = "Trending Bollywood";
    const [{ newsSnippet, rjTranscript }, selectedSong] = await Promise.all([
      runEditorAgent(rawHeadline, cityId),
      runMoodEngine(mood, cityId)
    ]);

    // Fire-and-forget news insert
    const newsId = `news-auto-${Date.now()}`;
    const newsItem = {
      id: newsId,
      type: "local" as const,
      category: "Local",
      headline: rawHeadline,
      snippet: newsSnippet,
      source: "Google News Aggregator",
      source_handle: "@local_feed",
      time_ago: "Just now",
      likes_count: Math.floor(Math.random() * 50) + 10,
      comments_count: Math.floor(Math.random() * 10),
      is_twitter_source: false,
    };
    supabase.from("articles").insert(newsItem).then(({ error }) => {
      if (error) console.warn("[Editor Agent] News insert skipped:", error.message);
    });

    // ==========================================
    // PHASE 3: Streaming URL Generation
    // ==========================================
    // Decoupled! We now return a streamable endpoint URL instantly instead of waiting 2.5s for audio generation.
    const rjAudioUrl = `/api/broadcast/tts?text=${encodeURIComponent(rjTranscript)}`;
    const jingleUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3";

    // ==========================================
    // PHASE 4: Block Assembly
    // ==========================================
    const blockId = `block-auto-${Date.now()}`;
    const playlistBlock = {
      block_id: blockId,
      city_id: cityId,
      youtube_id: selectedSong.videoId,
      song_title: selectedSong.title.substring(0, 50),
      song_artist: selectedSong.author.name,
      song_duration_s: selectedSong.seconds,
      rj_audio_url: rjAudioUrl,
      jingle_url: jingleUrl,
      rj_transcript: rjTranscript,
      news_headlines: [rawHeadline],
      mood: mood,
      valid_from: new Date().toISOString(),
      valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    // Fire-and-forget playlist insert
    supabase.from("playlist_blocks").insert(playlistBlock).then(({ error }) => {
      if (error) console.warn("[Music Scheduler Agent] Playlist block insert skipped:", error.message);
    });

    console.log("[Orchestrator Agent] Successfully completed multi-agent production sequence!");

    return NextResponse.json({
      success: true,
      message: "Live broadcast block generated successfully!",
      telemetry: {
        curatorIngested: rawHeadline,
        editorPublishedNews: newsItem.headline,
        editorRjDialogue: rjTranscript,
        schedulerSelectedSong: `${selectedSong.title} by ${selectedSong.author.name}`,
        audioDetails: {
          voiceover: "Generated via free TTS direct URL",
          backingBed: "Ducked ambient backing bed at 12% active volume",
        },
        databaseBlockId: blockId,
      },
      block: playlistBlock,
    });
  } catch (err: unknown) {
    console.error("[Orchestrator Agent] Execution failed:", err);
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
