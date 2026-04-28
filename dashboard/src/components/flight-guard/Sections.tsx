import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import stepScan from "@/assets/step-scan.png";
import stepShield from "@/assets/step-shield.png";
import stepCashout from "@/assets/step-cashout.png";

const steps = [
  { img: stepScan,   title: "Scan boarding pass", text: "Snap your QR. Flight Guard reads route + ETA in seconds." },
  { img: stepShield, title: "Smart contract locks USDC", text: "Premium escrows on Stellar. Threshold: 3hr delay." },
  { img: stepCashout,title: "Cash out at MoneyGram", text: "Auto-settle pings your phone with a cash pickup code." },
];

const faqs = [
  { q: "How do I cash out without a bank?", a: "Once your policy settles, we send an SMS with a MoneyGram reference number. Walk into any partner location with your ID — no bank account needed." },
  { q: "What happens if the Oracle is wrong?", a: "Our oracle pulls from three independent flight data sources. Disputes can be raised on-chain within 72hrs and trigger a multi-sig review by the liquidity DAO." },
  { q: "Is my money safe in the escrow?", a: "Premiums sit in a Soroban contract audited by Certora. Funds are non-custodial — only the contract logic can move them, and the disbursement path is hard-coded to your wallet." },
  { q: "What flights are covered?", a: "Any commercial flight with a public IATA code. Coverage activates 6hrs before scheduled departure and runs until landing + 60 min." },
];

export const HowItWorks = () => (
  <section>
    <div className="flex items-end justify-between mb-6">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-wider text-primary mb-1.5">// visual_guide</p>
        <h2 className="text-2xl font-bold tracking-tight">How it works</h2>
      </div>
      <span className="hidden sm:block font-mono text-[11px] text-muted-foreground">3 steps · ~90 seconds</span>
    </div>

    <div className="grid md:grid-cols-3 gap-4 relative">
      {/* connecting line */}
      <div className="hidden md:block absolute top-24 left-[16%] right-[16%] h-px border-t border-dashed border-border" />

      {steps.map((s, i) => (
        <div key={i} className="relative rounded-2xl border border-border bg-card p-6 group hover:border-primary/40 transition-colors">
          <div className="absolute top-4 right-4 w-7 h-7 rounded-full border border-border bg-background flex items-center justify-center font-mono text-[10px] text-muted-foreground">
            0{i + 1}
          </div>
          <div className="aspect-square w-32 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center overflow-hidden">
            <img src={s.img} alt={s.title} loading="lazy" width={768} height={768} className="w-full h-full object-contain" />
          </div>
          <h3 className="font-semibold text-base mb-1.5 text-center">{s.title}</h3>
          <p className="text-sm text-muted-foreground text-center leading-relaxed">{s.text}</p>
        </div>
      ))}
    </div>
  </section>
);

export const Faq = () => (
  <section>
    <div className="flex items-end justify-between mb-6">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-wider text-primary mb-1.5">// help_center</p>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" /> FAQ
        </h2>
      </div>
    </div>
    <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card divide-y divide-border/60 overflow-hidden">
      {faqs.map((f, i) => (
        <AccordionItem key={i} value={`f-${i}`} className="border-0 px-6">
          <AccordionTrigger className="text-left text-sm font-medium hover:no-underline py-5">
            <span className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">Q.0{i + 1}</span>
              {f.q}
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5 pl-12">
            {f.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </section>
);
