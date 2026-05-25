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

    // Clean up text for Edge TTS
    let processedText = text;
    processedText = processedText.replace(/[\[\(\*\{<【].*?[\]\)\*\}>】]/g, ''); // Remove all emotion tags

    console.log("[Audio Agent] Generating completely free Microsoft Edge TTS for text length:", processedText.length);

    const voiceIdParam = url.searchParams.get("voiceId");
    
    // Map ElevenLabs Voice IDs to free Microsoft Azure Neural Voices
    let edgeVoice = "en-IN-NeerjaNeural"; // Default female
    if (voiceIdParam === "nPczCjzI2devNBz1zQrb") {
        edgeVoice = "en-IN-PrabhatNeural"; // Male voice (Maanas)
    }

    const tts = new EdgeTTS({
      voice: edgeVoice,
      lang: "en-IN",
      outputFormat: "audio-24khz-48kbitrate-mono-mp3",
      pitch: "default",
      rate: "default",
      volume: "default"
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
