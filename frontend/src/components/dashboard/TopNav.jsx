import React, { useState } from "react";
import {
  Search,
  Bell,
  Plus,
  Building2,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dropdown } from "../ui/dropdown";

const agencyOptions = [
  { value: "Apex Motion Studios", label: "Apex Motion Studios", icon: Building2 },
  { value: "Vanguard Client Portal", label: "Vanguard Client Portal", icon: Building2 }
];

export default function TopNav({ onNewProjectClick }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentAgency, setCurrentAgency] = useState("Apex Motion Studios");

  // TODO: replace with API call - Unread notification alerts
  const notifications = [
    {
      id: "n1",
      title: "Payment Received",
      msg: "Aether Energy settled Milestone 3 invoice ($12,000)",
      time: "10 mins ago",
      read: false
    },
    {
      id: "n2",
      title: "New Pins Added",
      msg: "Sarah J. added 4 frame comments on Vanguard Promo V3",
      time: "1 hour ago",
      read: false
    },
    {
      id: "n3",
      title: "Version Uploaded",
      msg: "Alex R. uploaded Nova Tech Campaign V2",
      time: "3 hours ago",
      read: false
    }
  ];

  return (
    <header className="h-16 bg-[#0B0C12] border-b border-white/5 px-6 flex items-center justify-between gap-4 relative z-20 shrink-0 select-none">
      
      {/* Search Input Bar */}
      <div className="flex-1 max-w-md relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          type="text"
          placeholder="Search active projects, clients, or team members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 text-xs bg-[#12131A] border-white/10 pl-9 pr-4 focus:border-[#22C55E] w-full rounded-xl"
        />
      </div>

      {/* Right Toolbar Actions */}
      <div className="flex items-center gap-3">
        
        {/* Agency Workspace Switcher (Using Reusable Dropdown) */}
        <Dropdown
          value={currentAgency}
          onChange={setCurrentAgency}
          items={agencyOptions}
          align="right"
          width="w-56"
          trigger={
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#12131A] border border-white/5 hover:border-white/15 text-xs font-semibold text-slate-200 transition-all">
              <Building2 className="w-3.5 h-3.5 text-[#22C55E]" />
              <span className="hidden md:inline">{currentAgency}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          }
        />

        {/* Notifications Dropdown Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl bg-[#12131A] border border-white/5 hover:border-white/15 text-slate-300 hover:text-white transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-[#22C55E] absolute top-2 right-2 animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#1A1B23] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 text-xs space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-[#22C55E]" /> Notifications
                </span>
                <span className="text-[10px] text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded-full font-bold">
                  3 New
                </span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-[#12131A] border border-white/5 hover:border-[#22C55E]/20 transition-colors space-y-1">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-white text-[11px]">{n.title}</p>
                      <span className="text-[9px] text-slate-500 font-mono flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" /> {n.time}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-snug">{n.msg}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* New Project Primary CTA */}
        <Button
          onClick={onNewProjectClick}
          className="bg-[#22C55E] text-[#090A0F] hover:bg-[#22C55E]/90 font-bold text-xs px-4 h-10 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span className="hidden sm:inline">New Project</span>
        </Button>

      </div>
    </header>
  );
}
