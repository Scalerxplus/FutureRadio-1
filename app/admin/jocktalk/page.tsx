"use client";

import { useState } from "react";
import { Mic2, Send, Clock, CheckCircle } from "lucide-react";

export default function JocktalkOverridePage() {
  const [topicText, setTopicText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!topicText) return;
    setIsSubmitting(true);
    setSuccess(false);

    try {
      const response = await fetch("/api/admin/jocktalk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic_text: topicText, city_id: "raipur" })
      });
      
      if (!response.ok) throw new Error("Failed to insert override");
      
      setSuccess(true);
      setTopicText("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Jocktalk Override (HITL)</h2>
        <p className="text-gray-400">Inject custom topics or exact scripts for the Station Intelligence to read on the next break.</p>
      </header>

      <div className="bg-[#111118] border border-[#1a1a24] rounded-2xl p-6 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-brand-primary/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Mic2 className="text-brand-primary" />
                What hyper-local update should the Station prioritize next?
              </h3>
            </div>
          </div>

          <textarea
            value={topicText}
            onChange={(e) => setTopicText(e.target.value)}
            placeholder="Type exactly what you want the Station Intelligence to broadcast, or give bullet points like:&#10;- Welcome listeners back to Evening Rush&#10;- Mention the heavy traffic near VIP Road&#10;- Tease the next song (Arijit Singh)"
            className="w-full h-48 bg-[#0a0a0f] border border-[#2a2a35] rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-brand-primary transition-colors resize-none mb-6"
          />

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock size={16} />
              <span>Will be injected on the next schedule generation cycle</span>
            </div>
            
            <button 
              onClick={handleSubmit}
              disabled={!topicText || isSubmitting}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                success 
                  ? 'bg-green-600 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : success ? (
                <>
                  <CheckCircle size={18} /> Inserted to Queue
                </>
              ) : (
                <>
                  <Send size={18} /> Send to Master Clock
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
