import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
// @ts-ignore
import audioManifest from "../../../../public/audio-manifest.json";
import crypto from "crypto";

export const maxDuration = 60;

function getManifestFiles(dirPrefix: string): any[] {
  try {
    const prefix = dirPrefix.replace(/\\/g, '/');
    return audioManifest.files.filter((f: any) => f.path.startsWith(prefix));
  } catch (e) {
    return [];
  }
}

function getDaypart(hour: number) {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
}

function getBaseTitle(filename: string): string {
    const parts = filename.split('/');
    let name = parts[parts.length - 1];
    name = name.replace(/\.[^/.]+$/, ""); 
    name = name.replace(/[-_]\d+$/, ""); 
    name = name.replace(/\s*\(.*?\)/g, ""); 
    name = name.replace(/\s*-\s*.*$/g, ""); 
    return name.trim().toLowerCase();
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const url = new URL(request.url);
    const cityId = url.searchParams.get("city") || "raipur";
    const startTimeParam = url.searchParams.get("startTime");
    let startTime = startTimeParam ? new Date(startTimeParam) : new Date();
    
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istTimeMs = startTime.getTime() + istOffsetMs;
    const istDate = new Date(istTimeMs);
    istDate.setUTCMinutes(0, 0, 0);
    startTime = new Date(istDate.getTime() - istOffsetMs);
    
    const targetEndTime = new Date(startTime.getTime() + 59 * 60 * 1000 + 59 * 1000 + 999);
    const currentIstHour = istDate.getUTCHours();
    const daypart = getDaypart(currentIstHour);

    console.log(`[Master Clock] Generating Hot Clock for ${cityId} at ${startTime.toISOString()} (Daypart: ${daypart})`);

    const schedule: any[] = [];
    let currentTimeMs = startTime.getTime();

    const addElement = (type: any, durationMs: number, urlOrId: string, metadata: any = {}) => {
      let finalDurationMs = durationMs;
      
      if (currentTimeMs + finalDurationMs > targetEndTime.getTime()) {
         finalDurationMs = targetEndTime.getTime() - currentTimeMs;
         metadata.isCapped = true; 
      }

      if (finalDurationMs <= 0) return null;

      const blockId = crypto.randomUUID();
      schedule.push({
        id: blockId,
        city_id: cityId,
        start_time: new Date(currentTimeMs).toISOString(),
        end_time: new Date(currentTimeMs + finalDurationMs).toISOString(),
        duration_ms: finalDurationMs,
        element_type: type,
        [type === 'song' ? 'youtube_id' : 'media_url']: urlOrId,
        metadata
      });
      currentTimeMs += finalDurationMs;
      return blockId;
    };

    // Initialize state
    const playedSongs = new Set<string>();
    
    // Fetch global 6-hour cooldown history for music
    try {
        const sixHoursAgo = new Date(Date.now() - 6 * 3600 * 1000).toISOString();
        const { data: recentHistory } = await supabase
            .from("broadcast_schedule")
            .select("youtube_id")
            .eq("element_type", "song")
            .gte("start_time", sixHoursAgo);
            
        if (recentHistory) {
            recentHistory.forEach(row => {
                if (row.youtube_id) playedSongs.add(row.youtube_id);
            });
        }
    } catch(e) {}

    const playedJingles = new Set<string>();
    const playedStationIds = new Set<string>();
    const playedPromos = new Set<string>();
    const playedCommercials = new Set<string>();

    const getUnplayedFile = (folderIndex: string, playedSet: Set<string>, matchDaypart: boolean = false) => {
        let files = getManifestFiles(`/local_audio_vault/regional/${cityId}/${folderIndex}/`);
        if (files.length === 0) return null; // Missing folder or files

        if (matchDaypart) {
            const matchedFiles = files.filter(f => f.path.toLowerCase().includes(daypart));
            if (matchedFiles.length > 0) files = matchedFiles; // Fallback to all if no matches
        }

        let unplayed = files.filter(f => !playedSet.has(f.path));
        if (unplayed.length === 0) {
            files.forEach(f => playedSet.delete(f.path)); // Exhausted, reset set
            unplayed = files;
        }

        // For music, strictly filter titles
        if (folderIndex.includes("Music")) {
            const playedBaseTitles = new Set<string>();
            playedSongs.forEach(path => playedBaseTitles.add(getBaseTitle(path)));
            let validFiles = unplayed.filter(f => !playedBaseTitles.has(getBaseTitle(f.path)));
            if (validFiles.length > 0) {
                unplayed = validFiles;
            } else {
                 // reset songs completely if we ran out
                 playedSongs.clear();
                 unplayed = files;
            }
        }

        const selected = unplayed[Math.floor(Math.random() * unplayed.length)];
        playedSet.add(selected.path);
        return selected;
    };

    const sequencePattern = [
        { type: 'station_id', folder: '1_Station_Jingle', meta: "Station Jingle", matchDaypart: false },
        { type: 'song', folder: '5_Music', meta: "Song", matchDaypart: false },
        { type: 'station_id', folder: '2_Station_ID', meta: "Station ID", matchDaypart: true },
        { type: 'song', folder: '5_Music', meta: "Song", matchDaypart: false },
        { type: 'sweeper', folder: '3_Station_Promo', meta: "Station Promo", matchDaypart: false },
        { type: 'sweeper', folder: '4_Commercial', meta: "Commercial", matchDaypart: false },
        { type: 'station_id', folder: '2_Station_ID', meta: "Station ID", matchDaypart: true },
        { type: 'song', folder: '5_Music', meta: "Song", matchDaypart: false },
        { type: 'station_id', folder: '2_Station_ID', meta: "Station ID", matchDaypart: true },
        { type: 'song', folder: '5_Music', meta: "Song", matchDaypart: false },
        { type: 'sweeper', folder: '3_Station_Promo', meta: "Station Promo", matchDaypart: false },
        { type: 'sweeper', folder: '4_Commercial', meta: "Commercial", matchDaypart: false },
    ];

    let seqIndex = 0;
    const TARGET_HOUR_MS = 3600 * 1000;

    while (currentTimeMs - startTime.getTime() < (TARGET_HOUR_MS - 30000)) { // Give 30 sec grace
        const step = sequencePattern[seqIndex % sequencePattern.length];
        
        let playedSet = playedSongs; // Default
        if (step.folder.includes("Jingle")) playedSet = playedJingles;
        else if (step.folder.includes("Station_ID")) playedSet = playedStationIds;
        else if (step.folder.includes("Promo")) playedSet = playedPromos;
        else if (step.folder.includes("Commercial")) playedSet = playedCommercials;

        const file = getUnplayedFile(step.folder, playedSet, step.matchDaypart);
        
        if (file) {
            let dur = file.duration ? Math.round(file.duration * 1000) : 10000;
            if (step.type === 'song' && dur < 60000) dur = 240000; // Safe song duration

            let title = file.title || step.meta;
            let artist = file.artist || "Future Radio";
            
            // Add to schedule
            const added = addElement(step.type, dur, file.path, { 
                title: title,
                artist: artist,
                coverArt: file.coverArt || null
            });
            
            if (!added) break; // Reached targetEndTime perfectly
        } else {
            // Failsafe: if missing folder
            const added = addElement('sweeper', 30000, "fallback.mp3", { title: "Station Filler" });
            if (!added) break;
        }
        
        seqIndex++;
    }

    // Wipe any existing schedule blocks in this hour window to allow clean JIT regeneration
    await supabase
      .from("broadcast_schedule")
      .delete()
      .eq("city_id", cityId)
      .gte("start_time", new Date(startTime.getTime()).toISOString())
      .lt("start_time", new Date(startTime.getTime() + TARGET_HOUR_MS).toISOString());

    const { error } = await supabase.from("broadcast_schedule").insert(schedule);

    if (error) {
      console.error("[Master Clock] Insert failed:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${schedule.length} elements for channel ${cityId} using Hot Clock sequencer.`,
      schedule
    });

  } catch (err: any) {
    console.error("[Master Clock] Failed to generate hour:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
