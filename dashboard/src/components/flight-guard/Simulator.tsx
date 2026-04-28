import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Plane, Zap, ShieldCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export type SettleStatus = "idle" | "pending" | "executing" | "dispersed";

interface SimulatorProps {
  delay: number;
  onDelayChange: (v: number) => void;
  threshold: number;
  status: SettleStatus;
  popKey: number;
  onPurchase: () => void;
  onOracle: () => void;
  purchased: boolean;
}

const StatusBadge = ({ status }: { status: SettleStatus }) => {
  const map: Record<SettleStatus, { label: string; cls: string; pulse?: boolean }> = {
    idle:       { label: "auto_settle: idle",      cls: "bg-muted/50 text-muted-foreground border-border" },
    pending:    { label: "auto_settle: pending",   cls: "bg-warning/15 text-warning border-warning/30", pulse: true },
    executing:  { label: "auto_settle: executing", cls: "bg-primary/15 text-primary border-primary/30", pulse: true },
    dispersed:  { label: "auto_settle: dispersed", cls: "bg-success/15 text-success border-success/30" },
  };
  const s = map[status];
  return (
    <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full border font-mono text-[11px]", s.cls)}>
      {s.pulse && <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full rounded-full bg-current opacity-75 animate-pulse-dot" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" /></span>}
      {!s.pulse && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {s.label}
    </div>
  );
};

export const Simulator = (p: SimulatorProps) => {
  const overThreshold = p.delay >= p.threshold;
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden" style={{ background: "var(--gradient-surface)" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Plane className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight">Flight PR-218 → MNL</h2>
            <p className="text-xs text-muted-foreground font-mono">Riyadh → Manila · Boarding 22:40</p>
          </div>
        </div>
        <StatusBadge status={p.status} />
      </div>

      {/* Body */}
      <div className="p-6 space-y-7">
        {/* Slider */}
        <div>
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Simulated Delay</p>
              <div className="flex items-baseline gap-2">
                <span className={cn("font-mono text-5xl font-bold tabular-nums tracking-tight", overThreshold ? "text-success" : "text-foreground")}>
                  {Math.floor(p.delay / 60)}h {p.delay % 60}m
                </span>
                <span className="font-mono text-sm text-muted-foreground">/ {p.threshold} min threshold</span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              {p.delay} min
            </div>
          </div>

          <div className="relative">
            <Slider
              value={[p.delay]}
              onValueChange={(v) => p.onDelayChange(v[0])}
              min={0}
              max={360}
              step={5}
              className="py-3"
            />
            {/* Threshold marker */}
            <div className="absolute top-1/2 -translate-y-1/2 h-7 w-0.5 bg-warning/70" style={{ left: `${(p.threshold / 360) * 100}%` }}>
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-warning whitespace-nowrap">3H THRESHOLD</span>
            </div>
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-mono text-muted-foreground">
            <span>0m</span><span>90m</span><span>180m</span><span>270m</span><span>360m</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid sm:grid-cols-2 gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={p.onPurchase}
                disabled={p.purchased}
                size="lg"
                className={cn(
                  "h-14 font-mono text-sm relative overflow-hidden",
                  p.purchased && "opacity-60"
                )}
                style={!p.purchased ? { background: "var(--gradient-brand)", boxShadow: "var(--shadow-pop)" } : undefined}
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                {p.purchased ? "cover_active()" : "purchase_cover()"}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="font-mono text-xs">
              <div className="space-y-1">
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">premium</span><span>5.00 USDC</span></div>
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">gas_fee_est</span><span className="text-primary-glow">0.00012 XLM</span></div>
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">network</span><span className="text-success">Stellar Testnet</span></div>
              </div>
            </TooltipContent>
          </Tooltip>

          <Button
            onClick={p.onOracle}
            disabled={!p.purchased}
            size="lg"
            variant="outline"
            className={cn(
              "h-14 font-mono text-sm border-warning/40 text-warning hover:bg-warning/10 hover:text-warning",
              !p.purchased && "opacity-50"
            )}
          >
            <Zap className="w-4 h-4 mr-2" />
            oracle_report()
            <span className="ml-2 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-warning/15 border border-warning/30">admin</span>
          </Button>
        </div>

        {/* Payout module */}
        <div
          key={p.popKey}
          className={cn(
            "rounded-xl border border-border bg-background/50 p-5 transition-all",
            p.popKey > 0 && "animate-pop"
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Potential Payout</p>
              <p className="font-mono text-3xl font-bold tabular-nums">
                <span className={overThreshold ? "text-success" : "text-foreground"}>200.00</span>
                <span className="text-muted-foreground text-lg ml-1.5">USDC</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Cash Out</p>
              <p className="font-mono text-sm text-secondary">MoneyGram · NAIA T3</p>
            </div>
          </div>
          {p.status === "dispersed" && (
            <div className="mt-4 pt-4 border-t border-border/60 flex items-center gap-2 text-success text-xs font-mono animate-fade-up">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              tx_hash: 0x4a8f...b21c · settled in 2.4s
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
