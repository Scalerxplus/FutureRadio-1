import re

with open("components/audio/AudioOrchestrator.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add isFirstLoadRef
content = re.sub(
    r'(const transitionAudioRef = useRef<HTMLAudioElement \| null>\(null\);)',
    r'\1\n  const isFirstLoadRef = useRef<boolean>(true);',
    content
)

# 2. Update Transition Jingle Logic (useEffect for cityId)
old_transition_logic = """    const JINGLES = [
      "/audio/jingles/Station_Jingle_chill.mp3",
      "/audio/jingles/Station_Jingle_drive.mp3",
      "/audio/jingles/Station_Jingle_news.mp3",
      "/audio/jingles/Station_Jingle_party.mp3",
      "/audio/jingles/Station_Jingle_romance.mp3"
    ];
    
    // Reset volume and play jingle
    transitionAudioRef.current.volume = 1.0;
    transitionAudioRef.current.src = JINGLES[Math.floor(Math.random() * JINGLES.length)];
    
    // Fallback if the specific jingle doesn't exist
    transitionAudioRef.current.onerror = () => {
       transitionAudioRef.current!.src = "/audio/fallbacks/Future_Radio_1.mp3";
    };
    
    transitionAudioRef.current.play().catch(e => console.warn("Transition jingle blocked:", e));"""

new_transition_logic = """    transitionAudioRef.current.volume = 1.0;
    
    if (isFirstLoadRef.current) {
      // First App Open: Play shuffled Station Jingle
      const JINGLES = [
        "/audio/jingles/Station_Jingle_chill.mp3",
        "/audio/jingles/Station_Jingle_drive.mp3",
        "/audio/jingles/Station_Jingle_news.mp3",
        "/audio/jingles/Station_Jingle_party.mp3",
        "/audio/jingles/Station_Jingle_romance.mp3"
      ];
      transitionAudioRef.current.src = JINGLES[Math.floor(Math.random() * JINGLES.length)];
      isFirstLoadRef.current = false;
    } else {
      // Channel Change: Play specific genre sweeper
      if (cityId === "global") {
        // Random from 1 to 20 for global
        const randomId = Math.floor(Math.random() * 20) + 1;
        transitionAudioRef.current.src = `/audio/fallbacks/Future_Radio_${randomId}.mp3`;
      } else {
        // 01 to 04 for specific genre
        const randomNum = String(Math.floor(Math.random() * 4) + 1).padStart(2, '0');
        transitionAudioRef.current.src = `/audio/Sweepers/Sweeper_${cityId}_${randomNum}.mp3`;
      }
    }
    
    transitionAudioRef.current.onerror = () => {
       transitionAudioRef.current!.src = "/audio/fallbacks/Future_Radio_1.mp3";
    };
    
    transitionAudioRef.current.play().catch(e => console.warn("Transition audio blocked:", e));"""

content = content.replace(old_transition_logic, new_transition_logic)


# 3. Fade Out Transition Audio when Live Audio starts
# Inside the 500ms global synchronizer loop, when primaryDeck or sweeperRef is played.
old_sweeper_play = """              player.play().catch(e => handleMediaError("sweeper"));"""
new_sweeper_play = """              // Fade out transition audio
              if (transitionAudioRef.current && !transitionAudioRef.current.paused) {
                 const tAudio = transitionAudioRef.current;
                 let vol = tAudio.volume;
                 const fade = setInterval(() => { vol -= 0.1; if (vol <= 0) { tAudio.pause(); tAudio.volume = 1; clearInterval(fade); } else { tAudio.volume = vol; } }, 200);
              }
              player.play().catch(e => handleMediaError("sweeper"));"""
content = content.replace(old_sweeper_play, new_sweeper_play)

old_primary_play = """              primaryDeck.play().catch(e => handleMediaError(activeDeckRef.current));"""
new_primary_play = """              // Fade out transition audio
              if (transitionAudioRef.current && !transitionAudioRef.current.paused) {
                 const tAudio = transitionAudioRef.current;
                 let vol = tAudio.volume;
                 const fade = setInterval(() => { vol -= 0.1; if (vol <= 0) { tAudio.pause(); tAudio.volume = 1; clearInterval(fade); } else { tAudio.volume = vol; } }, 200);
              }
              primaryDeck.play().catch(e => handleMediaError(activeDeckRef.current));"""
content = content.replace(old_primary_play, new_primary_play)


# 4. Fix Gesture Unlock Overlap
# In handleGestureClick, remove the individual .play() calls that bypass the logic
old_gesture_click = """  const handleGestureClick = () => {
    if (mediaRefA.current && mediaRefA.current.paused) mediaRefA.current.play().catch(() => {});
    if (mediaRefB.current && mediaRefB.current.paused) mediaRefB.current.play().catch(() => {});
    if (mediaRefC.current && mediaRefC.current.paused) mediaRefC.current.play().catch(() => {});
    
    const silentSrc = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
    if (mediaRefA.current && !mediaRefA.current.src) mediaRefA.current.src = silentSrc;
    if (mediaRefB.current && !mediaRefB.current.src) mediaRefB.current.src = silentSrc;
    if (mediaRefC.current && !mediaRefC.current.src) mediaRefC.current.src = silentSrc;
    if (sweeperRef.current && !sweeperRef.current.src) sweeperRef.current.src = silentSrc;

    mediaRefA.current?.play().catch(() => {});
    mediaRefB.current?.play().catch(() => {});
    mediaRefC.current?.play().catch(() => {});
    sweeperRef.current?.play().catch(() => {});
    keepAliveRef.current?.play().catch(() => {});

    setHasGesture(true);
    setIsPlaying(true);
  };"""

new_gesture_click = """  const handleGestureClick = () => {
    // Only play the keepAlive to unlock AudioContext.
    // The Global Synchronizer Loop will handle playing the activeDeck/sweeper.
    keepAliveRef.current?.play().catch(() => {});
    
    // Also unlock transitionAudioRef
    if (transitionAudioRef.current && transitionAudioRef.current.paused && transitionAudioRef.current.src) {
        transitionAudioRef.current.play().catch(() => {});
    }

    setHasGesture(true);
    setIsPlaying(true);
  };"""
content = content.replace(old_gesture_click, new_gesture_click)


# 5. Fix overlapping segues
# Find: [mediaRefA, mediaRefB, mediaRefC].forEach((ref, index) => {
# and replace setTimeout(() => { player.pause(); player.volume = 1; }, 2000);
# with a proper fade out!
old_overlap = """        [mediaRefA, mediaRefB, mediaRefC].forEach((ref, index) => {
           const deckName = ["A", "B", "C"][index];
           if (deckName !== activeDeckRef.current && ref.current && !ref.current.paused) {
               const player = ref.current;
               setTimeout(() => { player.pause(); player.volume = 1; }, 2000);
           }
        });"""

new_overlap = """        [mediaRefA, mediaRefB, mediaRefC, sweeperRef].forEach((ref, index) => {
           const deckName = ["A", "B", "C", "sweeper"][index];
           // If it's a media deck and not active, or if it's the sweeper and we are moving to a song
           if ((deckName !== activeDeckRef.current && deckName !== "sweeper") || (deckName === "sweeper" && currentElementToPlay.element_type !== "sweeper" && currentElementToPlay.element_type !== "station_id")) {
               if (ref.current && !ref.current.paused) {
                   const player = ref.current;
                   let vol = player.volume;
                   const fade = setInterval(() => {
                       vol -= 0.1;
                       if (vol <= 0) {
                           player.pause();
                           player.volume = 1;
                           clearInterval(fade);
                       } else {
                           player.volume = vol;
                       }
                   }, 200); // Fades out over 2 seconds
               }
           }
        });"""
content = content.replace(old_overlap, new_overlap)


# 6. Hardcode Exclusivity (Lines 446+)
old_exclusivity = """           // Ensure only active deck and sweeper are playing, hard-pause others
           [mediaRefA, mediaRefB, mediaRefC].forEach((ref, index) => {
              const deckName = ["A", "B", "C"][index];
              if (deckName !== activeDeckRef.current && ref.current && !ref.current.paused) {
                  ref.current.pause();
              }
           });"""

new_exclusivity = """           // Ensure only active deck and active element are playing, hard-pause others
           [mediaRefA, mediaRefB, mediaRefC, sweeperRef].forEach((ref, index) => {
              const deckName = ["A", "B", "C", "sweeper"][index];
              const isActiveSweeper = (deckName === "sweeper" && (currentElementToPlay.element_type === "sweeper" || currentElementToPlay.element_type === "station_id"));
              if (deckName !== activeDeckRef.current && !isActiveSweeper && ref.current && !ref.current.paused) {
                  ref.current.pause();
              }
           });"""
content = content.replace(old_exclusivity, new_exclusivity)


with open("components/audio/AudioOrchestrator.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Done refactoring!")
