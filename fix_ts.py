import re

with open("app/api/broadcast/generate-hour/route.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Fix Supabase return
old_supabase = """              return {
                  id: track.track_id,
                  title: track.title,
                  artist: track.artist,
                  durationSeconds: track.duration_seconds,
                  streamUrl: track.stream_url
              };"""
              
new_supabase = """              return {
                  id: track.track_id,
                  title: track.title,
                  artist: track.artist,
                  durationSeconds: track.duration_seconds,
                  streamUrl: track.stream_url,
                  permalink: "",
                  license: "CC-BY"
              };"""
              
content = content.replace(old_supabase, new_supabase)

# Fix fallback 1
old_fb1 = """              fallbackTrack = {
                id: "system-fallback-" + Math.random().toString(36).substring(7),
                title: randomFile.replace(/\\.[^/.]+$/, ""),
                artist: "Future Radio Premium Fallback",
                durationSeconds: durMs / 1000,
                streamUrl: urlPath
              };"""

new_fb1 = """              fallbackTrack = {
                id: "system-fallback-" + Math.random().toString(36).substring(7),
                title: randomFile.replace(/\\.[^/.]+$/, ""),
                artist: "Future Radio Premium Fallback",
                durationSeconds: durMs / 1000,
                streamUrl: urlPath,
                permalink: "",
                license: "CC-BY"
              };"""
              
content = content.replace(old_fb1, new_fb1)

# Fix fallback 2
old_fb2 = """          fallbackTrack = {
              id: "system-fallback-" + Math.random().toString(36).substring(7),
              title: "Future Radio Chill Mix (Backup)",
              artist: "System",
              durationSeconds: 339,
              streamUrl: "https://discoveryprovider.audius.co/v1/tracks/50ENP3g/stream?app_name=FutureRadio"
          };"""

new_fb2 = """          fallbackTrack = {
              id: "system-fallback-" + Math.random().toString(36).substring(7),
              title: "Future Radio Chill Mix (Backup)",
              artist: "System",
              durationSeconds: 339,
              streamUrl: "https://discoveryprovider.audius.co/v1/tracks/50ENP3g/stream?app_name=FutureRadio",
              permalink: "https://audius.co/future/chill-mix",
              license: "CC-BY"
          };"""
          
content = content.replace(old_fb2, new_fb2)

with open("app/api/broadcast/generate-hour/route.ts", "w", encoding="utf-8") as f:
    f.write(content)

print("TypeScript errors fixed!")
