import re

with open("app/api/broadcast/generate-hour/route.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Fix 1: Line 457: const preflightSong = await getSong(getSearchQueryForGenre(cityId), cityId, playedSongs);
content = content.replace('const preflightSong = await getSong(getSearchQueryForGenre(cityId), cityId, playedSongs);', 'const preflightSong = await getSong(getSearchQueryForGenre(cityId).query, cityId, playedSongs);')

# Fix 2: Line 470: const genreSweeper = getSweeperByGenre(derivedVibe); in fallback mode
# Change derivedVibe to cityId
content = content.replace("""          const genreSweeper = getSweeperByGenre(derivedVibe);
          addElement('sweeper', await getLocalAudioDuration(genreSweeper), genreSweeper, { title: "Genre Sweeper" });
          continue;""", """          const genreSweeper = getSweeperByGenre(cityId);
          addElement('sweeper', await getLocalAudioDuration(genreSweeper), genreSweeper, { title: "Genre Sweeper" });
          continue;""")

# Fix 3: Other getSong calls passing getSearchQueryForGenre
content = re.sub(r'getSong\(getSearchQueryForGenre\((.*?)\)\s*,', r'getSong(getSearchQueryForGenre(\1).query,', content)

# Fix 4: If there are getSong calls passing an object.
content = content.replace('getSong(searchQuery,', 'getSong(searchQuery.query || searchQuery,')

with open("app/api/broadcast/generate-hour/route.ts", "w", encoding="utf-8") as f:
    f.write(content)
