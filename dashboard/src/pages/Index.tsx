import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ArrowRight, Plane, Shield, Banknote, Check, Star, ChevronDown, Wallet } from "lucide-react";
import { toast } from "sonner";
import heroTraveler from "@/assets/hero-traveler.jpg";
import flatlay from "@/assets/flatlay-travel.jpg";
import waiting from "@/assets/lifestyle-waiting.jpg";
import cashout from "@/assets/lifestyle-cashout.jpg";
import { connectWallet, purchaseCover } from "@/lib/stellar";

const THRESHOLD = 180;

const Index = () => {
  const [delay, setDelay] = useState(45);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [address, setAddress] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    const checkWallet = async () => {
      try {
        const addr = await connectWallet();
        if (addr) setAddress(addr);
      } catch (e) {
        console.warn("Auto-wallet connection failed:", e);
      }
    };
    checkWallet();
  }, []);

  const handleConnect = async () => {
    try {
      const addr = await connectWallet();
      if (addr) {
        setAddress(addr);
        toast.success("Wallet connected", { description: addr });
      } else {
        toast.error("Could not connect wallet", { description: "Make sure Freighter is installed and unlocked." });
      }
    } catch (e) {
      toast.error("Connection error", { description: String(e) });
    }
  };

  const handlePurchase = async () => {
    if (!address) {
      handleConnect();
      return;
    }

    setIsPurchasing(true);
    const flightId = "FG" + Math.floor(Math.random() * 1000); // Random flight ID for demo
    try {
      toast.info("Purchasing cover...", { description: `Registering flight ${flightId}` });
      const result = await purchaseCover(flightId, 5, 200, THRESHOLD);
      console.log("Purchase result:", result);
      toast.success("Cover purchased!", { description: `Flight ${flightId} is now protected on-chain.` });
    } catch (e) {
      console.error(e);
      toast.error("Purchase failed", { description: String(e) });
    } finally {
      setIsPurchasing(false);
    }
  };

  const eligible = delay >= THRESHOLD;
  const payout = eligible ? 200 : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ───────────────────── NAV ───────────────────── */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border/60">
        <div className="container-narrow flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground grid place-items-center">
              <Plane className="w-4 h-4" strokeWidth={2.5} />
            </span>
            <span className="font-display text-lg font-semibold">Flight Guard</span>
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#try" className="hover:text-foreground transition-colors">Try it</a>
            <a href="#stories" className="hover:text-foreground transition-colors">Stories</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            {address ? (
              <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full border border-border/50">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-mono text-muted-foreground">
                  {typeof address === "string" ? (
                    `${address.slice(0, 4)}...${address.slice(-4)}`
                  ) : (
                    "Connected"
                  )}
                </span>
              </div>
            ) : (
              <Button variant="outline" size="sm" className="rounded-full px-4 h-9 gap-2" onClick={handleConnect}>
                <Wallet className="w-3.5 h-3.5" /> Connect
              </Button>
            )}
            <Button size="sm" className="rounded-full px-5 h-9" onClick={handlePurchase} disabled={isPurchasing}>
              {isPurchasing ? "Processing..." : "Get cover"}
            </Button>
          </div>
        </div>
      </nav>

      {/* ───────────────────── HERO ───────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--gradient-sun)" }} />
        <div className="container-narrow pt-20 pb-24 lg:pt-28 lg:pb-32 grid lg:grid-cols-12 gap-12 items-center relative">
          <div className="lg:col-span-6 animate-fade-up">
            <p className="eyebrow mb-5">Parametric travel cover</p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-medium leading-[1.02] tracking-tight">
              When your flight is late,<br />
              <span className="italic text-secondary">we pay you</span>.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-md leading-relaxed">
              5 USDC of cover. If your flight is delayed by more than 3 hours,
              200 USDC lands automatically — cashable at any MoneyGram counter.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button size="lg" className="rounded-full h-12 px-7 text-base shadow-[var(--shadow-lift)]" onClick={handlePurchase} disabled={isPurchasing}>
                {isPurchasing ? "Processing..." : "Buy cover for $5"} <ArrowRight className="ml-1 w-4 h-4" />
              </Button>
              <a href="#how" className="text-sm font-medium text-foreground/80 hover:text-foreground inline-flex items-center gap-1">
                See how it works <ChevronDown className="w-4 h-4" />
              </a>
            </div>
            <div className="mt-10 flex items-center gap-6 text-xs text-muted-foreground">
              <div className="flex -space-x-2">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-background"
                    style={{ background: ["#d4a574","#8e6e53","#c08b6e","#a0826d"][i-1] }} />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-foreground">
                  {[...Array(5)].map((_,i) => <Star key={i} className="w-3 h-3 fill-accent text-accent" />)}
                  <span className="ml-1 font-medium">4.9</span>
                </div>
                <span>Trusted by 12,847 travelers</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative animate-fade-up" style={{ animationDelay: "120ms" }}>
            <div className="relative rounded-[2rem] overflow-hidden shadow-[var(--shadow-lift)] aspect-[4/5]">
              <img
                src={heroTraveler}
                alt="A young Filipina traveler smiling at her phone in a sunlit airport terminal"
                width={1600}
                height={1280}
                className="w-full h-full object-cover"
              />
            </div>
            {/* floating notification card */}
            <div className="absolute -bottom-6 -left-4 sm:left-auto sm:-right-6 bg-card rounded-2xl p-4 shadow-[var(--shadow-lift)] border border-border w-[260px] animate-fade-up"
                 style={{ animationDelay: "400ms" }}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-success/10 grid place-items-center shrink-0">
                  <Check className="w-4 h-4 text-success" strokeWidth={3} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Just now</p>
                  <p className="text-sm font-medium leading-snug">200 USDC paid out for flight PR-218</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Pickup at NAIA T3 · MoneyGram</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────── LOGO STRIP ───────────────────── */}
      <section className="border-y border-border/60 bg-muted/40">
        <div className="container-narrow py-8 flex flex-wrap items-center justify-between gap-x-12 gap-y-4 text-muted-foreground">
          <p className="text-xs uppercase tracking-wider">Powered by</p>
          {["Stellar", "Soroban", "MoneyGram", "USDC", "Reflector"].map((n) => (
            <span key={n} className="font-display text-xl font-medium opacity-70">{n}</span>
          ))}
        </div>
      </section>

      {/* ───────────────────── HOW IT WORKS ───────────────────── */}
      <section id="how" className="py-24 lg:py-32">
        <div className="container-narrow">
          <div className="max-w-2xl">
            <p className="eyebrow mb-4">How it works</p>
            <h2 className="font-display text-4xl sm:text-5xl font-medium tracking-tight leading-[1.1]">
              Three small steps.<br />
              One automatic payout.
            </h2>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              { n: "01", icon: Shield, title: "Buy cover before you fly", body: "Pay 5 USDC at booking. Your flight is registered on-chain in seconds." },
              { n: "02", icon: Plane, title: "Take your flight", body: "An independent oracle watches your flight. You don't lift a finger." },
              { n: "03", icon: Banknote, title: "Get paid if it's late", body: "Delayed by 3+ hours? 200 USDC arrives — pickup cash at MoneyGram." },
            ].map((s, i) => (
              <div key={i} className="group">
                <div className="rounded-2xl bg-card border border-border p-7 h-full shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center justify-between mb-8">
                    <span className="font-mono text-xs text-muted-foreground">{s.n}</span>
                    <div className="w-10 h-10 rounded-full bg-muted grid place-items-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <s.icon className="w-4 h-4" strokeWidth={2} />
                    </div>
                  </div>
                  <h3 className="font-display text-xl font-medium leading-snug">{s.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────── EDITORIAL SPLIT ───────────────────── */}
      <section className="py-16 lg:py-24">
        <div className="container-narrow grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="rounded-[2rem] overflow-hidden aspect-[4/5] shadow-[var(--shadow-card)]">
            <img
              src={flatlay}
              alt="Passport, boarding pass and a phone laid out on warm linen"
              width={1400}
              height={1000}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="eyebrow mb-4">Built for OFW travelers</p>
            <h2 className="font-display text-4xl sm:text-5xl font-medium tracking-tight leading-[1.1]">
              No claims.<br />
              No paperwork.<br />
              <span className="italic text-secondary">Just money.</span>
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed max-w-md">
              Traditional travel insurance asks you to file claims, upload receipts and wait weeks.
              Flight Guard is parametric — when the delay happens, the contract pays. That's it.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Settles in under 3 seconds on Stellar",
                "Cash pickup at 1,200+ MoneyGram counters in PH",
                "Audited Soroban contract — your funds in escrow",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-success/15 text-success grid place-items-center mt-0.5 shrink-0">
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </span>
                  <span className="text-sm text-foreground/90">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ───────────────────── INTERACTIVE SIMULATOR ───────────────────── */}
      <section id="try" className="py-24 lg:py-32 bg-muted/40 border-y border-border/60">
        <div className="container-narrow">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <p className="eyebrow mb-4">Try it yourself</p>
            <h2 className="font-display text-4xl sm:text-5xl font-medium tracking-tight leading-[1.1]">
              Move the slider.<br />
              See what you'd get.
            </h2>
          </div>

          <div className="max-w-3xl mx-auto bg-card rounded-3xl border border-border p-8 sm:p-12 shadow-[var(--shadow-card)]">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-sm text-muted-foreground">Your flight delay</span>
              <span className="font-display text-5xl font-medium tabular-nums">
                {Math.floor(delay/60)}<span className="text-2xl text-muted-foreground">h</span> {delay%60}<span className="text-2xl text-muted-foreground">m</span>
              </span>
            </div>

            <Slider
              value={[delay]}
              onValueChange={(v) => setDelay(v[0])}
              max={360}
              step={5}
              className="my-6"
            />
            <div className="flex justify-between text-xs text-muted-foreground font-mono">
              <span>0h</span>
              <span className={eligible ? "text-secondary font-medium" : ""}>3h trigger</span>
              <span>6h</span>
            </div>

            <div className="mt-10 grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-background border border-border p-6">
                <p className="text-xs text-muted-foreground">You paid</p>
                <p className="font-display text-3xl font-medium mt-1">$5.00</p>
                <p className="text-xs text-muted-foreground mt-1">USDC premium</p>
              </div>
              <div className={`rounded-2xl p-6 transition-all ${eligible ? "bg-primary text-primary-foreground animate-pop" : "bg-background border border-border"}`}>
                <p className={`text-xs ${eligible ? "text-primary-foreground/70" : "text-muted-foreground"}`}>You receive</p>
                <p className="font-display text-3xl font-medium mt-1 tabular-nums">${payout.toFixed(2)}</p>
                <p className={`text-xs mt-1 ${eligible ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {eligible ? "Auto-settled to MoneyGram" : "Below 3h trigger"}
                </p>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full mt-8 h-13 rounded-full text-base"
              onClick={handlePurchase}
              disabled={isPurchasing}
            >
              {isPurchasing ? "Processing..." : "Buy this cover — $5"}
            </Button>
          </div>
        </div>
      </section>

      {/* ───────────────────── STORIES ───────────────────── */}
      <section id="stories" className="py-24 lg:py-32">
        <div className="container-narrow">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <p className="eyebrow mb-4">Real travelers</p>
              <h2 className="font-display text-4xl sm:text-5xl font-medium tracking-tight leading-[1.1] max-w-xl">
                The wait used to cost them. Now it pays.
              </h2>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {[
              { img: waiting, name: "Mark, 32", route: "Doha → Manila",
                quote: "Six-hour delay. By the time I landed, the 200 USDC was already in my MoneyGram.",
                tall: true },
              { img: cashout, name: "Liza, 41", route: "Riyadh → Manila",
                quote: "I picked up cash for my kids the same night. No forms. No phone calls." },
              { img: heroTraveler, name: "Anna, 28", route: "Hong Kong → Cebu",
                quote: "Five dollars felt like nothing — until my flight got cancelled and I got 200 back." },
            ].map((s, i) => (
              <figure key={i} className={`rounded-3xl overflow-hidden bg-card border border-border shadow-[var(--shadow-soft)] ${s.tall ? "lg:row-span-2" : ""}`}>
                <div className={`overflow-hidden ${s.tall ? "aspect-[4/6]" : "aspect-[4/3]"}`}>
                  <img src={s.img} alt={s.name} loading="lazy" width={1200} height={1500} className="w-full h-full object-cover" />
                </div>
                <figcaption className="p-7">
                  <p className="font-display text-lg leading-snug">"{s.quote}"</p>
                  <p className="mt-4 text-sm text-muted-foreground">{s.name} · {s.route}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────── FAQ ───────────────────── */}
      <section id="faq" className="py-24 lg:py-32 bg-muted/40 border-t border-border/60">
        <div className="container-narrow grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <p className="eyebrow mb-4">Questions</p>
            <h2 className="font-display text-4xl sm:text-5xl font-medium tracking-tight leading-[1.1]">
              Good ones,<br />answered.
            </h2>
            <p className="mt-4 text-muted-foreground">Still stuck? <a href="#" className="text-foreground underline underline-offset-4">Talk to a human</a>.</p>
          </div>
          <div className="lg:col-span-8">
            {[
              { q: "What does parametric mean?", a: "Instead of filing a claim, the payout is triggered by an event — in this case, your flight being delayed past a threshold. A neutral oracle reports the delay, and the contract pays automatically." },
              { q: "How do I cash out the USDC?", a: "Walk into any MoneyGram counter with your ID. Pickup is available at 1,200+ locations across the Philippines and 350,000+ globally." },
              { q: "What if my flight is only delayed 2 hours?", a: "Below the 3-hour threshold there's no payout. Premiums are kept low precisely because cover only triggers on serious delays." },
              { q: "Is it really only $5?", a: "Yes. Premium per flight is 5 USDC. Pricing is parametric — same flight, same price, no underwriting paperwork." },
              { q: "What chain is this on?", a: "Stellar, using Soroban smart contracts. Settlement is sub-3 seconds and gas costs are fractions of a cent." },
            ].map((f, i) => (
              <div key={i} className="border-b border-border last:border-0">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-6 text-left group"
                >
                  <span className="font-display text-xl font-medium pr-8">{f.q}</span>
                  <ChevronDown className={`w-5 h-5 shrink-0 text-muted-foreground transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                <div className={`grid transition-all duration-300 ${openFaq === i ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <p className="text-muted-foreground leading-relaxed max-w-2xl">{f.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────── CTA ───────────────────── */}
      <section className="py-24 lg:py-32">
        <div className="container-narrow">
          <div className="rounded-[2.5rem] bg-primary text-primary-foreground p-12 sm:p-16 lg:p-24 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20"
                 style={{ background: "radial-gradient(circle at 80% 20%, hsl(28 90% 70%), transparent 50%)" }} />
            <div className="relative max-w-2xl">
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.05]">
                Your next flight<br />
                <span className="italic">deserves a backup plan</span>.
              </h2>
              <p className="mt-6 text-lg text-primary-foreground/70 max-w-md">
                Five dollars. Two minutes. One less thing to worry about at 30,000 feet.
              </p>
              <Button
                size="lg"
                className="mt-10 h-13 px-8 rounded-full text-base bg-background text-foreground hover:bg-background/90"
                onClick={handlePurchase}
                disabled={isPurchasing}
              >
                {isPurchasing ? "Processing..." : "Get cover for $5"} <ArrowRight className="ml-1 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────── FOOTER ───────────────────── */}
      <footer className="border-t border-border">
        <div className="container-narrow py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground grid place-items-center">
              <Plane className="w-3.5 h-3.5" strokeWidth={2.5} />
            </span>
            <span className="font-display text-base font-semibold">Flight Guard</span>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Contract</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Flight Guard</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
