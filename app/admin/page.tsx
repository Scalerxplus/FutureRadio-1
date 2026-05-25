import { Activity, Clock, RadioTower, Users } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="p-8">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Future Radio Control Room</h2>
          <p className="text-gray-400">Autopilot is active. Monitoring global streams.</p>
        </div>
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-full">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-green-400 uppercase tracking-wide">Stream Healthy</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
          icon={<RadioTower className="text-blue-400" />}
          title="Active Show"
          value="Evening Rush"
          subtitle="RJ: AIRA (Auto-Pilot)"
        />
        <StatCard 
          icon={<Clock className="text-purple-400" />}
          title="Queue Status"
          value="24 Items"
          subtitle="Next generated at 18:00 IST"
        />
        <StatCard 
          icon={<Users className="text-orange-400" />}
          title="Global Listeners"
          value="1,204"
          subtitle="Across 3 nodes"
        />
        <StatCard 
          icon={<Activity className="text-red-400" />}
          title="LLM Health"
          value="99.9%"
          subtitle="Avg inference: 1.2s"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-[#111118] border border-[#1a1a24] rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Recent System Activity</h3>
          <div className="space-y-4">
            <ActivityRow time="Just now" action="System injected EDM Sweeper" type="info" />
            <ActivityRow time="12 mins ago" action="Master Clock generated 25 items for Evening Rush" type="success" />
            <ActivityRow time="1 hr ago" action="Azure TTS rendered RJ Voiceover (68 seconds)" type="info" />
            <ActivityRow time="2 hrs ago" action="Live Cut Overridden by Admin" type="warning" />
          </div>
        </div>
        
        <div className="bg-[#111118] border border-[#1a1a24] rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-xl transition-all">
              Initiate Live Cut 🎙️
            </button>
            <button className="bg-[#1a1a24] hover:bg-[#222230] text-gray-200 font-medium py-3 rounded-xl border border-gray-800 transition-all">
              Force Schedule Generation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle }: { icon: React.ReactNode, title: string, value: string, subtitle: string }) {
  return (
    <div className="bg-[#111118] border border-[#1a1a24] rounded-2xl p-6 flex flex-col justify-between">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-[#1a1a24] flex items-center justify-center">
          {icon}
        </div>
        <span className="text-gray-400 font-medium text-sm uppercase tracking-wider">{title}</span>
      </div>
      <div>
        <h4 className="text-2xl font-bold text-white mb-1">{value}</h4>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

function ActivityRow({ time, action, type }: { time: string, action: string, type: "info" | "success" | "warning" }) {
  const colors = {
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    success: "bg-green-500/10 text-green-400 border-green-500/20",
    warning: "bg-orange-500/10 text-orange-400 border-orange-500/20"
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-[#1a1a24] last:border-0">
      <div className="flex items-center gap-4">
        <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border ${colors[type]}`}>
          {type}
        </span>
        <p className="text-sm text-gray-300">{action}</p>
      </div>
      <span className="text-xs text-gray-600">{time}</span>
    </div>
  );
}
