import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Check, KeyRound, Plane } from "lucide-react";
import heroAirport from "@/assets/hero-airport.jpg";

interface AuthCardProps {
  onAuth: () => void;
}

export const AuthCard = ({ onAuth }: AuthCardProps) => {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      <img
        src={heroAirport}
        alt="Airplane at Manila airport gate during rainy evening"
        width={1920}
        height={1280}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-background/75 backdrop-blur-sm" />
      <div className="absolute inset-0" style={{ background: "var(--gradient-glow)" }} />

      {/* testnet pill */}
      <div className="absolute top-6 right-6 glass rounded-full px-3 py-1.5 flex items-center gap-2 z-10">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-pulse-dot" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
        </span>
        <span className="font-mono text-[11px] text-foreground">Stellar Network: Testnet</span>
      </div>

      <Card className="relative z-10 w-full max-w-md glass-strong border-border/60 p-8" style={{ boxShadow: "var(--shadow-elevated)" }}>
        <div className="flex items-center gap-3 mb-7">
          <div className="relative w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-brand)" }}>
            <Plane className="w-5 h-5 text-white" strokeWidth={2.5} />
            <div className="absolute inset-0 rounded-xl blur-lg opacity-60" style={{ background: "var(--gradient-brand)" }} />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">Flight Guard Auth</h1>
            <p className="text-xs text-muted-foreground font-mono">Parametric cover · powered by Soroban</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Demo User</Label>
            <div className="mt-1.5 relative">
              <Input value="Juan_OFW_2026" readOnly className="font-mono text-sm pr-10 bg-background/40" />
              <button
                onClick={() => copy("user", "Juan_OFW_2026")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-muted/60 transition-colors"
              >
                {copied === "user" ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
              </button>
            </div>
          </div>

          <div>
            <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <KeyRound className="w-3 h-3" /> Demo Key
            </Label>
            <div className="mt-1.5 relative">
              <Input value="S...TESTNET...FLOW" readOnly className="font-mono text-sm pr-10 bg-background/40 text-primary-glow" />
              <button
                onClick={() => copy("key", "STESTNETFLOW1234567890DEMOKEYFLIGHTGUARD")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-muted/60 transition-colors"
              >
                {copied === "key" ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
              </button>
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground font-mono">Click to copy. Never use a real secret on a demo.</p>
          </div>

          <Button
            onClick={onAuth}
            size="lg"
            className="w-full h-12 mt-2 font-mono text-sm"
            style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-pop)" }}
          >
            connect_wallet() →
          </Button>

          <div className="pt-3 mt-3 border-t border-border/60 grid grid-cols-3 gap-2 text-center">
            <div><p className="font-mono text-sm font-bold text-foreground">3hr</p><p className="text-[10px] text-muted-foreground font-mono">trigger</p></div>
            <div><p className="font-mono text-sm font-bold text-success">200</p><p className="text-[10px] text-muted-foreground font-mono">USDC payout</p></div>
            <div><p className="font-mono text-sm font-bold text-secondary">2.4s</p><p className="text-[10px] text-muted-foreground font-mono">settle time</p></div>
          </div>
        </div>
      </Card>
    </div>
  );
};
