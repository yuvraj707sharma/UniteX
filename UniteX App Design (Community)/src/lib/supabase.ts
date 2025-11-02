import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
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
  account_status: string
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
  profiles?: Profile
}