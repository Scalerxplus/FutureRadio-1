import re

with open("app/api/broadcast/generate-hour/route.ts", "r", encoding="utf-8") as f:
    content = f.read()

start_marker = "    while (currentTimeMs < targetEndTime.getTime()) {"
end_marker = "    // Wipe any existing schedule blocks in this hour window"

new_logic = """
    // --- DYNAMIC TIME-SLICING ALGORITHM ---
    
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
    const NUM_JTS = 4;
    const TOTAL_AD_TIME_MS = AD_DURATION_MS * NUM_ADS;
    
    const prefetchSongs = [];
    const prefetchSweepers = [];
    let currentMusicDuration = 0;
    
    // We fetch songs until we hit roughly 50 minutes (3000s) to leave room for Ads (120s) and Jocktalks (~240s) + sweepers
    while (totalScheduledDurationMs + currentMusicDuration + TOTAL_AD_TIME_MS < (TARGET_HOUR_MS - 120000)) {
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
             // Dayparting Logic can be implemented here by adjusting the query
             const song = await getSong(getSearchQueryForGenre(cityId).query, cityId, playedSongs);
             const dur = getSafeSongDuration(song);
             prefetchSongs.push({ type: 'song', song, duration: dur });
             currentMusicDuration += dur;
             
             const sw = getSweeperByGenre(cityId);
             const swDur = await getLocalAudioDuration(sw);
             prefetchSweepers.push({ url: sw, duration: swDur });
             currentMusicDuration += swDur;
        }
    }
    
    // Calculate total Jocktalk Time remaining
    const D_talk_ms = TARGET_HOUR_MS - (totalScheduledDurationMs + currentMusicDuration + TOTAL_AD_TIME_MS);
    
    // If D_talk_ms is too small (e.g. less than 4x 15s), we pop a song
    if (D_talk_ms < (15000 * NUM_JTS) && prefetchSongs.length > 0) {
        console.warn("[Master Clock] Reconciliation loop: Popping last song to make room for Jocktalks.");
        const removedSong = prefetchSongs.pop();
        const removedSweeper = prefetchSweepers.pop();
        if (removedSong) currentMusicDuration -= removedSong.duration;
        if (removedSweeper) currentMusicDuration -= removedSweeper.duration;
    }
    
    const FINAL_D_talk_ms = TARGET_HOUR_MS - (totalScheduledDurationMs + currentMusicDuration + TOTAL_AD_TIME_MS);
    const jt_dur_ms = Math.floor(FINAL_D_talk_ms / NUM_JTS);
    
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
                        // If AD fails, we just put a Sweeper filler
                        const fillerSw = getSweeperByGenre(cityId);
                        addElement('sweeper', await getLocalAudioDuration(fillerSw), fillerSw, { title: "Ad Fallback Sweeper" });
                    }
                    adCount++;
                } else {
                    // JT Insertion
                    addElement('jocktalk', jt_dur_ms, "", { 
                        title: `JT${jtCount + 1}`, 
                        transcript: "EMPTY SLOT - Awaiting Manual Jocktalk Upload from RCS Library",
                        rjName: stationProfile.name,
                        isEmptyPlaceholder: true 
                    });
                    jtCount++;
                }
            }
        }
    }
    
    // If there are leftover JTs or ADs because we didn't have enough songs, stick them at the end
    while (jtCount < NUM_JTS) {
         addElement('jocktalk', jt_dur_ms, "", { title: `JT${jtCount + 1}`, rjName: stationProfile.name, transcript: "EMPTY SLOT", isEmptyPlaceholder: true });
         jtCount++;
    }
    while (adCount < NUM_ADS) {
         const swFallback = getSweeperByGenre(cityId);
         addElement('sweeper', AD_DURATION_MS, swFallback, { title: "Radio Sweeper", isAd: true });
         adCount++;
    }
"""

try:
    idx_start = content.index(start_marker)
    idx_end = content.index(end_marker)
    new_content = content[:idx_start] + new_logic + "\n" + content[idx_end:]
    
    with open("app/api/broadcast/generate-hour/route.ts", "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Clock Refactored successfully.")
except ValueError as e:
    print("Could not find markers to replace.", e)
