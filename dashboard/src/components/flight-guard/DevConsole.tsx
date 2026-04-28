import { useEffect, useRef } from "react";
import { Terminal } from "lucide-react";

export interface ConsoleLine {
  id: number;
  type: "log" | "state" | "tx" | "error" | "success" | "comment";
  text: string;
}

interface DevConsoleProps {
  lines: ConsoleLine[];
  state: Record<string, unknown>;
}

const colorFor = (type: ConsoleLine["type"]) => {
  switch (type) {
    case "state": return "text-console-key";
    case "tx": return "text-primary-glow";
    case "error": return "text-destructive";
    case "success": return "text-success";
    case "comment": return "text-console-comment";
    default: return "text-console-text";
  }
};

export const DevConsole = ({ lines, state }: DevConsoleProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="flex flex-col h-full bg-console-bg border-l border-console-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-console-border">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-console-text" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Full-Stack Monitor</span>
        </div>
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-destructive/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-warning/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-success/70" />
        </div>
      </div>

      {/* Live State */}
      <div className="px-4 py-3 border-b border-console-border bg-black/30">
        <p className="font-mono text-[10px] text-console-comment uppercase tracking-wider mb-2">// contract.state</p>
        <pre className="font-mono text-[11px] leading-relaxed text-console-text overflow-x-auto scrollbar-thin">
{`{`}
{Object.entries(state).map(([k, v]) => (
  <div key={k}>
    {`  `}<span className="text-console-key">"{k}"</span>: <span className={typeof v === "string" ? "text-console-string" : "text-console-text"}>{typeof v === "string" ? `"${v}"` : String(v)}</span>,
  </div>
))}
{`}`}
        </pre>
      </div>

      {/* Logs */}
      <div className="px-4 py-2 border-b border-console-border">
        <p className="font-mono text-[10px] text-console-comment uppercase tracking-wider">// stream.logs</p>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-2 scrollbar-thin font-mono text-[11px] leading-[1.7]">
        {lines.map((line) => (
          <div key={line.id} className="flex gap-2 group">
            <span className="text-console-comment shrink-0">{String(line.id).padStart(3, "0")}</span>
            <span className={colorFor(line.type)}>{line.text}</span>
          </div>
        ))}
        <div className="flex gap-2 mt-1">
          <span className="text-console-comment">›</span>
          <span className="text-console-text animate-pulse">_</span>
        </div>
      </div>
    </div>
  );
};
