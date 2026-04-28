import { useState } from "react";
import { FileCode2, CheckCircle2, FolderTree } from "lucide-react";
import { cn } from "@/lib/utils";

const files = {
  "lib.rs": {
    lang: "rust",
    code: `#![no_std]
use soroban_sdk::{contract, contractimpl, Env, Address, Symbol};

#[contract]
pub struct FlightGuard;

#[contractimpl]
impl FlightGuard {
    /// Oracle reports flight delay. Auto-settles if threshold breached.
    pub fn oracle_report(env: Env, flight_id: Symbol, delay_min: u32) {
        let policy = Self::load_policy(&env, &flight_id);
        if delay_min >= policy.threshold {
            Self::disburse(&env, &policy.beneficiary, policy.payout);
            env.events().publish(("settled",), (flight_id, delay_min));
        }
    }

    pub fn purchase_cover(env: Env, buyer: Address, flight_id: Symbol) -> u64 {
        buyer.require_auth();
        Self::lock_premium(&env, &buyer, 5_000_000); // 5 USDC
        Self::create_policy(&env, &buyer, flight_id, 180, 200_000_000)
    }
}`,
  },
  "test.rs": {
    lang: "rust",
    code: `#[cfg(test)]
mod tests {
    use super::*;

    #[test] fn happy_path_settles_at_3h()        { /* ... */ }    // ✓
    #[test] fn double_claim_is_rejected()        { /* ... */ }    // ✓
    #[test] fn under_threshold_holds_escrow()    { /* ... */ }    // ✓
    #[test] fn unauthorized_oracle_reverts()     { /* ... */ }    // ✓
    #[test] fn liquidity_drain_is_capped()       { /* ... */ }    // ✓
}`,
  },
  "Cargo.toml": {
    lang: "toml",
    code: `[package]
name = "flight_guard"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
soroban-sdk = "21.0.0"

[dev-dependencies]
soroban-sdk = { version = "21.0.0", features = ["testutils"] }`,
  },
  "README.md": {
    lang: "md",
    code: `# Flight Guard 🛫

Parametric flight-delay insurance on Stellar Soroban.
Built for OFW travelers — payouts in USDC, cashable at MoneyGram.

## Flow
1. Traveler scans boarding pass → \`purchase_cover()\`
2. Oracle posts delay → \`oracle_report()\`
3. Auto-settle disburses USDC → MoneyGram pickup`,
  },
};

const tests = [
  "happy_path_settles_at_3h",
  "double_claim_is_rejected",
  "under_threshold_holds_escrow",
  "unauthorized_oracle_reverts",
  "liquidity_drain_is_capped",
];

const highlight = (code: string) =>
  code
    .replace(/(\/\/.*)/g, '<span class="text-console-comment">$1</span>')
    .replace(/(#\[.*?\])/g, '<span class="text-warning">$1</span>')
    .replace(/\b(pub|fn|let|mut|struct|impl|use|mod|cfg|test|return|if|self|env|crate|edition|version|name)\b/g, '<span class="text-secondary">$1</span>')
    .replace(/\b(Env|Address|Symbol|FlightGuard|String|u32|u64|bool)\b/g, '<span class="text-primary-glow">$1</span>')
    .replace(/("[^"]*")/g, '<span class="text-console-string">$1</span>')
    .replace(/\b(\d+_?\d*)\b/g, '<span class="text-success">$1</span>');

export const CodeVault = () => {
  const [active, setActive] = useState<keyof typeof files>("lib.rs");
  const file = files[active];

  return (
    <div className="rounded-2xl border border-border bg-console-bg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-console-border bg-card/50">
        <div className="flex items-center gap-2.5">
          <FolderTree className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Code Vault</h3>
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">/ contracts/flight_guard</span>
        </div>
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-destructive/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-warning/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-success/70" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-console-border bg-background/30 overflow-x-auto scrollbar-thin">
        {(Object.keys(files) as (keyof typeof files)[]).map((name) => (
          <button
            key={name}
            onClick={() => setActive(name)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 font-mono text-xs whitespace-nowrap border-r border-console-border transition-colors",
              active === name
                ? "bg-console-bg text-foreground border-t-2 border-t-primary -mt-px"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
            )}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            {name}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_280px]">
        {/* Code */}
        <div className="overflow-x-auto scrollbar-thin p-5">
          <pre className="font-mono text-[12px] leading-relaxed">
            <code dangerouslySetInnerHTML={{ __html: highlight(file.code) }} />
          </pre>
        </div>

        {/* Test panel (only on test.rs, but show on all for context) */}
        <div className="border-t lg:border-t-0 lg:border-l border-console-border bg-background/40 p-5">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Test Suite · 5/5 ✓</p>
          <div className="space-y-2">
            {tests.map((t) => (
              <div key={t} className="flex items-start gap-2 font-mono text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                <span className="text-foreground/90">{t}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-border/60 space-y-1.5 font-mono text-[10px] text-muted-foreground">
            <div className="flex justify-between"><span>coverage</span><span className="text-success">98.2%</span></div>
            <div className="flex justify-between"><span>build</span><span className="text-success">passing</span></div>
            <div className="flex justify-between"><span>audit</span><span className="text-primary-glow">in review</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
