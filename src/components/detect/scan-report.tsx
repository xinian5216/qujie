import { Check, Globe, Minus, Radio, ShieldAlert, Server } from "lucide-react";
import { ScoreRing } from "@/components/detect/score-ring";
import { countryLabel } from "@/lib/detect/countries";
import { combineVerdict } from "@/lib/detect/score";
import { buildStego } from "@/lib/detect/stego";
import type { CombinedVerdict, FingerprintResult, GeoResult, Lang, ProxyHitKind, ScanPhase } from "@/lib/detect/types";
import { t, verdictCopy } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Props = {
  lang: Lang;
  phase: ScanPhase;
  revealed: number;
  fp: FingerprintResult | null;
  geo: GeoResult | null;
  proxyKind: ProxyHitKind;
};

function toneClass(v: CombinedVerdict) {
  if (v === "low") return "text-clear";
  if (v === "medium") return "text-risk";
  if (v === "idle") return "text-muted";
  return "text-blocked";
}

function Row({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-2.5 last:border-0">
      <dt className="shrink-0 text-xs text-subtle">{label}</dt>
      <dd className={cn("text-right font-mono text-xs break-all", warn ? "text-blocked" : "text-fg")}>
        {value}
      </dd>
    </div>
  );
}

export function ScanReport({ lang, phase, revealed, fp, geo, proxyKind }: Props) {
  const c = t(lang);
  const score = fp?.score ?? 0;
  const verdict = combineVerdict(geo, score);
  const running = phase === "running";
  const v = verdictCopy[phase === "idle" ? "idle" : verdict];
  const signals = fp?.signals ?? [];
  const visible = phase === "idle" ? [] : signals.slice(0, revealed || (phase === "done" ? signals.length : 0));
  const stego = fp ? buildStego(fp.stego.timezone, proxyKind) : null;

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <article className="rounded-xl border border-line bg-bg-elevated p-6 sm:p-7">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-subtle">{c.local}</p>
        <div className="mt-5">
          <ScoreRing score={score} verdict={phase === "idle" ? "idle" : verdict} running={running} />
        </div>
        <h2 className={cn("mt-5 font-display text-2xl leading-snug", toneClass(phase === "idle" ? "idle" : verdict))}>
          {lang === "zh" ? v.zh : v.en}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{lang === "zh" ? v.hintZh : v.hintEn}</p>
      </article>

      <article className="rounded-xl border border-line bg-bg-elevated p-6 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-subtle">{c.exit}</p>
          {geo ? (
            <span
              className={cn(
                "rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider",
                geo.supported === true
                  ? "bg-clear-dim text-clear"
                  : geo.supported === false
                    ? "bg-blocked-dim text-blocked"
                    : "bg-bg-subtle text-muted",
              )}
            >
              {geo.supported === true ? c.supported : geo.supported === false ? c.unsupported : c.unknown}
            </span>
          ) : null}
        </div>
        {!geo ? (
          <div className="mt-8 flex items-center gap-3 text-sm text-muted">
            <Globe className="size-4" />
            {running ? (lang === "zh" ? "正在解析出口节点…" : "Resolving exit node…") : c.idleHint}
          </div>
        ) : (
          <dl className="mt-4">
            <Row label="IP" value={geo.ip} />
            <Row
              label={lang === "zh" ? "国家 / 地区" : "Country"}
              value={`${countryLabel(geo.countryCode, lang)}${geo.countryCode ? ` · ${geo.countryCode}` : ""}`}
              warn={geo.supported === false}
            />
            <Row label={lang === "zh" ? "城市" : "City"} value={[geo.city, geo.region].filter(Boolean).join(" / ") || "—"} />
            <Row label="ASN / Org" value={[geo.asn, geo.org].filter(Boolean).join(" · ") || "—"} warn={geo.isChineseCloud} />
            <Row
              label={lang === "zh" ? "网络类型" : "Network"}
              value={
                geo.isChineseCloud
                  ? lang === "zh"
                    ? "中国运营商 / 云"
                    : "Chinese ISP / cloud"
                  : geo.isHosting
                    ? lang === "zh"
                      ? "机房 / 托管"
                      : "Hosting / datacenter"
                    : lang === "zh"
                      ? "未检出托管特征"
                      : "No hosting signature"
              }
              warn={geo.isHosting || geo.isChineseCloud}
            />
            <Row label="Accept-Language" value={geo.acceptLanguage || "—"} />
            <Row label={lang === "zh" ? "数据源" : "Source"} value={geo.source} />
            {geo.extra.map((e) => (
              <Row
                key={e.ip}
                label={lang === "zh" ? "WebRTC 泄露" : "WebRTC leak"}
                value={`${e.ip} · ${countryLabel(e.countryCode, lang)}`}
                warn={e.chinaRegion || e.supported === false}
              />
            ))}
          </dl>
        )}
      </article>

      <article className="rounded-xl border border-line bg-bg-elevated p-5 sm:p-6 lg:col-span-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-subtle">
          {lang === "zh" ? "十项本机指纹" : "Ten local fingerprints"}
        </p>
        <ul className="mt-3 divide-y divide-line">
          {visible.length === 0 && (
            <li className="py-8 text-sm text-muted">
              {lang === "zh" ? "点击开始检测后逐项展开。" : "Signals appear one by one after you scan."}
            </li>
          )}
          {visible.map((s) => {
            const hit = s.strength >= 0.25;
            const pts = Math.round(s.weight * s.strength);
            return (
              <li key={s.id} className="grid grid-cols-[auto_1fr_auto] items-start gap-3 py-3.5">
                <span
                  className={cn(
                    "mt-0.5 grid size-7 place-items-center rounded-[8px]",
                    hit ? "bg-blocked-dim text-blocked" : "bg-bg-subtle text-subtle",
                  )}
                >
                  {hit ? <ShieldAlert className="size-3.5" /> : <Check className="size-3.5" />}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{lang === "zh" ? s.labelZh : s.labelEn}</span>
                    {s.claudeNative ? (
                      <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">
                        {c.native}
                      </span>
                    ) : (
                      <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-subtle">
                        {c.related}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{lang === "zh" ? s.detailZh : s.detailEn}</p>
                  <p className="mt-1 font-mono text-[11px] text-subtle">{s.value}</p>
                </div>
                <div className="text-right">
                  <div className={cn("font-mono text-sm tabular-nums", hit ? "text-blocked" : "text-subtle")}>
                    {hit ? `+${pts}` : <Minus className="ml-auto size-4" />}
                  </div>
                  <div className="font-mono text-[10px] text-subtle">w{s.weight}</div>
                </div>
              </li>
            );
          })}
        </ul>
      </article>

      {stego ? (
        <article className="rounded-xl border border-line bg-bg-elevated p-5 sm:p-6 lg:col-span-2">
          <div className="flex items-center gap-2 text-subtle">
            <Radio className="size-4" />
            <p className="font-mono text-[10px] uppercase tracking-[0.22em]">
              {lang === "zh" ? "Claude Code 隐写预览" : "Claude Code stego preview"}
            </p>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            {lang === "zh"
              ? "公开逆向指出：当 ANTHROPIC_BASE_URL 指向非官方端点时，Claude Code 会把「是否中国时区」编进日期分隔符，把中转域名命中情况编进 Today’s 里几乎看不出的撇号变体。"
              : "Public reverse-engineering: when ANTHROPIC_BASE_URL is unofficial, Claude Code encodes a China timezone as a slash date separator, and the proxy-hostname hit as a look-alike apostrophe in “Today’s”."}
          </p>
          <pre className="mt-4 overflow-x-auto rounded-md bg-bg px-4 py-3 font-mono text-sm text-fg">
            {stego.dateLine}
          </pre>
          <dl className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className="rounded-md bg-bg px-3 py-2">
              <dt className="text-[11px] text-subtle">{lang === "zh" ? "日期分隔符" : "Date separator"}</dt>
              <dd className="mt-1 font-mono text-sm">
                {stego.dateSep === "/" ? (
                  <span className="text-blocked">/ · China TZ</span>
                ) : (
                  <span className="text-clear">- · default</span>
                )}
              </dd>
            </div>
            <div className="rounded-md bg-bg px-3 py-2">
              <dt className="text-[11px] text-subtle">{lang === "zh" ? "撇号码点" : "Apostrophe"}</dt>
              <dd className="mt-1 font-mono text-sm">{stego.apostropheName}</dd>
            </div>
            <div className="rounded-md bg-bg px-3 py-2">
              <dt className="text-[11px] text-subtle">{lang === "zh" ? "中转命中" : "Proxy hit"}</dt>
              <dd className="mt-1 font-mono text-sm">{stego.proxyHit}</dd>
            </div>
          </dl>
        </article>
      ) : null}

      {geo?.isHosting ? (
        <p className="flex items-center gap-2 text-xs text-muted lg:col-span-2">
          <Server className="size-3.5" />
          {lang === "zh"
            ? "出口 ASN 看起来像机房 / VPN。地区层可能放行，但账号风控仍可能提高权重。"
            : "Exit ASN looks like hosting / VPN. The region layer may allow you; account risk scoring can still rise."}
        </p>
      ) : null}
    </section>
  );
}
