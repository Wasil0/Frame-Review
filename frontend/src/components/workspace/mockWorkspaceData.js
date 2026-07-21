// TODO: replace with API calls to Supabase / backend endpoints
export const mockWorkspaceProject = {
  id: "proj-101",
  title: "Aether Tech Commercial Cut V1",
  client: "Vanguard Media Studios",
  clientEmail: "david@vanguardmedia.com",
  assignedLead: "Alex Rivera",
  assignedLeadEmail: "alex@apexmotion.com",
  currentVersion: "V1",
  advanceAmount: 2500,
  advancePaid: true,
  milestoneAmount: 6500,
  milestonePaid: false,
  status: "In Client Review",
  videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  videoDuration: 270, // 4:30 in seconds
  masterDownloadUrl: "https://framereview.app/downloads/aether_4k_master.mp4",

  teamMembers: [
    { name: "Alex Rivera", role: "Lead Editor", email: "alex@apexmotion.com" },
    { name: "Sarah Jenkins", role: "Motion Designer", email: "sarah@apexmotion.com" },
    { name: "Marcus Vance", role: "Colorist", email: "marcus@apexmotion.com" },
    { name: "Elena Rostova", role: "VFX Supervisor", email: "elena@apexmotion.com" }
  ],

  versions: [
    { version: "V1", date: "Jul 18, 2026", status: "Active Review", isCurrent: true },
    { version: "V2 (Draft)", date: "Jul 20, 2026", status: "In Progress", isCurrent: false }
  ],

  // Raw Client Comments (Client Review Tab)
  clientComments: [
    {
      id: "cc-gen-1",
      timestamp: null,
      formattedTime: null,
      author: "David Vance (Client)",
      role: "Client",
      avatar: "DV",
      text: "Hey team, excited to review the V1 cut today! Overall tone is great.",
      createdAt: "6 hours ago",
      isActionable: false,
      hasTaskCreated: false,
      replies: []
    },
    {
      id: "cc-1",
      timestamp: 42, // 00:42
      formattedTime: "00:42",
      author: "David Vance (Client)",
      role: "Client",
      avatar: "DV",
      text: "The color transition here feels a bit abrupt. Can we smooth out the color grading gradient into the product shot?",
      createdAt: "2 hours ago",
      isActionable: true,
      hasTaskCreated: true,
      taskId: "task-1",
      replies: [
        {
          id: "rep-1",
          author: "Alex Rivera (Lead)",
          role: "Lead",
          avatar: "AR",
          text: "Thanks David! I've assigned our colorist Marcus to smooth the cross-fade curve.",
          createdAt: "1 hour ago"
        }
      ]
    },
    {
      id: "cc-2",
      timestamp: 75, // 01:15
      formattedTime: "01:15",
      author: "David Vance (Client)",
      role: "Client",
      avatar: "DV",
      text: "Can we boost the audio mix level on the voiceover here? The background synth track is masking the voice.",
      createdAt: "3 hours ago",
      isActionable: true,
      hasTaskCreated: true,
      taskId: "task-2",
      replies: []
    },
    {
      id: "cc-3",
      timestamp: 150, // 02:30
      formattedTime: "02:30",
      author: "David Vance (Client)",
      role: "Client",
      avatar: "DV",
      text: "Logo placement in the lower right looks great! Perfectly aligned with brand guidelines.",
      createdAt: "4 hours ago",
      isActionable: true,
      hasTaskCreated: false,
      replies: [
        {
          id: "rep-2",
          author: "Alex Rivera (Lead)",
          role: "Lead",
          avatar: "AR",
          text: "Appreciate the feedback David!",
          createdAt: "3 hours ago"
        }
      ]
    },
    {
      id: "cc-4",
      timestamp: 190, // 03:10
      formattedTime: "03:10",
      author: "David Vance (Client)",
      role: "Client",
      avatar: "DV",
      text: "End card call-to-action text has a minor typo: 'Excellence' is missing an 'e'.",
      createdAt: "5 hours ago",
      isActionable: true,
      hasTaskCreated: true,
      taskId: "task-3",
      replies: []
    }
  ],

  // Internal Actionable Tasks (Internal Team Tab)
  internalTasks: [
    {
      id: "task-1",
      linkedCommentId: "cc-1",
      timestamp: 42,
      formattedTime: "00:42",
      title: "Smooth out color grade transition",
      instruction: "Adjust cross-fade gamma curve at 00:42 product shot transition per client note.",
      assignedEditor: "Marcus Vance",
      status: "In Progress", // Open | In Progress | Ready for Review | Resolved | Reopened
      rejectionNote: null,
      internalFiles: [
        {
          id: "file-101",
          name: "aether_color_v2_draft.mp4",
          size: "45.2 MB",
          uploader: "Marcus Vance",
          uploadedAt: "30 mins ago"
        }
      ]
    },
    {
      id: "task-2",
      linkedCommentId: "cc-2",
      timestamp: 75,
      formattedTime: "01:15",
      title: "Boost voiceover audio stem (+3dB)",
      instruction: "Dip background synth stem by -2dB and boost voiceover EQ clarity at 01:15.",
      assignedEditor: "Sarah Jenkins",
      status: "Open",
      rejectionNote: null,
      internalFiles: []
    },
    {
      id: "task-3",
      linkedCommentId: "cc-4",
      timestamp: 190,
      formattedTime: "03:10",
      title: "Fix end card typography typo",
      instruction: "Correct 'Excellence' spelling on end card CTA motion graphics.",
      assignedEditor: "Elena Rostova",
      status: "Resolved",
      resolvedBy: "Alex Rivera",
      rejectionNote: null,
      internalFiles: [
        {
          id: "file-102",
          name: "cta_endcard_v2_corrected.mov",
          size: "128.4 MB",
          uploader: "Elena Rostova",
          uploadedAt: "1 hour ago"
        }
      ]
    }
  ],

  // Free-flowing Team Discussion Feed (Internal Team Tab)
  teamDiscussion: [
    {
      id: "disc-1",
      author: "Alex Rivera (Lead)",
      role: "Lead",
      avatar: "AR",
      timestamp: null,
      formattedTime: null,
      text: "Team, client requested a quick turn on the audio mix and color tweaks today. Let's prioritize V2 export.",
      createdAt: "3 hours ago",
      hasTaskCreated: false
    },
    {
      id: "disc-2",
      author: "Sarah Jenkins (Editor)",
      role: "Editor",
      avatar: "SJ",
      timestamp: 75,
      formattedTime: "01:15",
      text: "Checking the audio stems at 01:15. I can duck the synth line by 3dB so the VO pops.",
      createdAt: "2 hours ago",
      hasTaskCreated: true
    }
  ]
};
