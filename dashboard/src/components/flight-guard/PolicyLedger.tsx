import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import emptyLounge from "@/assets/empty-lounge.png";

export interface Policy {
  flightId: string;
  premium: string;
  threshold: string;
  payout: string;
  status: "Active" | "Pending" | "Settled" | "Expired";
}

const statusStyles: Record<Policy["status"], string> = {
  Active:  "bg-primary/15 text-primary border-primary/30",
  Pending: "bg-warning/15 text-warning border-warning/30",
  Settled: "bg-success/15 text-success border-success/30",
  Expired: "bg-muted text-muted-foreground border-border",
};

export const PolicyLedger = ({ policies }: { policies: Policy[] }) => {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Policy Ledger</h3>
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">/ active_covers</span>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">{policies.length} record{policies.length !== 1 && "s"}</span>
      </div>

      {policies.length === 0 ? (
        <div className="flex flex-col items-center text-center py-10 px-6">
          <img src={emptyLounge} alt="Empty airport lounge illustration" loading="lazy" width={1024} height={768} className="w-72 opacity-90" />
          <h4 className="font-semibold text-lg mt-4">No policies in escrow</h4>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            Purchase your first cover above. Once active, your contract appears here with live oracle status.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/60">
                <th className="px-6 py-3 font-medium">Flight ID</th>
                <th className="px-6 py-3 font-medium text-right">Premium</th>
                <th className="px-6 py-3 font-medium text-right">Threshold</th>
                <th className="px-6 py-3 font-medium text-right">Payout</th>
                <th className="px-6 py-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((p) => (
                <tr key={p.flightId} className="border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-foreground">{p.flightId}</td>
                  <td className="px-6 py-4 font-mono text-right">{p.premium}</td>
                  <td className="px-6 py-4 font-mono text-right text-muted-foreground">{p.threshold}</td>
                  <td className="px-6 py-4 font-mono text-right text-foreground">{p.payout}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-mono text-[10px]", statusStyles[p.status])}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
