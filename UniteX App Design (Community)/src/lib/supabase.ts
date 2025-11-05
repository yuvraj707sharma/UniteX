import { createClient } from '@supabase/supabase-js'

// Replace with your Supabase project credentials
const supabaseUrl = 'https://hesqzincnlrpwoajckxu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhlc3F6aW5jbmxycHdvYWpja3h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4OTE1MDQsImV4cCI6MjA3NzQ2NzUwNH0.0dhnGtUERzgdkPdDewnzp2HSJGS_oy_kO_U8Rjzl1dY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types (matching your existing schema)
export interface Profile {
  id: string
  email: string
  full_name: string
  username: string
  bio?: string
  avatar_url?: string
  cover_image_url?: string
  student_id?: string
  employee_id?: string
  department: string
  course?: string
  year_of_study?: number
  graduation_year?: number
  designation?: string
  specialization?: string[]
  skills?: string[]
  interests?: string[]
  phone?: string
  linkedin_url?: string
  github_url?: string
  portfolio_url?: string
  followers_count: number
  following_count: number
  posts_count: number
  projects_count: number
  is_verified: boolean
  is_faculty: boolean
  is_admin: boolean
  account_status: 'active' | 'suspended' | 'pending'
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  author_id: string
  content: string
  post_type: 'idea' | 'project' | 'collaboration' | 'announcement'
  media_urls?: string[]
  media_types?: string[]
  project_title?: string
  required_skills?: string[]
  required_departments?: string[]
  project_status?: 'planning' | 'active' | 'completed' | 'paused'
  team_size_needed?: number
  likes_count: number
  comments_count: number
  shares_count: number
  views_count: number
  engagement_score: number
  trending_score: number
  is_approved: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
  profiles: Profile
}

export interface Job {
  id: string
  user_id: string
  title: string
  company: string
  location: string
  type: 'internship' | 'part-time' | 'full-time' | 'project'
  salary?: string
  description: string
  requirements?: string
  created_at: string
  profiles: Profile
}

export interface JobApplication {
  id: string
  job_id: string
  user_id: string
  resume_url: string
  cover_note: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
}

export interface MediaFile {
  id: string
  post_id: string
  user_id: string
  file_name: string
  file_url: string
  file_type: 'image' | 'video' | 'document'
  file_size: number
  mime_type: string
  processing_status: 'pending' | 'processing' | 'completed' | 'failed'
  thumbnail_url?: string
  created_at: string
}

export interface Comment {
  id: string
  post_id: string
  author_id: string
  parent_id?: string
  content: string
  likes_count: number
  created_at: string
  updated_at: string
  profiles: Profile
}

export interface Notification {
  id: string
  user_id: string
  type: 'like' | 'comment' | 'follow' | 'collaboration_request' | 'post_approved' | 'mention'
  title: string
  message: string
  related_post_id?: string
  related_user_id?: string
  is_read: boolean
  created_at: string
}