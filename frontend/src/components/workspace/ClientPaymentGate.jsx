import React from "react";
import { Lock, CreditCard, ShieldCheck } from "lucide-react";
import { Button } from "../ui/button";

export default function ClientPaymentGate({ advanceAmount = 2500, onUnlockAdvance }) {
  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-[#090A0F] text-slate-100 select-none">
      <div className="bg-[#12131A] border border-white/10 rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl animate-in fade-in duration-200">
        
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white tracking-tight">Workspace Locked</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            To unlock access to this 4K video review stream and pin feedback tools, please clear the advance project invoice of{" "}
            <strong className="text-white font-mono">${advanceAmount.toLocaleString()}</strong>.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#1A1B23] border border-white/5 text-left text-xs space-y-2">
          <div className="flex justify-between items-center text-slate-300">
            <span>Advance Deposit Required</span>
            <span className="font-mono font-bold text-white">${advanceAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400 text-[11px]">
            <span>Payment Method</span>
            <span>Stripe / Credit Card</span>
          </div>
        </div>

        <Button
          onClick={onUnlockAdvance}
          className="w-full bg-[#22C55E] text-[#090A0F] font-bold text-xs h-11 hover:bg-[#22C55E]/90 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
        >
          <CreditCard className="w-4 h-4 stroke-[3]" /> Pay Advance (${advanceAmount.toLocaleString()}) & Unlock Workspace
        </Button>

        <p className="text-[10px] text-slate-500 font-mono flex items-center justify-center gap-1">
          <ShieldCheck className="w-3 h-3 text-[#22C55E]" /> 256-bit Encrypted Escrow Protection
        </p>

      </div>
    </div>
  );
}
