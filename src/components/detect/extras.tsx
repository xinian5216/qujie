import { useMemo, useState } from "react";
import { HIGHLIGHT_UNSUPPORTED, isSupportedIso, lookupCountry } from "@/lib/detect/countries";
import { LAB_PROFILES, materializeProfile } from "@/lib/detect/profiles";
import { inspectProxyHostname } from "@/lib/detect/proxy-keywords";
import type { Lang, ProxyHitKind } from "@/lib/detect/types";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  lang: Lang;
  onProxyKind: (kind: ProxyHitKind) => void;
};

const FAQ = [
  {
    zh: "这是 Anthropic 的官方判定吗？",
    en: "Is this Anthropic’s real decision?",
    aZh: "不是。地区层对照的是官方支持名单；本机指纹对照的是公开逆向报告。真实风控还会看支付、手机号、账号行为。",
    aEn: "No. The region layer uses the public supported list; local fingerprints follow public reverse-engineering. Real enforcement also uses payments, phone numbers and account behavior.",
  },
  {
    zh: "为什么时区比 IP 更关键？",
    en: "Why is timezone more important than IP?",
    aZh: "换 VPN 只改出口 IP。Claude Code 读的是操作系统时区，并且会把它藏进 system prompt。Asia/Shanghai 或 Asia/Urumqi 是原生信号。",
    aEn: "A VPN only changes the exit IP. Claude Code reads the OS timezone and hides it in the system prompt. Asia/Shanghai or Asia/Urumqi is the native signal.",
  },
  {
    zh: "香港为什么也不行？",
    en: "Why is Hong Kong blocked too?",
    aZh: "官方支持名单不含香港与澳门。经香港云 ASN 出口，常见返回 302 app-unavailable-in-region。台湾在名单内。",
    aEn: "Hong Kong and Macau are not on the list. Hong Kong cloud ASN exits often get 302 app-unavailable-in-region. Taiwan is listed as supported.",
  },
  {
    zh: "会上传我的指纹吗？",
    en: "Do you upload my fingerprints?",
    aZh: "本机十项指纹只在浏览器里计算。出口 IP 查询会把当前请求的地址发到地理定位接口，这是地区检测所必需的。",
    aEn: "The ten local fingerprints stay in the browser. Exit-IP lookup sends the current request address to a geolocation API — required for the region check.",
  },
  {
    zh: "分数低就一定能用 Claude 吗？",
    en: "Does a low score mean Claude will work?",
    aZh: "不能保证。低分只说明浏览器侧中国画像较弱。账号注册地、支付渠道、中转域名仍可能触发限制。",
    aEn: "No. Low score only means the browser-side China portrait is weak. Account locale, payment rails and relay hostnames can still trigger limits.",
  },
];

