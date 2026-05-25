"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { NewsItem } from "@/lib/mockNews";
import { useAudioStore } from "@/components/audio/useAudioStore";
import { useUiStore, useAuthStore } from "@/lib/store";
import { getArticleById, toggleLikeArticle, toggleBookmarkArticle, getUserLikedArticles, getUserBookmarkedArticles } from "@/lib/supabase/news";

export default function InterceptedArticleModalPage({
  params,
}: {
  params: { slug: string };
}) {
  const router = useRouter();
  const { isPlaying, currentBlock, setIsPlaying, setViewMode } = useAudioStore();
  const { setMode } = useUiStore();
  const { user } = useAuthStore();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [article, setArticle] = useState<NewsItem | null>(null);

  // Load article dynamically
  useEffect(() => {
    async function loadArticle() {
      const data = await getArticleById(params.slug);
      setArticle(data);
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

  useEffect(() => {
    // Lock background scrolling when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  if (!article) {
    return null;
  }

  const handleClose = () => {
    router.back();
  };

  const domain = `${article.source.toLowerCase().replace(/ /g, "")}.com`;
  const articleUrl = `https://www.${domain}/article/${article.id}`;

  const handleOpenSource = () => {
    window.open(articleUrl, "_blank");
  };

  // Initials for author circle
  const initials = article.source.slice(0, 2).toUpperCase();

  // Category visual icons map
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs select-none">
      {/* Backdrop Trigger */}
      <div className="absolute inset-0" onClick={handleClose} />

      {/* Modal Sheet Content */}
      <motion.main
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        className="relative w-full max-w-[430px] h-[92vh] bg-[#0a0a0f] border-t border-[#2a2a35] rounded-t-2xl flex flex-col justify-between overflow-hidden shadow-[0_-10px_50px_rgba(0,0,0,0.5)]"
      >
        
        {/* Sticky Header Console inside Modal */}
        <header className="sticky top-0 z-10 bg-[#0a0a0f]/95 border-b border-[#2a2a35] px-4 py-3.5 flex justify-between items-center select-none">
          {/* Back Trigger */}
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white p-1"
            aria-label="Back to feed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>

          {/* Domain Pill */}
          <div className="flex items-center gap-1 bg-[#111118] border border-brand-border px-3 py-1 rounded-full text-[10px] font-bold text-gray-300">
            <span>{domain}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-3 h-3 text-gray-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              />
            </svg>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3.5 text-gray-400">
            <button
              onClick={handleBookmarkToggle}
              className="hover:text-white transition"
              aria-label="Bookmark"
            >
              {isBookmarked ? "🔖" : "📁"}
            </button>
            <button className="hover:text-white transition" aria-label="Share">
              📤
            </button>
          </div>
        </header>

        {/* Modal Scroll Container */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 pb-24 no-scrollbar">
          
          {/* Hero Image Zone (180px tall) */}
          <div className="h-[180px] bg-[#1c1c28] rounded-xl flex items-center justify-center relative select-none">
            <span className="text-5xl">{categoryIcon()}</span>
            {/* Absolute Top-Left Badges */}
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
          <h2 className="text-[19px] font-bold text-white leading-snug tracking-tight">
            {article.headline}
          </h2>

          {/* Author Row (Border top + bottom) */}
          <div className="border-y border-[#2a2a35] py-3.5 flex justify-between items-center select-none">
            <div className="flex items-center gap-3">
              {/* Avatar circle */}
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
            {/* Follow Pill */}
            <button className="px-3.5 py-1 rounded-full border border-brand-teal/40 text-brand-teal text-[10px] font-bold uppercase tracking-wider hover:bg-brand-teal/10 transition">
              + Follow
            </button>
          </div>

          {/* Article Text Content */}
          <div className="text-[14px] text-gray-300 leading-[1.7] space-y-4 select-text">
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

          {/* Original Source Link Card */}
          <div
            onClick={handleOpenSource}
            className="bg-[#1c1c28] border border-[#2a2a35] rounded-xl p-4 flex items-center justify-between hover:border-brand-teal/40 hover:bg-[#20202e] transition cursor-pointer select-none"
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

        {/* Reaction Bar (Sticky Bottom inside Modal) */}
        <footer className="absolute bottom-0 left-0 right-0 z-10 bg-[#0a0a0f]/95 border-t border-[#2a2a35] px-4 py-3 flex flex-col gap-2.5 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
          {/* Shared Action Controls Row */}
          <div className="flex justify-between items-center px-4 py-1 text-xs font-bold text-gray-500 select-none">
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

          {/* Miniature Persisted Audio Bar (last child) */}
          <div
            onClick={() => {
              setViewMode("fullscreen");
              setMode("radio");
              router.push("/radio");
            }}
            className="w-full flex items-center justify-between bg-[#111118]/85 border border-[#2a2a35]/60 px-3.5 py-2 rounded-full cursor-pointer hover:border-brand-purple/40 hover:scale-[1.01] active:scale-[0.99] transition duration-200 select-none"
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

      </motion.main>
    </div>
  );
}
