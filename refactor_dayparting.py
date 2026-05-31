import re

with open("app/api/broadcast/generate-hour/route.ts", "r", encoding="utf-8") as f:
    content = f.read()

start_marker = "    // --- DYNAMIC TIME-SLICING ALGORITHM ---"
end_marker = "    // Wipe any existing schedule blocks in this hour window to allow clean JIT regeneration"

new_code = """    // --- DYNAMIC TIME-SLICING ALGORITHM (DAYPARTING & MANUAL RJs) ---
    
    // Determine Dayparting Mode
    const currentIstHour = istDate.getUTCHours();
    const isNightMode = currentIstHour >= 2 && currentIstHour < 7;
    console.log(`[Master Clock] Current IST Hour: ${currentIstHour} | Night Mode: ${isNightMode}`);

    // Pre-fetch Manual Jocktalks from DB
    let manualJocktalks: any[] = [];
    let totalManualJtDurMs = 0;
    if (!isNightMode) {
         try {
             const { data: dbJts } = await supabase
                 .from('manual_jocktalks')
                 .select('media_url, duration_ms, slot_index')
                 .eq('hour_block', currentIstHour)
                 .order('slot_index', { ascending: true });
                 
             if (dbJts && dbJts.length > 0) {
                 manualJocktalks = dbJts;
                 totalManualJtDurMs = dbJts.reduce((acc, curr) => acc + curr.duration_ms, 0);
             }
         } catch(e) {
             console.error("[Master Clock] Error fetching manual jocktalks:", e);
         }
    }

    // 1. TOTH Station Jingle (Always Segment 0)
    let totalScheduledDurationMs = 0;
    const stationId = getJingleByGenre(cityId);
    const stationIdDur = await getLocalAudioDuration(stationId);
    addElement('station_id', stationIdDur, stationId, { title: "Station ID" });
    totalScheduledDurationMs += stationIdDur;
    
    // 2. Pre-fetch Songs to fill the hour
    const TARGET_HOUR_MS = 3600 * 1000;
    const AD_DURATION_MS = 30000;
    const NUM_ADS = 4;
    const NUM_JTS = isNightMode ? 0 : 4;
    const TOTAL_AD_TIME_MS = AD_DURATION_MS * NUM_ADS;
    
    const prefetchSongs: any[] = [];
    const prefetchSweepers: any[] = [];
    let currentMusicDuration = 0;
    
    // We fetch songs until we hit roughly 50-55 minutes, accounting for Ads and actual Manual Jocktalk durations
    while (totalScheduledDurationMs + currentMusicDuration + TOTAL_AD_TIME_MS + totalManualJtDurMs < (TARGET_HOUR_MS - 60000)) {
        if (isFallbackMode) {
             const fallbackTrack = await getSong("fallback", cityId, playedSongs);
             const dur = getSafeSongDuration(fallbackTrack);
             prefetchSongs.push({ type: 'song', song: fallbackTrack, duration: dur });
             currentMusicDuration += dur;
             
             const sw = getSweeperByGenre(cityId);
             const swDur = await getLocalAudioDuration(sw);
             prefetchSweepers.push({ url: sw, duration: swDur });
             currentMusicDuration += swDur;
        } else {
             const song = await getSong(getSearchQueryForGenre(cityId), cityId, playedSongs);
             const dur = getSafeSongDuration(song);
             prefetchSongs.push({ type: 'song', song, duration: dur });
             currentMusicDuration += dur;
             
             const sw = getSweeperByGenre(cityId);
             const swDur = await getLocalAudioDuration(sw);
             prefetchSweepers.push({ url: sw, duration: swDur });
             currentMusicDuration += swDur;
        }
    }
    
    // Now assemble the precise hour schedule
    let jtCount = 0;
    let adCount = 0;
    
    for (let i = 0; i < prefetchSongs.length; i++) {
        // Add the song
        const s = prefetchSongs[i].song;
        addElement('song', prefetchSongs[i].duration, s.streamUrl, { title: s.title, artist: s.artist, trackId: s.id });
        
        // Add Sweeper
        if (prefetchSweepers[i]) {
            addElement('sweeper', prefetchSweepers[i].duration, prefetchSweepers[i].url, { title: "Radio Sweeper" });
        }
        
        // After every 2 songs, drop an Ad or a JT
        if ((i + 1) % 2 === 0) {
            if (adCount < NUM_ADS && jtCount < NUM_JTS) {
                if ((i + 1) % 4 === 0) {
                    // AD Insertion
                    const sspContext = { cityId: cityId, liveWeather: liveWeather, timeOfDay: "evening" };
                    const adDecision = await fetchContextualAd(sspContext);
                    if (adDecision && adDecision.mediaUrl) {
                        addElement('sweeper', adDecision.durationMs, adDecision.mediaUrl, { title: adDecision.campaignTitle, isAd: true });
                    } else {
                        const fillerSw = getSweeperByGenre(cityId);
                        const dur = await getLocalAudioDuration(fillerSw);
                        addElement('sweeper', dur, fillerSw, { title: "Ad Fallback Sweeper" });
                    }
                    adCount++;
                } else {
                    // JT Insertion (Manual Pre-Produced)
                    const targetSlot = jtCount + 1;
                    const manualJt = manualJocktalks.find(j => j.slot_index === targetSlot);
                    
                    if (manualJt) {
                        addElement('jocktalk', manualJt.duration_ms, manualJt.media_url, { 
                            title: `Live Studio RJ (Segment ${targetSlot})`, 
                            rjName: "Future Radio Live",
                            isEmptyPlaceholder: false 
                        });
                    } else {
                        // Fallback if RJ forgot to upload for this slot
                        const fillerSw = getSweeperByGenre(cityId);
                        const dur = await getLocalAudioDuration(fillerSw);
                        addElement('sweeper', dur, fillerSw, { title: "Station Sweeper (JT Fallback)" });
                    }
                    jtCount++;
                }
            }
        }
    }

"""

idx1 = content.find(start_marker)
idx2 = content.find(end_marker)

if idx1 != -1 and idx2 != -1:
    content = content[:idx1] + new_code + content[idx2:]
    with open("app/api/broadcast/generate-hour/route.ts", "w", encoding="utf-8") as f:
        f.write(content)
    print("Refactored generate-hour/route.ts successfully!")
else:
    print("Could not find markers in route.ts")
