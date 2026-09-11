import { isChinaRegion, isSupportedIso } from "./countries";
import { CHINESE_CLOUD_ORG, HOSTING_ORG } from "./proxy-keywords";
import type { GeoResult } from "./types";

function orgLooks(list: string[], org: string | null): boolean {
  if (!org) return false;
  const hay = org.toLowerCase();
  return list.some((k) => hay.includes(k));
}

export function geoLooksEmpty(geo: GeoResult | null): boolean {
  if (!geo) return true;
  if (geo.countryCode) return false;
  if (!geo.ip || geo.ip === "0.0.0.0" || geo.ip === "unknown") return true;
  return false;
}

export async function lookupClientGeo(): Promise<GeoResult | null> {
  try {
    const res = await fetch("https://ipwho.is/");
    if (!res.ok) return null;
    const data = (await res.json()) as {
      success?: boolean;
      ip?: string;
      country?: string;
      country_code?: string;
      region?: string;
      city?: string;
      connection?: { asn?: number; org?: string; isp?: string };
    };
    if (data.success === false || !data.country_code) return null;
    const org = data.connection?.org ?? null;
    const isp = data.connection?.isp ?? org;
    const countryCode = data.country_code.toUpperCase();
    return {
      ip: data.ip ?? "unknown",
      countryCode,
      country: data.country ?? null,
      region: data.region ?? null,
      city: data.city ?? null,
      asn: data.connection?.asn != null ? `AS${data.connection.asn}` : null,
      org,
      isp,
      isHosting: orgLooks(HOSTING_ORG, org) || orgLooks(HOSTING_ORG, isp),
      isChineseCloud: orgLooks(CHINESE_CLOUD_ORG, org) || orgLooks(CHINESE_CLOUD_ORG, isp),
      supported: isSupportedIso(countryCode),
      chinaRegion: isChinaRegion(countryCode),
      acceptLanguage: typeof navigator !== "undefined" ? navigator.languages?.join(",") ?? null : null,
      headerCountry: null,
      source: "ipwho.is-client",
      extra: [],
    };
  } catch {
    /* try geojs */
  }
  try {
    const res = await fetch("https://get.geojs.io/v1/ip/geo.json");
    if (!res.ok) return null;
    const data = (await res.json()) as {
      ip?: string;
      country?: string;
      country_code?: string;
      region?: string;
      city?: string;
      organization_name?: string;
      organization?: string;
      asn?: string;
    };
    if (!data.country_code) return null;
    const org = data.organization_name ?? data.organization ?? null;
    const countryCode = data.country_code.toUpperCase();
    return {
      ip: data.ip ?? "unknown",
      countryCode,
      country: data.country ?? null,
      region: data.region ?? null,
      city: data.city ?? null,
      asn: data.asn ? `AS${data.asn}` : null,
      org,
      isp: org,
      isHosting: orgLooks(HOSTING_ORG, org),
      isChineseCloud: orgLooks(CHINESE_CLOUD_ORG, org),
      supported: isSupportedIso(countryCode),
      chinaRegion: isChinaRegion(countryCode),
      acceptLanguage: typeof navigator !== "undefined" ? navigator.languages?.join(",") ?? null : null,
      headerCountry: null,
      source: "geojs-client",
      extra: [],
    };
  } catch {
    return null;
  }
}
