import React, { useState } from "react";
import {
  CheckCircle2,
  Clock,
  User,
  Paperclip,
  Download,
  Check,
  X,
  AlertTriangle,
  PlayCircle,
  Upload,
  Sparkles,
  MessageSquare,
  PlusCircle,
  RotateCcw,
  Send,
  ShieldAlert
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { DropdownSelect } from "../ui/dropdown";
import AttachClipModal from "./AttachClipModal";
import { cn } from "../../utils";

export default function InternalTeamPanel({
  tasks = [],
  discussion = [],
  teamMembers = [],
  role = "Owner",
  currentUser = "Alex Rivera",
  currentTime = 0,
  onUpdateTaskStatus,
  onAttachInternalFile,
  onAddDiscussionMessage,
  onCreateTaskFromDiscussion,
  onOwnerOverrideTaskStatus
}) {
  const [internalTab, setInternalTab] = useState("tasks"); // "tasks" | "discussion"
  const [filterStatus, setFilterStatus] = useState("All");
  const [rejectingTaskId, setRejectingTaskId] = useState(null);
  const [rejectionNote, setRejectionNote] = useState("");

  // Discussion Input State
  const [newDiscText, setNewDiscText] = useState("");
  const [attachTimestamp, setAttachTimestamp] = useState(true);

  // Modal State for "Turn into Task" from Discussion
  const [taskModalMsg, setTaskModalMsg] = useState(null);
  const [taskInstruction, setTaskInstruction] = useState("");
  const [assignedEditor, setAssignedEditor] = useState("Marcus Vance");
  const [attachingTaskId, setAttachingTaskId] = useState(null);

  const formatTime = (secs) => {
    if (secs === null || secs === undefined) return null;
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const currentFormattedTime = formatTime(currentTime);

  const resolvedCount = tasks.filter((t) => t.status === "Resolved").length;
  const totalCount = tasks.length;

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus === "All") return true;
    return t.status === filterStatus;
  });

  const isOwner = role === "Owner";
  const isOwnerOrLead = role === "Owner" || role === "Lead";

  const handleConfirmReject = (taskId) => {
    onUpdateTaskStatus(taskId, "Reopened", rejectionNote || "Revision requested by Lead");
    setRejectingTaskId(null);
    setRejectionNote("");
  };

  const handleSubmitDiscussion = (e) => {
    e.preventDefault();
    if (!newDiscText.trim()) return;
    onAddDiscussionMessage(newDiscText.trim(), attachTimestamp ? currentTime : null);
    setNewDiscText("");
  };

  const handleOpenTaskModal = (msg) => {
    setTaskModalMsg(msg);
    setTaskInstruction(msg.text);
    setAssignedEditor("Marcus Vance");
  };

  const handleConfirmCreateTaskFromDiscussion = (e) => {
    e.preventDefault();
    if (!taskModalMsg || !taskInstruction.trim()) return;
    onCreateTaskFromDiscussion(taskModalMsg, taskInstruction.trim(), assignedEditor);
    setTaskModalMsg(null);
  };

  const editorOptions = teamMembers.map((m) => ({
    value: m.name,
    label: `${m.name} (${m.role})`,
    icon: User
  }));

  return (
    <div className="flex flex-col h-full justify-between select-none relative">
      
      {/* INTERNAL TEAM SUB-TABS */}
      <div className="space-y-3 pb-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-[#1A1B23] p-1 rounded-xl">
            <button
              onClick={() => setInternalTab("tasks")}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1",
                internalTab === "tasks"
                  ? "bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30"
                  : "text-slate-400 hover:text-white"
              )}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Task Checklist
            </button>
            <button
              onClick={() => setInternalTab("discussion")}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1",
                internalTab === "discussion"
                  ? "bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30"
                  : "text-slate-400 hover:text-white"
              )}
            >
              <MessageSquare className="w-3.5 h-3.5" /> Team Chat ({discussion.length})
            </button>
          </div>

          {internalTab === "tasks" && (
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-[#22C55E] border border-emerald-500/20">
              {resolvedCount}/{totalCount} Resolved
            </span>
          )}
        </div>

        {/* Filter Pills for Task Checklist */}
        {internalTab === "tasks" && (
          <div className="flex flex-wrap gap-1 text-[11px]">
            {["All", "Open", "In Progress", "Ready for Review", "Resolved"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={cn(
                  "px-2.5 py-1 rounded-lg font-medium transition-all",
                  filterStatus === st
                    ? "bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30 font-bold"
                    : "bg-[#1A1B23] text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                {st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SUB-TAB 1: TASK CHECKLIST */}
      {internalTab === "tasks" && (
        <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs italic">
              No internal tasks match the selected filter.
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isAssignedEditor = role === "Editor" && task.assignedEditor.includes(currentUser);
              const isDecided = task.status === "Resolved" || task.status === "Reopened";

              return (
                <div
                  key={task.id}
                  className="bg-[#12131A] border border-white/5 rounded-xl p-3.5 space-y-3 text-xs"
                >
                  {/* Header: Title & Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {task.formattedTime && (
                          <span className="font-mono text-[10px] text-emerald-400 font-bold bg-[#22C55E]/10 px-2 py-0.5 rounded border border-[#22C55E]/20">
                            {task.formattedTime}
                          </span>
                        )}
                        <h4 className="font-bold text-white text-xs">{task.title}</h4>
                      </div>
                      <p className="text-slate-400 text-xs mt-1 leading-relaxed">{task.instruction}</p>
                    </div>

                    <span
                      className={cn(
                        "text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0",
                        task.status === "Resolved"
                          ? "bg-emerald-500/10 text-[#22C55E] border-emerald-500/20"
                          : task.status === "Ready for Review"
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          : task.status === "In Progress"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : task.status === "Reopened"
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      )}
                    >
                      {task.status}
                    </span>
                  </div>

                  {/* Assignee Footer */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-[#22C55E]" /> Assignee: <strong className="text-slate-200">{task.assignedEditor}</strong>
                    </span>
                    {task.resolvedBy && (
                      <span className="text-[10px] font-mono text-emerald-400">
                        ✓ Approved by {task.resolvedBy}
                      </span>
                    )}
                  </div>

                  {/* Rejection Note Display */}
                  {task.rejectionNote && task.status === "Reopened" && (
                    <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Rejection Reason: {task.rejectionNote}</span>
                    </div>
                  )}

                  {/* Internal Draft Clip Attachments */}
                  {task.internalFiles && task.internalFiles.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Paperclip className="w-3 h-3 text-[#22C55E]" /> Internal Working Clips ({task.internalFiles.length}):
                      </span>
                      {task.internalFiles.map((file) => (
                        <div
                          key={file.id}
                          className="p-2 rounded-lg bg-[#1A1B23] border border-white/10 flex items-center justify-between text-[11px]"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <PlayCircle className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                            <span className="text-slate-200 truncate">{file.name}</span>
                            <span className="text-slate-500 font-mono text-[9px]">({file.size})</span>
                          </div>
                          <button
                            onClick={() => alert(`Downloading internal draft clip ${file.name}`)}
                            className="text-[#22C55E] hover:text-[#22C55E]/80 p-1 rounded hover:bg-white/5"
                            title="Download Internal Clip"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Editor Task Progress Actions */}
                  {isAssignedEditor && task.status !== "Resolved" && (
                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      {task.status !== "In Progress" && (
                        <Button
                          onClick={() => onUpdateTaskStatus(task.id, "In Progress")}
                          variant="outline"
                          className="h-7 text-[11px] border-amber-500/30 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
                        >
                          Start Task (In Progress)
                        </Button>
                      )}
                      <Button
                        onClick={() => onUpdateTaskStatus(task.id, "Ready for Review")}
                        className="h-7 text-[11px] bg-purple-500 text-white font-bold hover:bg-purple-600"
                      >
                        Mark Ready for Review
                      </Button>
                      <Button
                        onClick={() => setAttachingTaskId(task.id)}
                        variant="outline"
                        className="h-7 text-[11px] border-white/10 text-slate-300 bg-[#1A1B23] hover:text-white"
                      >
                        <Upload className="w-3 h-3 mr-1" /> Attach Clip
                      </Button>
                    </div>
                  )}

                  {/* Owner/Lead Approval Actions */}
                  {isOwnerOrLead && task.status === "Ready for Review" && (
                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <Button
                        onClick={() => onUpdateTaskStatus(task.id, "Resolved")}
                        className="h-7 text-[11px] bg-[#22C55E] text-[#090A0F] font-bold hover:bg-[#22C55E]/90"
                      >
                        <Check className="w-3 h-3 mr-1" /> Accept & Resolve
                      </Button>
                      <Button
                        onClick={() => setRejectingTaskId(task.id)}
                        variant="outline"
                        className="h-7 text-[11px] border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20"
                      >
                        <X className="w-3 h-3 mr-1" /> Reject Task
                      </Button>
                    </div>
                  )}

                  {/* OWNER EXCLUSIVE: DECISION OVERRIDE FOR RESOLVED/REOPENED TASKS */}
                  {isOwner && isDecided && (
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> Owner Override Available
                      </span>
                      <Button
                        onClick={() => {
                          const targetStatus = task.status === "Resolved" ? "Reopened" : "Resolved";
                          onOwnerOverrideTaskStatus(task.id, targetStatus);
                        }}
                        variant="outline"
                        className="h-6 text-[10px] border-amber-500/30 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 font-bold"
                      >
                        Override → Flip to {task.status === "Resolved" ? "Reopened" : "Resolved"}
                      </Button>
                    </div>
                  )}

                  {/* Inline Rejection Reason Form */}
                  {rejectingTaskId === task.id && (
                    <div className="pt-2 space-y-2 border-t border-white/5">
                      <Input
                        placeholder="Reason for rejection (e.g. gamma mismatch)..."
                        value={rejectionNote}
                        onChange={(e) => setRejectionNote(e.target.value)}
                        className="bg-[#1A1B23] text-xs h-8 border-red-500/50"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => setRejectingTaskId(null)}
                          variant="outline"
                          className="h-7 text-[10px] border-white/10 text-slate-300"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleConfirmReject(task.id)}
                          className="h-7 text-[10px] bg-red-500 text-white font-bold"
                        >
                          Confirm Rejection
                        </Button>
                      </div>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>
      )}

      {/* SUB-TAB 2: TEAM DISCUSSION FEED */}
      {internalTab === "discussion" && (
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          
          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
            {discussion.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs italic">
                No team discussion messages yet. Start the conversation!
              </div>
            ) : (
              discussion.map((msg) => (
                <div
                  key={msg.id}
                  className="p-3 rounded-xl bg-[#12131A] border border-white/5 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-[#22C55E] border border-emerald-500/30 flex items-center justify-center font-bold text-[10px]">
                        {msg.avatar || "TM"}
                      </div>
                      <span className="font-bold text-white">{msg.author}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({msg.role})</span>
                    </div>

                    {msg.formattedTime ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
                        ⏱️ {msg.formattedTime}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-white/5">
                        General Chat
                      </span>
                    )}
                  </div>

                  <p className="text-slate-300 leading-relaxed text-xs">{msg.text}</p>

                  {/* Owner/Lead Action: Turn into Task */}
                  {isOwnerOrLead && !msg.hasTaskCreated && (
                    <div className="pt-1 border-t border-white/5 flex justify-end">
                      <button
                        onClick={() => handleOpenTaskModal(msg)}
                        className="text-[#22C55E] hover:text-[#22C55E]/80 text-[11px] font-bold flex items-center gap-1"
                      >
                        <PlusCircle className="w-3 h-3" /> Turn into Task
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Discussion Input Box with Timestamp Toggle */}
          <form onSubmit={handleSubmitDiscussion} className="pt-3 border-t border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setAttachTimestamp(!attachTimestamp)}
                className={cn(
                  "px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all",
                  attachTimestamp
                    ? "bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30"
                    : "bg-[#1A1B23] text-slate-400 border-white/5 hover:text-white"
                )}
              >
                <Clock className="w-3 h-3" />
                {attachTimestamp ? `Attach timestamp (${currentFormattedTime}) [ON]` : "General Chat [OFF]"}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder={
                  attachTimestamp
                    ? `Post internal message at ${currentFormattedTime}...`
                    : "Post internal team message..."
                }
                value={newDiscText}
                onChange={(e) => setNewDiscText(e.target.value)}
                className="bg-[#1A1B23] border-white/10 text-xs h-10 focus:border-[#22C55E]"
              />
              <Button
                type="submit"
                disabled={!newDiscText.trim()}
                className="bg-[#22C55E] text-[#090A0F] font-bold text-xs h-10 px-4 hover:bg-[#22C55E]/90 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 mr-1" /> Send
              </Button>
            </div>
          </form>

        </div>
      )}

      {/* TURN INTO TASK MODAL FORM */}
      {taskModalMsg && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#12131A] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 relative">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-[#22C55E]" /> Turn Message into Task
              </h3>
              <button
                onClick={() => setTaskModalMsg(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmCreateTaskFromDiscussion} className="space-y-3 text-xs">
              <div className="space-y-1 text-left">
                <label className="font-medium text-slate-300">Task Instruction</label>
                <Input
                  required
                  value={taskInstruction}
                  onChange={(e) => setTaskInstruction(e.target.value)}
                  className="bg-[#1A1B23] border-white/10 text-xs focus:border-[#22C55E]"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="font-medium text-slate-300">Assign to Editor</label>
                <DropdownSelect
                  value={assignedEditor}
                  onChange={setAssignedEditor}
                  options={editorOptions}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-white/5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTaskModalMsg(null)}
                  className="text-xs border-white/10 bg-[#1A1B23] text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#22C55E] text-[#090A0F] font-bold text-xs px-4 hover:bg-[#22C55E]/90"
                >
                  Create Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ATTACH CLIP MODAL */}
      <AttachClipModal
        isOpen={Boolean(attachingTaskId)}
        onClose={() => setAttachingTaskId(null)}
        onUploadSuccess={(fname, size) => {
          if (attachingTaskId) onAttachInternalFile(attachingTaskId, fname, size);
          setAttachingTaskId(null);
        }}
      />

    </div>
  );
}
