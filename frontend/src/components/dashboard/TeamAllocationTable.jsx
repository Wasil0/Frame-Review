import React, { useState } from "react";
import {
  Users,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  UserPlus,
  MoreVertical,
  X,
  Trash2,
  Mail,
  User,
  ShieldCheck,
  Plus,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dropdown, DropdownSelect } from "../ui/dropdown";

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

const accessLevelOptions = [
  {
    value: "Editor",
    label: "Editor (Review media, pin feedback, upload versions)",
    icon: ShieldCheck
  },
  {
    value: "Manager",
    label: "Manager (Manage projects, team assignments, invoices)",
    icon: ShieldCheck
  }
];

// Helper to recalculate workload status & badge text automatically
export function recalculateWorkload(activeProjectsCount) {
  if (activeProjectsCount === 0) {
    return { status: "Available", workload: "Available (0/3)" };
  } else if (activeProjectsCount === 1) {
    return { status: "Available", workload: "Available (1/3)" };
  } else if (activeProjectsCount === 2) {
    return { status: "Active", workload: "Optimal (2/3)" };
  } else {
    return { status: "Busy", workload: `Busy (Full ${activeProjectsCount}/3)` };
  }
}

export default function TeamAllocationTable({
  teamMembers,
  activeProjects = [],
  onUpdateTeamMembers,
  onViewAll
}) {
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  // New Member Form States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [role, setRole] = useState("");
  const [accessLevel, setAccessLevel] = useState("Editor");
  const [submitting, setSubmitting] = useState(false);

  // Email Validation Helper
  const getEmailError = (val) => {
    if (!val || val.trim() === "") {
      return "Work email is required";
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

  const emailError = emailTouched ? getEmailError(email) : null;
  const isEmailValid = email && getEmailError(email) === null;
  const isFormValid = fullName.trim() !== "" && isEmailValid && role.trim() !== "";

  // 1. Submit Handler: Add New Team Member
  const handleAddMemberSubmit = (e) => {
    e.preventDefault();
    setEmailTouched(true);
    if (!isFormValid) return;

    setSubmitting(true);

    // TODO: replace with real invite API call (auto-generate password, send email via backend)
    setTimeout(() => {
      const initials = fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      const newMember = {
        id: `emp-${Date.now()}`,
        name: fullName,
        email: email,
        role: role,
        accessLevel: accessLevel,
        avatar: initials || "TM",
        activeProjects: [],
        workload: "Available (0/3)",
        status: "Available"
      };

      if (onUpdateTeamMembers) {
        onUpdateTeamMembers([newMember, ...teamMembers]);
      }

      setSubmitting(false);
      setIsAddModalOpen(false);
      setFullName("");
      setEmail("");
      setEmailTouched(false);
      setRole("");
      setAccessLevel("Editor");
    }, 600);
  };

  // 2. Assign Project Handler
  const handleAssignProject = (memberId, projectTitle) => {
    const updated = teamMembers.map((m) => {
      if (m.id === memberId) {
        if (m.activeProjects.includes(projectTitle)) return m;
        const updatedProjects = [...m.activeProjects, projectTitle];
        const { status, workload } = recalculateWorkload(updatedProjects.length);
        return {
          ...m,
          activeProjects: updatedProjects,
          status,
          workload
        };
      }
      return m;
    });

    if (onUpdateTeamMembers) {
      onUpdateTeamMembers(updated);
    }
  };

  // 3. Unassign Project Handler
  const handleUnassignProject = (memberId, projectTitle) => {
    const updated = teamMembers.map((m) => {
      if (m.id === memberId) {
        const updatedProjects = m.activeProjects.filter((p) => p !== projectTitle);
        const { status, workload } = recalculateWorkload(updatedProjects.length);
        return {
          ...m,
          activeProjects: updatedProjects,
          status,
          workload
        };
      }
      return m;
    });

    if (onUpdateTeamMembers) {
      onUpdateTeamMembers(updated);
    }
  };

  // 4. Confirm Member Removal Handler
  const handleConfirmDeleteMember = () => {
    if (!memberToDelete) return;
    const updated = teamMembers.filter((m) => m.id !== memberToDelete.id);
    if (onUpdateTeamMembers) {
      onUpdateTeamMembers(updated);
    }
    setMemberToDelete(null);
  };

  return (
    <Card className="bg-[#12131A] border-white/5 shadow-2xl relative overflow-visible">
      
      {/* CARD HEADER */}
      <CardHeader className="p-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5">
        <div>
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#22C55E]" /> Team Allocation Matrix
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs mt-1">
            Real-time employee workload distribution and assigned active project titles.
          </CardDescription>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-[#22C55E] border border-emerald-500/20 font-mono">
            {teamMembers.length} Members Allocated
          </span>

          {/* + Add Member Button */}
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#22C55E] text-[#090A0F] font-bold text-xs hover:bg-[#22C55E]/90 h-8 px-3.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5 stroke-[3]" /> Add Member
          </Button>

          {onViewAll && (
            <Button
              onClick={onViewAll}
              variant="outline"
              className="text-xs border-white/10 bg-[#1A1B23] text-slate-300 hover:text-white hover:bg-white/5"
            >
              View All ({teamMembers.length})
            </Button>
          )}
        </div>
      </CardHeader>

      {/* TEAM MATRIX TABLE */}
      <CardContent className="p-0 overflow-x-auto overflow-y-visible">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#0B0C12] border-b border-white/5 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
              <th className="py-3.5 px-6">Team Member</th>
              <th className="py-3.5 px-6">Role</th>
              <th className="py-3.5 px-6">Assigned Active Projects</th>
              <th className="py-3.5 px-6 text-center">Workload Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {teamMembers.map((member) => {
              const availableToAssign = activeProjects.filter(
                (p) => !member.activeProjects.includes(p.title)
              );

              // Standardized Dropdown items for row kebab menu
              const rowKebabItems = [
                {
                  id: "assign",
                  label: "Assign to Project",
                  icon: Plus,
                  subItems: availableToAssign.map((p) => ({
                    id: p.id,
                    label: p.title,
                    icon: Briefcase,
                    onClick: () => handleAssignProject(member.id, p.title)
                  }))
                },
                ...(member.activeProjects.length > 0
                  ? [
                      {
                        id: "unassign",
                        label: "Remove from Project",
                        icon: X,
                        subItems: member.activeProjects.map((projTitle) => ({
                          id: projTitle,
                          label: projTitle,
                          icon: Briefcase,
                          onClick: () => handleUnassignProject(member.id, projTitle)
                        }))
                      }
                    ]
                  : []),
                { divider: true },
                {
                  id: "remove-member",
                  label: "Remove Member",
                  icon: Trash2,
                  destructive: true,
                  onClick: () => setMemberToDelete(member)
                }
              ];

              return (
                <tr key={member.id} className="hover:bg-white/[0.02] transition-colors group">
                  
                  {/* Employee Name & Avatar */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-700/20 border border-[#22C55E]/30 flex items-center justify-center font-bold text-[#22C55E] text-xs shadow-sm shrink-0">
                        {member.avatar}
                      </div>
                      <div>
                        <span className="font-bold text-white block">{member.name}</span>
                        {member.email && (
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                            {member.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-4 px-6 text-slate-300 font-medium">
                    <div>
                      <p className="text-slate-200">{member.role}</p>
                      {member.accessLevel && (
                        <span className="text-[9px] font-mono text-emerald-400/90 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 inline-block mt-1">
                          {member.accessLevel}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Assigned Projects Badges (With Hover 'x' Quick Unassign) */}
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1.5">
                      {member.activeProjects.length === 0 && (
                        <span className="text-[11px] text-slate-500 italic">No projects assigned</span>
                      )}
                      {member.activeProjects.map((projTitle, idx) => (
                        <span
                          key={idx}
                          className="group/chip text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[#1A1B23] border border-white/10 text-slate-200 flex items-center gap-1.5 relative transition-colors hover:border-[#22C55E]/40"
                        >
                          <Briefcase className="w-3 h-3 text-[#22C55E] shrink-0" />
                          <span className="truncate max-w-[160px]">{projTitle}</span>
                          
                          {/* Quick 'x' Button to Unassign Project */}
                          <button
                            onClick={() => handleUnassignProject(member.id, projTitle)}
                            className="text-slate-400 hover:text-red-400 opacity-60 group-hover/chip:opacity-100 transition-opacity p-0.5 rounded hover:bg-white/10"
                            title={`Unassign ${projTitle}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Status Indicator */}
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border font-mono ${
                        member.status === "Busy"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : member.status === "Active"
                          ? "bg-emerald-500/10 text-[#22C55E] border-emerald-500/20"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}
                    >
                      {member.status === "Busy" && <AlertCircle className="w-3 h-3" />}
                      {member.status === "Active" && <CheckCircle2 className="w-3 h-3" />}
                      {member.status === "Available" && <Sparkles className="w-3 h-3" />}
                      {member.status} ({member.workload})
                    </span>
                  </td>

                  {/* Kebab Action Menu Column (Using Reusable Dropdown) */}
                  <td className="py-4 px-4 text-right">
                    <Dropdown
                      items={rowKebabItems}
                      align="right"
                      width="w-52"
                      trigger={
                        <button
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                          title="Member Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      }
                    />
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>

      {/* 1. MODAL: REGISTER NEW TEAM MEMBER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#12131A] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 relative">
            
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#22C55E]" /> Add Team Member
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMemberSubmit} className="space-y-4 text-xs">
              
              {/* Full Name */}
              <div className="space-y-1 text-left">
                <label className="font-medium text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Full Name
                </label>
                <Input
                  required
                  placeholder="e.g. David Vance"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-[#1A1B23] border-white/10 text-xs focus:border-[#22C55E]"
                />
              </div>

              {/* Work Email with Real-time Format Check */}
              <div className="space-y-1 text-left">
                <label className="font-medium text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Work Email
                </label>
                <Input
                  type="email"
                  required
                  placeholder="david@agency.com"
                  value={email}
                  onBlur={() => setEmailTouched(true)}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`bg-[#1A1B23] text-xs transition-all ${
                    emailTouched && emailError
                      ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
                      : isEmailValid && emailTouched
                      ? "border-emerald-500/50 focus:border-[#22C55E]"
                      : "border-white/10 focus:border-[#22C55E]"
                  }`}
                />
                {emailTouched && emailError && (
                  <p className="text-red-400 text-[11px] mt-0.5 font-medium flex items-center gap-1">
                    ⚠️ {emailError}
                  </p>
                )}
              </div>

              {/* Job Title / Role */}
              <div className="space-y-1 text-left">
                <label className="font-medium text-slate-300 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Job Title / Role
                </label>
                <Input
                  required
                  placeholder="e.g. Senior Motion Designer, VFX Supervisor"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="bg-[#1A1B23] border-white/10 text-xs focus:border-[#22C55E]"
                />
              </div>

              {/* System Access Level (Using Reusable DropdownSelect) */}
              <div className="space-y-1 text-left">
                <label className="font-medium text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> System Access Level
                </label>
                <DropdownSelect
                  value={accessLevel}
                  onChange={setAccessLevel}
                  options={accessLevelOptions}
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex justify-end gap-3 border-t border-white/5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-xs border-white/10 bg-[#1A1B23] text-slate-300 hover:text-white hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !isFormValid}
                  className="bg-[#22C55E] text-[#090A0F] font-bold text-xs px-5 hover:bg-[#22C55E]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5 text-[#090A0F]" /> Registering...
                    </>
                  ) : (
                    "Register Member"
                  )}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 2. CONFIRMATION DIALOG: REMOVE MEMBER */}
      {memberToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#12131A] border border-red-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 relative text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Remove {memberToDelete.name}?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Are you sure you want to remove <strong className="text-slate-200">{memberToDelete.name}</strong> from the team? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setMemberToDelete(null)}
                className="text-xs border-white/10 bg-[#1A1B23] text-slate-300 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDeleteMember}
                className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-5"
              >
                Confirm Removal
              </Button>
            </div>
          </div>
        </div>
      )}

    </Card>
  );
}
