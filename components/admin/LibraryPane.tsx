"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Search, FileAudio, GripVertical } from "lucide-react";

// Using anon key for reading public bucket
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function LibraryPane() {
  const [jocktalks, setJocktalks] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLibrary();
  }, []);

  const fetchLibrary = async () => {
    setLoading(true);
    const { data, error } = await supabase.storage.from("jocktalks").list();
    if (!error && data) {
      // Filter out empty folder placeholder if any
      const files = data.filter(f => f.name !== ".emptyFolderPlaceholder");
      setJocktalks(files);
    }
    setLoading(false);
  };

  const filteredItems = jocktalks.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full border-[#1a1a24] bg-[#0d0d14] flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-[#1a1a24] space-y-4 bg-[#111118]">

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search Jocktalks..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#1c1c28] border border-[#2a2a35] focus:border-brand-red rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="text-center py-10 text-xs text-gray-500">Loading Library...</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-10 text-xs text-gray-500">No assets found.</div>
        ) : (
          filteredItems.map(file => {
            const publicUrl = supabase.storage.from("jocktalks").getPublicUrl(file.name).data.publicUrl;
            return (
              <div 
                key={file.id} 
                className="bg-[#15151e] border border-[#2a2a34] rounded-lg p-3 hover:border-brand-red/50 hover:bg-[#1a1a24] transition-colors cursor-grab active:cursor-grabbing flex items-center gap-3 group"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("application/json", JSON.stringify({
                    type: "library_asset",
                    url: publicUrl,
                    name: file.name
                  }));
                  e.dataTransfer.effectAllowed = "copy";
                }}
              >
                <div className="text-gray-600 group-hover:text-gray-400">
                  <GripVertical size={14} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-semibold text-gray-200 truncate">{file.name}</p>
                  <p className="text-[10px] text-gray-500">{(file.metadata?.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
