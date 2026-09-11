import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Scan } from "lucide-react";
import { Extras } from "@/components/detect/extras";
import { ScanReport } from "@/components/detect/scan-report";
import { Button } from "@/components/ui/button";
import { useScan } from "@/hooks/use-scan";
import type { Lang, ProxyHitKind } from "@/lib/detect/types";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [lang, setLang] = useState<Lang>("zh");
  const [proxyKind, setProxyKind] = useState<ProxyHitKind>("none");
  const { phase, revealed, fp, geo, run } = useScan();
  const c = t(lang);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("qujie-lang");
      if (saved === "en" || saved === "zh") setLang(saved);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const tmr = window.setTimeout(() => {
      void run(proxyKind);
    }, 280);
    return () => window.clearTimeout(tmr);
    // first auto-scan only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function switchLang(next: Lang) {
    setLang(next);
    try {
      localStorage.setItem("qujie-lang", next);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklab, var(--color-fg) 6%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--color-fg) 6%, transparent) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "linear-gradient(180deg, black, transparent)",
        }}
      />

      <header className="relative mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-5">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-[8px] border border-line-strong">
            <span className="size-2 rounded-full bg-blocked" />
          </span>
          <div>
            <p className="font-display text-lg leading-none">{c.brand}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">{c.tag}</p>
          </div>
        </div>
        <div className="flex rounded-[10px] border border-line p-0.5">
          {(["zh", "en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => switchLang(l)}
              className={cn(
                "h-8 min-w-10 rounded-[8px] px-3 font-mono text-[11px] uppercase",
                lang === l ? "bg-fg text-bg" : "text-muted",
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </header>

      <main className="relative mx-auto max-w-5xl px-5 pb-20">
        <section className="grid gap-8 pb-10 pt-6 lg:grid-cols-[minmax(0,1.15fr)_auto] lg:items-end">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-subtle">
              Claude · unsupported region
            </p>
            <h1 className="mt-3 max-w-xl font-display text-[2.15rem] leading-[1.15] tracking-tight sm:text-5xl">
              {c.hero}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">{c.sub}</p>
          </div>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-stretch">
            <Button
              size="lg"
              onClick={() => void run(proxyKind)}
              disabled={phase === "running"}
            >
              <Scan className="size-4" />
              {phase === "running" ? c.scanning : phase === "done" ? c.rescan : c.scan}
            </Button>
            <p className="text-center font-mono text-[11px] text-subtle sm:text-left lg:text-center">
              {lang === "zh" ? "本机指纹不上传" : "local fingerprints stay here"}
            </p>
          </div>
        </section>

        <ScanReport lang={lang} phase={phase} revealed={revealed} fp={fp} geo={geo} proxyKind={proxyKind} />

        <div className="mt-16">
          <Extras
            lang={lang}
            onProxyKind={setProxyKind}
          />
        </div>

        <footer className="mt-16 border-t border-line pt-6 text-xs leading-relaxed text-subtle">
          {c.disclaimer}
        </footer>
      </main>
    </div>
  );
}
