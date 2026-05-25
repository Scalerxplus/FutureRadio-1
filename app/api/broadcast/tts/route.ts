import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60; // Max allowed duration on Vercel Hobby Tier

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const blockId = url.searchParams.get("blockId");
    let text = url.searchParams.get("text");

    if (blockId) {
      // Fetch transcript securely from the database to bypass Vercel's 4096-byte URI limits
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
      const { data } = await supabase.from("broadcast_schedule").select("metadata").eq("id", blockId).single();
      if (data?.metadata?.transcript) {
        text = data.metadata.transcript;
      }
    }

    if (!text) {
      return NextResponse.json({ error: "Missing 'text' or 'blockId' parameter" }, { status: 400 });
    }

    // Safely translate Gemini-style bracket tags for ElevenLabs
    let processedText = text;
    // Convert pauses into natural punctuation that ElevenLabs understands
    processedText = processedText.replace(/[\[\(\*\{<【]?long pause[\]\)\*\}>】]?/gi, '... ...');
    processedText = processedText.replace(/[\[\(\*\{<【]?pause[\]\)\*\}>】]?/gi, '...');
    
    // Aggressively strip all other emotion tags (brackets, parentheses, asterisks, braces, chevrons)
    // ElevenLabs is highly expressive natively and will interpret the emotion from the context of the words themselves
    processedText = processedText.replace(/[\[\(\*\{<【].*?[\]\)\*\}>】]/g, '');

    console.log("[Audio Agent] Streaming ElevenLabs TTS for text length:", processedText.length);

    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "sk_90f3e80569342b5c23345f4b8ee20939ab05ddbbb45bb0b7";
    if (!ELEVENLABS_API_KEY) {
       console.error("[Audio Agent] Missing ELEVENLABS_API_KEY in environment variables");
       return NextResponse.json({ error: "ElevenLabs API key missing" }, { status: 500 });
    }

    const voiceIdParam = url.searchParams.get("voiceId");
    const VOICE_ID = voiceIdParam || "cgSgspJ2msm6clMCkdW9"; // Default to new AIRA voice

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY as string,
      },
      body: JSON.stringify({
        text: processedText,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.35, // Lower stability for higher emotional volatility
          similarity_boost: 0.75,
          style: 0.4, // Style boost for exaggerated radio personality
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[Audio Agent] ElevenLabs API failed:", errText);
      return NextResponse.json({ error: "ElevenLabs TTS failed" }, { status: 500 });
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    // Return the raw buffer as an audio/mpeg stream
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable", // Cache for 1 year so browser doesn't re-fetch
      },
    });
  } catch (err: unknown) {
    console.error("[Audio Agent] TTS streaming failed:", err);
    return NextResponse.json(
      { error: "TTS generation failed" },
      { status: 500 }
    );
  }
}
