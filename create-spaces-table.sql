-- Create spaces table with all required columns
CREATE TABLE IF NOT EXISTS spaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  topic TEXT,
  status TEXT DEFAULT 'live' CHECK (status IN ('live', 'scheduled', 'ended')),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  listener_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all spaces" ON spaces FOR SELECT USING (true);
CREATE POLICY "Users can create own spaces" ON spaces FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own spaces" ON spaces FOR UPDATE USING (auth.uid() = user_id);