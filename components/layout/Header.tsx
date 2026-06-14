"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, UserCircle } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import AuthModal from "@/components/auth/AuthModal";

export const Header = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isAuthOpen, setIsAuthOpen] = React.useState(false);
  
  const { user, isYtPremium } = useAuthStore();

  const links: { name: string; href: string; external?: boolean }[] = [
    { name: "Radio", href: "/radio" },
    { name: "Tech", href: "/technology" },
    { name: "Business", href: "/business" },
    { name: "Partner", href: "/partner" },
    { name: "Creators", href: "/creators" },
    { name: "Analysis", href: "/analysis" },
    { name: "About", href: "/about" },
  ];

  return (
    <>
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-4 flex items-center justify-between bg-white border-b-4 border-brand-dark"
      >
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:-translate-y-1 transition-transform">
            <img 
              src="/icons/logo-horizontal-dark.png" 
              alt="Future Radio" 
              className="h-8 object-contain"
            />
          </Link>
          <span className="hidden lg:inline-block text-[10px] font-mono text-brand-dark font-bold tracking-widest uppercase border-2 border-brand-dark px-2 py-0.5 bg-brand-yellow shadow-brutal-sm">
            FUTURE_RADIO_LIVE
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden xl:flex gap-3 items-center text-sm font-bold font-mono uppercase">
          {links.map((link, i) => {
            const isActive = pathname === link.href;
            const linkProps = link.external ? { target: "_blank", rel: "noopener noreferrer" } : {};
            return (
              <Link 
                key={i} 
                href={link.href} 
                {...linkProps} 
                className={`px-3 py-1.5 transition-all border-2 ${
                  isActive 
                    ? "bg-brand-yellow text-brand-dark border-brand-dark shadow-brutal-sm" 
                    : "border-transparent text-gray-600 hover:text-brand-dark hover:border-brand-dark hover:bg-gray-100"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          {/* Global Auth Button */}
          <button
            onClick={() => setIsAuthOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 border-2 text-xs font-bold uppercase tracking-wider transition-all hover:-translate-y-1 ${
              user
                ? isYtPremium
                  ? "bg-brand-dark text-white border-brand-dark shadow-brutal-sm"
                  : "bg-white text-brand-red border-brand-red shadow-brutal-sm hover:shadow-none"
                : "bg-gray-100 text-brand-dark border-brand-dark shadow-brutal-sm hover:shadow-none hover:bg-white"
            }`}
          >
            <UserCircle size={16} className={user ? (isYtPremium ? "text-brand-yellow" : "text-brand-red") : "text-gray-500"} />
            <span>{user ? (isYtPremium ? "Premium" : "Connected") : "Sync"}</span>
          </button>

          <Link 
            href="/partner" 
            className="ml-2 border-2 border-brand-dark bg-brand-red text-white px-4 py-2 shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all whitespace-nowrap uppercase font-bold text-xs"
          >
            Partner
          </Link>
        </nav>

        {/* Mobile Nav Toggle */}
        <div className="xl:hidden flex items-center gap-3">
          <button
            onClick={() => setIsAuthOpen(true)}
            className={`flex items-center justify-center p-2 border-2 transition-all ${
              user ? "border-brand-red text-brand-red" : "border-brand-dark text-brand-dark"
            }`}
          >
            <UserCircle size={20} />
          </button>
          <button 
            className="text-brand-dark p-2 border-2 border-brand-dark bg-brand-yellow shadow-brutal-sm active:translate-y-1 active:shadow-none transition-all"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </motion.header>

      {/* Global Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-[60] bg-brand-dark border-b-4 border-brand-red flex flex-col pt-24 px-6 pb-6 overflow-y-auto"
          >
            <button 
              className="absolute top-6 right-6 text-white p-2 border-2 border-white hover:bg-brand-red transition-colors z-10"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-8 h-8" />
            </button>

            <nav className="relative z-10 flex flex-col gap-6 text-3xl font-display uppercase mt-8 text-center">
              {links.map((link, i) => {
                const isActive = pathname === link.href;
                const linkProps = link.external ? { target: "_blank", rel: "noopener noreferrer" } : {};
                return (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link 
                      href={link.href} 
                      {...linkProps}
                      onClick={() => !link.external && setIsMobileMenuOpen(false)}
                      className={`block w-full py-2 border-b-4 ${
                        isActive ? "text-brand-yellow border-brand-yellow" : "text-white border-transparent hover:text-brand-red hover:border-brand-red"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                );
              })}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: links.length * 0.05 }}
                className="mt-8"
              >
                <Link 
                  href="/partner" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full border-4 border-brand-dark bg-brand-red text-white font-bold px-8 py-4 shadow-brutal hover:bg-white hover:text-brand-dark transition-colors text-2xl uppercase"
                >
                  BECOME A PARTNER
                </Link>
              </motion.div>
            </nav>
            
            <div className="mt-auto relative z-10 pt-12 text-center">
              <span className="text-[10px] font-mono text-brand-yellow tracking-widest uppercase border-2 border-brand-yellow px-4 py-2 bg-brand-dark shadow-brutal-sm">
                SYS.NODE.01 :: FUTURE RADIO ACTIVE
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
