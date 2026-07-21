import React, { useState } from "react";
import { KeyRound, Lock, Eye, EyeOff, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useDashboard } from "../../context/DashboardContext";

export default function ChangePasswordCard() {
  const { changePassword } = useDashboard();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Password strength logic
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

  // Validation Flags
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

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await changePassword(currentPassword, newPassword);
      setSuccessMsg("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to update password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-[#12131A] border-white/5 p-6 space-y-5 shadow-2xl relative overflow-hidden">
      
      {/* Title */}
      <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
        <KeyRound className="w-4 h-4 text-[#22C55E]" /> Change Password
      </h3>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Error Notification Alert */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleUpdatePassword} className="space-y-4">
        
        {/* 1. Current Password */}
        <div className="space-y-1.5 text-left">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" /> Current Password
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

        {/* 2. New Password */}
        <div className="space-y-1.5 text-left">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" /> New Password
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

          {/* Helper note & Strength Indicator */}
          <div className="flex items-center justify-between text-[11px] pt-0.5">
            <span className="text-slate-400">Must be at least 8 characters</span>
            {strength.label && (
              <span className={`font-mono font-bold flex items-center gap-1.5 ${strength.color.split(" ")[1]}`}>
                Strength: {strength.label}
              </span>
            )}
          </div>

          {/* Strength Bar */}
          {newPassword && (
            <div className="w-full bg-[#1A1B23] h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className={`h-full rounded-full transition-all duration-300 ${strength.color.split(" ")[0]}`}
                style={{ width: `${(strength.score / 3) * 100}%` }}
              />
            </div>
          )}

          {isSameAsCurrent && (
            <p className="text-red-400 text-[11px] font-medium flex items-center gap-1 mt-1">
              ⚠️ New password must be different from your current password
            </p>
          )}
        </div>

        {/* 3. Confirm New Password */}
        <div className="space-y-1.5 text-left">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
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

        {/* Submit Button */}
        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            disabled={!canSubmit}
            className="bg-[#22C55E] text-[#090A0F] font-bold text-xs px-6 hover:bg-[#22C55E]/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5 text-[#090A0F]" />
                Updating Password...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </div>
      </form>

      {/* Footer Helper Link */}
      <div className="pt-3 border-t border-white/5 text-center text-xs text-slate-400">
        Forgot your current password instead?{" "}
        <a
          href="#auth-signin"
          className="text-[#22C55E] underline hover:text-[#22C55E]/80 transition-colors font-medium"
        >
          Sign out and use the reset link
        </a>
      </div>

    </Card>
  );
}
