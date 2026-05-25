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

    console.log("[Audio Agent] Generating completely free Microsoft Edge TTS for text length:", processedText.length);

    const voiceIdParam = url.searchParams.get("voiceId");
    
    // Map ElevenLabs Voice IDs to free Microsoft Azure Native Hindi Neural Voices
    let edgeVoice = "hi-IN-SwaraNeural"; // Default female (Perfect Hindi pronunciation)
    if (voiceIdParam === "nPczCjzI2devNBz1zQrb") {
        edgeVoice = "hi-IN-MadhurNeural"; // Male voice (Maanas)
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
