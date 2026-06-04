-- Migration: Creator Platform Setup

-- 1. Create Enum Types
CREATE TYPE creator_type AS ENUM ('radio', 'music');
CREATE TYPE content_status AS ENUM ('pending', 'approved', 'rejected');

-- 2. Create Creator Applications Table
CREATE TABLE creator_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    type creator_type NOT NULL,
    target_station TEXT NOT NULL,
    sample_file_url TEXT NOT NULL,
    status content_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Verified Creators Table
CREATE TABLE verified_creators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES creator_applications(id),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    type creator_type NOT NULL,
    approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Content Submissions Table
CREATE TABLE content_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES verified_creators(id),
    station TEXT NOT NULL,
    file_url TEXT NOT NULL,
    status content_status DEFAULT 'pending',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Set up RLS (Row Level Security)
-- For now, allow public inserts to creator_applications for the application form
ALTER TABLE creator_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public inserts to applications" 
ON creator_applications FOR INSERT 
TO anon 
WITH CHECK (true);

-- Allow admins to read all applications
CREATE POLICY "Allow read access to all applications"
ON creator_applications FOR SELECT
TO public
USING (true);

-- Allow admins to update applications
CREATE POLICY "Allow update access to applications"
ON creator_applications FOR UPDATE
TO public
USING (true);

-- 6. Storage Bucket setup instruction
-- NOTE: Please ensure a storage bucket named 'creator-uploads' is created in Supabase Storage and is set to PUBLIC.
