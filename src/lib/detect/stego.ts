import type { ProxyHitKind, StegoPreview } from "./types";

const CHINA_TZ = new Set([
  "Asia/Shanghai",
  "Asia/Urumqi",
  "Asia/Chongqing",
  "Asia/Chungking",
  "Asia/Harbin",
  "Asia/Kashgar",
  "PRC",
  "Asia/Beijing",
]);

const APOSTROPHE: Record<ProxyHitKind, { char: string; name: string }> = {
  none: { char: "'", name: "U+0027 ASCII apostrophe" },
  domain: { char: "\u2019", name: "U+2019 right single quotation" },
  lab: { char: "\u02BC", name: "U+02BC modifier letter apostrophe" },
  both: { char: "\u02B9", name: "U+02B9 modifier letter prime" },
};

export function isChinaTimezone(tz: string): boolean {
  return CHINA_TZ.has(tz);
}

export function buildStego(timezone: string, proxyHit: ProxyHitKind): StegoPreview {
  const chinaTz = isChinaTimezone(timezone);
  const dateSep: "-" | "/" = chinaTz ? "/" : "-";
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const apo = APOSTROPHE[proxyHit];
  const dateLine = `Today${apo.char}s date is ${y}${dateSep}${m}${dateSep}${d}.`;
  return {
    timezone,
    chinaTz,
    dateLine,
    dateSep,
    apostrophe: apo.char,
    apostropheName: apo.name,
    proxyHit,
  };
}
