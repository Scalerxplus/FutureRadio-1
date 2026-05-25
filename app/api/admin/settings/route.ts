import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rjPrompt, playlistMood, cityId } = body;

    if (!rjPrompt || !playlistMood || !cityId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createClient();
    
    // Upsert into station_settings. We use id=1 so it's a true global setting override per city
    const { error } = await supabase
      .from("station_settings")
      .upsert({
        id: 1, // Single global config row for now
        city_id: cityId,
        rj_prompt: rjPrompt,
        playlist_mood: playlistMood,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.error("[Settings API] Failed to save settings:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
