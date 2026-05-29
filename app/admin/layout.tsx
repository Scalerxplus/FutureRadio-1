import Link from "next/link";
import { 
  LayoutDashboard, 
  ListMusic, 
  Mic2, 
  Settings, 
  LogOut,
  UploadCloud
} from "lucide-react";

import AdminAudioMonitor from "@/components/admin/AdminAudioMonitor";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#0a0a0f] text-white overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#1a1a24] bg-[#0d0d14] flex flex-col justify-between">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center animate-pulse">
              <Mic2 size={16} className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-wider text-gray-100 uppercase">
              Admin <span className="text-red-500">HITL</span>
            </h1>
          </div>

          <nav className="space-y-2">
            <Link 
              href="/admin" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#1a1a24] text-gray-400 hover:text-white transition-all"
            >
              <LayoutDashboard size={18} />
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            <Link 
              href="/admin/schedule" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#1a1a24] text-gray-400 hover:text-white transition-all"
            >
              <ListMusic size={18} />
              <span className="text-sm font-medium">Master Clock</span>
            </Link>
            <Link 
              href="/admin/assets" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#1a1a24] text-gray-400 hover:text-white transition-all"
            >
              <UploadCloud size={18} />
              <span className="text-sm font-medium">Asset Manager</span>
            </Link>
            <Link 
              href="/admin/settings" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#1a1a24] text-gray-400 hover:text-white transition-all"
            >
              <Settings size={18} />
              <span className="text-sm font-medium">Settings</span>
            </Link>
          </nav>
        </div>

        <div className="p-6 border-t border-[#1a1a24] space-y-3">
          <AdminAudioMonitor />
          
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-900/30 text-gray-400 hover:text-red-400 transition-all">
            <LogOut size={18} />
            <span className="text-sm font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#0a0a0f] to-[#12121c]">
        {children}
      </main>
    </div>
  );
}
