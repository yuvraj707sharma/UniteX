-- UniteX Feed Algorithm
-- LinkedIn + Twitter + Instagram inspired algorithm

-- Content Recommendation Algorithm Function
CREATE OR REPLACE FUNCTION get_personalized_feed(
    user_id UUID,
    page_size INTEGER DEFAULT 20,
    offset_val INTEGER DEFAULT 0
)
RETURNS TABLE (
    post_id UUID,
    author_id UUID,
    content TEXT,
    post_type TEXT,
    media_urls TEXT[],
    engagement_score FLOAT,
    relevance_score FLOAT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    user_department TEXT;
    user_skills TEXT[];
    user_interests TEXT[];
    following_users UUID[];
BEGIN
    -- Get user's profile data for personalization
    SELECT department, skills, interests INTO user_department, user_skills, user_interests
    FROM profiles WHERE id = user_id;
    
    -- Get users that current user follows
    SELECT ARRAY_AGG(following_id) INTO following_users
    FROM follows WHERE follower_id = user_id;
    
    RETURN QUERY
    WITH scored_posts AS (
        SELECT 
            p.id,
            p.author_id,
            p.content,
            p.post_type,
            p.media_urls,
            p.engagement_score,
            p.created_at,
            
            -- Relevance scoring (0-100)
            (
                -- Following bonus (40 points max)
                CASE WHEN p.author_id = ANY(following_users) THEN 40 ELSE 0 END +
                
                -- Department match (25 points max)
                CASE 
                    WHEN prof.department = user_department THEN 25
                    WHEN user_department = ANY(p.required_departments) THEN 20
                    ELSE 0 
                END +
                
                -- Skills match (20 points max)
                CASE 
                    WHEN user_skills && p.required_skills THEN 
                        LEAST(20, array_length(user_skills & p.required_skills, 1) * 5)
                    WHEN user_skills && prof.skills THEN 
                        LEAST(15, array_length(user_skills & prof.skills, 1) * 3)
                    ELSE 0 
                END +
                
                -- Post type preference (10 points max)
                CASE p.post_type
                    WHEN 'project' THEN 10
                    WHEN 'collaboration' THEN 8
                    WHEN 'idea' THEN 6
                    ELSE 3
                END +
                
                -- Recency bonus (5 points max, decays over 7 days)
                GREATEST(0, 5 * (1 - EXTRACT(EPOCH FROM (NOW() - p.created_at)) / (7 * 24 * 3600)))
                
            ) AS relevance_score
            
        FROM posts p
        JOIN profiles prof ON p.author_id = prof.id
        WHERE 
            p.is_approved = true 
            AND p.author_id != user_id -- Don't show own posts
            AND p.created_at > NOW() - INTERVAL '30 days' -- Only recent posts
    )
    
    SELECT 
        sp.id,
        sp.author_id,
        sp.content,
        sp.post_type,
        sp.media_urls,
        sp.engagement_score,
        sp.relevance_score,
        sp.created_at
    FROM scored_posts sp
    ORDER BY 
        -- Weighted combination of engagement and relevance
        (sp.engagement_score * 0.4 + sp.relevance_score * 0.6) DESC,
        sp.created_at DESC
    LIMIT page_size OFFSET offset_val;
END;
$$ LANGUAGE plpgsql;

-- Trending Posts Algorithm (Instagram/Twitter Explore)
CREATE OR REPLACE FUNCTION get_trending_posts(
    time_window INTERVAL DEFAULT INTERVAL '24 hours',
    page_size INTEGER DEFAULT 20
)
RETURNS TABLE (
    post_id UUID,
    author_id UUID,
    content TEXT,
    trending_score FLOAT,
    engagement_velocity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    WITH engagement_metrics AS (
        SELECT 
            p.id,
            p.author_id,
            p.content,
            p.likes_count,
            p.comments_count,
            p.shares_count,
            p.views_count,
            p.created_at,
            
            -- Calculate engagement velocity (engagement per hour)
            CASE 
                WHEN EXTRACT(EPOCH FROM (NOW() - p.created_at)) > 0 THEN
                    (p.likes_count + p.comments_count * 2 + p.shares_count * 3) / 
                    GREATEST(1, EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600)
                ELSE 0
            END AS engagement_velocity,
            
            -- Trending score calculation
            (
                p.likes_count * 1.0 +
                p.comments_count * 2.5 +
                p.shares_count * 4.0 +
                p.views_count * 0.1
            ) * 
            -- Time decay factor (newer posts get boost)
            EXP(-EXTRACT(EPOCH FROM (NOW() - p.created_at)) / (6 * 3600)) AS trending_score
            
        FROM posts p
        WHERE 
            p.is_approved = true
            AND p.created_at > NOW() - time_window
    )
    
    SELECT 
        em.id,
        em.author_id,
        em.content,
        em.trending_score,
        em.engagement_velocity
    FROM engagement_metrics em
    WHERE em.trending_score > 1.0 -- Minimum threshold
    ORDER BY em.trending_score DESC
    LIMIT page_size;
END;
$$ LANGUAGE plpgsql;

-- People You May Know Algorithm (LinkedIn style)
CREATE OR REPLACE FUNCTION get_suggested_connections(
    user_id UUID,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    suggested_user_id UUID,
    full_name TEXT,
    department TEXT,
    mutual_connections INTEGER,
    skill_matches INTEGER,
    suggestion_score FLOAT
) AS $$
DECLARE
    user_department TEXT;
    user_skills TEXT[];
    user_following UUID[];
BEGIN
    -- Get current user's data
    SELECT department, skills INTO user_department, user_skills
    FROM profiles WHERE id = user_id;
    
    -- Get who user is already following
    SELECT ARRAY_AGG(following_id) INTO user_following
    FROM follows WHERE follower_id = user_id;
    
    RETURN QUERY
    WITH connection_scores AS (
        SELECT 
            p.id,
            p.full_name,
            p.department,
            
            -- Count mutual connections
            COALESCE((
                SELECT COUNT(*)
                FROM follows f1
                JOIN follows f2 ON f1.following_id = f2.following_id
                WHERE f1.follower_id = user_id 
                AND f2.follower_id = p.id
            ), 0) AS mutual_connections,
            
            -- Count skill matches
            COALESCE(array_length(user_skills & p.skills, 1), 0) AS skill_matches,
            
            -- Calculate suggestion score
            (
                -- Department match (30 points)
                CASE WHEN p.department = user_department THEN 30 ELSE 0 END +
                
                -- Skill matches (up to 25 points)
                LEAST(25, COALESCE(array_length(user_skills & p.skills, 1), 0) * 5) +
                
                -- Mutual connections (up to 20 points)
                LEAST(20, COALESCE((
                    SELECT COUNT(*)
                    FROM follows f1
                    JOIN follows f2 ON f1.following_id = f2.following_id
                    WHERE f1.follower_id = user_id 
                    AND f2.follower_id = p.id
                ), 0) * 2) +
                
                -- Activity level (up to 15 points)
                LEAST(15, p.posts_count * 0.5) +
                
                -- Profile completeness (up to 10 points)
                (CASE WHEN p.bio IS NOT NULL THEN 2 ELSE 0 END +
                 CASE WHEN p.avatar_url IS NOT NULL THEN 2 ELSE 0 END +
                 CASE WHEN array_length(p.skills, 1) > 0 THEN 3 ELSE 0 END +
                 CASE WHEN p.linkedin_url IS NOT NULL THEN 2 ELSE 0 END +
                 CASE WHEN p.github_url IS NOT NULL THEN 1 ELSE 0 END)
                
            ) AS suggestion_score
            
        FROM profiles p
        WHERE 
            p.id != user_id
            AND p.account_status = 'active'
            AND (user_following IS NULL OR p.id != ALL(user_following))
            AND NOT EXISTS (
                SELECT 1 FROM follows 
                WHERE follower_id = user_id AND following_id = p.id
            )
    )
    
    SELECT 
        cs.id,
        cs.full_name,
        cs.department,
        cs.mutual_connections,
        cs.skill_matches,
        cs.suggestion_score
    FROM connection_scores cs
    WHERE cs.suggestion_score > 5 -- Minimum threshold
    ORDER BY cs.suggestion_score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Update trending scores periodically (run via cron job)
CREATE OR REPLACE FUNCTION update_trending_scores()
RETURNS void AS $$
BEGIN
    UPDATE posts 
    SET trending_score = (
        likes_count * 1.0 +
        comments_count * 2.5 +
        shares_count * 4.0 +
        views_count * 0.1
    ) * EXP(-EXTRACT(EPOCH FROM (NOW() - created_at)) / (6 * 3600))
    WHERE created_at > NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;