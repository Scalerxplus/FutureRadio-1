"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Sparkles, Music, CheckCircle } from "lucide-react";

const MOODS = [
  { id: "high_energy", name: "High Energy (Party/Drive)", color: "bg-red-500" },
  { id: "chill_lofi", name: "Chill & Lo-Fi (Late Night)", color: "bg-purple-500" },
  { id: "romantic", name: "Romantic Hits", color: "bg-pink-500" },
  { id: "retro", name: "Retro Classics", color: "bg-orange-500" },
  { id: "mixed", name: "Mixed (Daytime Rotation)", color: "bg-blue-500" }
];

export default function SettingsPage() {
  const [activeMood, setActiveMood] = useState("high_energy");
  const [rjPrompt, setRjPrompt] = useState(
    "You are RJ AIRA, a vibrant, highly energetic, and witty radio jockey for 'Future Radio'. Your tone is extremely Gen-Z, stylish, and conversational Hinglish. You love EDM music and keeping the listeners hyped."
  );
  
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // In a real app, we would fetch these settings from Supabase on mount
  useEffect(() => {
    // Simulated fetch
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSuccess(false);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rjPrompt, playlistMood: activeMood, cityId: "raipur" })
      });
      
      if (!response.ok) throw new Error("Failed to save settings");
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl pb-24">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Station Settings</h2>
          <p className="text-gray-400">Instantly change the broadcast vibe and AI persona.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${
            success 
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
          }`}
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : success ? (
            <>
              <CheckCircle size={18} /> Saved
            </>
          ) : (
            <>
              <Save size={18} /> Apply Changes
            </>
          )}
        </button>
      </header>

      <div className="space-y-8">
        
        {/* Playlist Mood Selector */}
        <section className="bg-[#111118] border border-[#1a1a24] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Music className="text-blue-400" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Broadcast Mood</h3>
              <p className="text-sm text-gray-400">Changes the type of songs and sweepers the auto-pilot selects.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOODS.map((mood) => (
              <div 
                key={mood.id}
                onClick={() => setActiveMood(mood.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  activeMood === mood.id 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-[#2a2a34] hover:border-gray-500 bg-[#15151e]'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className={`w-3 h-3 rounded-full ${mood.color} ${activeMood === mood.id ? 'animate-pulse' : ''}`} />
                  <span className={`font-semibold ${activeMood === mood.id ? 'text-white' : 'text-gray-300'}`}>
                    {mood.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI RJ Persona Prompt */}
        <section className="bg-[#111118] border border-[#1a1a24] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Sparkles className="text-purple-400" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">AI RJ System Persona</h3>
              <p className="text-sm text-gray-400">The core prompt that dictates how the AI RJ behaves and talks.</p>
            </div>
          </div>

          <textarea
            value={rjPrompt}
            onChange={(e) => setRjPrompt(e.target.value)}
            className="w-full h-48 bg-[#1a1a24] border border-[#2a2a34] rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none font-mono text-sm leading-relaxed"
          />
          <div className="mt-3 flex justify-between items-center text-sm text-gray-500">
            <p>Tip: Mention specific phrases or taglines you want the AI to use frequently.</p>
            <p>{rjPrompt.length} characters</p>
          </div>
        </section>

      </div>
    </div>
  );
}
