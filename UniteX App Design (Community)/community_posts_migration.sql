-- ============================================
-- Community Posts Feature - Database Migration
-- ============================================
-- Run this in Supabase SQL Editor to enable community posts

-- 1. Add community_id column to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES communities(id) ON DELETE CASCADE;

-- 2. Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_community_id ON posts(community_id);

-- 3. Optional: Add Row Level Security (RLS) policy
-- This ensures users can only see posts in communities they've joined
-- Comment out if you want all community posts to be public

CREATE POLICY "Users can view community posts if they're members"
ON posts FOR SELECT
USING (
  -- Allow viewing if:
  -- 1. Post is not in a community (regular post)
  -- 2. User is a member of the community
  community_id IS NULL OR 
  EXISTS (
    SELECT 1 FROM community_members 
    WHERE community_members.community_id = posts.community_id 
    AND community_members.user_id = auth.uid()
  )
);

-- 4. Optional: Policy for creating community posts
-- Only members can create posts in a community
CREATE POLICY "Members can create posts in their communities"
ON posts FOR INSERT
WITH CHECK (
  -- Allow if:
  -- 1. Not a community post (community_id is NULL)
  -- 2. User is a member of the community
  community_id IS NULL OR
  EXISTS (
    SELECT 1 FROM community_members
    WHERE community_members.community_id = posts.community_id
    AND community_members.user_id = auth.uid()
  )
);

-- ============================================
-- Migration Complete!
-- ============================================
-- You can now create posts in communities
-- Test by:
-- 1. Join a community
-- 2. Click the + button in community details
-- 3. Create a post
-- ============================================
