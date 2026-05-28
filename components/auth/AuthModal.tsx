"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/store";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { user, isYtPremium, setUser, setIsYtPremium } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState<"none" | "premium" | "regular">("none");

  const handleGoogleLogin = () => {
    setLoading(true);
    setPremiumStatus("none");

    // Simulate Google OAuth Sign-In & YouTube Subscription query
    setTimeout(() => {
      // Simulate random selection or preset selection
      const hasYtPremium = Math.random() > 0.4; // 60% chance to mock Premium subscription
      
      setUser({
        email: "future.listener@gmail.com",
        name: "Raipur Curated Listener",
        avatar: "👤",
      });

      setIsYtPremium(hasYtPremium);
      setPremiumStatus(hasYtPremium ? "premium" : "regular");
      setLoading(false);

      // Auto-close modal after showing success state
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 1500);
  };

  const handleLogout = () => {
    setUser(null);
    setIsYtPremium(false);
    setPremiumStatus("none");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          {/* Backdrop Trigger */}
          <div className="absolute inset-0" onClick={onClose} />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 250 }}
            className="relative w-full max-w-[390px] rounded-3xl border border-[#2a2a35] bg-[#111118]/90 backdrop-blur-xl p-6 shadow-2xl space-y-6 overflow-hidden select-none"
          >
            {/* Ambient Background Glowing Orb */}
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-brand-red/20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-white/15 blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="text-center relative">
              <span className="text-[10px] font-bold text-brand-red uppercase tracking-[0.2em]">
                Secure Sync Node
              </span>
              <h3 className="text-xl font-extrabold text-white mt-1">
                {user ? "Your Profile Grid" : "Join the Grid"}
              </h3>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                {user 
                  ? "Manage your connected Google Account and active subscriptions." 
                  : "Sign in with Google to sync likes, bookmarks, and check YouTube Premium features."
                }
              </p>

              {/* Close Cross */}
              <button
                onClick={onClose}
                className="absolute -top-1 -right-1 text-gray-500 hover:text-white text-lg p-1"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {user ? (
              // Logged In State
              <div className="space-y-4 relative">
                <div className="bg-[#1c1c28] border border-brand-border rounded-xl p-4 flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-brand-red/15 border border-brand-red/35 flex items-center justify-center text-xl">
                    {user.avatar as string || "👤"}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{user.name as string}</h4>
                    <p className="text-xs text-gray-400">{user.email as string}</p>
                  </div>
                </div>

                {/* Subscription Status Card */}
                <div className={`p-4 rounded-xl border ${
                  isYtPremium 
                    ? "bg-[#ffffff]/10 border-[#ffffff]/20 text-white" 
                    : "bg-brand-red/10 border-brand-red/20 text-brand-red"
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{isYtPremium ? "🎟️" : "📡"}</span>
                    <div>
                      <h5 className="text-xs font-extrabold uppercase tracking-wider">
                        {isYtPremium ? "YouTube Subscription Sync" : "YouTube Ad-Supported"}
                      </h5>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {isYtPremium 
                          ? "Premium verified! Enjoying 100% ad-free streams and voiceovers." 
                          : "Non-premium account recognized. Scheduled ad breaks are active."
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider hover:bg-red-500 hover:text-white transition duration-300"
                >
                  Disconnect Profile
                </button>
              </div>
            ) : (
              // Logged Out State
              <div className="space-y-4 relative">
                {/* Google Sign In Trigger */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-white text-gray-900 hover:bg-gray-150 font-semibold text-xs transition duration-300 transform active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? (
                    <span className="w-4 h-4 rounded-full border-2 border-brand-red border-t-transparent animate-spin" />
                  ) : (
                    // Google Vector Icon
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.6c-.28 1.48-1.12 2.73-2.38 3.58v3h3.84c2.25-2.06 3.58-5.1 3.58-8.41Z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.84-3c-1.07.72-2.44 1.16-4.12 1.16-3.17 0-5.85-2.14-6.81-5.02H1.205v3.13C3.185 21.28 7.315 24 12 24Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.19 14.23c-.24-.72-.38-1.49-.38-2.23s.14-1.51.38-2.23V6.63H1.205C.425 8.19 0 9.94 0 12s.425 3.81 1.205 5.37l3.985-3.14Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.22 0 12 0 7.315 0 3.185 2.72 1.205 6.63l3.985 3.14c.96-2.88 3.64-5.02 6.81-5.02Z"
                      />
                    </svg>
                  )}
                  <span>{loading ? "Syncing Google Profile..." : "Continue with Google"}</span>
                </button>

                {/* Subscriptions Recognition Loader feedback */}
                <AnimatePresence>
                  {premiumStatus !== "none" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={`p-4 rounded-xl border text-center ${
                        premiumStatus === "premium" 
                          ? "bg-[#ffffff]/10 border-[#ffffff]/25 text-white" 
                          : "bg-amber-500/10 border-amber-500/25 text-amber-400"
                      }`}
                    >
                      <h4 className="text-xs font-bold uppercase tracking-wider">
                        {premiumStatus === "premium" ? "🎟️ YouTube Premium Detected!" : "📡 Regular Account Detected"}
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-1 leading-normal">
                        {premiumStatus === "premium" 
                          ? "Google Auth recognized your YouTube subscription. Bypassing ads... Stream is 100% ad-free!" 
                          : "Regular YouTube account linked. Scheduled ad breaks will be active."
                        }
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Terms Sticker */}
            <p className="text-[10px] text-center text-gray-500 leading-normal select-none">
              By connecting, you sync telemetry bookmarks. Verified securely via Supabase Auth services.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
