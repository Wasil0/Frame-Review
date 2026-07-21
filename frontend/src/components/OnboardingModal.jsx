import React, { useState } from "react";
import { Building2, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { api } from "../lib/api";

export default function OnboardingModal({ onAgencyCreated }) {
  const [agencyName, setAgencyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agencyName.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const newAgency = await api.post("/api/agencies", { name: agencyName.trim() });
      if (onAgencyCreated) {
        onAgencyCreated(newAgency);
      }
    } catch (err) {
      setError(err.message || "Failed to create agency.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 selection:bg-[#22C55E]/30 selection:text-white">
      <div className="bg-[#12131A] border border-white/10 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
        
        <div className="space-y-2 text-left">
          <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight leading-tight flex items-center gap-2">
            Welcome — set up your agency
          </h2>
          <p className="text-xs text-slate-400 leading-normal">
            Create your agency workspace to start deploying frame-accurate client portals and managing team reviews.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5 text-left">
            <label className="font-semibold text-slate-300">Agency Name</label>
            <Input
              type="text"
              required
              placeholder="e.g. Vanguard Media Studios"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              className="bg-[#1A1B23] border-white/10 text-xs h-10 focus:border-[#22C55E]"
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !agencyName.trim()}
            className="w-full h-10 text-xs font-bold bg-[#22C55E] text-[#090A0F] hover:bg-[#22C55E]/90 shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Creating Agency...
              </>
            ) : (
              <>
                Create Agency <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
