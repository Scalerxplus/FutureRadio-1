"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NewsItem } from "@/lib/mockNews";
import { useAudioStore } from "@/components/audio/useAudioStore";
import { useUiStore, useAuthStore } from "@/lib/store";
import { getArticleById, toggleLikeArticle, toggleBookmarkArticle, getUserLikedArticles, getUserBookmarkedArticles } from "@/lib/supabase/news";

export default function DirectArticleFallbackPage({
  params,
}: {
  params: { slug: string };
}) {
  const router = useRouter();
  const { setMode } = useUiStore();
  const { user } = useAuthStore();
  const { isPlaying, currentBlock, setIsPlaying, setViewMode } = useAudioStore();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [article, setArticle] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Load article dynamically
  useEffect(() => {
    async function loadArticle() {
      setLoading(true);
      const data = await getArticleById(params.slug);
      setArticle(data);
      setLoading(false);
    }
    loadArticle();
  }, [params.slug]);

  // Synchronize liked & bookmarked states from Supabase if user is logged in
  useEffect(() => {
    if (!user) return;
    const userId = "00000000-0000-0000-0000-000000000000"; // simulation mock UUID
    async function syncUserActions() {
      const likedIds = await getUserLikedArticles(userId);
      const bookmarkedIds = await getUserBookmarkedArticles(userId);
      setIsLiked(likedIds.includes(params.slug));
      setIsBookmarked(bookmarkedIds.includes(params.slug));
    }
    syncUserActions();
  }, [user, params.slug]);

  const handleLikeToggle = async () => {
    const userId = "00000000-0000-0000-0000-000000000000";
    const res = await toggleLikeArticle(userId, params.slug, isLiked);
    if (res.success) {
      setIsLiked(!isLiked);
      if (article) {
        setArticle({ ...article, likes: res.likesCount });
      }
    }
  };

  const handleBookmarkToggle = async () => {
    const userId = "00000000-0000-0000-0000-000000000000";
    const success = await toggleBookmarkArticle(userId, params.slug, isBookmarked);
    if (success) {
      setIsBookmarked(!isBookmarked);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white flex flex-col justify-center items-center p-6 text-center select-none">
        <span className="w-8 h-8 rounded-full border-2 border-brand-teal border-t-transparent animate-spin" />
        <p className="text-xs text-gray-400 mt-3 font-semibold uppercase tracking-wider">Syncing Article Node...</p>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white flex flex-col justify-center items-center p-6 text-center select-none">
        <span className="text-4xl">⚠️</span>
        <h2 className="text-xl font-bold mt-2">Article Not Found</h2>
        <Link href="/news" className="text-brand-teal font-bold hover:underline mt-4">
          Return to News Feed
        </Link>
      </main>
    );
  }

  const domain = `${article.source.toLowerCase().replace(/ /g, "")}.com`;
  const articleUrl = `https://www.${domain}/article/${article.id}`;

  const handleOpenSource = () => {
    window.open(articleUrl, "_blank");
  };

  const handleBackToFeed = () => {
    setMode("news");
    setViewMode("bubble");
    router.push("/news");
  };

  const handleNavigateRadio = () => {
    setViewMode("fullscreen");
    setMode("radio");
    router.push("/radio");
  };

  const initials = article.source.slice(0, 2).toUpperCase();

  const categoryIcon = () => {
    switch (article.category.toLowerCase()) {
      case "technology":
      case "science":
        return "💻";
      case "politics":
        return "🏛️";
      case "business":
        return "📈";
      case "sports":
        return "🏆";
      default:
        return "📰";
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex justify-center items-center select-none">
      
      {/* Mobile Shell Wrapper */}
      <main className="w-full max-w-[430px] min-h-screen bg-[#0a0a0f] text-white flex flex-col justify-between p-5 relative overflow-x-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border-x border-[#111118]">
        
        {/* Header Back Link */}
        <header className="flex justify-between items-center h-12 border-b border-[#2a2a35] pb-2">
          <button
            onClick={handleBackToFeed}
            className="flex items-center gap-1 text-xs font-bold text-brand-teal hover:underline"
          >
            ← Back to feed
          </button>
          
          <div className="flex items-center gap-1 bg-[#111118] border border-brand-border px-3 py-1 rounded-full text-[10px] font-bold text-gray-300">
            <span>{domain}</span>
          </div>
        </header>

        {/* Article Reading Flow */}
        <div className="flex-1 overflow-y-auto space-y-6 py-6 pb-28 no-scrollbar">
          
          {/* Hero Image Block */}
          <div className="h-[180px] bg-[#1c1c28] rounded-xl flex items-center justify-center relative">
            <span className="text-5xl">{categoryIcon()}</span>
            {/* Absolute Badges */}
            <div className="absolute top-3 left-3 flex gap-1">
              <span className="bg-brand-teal/80 text-white border border-brand-teal/30 px-2.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider backdrop-blur-xs">
                {article.type}
              </span>
              <span className="bg-brand-purple/80 text-white border border-brand-purple/30 px-2.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider backdrop-blur-xs">
                {article.category}
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-xl font-extrabold text-white leading-snug tracking-tight select-text">
            {article.headline}
          </h1>

          {/* Author Details Row */}
          <div className="border-y border-[#2a2a35] py-3.5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#1D9E75]/15 border border-[#1D9E75]/35 flex items-center justify-center text-xs font-extrabold text-brand-teal">
                {initials}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">AI Reporter</h4>
                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                  {article.source}
                </p>
              </div>
            </div>
            {/* Follow Button */}
            <button className="px-3.5 py-1 rounded-full border border-brand-teal/40 text-brand-teal text-[10px] font-bold uppercase tracking-wider hover:bg-brand-teal/10 transition">
              + Follow
            </button>
          </div>

          {/* Core Article Body Paragraphs */}
          <div className="text-sm text-gray-300 leading-[1.7] space-y-4 select-text">
            <p>{article.snippet}</p>
            <p>
              In a major milestone for decentralized soundwave loops, local curators and municipal planners confirmed
              that these upgrades represent a significant leap over standard webcasting systems. Synchronized
              audio arrays will allow continuous beats to overlay with live news feeds seamlessly.
            </p>

            {/* Pull Quote Block */}
            <blockquote className="border-l-3 border-brand-teal bg-[#1c1c28] p-4 rounded-r-xl italic font-serif text-gray-200 text-sm select-none">
              &ldquo;Raipur smart sound telemetries are setting the benchmark for localized digital experiences nationwide.
              The integration of Zustand stores and XState guarantees absolute audio persistence.&rdquo;
            </blockquote>

            <p>
              Moving forward, tech developers plan to integrate secondary voice channels allowing listeners to trigger
              curated feeds on-demand without interrupting their main play status.
            </p>
          </div>

          {/* Original Source Card */}
          <div
            onClick={handleOpenSource}
            className="bg-[#1c1c28] border border-[#2a2a35] rounded-xl p-4 flex items-center justify-between hover:border-brand-teal/40 hover:bg-[#20202e] transition cursor-pointer"
          >
            <div className="space-y-0.5 overflow-hidden">
              <h4 className="text-xs font-bold text-white">View original article</h4>
              <p className="text-[10px] text-gray-500 truncate max-w-[280px]">
                {articleUrl}
              </p>
            </div>
            <div className="text-brand-teal font-extrabold text-lg pr-1">→</div>
          </div>

          {/* Source Attribution Note */}
          <p className="text-[9px] text-center text-gray-600 font-semibold select-none">
            Content by {article.source} • Future Radio summarizes, not republishes
          </p>

        </div>

        {/* Reaction Bar & Persisted Mini Player */}
        <footer className="absolute bottom-0 left-0 right-0 z-10 bg-[#0a0a0f]/95 border-t border-[#2a2a35] px-4 py-3 flex flex-col gap-2.5 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
          {/* Reaction Bar Row */}
          <div className="flex justify-between items-center px-4 py-1 text-xs font-bold text-gray-500">
            <button
              onClick={handleLikeToggle}
              className={`flex items-center gap-1.5 transition ${isLiked ? "text-red-500" : "hover:text-red-500"}`}
            >
              <span>❤️</span>
              <span>{article.likes}</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-brand-purple transition">
              <span>💬</span>
              <span>{article.comments}</span>
            </button>
            <button
              onClick={handleBookmarkToggle}
              className={`flex items-center gap-1.5 transition ${isBookmarked ? "text-brand-purple" : "hover:text-white"}`}
            >
              <span>🔖</span>
              <span>Save</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-white transition">
              <span>📤</span>
              <span>Share</span>
            </button>
          </div>

          {/* Mini persisted player bar */}
          <div
            onClick={handleNavigateRadio}
            className="w-full flex items-center justify-between bg-[#111118]/85 border border-[#2a2a35]/60 px-3.5 py-2 rounded-full cursor-pointer hover:border-brand-purple/40 hover:scale-[1.01] active:scale-[0.99] transition duration-200"
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-ping" />
              <p className="text-[10px] text-gray-400 truncate max-w-[280px]">
                {currentBlock ? `${currentBlock.songTitle} · playing now` : "kesariya · playing now"}
              </p>
            </div>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-brand-purple hover:bg-brand-purple/90 text-white flex items-center justify-center hover:scale-105 transition-all shadow-md"
            >
              {isPlaying ? "⏹" : "▶"}
            </button>
          </div>
        </footer>

      </main>
    </div>
  );
}
