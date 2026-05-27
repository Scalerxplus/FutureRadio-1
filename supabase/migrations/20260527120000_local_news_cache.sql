CREATE TABLE IF NOT EXISTS public.local_news_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    city_id TEXT NOT NULL,
    category TEXT NOT NULL,
    headline TEXT NOT NULL,
    description TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast queries by the master clock
CREATE INDEX IF NOT EXISTS idx_local_news_cache_city_read ON public.local_news_cache(city_id, is_read);
