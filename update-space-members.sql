-- Add columns to space_members table for voice chat features
ALTER TABLE space_members 
ADD COLUMN IF NOT EXISTS can_speak BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS hand_raised BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_muted BOOLEAN DEFAULT true;