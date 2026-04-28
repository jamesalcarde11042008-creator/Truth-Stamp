import { Plane, LayoutDashboard, ShieldCheck, Droplets, MapPin, Code2, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "policies", label: "My Policies", icon: ShieldCheck },
  { id: "liquidity", label: "Liquidity Pools", icon: Droplets },
  { id: "locator", label: "MoneyGram Locator", icon: MapPin },
  { id: "docs", label: "Developer Docs", icon: Code2 },
];

interface SidebarProps {
  active: string;
  onSelect: (id: string) => void;
}

export const AppSidebar = ({ active, onSelect }: SidebarProps) => {
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 glass-strong border-r border-border/60 h-screen sticky top-0 z-30">
      <div className="px-6 py-6 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-brand)" }}>
            <Plane className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
            <div className="absolute inset-0 rounded-xl blur-md opacity-70" style={{ background: "var(--gradient-brand)" }} />
          </div>
          <div className="relative">
            <p className="font-bold text-base leading-none tracking-tight">Flight Guard</p>
            <p className="text-[10px] text-muted-foreground font-mono mt-1 tracking-wider">PARAMETRIC.dApp</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative group",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-primary" />
              )}
              <Icon className="w-4 h-4" strokeWidth={2} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-border/60 space-y-3">
        <div className="flex items-center gap-2 px-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-pulse-dot" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Stellar Testnet</span>
        </div>
        <div className="glass rounded-lg p-3">
          <p className="text-[10px] font-mono text-muted-foreground mb-1">SIGNED IN AS</p>
          <p className="text-xs font-mono text-foreground">Juan_OFW_2026</p>
          <p className="text-[10px] font-mono text-primary mt-1 truncate">G...A4XK...QWT9</p>
        </div>
      </div>
    </aside>
  );
};
