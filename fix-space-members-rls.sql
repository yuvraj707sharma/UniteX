-- Fix RLS policies for space_members table
DROP POLICY IF EXISTS "Users can view space members" ON space_members;
CREATE POLICY "Users can view space members" ON space_members
  FOR SELECT 
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can join spaces" ON space_members;
CREATE POLICY "Users can join spaces" ON space_members
  FOR INSERT 
  TO authenticated
  WITH CHECK ((SELECT auth.uid())::uuid = user_id);