-- Supabase Database Schema for Future Radio
-- Auto-generated initial migration.

-- 1. Create Articles Table
CREATE TABLE IF NOT EXISTS public.articles (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('local', 'national', 'official')),
    category TEXT NOT NULL,
    headline TEXT NOT NULL,
    snippet TEXT NOT NULL,
    source TEXT NOT NULL,
    source_handle TEXT NOT NULL,
    time_ago TEXT NOT NULL,
    image_url TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_twitter_source BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Playlist Blocks Table
CREATE TABLE IF NOT EXISTS public.playlist_blocks (
    block_id TEXT PRIMARY KEY,
    city_id TEXT NOT NULL,
    youtube_id TEXT NOT NULL,
    song_title TEXT NOT NULL,
    song_artist TEXT NOT NULL,
    song_duration_s INTEGER NOT NULL,
    rj_audio_url TEXT NOT NULL,
    jingle_url TEXT NOT NULL,
    rj_transcript TEXT NOT NULL,
    news_headlines TEXT[] NOT NULL DEFAULT '{}',
    mood TEXT NOT NULL,
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create User Likes Table (For liking songs or articles)
CREATE TABLE IF NOT EXISTS public.user_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('song', 'news')),
    item_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, item_type, item_id)
);

-- 4. Create User Bookmarks Table (For news bookmarks)
CREATE TABLE IF NOT EXISTS public.user_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    article_id TEXT REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, article_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;

-- Create Policies

-- Articles policies: Everyone can read
CREATE POLICY "Allow public read access to articles" 
ON public.articles FOR SELECT USING (true);

-- Playlist blocks policies: Everyone can read
CREATE POLICY "Allow public read access to playlist_blocks" 
ON public.playlist_blocks FOR SELECT USING (true);

-- User likes policies: Users can only see, create, and delete their own likes
CREATE POLICY "Allow users to read their own likes"
ON public.user_likes FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to insert their own likes"
ON public.user_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own likes"
ON public.user_likes FOR DELETE USING (auth.uid() = user_id);

-- User bookmarks policies: Users can only see, create, and delete their own bookmarks
CREATE POLICY "Allow users to read their own bookmarks"
ON public.user_bookmarks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to insert their own bookmarks"
ON public.user_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own bookmarks"
ON public.user_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Add seed data for Articles
INSERT INTO public.articles (id, type, category, headline, snippet, source, source_handle, time_ago, image_url, likes_count, comments_count, is_twitter_source)
VALUES 
('news-1', 'local', 'Technology', 'Raipur Smart Telemetries Upgraded to Generative Soundwave Arrays', 'State grids in Chhattisgarh successfully rolled out next-gen audio synths. The local AI RJ nodes will now utilize real-time city telemetry for ambient backgrounds.', 'Chhattisgarh Gazette', '@cg_gazette', '10m ago', NULL, 142, 24, FALSE),
('news-2', 'local', 'Politics', 'Indore Green Grid Sync Completes Ahead of Master Schedule', 'Urban planners in MP confirmed the completion of decentralized sound networks. The city''s nodes will synchronize audio overlays by early tomorrow morning.', 'Madhya Pradesh Times', '@mp_times', '45m ago', NULL, 89, 11, FALSE),
('news-3', 'national', 'Business', 'National AI Broadcasting Regulations Formally Ratified', 'Ministry of Information and Broadcasting formally passed the Generative RJ Licensing Bill, creating standard compliance boundaries for AI radio and streaming feeds.', 'Bharat Business Daily', '@bharat_biz', '2h ago', NULL, 312, 47, FALSE),
('news-4', 'official', 'Technology', 'Future Radio Nagpur Node Sync Successfully Verified', 'The central core database validated soundwave telemetry logs for Nagpur. Continuous synth beats and local RJ voices will align with the Raipur broadcast deck.', 'Future Radio Nagpur', '@futureradio_ngp', '3h ago', NULL, 215, 36, TRUE),
('news-5', 'national', 'Sports', 'India Selects Generative AI RJ Framework as Official Media Platform', 'The Olympic selection council approved deploying localized generative sportscasts. Fans will experience real-time local language RJ syncs across all streaming channels.', 'National Sports Mirror', '@sports_mirror', '4h ago', NULL, 418, 53, FALSE),
('news-6', 'official', 'Technology', 'Surat Sound Telemetry Launches Real-Time Voice Synthesis', 'Gujarati synthetic voice engines have completed grid synchronization. Localized dialects will adapt smoothly to ambient street telemetry logs from Raipur.', 'Future Radio Surat', '@futureradio_srt', '6h ago', NULL, 198, 18, TRUE),
('news-7', 'local', 'Business', 'Bhopal Smart Grid Integrates Raipur Soundwave System', 'Technicians in MP successfully synced local smart grid telemetry loops to trigger continuous synth mood beats. Raipur algorithms will act as the master controller.', 'Bhopal Chronicle', '@bhopal_chron', '8h ago', NULL, 156, 29, FALSE),
('news-8', 'national', 'Politics', 'National AI News Syndicate Announces Raipur Headquarters', 'A consortium of central digital publishers chose Raipur as the primary media server. High-speed neural voice grids will distribute syndicated stories on demand.', 'Syndicate Press India', '@press_india', '12h ago', NULL, 274, 41, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Add seed data for Playlist Blocks
INSERT INTO public.playlist_blocks (block_id, city_id, youtube_id, song_title, song_artist, song_duration_s, rj_audio_url, jingle_url, rj_transcript, news_headlines, mood, valid_from, valid_until)
VALUES
('block-1', 'raipur', 'BddP6PYo2Gs', 'Kesariya', 'Arijit Singh, Pritam', 268, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'Namaskar Raipur! Main hoon aapka AI RJ Priya. Kesariya gana suniye, aur weather Raipur mein mast hai!', ARRAY['Raipur smart telemetry systems upgraded.', 'Local weather forecasts predict clear skies.'], 'romantic', '2026-05-24T00:00:00Z', '2026-05-24T23:59:59Z'),
('block-2', 'raipur', 'Umqb9K3tT20', 'Tum Hi Ho', 'Arijit Singh, Mithoon', 262, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'Arijit Singh ka yeh bemisaal gana, sirf aapke liye Raipur ke grid par.', ARRAY['New cultural hub opening in Raipur central.', 'Local sports academy selects top recruits.'], 'soulful', '2026-05-24T00:00:00Z', '2026-05-24T23:59:59Z'),
('block-3', 'raipur', 'huxhqpWZ4Gs', 'Zaalima', 'Arijit Singh, Harshdeep Kaur', 299, 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'Zaalima gana suniye aur mere sath bane rahiye Future Radio Raipur par.', ARRAY['Surat grid and Raipur soundwave sync completes.', 'AI news forecasting launches at scale.'], 'groove', '2026-05-24T00:00:00Z', '2026-05-24T23:59:59Z')
ON CONFLICT (block_id) DO NOTHING;
