CREATE TABLE manual_jocktalks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hour_block SMALLINT NOT NULL CHECK (hour_block >= 0 AND hour_block <= 23),
  slot_index SMALLINT NOT NULL CHECK (slot_index >= 1 AND slot_index <= 4),
  media_url TEXT NOT NULL,
  duration_ms INT NOT NULL DEFAULT 30000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(hour_block, slot_index)
);

-- RLS Policies
ALTER TABLE manual_jocktalks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON manual_jocktalks FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON manual_jocktalks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON manual_jocktalks FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON manual_jocktalks FOR DELETE USING (auth.role() = 'authenticated');

-- Optional: Insert dummy data for 8 AM as a fallback example so it isn't empty initially.
-- This can be cleared later by the user when they do bulk upload.
INSERT INTO manual_jocktalks (hour_block, slot_index, media_url, duration_ms)
VALUES 
  (8, 1, '/audio/jingles/Generic_Sponsor_Break.mp3', 30000),
  (8, 2, '/audio/jingles/Generic_Sponsor_Break.mp3', 30000),
  (8, 3, '/audio/jingles/Generic_Sponsor_Break.mp3', 30000),
  (8, 4, '/audio/jingles/Generic_Sponsor_Break.mp3', 30000)
ON CONFLICT DO NOTHING;
