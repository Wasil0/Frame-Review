import React from "react";
import {
  FolderKanban,
  UserCheck,
  DollarSign,
  TrendingUp,
  Clock,
  Lock
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { useDashboard } from "../../context/DashboardContext";

export default function StatCards() {
  const { stats, loading } = useDashboard();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-[#12131A] border-white/5 p-5 space-y-4 animate-pulse">
            <div className="h-4 bg-white/5 rounded w-1/2" />
            <div className="h-8 bg-white/10 rounded w-1/3" />
            <div className="h-3 bg-white/5 rounded w-2/3" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      
      {/* 1. TOTAL ACTIVE PROJECTS */}
      <Card className="bg-[#12131A] border-white/5 hover:border-[#22C55E]/30 transition-all duration-300 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#22C55E]/5 blur-2xl group-hover:bg-[#22C55E]/10 transition-colors" />
        <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Active Projects
          </CardTitle>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-[#22C55E]">
            <FolderKanban className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {stats.totalActiveProjects}
            </span>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> {stats.totalActiveProjectsGrowth}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Company-wide across all team leads</p>
        </CardContent>
      </Card>

      {/* 2. MY ASSIGNMENTS */}
      <Card className="bg-[#12131A] border-white/5 hover:border-[#22C55E]/30 transition-all duration-300 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#22C55E]/5 blur-2xl group-hover:bg-[#22C55E]/10 transition-colors" />
        <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            My Assignments
          </CardTitle>
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <UserCheck className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {stats.myAssignments}
            </span>
            <span className="text-[11px] font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full border border-blue-400/20 flex items-center gap-0.5">
              <Clock className="w-3 h-3" /> {stats.myAssignmentsPendingReview} Pending Review
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Directly assigned to your owner account</p>
        </CardContent>
      </Card>

      {/* 3. PENDING REVENUE */}
      <Card className="bg-[#12131A] border-white/5 hover:border-[#22C55E]/30 transition-all duration-300 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-2xl group-hover:bg-amber-500/10 transition-colors" />
        <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Pending Revenue
          </CardTitle>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Lock className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-tight font-mono">
              ${(stats.pendingRevenue || 0).toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
              {stats.pendingInvoicesCount} Invoices
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Unpaid / partial milestone locks</p>
        </CardContent>
      </Card>

      {/* 4. CURRENT MONTH REVENUE */}
      <Card className="bg-[#12131A] border-white/5 hover:border-[#22C55E]/30 transition-all duration-300 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#22C55E]/5 blur-2xl group-hover:bg-[#22C55E]/10 transition-colors" />
        <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Current Month Revenue
          </CardTitle>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-[#22C55E]">
            <DollarSign className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#22C55E] tracking-tight font-mono">
              ${(stats.currentMonthRevenue || 0).toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded-full border border-[#22C55E]/20">
              {stats.targetProgressPercent}% Target
            </span>
          </div>
          
          {/* Target Progress Bar */}
          <div className="w-full bg-[#1A1B23] h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-[#22C55E] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(stats.targetProgressPercent, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
