import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, Post } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export const usePosts = () => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id (
            id,
            full_name,
            username,
            avatar_url,
            department,
            is_faculty
          )
        `)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      return data as Post[]
    },
    enabled: !!user
  })
}

export const usePersonalizedFeed = () => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['personalized-feed', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .rpc('get_personalized_feed', {
          user_id: user.id,
          page_size: 20,
          offset_val: 0
        })

      if (error) throw error
      return data
    },
    enabled: !!user
  })
}

export const useCreatePost = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (postData: {
      content: string
      post_type: 'idea' | 'project' | 'collaboration' | 'announcement'
      project_title?: string
      required_skills?: string[]
      required_departments?: string[]
      team_size_needed?: number
      media_urls?: string[]
      media_types?: string[]
    }) => {
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('posts')
        .insert({
          ...postData,
          author_id: user.id
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['personalized-feed'] })
    }
  })
}

export const useLikePost = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      if (!user) throw new Error('User not authenticated')

      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)

        if (error) throw error

        // Decrement likes count
        const { error: updateError } = await supabase
          .from('posts')
          .update({ likes_count: supabase.sql`likes_count - 1` })
          .eq('id', postId)

        if (updateError) throw updateError
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id })

        if (error) throw error

        // Increment likes count
        const { error: updateError } = await supabase
          .from('posts')
          .update({ likes_count: supabase.sql`likes_count + 1` })
          .eq('id', postId)

        if (updateError) throw updateError
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['personalized-feed'] })
    }
  })
}

export const usePostLikes = (postId: string) => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['post-likes', postId, user?.id],
    queryFn: async () => {
      if (!user) return { isLiked: false, likesCount: 0 }

      const [likesResult, userLikeResult] = await Promise.all([
        supabase
          .from('posts')
          .select('likes_count')
          .eq('id', postId)
          .single(),
        supabase
          .from('post_likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .single()
      ])

      return {
        likesCount: likesResult.data?.likes_count || 0,
        isLiked: !userLikeResult.error
      }
    },
    enabled: !!user && !!postId
  })
}