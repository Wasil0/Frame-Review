import React, { useState } from "react";
import { KeyRound, Lock, Eye, EyeOff, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { supabase } from "../lib/supabaseClient";
import { api } from "../lib/api";

export default function MandatoryPasswordResetModal({ userEmail, onPasswordResetComplete }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const calculateStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score: 1, label: "Weak", color: "bg-red-500 text-red-400" };
    if (score <= 3) return { score: 2, label: "Medium", color: "bg-amber-500 text-amber-400" };
    return { score: 3, label: "Strong", color: "bg-[#22C55E] text-[#22C55E]" };
  };

  const strength = calculateStrength(newPassword);

  const isLengthValid = newPassword.length >= 8;
  const isDifferent = newPassword !== currentPassword;
  const isConfirmMatching = confirmPassword.length > 0 && confirmPassword === newPassword;
  const isConfirmMismatched = confirmPassword.length > 0 && confirmPassword !== newPassword;
  const isSameAsCurrent = newPassword.length > 0 && currentPassword.length > 0 && newPassword === currentPassword;

  const canSubmit =
    currentPassword.length > 0 &&
    isLengthValid &&
    isDifferent &&
    isConfirmMatching &&
    !isSubmitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Re-authenticate to verify temporary password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword
      });

      if (signInError) {
        throw new Error("Temporary password is incorrect. Please check your invitation email.");
      }

      // 2. Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      // 3. Clear must_reset_password flag on backend profile
      await api.patch("/api/users/me", { must_reset_password: false });

      if (onPasswordResetComplete) {
        onPasswordResetComplete();
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to update password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 selection:bg-[#22C55E]/30 selection:text-white">
      <div className="bg-[#12131A] border border-white/10 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
        
        <div className="space-y-2 text-left">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <KeyRound className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight leading-tight">
            Action Required: Set Your Password
          </h2>
          <p className="text-xs text-slate-400 leading-normal">
            You signed in using a temporary password. Please set a permanent password to secure your account.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Temporary / Current Password */}
          <div className="space-y-1.5 text-left">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" /> Temporary Password
            </label>
            <div className="relative">
              <Input
                type={showCurrent ? "text" : "password"}
                required
                placeholder="••••••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-[#1A1B23] border-white/10 text-xs pr-9 focus:border-[#22C55E]"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5 text-left">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" /> New Permanent Password
            </label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                required
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`bg-[#1A1B23] text-xs pr-9 transition-all ${
                  isSameAsCurrent
                    ? "border-red-500/60 focus:border-red-500"
                    : "border-white/10 focus:border-[#22C55E]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <span className="text-slate-400">Must be at least 8 characters</span>
              {strength.label && (
                <span className={`font-mono font-bold flex items-center gap-1.5 ${strength.color.split(" ")[1]}`}>
                  Strength: {strength.label}
                </span>
              )}
            </div>

            {isSameAsCurrent && (
              <p className="text-red-400 text-[11px] font-medium flex items-center gap-1 mt-1">
                ⚠️ New password must be different from temporary password
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5 text-left">
            <label className="font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" /> Confirm New Password
              </span>
              {isConfirmMatching && (
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Passwords match
                </span>
              )}
            </label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                required
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`bg-[#1A1B23] text-xs pr-9 transition-all ${
                  isConfirmMismatched
                    ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
                    : isConfirmMatching
                    ? "border-emerald-500/50 focus:border-[#22C55E]"
                    : "border-white/10 focus:border-[#22C55E]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {isConfirmMismatched && (
              <p className="text-red-400 text-[11px] font-medium flex items-center gap-1 mt-1">
                ⚠️ Passwords do not match
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={!canSubmit}
            className="w-full h-10 text-xs font-bold bg-[#22C55E] text-[#090A0F] hover:bg-[#22C55E]/90 shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-1.5 mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#090A0F]" /> Updating Password...
              </>
            ) : (
              "Save & Continue to Dashboard"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
