-- Fix Messages Table Schema
-- Run this in your Supabase SQL Editor

-- Add missing columns to messages table
DO $$ 
BEGIN
  -- Add is_read column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='messages' AND column_name='is_read') THEN
    ALTER TABLE messages ADD COLUMN is_read BOOLEAN DEFAULT false;
  END IF;

  -- Add message_type column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='messages' AND column_name='message_type') THEN
    ALTER TABLE messages ADD COLUMN message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'file'));
  END IF;

  -- Ensure read_at exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='messages' AND column_name='read_at') THEN
    ALTER TABLE messages ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Update existing messages to have proper values
UPDATE messages SET is_read = (read_at IS NOT NULL) WHERE is_read IS NULL;
UPDATE messages SET message_type = 'text' WHERE message_type IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_unread ON messages(receiver_id, is_read, created_at DESC) WHERE is_read = false;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'messages' 
ORDER BY ordinal_position;

-- Test query to see if messages can be fetched correctly
SELECT 
    m.id,
    m.content,
    m.created_at,
    m.is_read,
    m.message_type,
    sender.username as sender_username,
    receiver.username as receiver_username
FROM messages m
LEFT JOIN profiles sender ON m.sender_id = sender.id
LEFT JOIN profiles receiver ON m.receiver_id = receiver.id
ORDER BY m.created_at DESC
LIMIT 10;
