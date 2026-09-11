import { isChinaRegion, isSupportedIso } from "./countries";
import { buildStego } from "./stego";
import type {
  CombinedVerdict,
  FingerprintResult,
  GeoResult,
  ProxyHitKind,
  SignalHit,
} from "./types";

export function scoreSignals(signals: SignalHit[]): number {
  const raw = signals.reduce((sum, s) => sum + s.weight * s.strength, 0);
  return Math.round(Math.min(100, Math.max(0, raw)));
}

export function fingerprintOf(
  signals: SignalHit[],
  timezone: string,
  proxyHit: ProxyHitKind,
): FingerprintResult {
  return {
    signals,
    score: scoreSignals(signals),
    stego: buildStego(timezone, proxyHit),
  };
}

export function combineVerdict(geo: GeoResult | null, score: number): CombinedVerdict {
  if (!geo) return "idle";
  if (geo.chinaRegion) return "china-block";
  if (geo.supported === false) return "blocked";
  if (score >= 61) return "high";
  if (score >= 31) return "medium";
  return "low";
}

export function bandOf(score: number): "low" | "medium" | "high" {
  if (score >= 61) return "high";
  if (score >= 31) return "medium";
  return "low";
}

export function geoFromIso(
  iso: string | null,
  extras: Partial<GeoResult> = {},
): Pick<GeoResult, "supported" | "chinaRegion"> {
  return {
    supported: isSupportedIso(iso),
    chinaRegion: isChinaRegion(iso),
    ...extras,
  };
}
