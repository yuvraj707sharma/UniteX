-- Add delete policies for lists and spaces tables

-- Lists delete policy
DROP POLICY IF EXISTS "Users can delete own lists" ON lists;
CREATE POLICY "Users can delete own lists" ON lists
  FOR DELETE 
  TO authenticated
  USING ((SELECT auth.uid())::uuid = user_id);

-- Spaces delete policy  
DROP POLICY IF EXISTS "Users can delete own spaces" ON spaces;
CREATE POLICY "Users can delete own spaces" ON spaces
  FOR DELETE 
  TO authenticated
  USING ((SELECT auth.uid())::uuid = created_by);