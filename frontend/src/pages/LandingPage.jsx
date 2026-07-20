import React, { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {
  Film,
  ArrowRight,
  Lock,
  Unlock,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Download,
  Play,
  Pause,
  Menu,
  X,
  Sparkles,
  Clock,
  CreditCard,
  Loader2,
  Check,
  ShieldCheck,
  FileVideo,
  Send,
  Plus
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import RevisionSection from "../components/RevisionSection";
import CoreCapabilitiesSection from "../components/CoreCapabilitiesSection";

function InteractiveMesh() {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.15;
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1, 0.35, 128, 16]} />
      <meshPhysicalMaterial
        color="#22C55E"
        roughness={0.1}
        metalness={0.2}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
        transmission={0.9}
        thickness={1.5}
        ior={1.5}
        transparent
        opacity={1}
      />
    </mesh>
  );
}

export default function LandingPage() {
  // Mobile Nav Toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Simulated Async Button Loaders
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [ctaLoading, setCtaLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  // Pillar 2 & 3 states are encapsulated in CoreCapabilitiesSection.jsx

  // Run mock sign up loader
  const handleSignUpClick = () => {
    setSignUpLoading(true);
    setTimeout(() => {
      setSignUpLoading(false);
      alert("Sign Up action simulated successfully! Component is ready for backend API binding.");
    }, 1500);
  };

  // Run mock CTA loader
  const handleCtaClick = () => {
    setCtaLoading(true);
    setTimeout(() => {
      setCtaLoading(false);
      alert("Registration triggered! FrameReview is ready to connect to FastAPI Backend.");
    }, 1500);
  };

  // Payment verify actions are encapsulated in CoreCapabilitiesSection.jsx

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 font-sans antialiased overflow-x-clip selection:bg-[#22C55E]/30 selection:text-white">
      {/* BACKGROUND EFFECTS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-[#22C55E]/5 blur-[120px]" />
        <div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] rounded-full bg-emerald-600/[0.03] blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* 1. GLOBAL NAVIGATION BAR */}
      <header className="sticky top-0 w-full z-50 backdrop-blur-md bg-[#090A0F]/70 border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-20 px-6 sm:px-8">
          {/* Logo / Brand */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#22C55E] to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
              <Film className="w-5 h-5 text-[#090A0F]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-[#22C55E] transition-colors">
              Frame<span className="text-[#22C55E]">Review</span>
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200">
              Features
            </a>
            <a href="#comparison" className="text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200">
              The Workflow
            </a>
            <a href="#pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200">
              Pricing
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-slate-300 hover:text-white hover:bg-white/5 font-medium transition-colors"
            >
              Log In
            </Button>
            <Button
              disabled={signUpLoading}
              onClick={handleSignUpClick}
              className="bg-[#22C55E] text-[#090A0F] hover:bg-[#22C55E]/90 font-bold px-5 py-2.5 rounded-lg shadow-lg shadow-emerald-500/10 active:scale-95 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
            >
              {signUpLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#090A0F]" />
                  Loading...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-white" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-white/5 bg-[#090A0F]/95 backdrop-blur-xl px-6 py-6 absolute top-20 left-0 w-full flex flex-col gap-5 shadow-2xl animate-in slide-in-from-top-4 duration-200">
            <nav className="flex flex-col gap-4">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-slate-300 hover:text-white"
              >
                Features
              </a>
              <a
                href="#comparison"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-slate-300 hover:text-white"
              >
                The Workflow
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-slate-300 hover:text-white"
              >
                Pricing
              </a>
            </nav>
            <hr className="border-white/5" />
            <div className="flex flex-col gap-3">
              <Button
                variant="ghost"
                className="w-full text-slate-300 hover:text-white justify-center py-6"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log In
              </Button>
              <Button
                disabled={signUpLoading}
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignUpClick();
                }}
                className="w-full bg-[#22C55E] text-[#090A0F] hover:bg-[#22C55E]/90 font-bold py-6 justify-center"
              >
                {signUpLoading ? "Creating account..." : "Sign Up"}
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTAINER */}
      <main className="relative z-10">
        
        {/* 2. HERO SECTION (ABOVE THE FOLD - 50/50 SPLIT) */}
        <section className="relative pt-10 pb-20 md:py-24 px-6 sm:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Column (Marketing Architecture) */}
            <div className="flex flex-col space-y-6 text-left">
              {/* Product Release Pill */}
              <div className="inline-flex items-center gap-2 bg-[#22C55E]/10 text-[#22C55E] px-4 py-1.5 rounded-full w-fit border border-[#22C55E]/20 select-none animate-pulse">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider font-semibold">New Client Portal Release</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Stop Chasing Video Feedback on <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-500 line-through">WhatsApp.</span>
              </h1>

              {/* Sub-headline */}
              <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
                A professional client portal for video agencies. Get contextual feedback, manage milestone payments, and deliver projects 2x faster.
              </p>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button
                  disabled={ctaLoading}
                  onClick={handleCtaClick}
                  className="bg-[#22C55E] text-[#090A0F] hover:bg-[#22C55E]/90 font-bold text-base px-8 py-6 rounded-xl shadow-lg shadow-emerald-500/25 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {ctaLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-[#090A0F]" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Get Started for Free
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
                <Button
                  disabled={demoLoading}
                  onClick={() => {
                    setDemoLoading(true);
                    setTimeout(() => {
                      setDemoLoading(false);
                      document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                    }, 800);
                  }}
                  variant="outline"
                  className="border-white/10 bg-[#1A1B23]/40 text-slate-300 hover:text-white hover:bg-white/5 font-bold text-base px-8 py-6 rounded-xl active:scale-95 transition-all duration-200"
                >
                  {demoLoading ? "Loading Features..." : "Explore Capabilities"}
                </Button>
              </div>

              {/* Simple Proof Metrics */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/5 text-slate-400 max-w-md">
                <div>
                  <p className="text-2xl font-bold text-white">2.4x</p>
                  <p className="text-xs uppercase tracking-wider text-slate-500">Faster Review Cycles</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">100%</p>
                  <p className="text-xs uppercase tracking-wider text-slate-500">Milestone Security</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">0</p>
                  <p className="text-xs uppercase tracking-wider text-slate-500">Lost Comments</p>
                </div>
              </div>
            </div>

            {/* Right Column (3D Interactive Frame / Mock Playback Workspace) */}
            <div className="w-full lg:max-w-xl xl:max-w-none">
              <div className="relative w-full aspect-video md:aspect-[4/3] lg:aspect-video rounded-2xl border border-white/10 bg-[#12131A] overflow-hidden shadow-2xl group flex flex-col justify-between">
                
                {/* Simulated Header Bar */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#1A1B23] border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/70" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <span className="w-3 h-3 rounded-full bg-green-500/70" />
                    <span className="text-xs font-mono text-slate-400 ml-2 truncate max-w-[150px]">workspace_v3_draft.mp4</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs bg-emerald-500/10 text-[#22C55E] px-2 py-0.5 rounded border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-ping" />
                    Active Collaboration
                  </div>
                </div>

                {/* Simulated Shader Overlay & Grid for Canvas */}
                <div className="relative flex-1 bg-gradient-to-tr from-emerald-500/[0.04] to-transparent flex items-center justify-center p-8">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:16px_16px]" />
                  
                  {/* React Three Fiber Canvas with Glassmorphic 3D Torus Knot */}
                  <div className="absolute inset-0 w-full h-full z-10">
                    <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
                      <ambientLight intensity={0.5} />
                      <directionalLight position={[5, 5, 5]} intensity={1.5} color="#ffffff" />
                      <pointLight position={[-3, -3, -2]} intensity={2.5} color="#22C55E" />
                      <spotLight position={[0, 10, 0]} intensity={1.5} />
                      <InteractiveMesh />
                      <OrbitControls enableZoom={false} />
                    </Canvas>
                  </div>

                  {/* Floating Mock Comments Over Workspace */}
                  <div className="absolute top-8 left-8 z-20 p-3 bg-[#1A1B23]/90 backdrop-blur border border-white/10 rounded-xl shadow-xl animate-bounce hover:scale-105 transition-all duration-300 select-none hidden sm:block [animation-duration:6s]">
                    <div className="flex items-start gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E] mt-1" />
                      <div>
                        <p className="text-xs font-semibold text-white">Client Comment #12</p>
                        <p className="text-[10px] text-slate-400">"Adjust exposure at 0:14"</p>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-16 right-8 z-20 p-3 bg-[#1A1B23]/90 backdrop-blur border border-white/10 rounded-xl shadow-xl animate-bounce hover:scale-105 transition-all duration-300 select-none hidden sm:block [animation-duration:8s] [animation-delay:2s]">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                      <div>
                        <p className="text-xs font-semibold text-white">Invoice Validated</p>
                        <p className="text-[10px] text-emerald-400">Media unlocked for download</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulated Timeline Interface Footer */}
                <div className="bg-[#1A1B23] border-t border-white/5 p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-3">
                      <Play className="w-4 h-4 text-slate-300 fill-slate-300 cursor-pointer hover:text-white" />
                      <span>00:14 / 01:30</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-500">1080p • 60 FPS</span>
                  </div>
                  {/* Timeline track with interactive indicators */}
                  <div className="relative h-2 w-full bg-slate-800 rounded-full cursor-pointer">
                    <div className="absolute left-0 top-0 h-full w-[25%] bg-[#22C55E] rounded-full" />
                    {/* Active Playhead */}
                    <div className="absolute left-[25%] top-1/2 -translate-y-1/2 w-4.5 h-4.5 bg-white rounded-full border border-emerald-500 shadow-md shadow-emerald-500/50" />
                    {/* Highlighted comments on timeline */}
                    <div className="absolute left-[15%] top-1/2 -translate-y-1/2 w-2 h-2 bg-amber-400 rounded-full ring-4 ring-amber-400/20" />
                    <div className="absolute left-[45%] top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-500 rounded-full" />
                    <div className="absolute left-[70%] top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-500 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </section>

        {/* 3. THE PROBLEM VS SOLUTION VISUAL SEGMENT */}
        <RevisionSection />

        {/* 4. THE THREE PILLARS (KEY ENTERPRISE CAPABILITIES) */}
        <CoreCapabilitiesSection />

        {/* 5. TRUST MATRIX & SOCIAL PROOF FOOTER */}
        <section className="py-16 bg-[#0B0C12] border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="text-center space-y-4 mb-10">
              <p className="text-xs uppercase tracking-widest font-bold text-[#22C55E] font-mono">
                Trusted Collaborative Ecosystem
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Built for Modern Video Creators and Production Houses
              </h2>
            </div>

            {/* Typography placeholders for partner agencies */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-50 max-w-4xl mx-auto mt-6">
              <div className="text-base sm:text-lg font-extrabold tracking-wider font-mono text-slate-400 hover:text-white transition-colors duration-200 select-none">
                VANGUARD.MEDIA
              </div>
              <div className="text-base sm:text-lg font-extrabold tracking-wider font-mono text-slate-400 hover:text-white transition-colors duration-200 select-none">
                AETHER//STUDIOS
              </div>
              <div className="text-base sm:text-lg font-extrabold tracking-wider font-mono text-slate-400 hover:text-white transition-colors duration-200 select-none">
                NOVA.PROD
              </div>
              <div className="text-base sm:text-lg font-extrabold tracking-wider font-mono text-slate-400 hover:text-white transition-colors duration-200 select-none">
                SPECTRUM_AGENCY
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="w-full py-12 border-t border-white/5 bg-[#090A0F] text-slate-500 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#22C55E] flex items-center justify-center">
              <Film className="w-3.5 h-3.5 text-[#090A0F]" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">
              Frame<span className="text-[#22C55E]">Review</span>
            </span>
          </div>

          <nav className="flex gap-8">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Contact Support</a>
          </nav>

          <p className="text-slate-600">
            © {new Date().getFullYear()} FrameReview. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
