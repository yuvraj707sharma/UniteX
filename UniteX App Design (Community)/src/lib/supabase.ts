import { createClient } from '@supabase/supabase-js'

// Replace with your Supabase project credentials
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Profile {
  id: string
  email: string
  full_name: string
  username: string
  avatar_url?: string
  department: string
  year: string
  bio?: string
  skills: string[]
  website?: string
  location?: string
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  user_id: string
  content: string
  image_url?: string
  video_url?: string
  likes_count: number
  comments_count: number
  reposts_count: number
  created_at: string
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