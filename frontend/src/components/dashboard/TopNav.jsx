import React, { useState, useRef, useEffect } from "react";
import { Search, Bell, Plus, Clock, FolderKanban, Users, ExternalLink, CheckCheck } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useDashboard } from "../../context/DashboardContext";

export default function TopNav({ onNewProjectClick, setActiveTab }) {
  const { projects, teamMembers, notifications, markNotificationRead, markAllNotificationsRead } =
    useDashboard();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const searchRef = useRef(null);

  // Close search results dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search filter across projects and team members
  const query = searchQuery.trim().toLowerCase();
  const matchingProjects = query
    ? projects.filter(
        (p) =>
          p.title?.toLowerCase().includes(query) ||
          p.client?.toLowerCase().includes(query) ||
          p.clientEmail?.toLowerCase().includes(query)
      )
    : [];

  const matchingTeam = query
    ? teamMembers.filter(
        (t) =>
          t.name?.toLowerCase().includes(query) ||
          t.email?.toLowerCase().includes(query) ||
          t.role?.toLowerCase().includes(query)
      )
    : [];

  const hasSearchMatches = matchingProjects.length > 0 || matchingTeam.length > 0;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSelectProjectResult = (projectId) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    window.location.hash = `#workspace/${projectId}`;
  };

  const handleSelectTeamResult = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
    if (setActiveTab) {
      setActiveTab("team");
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      await markNotificationRead(notif.id || notif._id);
    }
    if (notif.link) {
      window.location.hash = notif.link;
    }
    setShowNotifications(false);
  };

  return (
    <header className="h-16 bg-[#0B0C12] border-b border-white/5 px-6 flex items-center justify-between gap-4 relative z-20 shrink-0 select-none">
      
      {/* Global Top Search Bar */}
      <div ref={searchRef} className="flex-1 max-w-md relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          type="text"
          placeholder="Search active projects, clients, or team members..."
          value={searchQuery}
          onFocus={() => setIsSearchOpen(true)}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsSearchOpen(true);
          }}
          className="h-10 text-xs bg-[#12131A] border-white/10 pl-9 pr-4 focus:border-[#22C55E] w-full rounded-xl"
        />

        {/* Global Search Filter Dropdown */}
        {isSearchOpen && query.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-[#1A1B23] border border-white/10 rounded-2xl shadow-2xl p-3 z-50 text-xs space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 max-h-80 overflow-y-auto">
            {!hasSearchMatches ? (
              <p className="text-slate-400 p-3 text-center text-xs">No matching projects or team members found.</p>
            ) : (
              <>
                {/* 1. Projects Section */}
                {matchingProjects.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider px-2 flex items-center gap-1.5">
                      <FolderKanban className="w-3 h-3 text-[#22C55E]" /> Active Projects ({matchingProjects.length})
                    </span>
                    <div className="space-y-1">
                      {matchingProjects.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleSelectProjectResult(p.id)}
                          className="w-full text-left p-2 rounded-xl bg-[#12131A] border border-white/5 hover:border-[#22C55E]/30 transition-all flex items-center justify-between group"
                        >
                          <div>
                            <p className="font-bold text-white group-hover:text-[#22C55E] transition-colors">{p.title}</p>
                            <p className="text-[10px] text-slate-400">Client: {p.client}</p>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#22C55E] transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Team Members Section */}
                {matchingTeam.length > 0 && (
                  <div className="space-y-1.5 pt-1 border-t border-white/5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider px-2 flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-blue-400" /> Team Members ({matchingTeam.length})
                    </span>
                    <div className="space-y-1">
                      {matchingTeam.map((t) => (
                        <button
                          key={t.id}
                          onClick={handleSelectTeamResult}
                          className="w-full text-left p-2 rounded-xl bg-[#12131A] border border-white/5 hover:border-blue-500/30 transition-all flex items-center justify-between group"
                        >
                          <div>
                            <p className="font-bold text-white group-hover:text-blue-400 transition-colors">{t.name}</p>
                            <p className="text-[10px] text-slate-400">{t.role} • {t.email}</p>
                          </div>
                          <Users className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Right Toolbar Actions */}
      <div className="flex items-center gap-3">
        
        {/* Notifications Dropdown Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl bg-[#12131A] border border-white/5 hover:border-white/15 text-slate-300 hover:text-white transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#22C55E] absolute top-2 right-2 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#1A1B23] border border-white/10 rounded-2xl shadow-2xl p-4 z-50 text-xs space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-[#22C55E]" /> Notifications
                </span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[10px] text-slate-400 hover:text-[#22C55E] flex items-center gap-1 transition-colors"
                      title="Mark all as read"
                    >
                      <CheckCheck className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                  <span className="text-[10px] text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded-full font-bold font-mono">
                    {unreadCount} New
                  </span>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <p className="text-slate-400 p-4 text-center text-xs">No notifications yet.</p>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id || n._id}
                      onClick={() => handleNotificationClick(n)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-colors space-y-1 ${
                        !n.read
                          ? "bg-[#12131A] border-[#22C55E]/30 hover:border-[#22C55E]"
                          : "bg-[#12131A]/50 border-white/5 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-white text-[11px] flex items-center gap-1.5">
                          {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shrink-0" />}
                          {n.type?.replace("_", " ").toUpperCase() || "UPDATE"}
                        </p>
                        <span className="text-[9px] text-slate-500 font-mono flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 leading-snug">{n.message}</p>
                    </button>
                  ))
                )}
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
