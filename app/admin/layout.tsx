"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ListMusic, 
  Mic2, 
  Settings, 
  LogOut,
  UploadCloud,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import AdminAudioMonitor from "@/components/admin/AdminAudioMonitor";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Hide sidebar on the login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-white overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={`${isCollapsed ? "w-20" : "w-64"} transition-all duration-300 border-r border-[#1a1a24] bg-[#0d0d14] flex flex-col justify-between relative`}>
        {/* Collapse Toggle */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-[#1a1a24] border border-[#2a2a35] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#2a2a35] z-50 shadow-lg"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className="p-6 overflow-hidden">
          <div className={`flex items-center gap-3 mb-10 ${isCollapsed ? "justify-center" : ""}`}>
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center animate-pulse shrink-0">
              <Mic2 size={16} className="text-white" />
            </div>
            {!isCollapsed && (
              <h1 className="text-xl font-bold tracking-wider text-gray-100 uppercase whitespace-nowrap">
                Admin <span className="text-red-500">HITL</span>
              </h1>
            )}
          </div>

          <nav className="space-y-2">
            <Link 
              href="/admin" 
              className={`flex items-center gap-3 py-3 rounded-xl hover:bg-[#1a1a24] text-gray-400 hover:text-white transition-all ${isCollapsed ? "justify-center px-0" : "px-4"}`}
              title="Dashboard"
            >
              <LayoutDashboard size={18} className="shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">Dashboard</span>}
            </Link>
            <Link 
              href="/admin/schedule" 
              className={`flex items-center gap-3 py-3 rounded-xl hover:bg-[#1a1a24] text-gray-400 hover:text-white transition-all ${isCollapsed ? "justify-center px-0" : "px-4"}`}
              title="Master Clock"
            >
              <ListMusic size={18} className="shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">Master Clock</span>}
            </Link>
            <Link 
              href="/admin/assets" 
              className={`flex items-center gap-3 py-3 rounded-xl hover:bg-[#1a1a24] text-gray-400 hover:text-white transition-all ${isCollapsed ? "justify-center px-0" : "px-4"}`}
              title="Asset Manager"
            >
              <UploadCloud size={18} className="shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">Asset Manager</span>}
            </Link>
            <Link 
              href="/admin/settings" 
              className={`flex items-center gap-3 py-3 rounded-xl hover:bg-[#1a1a24] text-gray-400 hover:text-white transition-all ${isCollapsed ? "justify-center px-0" : "px-4"}`}
              title="Settings"
            >
              <Settings size={18} className="shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">Settings</span>}
            </Link>
          </nav>
        </div>

        <div className={`p-6 border-t border-[#1a1a24] space-y-3 overflow-hidden ${isCollapsed ? "px-2 text-center" : ""}`}>
          <AdminAudioMonitor isCollapsed={isCollapsed} />
          
          <button className={`flex items-center gap-3 py-3 w-full rounded-xl hover:bg-red-900/30 text-gray-400 hover:text-red-400 transition-all ${isCollapsed ? "justify-center px-0" : "px-4"}`} title="Log Out">
            <LogOut size={18} className="shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden bg-gradient-to-br from-[#0a0a0f] to-[#12121c]">
        {children}
      </main>
    </div>
  );
}
