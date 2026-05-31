import re

with open("app/api/broadcast/generate-hour/route.ts", "r") as f:
    content = f.read()

# 1. Remove ZAPPERS
content = re.sub(r'const ZAPPERS = \[\n(?:.*?)\n\];\n', '', content, flags=re.DOTALL)

# 2. Update getSearchQueryForGenre
new_get_search = """
let globalEnergyToggle = false;

function getSearchQueryForGenre(genre: string, targetTimeIso?: string): { query: string, derivedVibe: string } {
  let vibe = genre.toLowerCase();
  
  if (vibe === "global" && targetTimeIso) {
    try {
      const timePart = targetTimeIso.split('T')[1];
      const hour = parseInt(timePart.split(':')[0], 10);
      
      if (hour >= 7 && hour < 12) {
        // Morning: mid to high energy indie
        globalEnergyToggle = !globalEnergyToggle;
        vibe = globalEnergyToggle ? "drive" : "chill"; // drive for high, chill for mid
      } else if (hour >= 12 && hour < 17) {
        // Afternoon: mid to low
        vibe = "chill";
      } else if (hour >= 17 && hour < 21) {
        // Evening: punjabi/intl high energy
        vibe = "party"; // we will force punjabi/intl in the query roll
      } else {
        // Night: edm, house, trap
        vibe = "party";
      }
    } catch(e) {
      vibe = "drive";
    }
  }

  if (!PREMIUM_GENRES[vibe as keyof typeof PREMIUM_GENRES]) {
      vibe = "drive";
  }

  const roll = Math.random() * 100;
  let categoryArray = [];
  
  // Custom force for global evening
  if (genre.toLowerCase() === "global" && targetTimeIso) {
    const hour = parseInt(targetTimeIso.split('T')[1].split(':')[0], 10);
    if (hour >= 17 && hour < 21) {
      // Evening: punjabi and international indie music, high energy
      categoryArray = roll < 50 ? PREMIUM_GENRES["party"].punjabi : PREMIUM_GENRES["party"].intl;
      return { query: categoryArray[Math.floor(Math.random() * categoryArray.length)], derivedVibe: "party" };
    }
    if (hour >= 21 || hour < 7) {
      // Night: indie trance, house, trap, edm mixes
      const nightGenres = ["indie trance", "house mix", "trap edm", "festival bass", "progressive house"];
      return { query: nightGenres[Math.floor(Math.random() * nightGenres.length)], derivedVibe: "party" };
    }
    if (hour >= 7 && hour < 12) {
      const morningGenres = globalEnergyToggle ? ["upbeat indie", "hindi pop", "commercial pop"] : ["desi indie", "indie pop"];
      return { query: morningGenres[Math.floor(Math.random() * morningGenres.length)], derivedVibe: globalEnergyToggle ? "drive" : "chill" };
    }
  }

  if (roll < 35) {
      categoryArray = PREMIUM_GENRES[vibe as keyof typeof PREMIUM_GENRES].punjabi;
  } else if (roll < 70) {
      categoryArray = PREMIUM_GENRES[vibe as keyof typeof PREMIUM_GENRES].hindi;
  } else {
      categoryArray = PREMIUM_GENRES[vibe as keyof typeof PREMIUM_GENRES].intl;
  }
  
  return { query: categoryArray[Math.floor(Math.random() * categoryArray.length)], derivedVibe: vibe };
}
"""

content = re.sub(r'function getSearchQueryForGenre\(genre: string\) \{.*?\n\}', new_get_search.strip(), content, flags=re.DOTALL)

# 3. Modify getSong to respect 7 minutes limit (420 seconds)
# We need to find the searchAudiusTrack call and filter. But since searchAudiusTrack returns an array, we can just filter it inside getSong.
get_song_replacement = """async function getSong(searchQuery: string, cityId: string, playedSongs: Set<string>): Promise<AudiusTrack> {
  const cleanQuery = searchQuery.replace(/official audio|official video/gi, "").trim();
  
  let allTracks = await searchAudiusTrack(cleanQuery);
  // Enforce 7-minute limit (420 seconds)
  let tracks = allTracks.filter(t => t.durationSeconds && t.durationSeconds <= 420);
"""
content = content.replace('async function getSong(searchQuery: string, cityId: string, playedSongs: Set<string>): Promise<AudiusTrack> {\n  const cleanQuery = searchQuery.replace(/official audio|official video/gi, "").trim();\n  \n  let tracks = await searchAudiusTrack(cleanQuery);', get_song_replacement)


# 4. Remove Zapper insertions and replace with genre sweepers
# In the main generation loop, we need to pass targetTimeIso to getSearchQueryForGenre
content = content.replace('const searchQuery = getSearchQueryForGenre(genre);', 'const { query: searchQuery, derivedVibe } = getSearchQueryForGenre(genre, targetStartTime);')

# Replace zapper insertions
zapper_block = """          const zapper = ZAPPERS[Math.floor(Math.random() * ZAPPERS.length)];
          addElement('sweeper', await getLocalAudioDuration(zapper), zapper, { title: "Zapper Transition" });"""

sweeper_block = """          const genreSweeper = getSweeperByGenre(derivedVibe);
          addElement('sweeper', await getLocalAudioDuration(genreSweeper), genreSweeper, { title: "Genre Sweeper" });"""

content = content.replace(zapper_block, sweeper_block)

zapper_block2 = """          // Fill Time: Pick a random song to fill the gap
          const fillQuery = getSearchQueryForGenre(genre);"""
sweeper_block2 = """          // Fill Time: Pick a random song to fill the gap
          const { query: fillQuery, derivedVibe: fillVibe } = getSearchQueryForGenre(genre, targetStartTime);"""

content = content.replace(zapper_block2, sweeper_block2)

# Fix remaining ZAPPER reference in fill time
zapper_block3 = """          const zapperFill = ZAPPERS[Math.floor(Math.random() * ZAPPERS.length)];
          addElement('sweeper', await getLocalAudioDuration(zapperFill), zapperFill, { title: "Sweeper Transition" });"""
sweeper_block3 = """          const genreFillSweeper = getSweeperByGenre(fillVibe);
          addElement('sweeper', await getLocalAudioDuration(genreFillSweeper), genreFillSweeper, { title: "Genre Sweeper" });"""

content = content.replace(zapper_block3, sweeper_block3)

# Remove Zapper local audio duration check fallback
content = content.replace('return urlPath.includes("Zapper") ? 3000 : 10000;', 'return 10000;')

with open("app/api/broadcast/generate-hour/route.ts", "w", encoding="utf-8") as f:
    f.write(content)
