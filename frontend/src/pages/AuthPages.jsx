import React, { useState } from "react";
import {
  Film,
  CheckCircle2,
  ArrowRight,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Sparkles,
  Check
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { supabase } from "../lib/supabaseClient";

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

export default function AuthPages({ initialTab = "signup" }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Form Field States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Utility States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(null);
  const [authError, setAuthError] = useState(null);

  // Email validation helper
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

  // Password matching validation logic
  const isPasswordMatched = password && confirmPassword && password === confirmPassword;
  const isPasswordMismatched = confirmPassword && password !== confirmPassword;

  // Google OAuth Sign-in
  const handleGoogleAuth = async () => {
    setLoading(true);
    setAuthError(null);
    setAuthSuccess(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) {
        setAuthError(error.message);
        setLoading(false);
      }
    } catch (err) {
      setAuthError(err.message || "An error occurred with Google auth.");
      setLoading(false);
    }
  };

  // Sign Up Submission Handler
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setEmailTouched(true);
    setAuthError(null);
    setAuthSuccess(null);

    if (!isEmailValid || isPasswordMismatched || !fullName || !password || !confirmPassword) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim()
          }
        }
      });

      if (error) {
        let msg = error.message;
        if (msg.toLowerCase().includes("user already registered") || msg.toLowerCase().includes("already registered")) {
          msg = "An account with this email address already exists.";
        }
        setAuthError(msg);
      } else {
        if (data?.session) {
          window.location.hash = "#dashboard";
        } else {
          setAuthSuccess("Account created! Check your email to confirm.");
        }
      }
    } catch (err) {
      setAuthError(err.message || "An unexpected error occurred during sign up.");
    } finally {
      setLoading(false);
    }
  };

  // Sign In Submission Handler
  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setEmailTouched(true);
    setAuthError(null);
    setAuthSuccess(null);

    if (!isEmailValid || !password) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        let msg = error.message;
        if (msg.toLowerCase().includes("invalid login credentials")) {
          msg = "Incorrect email or password.";
        }
        setAuthError(msg);
      } else {
        window.location.hash = "#dashboard";
      }
    } catch (err) {
      setAuthError(err.message || "An unexpected error occurred during sign in.");
    } finally {
      setLoading(false);
    }
  };

  // Reset form when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setAuthSuccess(null);
    setAuthError(null);
    setEmail("");
    setEmailTouched(false);
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="h-[100dvh] w-screen overflow-hidden flex items-center justify-center p-[clamp(0.75rem,2vh,2rem)] bg-[#090A0F] text-slate-100 font-sans antialiased box-border relative selection:bg-[#22C55E]/30 selection:text-white">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#22C55E]/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-emerald-600/5 blur-[120px] pointer-events-none" />

      {/* CENTRAL DUAL-CARD GRID */}
      <div className="w-full max-w-5xl h-full grid grid-cols-1 lg:grid-cols-2 gap-[clamp(0.75rem,2vh,1.75rem)] items-center my-auto relative z-10 min-h-0">
        
        {/* LEFT PANEL (MARKETING SHOWCASE) */}
        <div className="bg-[#12131A] border border-white/5 rounded-2xl p-[clamp(1rem,2.5vh,2rem)] flex flex-col justify-between h-full min-h-0 shadow-2xl relative hidden lg:flex gap-[clamp(0.5rem,1.5vh,1.5rem)]">
          
          {/* Subtle accent glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#22C55E]/5 blur-3xl pointer-events-none" />

          {/* Top Brand Header */}
          <div className="flex items-center justify-between relative z-10 shrink-0">
            <a href="/" className="flex items-center gap-2 group">
              <div className="w-[clamp(1.75rem,3.2vh,2.25rem)] h-[clamp(1.75rem,3.2vh,2.25rem)] rounded-lg bg-[#22C55E] flex items-center justify-center text-[#090A0F] shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Film className="w-[clamp(0.9rem,1.6vh,1.1rem)] h-[clamp(0.9rem,1.6vh,1.1rem)]" />
              </div>
              <span className="font-extrabold text-[clamp(1rem,1.8vh,1.25rem)] tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                Frame<span className="text-[#22C55E]">Review</span>
              </span>
            </a>
            <span className="text-[clamp(0.6rem,1.1vh,0.75rem)] font-semibold px-[clamp(0.5rem,1vh,0.75rem)] py-[clamp(0.15rem,0.4vh,0.25rem)] rounded-full bg-emerald-500/10 text-[#22C55E] border border-emerald-500/20 flex items-center gap-1">
              <Sparkles className="w-[clamp(0.7rem,1.2vh,0.85rem)] h-[clamp(0.7rem,1.2vh,0.85rem)]" /> B2B Client Portal
            </span>
          </div>

          {/* Middle Value Showcase */}
          <div className="flex-1 flex flex-col justify-center min-h-0 my-auto py-1 relative z-10">
            <h1 className="text-[clamp(1.25rem,2.2vh,2.25rem)] font-extrabold tracking-tight text-white leading-tight">
              Start delivering video projects <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22C55E] to-emerald-400">2x faster</span> with FrameReview.
            </h1>
            <p className="text-[clamp(0.7rem,1.3vh,0.85rem)] text-slate-400 leading-relaxed mt-[clamp(0.25rem,0.8vh,0.6rem)]">
              Deploy high-converting, frame-accurate client approval portals in minutes.
            </p>

            {/* Compact Feature Badges List */}
            <div className="space-y-[clamp(0.35rem,1.2vh,0.85rem)] mt-[clamp(0.6rem,1.8vh,1.25rem)] min-h-0">
              <div className="flex items-start gap-2.5">
                <div className="w-[clamp(0.9rem,1.6vh,1.1rem)] h-[clamp(0.9rem,1.6vh,1.1rem)] rounded-full bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E] shrink-0 mt-0.5">
                  <Check className="w-[clamp(0.55rem,1vh,0.7rem)] h-[clamp(0.55rem,1vh,0.7rem)] stroke-[3]" />
                </div>
                <div>
                  <p className="text-[clamp(0.72rem,1.35vh,0.875rem)] font-semibold text-white leading-tight">Frame-Accurate Video Feedback</p>
                  <p className="text-[clamp(0.65rem,1.15vh,0.75rem)] text-slate-400 mt-0.5 leading-tight">Clients drop pinned notes & drawing overlays on exact timestamps.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-[clamp(0.9rem,1.6vh,1.1rem)] h-[clamp(0.9rem,1.6vh,1.1rem)] rounded-full bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E] shrink-0 mt-0.5">
                  <Check className="w-[clamp(0.55rem,1vh,0.7rem)] h-[clamp(0.55rem,1vh,0.7rem)] stroke-[3]" />
                </div>
                <div>
                  <p className="text-[clamp(0.72rem,1.35vh,0.875rem)] font-semibold text-white leading-tight">Automated Milestone Payment Gateways</p>
                  <p className="text-[clamp(0.65rem,1.15vh,0.75rem)] text-slate-400 mt-0.5 leading-tight">Lock high-res master downloads until milestone invoices settle.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-[clamp(0.9rem,1.6vh,1.1rem)] h-[clamp(0.9rem,1.6vh,1.1rem)] rounded-full bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E] shrink-0 mt-0.5">
                  <Check className="w-[clamp(0.55rem,1vh,0.7rem)] h-[clamp(0.55rem,1vh,0.7rem)] stroke-[3]" />
                </div>
                <div>
                  <p className="text-[clamp(0.72rem,1.35vh,0.875rem)] font-semibold text-white leading-tight">Multi-Tenant Agency Isolation</p>
                  <p className="text-[clamp(0.65rem,1.15vh,0.75rem)] text-slate-400 mt-0.5 leading-tight">Custom domain branding, watermarked media, role security.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Fluid Testimonial Card */}
          <div className="p-[clamp(0.5rem,1.2vh,0.875rem)] bg-[#1A1B23]/60 border border-white/5 rounded-xl text-xs relative z-10 shrink-0 flex flex-col gap-[clamp(0.25rem,0.6vh,0.5rem)]">
            <p className="text-[clamp(0.65rem,1.15vh,0.75rem)] text-slate-300 italic leading-snug">
              "FrameReview cut our client approval cycles from weeks to hours while guaranteeing 100% upfront milestone payment security."
            </p>
            <div className="flex items-center gap-2 pt-1 border-t border-white/5">
              <div className="w-[clamp(1.4rem,2.5vh,1.75rem)] h-[clamp(1.4rem,2.5vh,1.75rem)] rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-bold text-slate-950 text-[clamp(0.55rem,1vh,0.65rem)] shadow-inner shrink-0">
                MV
              </div>
              <div>
                <p className="text-[clamp(0.65rem,1.2vh,0.75rem)] font-bold text-white leading-none">Marcus Vance</p>
                <p className="text-[clamp(0.55rem,1vh,0.65rem)] text-slate-400 mt-0.5 leading-none">Creative Director, Vanguard Media Studios</p>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT PANEL (FORM CANVAS - JUSTIFY BETWEEN FOR TOP BLOCK VS TERMS FOOTER) */}
        <div className="bg-[#12131A] border border-white/10 rounded-2xl p-[clamp(1rem,2.5vh,2rem)] shadow-2xl flex flex-col justify-between h-full min-h-0 relative z-10">
          
          {/* TOP BLOCK: Grouped Header, Tabs, SSO & Form Elements with Fixed Consistent Gap */}
          <div className="flex flex-col gap-[clamp(0.4rem,1.2vh,0.85rem)] min-h-0">
            
            {/* Top Navigation Row */}
            <div className="flex justify-between items-center text-[clamp(0.65rem,1.15vh,0.75rem)] shrink-0">
              <a href="/" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                ← Return to Landing Page
              </a>
              <span className="text-slate-500 font-mono text-[clamp(0.55rem,1vh,0.65rem)]">v2.4 Enterprise</span>
            </div>

            {/* Fluid Tab Switcher */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full shrink-0">
              <TabsList className="grid grid-cols-2 h-[clamp(2rem,3.8vh,2.5rem)] p-1">
                <TabsTrigger value="signup" className="text-[clamp(0.65rem,1.2vh,0.75rem)] font-bold py-1">
                  Create Account
                </TabsTrigger>
                <TabsTrigger value="signin" className="text-[clamp(0.65rem,1.2vh,0.75rem)] font-bold py-1">
                  Sign In
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Dynamic Success Message */}
            {authSuccess && (
              <div className="p-[clamp(0.35rem,0.8vh,0.6rem)] text-[clamp(0.65rem,1.15vh,0.75rem)] rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2 shrink-0 animate-in fade-in duration-200">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <p className="leading-tight">{authSuccess}</p>
              </div>
            )}

            {/* Dynamic Error Message */}
            {authError && (
              <div className="p-[clamp(0.35rem,0.8vh,0.6rem)] text-[clamp(0.65rem,1.15vh,0.75rem)] rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2 shrink-0 animate-in fade-in duration-200 font-medium">
                <span className="shrink-0">⚠️</span>
                <p className="leading-tight">{authError}</p>
              </div>
            )}

            {/* -------------------- SIGN UP FORM VIEW -------------------- */}
            {activeTab === "signup" && (
              <div className="flex flex-col gap-[clamp(0.4rem,1.2vh,0.85rem)] min-h-0">
                <div className="text-left shrink-0">
                  <h2 className="text-[clamp(1.1rem,2.1vh,1.5rem)] font-bold text-white tracking-tight leading-tight">
                    Create your free agency account
                  </h2>
                  <p className="text-[clamp(0.65rem,1.2vh,0.75rem)] text-slate-400 mt-0.5 leading-tight">
                    No credit card required. Includes 14-day full feature trial.
                  </p>
                </div>

                {/* Google SSO Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full h-[clamp(2rem,3.8vh,2.4rem)] text-[clamp(0.65rem,1.2vh,0.75rem)] font-semibold rounded-lg bg-[#1A1B23] border-white/10 hover:bg-white/10 text-white flex items-center justify-center gap-2 transition-all shrink-0"
                >
                  <svg className="w-[clamp(0.8rem,1.5vh,1rem)] h-[clamp(0.8rem,1.5vh,1rem)] shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.6 14.8 0 12 0 7.4 0 3.5 2.6 1.6 6.4l3.7 2.9C6.2 6.6 8.8 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.2 0-5.8-1.6-6.7-4.3L1.6 17.9C3.5 21.7 7.4 24 12 24z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                {/* Divider */}
                <div className="relative flex items-center justify-center text-[clamp(0.55rem,1vh,0.65rem)] uppercase text-slate-500 shrink-0">
                  <div className="border-t border-white/10 w-full" />
                  <span className="bg-[#12131A] px-2 font-mono tracking-wider shrink-0">
                    or continue with work email
                  </span>
                </div>

                {/* Sign Up Inputs Form */}
                <form onSubmit={handleSignUpSubmit} className="flex flex-col gap-[clamp(0.25rem,0.8vh,0.55rem)]">
                  <div className="space-y-[clamp(0.1rem,0.4vh,0.25rem)] text-left">
                    <label className="text-[clamp(0.65rem,1.15vh,0.75rem)] font-medium text-slate-300 flex items-center gap-1.5 leading-tight">
                      <User className="w-[clamp(0.7rem,1.2vh,0.85rem)] h-[clamp(0.7rem,1.2vh,0.85rem)] text-slate-400" /> Full Name
                    </label>
                    <Input
                      type="text"
                      required
                      placeholder="Sarah Jenkins"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-[clamp(1.9rem,3.8vh,2.35rem)] text-[clamp(0.65rem,1.2vh,0.75rem)] bg-[#1A1B23] border-white/10 px-2.5 rounded-lg focus:border-[#22C55E]"
                    />
                  </div>

                  <div className="space-y-[clamp(0.1rem,0.4vh,0.25rem)] text-left">
                    <label className="text-[clamp(0.65rem,1.15vh,0.75rem)] font-medium text-slate-300 flex items-center gap-1.5 leading-tight">
                      <Mail className="w-[clamp(0.7rem,1.2vh,0.85rem)] h-[clamp(0.7rem,1.2vh,0.85rem)] text-slate-400" /> Work Email
                    </label>
                    <Input
                      type="email"
                      required
                      placeholder="name@agency.com"
                      value={email}
                      onBlur={() => setEmailTouched(true)}
                      onChange={(e) => {
                        setEmail(e.target.value);
                      }}
                      className={`h-[clamp(1.9rem,3.8vh,2.35rem)] text-[clamp(0.65rem,1.2vh,0.75rem)] bg-[#1A1B23] px-2.5 rounded-lg transition-all ${
                        emailTouched && emailError
                          ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
                          : isEmailValid && emailTouched
                          ? "border-emerald-500/50 focus:border-[#22C55E]"
                          : "border-white/10 focus:border-[#22C55E]"
                      }`}
                    />
                    {emailTouched && emailError && (
                      <p className="text-red-400 text-[clamp(0.55rem,1vh,0.65rem)] mt-0.5 font-medium flex items-center gap-1 leading-tight">
                        ⚠️ {emailError}
                      </p>
                    )}
                  </div>

                  <div className="space-y-[clamp(0.1rem,0.4vh,0.25rem)] text-left">
                    <label className="text-[clamp(0.65rem,1.15vh,0.75rem)] font-medium text-slate-300 flex items-center gap-1.5 leading-tight">
                      <Lock className="w-[clamp(0.7rem,1.2vh,0.85rem)] h-[clamp(0.7rem,1.2vh,0.85rem)] text-slate-400" /> Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-[clamp(1.9rem,3.8vh,2.35rem)] text-[clamp(0.65rem,1.2vh,0.75rem)] bg-[#1A1B23] border-white/10 px-2.5 rounded-lg focus:border-[#22C55E] pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-[clamp(0.75rem,1.4vh,0.9rem)] h-[clamp(0.75rem,1.4vh,0.9rem)]" /> : <Eye className="w-[clamp(0.75rem,1.4vh,0.9rem)] h-[clamp(0.75rem,1.4vh,0.9rem)]" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-[clamp(0.1rem,0.4vh,0.25rem)] text-left">
                    <label className="text-[clamp(0.65rem,1.15vh,0.75rem)] font-medium text-slate-300 flex items-center justify-between leading-tight">
                      <span className="flex items-center gap-1.5">
                        <Lock className="w-[clamp(0.7rem,1.2vh,0.85rem)] h-[clamp(0.7rem,1.2vh,0.85rem)] text-slate-400" /> Confirm Password
                      </span>
                      {isPasswordMatched && (
                        <span className="text-[clamp(0.55rem,1vh,0.65rem)] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Passwords match
                        </span>
                      )}
                      {isPasswordMismatched && (
                        <span className="text-[clamp(0.55rem,1vh,0.65rem)] text-red-400 font-bold">
                          Passwords do not match
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        placeholder="••••••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`h-[clamp(1.9rem,3.8vh,2.35rem)] text-[clamp(0.65rem,1.2vh,0.75rem)] bg-[#1A1B23] px-2.5 rounded-lg pr-8 ${
                          isPasswordMismatched
                            ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                            : isPasswordMatched
                            ? "border-emerald-500/50 focus:border-[#22C55E]"
                            : "border-white/10 focus:border-[#22C55E]"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-[clamp(0.75rem,1.4vh,0.9rem)] h-[clamp(0.75rem,1.4vh,0.9rem)]" /> : <Eye className="w-[clamp(0.75rem,1.4vh,0.9rem)] h-[clamp(0.75rem,1.4vh,0.9rem)]" />}
                      </button>
                    </div>
                  </div>

                  {isPasswordMismatched && (
                    <p className="text-[clamp(0.55rem,1vh,0.65rem)] text-red-400 bg-red-500/10 p-1 rounded-lg border border-red-500/20 text-left font-medium leading-tight">
                      ⚠️ Please make sure both passwords match before proceeding.
                    </p>
                  )}

                  {/* Primary Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading || !isEmailValid || isPasswordMismatched || !fullName || !password || !confirmPassword}
                    className="w-full h-[clamp(2.1rem,4.2vh,2.6rem)] text-[clamp(0.7rem,1.3vh,0.85rem)] font-bold bg-[#22C55E] text-[#090A0F] hover:bg-[#22C55E]/90 shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-[clamp(0.15rem,0.5vh,0.35rem)] shrink-0"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5 text-[#090A0F]" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Free Account <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            )}

            {/* -------------------- SIGN IN FORM VIEW -------------------- */}
            {activeTab === "signin" && (
              <div className="flex flex-col gap-[clamp(0.4rem,1.2vh,0.85rem)] min-h-0">
                <div className="text-left shrink-0">
                  <h2 className="text-[clamp(1.1rem,2.1vh,1.5rem)] font-bold text-white tracking-tight leading-tight">
                    Welcome back to FrameReview
                  </h2>
                  <p className="text-[clamp(0.65rem,1.2vh,0.75rem)] text-slate-400 mt-0.5 leading-tight">
                    Enter your agency credentials to access your workspaces.
                  </p>
                </div>

                {/* Google SSO Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full h-[clamp(2rem,3.8vh,2.4rem)] text-[clamp(0.65rem,1.2vh,0.75rem)] font-semibold rounded-lg bg-[#1A1B23] border-white/10 hover:bg-white/10 text-white flex items-center justify-center gap-2 transition-all shrink-0"
                >
                  <svg className="w-[clamp(0.8rem,1.5vh,1rem)] h-[clamp(0.8rem,1.5vh,1rem)] shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.6 14.8 0 12 0 7.4 0 3.5 2.6 1.6 6.4l3.7 2.9C6.2 6.6 8.8 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.2 0-5.8-1.6-6.7-4.3L1.6 17.9C3.5 21.7 7.4 24 12 24z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                {/* Divider */}
                <div className="relative flex items-center justify-center text-[clamp(0.55rem,1vh,0.65rem)] uppercase text-slate-500 shrink-0">
                  <div className="border-t border-white/10 w-full" />
                  <span className="bg-[#12131A] px-2 font-mono tracking-wider shrink-0">
                    or continue with work email
                  </span>
                </div>

                {/* Sign In Inputs Form */}
                <form onSubmit={handleSignInSubmit} className="flex flex-col gap-[clamp(0.25rem,0.8vh,0.55rem)]">
                  <div className="space-y-[clamp(0.1rem,0.4vh,0.25rem)] text-left">
                    <label className="text-[clamp(0.65rem,1.15vh,0.75rem)] font-medium text-slate-300 flex items-center gap-1.5 leading-tight">
                      <Mail className="w-[clamp(0.7rem,1.2vh,0.85rem)] h-[clamp(0.7rem,1.2vh,0.85rem)] text-slate-400" /> Work Email
                    </label>
                    <Input
                      type="email"
                      required
                      placeholder="name@agency.com"
                      value={email}
                      onBlur={() => setEmailTouched(true)}
                      onChange={(e) => {
                        setEmail(e.target.value);
                      }}
                      className={`h-[clamp(1.9rem,3.8vh,2.35rem)] text-[clamp(0.65rem,1.2vh,0.75rem)] bg-[#1A1B23] px-2.5 rounded-lg transition-all ${
                        emailTouched && emailError
                          ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
                          : isEmailValid && emailTouched
                          ? "border-emerald-500/50 focus:border-[#22C55E]"
                          : "border-white/10 focus:border-[#22C55E]"
                      }`}
                    />
                    {emailTouched && emailError && (
                      <p className="text-red-400 text-[clamp(0.55rem,1vh,0.65rem)] mt-0.5 font-medium flex items-center gap-1 leading-tight">
                        ⚠️ {emailError}
                      </p>
                    )}
                  </div>

                  <div className="space-y-[clamp(0.1rem,0.4vh,0.25rem)] text-left">
                    <label className="text-[clamp(0.65rem,1.15vh,0.75rem)] font-medium text-slate-300 flex items-center gap-1.5 leading-tight">
                      <Lock className="w-[clamp(0.7rem,1.2vh,0.85rem)] h-[clamp(0.7rem,1.2vh,0.85rem)] text-slate-400" /> Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-[clamp(1.9rem,3.8vh,2.35rem)] text-[clamp(0.65rem,1.2vh,0.75rem)] bg-[#1A1B23] border-white/10 px-2.5 rounded-lg focus:border-[#22C55E] pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-[clamp(0.75rem,1.4vh,0.9rem)] h-[clamp(0.75rem,1.4vh,0.9rem)]" /> : <Eye className="w-[clamp(0.75rem,1.4vh,0.9rem)] h-[clamp(0.75rem,1.4vh,0.9rem)]" />}
                      </button>
                    </div>
                  </div>

                  {/* Utilities Row (Directly below Password field with same tight gap) */}
                  <div className="flex items-center justify-between text-[clamp(0.65rem,1.15vh,0.75rem)] pt-0.5">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 select-none text-[clamp(0.6rem,1.1vh,0.7rem)]">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-3 h-3 rounded border-white/10 bg-[#1A1B23] text-[#22C55E] focus:ring-[#22C55E] focus:ring-offset-0 cursor-pointer accent-[#22C55E]"
                      />
                      Remember me
                    </label>

                    <button
                      type="button"
                      onClick={() => alert("Password reset link requested! Simulated email dispatched to your inbox.")}
                      className="text-[#22C55E] hover:underline font-semibold text-[clamp(0.6rem,1.1vh,0.7rem)]"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Primary Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading || !isEmailValid || !password}
                    className="w-full h-[clamp(2.1rem,4.2vh,2.6rem)] text-[clamp(0.7rem,1.3vh,0.85rem)] font-bold bg-[#22C55E] text-[#090A0F] hover:bg-[#22C55E]/90 shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-[clamp(0.15rem,0.5vh,0.35rem)] shrink-0"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5 text-[#090A0F]" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        Sign In to Workspace <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            )}
          </div>

          {/* Subdued Terms Footer (Pinned to bottom via outer justify-between) */}
          <p className="text-[clamp(0.55rem,1vh,0.65rem)] text-slate-500 text-center mt-[clamp(0.25rem,0.6vh,0.5rem)] leading-tight shrink-0">
            By continuing, you agree to FrameReview's{" "}
            <a href="#" className="text-slate-400 underline hover:text-[#22C55E] transition-colors">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-slate-400 underline hover:text-[#22C55E] transition-colors">
              Privacy Policy
            </a>.
          </p>

        </div>
      </div>
    </div>
  );
}
