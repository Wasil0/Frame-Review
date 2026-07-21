import React from "react";
import { History, CheckCircle2, DollarSign, Calendar, Film } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";

export default function ProjectHistoryList({ history, onViewAll }) {
  return (
    <Card className="bg-[#12131A] border-white/5 shadow-2xl relative overflow-hidden">
      <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between border-b border-white/5">
        <div>
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-[#22C55E]" /> Past Projects History
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs mt-1">
            Archived master exports, total earnings, and historical delivery logs.
          </CardDescription>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-[#22C55E] border border-emerald-500/20 font-mono">
            {history.length} Delivered
          </span>
          {onViewAll && (
            <Button onClick={onViewAll} variant="outline" className="text-xs border-white/10 bg-[#1A1B23] text-slate-300 hover:text-white hover:bg-white/5">
              View All ({history.length})
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#0B0C12] border-b border-white/5 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
              <th className="py-3.5 px-6">Project Title</th>
              <th className="py-3.5 px-6">Client</th>
              <th className="py-3.5 px-6">Delivery Date</th>
              <th className="py-3.5 px-6">Total Revenue</th>
              <th className="py-3.5 px-6 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {history.map((item) => (
              <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-[#22C55E] shrink-0">
                      <Film className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-xs">{item.title}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{item.versionCount} versions archived</p>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-6 text-slate-300 font-medium">
                  {item.client}
                </td>

                <td className="py-4 px-6 text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" /> {item.deliveryDate}
                  </span>
                </td>

                <td className="py-4 px-6 font-mono font-bold text-emerald-400">
                  ${item.totalEarnings.toLocaleString()}
                </td>

                <td className="py-4 px-6 text-center">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-[#22C55E] border border-emerald-500/20 font-mono">
                    <CheckCircle2 className="w-3 h-3" /> {item.status}
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
