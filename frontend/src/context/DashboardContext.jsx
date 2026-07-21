import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import { supabase } from "../lib/supabaseClient";

const DashboardContext = createContext(null);

export function DashboardProvider({ children, userProfile: initialUserProfile }) {
  const [userProfile, setUserProfile] = useState(initialUserProfile || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    totalActiveProjects: 0,
    totalActiveProjectsGrowth: "+0%",
    myAssignments: 0,
    myAssignmentsPendingReview: 0,
    pendingRevenue: 0,
    pendingInvoicesCount: 0,
    currentMonthRevenue: 0,
    targetProgressPercent: 0
  });

  const [teamMembers, setTeamMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [history, setHistory] = useState([]);
  const [revenueList, setRevenueList] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Reset state on sign out
  const resetContextState = useCallback(() => {
    setUserProfile(null);
    setTeamMembers([]);
    setProjects([]);
    setHistory([]);
    setRevenueList([]);
    setNotifications([]);
    setStats({
      totalActiveProjects: 0,
      totalActiveProjectsGrowth: "+0%",
      myAssignments: 0,
      myAssignmentsPendingReview: 0,
      pendingRevenue: 0,
      pendingInvoicesCount: 0,
      currentMonthRevenue: 0,
      targetProgressPercent: 0
    });
  }, []);

  // Fetch initial dashboard data ONCE per page load / agency change
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [profileRes, summaryRes, teamRes, activeProjectsRes, completedProjectsRes, invoicesRes, notifsRes] =
        await Promise.all([
          api.get("/api/users/me"),
          api.get("/api/dashboard/summary"),
          api.get("/api/team"),
          api.get("/api/projects?status=active"),
          api.get("/api/projects?status=completed"),
          api.get("/api/invoices"),
          api.get("/api/notifications")
        ]);

      setUserProfile(profileRes);
      setNotifications(notifsRes || []);

      setStats({
        totalActiveProjects: summaryRes.total_active_projects || 0,
        totalActiveProjectsGrowth: "+0%",
        myAssignments: summaryRes.user_assigned_projects || 0,
        myAssignmentsPendingReview: 0,
        pendingRevenue: summaryRes.pending_revenue || 0,
        pendingInvoicesCount: (invoicesRes || []).filter((i) => i.status === "pending").length,
        currentMonthRevenue: summaryRes.month_revenue || 0,
        targetProgressPercent: Math.min(Math.round(((summaryRes.month_revenue || 0) / 25000) * 100), 100)
      });

      // Format team members
      const formattedTeam = (teamRes || []).map((t) => {
        const activeProjs = (t.assigned_projects || []).map((p) => p.title);
        const initials = t.full_name
          ? t.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
          : "TM";

        return {
          id: t._id || t.id,
          name: t.full_name || t.email,
          email: t.email,
          role: t.job_title || t.role || "Team Member",
          accessLevel: t.access_level || t.role || "Editor",
          avatar: initials || "TM",
          activeProjects: activeProjs,
          workload: `${activeProjs.length}/3 Projects`,
          status: activeProjs.length > 2 ? "Busy" : activeProjs.length > 0 ? "Active" : "Available"
        };
      });

      setTeamMembers(formattedTeam);

      // Format active projects
      const formattedActiveProjects = (activeProjectsRes || []).map((p) => {
        const matchingInv = (invoicesRes || []).find((i) => i.project_id === p._id || i.project_id === p.id);
        const amount = matchingInv ? matchingInv.amount : 5000;
        const isPaid = matchingInv ? matchingInv.status === "paid" : p.milestone_paid;

        const leadMember = formattedTeam.find((t) => t.id === p.lead_id);

        return {
          id: p._id || p.id,
          title: p.title,
          client: p.client_org,
          clientEmail: p.client_email,
          leadId: p.lead_id,
          assignedLead: leadMember ? leadMember.name : "Lead",
          editorIds: p.editor_ids || [],
          currentVersion: p.version || "V1",
          status: p.status === "active" ? (isPaid ? "Milestone Paid" : "Client Feedback In Progress") : "Completed",
          progressPercent: p.status === "completed" ? 100 : 25,
          totalPins: 0,
          resolvedPins: 0,
          milestoneAmount: amount,
          isPaid: isPaid,
          dueDate: p.created_at ? new Date(p.created_at).toLocaleDateString() : "Active"
        };
      });

      // Format completed projects
      const formattedCompletedProjects = (completedProjectsRes || []).map((p) => {
        const matchingInv = (invoicesRes || []).find((i) => i.project_id === p._id || i.project_id === p.id);
        const amount = matchingInv ? matchingInv.amount : 5000;

        return {
          id: p._id || p.id,
          title: p.title,
          client: p.client_org,
          currentVersion: p.version || "V1",
          finalRevenue: amount,
          completionDate: p.created_at ? new Date(p.created_at).toLocaleDateString() : "Delivered"
        };
      });

      // Format invoices
      const formattedRevenue = (invoicesRes || []).map((i) => {
        const matchingProj = (activeProjectsRes || []).concat(completedProjectsRes || []).find((p) => (p._id || p.id) === i.project_id);
        const projTitle = matchingProj ? matchingProj.title : "Video Project";
        const clientName = matchingProj ? matchingProj.client_org : "Client";

        return {
          id: i._id || i.id,
          client: clientName,
          project: projTitle,
          milestone: "Initial Deposit / Milestone 1",
          amount: i.amount || 0,
          dueDate: i.due_date || (i.created_at ? new Date(i.created_at).toLocaleDateString() : "Pending"),
          paidDate: i.paid_at ? new Date(i.paid_at).toLocaleDateString() : "Settled",
          status: i.status === "paid" ? "Paid" : "Pending"
        };
      });

      setProjects(formattedActiveProjects);
      setHistory(formattedCompletedProjects);
      setRevenueList(formattedRevenue);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Notifications Actions
  const markNotificationRead = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => ((n._id || n.id) === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.patch("/api/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all notifications read:", err);
    }
  };

  // MUTATION 1: Create Project
  const createProject = async ({ title, client_org, client_email, lead_id, initial_milestone_amount }) => {
    const newProj = await api.post("/api/projects", {
      title,
      client_org,
      client_email,
      lead_id,
      initial_milestone_amount
    });

    const leadMember = teamMembers.find((t) => t.id === (lead_id || userProfile?.id));
    const amount = initial_milestone_amount || 5000;

    const formattedProj = {
      id: newProj._id || newProj.id,
      title: newProj.title,
      client: newProj.client_org,
      clientEmail: newProj.client_email,
      leadId: newProj.lead_id,
      assignedLead: leadMember ? leadMember.name : "Lead",
      editorIds: newProj.editor_ids || [],
      currentVersion: newProj.version || "V1",
      status: "Client Feedback In Progress",
      progressPercent: 25,
      totalPins: 0,
      resolvedPins: 0,
      milestoneAmount: amount,
      isPaid: false,
      dueDate: new Date().toLocaleDateString()
    };

    setProjects((prev) => [formattedProj, ...prev]);

    const newRev = {
      id: `rev-${Date.now()}`,
      client: newProj.client_org,
      project: newProj.title,
      milestone: "Initial Deposit / Milestone 1",
      amount: amount,
      dueDate: new Date().toLocaleDateString(),
      paidDate: "Settled",
      status: "Pending"
    };

    setRevenueList((prev) => [newRev, ...prev]);

    setStats((prev) => ({
      ...prev,
      totalActiveProjects: prev.totalActiveProjects + 1,
      pendingInvoicesCount: prev.pendingInvoicesCount + 1,
      pendingRevenue: prev.pendingRevenue + amount
    }));

    return formattedProj;
  };

  // MUTATION 2: Invite Team Member
  const inviteTeamMember = async ({ full_name, email, job_title, access_level }) => {
    const newMemberRes = await api.post("/api/team/invite", {
      full_name,
      email,
      job_title,
      access_level
    });

    const initials = full_name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const formattedMember = {
      id: newMemberRes._id || newMemberRes.id,
      name: newMemberRes.full_name,
      email: newMemberRes.email,
      role: newMemberRes.job_title,
      accessLevel: newMemberRes.access_level,
      avatar: initials || "TM",
      activeProjects: [],
      workload: "0/3 Projects",
      status: "Available"
    };

    setTeamMembers((prev) => [formattedMember, ...prev]);
    return formattedMember;
  };

  // MUTATION 3: Assign Editor to Project
  const assignEditor = async (projectId, memberId) => {
    await api.patch(`/api/projects/${projectId}/assign`, { user_id: memberId });

    setProjects((prevProjects) =>
      prevProjects.map((p) => {
        if (p.id === projectId) {
          const updatedEditorIds = p.editorIds.includes(memberId) ? p.editorIds : [...p.editorIds, memberId];
          return { ...p, editorIds: updatedEditorIds };
        }
        return p;
      })
    );

    setTeamMembers((prevMembers) => {
      const targetProj = projects.find((p) => p.id === projectId);
      const projTitle = targetProj ? targetProj.title : "";

      return prevMembers.map((m) => {
        if (m.id === memberId && projTitle && !m.activeProjects.includes(projTitle)) {
          const updatedProjs = [...m.activeProjects, projTitle];
          return {
            ...m,
            activeProjects: updatedProjs,
            workload: `${updatedProjs.length}/3 Projects`,
            status: updatedProjs.length > 2 ? "Busy" : "Active"
          };
        }
        return m;
      });
    });
  };

  // MUTATION 4: Unassign Editor from Project
  const unassignEditor = async (projectId, memberId) => {
    await api.patch(`/api/projects/${projectId}/unassign`, { user_id: memberId });

    setProjects((prevProjects) =>
      prevProjects.map((p) => {
        if (p.id === projectId) {
          return { ...p, editorIds: p.editorIds.filter((id) => id !== memberId) };
        }
        return p;
      })
    );

    setTeamMembers((prevMembers) => {
      const targetProj = projects.find((p) => p.id === projectId);
      const projTitle = targetProj ? targetProj.title : "";

      return prevMembers.map((m) => {
        if (m.id === memberId && projTitle) {
          const updatedProjs = m.activeProjects.filter((t) => t !== projTitle);
          return {
            ...m,
            activeProjects: updatedProjs,
            workload: `${updatedProjs.length}/3 Projects`,
            status: updatedProjs.length > 2 ? "Busy" : updatedProjs.length > 0 ? "Active" : "Available"
          };
        }
        return m;
      });
    });
  };

  // MUTATION 5: Update Agency Name
  const updateAgencyName = async (newName) => {
    if (!userProfile?.agency_id) return;
    const updatedAgency = await api.patch(`/api/agencies/${userProfile.agency_id}`, { name: newName });
    setUserProfile((prev) => ({
      ...prev,
      agency_name: updatedAgency.name
    }));
    return updatedAgency;
  };

  // MUTATION 6: Change Password via Supabase
  const changePassword = async (currentPassword, newPassword) => {
    if (!userProfile?.email) {
      throw new Error("User email not available for authentication check.");
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userProfile.email,
      password: currentPassword
    });

    if (signInError) {
      throw new Error("Current password is incorrect.");
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      throw new Error(updateError.message);
    }

    return true;
  };

  return (
    <DashboardContext.Provider
      value={{
        userProfile,
        stats,
        teamMembers,
        projects,
        history,
        revenueList,
        notifications,
        loading,
        error,
        createProject,
        inviteTeamMember,
        assignEditor,
        unassignEditor,
        updateAgencyName,
        changePassword,
        markNotificationRead,
        markAllNotificationsRead,
        resetContextState,
        refetch: fetchDashboardData
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
