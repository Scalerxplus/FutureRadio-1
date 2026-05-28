require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const VERCEL_API = "http://127.0.0.1:3000";
const GPU_WORKER = "http://127.0.0.1:8000";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runBatch() {
  console.log("🚀 Starting Future Radio 4-Hour Sync Agent...\n");

  // 0. Cleanup orphaned local outputs older than 24 hours
  console.log("[0] Cleaning up old audio files...");
  try {
      const outDir = path.join(process.cwd(), "kokoro-tts-server", "outputs");
      if (fs.existsSync(outDir)) {
          const files = fs.readdirSync(outDir);
          const now = Date.now();
          let deleted = 0;
          for (const f of files) {
              if (f.endsWith(".wav")) {
                  const fp = path.join(outDir, f);
                  const stats = fs.statSync(fp);
                  if (now - stats.mtimeMs > 24 * 60 * 60 * 1000) {
                      fs.unlinkSync(fp);
                      deleted++;
                  }
              }
          }
          console.log(`    🧹 Deleted ${deleted} old files.`);
      }
  } catch(e) {
      console.log(`    ❌ Cleanup failed:`, e.message);
  }

  // 1. Check current schedule and build up to 4 hours
  console.log("[1] Checking Master Clock Buffer...");
  let { data: schedule } = await supabase
    .from("broadcast_schedule")
    .select("start_time")
    .order("start_time", { ascending: false })
    .limit(1);

  let latestTime = schedule && schedule.length > 0 ? new Date(schedule[0].start_time) : new Date();
  let currentTime = new Date();
  
  // Calculate how many hours we are ahead
  let hoursAhead = Math.floor((latestTime - currentTime) / (1000 * 60 * 60));
  if (hoursAhead < 0) hoursAhead = 0;
  
  console.log(`Current Buffer: ${hoursAhead} hours ahead.`);

  // JIT Logic: We only ever want to generate exactly the next upcoming hour.
  // We do not need a 4-hour buffer anymore.
  if (hoursAhead < 1) {
    const nextHour = new Date(latestTime);
    nextHour.setHours(nextHour.getHours() + 1);
    nextHour.setMinutes(0, 0, 0); // Start of next hour
    
    console.log(`Generating schedule for: ${nextHour.toLocaleString()}...`);
    try {
        const res = await fetch(`${VERCEL_API}/api/broadcast/generate-hour?startTime=${nextHour.toISOString()}`, {
            method: "POST"
        });
        if (!res.ok) {
            console.error("Failed to generate hour on Vercel. Error code:", res.status);
            return;
        }
        const json = await res.json();
        console.log("   -> Success:", json.message);
        latestTime = nextHour;
        hoursAhead++;
    } catch (e) {
        console.error("Error calling Vercel API:", e.message);
        console.log("Are you sure Vercel is deployed? We can fallback to localhost:3000 if needed.");
        return;
    }
  }

  // 2. Fetch pending TTS jobs
  console.log("\n[2] Fetching Pending Jocktalk Audio Jobs...");
  const { data: pendingJobs } = await supabase
    .from("broadcast_schedule")
    .select("*")
    .eq("element_type", "jocktalk")
    .like("media_url", "%/api/broadcast/tts%")
    .gte("start_time", new Date().toISOString()) // Only future jobs
    .order("start_time", { ascending: true });

  if (!pendingJobs || pendingJobs.length === 0) {
    console.log("✅ No pending audios! The 60-Minute Hot Clock is fully rendered for the next hour.");
    return;
  }

  console.log(`Found ${pendingJobs.length} jocktalks to generate.\n`);

  // 3. Batch Generate
  for (let i = 0; i < pendingJobs.length; i++) {
    const job = pendingJobs[i];
    const meta = job.metadata;
    console.log(`[Job ${i+1}/${pendingJobs.length}] Generating Audio for ${job.start_time}...`);
    console.log(`   RJ: ${meta.rjName} | Lang: ${meta.language || 'hi'} | Speed: ${meta.speed || 1.0}`);
    console.log(`   Text: ${meta.transcript.substring(0, 50)}...`);

    try {
        // Queue on GPU
        const ttsReq = await fetch(`${GPU_WORKER}/generate-broadcast`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text: meta.transcript,
                language: meta.language || "hi",
                voice_id: meta.rjVoice || "pm",
                speed: meta.speed || 1.0
            })
        });

        if (!ttsReq.ok) {
            console.log(`❌ Failed to hit GPU Worker! Is main.py running?`);
            continue;
        }

        const ttsData = await ttsReq.json();
        const jobId = ttsData.job_id;
        console.log(`   -> Queued on GPU. Job ID: ${jobId}`);

        // Poll GPU Worker
        let isComplete = false;
        let outputPath = "";
        for (let poll = 0; poll < 600; poll++) { // Wait up to 10 minutes per long script
            await sleep(1000);
            const statusRes = await fetch(`${GPU_WORKER}/status/${jobId}`);
            if (statusRes.ok) {
                const statusData = await statusRes.json();
                if (statusData.status === "completed") {
                    isComplete = true;
                    outputPath = path.join(process.cwd(), "kokoro-tts-server", statusData.output_path);
                    break;
                }
            }
        }

        if (isComplete && fs.existsSync(outputPath)) {
            console.log(`   -> Generated! Uploading to Supabase Cloud...`);
            
            // Upload to Supabase Storage
            const fileBuffer = fs.readFileSync(outputPath);
            const fileName = `${job.id}.wav`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from("broadcast_audio")
                .upload(fileName, fileBuffer, { contentType: "audio/wav", upsert: true });

            if (uploadError) {
                console.log(`   ❌ Upload Failed:`, uploadError.message);
                continue;
            }

            // Get Public URL
            const { data: publicUrlData } = supabase.storage.from("broadcast_audio").getPublicUrl(fileName);
            const publicUrl = publicUrlData.publicUrl;

            console.log(`   -> Uploaded! Updating Master Clock...`);
            
            // Update Database
            await supabase
                .from("broadcast_schedule")
                .update({ media_url: publicUrl })
                .eq("id", job.id);

            // AUTO-CLEANUP DEFERRED: Files are kept for 24 hours for review, 
            // and will be deleted by the startup cleanup routine later.
            console.log(`   ✅ Success!`);
        } else {
            console.log(`   ❌ GPU Worker Timed Out.`);
        }
    } catch (e) {
        console.log(`   ❌ Error during generation:`, e.message);
    }
  }

  console.log("\n🎉 HOT CLOCK BATCH COMPLETE!");
  console.log("Future Radio will stream seamlessly from the cloud.");
}

async function startDaemon() {
    console.log("🕒 Starting Future Radio XX:15 JIT Daemon...");
    while (true) {
        const now = new Date();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        
        // We want to trigger exactly at XX:15:00
        if (minutes === 15) {
            console.log(`\n⏰ Target Time Reached (XX:15)! Triggering Hot Clock Generation...`);
            await runBatch();
            // Sleep for 60 seconds so we don't trigger again in the same minute
            await sleep(60000);
        } else {
            // Calculate minutes until the next 15th minute mark
            let waitMinutes = 15 - minutes;
            if (waitMinutes <= 0) waitMinutes += 60;
            
            const waitMs = (waitMinutes * 60 * 1000) - (seconds * 1000);
            console.log(`💤 Sleeping for ${waitMinutes} minutes until the next XX:15 trigger...`);
            await sleep(Math.min(waitMs, 60000)); // Sleep in 1-minute chunks to show heartbeat or just wait
        }
    }
}

startDaemon();
