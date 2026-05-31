-- Phase 2 Database Migration for Future Radio Curation Engine
-- Run this script inside the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.curated_tracks (
    track_id text PRIMARY KEY,
    title text NOT NULL,
    artist text NOT NULL,
    duration_seconds integer NOT NULL,
    stream_url text NOT NULL,
    genre_category text NOT NULL,
    
    -- Acoustic and Mathematical Metadata
    energy_score double precision NOT NULL,      -- Range: 0.0 to 1.0
    bpm integer NOT NULL,                        -- Example: 120
    sentiment_valence double precision NOT NULL, -- Range: -1.0 to 1.0
    
    -- Quality Gates
    bot_flag boolean DEFAULT false,              -- True if suspected fake streams
    
    ingested_at timestamp with time zone DEFAULT now()
);

-- Add Index for fast algorithmic querying during Master Clock generation
CREATE INDEX IF NOT EXISTS idx_curated_tracks_algorithmic 
ON public.curated_tracks(genre_category, energy_score, sentiment_valence);

-- Add Index for Quality Gate filtering
CREATE INDEX IF NOT EXISTS idx_curated_tracks_bot_flag
ON public.curated_tracks(bot_flag);

-- Enable Row Level Security (RLS) but allow anonymous reads so the Next.js API can fetch tracks without auth
ALTER TABLE public.curated_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to curated tracks" 
ON public.curated_tracks FOR SELECT 
USING (true);

-- Allow service role to insert/update (The background ingestion worker)
CREATE POLICY "Allow service role full access" 
ON public.curated_tracks FOR ALL 
USING (auth.role() = 'service_role');
