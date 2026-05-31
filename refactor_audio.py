import re

with open("components/audio/AudioOrchestrator.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add transitionAudioRef
content = re.sub(
    r'(const sweeperRef = useRef<HTMLAudioElement \| null>\(null\);)',
    r'\1\n  const transitionAudioRef = useRef<HTMLAudioElement | null>(null);',
    content
)

# 2. Initialize transitionAudioRef
init_code = """      if (!sweeperRef.current) { sweeperRef.current = new Audio(); sweeperRef.current.crossOrigin = "anonymous"; }
      if (!transitionAudioRef.current) { transitionAudioRef.current = new Audio(); transitionAudioRef.current.crossOrigin = "anonymous"; }"""

content = re.sub(
    r'if \(!mediaRefC.current\) \{.*\}',
    r'if (!mediaRefC.current) { mediaRefC.current = new Audio(); mediaRefC.current.crossOrigin = "anonymous"; }\n' + init_code,
    content
)

cleanup_code = """      if (sweeperRef.current) { sweeperRef.current.pause(); sweeperRef.current.src = ""; }
      if (transitionAudioRef.current) { transitionAudioRef.current.pause(); transitionAudioRef.current.src = ""; }"""

content = re.sub(
    r'if \(mediaRefC.current\) \{ mediaRefC.current\.pause\(\); mediaRefC.current\.src = ""; \}',
    r'if (mediaRefC.current) { mediaRefC.current.pause(); mediaRefC.current.src = ""; }\n' + cleanup_code,
    content
)

# 3. Handle cityId change -> Play sweeper instantly
# There is a useEffect that watches cityId
# I will find the useEffect that fetches schedule on mount and watches cityId
# Wait, let's inject a new useEffect explicitly for the transition!
transition_effect = """
  // 2.5 Instant Transition Sweeper on Channel Change
  useEffect(() => {
    if (!hasGesture || !transitionAudioRef.current) return;
    
    // Reset volume and play sweeper
    transitionAudioRef.current.volume = 1.0;
    transitionAudioRef.current.src = `/audio/jingles/Station_ID_${cityId.charAt(0).toUpperCase() + cityId.slice(1)}.mp3`;
    
    // Fallback if the specific sweeper doesn't exist
    transitionAudioRef.current.onerror = () => {
       transitionAudioRef.current!.src = "/audio/jingles/Generic_Sponsor_Break.mp3";
    };
    
    transitionAudioRef.current.play().catch(e => console.warn("Transition sweeper blocked:", e));
    
  }, [cityId, hasGesture]);
"""

# Inject before the global synchronizer loop (useEffect with setInterval)
content = content.replace("// 3. The Global Synchronizer Loop", transition_effect + "\n  // 3. The Global Synchronizer Loop")

# 4. Fade out transition when active playback starts
# In the synchronizer loop, when we call mediaRefA.current.play() or any targetMedia.play(),
# we can trigger fade out.
# Look for targetMedia.play() or similar.
# In AudioOrchestrator, it does `targetMedia.play().catch(...)`
fade_out_code = """
          // Crossfade out transition sweeper if it's playing
          if (transitionAudioRef.current && !transitionAudioRef.current.paused && transitionAudioRef.current.volume > 0) {
            let vol = 1.0;
            const fadeInterval = setInterval(() => {
              vol -= 0.1;
              if (vol <= 0) {
                transitionAudioRef.current!.volume = 0;
                transitionAudioRef.current!.pause();
                clearInterval(fadeInterval);
              } else {
                transitionAudioRef.current!.volume = vol;
              }
            }, 300); // Fades out over 3 seconds (300ms * 10)
          }
          targetMedia.play().catch((e) => console.warn("Sync Engine block:", e));
"""

content = content.replace('targetMedia.play().catch((e) => console.warn("Sync Engine block:", e));', fade_out_code)
# In case it uses single quotes:
content = content.replace("targetMedia.play().catch(e => console.warn('Sync Engine block:', e));", fade_out_code)

with open("components/audio/AudioOrchestrator.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("AudioOrchestrator modified successfully.")
