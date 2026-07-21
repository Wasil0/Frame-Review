import React, { useState } from "react";
import { ShieldCheck, X, Check, CreditCard, Download, Loader2 } from "lucide-react";
import { Button } from "../ui/button";

export default function ApproveProjectModal({
  isOpen,
  onClose,
  project,
  onApproveSuccess
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [approved, setApproved] = useState(false);

  if (!isOpen) return null;

  const handlePayAndApprove = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setApproved(true);
      if (onApproveSuccess) onApproveSuccess();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-[#12131A] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 relative">
        
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#22C55E]" /> Approve Project & Unlock Masters
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {approved ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#22C55E] flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Project Approved & Settled!</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Thank you! Milestone 2 payment ($6,500) has cleared. Your un-watermarked 4K Master ProRes exports are now unlocked.
              </p>
            </div>
            <Button
              onClick={() => {
                alert("Downloading 4K Master ProRes file...");
                onClose();
              }}
              className="bg-[#22C55E] text-[#090A0F] font-bold text-xs px-6 h-10 hover:bg-[#22C55E]/90 flex items-center gap-2 mx-auto"
            >
              <Download className="w-4 h-4" /> Download 4K Master Files
            </Button>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <p className="text-slate-300 leading-relaxed">
              By approving <strong className="text-white">{project.title}</strong>, you confirm final delivery sign-off and settle the remaining milestone balance.
            </p>

            <div className="p-3.5 rounded-xl bg-[#1A1B23] border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-slate-300 font-semibold">
                <span>Final Milestone Deliverables</span>
                <span className="font-mono text-white">${project.milestoneAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 text-[11px]">
                <span>Delivered Master Quality</span>
                <span>ProRes 422 HQ / 4K UHD</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 text-[11px] pt-1 border-t border-white/5">
                <span className="text-[#22C55E]">Remaining Payment Due</span>
                <span className="font-mono font-bold text-[#22C55E]">${project.milestoneAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3 border-t border-white/5">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="text-xs border-white/10 bg-[#1A1B23] text-slate-300 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayAndApprove}
                disabled={isProcessing}
                className="bg-[#22C55E] text-[#090A0F] font-bold text-xs px-5 h-10 hover:bg-[#22C55E]/90 flex items-center gap-1.5"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#090A0F]" /> Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" /> Pay (${project.milestoneAmount.toLocaleString()}) & Approve
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
