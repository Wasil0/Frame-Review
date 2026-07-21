import React, { useState } from "react";
import { MessageSquare, Clock, Send, CornerDownRight, PlusCircle, CheckCircle2, User, Eye, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { DropdownSelect } from "../ui/dropdown";
import { cn } from "../../utils";

export default function ClientReviewPanel({
  comments = [],
  role = "Owner",
  currentTime = 0,
  teamMembers = [],
  selectedCommentId,
  onSelectComment,
  onAddComment,
  onAddReply,
  onCreateTaskFromComment,
  onViewTask
}) {
  const [newCommentText, setNewCommentText] = useState("");
  const [attachTimestamp, setAttachTimestamp] = useState(true);
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState("");

  // Modal State for Task Creation
  const [taskModalComment, setTaskModalComment] = useState(null);
  const [taskInstruction, setTaskInstruction] = useState("");
  const [assignedEditor, setAssignedEditor] = useState("Marcus Vance");

  const formatTime = (secs) => {
    if (secs === null || secs === undefined) return null;
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const currentFormattedTime = formatTime(currentTime);

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    onAddComment(newCommentText.trim(), attachTimestamp ? currentTime : null);
    setNewCommentText("");
  };

  const handleSubmitReply = (commentId) => {
    if (!replyText.trim()) return;
    onAddReply(commentId, replyText.trim());
    setReplyText("");
    setActiveReplyId(null);
  };

  const handleOpenTaskModal = (comment) => {
    setTaskModalComment(comment);
    setTaskInstruction(comment.text);
    setAssignedEditor("Marcus Vance");
  };

  const handleConfirmCreateTask = (e) => {
    e.preventDefault();
    if (!taskModalComment || !taskInstruction.trim()) return;
    onCreateTaskFromComment(taskModalComment, taskInstruction.trim(), assignedEditor);
    setTaskModalComment(null);
  };

  const isOwnerOrLead = role === "Owner" || role === "Lead";

  const editorOptions = teamMembers.map((m) => ({
    value: m.name,
    label: `${m.name} (${m.role})`,
    icon: User
  }));

  return (
    <div className="flex flex-col h-full justify-between select-none relative">
      
      {/* COMMENTS LIST FEED */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {comments.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs italic">
            No client feedback comments yet for this version.
          </div>
        ) : (
          comments.map((comment) => {
            const isSelected = selectedCommentId === comment.id;

            return (
              <div
                key={comment.id}
                onClick={() => onSelectComment(comment.id, comment.timestamp)}
                className={cn(
                  "p-3.5 rounded-xl border transition-all text-xs space-y-2.5 cursor-pointer",
                  isSelected
                    ? "bg-[#1A1B23] border-[#22C55E] shadow-lg shadow-emerald-500/10"
                    : "bg-[#12131A] border-white/5 hover:border-white/15"
                )}
              >
                {/* Header: Author & Timestamp Badge (or General tag) */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-[#22C55E] border border-emerald-500/30 flex items-center justify-center font-bold text-[10px]">
                      {comment.avatar || "U"}
                    </div>
                    <span className="font-bold text-white">{comment.author}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({comment.role})</span>
                  </div>

                  {comment.formattedTime ? (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {comment.formattedTime}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-white/5">
                      General Message
                    </span>
                  )}
                </div>

                {/* Comment Body */}
                <p className="text-slate-300 leading-relaxed text-xs">{comment.text}</p>

                {/* Owner/Lead Actions: Reply, Create Task, View Task */}
                {isOwnerOrLead && (
                  <div className="flex items-center gap-3 pt-1 border-t border-white/5 text-[11px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveReplyId(activeReplyId === comment.id ? null : comment.id);
                      }}
                      className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors font-medium"
                    >
                      <CornerDownRight className="w-3 h-3 text-[#22C55E]" /> Reply
                    </button>

                    {comment.isActionable && !comment.hasTaskCreated && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenTaskModal(comment);
                        }}
                        className="text-[#22C55E] hover:text-[#22C55E]/80 flex items-center gap-1 transition-colors font-bold"
                      >
                        <PlusCircle className="w-3.5 h-3.5" /> Create Task
                      </button>
                    )}

                    {comment.hasTaskCreated && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onViewTask) onViewTask(comment.taskId);
                        }}
                        className="text-emerald-400 hover:underline flex items-center gap-1 font-mono font-bold text-[10px]"
                      >
                        <Eye className="w-3 h-3" /> View Task
                      </button>
                    )}
                  </div>
                )}

                {/* Inline Reply Input Box */}
                {activeReplyId === comment.id && (
                  <div className="pt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Input
                      type="text"
                      placeholder="Type reply to client..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="bg-[#1A1B23] border-white/10 text-xs h-8"
                    />
                    <Button
                      onClick={() => handleSubmitReply(comment.id)}
                      className="bg-[#22C55E] text-[#090A0F] font-bold text-xs h-8 px-3 hover:bg-[#22C55E]/90"
                    >
                      Send
                    </Button>
                  </div>
                )}

                {/* Replies Thread */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="space-y-2 pl-4 border-l-2 border-white/10 mt-2">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="font-bold text-[#22C55E]">{reply.author}</span>
                          <span className="text-[9px] text-slate-500 font-mono">• {reply.createdAt}</span>
                        </div>
                        <p className="text-slate-300 text-[11px]">{reply.text}</p>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* DYNAMIC PINNED COMMENT INPUT BOX WITH TIMESTAMP TOGGLE */}
      <form onSubmit={handleSubmitComment} className="pt-3 border-t border-white/5 space-y-2 mt-2">
        <div className="flex items-center justify-between">
          {/* Timestamp Attachment Toggle Pill */}
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
            {attachTimestamp ? `Attach timestamp (${currentFormattedTime}) [ON]` : "General Message [OFF]"}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder={
              attachTimestamp
                ? `Add a comment at ${currentFormattedTime}...`
                : "Add a general feedback message..."
            }
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            className="bg-[#1A1B23] border-white/10 text-xs h-10 focus:border-[#22C55E]"
          />
          <Button
            type="submit"
            disabled={!newCommentText.trim()}
            className="bg-[#22C55E] text-[#090A0F] font-bold text-xs h-10 px-4 hover:bg-[#22C55E]/90 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5 mr-1" /> Post
          </Button>
        </div>
      </form>

      {/* CREATE TASK MODAL FORM */}
      {taskModalComment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#12131A] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 relative">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-[#22C55E]" /> Create Actionable Task
              </h3>
              <button
                onClick={() => setTaskModalComment(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmCreateTask} className="space-y-3 text-xs">
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
                  onClick={() => setTaskModalComment(null)}
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

    </div>
  );
}
