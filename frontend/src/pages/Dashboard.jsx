import React, { useState, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import TopNav from "../components/dashboard/TopNav";
import StatCards from "../components/dashboard/StatCards";
import TeamAllocationTable from "../components/dashboard/TeamAllocationTable";
import ProjectProgressView from "../components/dashboard/ProjectProgressView";
import ProjectHistoryList from "../components/dashboard/ProjectHistoryList";
import RevenuePanel from "../components/dashboard/RevenuePanel";
import ChangePasswordCard from "../components/dashboard/ChangePasswordCard";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { DropdownSelect } from "../components/ui/dropdown";
import { User, Sparkles, Plus, X, Building2, Mail, Loader2, ShieldCheck } from "lucide-react";
import { DashboardProvider, useDashboard } from "../context/DashboardContext";

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

function InnerDashboardLayout({ session }) {
  const {
    userProfile,
    teamMembers,
    projects,
    history,
    createProject,
    updateAgencyName
  } = useDashboard();

  const isOwner = userProfile?.role === "Owner";

  const [activeTab, setActiveTab] = useState("overview");

  // Agency Settings State
  const [companyName, setCompanyName] = useState(userProfile?.agency_name || "");
  const [savingAgency, setSavingAgency] = useState(false);
  const [agencySuccess, setAgencySuccess] = useState(null);
  const [agencyError, setAgencyError] = useState(null);

  useEffect(() => {
    if (userProfile?.agency_name) {
      setCompanyName(userProfile.agency_name);
    }
  }, [userProfile?.agency_name]);

  // New Project Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittingProject, setSubmittingProject] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newClient, setNewClient] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientEmailTouched, setClientEmailTouched] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(userProfile?.id || "");
  const [newMilestoneAmount, setNewMilestoneAmount] = useState("6500");

  useEffect(() => {
    if (userProfile?.id && !selectedLeadId) {
      setSelectedLeadId(userProfile.id);
    }
  }, [userProfile?.id, selectedLeadId]);

  // Lead dropdown options populated from real team members
  const leadOptions = teamMembers.map((m) => ({
    value: m.id,
    label: `${m.name} (${m.role})`,
    icon: User
  }));

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

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setClientEmailTouched(true);
    if (!canSubmitProject) return;

    setSubmittingProject(true);
    try {
      await createProject({
        title: newTitle.trim(),
        client_org: newClient.trim(),
        client_email: clientEmail.trim(),
        lead_id: selectedLeadId || userProfile?.id,
        initial_milestone_amount: parseFloat(newMilestoneAmount) || 5000
      });

      setIsModalOpen(false);
      setNewTitle("");
      setNewClient("");
      setClientEmail("");
      setClientEmailTouched(false);
      setNewMilestoneAmount("6500");
    } catch (err) {
      alert("Failed to create project: " + err.message);
    } finally {
      setSubmittingProject(false);
    }
  };

  const handleSaveAgencySettings = async (e) => {
    e.preventDefault();
    if (!companyName.trim() || !isOwner) return;

    setSavingAgency(true);
    setAgencySuccess(null);
    setAgencyError(null);

    try {
      await updateAgencyName(companyName.trim());
      setAgencySuccess("Agency name updated successfully");
      setTimeout(() => setAgencySuccess(null), 4000);
    } catch (err) {
      setAgencyError(err.message || "Failed to update agency name.");
    } finally {
      setSavingAgency(false);
    }
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
        <TopNav onNewProjectClick={() => setIsModalOpen(true)} setActiveTab={setActiveTab} />

        {/* MAIN SCROLLABLE DASHBOARD CANVAS */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 relative z-10">
          
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              
              {/* Header Title Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                    {userProfile?.role === "Owner" ? "Agency Owner Dashboard" : "Workspace Dashboard"}
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
              <StatCards />

              {/* ACTIVE PROJECT PROGRESS & REVENUE GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <ProjectProgressView onViewAll={() => setActiveTab("projects")} />
                <RevenuePanel onViewAll={() => setActiveTab("revenue")} />
              </div>

              {/* TEAM ALLOCATION MATRIX */}
              <TeamAllocationTable onViewAll={() => setActiveTab("team")} />

              {/* PAST PROJECTS HISTORY */}
              <ProjectHistoryList onViewAll={() => setActiveTab("history")} />
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

              <ProjectProgressView />
            </div>
          )}

          {/* TAB 3: TEAM ALLOCATION */}
          {activeTab === "team" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Team Workload Allocation</h1>
                <p className="text-slate-400 text-xs mt-1">Monitor editor workloads, assigned active projects, and availability.</p>
              </div>

              <TeamAllocationTable />
            </div>
          )}

          {/* TAB 4: REVENUE & FINANCIALS */}
          {activeTab === "revenue" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Financials & Milestone Revenue</h1>
                <p className="text-slate-400 text-xs mt-1">Real-time ledger of paid milestone invoices and pending locks.</p>
              </div>

              <RevenuePanel />
            </div>
          )}

          {/* TAB 5: PROJECT HISTORY */}
          {activeTab === "history" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Delivered Project History</h1>
                <p className="text-slate-400 text-xs mt-1">Archived master files, client sign-offs, and historical revenue.</p>
              </div>

              <ProjectHistoryList />
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
                <form onSubmit={handleSaveAgencySettings} className="space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                    <Building2 className="w-4 h-4 text-[#22C55E]" /> Agency Branding & Information
                  </h3>

                  {agencySuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> {agencySuccess}
                    </div>
                  )}

                  {agencyError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                      ⚠️ {agencyError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5 text-left">
                      <label className="font-semibold text-slate-300">Company Name</label>
                      <Input
                        value={companyName}
                        disabled={!isOwner}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Apex Motion Studios"
                        className="bg-[#1A1B23] border-white/10"
                      />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="font-semibold text-slate-300">Owner Email</label>
                      <Input value={userProfile?.email || ""} disabled className="bg-[#1A1B23] border-white/10 opacity-70" />
                    </div>
                  </div>

                  {isOwner && (
                    <div className="pt-2 flex justify-end">
                      <Button
                        type="submit"
                        disabled={savingAgency || !companyName.trim()}
                        className="bg-[#22C55E] text-[#090A0F] font-bold text-xs px-5 hover:bg-[#22C55E]/90 disabled:opacity-50"
                      >
                        {savingAgency ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> Saving...
                          </>
                        ) : (
                          "Save Agency Settings"
                        )}
                      </Button>
                    </div>
                  )}
                </form>
              </Card>

              <ChangePasswordCard />
            </div>
          )}
        </main>
      </div>

      {/* NEW PROJECT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#12131A] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 relative">
            
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#22C55E]" /> Create New Project
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div className="space-y-1 text-left">
                <label className="font-medium text-slate-300">Project Title</label>
                <Input
                  required
                  placeholder="e.g. Vanguard Promo V3"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-[#1A1B23] border-white/10 text-xs focus:border-[#22C55E]"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="font-medium text-slate-300">Client Company Name</label>
                <Input
                  required
                  placeholder="e.g. Vanguard Media"
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  className="bg-[#1A1B23] border-white/10 text-xs focus:border-[#22C55E]"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="font-medium text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Client Contact Email
                </label>
                <Input
                  type="email"
                  required
                  placeholder="client@vanguard.com"
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

              {/* Real Team Lead Selector */}
              <div className="space-y-1 text-left">
                <label className="font-medium text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Assigned Team Lead
                </label>
                <DropdownSelect
                  value={selectedLeadId}
                  onChange={setSelectedLeadId}
                  options={leadOptions.length > 0 ? leadOptions : [{ value: userProfile?.id || "", label: `${userProfile?.full_name || "Owner"} (Lead)` }]}
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="font-medium text-slate-300">Initial Milestone Invoice Amount ($)</label>
                <Input
                  type="number"
                  required
                  placeholder="6500"
                  value={newMilestoneAmount}
                  onChange={(e) => setNewMilestoneAmount(e.target.value)}
                  className="bg-[#1A1B23] border-white/10 text-xs focus:border-[#22C55E]"
                />
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
                  disabled={submittingProject || !canSubmitProject}
                  className="bg-[#22C55E] text-[#090A0F] font-bold text-xs px-5 hover:bg-[#22C55E]/90 disabled:opacity-50"
                >
                  {submittingProject ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5 text-[#090A0F]" /> Creating...
                    </>
                  ) : (
                    "Create Project"
                  )}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function Dashboard({ session, userProfile }) {
  return (
    <DashboardProvider userProfile={userProfile}>
      <InnerDashboardLayout session={session} />
    </DashboardProvider>
  );
}
