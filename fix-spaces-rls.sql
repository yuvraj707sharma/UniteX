-- Fix RLS policies for spaces table
DROP POLICY IF EXISTS "Users can create spaces" ON spaces;
CREATE POLICY "Users can create spaces" ON spaces
  FOR INSERT 
  TO authenticated
  WITH CHECK ((SELECT auth.uid())::uuid = created_by);

DROP POLICY IF EXISTS "Users can view all spaces" ON spaces;
CREATE POLICY "Users can view all spaces" ON spaces
  FOR SELECT 
  TO authenticated
  USING (true);