export interface NewsBite {
  providerName: string;
  mediaUrl: string;
  durationMs: number;
}

const GLOBAL_FEEDS = [
  { provider: "NPR News Now", url: "https://feeds.npr.org/500005/podcast.xml", fallbackDur: 300000 },
  { provider: "BBC Global News", url: "https://podcasts.files.bbci.co.uk/p02nq0gn.rss", fallbackDur: 1800000 },
  { provider: "WSJ Tech News", url: "https://video-api.wsj.com/podcast/rss/wsj/tech-news-briefing", fallbackDur: 900000 },
  { provider: "Fox News Hourly", url: "https://feeds.megaphone.fm/foxnewsradio", fallbackDur: 300000 }
];

export async function getGlobalNewsBite(slotIndex: number): Promise<NewsBite | null> {
  try {
    // Cycle through feeds based on slot index to give a variety across the 4 slots
    const feedConfig = GLOBAL_FEEDS[slotIndex % GLOBAL_FEEDS.length];
    
    // Add a cache buster so we always get the absolute latest news
    const res = await fetch(`${feedConfig.url}?cb=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch ${feedConfig.provider}`);
    
    const xml = await res.text();
    
    // Fast Regex to extract the first <enclosure url="..." />
    // We only want the top (latest) item's enclosure.
    const enclosureMatch = xml.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
    if (!enclosureMatch || !enclosureMatch[1]) {
      throw new Error("No media enclosure found in the RSS feed");
    }
    
    const mediaUrl = enclosureMatch[1];
    
    // Fast Regex to extract <itunes:duration> from the first item
    const durationMatch = xml.match(/<itunes:duration>([^<]+)<\/itunes:duration>/i);
    let durationMs = feedConfig.fallbackDur;
    
    if (durationMatch && durationMatch[1]) {
      const durStr = durationMatch[1].trim();
      if (durStr.includes(":")) {
        // Handle format "MM:SS" or "HH:MM:SS"
        const parts = durStr.split(":").map(Number);
        if (parts.length === 2) {
          durationMs = (parts[0] * 60 + parts[1]) * 1000;
        } else if (parts.length === 3) {
          durationMs = (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
        }
      } else {
        // Handle format "seconds"
        durationMs = parseInt(durStr, 10) * 1000;
      }
    }
    
    return {
      providerName: feedConfig.provider,
      mediaUrl: mediaUrl,
      durationMs: durationMs || feedConfig.fallbackDur
    };
    
  } catch (err) {
    console.error("[News Bites] Failed to fetch global news bite:", err);
    return null;
  }
}

const SHORT_GLOBAL_FEEDS = [
  { provider: "BBC Minute", url: "https://podcasts.files.bbci.co.uk/p02nq0lx.rss", fallbackDur: 60000 },
  { provider: "Fox News Hourly", url: "https://feeds.megaphone.fm/foxnewsradio", fallbackDur: 90000 }
];

export async function getShortGlobalNewsBite(slotIndex: number): Promise<NewsBite | null> {
  try {
    const feedConfig = SHORT_GLOBAL_FEEDS[slotIndex % SHORT_GLOBAL_FEEDS.length];
    const res = await fetch(`${feedConfig.url}?cb=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch ${feedConfig.provider}`);
    
    const xml = await res.text();
    const enclosureMatch = xml.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
    if (!enclosureMatch || !enclosureMatch[1]) {
      throw new Error("No media enclosure found in the RSS feed");
    }
    
    const mediaUrl = enclosureMatch[1];
    const durationMatch = xml.match(/<itunes:duration>([^<]+)<\/itunes:duration>/i);
    let durationMs = feedConfig.fallbackDur;
    
    if (durationMatch && durationMatch[1]) {
      const durStr = durationMatch[1].trim();
      if (durStr.includes(":")) {
        const parts = durStr.split(":").map(Number);
        if (parts.length === 2) {
          durationMs = (parts[0] * 60 + parts[1]) * 1000;
        } else if (parts.length === 3) {
          durationMs = (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
        }
      } else {
        durationMs = parseInt(durStr, 10) * 1000;
      }
    }
    
    return {
      providerName: feedConfig.provider,
      mediaUrl: mediaUrl,
      durationMs: durationMs || feedConfig.fallbackDur
    };
    
  } catch (err) {
    console.error("[News Bites] Failed to fetch short global news bite:", err);
    return null;
  }
}
