-- Migration: Daily Polls & Voting Engine

CREATE TABLE daily_polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id TEXT NOT NULL,
    poll_date DATE NOT NULL, -- The date the poll is active
    
    -- Song 1
    song1_title TEXT NOT NULL,
    song1_artist TEXT NOT NULL,
    song1_track_id TEXT NOT NULL,
    song1_votes INTEGER DEFAULT 0,
    
    -- Song 2
    song2_title TEXT NOT NULL,
    song2_artist TEXT NOT NULL,
    song2_track_id TEXT NOT NULL,
    song2_votes INTEGER DEFAULT 0,
    
    -- Song 3
    song3_title TEXT NOT NULL,
    song3_artist TEXT NOT NULL,
    song3_track_id TEXT NOT NULL,
    song3_votes INTEGER DEFAULT 0,
    
    status TEXT DEFAULT 'active', -- 'active' or 'closed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure only one active poll per city per day
CREATE UNIQUE INDEX unique_active_poll_per_day ON daily_polls (city_id, poll_date);

CREATE TABLE poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID REFERENCES daily_polls(id) ON DELETE CASCADE,
    listener_id TEXT NOT NULL,
    voted_for INTEGER NOT NULL, -- 1, 2, or 3
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Anti-cheat: Ensure a listener can only vote once per poll
CREATE UNIQUE INDEX unique_vote_per_listener ON poll_votes (poll_id, listener_id);
