"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Force a hard redirect to ensure the browser sends the new cookie
        // and the layout re-mounts properly without the login page conditional
        window.location.href = "/admin";
      } else {
        setError(data.message || "Invalid credentials");
        setLoading(false);
      }
    } catch (err) {
      setError("Server error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Carbon Fiber Background Pattern */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(27deg, #151515 5px, transparent 5px) 0 5px,
            linear-gradient(207deg, #151515 5px, transparent 5px) 10px 0px,
            linear-gradient(27deg, #222 5px, transparent 5px) 0px 10px,
            linear-gradient(207deg, #222 5px, transparent 5px) 10px 5px,
            linear-gradient(90deg, #1b1b1b 10px, transparent 10px),
            linear-gradient(#1d1d1d 25%, #1a1a1a 25%, #1a1a1a 50%, transparent 50%, transparent 75%, #242424 75%, #242424 100%)
          `,
          backgroundSize: "20px 20px"
        }}
      />

      {/* Ambient Red Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-brand-red/10 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md bg-[#111118]/80 backdrop-blur-xl border border-[#2a2a35] rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
      >
        <div className="text-center">
          <img src="/logo-transparent.png" alt="Future Radio" className="h-16 mx-auto mb-4 object-contain filter invert brightness-200" />
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Future Radio Admin
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            System Authentication Required
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 mt-8">
          <div>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1c1c28] border border-[#2a2a35] focus:border-brand-red rounded-xl px-4 py-3.5 text-white placeholder-gray-600 outline-none transition-all duration-300 tracking-[0.2em] text-center text-lg"
              autoFocus
            />
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-brand-red text-xs font-semibold text-center uppercase tracking-wider"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-brand-red text-white font-bold uppercase tracking-widest text-xs py-4 rounded-xl hover:bg-brand-red/90 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(230,0,0,0.2)]"
          >
            {loading ? "Decrypting..." : "Initialize Access"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
