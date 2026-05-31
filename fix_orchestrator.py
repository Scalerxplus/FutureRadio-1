import re

with open("components/audio/AudioOrchestrator.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Stop all other audio on cityId change
old_transition_effect = """  // 2.5 Instant Transition Sweeper on Channel Change
  useEffect(() => {
    if (!hasGesture || !transitionAudioRef.current) return;
    
    transitionAudioRef.current.volume = 1.0;"""

new_transition_effect = """  // 2.5 Instant Transition Sweeper on Channel Change
  useEffect(() => {
    if (!hasGesture || !transitionAudioRef.current) return;
    
    // HARD STOP old audio to prevent mixing when switching stations
    if (sweeperRef.current) sweeperRef.current.pause();
    if (mediaRefA.current) mediaRefA.current.pause();
    if (mediaRefB.current) mediaRefB.current.pause();
    if (mediaRefC.current) mediaRefC.current.pause();
    // Also reset currentElementIdRef to force a clean state transition when new schedule loads
    currentElementIdRef.current = null;

    transitionAudioRef.current.volume = 1.0;"""

content = content.replace(old_transition_effect, new_transition_effect)

# 2. Hard stop transition audio for master clock sweepers
old_sweeper_fade = """              // Fade out transition audio
              if (transitionAudioRef.current && !transitionAudioRef.current.paused) {
                 const tAudio = transitionAudioRef.current;
                 let vol = tAudio.volume;
                 const fade = setInterval(() => { vol -= 0.1; if (vol <= 0) { tAudio.pause(); tAudio.volume = 1; clearInterval(fade); } else { tAudio.volume = vol; } }, 200);
              }"""

new_sweeper_fade = """              // HARD STOP transition audio for Master Clock Sweepers to prevent parallel clashing
              if (transitionAudioRef.current && !transitionAudioRef.current.paused) {
                 transitionAudioRef.current.pause();
                 try { transitionAudioRef.current.currentTime = 0; } catch(e) {}
                 transitionAudioRef.current.volume = 1;
              }"""

# Note: old_sweeper_fade appears twice. We only want to replace the first one (inside the sweeper block).
# Let's replace only the first occurrence!
parts = content.split(old_sweeper_fade)
if len(parts) == 3:
    content = parts[0] + new_sweeper_fade + parts[1] + """              // Fade out transition audio ONLY if it's a song, otherwise hard stop for jocktalk
              if (transitionAudioRef.current && !transitionAudioRef.current.paused) {
                 const tAudio = transitionAudioRef.current;
                 if (currentElementToPlay.element_type === "jocktalk") {
                     tAudio.pause();
                     try { tAudio.currentTime = 0; } catch(e) {}
                     tAudio.volume = 1;
                 } else {
                     let vol = tAudio.volume;
                     const fade = setInterval(() => { vol -= 0.1; if (vol <= 0) { tAudio.pause(); tAudio.volume = 1; clearInterval(fade); } else { tAudio.volume = vol; } }, 200);
                 }
              }""" + parts[2]
else:
    print("Could not find exact occurrences of old_sweeper_fade. Found:", len(parts))

with open("components/audio/AudioOrchestrator.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("AudioOrchestrator fixed successfully.")
