import { MapPin, Navigation } from "lucide-react";

const cashPoints = [
  { id: 1, name: "MoneyGram · NAIA T3 Arrivals", distance: "0.2 km", x: 52, y: 48, primary: true },
  { id: 2, name: "MoneyGram · Resorts World Manila", distance: "0.8 km", x: 28, y: 32 },
  { id: 3, name: "MoneyGram · Newport Mall", distance: "1.1 km", x: 72, y: 26 },
  { id: 4, name: "MoneyGram · Pasay Cash Hub", distance: "2.4 km", x: 18, y: 70 },
  { id: 5, name: "MoneyGram · Parañaque Plaza", distance: "3.6 km", x: 80, y: 76 },
];

export const MoneyGramMap = () => {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <MapPin className="w-4 h-4 text-secondary" />
          <h3 className="font-semibold">MoneyGram Cash-Out Map</h3>
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">/ NAIA Terminal 3</span>
        </div>
        <span className="font-mono text-[11px] text-success">5 locations nearby</span>
      </div>

      <div className="relative h-80 bg-background grid-bg overflow-hidden">
        {/* runways */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M 10 50 Q 30 30, 50 48 T 90 50" stroke="hsl(var(--primary) / 0.3)" strokeWidth="0.4" fill="none" strokeDasharray="2 2" />
          <path d="M 5 65 L 95 35" stroke="hsl(var(--border))" strokeWidth="0.3" fill="none" />
          <circle cx="52" cy="48" r="18" fill="hsl(var(--secondary) / 0.06)" />
          <circle cx="52" cy="48" r="12" fill="hsl(var(--secondary) / 0.08)" />
        </svg>

        {/* terminal label */}
        <div className="absolute top-4 left-4 glass rounded-lg px-3 py-2">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Hub</p>
          <p className="font-mono text-xs text-foreground">NAIA T3 · 14.5086° N</p>
        </div>

        {/* pins */}
        {cashPoints.map((p) => (
          <button
            key={p.id}
            className="absolute -translate-x-1/2 -translate-y-full group"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            <div className="relative">
              {p.primary && (
                <span className="absolute inset-0 rounded-full bg-secondary/40 animate-ping" style={{ width: 32, height: 32, top: -4, left: -4 }} />
              )}
              <div className={`relative flex items-center justify-center w-6 h-6 rounded-full ${p.primary ? "bg-secondary glow-pop" : "bg-secondary/80"} text-white text-[9px] font-bold font-mono shadow-lg`}>
                MG
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-secondary" />
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity glass rounded-md px-2 py-1 whitespace-nowrap pointer-events-none z-10">
              <p className="font-mono text-[10px] text-foreground">{p.name}</p>
              <p className="font-mono text-[9px] text-muted-foreground">{p.distance}</p>
            </div>
          </button>
        ))}

        {/* compass */}
        <div className="absolute bottom-4 right-4 glass rounded-lg p-2 flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5 text-primary" />
          <span className="font-mono text-[10px] text-muted-foreground">N</span>
        </div>
      </div>
    </div>
  );
};
