-- BBC-Grade Multi-Agent Database Schema Extensions & RPC Functions

-- 1. Create Curated Raw Feed Table
CREATE TABLE IF NOT EXISTS public.curated_raw_feed (
    feed_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id TEXT NOT NULL,
    raw_headline TEXT NOT NULL,
    raw_text TEXT NOT NULL,
    source_profile TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT TRUE,
    ingested_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 2. Create Station Sound Assets Table
CREATE TABLE IF NOT EXISTS public.station_sound_assets (
    asset_id TEXT PRIMARY KEY,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('sweeper', 'jingle', 'sfx', 'backing_bed')),
    audio_url TEXT NOT NULL,
    mood_tag TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.curated_raw_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_sound_assets ENABLE ROW LEVEL SECURITY;

-- Create public read access policies
CREATE POLICY "Allow public read access to curated_raw_feed" 
ON public.curated_raw_feed FOR SELECT USING (true);

CREATE POLICY "Allow public read access to station_sound_assets" 
ON public.station_sound_assets FOR SELECT USING (true);

-- 3. Create RPC Functions for liking/unliking articles atomically
CREATE OR REPLACE FUNCTION public.increment_article_likes(article_id TEXT)
RETURNS INTEGER AS $$
DECLARE
    new_likes INTEGER;
BEGIN
    UPDATE public.articles
    SET likes_count = likes_count + 1
    WHERE id = article_id
    RETURNING likes_count INTO new_likes;
    RETURN new_likes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrement_article_likes(article_id TEXT)
RETURNS INTEGER AS $$
DECLARE
    new_likes INTEGER;
BEGIN
    UPDATE public.articles
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = article_id
    RETURNING likes_count INTO new_likes;
    RETURN new_likes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed some station sound assets
INSERT INTO public.station_sound_assets (asset_id, asset_type, audio_url, mood_tag)
VALUES
('sound-sweep-1', 'sweeper', 'https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav', 'neutral'),
('sound-bed-romantic', 'backing_bed', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', 'romantic'),
('sound-bed-soulful', 'backing_bed', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', 'soulful'),
('sound-bed-groove', 'backing_bed', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 'groove'),
('sound-jingle-1', 'jingle', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'neutral')
ON CONFLICT (asset_id) DO NOTHING;
