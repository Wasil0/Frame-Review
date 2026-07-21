import React from "react";
import { DollarSign, Lock, Unlock, Clock, AlertTriangle, CheckCircle2, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";

export default function RevenuePanel({ revenueList, stats, onViewAll }) {
  return (
    <Card className="bg-[#12131A] border-white/5 shadow-2xl relative overflow-hidden">
      <CardHeader className="p-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5">
        <div>
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#22C55E]" /> Financial & Milestone Revenue Ledger
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs mt-1">
            Track unpaid milestone locks and paid deliverable clearances.
          </CardDescription>
        </div>

        {/* Top Summary Badges & View All */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Pending: ${stats.pendingRevenue.toLocaleString()}
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#22C55E] text-xs font-mono font-bold flex items-center gap-1.5">
            <Unlock className="w-3.5 h-3.5" /> Paid: ${stats.currentMonthRevenue.toLocaleString()}
          </div>
          {onViewAll && (
            <Button onClick={onViewAll} variant="outline" className="text-xs border-white/10 bg-[#1A1B23] text-slate-300 hover:text-white hover:bg-white/5">
              View All ({revenueList.length})
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#0B0C12] border-b border-white/5 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
              <th className="py-3.5 px-6">Client / Project</th>
              <th className="py-3.5 px-6">Milestone Deliverable</th>
              <th className="py-3.5 px-6">Invoice Amount</th>
              <th className="py-3.5 px-6">Due / Settlement Date</th>
              <th className="py-3.5 px-6 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {revenueList.map((rev) => (
              <tr key={rev.id} className="hover:bg-white/[0.02] transition-colors">
                
                {/* Client & Project */}
                <td className="py-4 px-6">
                  <div>
                    <p className="font-bold text-white text-xs">{rev.client}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{rev.project}</p>
                  </div>
                </td>

                {/* Milestone */}
                <td className="py-4 px-6 text-slate-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#22C55E]" /> {rev.milestone}
                  </span>
                </td>

                {/* Amount */}
                <td className="py-4 px-6 font-mono font-bold text-white text-sm">
                  ${rev.amount.toLocaleString()}
                </td>

                {/* Due Date */}
                <td className="py-4 px-6 text-slate-400 font-mono text-xs">
                  {rev.status === "Paid" ? rev.paidDate : rev.dueDate}
                </td>

                {/* Status Badge */}
                <td className="py-4 px-6 text-center">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border font-mono ${
                      rev.status === "Paid"
                        ? "bg-emerald-500/10 text-[#22C55E] border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}
                  >
                    {rev.status === "Paid" ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> Paid & Cleared
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" /> Pending Clearance
                      </>
                    )}
                  </span>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
