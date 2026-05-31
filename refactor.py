import re

with open("components/audio/AudioOrchestrator.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Replace Refs
content = re.sub(
    r'const audiusRef = useRef<HTMLAudioElement \| null>\(null\);.*?const keepAliveRef = useRef<HTMLAudioElement \| null>\(null\);',
    '''const mediaRefA = useRef<HTMLAudioElement | null>(null);
  const mediaRefB = useRef<HTMLAudioElement | null>(null);
  const mediaRefC = useRef<HTMLAudioElement | null>(null);
  const activeDeckRef = useRef<"A" | "B" | "C">("A");
  const sweeperRef = useRef<HTMLAudioElement | null>(null);
  const keepAliveRef = useRef<HTMLAudioElement | null>(null);''',
    content,
    flags=re.DOTALL
)

# 2. Replace compressor refs
content = content.replace(
    'const refs = [audiusRef, audiusRefB, audioRef, jingleRef, bedRef];',
    'const refs = [mediaRefA, mediaRefB, mediaRefC, sweeperRef];'
)

# 3. Replace handleMediaError
old_err = '''  const handleMediaError = (deckType: "songA" | "songB" | "jocktalk" | "jingle" | "bed") => {
    let targetRef: React.MutableRefObject<HTMLAudioElement | null> | null = null;
    let fallbackSrc = "";

    switch(deckType) {
      case "songA":
        targetRef = audiusRef;
        fallbackSrc = "/audio/fallbacks/Future_Radio_2.mp3"; // Or randomly pick one
        break;
      case "songB":
        targetRef = audiusRefB;
        fallbackSrc = "/audio/fallbacks/Future_Radio_8.mp3";
        break;
      case "jocktalk":
        targetRef = audioRef;
        fallbackSrc = "/audio/fallbacks/Future_Radio_Tuned_1.mp3";
        break;
      case "jingle":
        targetRef = jingleRef;
        fallbackSrc = "/audio/fallbacks/Generic_Sponsor_Break.mp3";
        break;
      case "bed":
        targetRef = bedRef;
        fallbackSrc = "/audio/jingles/lofi-bed.mp3";
        break;
    }

    if (targetRef && targetRef.current && targetRef.current.src && !targetRef.current.src.includes(fallbackSrc)) {
      console.warn(`[Auto-Heal] Silence/Error detected on ${deckType}. Injecting fallback audio!`);
      targetRef.current.src = fallbackSrc;
      targetRef.current.loop = (deckType === "songA" || deckType === "songB"); // Loop songs to fill the clock time
      targetRef.current.play().catch(() => {});
    }
  };'''

new_err = '''  const handleMediaError = (deckType: "A" | "B" | "C" | "sweeper") => {
    let targetRef: React.MutableRefObject<HTMLAudioElement | null> | null = null;
    let fallbackSrc = "";

    switch(deckType) {
      case "A": targetRef = mediaRefA; fallbackSrc = "/audio/fallbacks/Future_Radio_2.mp3"; break;
      case "B": targetRef = mediaRefB; fallbackSrc = "/audio/fallbacks/Future_Radio_8.mp3"; break;
      case "C": targetRef = mediaRefC; fallbackSrc = "/audio/fallbacks/Future_Radio_Tuned_1.mp3"; break;
      case "sweeper": targetRef = sweeperRef; fallbackSrc = "/audio/jingles/Generic_Sponsor_Break.mp3"; break;
    }

    if (targetRef && targetRef.current && targetRef.current.src && !targetRef.current.src.includes(fallbackSrc)) {
      console.warn(`[Auto-Heal] Silence/Error detected on Deck ${deckType}. Injecting fallback audio!`);
      targetRef.current.src = fallbackSrc;
      targetRef.current.play().catch(() => {});
    }
  };'''

content = content.replace(old_err, new_err)

with open('components/audio/AudioOrchestrator.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
