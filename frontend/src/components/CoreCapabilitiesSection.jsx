import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  MessageSquare,
  CreditCard,
  Layers,
  Download,
  Lock,
  Unlock,
  Loader2,
  Check
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";

export default function CoreCapabilitiesSection() {
  const sectionRef = useRef(null);
  
  // Trigger autoplay only the first time the section enters 50% visibility in viewport
  const isInView = useInView(sectionRef, { amount: 0.5, once: true });

  // Card 3 state and autoplay
  const [activeVersion, setActiveVersion] = useState("V1");
  const [card3Autoplay, setCard3Autoplay] = useState(true);

  // Card 2 state and autoplay
  const [paymentState, setPaymentState] = useState("pending"); // "pending" | "verifying" | "paid"
  const [card2Autoplay, setCard2Autoplay] = useState(true);

  const versionData = {
    V1: {
      fileName: "client_promo_draft_v1.mp4",
      fileSize: "412.4 MB",
      status: "Feedback Received",
      statusColor: "text-amber-400 bg-amber-400/10 border-amber-400/20",
      comments: [
        { time: "0:04", author: "Sarah (Client)", text: "The opening exposure is too high. Can we dim it?" },
        { time: "0:22", author: "Sarah (Client)", text: "Music transition feels a bit sudden here." }
      ]
    },
    V2: {
      fileName: "client_promo_draft_v2_final.mp4",
      fileSize: "415.8 MB",
      status: "Revisions Uploaded",
      statusColor: "text-blue-400 bg-blue-400/10 border-blue-400/20",
      comments: [
        { time: "0:04", author: "Alex (Editor)", text: "Exposure reduced by 15%." },
        { time: "0:22", author: "Alex (Editor)", text: "Smoothed out audio transition." },
        { time: "0:45", author: "Sarah (Client)", text: "Love this! Just one small color correction at the end." }
      ]
    },
    V3: {
      fileName: "client_promo_v3_master_4k.mp4",
      fileSize: "1.2 GB",
      status: "Approved",
      statusColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
      comments: [
        { time: "0:45", author: "Alex (Editor)", text: "Color graded end shot." },
        { time: "0:50", author: "Sarah (Client)", text: "This is perfect! Stamped & approved." }
      ]
    }
  };

  // Card 3 (Version Control) Autoplay sequence (Looping)
  useEffect(() => {
    if (!isInView || !card3Autoplay) return;

    let t1, t2, t3;

    const runCycle = () => {
      t1 = setTimeout(() => {
        setActiveVersion("V2");
        t2 = setTimeout(() => {
          setActiveVersion("V3");
          t3 = setTimeout(() => {
            setActiveVersion("V1");
            runCycle();
          }, 3000); // V3 hold of 3 seconds
        }, 2800); // V2 hold of 2.8 seconds
      }, 2800); // V1 hold of 2.8 seconds
    };

    runCycle();

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isInView, card3Autoplay]);

  // Card 2 (Milestone Payment) Autoplay sequence (Staggered & Looping)
  useEffect(() => {
    if (!isInView || !card2Autoplay) return;

    let t1, t2, t3;

    const runCycle = () => {
      t1 = setTimeout(() => {
        setPaymentState("verifying");
        t2 = setTimeout(() => {
          setPaymentState("paid");
          t3 = setTimeout(() => {
            setPaymentState("pending");
            runCycle();
          }, 3000); // Paid hold of 3 seconds before resetting
        }, 1800); // Verifying hold of 1.8 seconds
      }, 2000); // Pending hold of 2 seconds
    };

    // Stagger start by 800ms
    const staggerTimeout = setTimeout(() => {
      runCycle();
    }, 800);

    return () => {
      clearTimeout(staggerTimeout);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isInView, card2Autoplay]);

  // Handle Version Manual Click (Pauses Autoplay)
  const handleVersionClick = (v) => {
    setCard3Autoplay(false);
    setActiveVersion(v);
  };

  // Handle Verify Payment Manual Click (Pauses Autoplay)
  const handleVerifyPayment = () => {
    setCard2Autoplay(false);
    setPaymentState("verifying");
    setTimeout(() => {
      setPaymentState("paid");
    }, 1200);
  };

  // Handle Reset Payment Manual Click (Pauses Autoplay)
  const handleResetPayment = () => {
    setCard2Autoplay(false);
    setPaymentState("pending");
  };

  return (
    <section ref={sectionRef} id="features" className="py-20 px-6 sm:px-8 max-w-7xl mx-auto">
      {/* 3. Sub-headline centering fix */}
      <div className="text-center flex flex-col items-center justify-center space-y-4 mb-16 w-full">
        <span className="text-xs uppercase tracking-widest font-bold text-[#22C55E] bg-[#22C55E]/10 px-3 py-1 rounded-full border border-[#22C55E]/20 w-fit">
          Core Capabilities
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-4">
          Designed for Enterprise Scale
        </h2>
        <p className="text-slate-400 max-w-2xl text-center mt-2 leading-relaxed">
          Deploy our modular client portal features to protect project quality and secure cash flows automatically.
        </p>
      </div>

      {/* Symmetrically Aligned Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        
        {/* PILLAR 1: Contextual Video Chat */}
        <Card className="bg-[#12131A] border-white/5 hover:border-emerald-500/20 transition-all duration-300 flex flex-col justify-between overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#22C55E]/5 blur-2xl group-hover:bg-[#22C55E]/10 transition-colors" />
          
          <CardHeader className="p-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-[#22C55E] mb-4">
              <MessageSquare className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl font-bold text-white">Contextual Video Chat</CardTitle>
            <CardDescription className="text-slate-400 text-sm mt-2 leading-relaxed">
              No more messy bulleted lists. Clients click directly on the video timeline to place comments on precise timestamps.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-6 pt-2">
            {/* Visual Widget Demo for Card */}
            <div className="bg-[#1A1B23] border border-white/5 rounded-xl p-4 flex flex-col gap-3 text-left">
              <div className="flex justify-between items-center text-[10px] text-slate-400 pb-2 border-b border-white/5">
                <span>TIMELINE FEEDBACK LOG</span>
                <span className="text-[#22C55E] font-mono font-bold">0:14 / 1:30</span>
              </div>
              <div className="flex gap-2.5 items-start">
                <div className="w-6 h-6 rounded-full bg-[#22C55E]/15 border border-emerald-500/25 flex items-center justify-center text-[#22C55E] text-[10px] font-bold shrink-0">
                  S
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-white">Sarah J. <span className="text-slate-500 font-normal">Client</span></p>
                  <p className="text-xs text-slate-300 mt-0.5">"The transition is too slow here. Crop 2 frames."</p>
                </div>
              </div>
              <div className="flex gap-2 border-t border-white/5 pt-2">
                <input 
                  disabled
                  placeholder="Reply to this comment..." 
                  className="bg-white/5 border-none rounded p-1.5 text-[10px] flex-1 text-slate-500 cursor-not-allowed"
                />
                <Button disabled size="sm" className="bg-[#22C55E] text-[#090A0F] text-[10px] h-6 px-2.5">Send</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PILLAR 2: Milestone Payment Gateways */}
        <Card className="bg-[#12131A] border-white/5 hover:border-emerald-500/20 transition-all duration-300 flex flex-col justify-between overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/[0.03] blur-2xl group-hover:bg-[#22C55E]/10 transition-colors" />
          
          <CardHeader className="p-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-[#22C55E] mb-4">
              <CreditCard className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl font-bold text-white">Milestone Payment Gateways</CardTitle>
            <CardDescription className="text-slate-400 text-sm mt-2 leading-relaxed">
              Lock high-res downloads automatically until milestone invoices are paid. Enforce security constraints seamlessly.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-6 pt-2">
            {/* INTERACTIVE MOCK GATEWAY */}
            <div className="bg-[#1A1B23] border border-white/5 rounded-xl p-4 flex flex-col gap-4 text-left [perspective:800px]">
              <div className="flex justify-between items-center text-[10px] text-slate-400 shrink-0">
                <span>MILESTONE PAYMENT CHECK</span>
                <span className="font-mono text-slate-400 font-bold">$1,200.00</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={paymentState}
                  initial={{ opacity: 0, z: -200, scale: 0.9, y: 20, rotateX: 6, filter: "blur(4px)" }}
                  animate={{ opacity: 1, z: 0, scale: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, z: -200, scale: 0.9, y: -20, rotateX: -6, filter: "blur(4px)" }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#090A0F]/50 border border-white/5 [transform-style:preserve-3d]"
                >
                  <div className="flex items-center gap-2">
                    {paymentState === "paid" ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-[#22C55E]">
                        <Unlock className="w-3.5 h-3.5" />
                      </div>
                    ) : paymentState === "verifying" ? (
                      <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div>
                      <p className="text-[11px] font-bold text-white">
                        {paymentState === "paid"
                          ? "Download Unlocked"
                          : paymentState === "verifying"
                          ? "Verifying Funds..."
                          : "Deliverable Locked"}
                      </p>
                      <p className="text-[9px] text-slate-500">
                        {paymentState === "paid"
                          ? "Invoice settled successfully"
                          : paymentState === "verifying"
                          ? "Checking transaction ledger"
                          : "Awaiting payment verification"}
                      </p>
                    </div>
                  </div>
                  {paymentState === "paid" ? (
                    <span className="text-[10px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded font-bold font-mono">
                      PAID
                    </span>
                  ) : paymentState === "verifying" ? (
                    <span className="text-[10px] text-blue-400 bg-blue-400/10 border border-blue-500/20 px-2 py-0.5 rounded font-bold font-mono animate-pulse">
                      VERIFYING
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded font-bold font-mono">
                      PENDING
                    </span>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* 1. Button row layout alignment fix */}
              <div className="flex flex-row items-center gap-2 w-full shrink-0">
                <div className="flex-1">
                  {paymentState === "paid" ? (
                    <Button
                      onClick={handleResetPayment}
                      className="w-full text-xs py-4 border border-white/10 bg-[#12131A] text-slate-400 hover:bg-white hover:text-[#090A0F] transition-colors duration-200"
                    >
                      Reset Demo
                    </Button>
                  ) : (
                    <Button
                      disabled={paymentState === "verifying"}
                      onClick={handleVerifyPayment}
                      className="w-full text-xs py-4 bg-[#22C55E] text-[#090A0F] hover:bg-[#22C55E]/90 font-bold active:scale-95 transition-all"
                    >
                      {paymentState === "verifying" ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1 text-[#090A0F]" />
                          Verifying...
                        </>
                      ) : (
                        "Simulate Client Payment"
                      )}
                    </Button>
                  )}
                </div>
                
                <Button 
                  disabled={paymentState !== "paid"} 
                  className={`text-xs px-3.5 py-4 ${
                    paymentState === "paid" 
                      ? "bg-slate-100 text-[#090A0F] hover:bg-white cursor-pointer" 
                      : "bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5 opacity-55"
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PILLAR 3: Version Control & Media Locks */}
        <Card className="bg-[#12131A] border-white/5 hover:border-emerald-500/20 transition-all duration-300 flex flex-col justify-between overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/[0.03] blur-2xl group-hover:bg-[#22C55E]/10 transition-colors" />
          
          <CardHeader className="p-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-[#22C55E] mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl font-bold text-white">Version Control & Media Locks</CardTitle>
            <CardDescription className="text-slate-400 text-sm mt-2 leading-relaxed">
              Automated version arrays (V1, V2, V3) track feedback progress, locking down high-res delivery streams.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-6 pt-2">
            {/* INTERACTIVE VERSION LIST */}
            <div className="bg-[#1A1B23] border border-white/5 rounded-xl p-4 flex flex-col gap-3 text-left [perspective:800px]">
              {/* Tabs */}
              <div className="flex gap-1.5 p-0.5 rounded-lg bg-[#090A0F]/60 border border-white/5 shrink-0">
                {["V1", "V2", "V3"].map((v) => (
                  <button
                    key={v}
                    onClick={() => handleVersionClick(v)}
                    className={`flex-1 text-[11px] font-bold py-1.5 rounded transition-all ${
                      activeVersion === v
                        ? "bg-slate-800 text-white shadow-sm border border-white/5"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>

              {/* Version content with AnimatePresence depth transitions */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeVersion}
                  initial={{ opacity: 0, z: -200, scale: 0.9, y: 20, rotateX: 6, filter: "blur(4px)" }}
                  animate={{ opacity: 1, z: 0, scale: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, z: -200, scale: 0.9, y: -20, rotateX: -6, filter: "blur(4px)" }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-2 flex-1 [transform-style:preserve-3d]"
                >
                  <div className="flex justify-between items-start">
                    <div className="truncate max-w-[70%]">
                      <p className="text-[11px] font-bold text-white truncate">{versionData[activeVersion].fileName}</p>
                      <p className="text-[9px] text-slate-500 font-mono">{versionData[activeVersion].fileSize}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${versionData[activeVersion].statusColor}`}>
                      {versionData[activeVersion].status}
                    </span>
                  </div>

                  <div className="bg-[#090A0F]/50 rounded-lg p-2 max-h-[75px] overflow-y-auto space-y-1.5 border border-white/5">
                    <p className="text-[9px] text-slate-500 font-semibold border-b border-white/5 pb-1">COMMENTS LOG</p>
                    {versionData[activeVersion].comments.map((comment, index) => (
                      <div key={index} className="text-[10px] leading-relaxed">
                        <span className="text-[#22C55E] font-mono mr-1 font-semibold">{comment.time}</span>
                        <span className="text-slate-400 font-bold">{comment.author}: </span>
                        <span className="text-slate-300">{comment.text}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

      </div>
    </section>
  );
}
