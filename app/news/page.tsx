"use client";

import { useState, useEffect, useRef } from "react";
import { useCityStore, useAuthStore } from "@/lib/store";
import FeedCard from "@/components/news/FeedCard";
import CompactCard from "@/components/news/CompactCard";
import AuthModal from "@/components/auth/AuthModal";
import { NewsItem, INITIAL_MOCK_NEWS } from "@/lib/mockNews";
import { getNewsArticles } from "@/lib/supabase/news";

const CATEGORIES = ["For you", "Local", "Politics", "Business", "Sports", "National"];

export default function NewsFeedPage() {
  const { cityId } = useCityStore();
  const { user, isYtPremium } = useAuthStore();
  
  const [activeCategory, setActiveCategory] = useState("For you");
  const [newsFeed, setNewsFeed] = useState<NewsItem[]>(INITIAL_MOCK_NEWS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Load news feed dynamically from Supabase/Mock service
  useEffect(() => {
    async function loadNews() {
      const articles = await getNewsArticles(cityId);
      setNewsFeed(articles);
    }
    loadNews();
  }, [cityId]);

  // Dynamic Filtering based on selected category & search input
  const filteredFeed = newsFeed.filter((item) => {
    const matchesCategory =
      activeCategory === "For you" ||
      (activeCategory === "Local" && item.type === "local") ||
      item.category.toLowerCase() === activeCategory.toLowerCase();

    const matchesSearch =
      item.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Infinite scroll simulation using IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Append copies of the current feed with updated IDs to simulate pagination
          setNewsFeed((prev) => {
            if (prev.length === 0) return prev;
            const nextBatch = prev.slice(0, 8).map((item) => ({
              ...item,
              id: `${item.id}-page-${prev.length}`,
            }));
            return [...prev, ...nextBatch];
          });
        }
      },
      { threshold: 0.1 }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex justify-center items-center">
      {/* Mobile-Viewport Shell */}
      <main className="w-full max-w-[430px] min-h-screen bg-[#0a0a0f] text-white flex flex-col justify-between relative overflow-x-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border-x border-[#111118]">
        
        {/* TOP BAR: Sticky Header Console */}
        <header className="sticky top-0 z-30 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-[#2a2a35] px-5 py-4 space-y-4">
          {/* Row 1: Logo & Icons */}
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-extrabold tracking-tight select-none">
              Whatsup <span className="text-white">News</span>
            </h1>
            
            {/* Quick Utility Icons */}
            <div className="flex items-center gap-3.5 text-gray-400 select-none">
              <button className="hover:text-white transition" aria-label="Search">
                🔍
              </button>
              <button className="hover:text-white transition" aria-label="Notifications">
                🔔
              </button>
              
              {/* Authenticated Profile Trigger */}
              <button
                onClick={() => setIsAuthOpen(true)}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border transition-all duration-300 transform active:scale-95 ${
                  user
                    ? isYtPremium
                      ? "bg-[#ffffff]/15 border-[#ffffff]/35 text-white shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                      : "bg-brand-red/15 border-brand-red/35 text-brand-red shadow-[0_0_8px_rgba(230,0,0,0.2)]"
                    : "bg-[#111118] border-brand-border text-gray-400 hover:text-white"
                }`}
                aria-label="Profile sync node"
              >
                {user ? (user.avatar as string || "👤") : "👤"}
              </button>
            </div>
          </div>

          {/* Row 2: Search Input and City Chip */}
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search headlines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111118] border border-[#2a2a35] focus:border-white/40 rounded-lg py-1.5 pl-3.5 pr-8 text-xs font-semibold text-white placeholder-gray-500 outline-none transition duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1.5 text-gray-500 hover:text-white text-sm"
                >
                  ×
                </button>
              )}
            </div>
            {/* Local City Context Indicator */}
            <div className="flex items-center gap-1 bg-[#ffffff]/10 border border-[#ffffff]/25 text-[#ffffff] px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffffff] animate-pulse" />
              <span>{cityId}</span>
            </div>
          </div>

          {/* Row 3: Horizontal Scrollable Category Pills */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2 select-none">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                    isActive
                      ? "bg-white text-white border-transparent shadow-[0_0_10px_rgba(255,255,255,0.3)] scale-105"
                      : "bg-transparent border-[#2a2a35] text-gray-400 hover:text-white hover:border-gray-500"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </header>

        {/* FEED: Scrollable Section */}
        <section className="flex-1 px-5 py-6 space-y-6 pb-32 overflow-y-auto">
          {filteredFeed.length > 0 ? (
            filteredFeed.map((item, index) => {
              const isEven = index % 2 === 0;
              return isEven ? (
                <FeedCard
                  key={item.id}
                  id={item.id}
                  type={item.type}
                  category={item.category}
                  headline={item.headline}
                  snippet={item.snippet}
                  source={item.source}
                  timeAgo={item.timeAgo}
                  likes={item.likes}
                  comments={item.comments}
                />
              ) : (
                <CompactCard
                  key={item.id}
                  id={item.id}
                  type={item.type}
                  category={item.category}
                  headline={item.headline}
                  source={item.source}
                  timeAgo={item.timeAgo}
                  likes={item.likes}
                />
              );
            })
          ) : (
            <div className="text-center py-20 space-y-2 select-none">
              <span className="text-3xl">🔎</span>
              <p className="text-sm text-gray-500 font-semibold">No stories match your filter query.</p>
            </div>
          )}

          {/* Infinite Scroll Sentinel Div */}
          <div ref={sentinelRef} className="h-6 flex items-center justify-center select-none opacity-40">
            <span className="w-2 h-2 rounded-full bg-white animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-white animate-bounce delay-100 mx-1" />
            <span className="w-2 h-2 rounded-full bg-white animate-bounce delay-200" />
          </div>
        </section>

        {/* Google Authentication Sync Modal */}
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      </main>
    </div>
  );
}
