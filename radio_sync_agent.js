require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const VERCEL_API = "http://127.0.0.1:3000";
const GPU_WORKER = "http://127.0.0.1:8000";
const HOURS_TO_BUFFER = 4;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runBatch() {
  console.log("🚀 Starting Future Radio 4-Hour Sync Agent...\n");

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

  while (hoursAhead < HOURS_TO_BUFFER) {
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
            break;
        }
        const json = await res.json();
        console.log("   -> Success:", json.message);
        latestTime = nextHour;
        hoursAhead++;
    } catch (e) {
        console.error("Error calling Vercel API:", e.message);
        console.log("Are you sure Vercel is deployed? We can fallback to localhost:3000 if needed.");
        break;
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
    console.log("✅ No pending audios! You have a full 4-hour pre-rendered buffer.");
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
        for (let poll = 0; poll < 180; poll++) { // Wait up to 3 minutes per long script
            await sleep(1000);
            const statusRes = await fetch(`${GPU_WORKER}/status/${jobId}`);
            if (statusRes.ok) {
                const statusData = await statusRes.json();
                if (statusData.status === "completed") {
                    isComplete = true;
                    outputPath = path.join(process.cwd(), "f5-tts-server", statusData.output_path);
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

            console.log(`   ✅ Success!`);
        } else {
            console.log(`   ❌ GPU Worker Timed Out.`);
        }
    } catch (e) {
        console.log(`   ❌ Error during generation:`, e.message);
    }
  }

  console.log("\n🎉 BATCH COMPLETE! You can now turn off your laptop.");
  console.log("Future Radio will stream seamlessly from the cloud for the next 4 hours.");
}

runBatch();
