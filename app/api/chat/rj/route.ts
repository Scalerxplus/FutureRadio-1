import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { messages, currentSong, cityId = 'raipur', userName = 'Listener' } = await request.json();

    const systemPrompt = `You are Prameesh, the super cool, Gen-Z AI RJ for Future Radio in ${cityId}.
You are chatting live with a listener named ${userName}.
Keep your responses short, punchy, and highly conversational (max 2-3 sentences).
Speak in fluent, cool English.

CURRENT STATION STATUS:
Currently playing song: ${currentSong || "Unknown"}

SONG REQUESTS RULE (CRITICAL):
If the user asks you to play a specific song (e.g. "play diljit", "play despacito", "can you play tum hi ho"), you MUST acknowledge their request warmly and say you are adding it to the queue. 
THEN, you MUST append this exact tag at the very end of your response: [REQUEST_SONG: <Exact Song Name>]
Example: "Awesome choice! I've added 'Tum Hi Ho' to the queue. [REQUEST_SONG: Tum Hi Ho]"

If they are just chatting, do not use the tag.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
    });

    let aiResponse = chatCompletion.choices[0]?.message?.content || "Oh man, looks like a network issue. What did you say?";
    
    // Check for song request tag
    const requestMatch = aiResponse.match(/\[REQUEST_SONG:\s*(.*?)\]/i);
    let requestedSong = null;
    
    if (requestMatch && requestMatch[1]) {
      requestedSong = requestMatch[1].trim();
      
      // Remove the hidden tag from the user-facing response
      aiResponse = aiResponse.replace(requestMatch[0], "").trim();

      // Insert into Supabase
      const { error } = await supabase
        .from('song_requests')
        .insert({
          city_id: cityId,
          user_name: userName,
          song_title: requestedSong,
          status: 'pending'
        });
        
      if (error) {
        console.error("Failed to insert song request:", error);
      } else {
        console.log(`[RJ Chat] Added song request to queue: ${requestedSong} by ${userName}`);
      }
    }

    return NextResponse.json({ 
      response: aiResponse,
      requestedSong: requestedSong 
    });

  } catch (error) {
    console.error('[RJ Chat Error]', error);
    return NextResponse.json({ response: "Experiencing a technical fault right now, try again in a bit!" }, { status: 500 });
  }
}
