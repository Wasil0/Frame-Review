import React from "react";
import {
  FolderKanban,
  MessageSquare,
  Lock,
  Unlock,
  ExternalLink,
  Layers,
  Calendar,
  CheckCircle2,
  Clock,
  User
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";

export default function ProjectProgressView({ projects, onViewAll }) {
  return (
    <Card className="bg-[#12131A] border-white/5 shadow-2xl relative overflow-hidden">
      <CardHeader className="p-6 pb-4 border-b border-white/5 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-[#22C55E]" /> My Active Project Progress View
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs mt-1">
            Track frame-accurate pins, milestone lock statuses, and version arrays.
          </CardDescription>
        </div>
        {onViewAll && (
          <Button onClick={onViewAll} variant="outline" className="text-xs border-white/10 bg-[#1A1B23] text-slate-300 hover:text-white hover:bg-white/5">
            View All ({projects.length})
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="p-5 rounded-2xl bg-[#1A1B23]/70 border border-white/5 hover:border-[#22C55E]/30 transition-all space-y-4 text-xs"
          >
            {/* Top Info Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-white">{project.title}</h4>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/5">
                    {project.currentVersion}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-2">
                  <span>Client: <strong className="text-slate-200">{project.client}</strong></span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><User className="w-3 h-3 text-[#22C55E]" /> Lead: {project.assignedLead}</span>
                </p>
              </div>

              {/* Milestone Status Pill */}
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[10px] font-bold px-3 py-1 rounded-full border font-mono flex items-center gap-1.5 ${
                    project.isPaid
                      ? "bg-emerald-500/10 text-[#22C55E] border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}
                >
                  {project.isPaid ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  {project.status} (${project.milestoneAmount.toLocaleString()})
                </span>
              </div>
            </div>

            {/* Progress Metrics & Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#22C55E]" /> Pipeline Progress
                </span>
                <span className="font-bold text-white font-mono">{project.progressPercent}% Completed</span>
              </div>
              <div className="w-full bg-[#090A0F] h-2 rounded-full overflow-hidden border border-white/5">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-[#22C55E] h-full rounded-full transition-all duration-500"
                  style={{ width: `${project.progressPercent}%` }}
                />
              </div>
            </div>

            {/* Bottom Controls & Pins Counter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-white/5">
              <div className="flex items-center gap-4 text-slate-300">
                <span className="flex items-center gap-1.5 text-xs">
                  <MessageSquare className="w-3.5 h-3.5 text-[#22C55E]" />
                  <strong className="text-white">{project.resolvedPins} / {project.totalPins}</strong> Pins Resolved
                </span>
                <span className="text-slate-500">•</span>
                <span className="flex items-center gap-1 text-slate-400 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" /> Due: {project.dueDate}
                </span>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={`#workspace/${project.id}`}
                  className="flex-1 sm:flex-initial"
                >
                  <Button size="sm" className="w-full bg-[#22C55E] text-[#090A0F] hover:bg-[#22C55E]/90 font-bold text-xs h-8 px-3">
                    Open Workspace <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </a>
              </div>
            </div>

          </div>
        ))}
      </CardContent>
    </Card>
  );
}
