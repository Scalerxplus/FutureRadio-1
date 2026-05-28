import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { searchAudiusTrack } from '@/lib/audius';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityId = searchParams.get('cityId') || 'raipur';
  const supabase = createClient();
  
  // Get today's date in YYYY-MM-DD local format
  const today = new Date().toISOString().split('T')[0];

  try {
    // Check if a poll already exists for today
    const { data: existingPoll } = await supabase
      .from('daily_polls')
      .select('*')
      .eq('city_id', cityId)
      .eq('poll_date', today)
      .single();

    if (existingPoll) {
      return NextResponse.json({ poll: existingPoll });
    }

    // If not, we need to create one! Let's fetch 3 random Audius tracks
    const seedQueries = ["lofi chill", "edm banger", "indie pop", "synthwave", "house mix", "chillstep"];
    // Pick 3 random seeds
    const selectedSeeds = seedQueries.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    const trackPromises = selectedSeeds.map(seed => searchAudiusTrack(seed));
    const tracks = await Promise.all(trackPromises);
    
    // Filter out nulls in case Audius fails
    const validTracks = tracks.filter(t => t !== null);
    if (validTracks.length < 3) {
       return NextResponse.json({ error: "Failed to generate poll options from Audius." }, { status: 500 });
    }

    const { data: newPoll, error: insertError } = await supabase
      .from('daily_polls')
      .insert({
        city_id: cityId,
        poll_date: today,
        song1_title: validTracks[0]!.title,
        song1_artist: validTracks[0]!.artist,
        song1_track_id: validTracks[0]!.id,
        song2_title: validTracks[1]!.title,
        song2_artist: validTracks[1]!.artist,
        song2_track_id: validTracks[1]!.id,
        song3_title: validTracks[2]!.title,
        song3_artist: validTracks[2]!.artist,
        song3_track_id: validTracks[2]!.id,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return NextResponse.json({ poll: newPoll });

  } catch (error) {
    console.error('[Poll API Error]', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
