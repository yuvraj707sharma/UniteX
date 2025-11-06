-- Update spaces table for Vartalaap
ALTER TABLE spaces 
ADD COLUMN IF NOT EXISTS listener_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT true;

-- Update space_members table for voice roles
ALTER TABLE space_members 
ADD COLUMN IF NOT EXISTS voice_role TEXT DEFAULT 'listener' CHECK (voice_role IN ('host', 'speaker', 'listener')),
ADD COLUMN IF NOT EXISTS is_muted BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing records to set proper voice roles (only using existing columns)
UPDATE space_members SET voice_role = 'host' WHERE role = 'admin';

-- Enable Realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE spaces;
ALTER PUBLICATION supabase_realtime ADD TABLE space_members;