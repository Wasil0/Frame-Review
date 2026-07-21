// TODO: replace with API call - Mock dataset for Owner Dashboard UI testing

export const mockOwnerStats = {
  totalActiveProjects: 14,
  totalActiveProjectsGrowth: "+12% vs last month",
  myAssignments: 5,
  myAssignmentsPendingReview: 3,
  pendingRevenue: 18450, // USD
  pendingInvoicesCount: 4,
  currentMonthRevenue: 42800, // USD
  monthlyRevenueTarget: 40000, // USD
  targetProgressPercent: 107
};

export const mockTeamAllocation = [
  {
    id: "emp-1",
    name: "Alex Rivera",
    role: "Lead Editor",
    avatar: "AR",
    activeProjects: ["Aether Commercial 4K", "Vanguard Brand Reel"],
    workload: "Full (2/2)",
    status: "Busy"
  },
  {
    id: "emp-2",
    name: "Sarah Jenkins",
    role: "Senior Motion Designer",
    avatar: "SJ",
    activeProjects: ["Nova Tech Product Launch", "Pulse Fitness Promo"],
    workload: "Full (2/2)",
    status: "Busy"
  },
  {
    id: "emp-3",
    name: "Marcus Vance",
    role: "Colorist & Finishing",
    avatar: "MV",
    activeProjects: ["Aura Music Video Cut", "Zenith Docu-Series"],
    workload: "Optimal (2/3)",
    status: "Active"
  },
  {
    id: "emp-4",
    name: "Elena Rostova",
    role: "VFX Supervisor",
    avatar: "ER",
    activeProjects: ["Hyperion Cinematic Trailer"],
    workload: "Available (1/3)",
    status: "Available"
  },
  {
    id: "emp-5",
    name: "David Chen",
    role: "Sound Designer",
    avatar: "DC",
    activeProjects: ["Spectrum Fashion Campaign"],
    workload: "Available (1/3)",
    status: "Available"
  }
];

export const mockActiveProjects = [
  {
    id: "proj-101",
    title: "Vanguard Global Brand Film 2026",
    client: "Vanguard Media Corp",
    assignedLead: "Alex Rivera",
    currentVersion: "V3",
    status: "Awaiting Milestone Clearance",
    progressPercent: 85,
    totalPins: 24,
    resolvedPins: 21,
    milestoneAmount: 8500,
    isPaid: false,
    dueDate: "Jul 26, 2026"
  },
  {
    id: "proj-102",
    title: "Nova Tech Product Launch Campaign",
    client: "Nova Technologies",
    assignedLead: "Sarah Jenkins",
    currentVersion: "V2",
    status: "Client Feedback In Progress",
    progressPercent: 60,
    totalPins: 16,
    resolvedPins: 10,
    milestoneAmount: 5200,
    isPaid: false,
    dueDate: "Aug 02, 2026"
  },
  {
    id: "proj-103",
    title: "Aether Energy 60s Commercial",
    client: "Aether Energy Systems",
    assignedLead: "Marcus Vance",
    currentVersion: "V3",
    status: "Approved & Deliverable Unlocked",
    progressPercent: 100,
    totalPins: 18,
    resolvedPins: 18,
    milestoneAmount: 12000,
    isPaid: true,
    dueDate: "Jul 18, 2026"
  }
];

export const mockProjectHistory = [
  {
    id: "hist-201",
    title: "Spectrum Fashion SS26 Campaign",
    client: "Spectrum Apparel",
    deliveryDate: "Jul 10, 2026",
    totalEarnings: 14500,
    versionCount: 4,
    status: "Completed & Settled"
  },
  {
    id: "hist-202",
    title: "Zenith Executive Keynote Video",
    client: "Zenith Global",
    deliveryDate: "Jun 28, 2026",
    totalEarnings: 9800,
    versionCount: 2,
    status: "Completed & Settled"
  },
  {
    id: "hist-203",
    title: "Hyperion Product Teaser 4K",
    client: "Hyperion Robotics",
    deliveryDate: "Jun 15, 2026",
    totalEarnings: 18000,
    versionCount: 3,
    status: "Completed & Settled"
  },
  {
    id: "hist-204",
    title: "Aura Summer Festival Aftermovie",
    client: "Aura Entertainment",
    deliveryDate: "May 30, 2026",
    totalEarnings: 11200,
    versionCount: 5,
    status: "Completed & Settled"
  }
];

export const mockRevenueBreakdown = [
  {
    id: "rev-301",
    client: "Vanguard Media Corp",
    project: "Vanguard Global Brand Film 2026",
    milestone: "Final Export Release (Milestone 3)",
    amount: 8500,
    status: "Pending Clearance",
    dueDate: "Jul 26, 2026"
  },
  {
    id: "rev-302",
    client: "Nova Technologies",
    project: "Nova Tech Product Launch Campaign",
    milestone: "Rough Cut Approval (Milestone 2)",
    amount: 5200,
    status: "Pending Clearance",
    dueDate: "Aug 02, 2026"
  },
  {
    id: "rev-303",
    client: "Pulse Athletics",
    project: "Pulse Fitness Promo",
    milestone: "Color Grade Lock (Milestone 2)",
    amount: 4750,
    status: "Pending Clearance",
    dueDate: "Aug 08, 2026"
  },
  {
    id: "rev-304",
    client: "Aether Energy Systems",
    project: "Aether Energy 60s Commercial",
    milestone: "Master Delivery (Milestone 3)",
    amount: 12000,
    status: "Paid",
    paidDate: "Jul 18, 2026"
  }
];
