import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useMotionValue, useTransform, animate, useSpring } from "framer-motion";
import { AlertTriangle, CheckCircle2, Check } from "lucide-react";
import { Button } from "./ui/button";

export default function RevisionSection() {
  const containerRef = useRef(null);
  const lastScrollRef = useRef(0);

  // Track scroll position of the entire section wrapper
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const [activeView, setActiveView] = useState("chaos");
  const [isManual, setIsManual] = useState(false);

  // Unified animation progress: 0.0 (full Chaos) to 1.0 (full Clarity)
  const wheelProgress = useMotionValue(0);

  // Smooth progress wrapper to filter raw scroll increments
  const smoothProgress = useSpring(wheelProgress, {
    stiffness: 100,
    damping: 25,
    mass: 0.5
  });

  // Card 1 (WhatsApp Chaos) animations mapped to smoothProgress:
  const chaosScale = useTransform(smoothProgress, [0, 1], [1, 0.88]);
  const chaosY = useTransform(smoothProgress, [0, 1], [0, -36]);
  const chaosZ = useTransform(smoothProgress, [0, 1], [0, -220]);
  const chaosRotateX = useTransform(smoothProgress, [0, 1], [0, -10]);
  const chaosOpacity = useTransform(smoothProgress, [0, 0.5, 1], [1, 1, 0]);
  const chaosFilter = useTransform(smoothProgress, [0, 1], ["blur(0px)", "blur(4px)"]);
  const chaosZIndex = useTransform(smoothProgress, [0, 0.5, 0.501, 1], [20, 20, 10, 10]);

  // Card 2 (FrameReview Clarity) animations mapped to smoothProgress:
  const clarityScale = useTransform(smoothProgress, [0, 1], [0.88, 1]);
  const clarityY = useTransform(smoothProgress, [0, 1], [48, 0]);
  const clarityZ = useTransform(smoothProgress, [0, 1], [-220, 0]);
  const clarityRotateX = useTransform(smoothProgress, [0, 1], [10, 0]);
  const clarityOpacity = useTransform(smoothProgress, [0, 1], [0, 1]);
  const clarityFilter = useTransform(smoothProgress, [0, 1], ["blur(4px)", "blur(0px)"]);
  const clarityZIndex = useTransform(smoothProgress, [0, 0.5, 0.501, 1], [10, 10, 20, 20]);

  // Sync scrollYProgress to wheelProgress
  useEffect(() => {
    const handleScroll = (latest) => {
      // Release manual override if user scrolls more than 4% away from click point
      if (isManual && Math.abs(latest - lastScrollRef.current) > 0.04) {
        setIsManual(false);
      }

      if (!isManual) {
        // Calibration thresholds matching LandingPage layout stay-times
        if (latest < 0.40) {
          wheelProgress.set(0);
          setActiveView("chaos");
        } else if (latest > 0.80) {
          wheelProgress.set(1);
          setActiveView("clarity");
        } else {
          const progress = (latest - 0.40) / 0.40;
          wheelProgress.set(progress);
          setActiveView(progress < 0.5 ? "chaos" : "clarity");
        }
      }
    };

    return scrollYProgress.on("change", handleScroll);
  }, [scrollYProgress, isManual, wheelProgress]);

  // Manual click override handler with cubic-bezier ease out curve
  const handleManualToggle = (view) => {
    setIsManual(true);
    setActiveView(view);
    lastScrollRef.current = scrollYProgress.get();

    const targetVal = view === "chaos" ? 0 : 1;

    animate(wheelProgress, targetVal, { 
      duration: 0.7, 
      ease: [0.22, 1, 0.36, 1]
    });
  };

  return (
    <section 
      ref={containerRef}
      id="comparison" 
      className="h-[300vh] relative w-full block clear-both bg-[#0B0F17]"
    >
      {/* Absolute locked viewport sticky container */}
      <div className="sticky top-0 left-0 h-screen w-full flex flex-col justify-between items-center overflow-hidden z-40 bg-[#0B0F17] px-6 sm:px-8 py-16">
        <div className="max-w-7xl mx-auto w-full flex flex-col items-center h-full justify-between">
          
          {/* Section Header Elements */}
          <div className="flex flex-col items-center text-center space-y-3 max-w-2xl shrink-0">
            <span className="text-xs uppercase tracking-widest font-mono font-bold text-[#22C55E] bg-[#22C55E]/10 px-3 py-1 rounded-full border border-[#22C55E]/20">
              Interactive Card Stack
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              How FrameReview Streamlines Revisions
            </h2>
            <p className="text-slate-400 text-sm">
              Scroll down to watch the FrameReview card slide up and stack over the WhatsApp workspace.
            </p>
          </div>

          {/* Toggle Buttons Row */}
          <div className="inline-flex p-1 rounded-xl bg-[#1A1B23] border border-white/5 z-50 shrink-0 my-4">
            <button
              onClick={() => handleManualToggle("chaos")}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeView === "chaos"
                  ? "bg-red-500/10 text-red-400 border border-red-500/20 shadow-inner"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              WhatsApp Mess (The Chaos)
            </button>
            <button
              onClick={() => handleManualToggle("clarity")}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeView === "clarity"
                  ? "bg-emerald-500/10 text-[#22C55E] border border-emerald-500/20 shadow-inner"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              FrameReview (The Clarity)
            </button>
          </div>

          {/* Centered Perspective Container */}
          <div className="w-full flex justify-center [perspective:1200px] flex-1 items-center relative mt-2">
            <div className="relative w-full max-w-5xl h-[420px] [transform-style:preserve-3d]">
              
              {/* CARD 1: WhatsApp Chaos */}
              <motion.div
                style={{
                  scale: chaosScale,
                  y: chaosY,
                  z: chaosZ,
                  rotateX: chaosRotateX,
                  opacity: chaosOpacity,
                  filter: chaosFilter,
                  zIndex: chaosZIndex,
                  transformStyle: "preserve-3d",
                  pointerEvents: activeView === "chaos" ? "auto" : "none",
                  willChange: "transform, opacity"
                }}
                className="absolute inset-0 w-full h-full rounded-3xl p-6 sm:p-8 bg-[#161314]/95 border border-red-500/10 shadow-[0_0_50px_rgba(239,68,68,0.03)] flex flex-col md:flex-row gap-6 sm:gap-8 items-stretch"
              >
                <div className="flex-1 flex flex-col justify-between text-left h-full">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-semibold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-md border border-red-500/15">
                      Legacy Workflow
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mt-3 tracking-tight">
                      The WhatsApp Revision Nightmare
                    </h3>
                    <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                      Feedback is sprayed across WhatsApp text notes, email lists, Google Drive links, and phone calls. Real-time feedback gets lost, versions get mixed up, and production timelines collapse.
                    </p>
                  </div>
                  
                  <div className="space-y-2 mt-2 text-xs text-slate-300 font-sans">
                    <div className="flex items-start gap-2.5">
                      <span className="text-red-400 font-bold text-xs shrink-0 mt-0.5">✕</span>
                      <span>Generic time stamps ("around 1:12") are inaccurate and hard to match.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="text-red-400 font-bold text-xs shrink-0 mt-0.5">✕</span>
                      <span>Zero security locks: clients download raw exports and vanish.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="text-red-400 font-bold text-xs shrink-0 mt-0.5">✕</span>
                      <span>File versions like `master_edit_v2_final_revised.mp4` cause confusion.</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 rounded-2xl bg-[#231F20]/50 border border-red-500/5 p-4 flex flex-col gap-3 text-left h-full overflow-hidden">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-2 shrink-0">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xs font-mono">W</div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-white">Client WhatsApp Chat</p>
                      <p className="text-[10px] text-red-400/80 font-mono">3 unsaved files shared</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto pr-1 text-[11px]">
                    <div className="bg-[#2A2627] p-2.5 rounded-lg border border-red-900/10 max-w-[85%] self-start">
                      <p className="text-[9px] text-red-400 font-semibold">Sarah (Client) • 10:14 AM</p>
                      <p className="text-slate-300 mt-0.5">Hey, can we change the intro music track? It's too upbeat. Also check out the clip around 1:15, looks too dark.</p>
                    </div>
                    <div className="bg-[#1D2B22] p-2.5 rounded-lg border border-[#22C55E]/10 max-w-[85%] self-end">
                      <p className="text-[9px] text-emerald-400 font-semibold">Alex (Editor) • 10:20 AM</p>
                      <p className="text-slate-300 mt-0.5">Sure. Which intro music track did you want? I sent 3 options on Slack last week. I'll check 1:15.</p>
                    </div>
                    <div className="bg-[#2A2627] p-2.5 rounded-lg border border-red-900/10 max-w-[85%] self-start">
                      <p className="text-[9px] text-red-400 font-semibold">Sarah (Client) • 11:05 AM</p>
                      <p className="text-slate-300 mt-0.5">Actually wait, let me download the file first, is this the link to the version from yesterday? No, the other link in our email thread.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 border-t border-white/5 pt-2 shrink-0">
                    <input 
                      disabled
                      placeholder="WhatsApp chat limits structure..." 
                      className="bg-white/5 border-none rounded-lg text-xs p-2 flex-1 text-slate-500 cursor-not-allowed"
                    />
                    <Button disabled size="sm" className="bg-red-500/10 text-red-400 border border-red-500/20 h-8 text-xs">Send</Button>
                  </div>
                </div>
              </motion.div>

              {/* CARD 2: FrameReview Clarity */}
              <motion.div
                style={{
                  scale: clarityScale,
                  y: clarityY,
                  z: clarityZ,
                  rotateX: clarityRotateX,
                  opacity: clarityOpacity,
                  filter: clarityFilter,
                  zIndex: clarityZIndex,
                  transformStyle: "preserve-3d",
                  pointerEvents: activeView === "clarity" ? "auto" : "none",
                  willChange: "transform, opacity"
                }}
                className="absolute inset-0 w-full h-full rounded-3xl p-6 sm:p-8 bg-[#111613]/95 border border-emerald-500/10 shadow-[0_0_50px_rgba(34,197,94,0.03)] flex flex-col md:flex-row gap-6 sm:gap-8 items-stretch"
              >
                <div className="flex-1 flex flex-col justify-between text-left h-full">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-semibold text-[#22C55E] bg-[#22C55E]/10 px-2.5 py-1 rounded-md border border-[#22C55E]/15">
                      FrameReview Pipeline
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mt-3 tracking-tight">
                      Unified Video Timeline Clarity
                    </h3>
                    <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                      All feedback is pinned to the exact frame where it occurs. Version histories stack sequentially under automated media locks. Clients see changes in real time, sign off, and pay invoices instantly.
                    </p>
                  </div>
                  
                  <div className="space-y-2 mt-2 text-xs text-slate-300 font-sans">
                    <div className="flex items-start gap-2.5">
                      <span className="text-[#22C55E] font-bold text-xs shrink-0 mt-0.5">✓</span>
                      <span>Clients click the video playhead to drop localized comments.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="text-[#22C55E] font-bold text-xs shrink-0 mt-0.5">✓</span>
                      <span>Milestone gate checks: high-res files stay locked until payment clearances.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="text-[#22C55E] font-bold text-xs shrink-0 mt-0.5">✓</span>
                      <span>Structured version history layout keeps files organized automatically.</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 rounded-2xl bg-[#131F18]/50 border border-[#22C55E]/5 p-4 flex flex-col gap-3 text-left h-full overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-[#22C55E] font-bold text-xs font-mono">FR</div>
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-white">Review Workspace</p>
                        <p className="text-[10px] text-emerald-400 font-mono">Synced • Live Timeline</p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-[#22C55E]/10 text-[#22C55E] px-2 py-0.5 rounded border border-[#22C55E]/20">Version 3.0</span>
                  </div>

                  <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto pr-1">
                    <div className="bg-[#1A1B23]/70 p-3 rounded-xl border border-white/5 flex gap-2.5 hover:border-[#22C55E]/25 transition-colors shrink-0">
                      <span className="text-[9px] font-mono bg-slate-800 text-slate-300 h-fit px-1.5 py-0.5 rounded">0:14</span>
                      <div className="flex-1 text-[11px]">
                        <p className="font-bold text-white">Sarah (Client) <span className="text-slate-500 font-normal">yesterday</span></p>
                        <p className="text-slate-300 mt-0.5">"The exposure here needs a slight adjustment, looks slightly dark."</p>
                        <span className="text-[8px] bg-emerald-500/10 text-[#22C55E] px-1.5 py-0.5 rounded border border-emerald-500/20 inline-flex items-center gap-0.5 mt-1 font-mono">
                          <Check className="w-2.5 h-2.5" /> Resolved in V2
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#1A1B23]/70 p-3 rounded-xl border border-white/5 flex gap-2.5 hover:border-[#22C55E]/25 transition-colors shrink-0">
                      <span className="text-[9px] font-mono bg-slate-800 text-slate-300 h-fit px-1.5 py-0.5 rounded">0:45</span>
                      <div className="flex-1 text-[11px]">
                        <p className="font-bold text-white">Sarah (Client) <span className="text-slate-500 font-normal">2h ago</span></p>
                        <p className="text-slate-300 mt-0.5">"Excellent color grading here, intro music fits perfectly now!"</p>
                        <span className="text-[8px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 inline-flex items-center gap-0.5 mt-1">
                          Approved
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              
            </div>
          </div>

          {/* Bottom structural space inside screen to avoid footer crashing */}
          <div className="h-4 shrink-0" />

        </div>
      </div>
    </section>
  );
}