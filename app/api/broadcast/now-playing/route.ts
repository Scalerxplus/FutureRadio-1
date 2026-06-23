import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityId = searchParams.get("city") || "hindi-belt";

  const supabase = createClient();
  const now = new Date();
  const nowIso = now.toISOString();

  // Find the track currently playing for the given city
  const { data: currentTracks, error } = await supabase
    .from("broadcast_schedule")
    .select("*")
    .eq("city_id", cityId)
    .lte("start_time", nowIso)
    .gt("end_time", nowIso)
    .order("start_time", { ascending: false })
    .limit(1);

  if (error) {
    console.error("[Now Playing] Database error:", error);
    return NextResponse.json({ error: "Failed to fetch current track" }, { status: 500 });
  }

  if (!currentTracks || currentTracks.length === 0) {
    // If nothing is explicitly scheduled right now, we can return a 404 
    // or fetch the NEXT upcoming track to tell the client what's coming
    const { data: nextTracks } = await supabase
      .from("broadcast_schedule")
      .select("*")
      .eq("city_id", cityId)
      .gt("start_time", nowIso)
      .order("start_time", { ascending: true })
      .limit(50);

    return NextResponse.json({ 
      status: "idle", 
      message: "No track currently playing",
      next_track: nextTracks?.[0] || null
    });
  }

  const track = currentTracks[0];
  const startTimeMs = new Date(track.start_time).getTime();
  const nowMs = now.getTime();
  const offsetMs = nowMs - startTimeMs; // How far into the track we should be
  
  // Also fetch the next track to queue it up
  const { data: nextTracks } = await supabase
    .from("broadcast_schedule")
    .select("*")
    .eq("city_id", cityId)
    .gt("start_time", track.start_time)
    .order("start_time", { ascending: true })
    .limit(1);

  return NextResponse.json({
    status: "playing",
    track: {
      id: track.id,
      media_url: track.media_url,
      metadata: track.metadata,
      element_type: track.element_type,
      start_time: track.start_time,
      end_time: track.end_time,
      duration_ms: track.duration_ms,
    },
    offset_ms: offsetMs,
    offset_seconds: Math.floor(offsetMs / 1000),
    next_track: nextTracks?.[0] || null
  });
}
