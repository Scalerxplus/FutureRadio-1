import { createClient } from "./client";
import { NewsItem, INITIAL_MOCK_NEWS } from "../mockNews";

// Safely checks if Supabase environment keys are available
const isSupabaseConfigured = () => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

// Map DB row to NewsItem
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapRowToNewsItem = (row: any): NewsItem => ({
  id: row.id,
  type: row.type,
  category: row.category,
  headline: row.headline,
  snippet: row.snippet,
  source: row.source,
  sourceHandle: row.source_handle,
  timeAgo: row.time_ago,
  imageUrl: row.image_url,
  likes: row.likes_count ?? 0,
  comments: row.comments_count ?? 0,
  isTwitterSource: row.is_twitter_source ?? false,
});

/**
 * Fetches active news articles from Supabase, falling back to mock data
 */
export async function getNewsArticles(cityId?: string): Promise<NewsItem[]> {
  if (!isSupabaseConfigured()) {
    console.log("[Supabase News] Env vars missing. Using offline mock news.");
    return INITIAL_MOCK_NEWS;
  }

  try {
    const supabase = createClient();
    const query = supabase.from("articles").select("*").order("created_at", { ascending: false });

    // Filter by city if local type is requested
    if (cityId) {
      // For demonstration, since our mock database items are local Raipur, Indore, Bhopal etc.,
      // we can fetch articles matching city filters if required.
    }

    const { data, error } = await query;
    if (error) throw error;

    if (data && data.length > 0) {
      return data.map(mapRowToNewsItem);
    }
    return INITIAL_MOCK_NEWS;
  } catch (err) {
    console.error("[Supabase News] Error fetching articles, falling back:", err);
    return INITIAL_MOCK_NEWS;
  }
}

/**
 * Fetches a single article by ID
 */
export async function getArticleById(id: string): Promise<NewsItem | null> {
  const localMatch = INITIAL_MOCK_NEWS.find((item) => item.id === id);

  if (!isSupabaseConfigured()) {
    return localMatch || null;
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data ? mapRowToNewsItem(data) : localMatch || null;
  } catch (err) {
    console.error("[Supabase News] Error fetching article by ID, falling back:", err);
    return localMatch || null;
  }
}

/**
 * Likes or unlikes a news article in the database for the current authenticated user
 */
export async function toggleLikeArticle(
  userId: string,
  articleId: string,
  currentlyLiked: boolean
): Promise<{ success: boolean; likesCount: number }> {
  if (!isSupabaseConfigured() || !userId) {
    return { success: true, likesCount: 0 }; // Mock success
  }

  const supabase = createClient();

  try {
    if (currentlyLiked) {
      // Remove Like record
      const { error: deleteError } = await supabase
        .from("user_likes")
        .delete()
        .eq("user_id", userId)
        .eq("item_type", "news")
        .eq("item_id", articleId);

      if (deleteError) throw deleteError;

      // Decrement article likes count
      const { data, error: updateError } = await supabase
        .rpc("decrement_article_likes", { article_id: articleId });
      
      // If RPC fails (e.g. not created yet), do a standard update
      if (updateError) {
        const { data: article } = await supabase.from("articles").select("likes_count").eq("id", articleId).single();
        const currentLikes = article?.likes_count ?? 1;
        const { data: updated } = await supabase
          .from("articles")
          .update({ likes_count: Math.max(0, currentLikes - 1) })
          .eq("id", articleId)
          .select("likes_count")
          .single();
        return { success: true, likesCount: updated?.likes_count ?? 0 };
      }

      return { success: true, likesCount: data ?? 0 };
    } else {
      // Add Like record
      const { error: insertError } = await supabase
        .from("user_likes")
        .insert({
          user_id: userId,
          item_type: "news",
          item_id: articleId,
        });

      if (insertError) throw insertError;

      // Increment article likes count
      const { data, error: updateError } = await supabase
        .rpc("increment_article_likes", { article_id: articleId });

      if (updateError) {
        const { data: article } = await supabase.from("articles").select("likes_count").eq("id", articleId).single();
        const currentLikes = article?.likes_count ?? 0;
        const { data: updated } = await supabase
          .from("articles")
          .update({ likes_count: currentLikes + 1 })
          .eq("id", articleId)
          .select("likes_count")
          .single();
        return { success: true, likesCount: updated?.likes_count ?? 0 };
      }

      return { success: true, likesCount: data ?? 0 };
    }
  } catch (err) {
    console.error("[Supabase News] Error toggling article like:", err);
    return { success: false, likesCount: 0 };
  }
}

/**
 * Gets a list of article IDs liked by the user
 */
export async function getUserLikedArticles(userId: string): Promise<string[]> {
  if (!isSupabaseConfigured() || !userId) {
    return [];
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("user_likes")
      .select("item_id")
      .eq("user_id", userId)
      .eq("item_type", "news");

    if (error) throw error;
    return data ? data.map((item: { item_id: string }) => item.item_id) : [];
  } catch (err) {
    console.error("[Supabase News] Error getting user liked articles:", err);
    return [];
  }
}

/**
 * Toggles a bookmark on an article for the current authenticated user
 */
export async function toggleBookmarkArticle(
  userId: string,
  articleId: string,
  currentlyBookmarked: boolean
): Promise<boolean> {
  if (!isSupabaseConfigured() || !userId) {
    return true; // Mock success
  }

  const supabase = createClient();

  try {
    if (currentlyBookmarked) {
      const { error } = await supabase
        .from("user_bookmarks")
        .delete()
        .eq("user_id", userId)
        .eq("article_id", articleId);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("user_bookmarks")
        .insert({
          user_id: userId,
          article_id: articleId,
        });

      if (error) throw error;
    }
    return true;
  } catch (err) {
    console.error("[Supabase News] Error toggling bookmark:", err);
    return false;
  }
}

/**
 * Gets a list of article IDs bookmarked by the user
 */
export async function getUserBookmarkedArticles(userId: string): Promise<string[]> {
  if (!isSupabaseConfigured() || !userId) {
    return [];
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("user_bookmarks")
      .select("article_id")
      .eq("user_id", userId);

    if (error) throw error;
    return data ? data.map((item: { article_id: string }) => item.article_id) : [];
  } catch (err) {
    console.error("[Supabase News] Error getting user bookmarked articles:", err);
    return [];
  }
}
