import Link from "next/link";

interface CompactCardProps {
  id: string;
  type: "local" | "national" | "official";
  category: string;
  headline: string;
  source: string;
  timeAgo: string;
  likes: number;
}

export default function CompactCard({
  id,
  type,
  category,
  headline,
  source,
  timeAgo,
  likes,
}: CompactCardProps) {
  // Category icons mapping
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

  // Badge colors mapping
  const badgeColor = () => {
    switch (type) {
      case "local":
        return "bg-white/10 text-white border-white/15";
      case "national":
        return "bg-blue-500/10 text-blue-400 border-blue-500/15";
      case "official":
        return "bg-amber-500/10 text-amber-400 border-amber-500/15";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/15";
    }
  };

  return (
    <article className="rounded-xl border border-[#2a2a35] bg-[#111118] p-3 flex gap-3 hover:border-[#2a2a35]/80 transition duration-200">
      
      {/* Left: 70x70 Square Thumb */}
      <div className="w-[70px] h-[70px] rounded-xl bg-[#1c1c28] border border-[#2a2a35] flex items-center justify-center flex-shrink-0 text-2xl select-none">
        {categoryIcon()}
      </div>

      {/* Right Content */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        
        {/* Top: Type Badge */}
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider rounded border ${badgeColor()}`}>
            {type}
          </span>
          <span className="text-[10px] text-gray-500 font-semibold">{category}</span>
        </div>

        {/* Headline (2-Line Clamp) */}
        <h4 className="text-xs font-semibold text-white leading-normal line-clamp-2 hover:text-white transition duration-150">
          <Link href={`/news/article/${id}`}>{headline}</Link>
        </h4>

        {/* Source, Time, Likes */}
        <div className="flex items-center justify-between text-[9px] text-gray-500 font-bold uppercase tracking-wider select-none">
          <span className="truncate max-w-[120px]">{source} • {timeAgo}</span>
          <span className="flex items-center gap-0.5 text-red-500/80">
            ❤️ {likes}
          </span>
        </div>

      </div>

    </article>
  );
}
