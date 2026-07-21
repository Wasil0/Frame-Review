// TEMP: dev-only testing panel — remove before production build
import React, { useState } from "react";
import { Wrench, ChevronDown, ChevronUp, User, CreditCard, CheckSquare, RefreshCw } from "lucide-react";
import { DropdownSelect } from "../ui/dropdown";
import { Button } from "../ui/button";

const roleOptions = [
  { value: "Owner", label: "Agency Owner", icon: User },
  { value: "Lead", label: "Project Lead (Alex R.)", icon: User },
  { value: "Editor", label: "Assigned Editor (Marcus V.)", icon: User },
  { value: "Client", label: "Client (David V.)", icon: User }
];

export default function DevControlsPanel({
  role = "Owner",
  advancePaid = true,
  milestonePaid = false,
  onRoleChange,
  onToggleAdvancePaid,
  onToggleMilestonePaid,
  onBulkSetTasksResolved,
  onResetTasks
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="fixed bottom-4 left-4 z-[10000] select-none">
      <div className="border-2 border-dashed border-amber-500/50 bg-[#12131A]/95 backdrop-blur-md p-3.5 rounded-2xl shadow-2xl space-y-3 w-72 text-xs">
        
        {/* DEV PANEL HEADER */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between cursor-pointer border-b border-amber-500/20 pb-2"
        >
          <span className="font-mono font-bold text-amber-400 text-[11px] flex items-center gap-1.5 uppercase tracking-wider">
            <Wrench className="w-3.5 h-3.5" /> DEV CONTROLS (TESTING)
          </span>
          <button className="text-slate-400 hover:text-white p-0.5">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {isExpanded && (
          <div className="space-y-3 pt-1 animate-in fade-in duration-150">
            
            {/* 1. ROLE SWITCHER */}
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Active Role</label>
              <DropdownSelect
                value={role}
                onChange={onRoleChange}
                options={roleOptions}
              />
            </div>

            {/* 2. PAYMENT GATE TOGGLES */}
            <div className="space-y-2 pt-1 border-t border-white/5">
              <label className="flex items-center justify-between text-[11px] text-slate-300 cursor-pointer">
                <span>Advance Paid ($2,500)</span>
                <input
                  type="checkbox"
                  checked={advancePaid}
                  onChange={(e) => onToggleAdvancePaid(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#22C55E]"
                />
              </label>

              <label className="flex items-center justify-between text-[11px] text-slate-300 cursor-pointer">
                <span>Milestone Paid ($6,500)</span>
                <input
                  type="checkbox"
                  checked={milestonePaid}
                  onChange={(e) => onToggleMilestonePaid(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#22C55E]"
                />
              </label>
            </div>

            {/* 3. TASK BULK QUICK-SET */}
            <div className="pt-2 border-t border-white/5 flex gap-2">
              <Button
                onClick={onBulkSetTasksResolved}
                variant="outline"
                className="flex-1 h-7 text-[10px] border-emerald-500/30 text-[#22C55E] bg-emerald-500/10 hover:bg-emerald-500/20 font-bold"
              >
                <CheckSquare className="w-3 h-3 mr-1" /> Resolve All Tasks
              </Button>
              <Button
                onClick={onResetTasks}
                variant="outline"
                className="h-7 text-[10px] border-white/10 text-slate-400 hover:text-white"
                title="Reset tasks to initial state"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
