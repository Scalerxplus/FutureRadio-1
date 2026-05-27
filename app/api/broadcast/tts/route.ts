import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { EdgeTTS } from "node-edge-tts";
import fs from "fs";
import path from "path";
import os from "os";

export const maxDuration = 60; // Max allowed duration on Vercel Hobby Tier

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const blockId = url.searchParams.get("blockId");
    let text = url.searchParams.get("text");

    if (blockId) {
      // Fetch transcript securely from the database
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
      const { data } = await supabase.from("broadcast_schedule").select("metadata").eq("id", blockId).single();
      if (data?.metadata?.transcript) {
        text = data.metadata.transcript;
      }
    }

    if (!text) {
      return NextResponse.json({ error: "Missing 'text' or 'blockId' parameter" }, { status: 400 });
    }

    // Clean up text for Edge TTS and inject natural breathing pauses
    let processedText = text;
    // Convert LLM pause tags into actual punctuation that forces the Neural voice to take a breath
    processedText = processedText.replace(/[\[\(\*\{<【]?long pause[\]\)\*\}>】]?/gi, '... ...');
    processedText = processedText.replace(/[\[\(\*\{<【]?pause[\]\)\*\}>】]?/gi, '...');
    processedText = processedText.replace(/[\[\(\*\{<【]?laughs[\]\)\*\}>】]?/gi, 'haha...');
    
    processedText = processedText.replace(/[\[\(\*\{<【].*?[\]\)\*\}>】]/g, ''); // Remove any remaining hidden tags

    const voiceIdParam = url.searchParams.get("voiceId") || "pm";
    const languageParam = url.searchParams.get("language") || "hi";
    const speedParam = parseFloat(url.searchParams.get("speed") || "1.0");

    // --- NEURAL TTS UPGRADE (F5-TTS LOCAL GPU WORKER) ---
    console.log(`[Audio Agent] Requesting Local GPU Worker (Language: ${languageParam}, Speed: ${speedParam})`);
    
    try {
      const ttsResponse = await fetch("http://127.0.0.1:8000/generate-broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: processedText, 
          language: languageParam,
          voice_id: voiceIdParam,
          speed: speedParam
        })
      });

      if (ttsResponse.ok) {
        const jobData = await ttsResponse.json();
        const jobId = jobData.job_id;
        console.log(`[Audio Agent] Job queued on GPU Worker: ${jobId}. Polling for completion...`);
        
        let isComplete = false;
        let outputPath = "";
        
        // Poll for up to 45 seconds
        for (let i = 0; i < 45; i++) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 sec
          
          const statusRes = await fetch(`http://127.0.0.1:8000/status/${jobId}`);
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
          console.log(`[Audio Agent] Audio generation complete! Streaming ${outputPath}...`);
          const audioBuffer = fs.readFileSync(outputPath);
          return new NextResponse(audioBuffer, {
            headers: {
              "Content-Type": "audio/wav",
              "Content-Length": audioBuffer.length.toString(),
              "Cache-Control": "public, max-age=31536000, immutable", 
            },
          });
        } else {
          console.warn(`[Audio Agent] GPU Worker timed out for job ${jobId}.`);
        }
      } else {
        console.warn("[Audio Agent] GPU Worker API unreachable. Is main.py running?");
      }
    } catch (e) {
      console.warn("[Audio Agent] Error communicating with GPU Worker:", e);
    }
    
    // --- FALLBACK: EDGE TTS ---
    console.log("[Audio Agent] Generating Microsoft Edge TTS for text length:", processedText.length);
    
    // Map Voice IDs to free Microsoft Azure Native Neural Voices
    let edgeVoice = "hi-IN-SwaraNeural"; // Default female (Perfect Hindi pronunciation)
    if (voiceIdParam === "nPczCjzI2devNBz1zQrb") {
        edgeVoice = "hi-IN-MadhurNeural"; // Male voice (Maanas)
    } else if (voiceIdParam === "cgSgspJ2msm6clMCkdW9") {
        edgeVoice = "en-US-JennyNeural"; // Global Club US Persona (Female)
    }

    const tts = new EdgeTTS({
      voice: edgeVoice,
      lang: "hi-IN",
      outputFormat: "audio-24khz-48kbitrate-mono-mp3",
      pitch: "+4Hz",     // Slightly higher pitch for more energy
      rate: "+12%",      // Faster speech rate typical of FM Radio Jockeys
      volume: "+15%"     // Punchy volume to sit above the music bed
    });

    const tmpFile = path.join(os.tmpdir(), `tts-${crypto.randomUUID()}.mp3`);
    
    await tts.ttsPromise(processedText, tmpFile);
    
    const audioBuffer = fs.readFileSync(tmpFile);
    
    // Clean up the temp file
    fs.unlinkSync(tmpFile);

    // Return the raw buffer as an audio/mpeg stream
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable", // Cache for 1 year
      },
    });
  } catch (err: unknown) {
    console.error("[Audio Agent] Edge TTS generation failed:", err);
    return NextResponse.json(
      { error: "Free TTS generation failed" },
      { status: 500 }
    );
  }
}
