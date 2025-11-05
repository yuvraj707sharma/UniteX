-- Add missing columns to spaces table
ALTER TABLE spaces 
ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'live' CHECK (status IN ('live', 'scheduled', 'ended')),
ADD COLUMN IF NOT EXISTS topic TEXT;