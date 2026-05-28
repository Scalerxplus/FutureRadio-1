import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { pollId, listenerId, votedFor } = await request.json();

    if (!pollId || !listenerId || ![1, 2, 3].includes(votedFor)) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const supabase = createClient();

    // 1. Insert the vote into poll_votes (Anti-cheat ensures unique listener_id)
    const { error: voteError } = await supabase
      .from('poll_votes')
      .insert({
        poll_id: pollId,
        listener_id: listenerId,
        voted_for: votedFor
      });

    if (voteError) {
      if (voteError.code === '23505') {
        return NextResponse.json({ error: "You have already voted today!" }, { status: 403 });
      }
      throw voteError;
    }

    // 2. Increment the vote count in daily_polls using an RPC or fallback to raw update
    // Note: Supabase provides a way to run atomic increments, but since this is an MVP we'll do a simple select/update.
    // For high scale, this should be an SQL function.
    const { data: poll } = await supabase.from('daily_polls').select('*').eq('id', pollId).single();
    if (poll) {
       const updateField = `song${votedFor}_votes`;
       const newVotes = (poll[updateField] || 0) + 1;
       
       await supabase.from('daily_polls').update({ [updateField]: newVotes }).eq('id', pollId);
    }

    // Fetch the updated poll to return the live vote counts
    const { data: updatedPoll } = await supabase.from('daily_polls').select('*').eq('id', pollId).single();

    return NextResponse.json({ success: true, poll: updatedPoll });

  } catch (error) {
    console.error('[Poll Vote Error]', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
