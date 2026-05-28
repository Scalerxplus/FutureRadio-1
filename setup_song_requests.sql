-- Run this script in the Supabase SQL Editor to create the table for the Interactive Chat feature

CREATE TABLE IF NOT EXISTS public.song_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  city_id text NOT NULL,
  user_name text NOT NULL,
  song_title text NOT NULL,
  status text DEFAULT 'pending'::text NOT NULL
);

-- Optional: Enable RLS (Row Level Security) and allow public inserts for MVP
ALTER TABLE public.song_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to song_requests" 
ON public.song_requests 
FOR INSERT 
TO public 
WITH CHECK (true);

CREATE POLICY "Allow public select of song_requests" 
ON public.song_requests 
FOR SELECT 
TO public 
USING (true);

-- Allow updates so the backend can mark them as 'fulfilled'
CREATE POLICY "Allow public update of song_requests" 
ON public.song_requests 
FOR UPDATE 
TO public 
USING (true)
WITH CHECK (true);
