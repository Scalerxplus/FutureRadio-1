import Link from "next/link";

interface FeedCardProps {
  id: string;
  type: "local" | "national" | "official";
  category: string;
  headline: string;
  snippet: string;
  source: string;
  timeAgo: string;
  likes: number;
  comments: number;
}

export default function FeedCard({
  id,
  type,
  category,
  headline,
  snippet,
  source,
  timeAgo,
  likes,
  comments,
}: FeedCardProps) {
  // Initials for avatar circle
  const initials = source
    ? source
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "FR";

  // Category visual icons map
  const categoryIcon = () => {
    switch (category.toLowerCase()) {
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

  // Badge mapping
  const badgeColor = () => {
    switch (type) {
      case "local":
        return "bg-white/15 text-white border-white/20";
      case "national":
        return "bg-blue-500/15 text-blue-400 border-blue-500/20";
      case "official":
        return "bg-amber-500/15 text-amber-400 border-amber-500/20";
      default:
        return "bg-gray-500/15 text-gray-400 border-gray-500/20";
    }
  };

  return (
    <article className="rounded-2xl bg-[#111118] border border-[#2a2a35] overflow-hidden hover:border-[#2a2a35]/80 transition duration-300 shadow-xl max-w-full flex flex-col justify-between">
      
      {/* Top: Image Zone (150px tall, category icon centered) */}
      <div className="h-[150px] bg-[#1c1c28] border-b border-[#2a2a35] flex items-center justify-center relative select-none">
        <span className="text-4xl">{categoryIcon()}</span>
        {/* Source Overlay at bottom of image */}
        <div className="absolute bottom-3 left-3 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white font-semibold uppercase tracking-wider backdrop-blur-xs select-none">
          {source}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Source Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Avatar Circle */}
            <div className="w-8 h-8 rounded-full bg-brand-red/10 border border-brand-red/35 flex items-center justify-center text-[10px] font-bold text-brand-red">
              {initials}
            </div>
            <div>
              <h4 className="text-xs font-bold text-white leading-none">{source}</h4>
              <span className="text-[10px] text-gray-500 font-semibold">{timeAgo}</span>
            </div>
          </div>
          {/* Type Badge */}
          <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded border ${badgeColor()}`}>
            {type}
          </span>
        </div>

        {/* Headline & Snippet */}
        <div className="space-y-1.5">
          <h3 className="text-[15px] font-semibold text-white leading-normal hover:text-brand-red transition duration-200">
            <Link href={`/news/article/${id}`}>{headline}</Link>
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 select-none">
            {snippet}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-[#2a2a35] flex justify-between items-center bg-[#111118]/40">
        {/* Actions (Heart, Comment, Share) */}
        <div className="flex items-center gap-4 text-xs font-bold text-gray-500 select-none">
          <button className="flex items-center gap-1 hover:text-red-500 transition">
            <span>❤️</span>
            <span>{likes}</span>
          </button>
          <button className="flex items-center gap-1 hover:text-brand-red transition">
            <span>💬</span>
            <span>{comments}</span>
          </button>
          <button className="hover:text-white transition" aria-label="Share story">
            <span>📤</span>
          </button>
        </div>

        {/* Full Link Trigger */}
        <Link
          href={`/news/article/${id}`}
          className="text-xs font-bold text-white hover:underline flex items-center gap-0.5"
        >
          Read full ↗
        </Link>
      </div>

    </article>
  );
}
