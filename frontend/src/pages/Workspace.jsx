// TEMP: role is currently read from local mock state for UI testing — in production this must come from the authenticated session, and every sensitive action below must ALSO be enforced server-side regardless of what the frontend renders.

import React, { useState } from "react";
import VersionControlHeader from "../components/workspace/VersionControlHeader";
import VideoPlayer from "../components/workspace/VideoPlayer";
import ClientReviewPanel from "../components/workspace/ClientReviewPanel";
import InternalTeamPanel from "../components/workspace/InternalTeamPanel";
import ClientPaymentGate from "../components/workspace/ClientPaymentGate";
import ApproveProjectModal from "../components/workspace/ApproveProjectModal";
import PushVersionModal from "../components/workspace/PushVersionModal";
import DevControlsPanel from "../components/workspace/DevControlsPanel";
import { mockWorkspaceProject } from "../components/workspace/mockWorkspaceData";
import { MessageSquare, ShieldCheck, Download, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { cn } from "../utils";

export default function Workspace({ onBackToDashboard }) {
  // Local Mock State
  const [role, setRole] = useState("Owner");
  const [project, setProject] = useState(mockWorkspaceProject);
  const [currentVersion, setCurrentVersion] = useState("V1");
  const [currentTime, setCurrentTime] = useState(42); // Start at 00:42
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState("cc-1");
  const [activeTab, setActiveTab] = useState("review"); // "review" | "internal"
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isPushVersionModalOpen, setIsPushVersionModalOpen] = useState(false);

  // Role Checks
  const isClient = role === "Client";
  const isEditorNotLead = role === "Editor";
  const isOwnerOrLead = role === "Owner" || role === "Lead";

  // Check if all internal tasks are resolved
  const allTasksResolved = project.internalTasks.length > 0 && project.internalTasks.every((t) => t.status === "Resolved");

  // Next version tag calculated dynamically
  const nextVersionTag = `V${project.versions.length + 1}`;

  // Filter ONLY timestamped comments for video timeline markers
  const timelineMarkers = project.clientComments.filter(
    (c) => c.timestamp !== null && c.timestamp !== undefined
  );

  // Handler: Reassign Project Lead (Owner Exclusive)
  const handleReassignLead = (newLead) => {
    // TODO: wire to backend endpoint PATCH /api/projects/:id/lead
    setProject({
      ...project,
      assignedLead: newLead
    });
  };

  // Handler: Add Client Comment
  const handleAddComment = (text, timestamp) => {
    // TODO: wire to Supabase Realtime / API endpoint
    let formatted = null;
    if (timestamp !== null && timestamp !== undefined) {
      const mins = Math.floor(timestamp / 60);
      const secs = Math.floor(timestamp % 60);
      formatted = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }

    const newComment = {
      id: `cc-${Date.now()}`,
      timestamp,
      formattedTime: formatted,
      author: isClient ? "David Vance (Client)" : role === "Lead" ? "Alex Rivera (Lead)" : "Agency Owner",
      role: role,
      avatar: isClient ? "DV" : role === "Lead" ? "AR" : "OW",
      text,
      createdAt: "Just now",
      isActionable: true,
      hasTaskCreated: false,
      replies: []
    };

    setProject({
      ...project,
      clientComments: [newComment, ...project.clientComments]
    });
  };

  // Handler: Add Reply to Client Comment
  const handleAddReply = (commentId, replyText) => {
    // TODO: wire to Supabase Realtime / API endpoint
    const updated = project.clientComments.map((c) => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: [
            ...(c.replies || []),
            {
              id: `rep-${Date.now()}`,
              author: role === "Lead" ? "Alex Rivera (Lead)" : "Agency Owner",
              role: role,
              avatar: role === "Lead" ? "AR" : "OW",
              text: replyText,
              createdAt: "Just now"
            }
          ]
        };
      }
      return c;
    });

    setProject({
      ...project,
      clientComments: updated
    });
  };

  // Handler: Create Actionable Task from Client Comment
  const handleCreateTaskFromComment = (comment, taskInstruction, assignedEditor) => {
    const taskId = `task-${Date.now()}`;
    const newTask = {
      id: taskId,
      linkedCommentId: comment.id,
      timestamp: comment.timestamp,
      formattedTime: comment.formattedTime,
      title: `Action: ${taskInstruction.slice(0, 35)}...`,
      instruction: taskInstruction,
      assignedEditor: assignedEditor || "Marcus Vance",
      status: "Open",
      rejectionNote: null,
      internalFiles: []
    };

    const updatedComments = project.clientComments.map((c) => {
      if (c.id === comment.id) {
        return { ...c, hasTaskCreated: true, taskId };
      }
      return c;
    });

    setProject({
      ...project,
      clientComments: updatedComments,
      internalTasks: [newTask, ...project.internalTasks]
    });
  };

  // Handler: Create Task from Internal Discussion Message
  const handleCreateTaskFromDiscussion = (msg, taskInstruction, assignedEditor) => {
    const taskId = `task-${Date.now()}`;
    const newTask = {
      id: taskId,
      linkedDiscussionId: msg.id,
      timestamp: msg.timestamp,
      formattedTime: msg.formattedTime,
      title: `Action: ${taskInstruction.slice(0, 35)}...`,
      instruction: taskInstruction,
      assignedEditor: assignedEditor || "Marcus Vance",
      status: "Open",
      rejectionNote: null,
      internalFiles: []
    };

    const updatedDiscussion = (project.teamDiscussion || []).map((m) => {
      if (m.id === msg.id) {
        return { ...m, hasTaskCreated: true, taskId };
      }
      return m;
    });

    setProject({
      ...project,
      teamDiscussion: updatedDiscussion,
      internalTasks: [newTask, ...project.internalTasks]
    });
  };

  // Handler: Update Internal Task Status
  const handleUpdateTaskStatus = (taskId, newStatus, rejectionNote = null) => {
    // TODO: wire to Supabase Realtime / API endpoint
    const updatedTasks = project.internalTasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
          resolvedBy: newStatus === "Resolved" ? (role === "Lead" ? "Alex Rivera" : "Agency Owner") : null,
          rejectionNote: newStatus === "Reopened" ? rejectionNote : null
        };
      }
      return t;
    });

    // If task resolved, auto-generate system resolution message in Client Review tab
    let updatedComments = project.clientComments;
    if (newStatus === "Resolved") {
      const targetTask = project.internalTasks.find((t) => t.id === taskId);
      if (targetTask && targetTask.linkedCommentId) {
        updatedComments = project.clientComments.map((c) => {
          if (c.id === targetTask.linkedCommentId) {
            return {
              ...c,
              replies: [
                ...(c.replies || []),
                {
                  id: `sys-${Date.now()}`,
                  author: "System Notice",
                  role: "System",
                  avatar: "✓",
                  text: `Resolved by ${role === "Lead" ? "Alex Rivera" : "Agency Owner"}`,
                  createdAt: "Just now"
                }
              ]
            };
          }
          return c;
        });
      }
    }

    setProject({
      ...project,
      clientComments: updatedComments,
      internalTasks: updatedTasks
    });
  };

  // Handler: Owner Task Decision Override (Owner Exclusive)
  const handleOwnerOverrideTaskStatus = (taskId, targetStatus) => {
    const updatedTasks = project.internalTasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: targetStatus,
          resolvedBy: targetStatus === "Resolved" ? "Agency Owner (Override)" : null,
          rejectionNote: targetStatus === "Reopened" ? "Reopened via Owner Decision Override" : null
        };
      }
      return t;
    });

    setProject({
      ...project,
      internalTasks: updatedTasks
    });
  };

  // Handler: Add Internal Discussion Message
  const handleAddDiscussionMessage = (text, timestamp) => {
    let formatted = null;
    if (timestamp !== null && timestamp !== undefined) {
      const mins = Math.floor(timestamp / 60);
      const secs = Math.floor(timestamp % 60);
      formatted = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }

    const newMsg = {
      id: `disc-${Date.now()}`,
      author: role === "Lead" ? "Alex Rivera (Lead)" : role === "Editor" ? "Sarah Jenkins (Editor)" : "Agency Owner",
      role: role,
      avatar: role === "Lead" ? "AR" : role === "Editor" ? "SJ" : "OW",
      timestamp,
      formattedTime: formatted,
      text,
      createdAt: "Just now",
      hasTaskCreated: false
    };

    setProject({
      ...project,
      teamDiscussion: [...(project.teamDiscussion || []), newMsg]
    });
  };

  // Handler: Attach Internal Working Clip
  const handleAttachInternalFile = (taskId, filename, size) => {
    const updatedTasks = project.internalTasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          internalFiles: [
            ...(t.internalFiles || []),
            {
              id: `file-${Date.now()}`,
              name: filename,
              size: size || "45.2 MB",
              uploader: role === "Editor" ? "Sarah Jenkins" : "Alex Rivera",
              uploadedAt: "Just now"
            }
          ]
        };
      }
      return t;
    });

    setProject({
      ...project,
      internalTasks: updatedTasks
    });
  };

  // Handler: Confirm Push New Version to Client
  const handleConfirmPushNewVersion = (masterFilename, versionTag) => {
    const updatedVersions = project.versions.map((v) => ({ ...v, isCurrent: false }));
    updatedVersions.unshift({
      version: versionTag,
      date: "Today",
      status: "Active Review",
      isCurrent: true,
      masterFilename
    });

    setProject({
      ...project,
      currentVersion: versionTag,
      versions: updatedVersions,
      status: "In Client Review"
    });
    setCurrentVersion(versionTag);
    setIsPushVersionModalOpen(false);
  };

  return (
    <div className="h-[100dvh] w-screen overflow-hidden bg-[#090A0F] text-slate-100 flex flex-col box-border font-sans select-none">
      
      {/* 1. TOP BAR CONTROL HEADER */}
      <VersionControlHeader
        project={project}
        role={role}
        currentVersion={currentVersion}
        allTasksResolved={allTasksResolved}
        onVersionSelect={setCurrentVersion}
        onPushNewVersion={() => setIsPushVersionModalOpen(true)}
        onOpenApproveModal={() => setIsApproveModalOpen(true)}
        onBackToDashboard={onBackToDashboard || (() => (window.location.hash = "#dashboard"))}
        onReassignLead={handleReassignLead}
      />

      {/* 2. CLIENT ADVANCE PAYMENT GATE (If Client and advance not paid) */}
      {isClient && !project.advancePaid ? (
        <ClientPaymentGate
          advanceAmount={project.advanceAmount}
          onUnlockAdvance={() => setProject({ ...project, advancePaid: true })}
        />
      ) : (
        /* 3. MAIN WORKSPACE 60/40 SPLIT GRID */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-[calc(100dvh-3rem)] p-3 overflow-hidden box-border">
          
          {/* LEFT 60% PANEL: VIDEO PLAYER & STAGE */}
          <div className="lg:col-span-7 flex flex-col min-h-0 h-full justify-between bg-[#12131A] border border-white/5 rounded-2xl p-4 overflow-hidden shadow-2xl relative">
            <VideoPlayer
              currentTime={currentTime}
              duration={project.videoDuration}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onSeek={setCurrentTime}
              markers={timelineMarkers}
              selectedMarkerId={selectedCommentId}
              onMarkerClick={(id, ts) => {
                setSelectedCommentId(id);
                if (ts !== null && ts !== undefined) setCurrentTime(ts);
              }}
            />

            {/* Client Role Watermarked Download Gate */}
            {isClient && (
              <div className="mt-3 p-3 rounded-xl bg-[#1A1B23] border border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                  <span className="text-slate-300 font-medium">4K ProRes Master Deliverables</span>
                </div>
                {project.milestonePaid ? (
                  <Button
                    onClick={() => alert("Downloading 4K Master ProRes exports...")}
                    className="bg-[#22C55E] text-[#090A0F] font-bold text-xs h-8 px-3 hover:bg-[#22C55E]/90 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Un-watermarked 4K Master
                  </Button>
                ) : (
                  <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Watermarked — Pay $6,500 milestone to unlock
                  </span>
                )}
              </div>
            )}
          </div>

          {/* RIGHT 40% PANEL: TABBED REVIEW & TASK FEED */}
          <div className="lg:col-span-5 flex flex-col min-h-0 h-full bg-[#12131A] border border-white/5 rounded-2xl p-4 overflow-hidden shadow-2xl">
            
            {/* ROLE-BASED TAB HEADER */}
            <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-3 shrink-0">
              
              {/* Client Review Tab (Visible to Owner, Lead, Client — HIDDEN from Editor) */}
              {!isEditorNotLead && (
                <button
                  onClick={() => setActiveTab("review")}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                    activeTab === "review"
                      ? "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20"
                      : "bg-[#1A1B23] text-slate-400 hover:text-white"
                  )}
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Client Review ({project.clientComments.length})
                </button>
              )}

              {/* Internal Team Tab (Visible to Owner, Lead, Editor — HIDDEN from Client) */}
              {!isClient && (
                <button
                  onClick={() => setActiveTab("internal")}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                    activeTab === "internal" || isEditorNotLead
                      ? "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20"
                      : "bg-[#1A1B23] text-slate-400 hover:text-white"
                  )}
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Internal Tasks ({project.internalTasks.length})
                </button>
              )}
            </div>

            {/* TAB CONTENT PANELS */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {(!isEditorNotLead && (activeTab === "review" || isClient)) ? (
                <ClientReviewPanel
                  comments={project.clientComments}
                  role={role}
                  currentTime={currentTime}
                  teamMembers={project.teamMembers || []}
                  selectedCommentId={selectedCommentId}
                  onSelectComment={(id, ts) => {
                    setSelectedCommentId(id);
                    if (ts !== null && ts !== undefined) setCurrentTime(ts);
                  }}
                  onAddComment={handleAddComment}
                  onAddReply={handleAddReply}
                  onCreateTaskFromComment={handleCreateTaskFromComment}
                  onViewTask={() => setActiveTab("internal")}
                />
              ) : (
                <InternalTeamPanel
                  tasks={project.internalTasks}
                  discussion={project.teamDiscussion || []}
                  teamMembers={project.teamMembers || []}
                  role={role}
                  currentUser={role === "Lead" ? "Alex Rivera" : role === "Editor" ? "Sarah Jenkins" : "Agency Owner"}
                  currentTime={currentTime}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                  onAttachInternalFile={handleAttachInternalFile}
                  onAddDiscussionMessage={handleAddDiscussionMessage}
                  onCreateTaskFromDiscussion={handleCreateTaskFromDiscussion}
                  onOwnerOverrideTaskStatus={handleOwnerOverrideTaskStatus}
                />
              )}
            </div>

          </div>

        </div>
      )}

      {/* APPROVE PROJECT MODAL */}
      <ApproveProjectModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        project={project}
        onApproveSuccess={() => setProject({ ...project, milestonePaid: true })}
      />

      {/* PUSH VERSION MODAL */}
      <PushVersionModal
        isOpen={isPushVersionModalOpen}
        onClose={() => setIsPushVersionModalOpen(false)}
        tasks={project.internalTasks}
        nextVersionTag={nextVersionTag}
        onConfirmPush={handleConfirmPushNewVersion}
      />

      {/* DEV CONTROLS TESTING PANEL */}
      <DevControlsPanel
        role={role}
        advancePaid={project.advancePaid}
        milestonePaid={project.milestonePaid}
        onRoleChange={(newRole) => {
          setRole(newRole);
          if (newRole === "Client") setActiveTab("review");
          if (newRole === "Editor") setActiveTab("internal");
        }}
        onToggleAdvancePaid={(val) => setProject({ ...project, advancePaid: val })}
        onToggleMilestonePaid={(val) => setProject({ ...project, milestonePaid: val })}
        onBulkSetTasksResolved={() => {
          const resolved = project.internalTasks.map((t) => ({ ...t, status: "Resolved" }));
          setProject({ ...project, internalTasks: resolved });
        }}
        onResetTasks={() => setProject(mockWorkspaceProject)}
      />

    </div>
  );
}