export function Extras({ lang, onProxyKind }: Props) {
  const c = t(lang);
  const [q, setQ] = useState("");
  const [host, setHost] = useState("");
  const [proxy, setProxy] = useState<ReturnType<typeof inspectProxyHostname> | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const hits = useMemo(() => lookupCountry(q).slice(0, 8), [q]);

  function checkHost() {
    const r = inspectProxyHostname(host);
    setProxy(r);
    onProxyKind(r.kind);
  }

  return (
    <div className="grid gap-10">
      <section>
        <h2 className="font-display text-2xl">{c.method}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[
            {
              n: "01",
              zh: "地区层 · 出口 IP",
              en: "Region layer · exit IP",
              bZh: "Claude.ai 用 IP 粗粒度国家判断。不在支持名单则 302 到 app-unavailable-in-region。中国大陆、香港、澳门均不在名单。",
              bEn: "Claude.ai maps the exit IP to a country. Unsupported regions get 302 app-unavailable-in-region. Mainland China, Hong Kong and Macau are absent.",
            },
            {
              n: "02",
              zh: "Claude Code · 时区",
              en: "Claude Code · timezone",
              bZh: "非官方 ANTHROPIC_BASE_URL 时读取 Intl 时区。Asia/Shanghai、Asia/Urumqi 把日期从 2026-09-11 改成 2026/09/11。",
              bEn: "Unofficial ANTHROPIC_BASE_URL causes a timezone read. Asia/Shanghai / Urumqi flip the date from 2026-09-11 to 2026/09/11.",
            },
            {
              n: "03",
              zh: "中转 hostname",
              en: "Relay hostname",
              bZh: "对照公开的中国云 / AI 实验室 / 转售关键词。命中结果用四种几乎一样的撇号编进 Today’s。",
              bEn: "Hostnames are checked against Chinese cloud / lab / reseller keywords. The hit is encoded with four look-alike apostrophes in “Today’s”.",
            },
            {
              n: "04",
              zh: "本机相关指纹",
              en: "Related local fingerprints",
              bZh: "语言、中文字体、国产浏览器、WebRTC 泄露等不是 Claude Code 的原生字段，但和「人在中国」高度相关。",
              bEn: "Language, CJK fonts, Chinese browsers and WebRTC leaks are not native Claude Code fields, but they correlate with a China presence.",
            },
          ].map((item) => (
            <article key={item.n} className="rounded-lg border border-line bg-bg-elevated p-5">
              <p className="font-mono text-[11px] text-subtle">{item.n}</p>
              <h3 className="mt-2 text-base font-medium">{lang === "zh" ? item.zh : item.en}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{lang === "zh" ? item.bZh : item.bEn}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-line bg-bg-elevated p-5 sm:p-6">
          <h2 className="font-display text-xl">{c.countries}</h2>
          <p className="mt-1 text-sm text-muted">
            {lang === "zh" ? "对照 Anthropic 公开支持名单（Claude.ai / API）。" : "Against Anthropic’s public Claude.ai / API list."}
          </p>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={lang === "zh" ? "中国、香港、US、Japan…" : "China, Hong Kong, US, Japan…"}
            suppressHydrationWarning
            className="mt-4 h-11 w-full rounded-md border border-line bg-bg px-3 text-sm text-fg placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
          <ul className="mt-3 divide-y divide-line">
            {hits.map((row) => {
              const ok = isSupportedIso(row.iso);
              return (
                <li key={row.iso} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="text-sm">
                    {lang === "zh" ? row.zh : row.en}
                    <span className="ml-2 font-mono text-[11px] text-subtle">{row.iso}</span>
                  </span>
                  <span className={cn("font-mono text-[11px] uppercase", ok ? "text-clear" : "text-blocked")}>
                    {ok ? c.supported : c.unsupported}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 border-t border-line pt-4">
            <p className="text-xs text-subtle">{lang === "zh" ? "重点不支持地区" : "Notable unsupported"}</p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {HIGHLIGHT_UNSUPPORTED.map((u) => (
                <li
                  key={u.iso}
                  className="rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-muted"
                  title={lang === "zh" ? u.whyZh : u.whyEn}
                >
                  {lang === "zh" ? u.zh : u.en}
                </li>
              ))}
            </ul>
          </div>
        </article>

        <article className="rounded-xl border border-line bg-bg-elevated p-5 sm:p-6">
          <h2 className="font-display text-xl">{c.proxy}</h2>
          <p className="mt-1 text-sm text-muted">
            {lang === "zh"
              ? "只做本地字符串比对，不会请求该域名。"
              : "Local string match only — the hostname is never fetched."}
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder={c.proxyHint}
              suppressHydrationWarning
              className="h-11 min-w-0 flex-1 rounded-md border border-line bg-bg px-3 text-sm text-fg placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <Button type="button" variant="ghost" onClick={checkHost}>
              {c.proxyGo}
            </Button>
          </div>
          {proxy ? (
            <div className="mt-4 rounded-md bg-bg px-3 py-3">
              <p className="font-mono text-xs text-muted">{proxy.host || "—"}</p>
              <p
                className={cn(
                  "mt-2 text-sm",
                  proxy.kind === "none" ? "text-clear" : "text-blocked",
                )}
              >
                {proxy.kind === "none"
                  ? lang === "zh"
                    ? "未命中已知中国云 / 实验室 / 转售关键词"
                    : "No known Chinese cloud / lab / reseller keyword"
                  : lang === "zh"
                    ? `命中类型：${proxy.kind}`
                    : `Hit kind: ${proxy.kind}`}
              </p>
              {proxy.matches.length ? (
                <p className="mt-1 font-mono text-[11px] text-subtle">{proxy.matches.join(" · ")}</p>
              ) : null}
            </div>
          ) : null}
        </article>
      </section>

      <section>
        <h2 className="font-display text-2xl">{c.lab}</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          {lang === "zh"
            ? "对照样本说明「出口在支持地区」和「本机仍像中国用户」可以同时成立——这正是针对中国用户的第二层检测。"
            : "These profiles show a supported exit and a China-like local portrait can coexist — the second layer aimed at Chinese users."}
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LAB_PROFILES.map((p) => {
            const m = materializeProfile(p);
            return (
              <li key={p.id} className="rounded-lg border border-line bg-bg-elevated p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-medium">{lang === "zh" ? p.zh : p.en}</h3>
                  <span className="font-mono text-sm tabular-nums text-fg">{m.score}</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted">{lang === "zh" ? p.blurbZh : p.blurbEn}</p>
                <p
                  className={cn(
                    "mt-3 font-mono text-[10px] uppercase tracking-wider",
                    p.geo.supported ? "text-clear" : "text-blocked",
                  )}
                >
                  {p.geo.countryCode} · {p.geo.supported ? c.supported : c.unsupported}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl">{c.faq}</h2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {FAQ.map((item, i) => (
            <li key={item.zh}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 py-4 text-left"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="text-sm font-medium">{lang === "zh" ? item.zh : item.en}</span>
                <span className="font-mono text-subtle">{openFaq === i ? "–" : "+"}</span>
              </button>
              {openFaq === i ? (
                <p className="pb-4 text-sm leading-relaxed text-muted">{lang === "zh" ? item.aZh : item.aEn}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
