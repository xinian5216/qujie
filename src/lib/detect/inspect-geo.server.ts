import { getRequest } from "@tanstack/react-start/server";
import { isChinaRegion, isSupportedIso } from "./countries";
import { isPublicIpv4 } from "./ip";
import { CHINESE_CLOUD_ORG, HOSTING_ORG } from "./proxy-keywords";
import type { ExtraIpGeo, GeoResult } from "./types";

const IPV4 = /^\d{1,3}(?:\.\d{1,3}){3}$/;

function header(req: Request, name: string): string | null {
  return req.headers.get(name);
}

function firstIp(raw: string | null, publicOnly: boolean): string | null {
  if (!raw) return null;
  for (const part of raw.split(",")) {
    const ip = part.trim().replace(/^::ffff:/, "");
    if (IPV4.test(ip)) {
      if (publicOnly && !isPublicIpv4(ip)) continue;
      if (ip === "0.0.0.0" || ip === "127.0.0.1") continue;
      return ip;
    }
    if (ip.includes(":") && ip !== "::1") return ip;
  }
  return null;
}

function clientIp(req: Request): string {
  return (
    firstIp(header(req, "cf-connecting-ip"), true) ||
    firstIp(header(req, "true-client-ip"), true) ||
    firstIp(header(req, "x-real-ip"), true) ||
    firstIp(header(req, "x-vercel-forwarded-for"), true) ||
    firstIp(header(req, "x-forwarded-for"), true) ||
    firstIp(header(req, "x-forwarded-for"), false) ||
    ""
  );
}

type Lookup = {
  ip?: string;
  countryCode: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  asn: string | null;
  org: string | null;
  isp: string | null;
  isHosting: boolean;
  source: string;
};

function orgLooks(list: string[], org: string | null): boolean {
  if (!org) return false;
  const hay = org.toLowerCase();
  return list.some((k) => hay.includes(k));
}

async function fetchJson(url: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) return null;
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function lookupIpwho(ip: string): Promise<Lookup | null> {
  const url = ip ? `https://ipwho.is/${encodeURIComponent(ip)}` : "https://ipwho.is/";
  const data = await fetchJson(url);
  if (!data || data.success === false) return null;
  const connection = (data.connection ?? {}) as { asn?: number; org?: string; isp?: string };
  const org = connection.org ?? null;
  const isp = connection.isp ?? org;
  const code = typeof data.country_code === "string" ? data.country_code : null;
  if (!code) return null;
  return {
    ip: typeof data.ip === "string" ? data.ip : undefined,
    countryCode: code,
    country: typeof data.country === "string" ? data.country : null,
    region: typeof data.region === "string" ? data.region : null,
    city: typeof data.city === "string" ? data.city : null,
    asn: connection.asn != null ? `AS${connection.asn}` : null,
    org,
    isp,
    isHosting: orgLooks(HOSTING_ORG, org) || orgLooks(HOSTING_ORG, isp),
    source: "ipwho.is",
  };
}

async function lookupGeoJs(ip: string): Promise<Lookup | null> {
  const url = ip
    ? `https://get.geojs.io/v1/ip/geo/${encodeURIComponent(ip)}.json`
    : "https://get.geojs.io/v1/ip/geo.json";
  const data = await fetchJson(url);
  if (!data) return null;
  const org =
    (typeof data.organization_name === "string" && data.organization_name) ||
    (typeof data.organization === "string" && data.organization) ||
    null;
  const code = typeof data.country_code === "string" ? data.country_code : null;
  if (!code) return null;
  return {
    ip: typeof data.ip === "string" ? data.ip : undefined,
    countryCode: code,
    country: typeof data.country === "string" ? data.country : null,
    region: typeof data.region === "string" ? data.region : null,
    city: typeof data.city === "string" ? data.city : null,
    asn: data.asn != null ? `AS${data.asn}` : null,
    org,
    isp: org,
    isHosting: orgLooks(HOSTING_ORG, org),
    source: "geojs",
  };
}

async function lookup(ip: string): Promise<Lookup | null> {
  return (await lookupIpwho(ip)) ?? (await lookupGeoJs(ip));
}

export async function collectGeo(extraIps: string[] = []): Promise<GeoResult> {
  const req = getRequest();
  const parsed = req ? clientIp(req) : "";
  const acceptLanguage = req?.headers.get("accept-language") ?? null;
  const headerCountry = (
    req?.headers.get("x-vercel-ip-country") ||
    req?.headers.get("cf-ipcountry") ||
    ""
  )
    .toUpperCase()
    .replace("XX", "");

  const queryIp = parsed && isPublicIpv4(parsed) ? parsed : "";
  const looked = await lookup(queryIp);
  const ip = (looked?.ip || parsed || "unknown").replace(/^::ffff:/, "");
  const countryCode = (looked?.countryCode || headerCountry || null)?.toUpperCase() || null;
  const source = looked?.source ?? (headerCountry ? "request-header" : "none");

  const extra: ExtraIpGeo[] = [];
  const unique = [...new Set(extraIps.filter(isPublicIpv4))].filter((x) => x !== ip).slice(0, 3);
  for (const eip of unique) {
    const g = await lookup(eip);
    const code = g?.countryCode?.toUpperCase() ?? null;
    extra.push({
      ip: eip,
      countryCode: code,
      country: g?.country ?? null,
      org: g?.org ?? null,
      chinaRegion: isChinaRegion(code),
      supported: isSupportedIso(code),
    });
  }

  const org = looked?.org ?? null;
  return {
    ip,
    countryCode,
    country: looked?.country ?? null,
    region: looked?.region ?? req?.headers.get("x-vercel-ip-country-region") ?? null,
    city: looked?.city ?? req?.headers.get("x-vercel-ip-city") ?? null,
    asn: looked?.asn ?? null,
    org,
    isp: looked?.isp ?? null,
    isHosting: looked?.isHosting ?? false,
    isChineseCloud: orgLooks(CHINESE_CLOUD_ORG, org) || orgLooks(CHINESE_CLOUD_ORG, looked?.isp ?? null),
    supported: isSupportedIso(countryCode),
    chinaRegion: isChinaRegion(countryCode),
    acceptLanguage,
    headerCountry: headerCountry || null,
    source,
    extra,
  };
}
