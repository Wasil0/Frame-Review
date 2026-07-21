import React, { useState } from "react";
import {
  Film,
  LayoutDashboard,
  FolderKanban,
  Users,
  DollarSign,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
  Building2
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function Sidebar({ activeTab, setActiveTab, session }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.hash = "#auth-signin";
  };

  const userEmail = session?.user?.email || "";
  const userFullName = session?.user?.user_metadata?.full_name || (userEmail ? userEmail.split("@")[0] : "Wasil (Agency Owner)");
  const avatarLetter = (userFullName[0] || "W").toUpperCase();

  const currentUser = {
    name: userFullName,
    agency: "Apex Motion Studios",
    avatar: avatarLetter,
    role: "Owner"
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "projects", label: "Active Projects", icon: FolderKanban, badge: "14" },
    { id: "team", label: "Team Allocation", icon: Users, badge: "5" },
    { id: "revenue", label: "Financials & Revenue", icon: DollarSign, badge: "$18.4k" },
    { id: "history", label: "Project History", icon: History },
    { id: "settings", label: "Agency Settings", icon: Settings }
  ];

  return (
    <aside
      className={`bg-[#0B0C12] border-r border-white/5 flex flex-col justify-between transition-all duration-300 ease-in-out relative z-30 shrink-0 select-none ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Edge-Anchored Collapse / Expand Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-5 w-6 h-6 rounded-full bg-[#1A1B23] border border-white/10 text-slate-400 hover:text-white flex items-center justify-center shadow-lg shadow-black/50 cursor-pointer z-50 transition-all hover:scale-110 hover:border-[#22C55E]/40"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Top Brand Header */}
      <div className={`p-4 border-b border-white/5 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
        <a href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-[#22C55E] flex items-center justify-center text-[#090A0F] font-bold shadow-lg shadow-emerald-500/20 shrink-0">
            <Film className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate animate-in fade-in duration-200">
              <span className="font-extrabold text-lg tracking-tight text-white leading-none">
                Frame<span className="text-[#22C55E]">Review</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold font-mono mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Owner Workspace
              </span>
            </div>
          )}
        </a>
      </div>

      {/* Navigation Links List */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center text-xs font-semibold transition-all group relative ${
                isCollapsed
                  ? "w-11 h-11 mx-auto justify-center rounded-xl"
                  : "w-full gap-3 px-3.5 py-3 rounded-xl"
              } ${
                isActive
                  ? "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-[#22C55E]" : "group-hover:text-white"}`} />
              
              {!isCollapsed && (
                <span className="flex-1 text-left truncate animate-in fade-in duration-200">{item.label}</span>
              )}

              {!isCollapsed && item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                    isActive
                      ? "bg-[#22C55E] text-[#090A0F]"
                      : "bg-white/5 text-slate-400 border border-white/5"
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Tooltip on Collapsed Mode */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1A1B23] text-white text-xs font-semibold rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50 border border-white/10 flex items-center gap-2">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] bg-[#22C55E] text-[#090A0F] font-bold px-1.5 py-0.2 rounded-full font-mono">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom User Profile Section */}
      <div className="p-3 border-t border-white/5 bg-[#090A0F]/50">
        <div
          className={`flex items-center rounded-xl bg-[#12131A] border border-white/5 group relative ${
            isCollapsed ? "p-2 justify-center" : "p-2.5 gap-3"
          }`}
        >
          {/* Circular Avatar with Corner Status Dot */}
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-bold text-slate-950 text-xs shadow-md">
              {currentUser.avatar}
            </div>
            {/* Anchored Online Indicator Badge */}
            <span className="w-2.5 h-2.5 bg-[#22C55E] rounded-full border-2 border-[#12131A] absolute bottom-0 right-0 shadow-sm" />
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0 animate-in fade-in duration-200">
              <p className="text-xs font-bold text-white truncate leading-none">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 truncate mt-1 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-[#22C55E]" /> {currentUser.agency}
              </p>
            </div>
          )}

          {!isCollapsed && (
            <button
              type="button"
              onClick={handleSignOut}
              className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

          {/* User Profile Tooltip on Collapsed Mode */}
          {isCollapsed && (
            <div className="absolute left-full ml-3 px-3 py-2 bg-[#1A1B23] text-white text-xs font-semibold rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 border border-white/10 space-y-1">
              <p className="font-bold text-white">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 font-normal">{currentUser.agency}</p>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full text-left pt-1 border-t border-white/10 text-[10px] text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3 h-3" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
