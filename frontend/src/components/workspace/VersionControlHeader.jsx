import React, { useState } from "react";
import { ArrowLeft, Upload, ShieldCheck, Sparkles, User, UserCheck, X, Film } from "lucide-react";
import { Button } from "../ui/button";
import { DropdownSelect } from "../ui/dropdown";

export default function VersionControlHeader({
  project,
  role = "Owner",
  currentVersion = "V1",
  allTasksResolved = false,
  onVersionSelect,
  onPushNewVersion,
  onOpenApproveModal,
  onBackToDashboard,
  onReassignLead
}) {
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(project.assignedLead || "Alex Rivera");

  const isOwner = role === "Owner";
  const isOwnerOrLead = role === "Owner" || role === "Lead";
  const isClient = role === "Client";

  const versionOptions = (project.versions || []).map((v) => ({
    value: v.version,
    label: `${v.version} ${v.isCurrent ? "(Active)" : "(Archived)"}`,
    icon: Sparkles
  }));

  const leadOptions = (project.teamMembers || []).map((m) => ({
    value: m.name,
    label: `${m.name} (${m.role})`,
    icon: User
  }));

  const handleConfirmReassign = (e) => {
    e.preventDefault();
    if (onReassignLead) onReassignLead(selectedLead);
    setIsReassignModalOpen(false);
  };

  return (
    <header className="h-15 bg-[#0B0C12] px-5 flex items-center justify-between gap-4 shrink-0 border-b border-white/5 select-none relative z-20">
      
      {/* LEFT: BACK BUTTON, FILM ICON, COMPACT GRADIENT TITLE & STATUS PILL */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onBackToDashboard}
          className="px-2.5 py-1 rounded-lg bg-[#12131A] border border-white/5 hover:border-white/15 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold shrink-0"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#22C55E]" />
          <span className="hidden sm:inline">Dashboard</span>
        </button>

        <div className="h-4 w-px bg-white/10 shrink-0 hidden sm:block" />

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-md bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center shrink-0">
            <Film className="w-5 h-5 text-[#22C55E]" />
          </div>

          <h1 className="text-[clamp(1rem,1.5vw,1.35rem)] font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-[#22C55E] bg-clip-text text-transparent truncate max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-xl">
            {project.title}
          </h1>

          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-[#22C55E] border border-emerald-500/20 shrink-0">
            {project.status}
          </span>
        </div>
      </div>

      {/* RIGHT: TIGHTENED VERSION SELECTOR & ACTION BUTTONS */}
      <div className="flex items-center gap-2.5 shrink-0">
        
        {/* Compact Version Selector */}
        <div className="w-32">
          <DropdownSelect
            value={currentVersion}
            onChange={onVersionSelect}
            options={versionOptions}
          />
        </div>

        {/* OWNER / LEAD ACTION: PUSH NEW VERSION */}
        {isOwnerOrLead && (
          <Button
            onClick={onPushNewVersion}
            disabled={!allTasksResolved}
            title={
              allTasksResolved
                ? "Push new master cut to client review portal"
                : "Resolve all internal tasks before pushing new version"
            }
            className="bg-[#22C55E] text-[#090A0F] font-bold text-xs h-8 px-3 hover:bg-[#22C55E]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 rounded-lg"
          >
            <Upload className="w-3.5 h-3.5 stroke-[3]" /> Push New Version
          </Button>
        )}

        {/* CLIENT ROLE ACTION: APPROVE PROJECT */}
        {isClient && (
          <Button
            onClick={onOpenApproveModal}
            className="bg-[#22C55E] text-[#090A0F] font-bold text-xs h-8 px-3 hover:bg-[#22C55E]/90 flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 rounded-lg"
          >
            <ShieldCheck className="w-3.5 h-3.5 stroke-[3]" /> Approve Project
          </Button>
        )}

      </div>

      {/* REASSIGN LEAD MODAL FOR OWNER */}
      {isReassignModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100000] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#12131A] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#22C55E]" /> Reassign Project Lead
              </h3>
              <button
                onClick={() => setIsReassignModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReassign} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Select New Lead</label>
                <DropdownSelect
                  value={selectedLead}
                  onChange={setSelectedLead}
                  options={leadOptions}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-white/5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsReassignModalOpen(false)}
                  className="text-xs border-white/10 bg-[#1A1B23] text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#22C55E] text-[#090A0F] font-bold text-xs px-4 hover:bg-[#22C55E]/90"
                >
                  Confirm Reassign
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </header>
  );
}
