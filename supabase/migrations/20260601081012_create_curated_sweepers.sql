CREATE TABLE IF NOT EXISTS public.curated_sweepers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_url TEXT NOT NULL,
  genre TEXT NOT NULL,
  energy_score NUMERIC(3,2) NOT NULL,
  duration_ms INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster context lookups
CREATE INDEX IF NOT EXISTS idx_curated_sweepers_genre ON public.curated_sweepers(genre);
