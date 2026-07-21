// TEMP: auth guard disabled for local UI testing — re-enable route protection before deploying or connecting real backend.

import React, { useState } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import TopNav from "../components/dashboard/TopNav";
import StatCards from "../components/dashboard/StatCards";
import TeamAllocationTable from "../components/dashboard/TeamAllocationTable";
import ProjectProgressView from "../components/dashboard/ProjectProgressView";
import ProjectHistoryList from "../components/dashboard/ProjectHistoryList";
import RevenuePanel from "../components/dashboard/RevenuePanel";
import ChangePasswordCard from "../components/dashboard/ChangePasswordCard";
import {
  mockOwnerStats,
  mockTeamAllocation,
  mockActiveProjects,
  mockProjectHistory,
  mockRevenueBreakdown
} from "../components/dashboard/mockData";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { DropdownSelect } from "../components/ui/dropdown";
import { User, Sparkles, Plus, Lock, X, Building2, Mail } from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DISPOSABLE_DOMAINS = [
  "tempmail.com",
  "mailinator.com",
  "dispostable.com",
  "10minutemail.com",
  "yopmail.com",
  "guerrillamail.com",
  "trashmail.com"
];

const leadOptions = [
  { value: "Alex Rivera", label: "Alex Rivera (Lead Editor)", icon: User },
  { value: "Sarah Jenkins", label: "Sarah Jenkins (Motion Designer)", icon: User },
  { value: "Marcus Vance", label: "Marcus Vance (Colorist)", icon: User },
  { value: "Elena Rostova", label: "Elena Rostova (VFX)", icon: User }
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  
  // TODO: replace with API call - State for active projects & team members
  const [stats, setStats] = useState(mockOwnerStats);
  const [teamMembers, setTeamMembers] = useState(mockTeamAllocation);
  const [projects, setProjects] = useState(mockActiveProjects);
  const [history, setHistory] = useState(mockProjectHistory);
  const [revenueList, setRevenueList] = useState(mockRevenueBreakdown);

  // New Project Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newClient, setNewClient] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientEmailTouched, setClientEmailTouched] = useState(false);
  const [newLead, setNewLead] = useState("Alex Rivera");
  const [newMilestoneAmount, setNewMilestoneAmount] = useState("6500");

  const getClientEmailError = (val) => {
    if (!val || val.trim() === "") {
      return "Client contact email is required";
    }
    const trimmed = val.trim();
    if (!EMAIL_REGEX.test(trimmed)) {
      return "Enter a valid email address";
    }
    const domain = trimmed.split("@")[1]?.toLowerCase();
    if (domain && DISPOSABLE_DOMAINS.includes(domain)) {
      return "Please use a permanent work email";
    }
    return null;
  };

  const clientEmailError = clientEmailTouched ? getClientEmailError(clientEmail) : null;
  const isClientEmailValid = clientEmail && getClientEmailError(clientEmail) === null;
  const canSubmitProject = newTitle.trim() !== "" && newClient.trim() !== "" && isClientEmailValid;

  // Handle New Project Creation (Local State Dummy Add)
  const handleCreateProject = (e) => {
    e.preventDefault();
    setClientEmailTouched(true);
    if (!canSubmitProject) return;

    // TODO: on backend wiring, auto-create client account for this email (like team member invite flow) and send them access credentials to the client portal for this project
    const newProj = {
      id: `proj-${Date.now()}`,
      title: newTitle,
      client: newClient,
      clientEmail: clientEmail,
      assignedLead: newLead,
      currentVersion: "V1",
      status: "Client Feedback In Progress",
      progressPercent: 15,
      totalPins: 0,
      resolvedPins: 0,
      milestoneAmount: parseFloat(newMilestoneAmount) || 5000,
      isPaid: false,
      dueDate: "Aug 15, 2026"
    };

    setProjects([newProj, ...projects]);
    setStats({
      ...stats,
      totalActiveProjects: stats.totalActiveProjects + 1
    });

    setIsModalOpen(false);
    setNewTitle("");
    setNewClient("");
    setClientEmail("");
    setClientEmailTouched(false);
    setNewMilestoneAmount("6500");
  };

  return (
    <div className="flex h-screen w-screen bg-[#090A0F] text-slate-100 font-sans antialiased overflow-hidden selection:bg-[#22C55E]/30 selection:text-white">
      
      {/* LEFT NAVIGATION SIDEBAR */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* RIGHT MAIN DASHBOARD CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#090A0F] relative">
        
        {/* Subtle Ambient Glows */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#22C55E]/5 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full bg-emerald-600/5 blur-[120px] pointer-events-none" />

        {/* TOP TOOLBAR */}
        <TopNav onNewProjectClick={() => setIsModalOpen(true)} />

        {/* MAIN SCROLLABLE DASHBOARD CANVAS */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 relative z-10">
          
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              
              {/* Header Title Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                    Agency Owner Dashboard
                  </h1>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1">
                    Company-wide project statuses, revenue locks, and team allocations at a glance.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#12131A] border border-white/10 text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" /> Live Workspace Sync
                  </span>
                </div>
              </div>

              {/* STAT CARDS MATRIX */}
              <StatCards stats={stats} />

              {/* ACTIVE PROJECT PROGRESS & REVENUE GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <ProjectProgressView projects={projects} onViewAll={() => setActiveTab("projects")} />
                <RevenuePanel revenueList={revenueList} stats={stats} onViewAll={() => setActiveTab("revenue")} />
              </div>

              {/* TEAM ALLOCATION MATRIX */}
              <TeamAllocationTable
                teamMembers={teamMembers}
                activeProjects={projects}
                onUpdateTeamMembers={setTeamMembers}
                onViewAll={() => setActiveTab("team")}
              />

              {/* PAST PROJECTS HISTORY */}
              <ProjectHistoryList history={history} onViewAll={() => setActiveTab("history")} />
            </div>
          )}

          {/* TAB 2: ACTIVE PROJECTS */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-white">Active Projects ({projects.length})</h1>
                  <p className="text-slate-400 text-xs mt-1">Manage active video review streams and milestone deliverables.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="bg-[#22C55E] text-[#090A0F] font-bold text-xs hover:bg-[#22C55E]/90">
                  <Plus className="w-4 h-4 mr-1 stroke-[3]" /> Add Project
                </Button>
              </div>

              <ProjectProgressView projects={projects} />
            </div>
          )}

          {/* TAB 3: TEAM ALLOCATION */}
          {activeTab === "team" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Team Workload Allocation</h1>
                <p className="text-slate-400 text-xs mt-1">Monitor editor workloads, assigned active projects, and availability.</p>
              </div>

              <TeamAllocationTable
                teamMembers={teamMembers}
                activeProjects={projects}
                onUpdateTeamMembers={setTeamMembers}
              />
            </div>
          )}

          {/* TAB 4: REVENUE & FINANCIALS */}
          {activeTab === "revenue" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Financials & Milestone Revenue</h1>
                <p className="text-slate-400 text-xs mt-1">Real-time ledger of paid milestone invoices and pending locks.</p>
              </div>

              <RevenuePanel revenueList={revenueList} stats={stats} />
            </div>
          )}

          {/* TAB 5: PROJECT HISTORY */}
          {activeTab === "history" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Delivered Project History</h1>
                <p className="text-slate-400 text-xs mt-1">Archived master files, client sign-offs, and historical revenue.</p>
              </div>

              <ProjectHistoryList history={history} />
            </div>
          )}

          {/* TAB 6: AGENCY SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-2xl font-bold text-white">Agency Settings & Security</h1>
                <p className="text-slate-400 text-xs mt-1">Configure company branding, automated watermarking, and client portals.</p>
              </div>

              <Card className="bg-[#12131A] border-white/5 p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                    <Building2 className="w-4 h-4 text-[#22C55E]" /> Agency Branding & Custom Subdomain
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Agency Name</label>
                      <Input defaultValue="Apex Motion Studios" className="bg-[#1A1B23] border-white/10 text-xs" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Custom Portal Subdomain</label>
                      <div className="flex items-center gap-2">
                        <Input defaultValue="apexmotion" className="bg-[#1A1B23] border-white/10 text-xs" />
                        <span className="text-xs text-slate-500 font-mono">.framereview.app</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                    <Lock className="w-4 h-4 text-[#22C55E]" /> Automated Milestone Protection
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 text-xs text-slate-300 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/10 bg-[#1A1B23] accent-[#22C55E]" />
                      Lock 4K / High-Res Master Exports automatically until milestone invoices are settled.
                    </label>
                    <label className="flex items-center gap-3 text-xs text-slate-300 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/10 bg-[#1A1B23] accent-[#22C55E]" />
                      Overlay dynamic client email watermarks on un-paid video review streams.
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button className="bg-[#22C55E] text-[#090A0F] font-bold text-xs px-6">
                    Save Agency Settings
                  </Button>
                </div>
              </Card>

              {/* Self-Service Change Password Section */}
              <ChangePasswordCard />
            </div>
          )}

        </main>
      </div>

      {/* NEW PROJECT CREATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#12131A] border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 relative">
            
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#22C55E]" /> Create New Review Project
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Project Title</label>
                <Input
                  required
                  placeholder="e.g. Aether Tech Commercial Cut"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-[#1A1B23] border-white/10 text-xs"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="font-semibold text-slate-300">Client Organization</label>
                <Input
                  required
                  placeholder="e.g. Vanguard Media Studios"
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  className="bg-[#1A1B23] border-white/10 text-xs focus:border-[#22C55E]"
                />
              </div>

              {/* Client Contact Email */}
              <div className="space-y-1.5 text-left">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Client Contact Email
                </label>
                <Input
                  type="email"
                  required
                  placeholder="client@vanguardmedia.com"
                  value={clientEmail}
                  onBlur={() => setClientEmailTouched(true)}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className={`bg-[#1A1B23] text-xs transition-all ${
                    clientEmailTouched && clientEmailError
                      ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
                      : isClientEmailValid && clientEmailTouched
                      ? "border-emerald-500/50 focus:border-[#22C55E]"
                      : "border-white/10 focus:border-[#22C55E]"
                  }`}
                />
                {clientEmailTouched && clientEmailError && (
                  <p className="text-red-400 text-[11px] mt-0.5 font-medium flex items-center gap-1">
                    ⚠️ {clientEmailError}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="font-semibold text-slate-300">Assigned Team Lead</label>
                  <DropdownSelect
                    value={newLead}
                    onChange={setNewLead}
                    options={leadOptions}
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="font-semibold text-slate-300">Initial Milestone ($ USD)</label>
                  <Input
                    type="number"
                    required
                    value={newMilestoneAmount}
                    onChange={(e) => setNewMilestoneAmount(e.target.value)}
                    className="bg-[#1A1B23] border-white/10 text-xs font-mono focus:border-[#22C55E]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-white/5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs border-white/10 bg-[#1A1B23] text-slate-300 hover:text-white hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!canSubmitProject}
                  className="bg-[#22C55E] text-[#090A0F] font-bold text-xs px-5 hover:bg-[#22C55E]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create & Launch Project
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
