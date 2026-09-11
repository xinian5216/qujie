import { useCallback, useRef, useState } from "react";
import { geoLooksEmpty, lookupClientGeo } from "@/lib/detect/client-geo";
import { inspectGeo } from "@/lib/detect/inspect-geo";
import { isPublicIpv4 } from "@/lib/detect/ip";
import { fingerprintOf } from "@/lib/detect/score";
import { collectFingerprint, probeWebRtc } from "@/lib/detect/signals";
import type { FingerprintResult, GeoResult, ProxyHitKind, ScanPhase } from "@/lib/detect/types";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function useScan() {
  const [phase, setPhase] = useState<ScanPhase>("idle");
  const [revealed, setRevealed] = useState(0);
  const [fp, setFp] = useState<FingerprintResult | null>(null);
  const [geo, setGeo] = useState<GeoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const gen = useRef(0);

  const run = useCallback(async (proxyHit: ProxyHitKind = "none") => {
    const id = ++gen.current;
    setPhase("running");
    setRevealed(0);
    setError(null);
    try {
      const rtc = await probeWebRtc();
      if (id !== gen.current) return;
      const extraIps = rtc.publicIps.filter(isPublicIpv4);
      const [signals, serverGeo, clientGeo] = await Promise.all([
        collectFingerprint(rtc),
        inspectGeo({ data: { extraIps } }).catch(() => null),
        lookupClientGeo(),
      ]);
      let geoRes: GeoResult | null = !geoLooksEmpty(serverGeo) ? serverGeo : clientGeo;
      if (geoRes && serverGeo?.extra?.length) {
        geoRes = {
          ...geoRes,
          extra: serverGeo.extra,
          acceptLanguage: serverGeo.acceptLanguage ?? geoRes.acceptLanguage,
        };
      }
      if (id !== gen.current) return;
      const tz = signals.find((s) => s.id === "timezone")?.value ?? "unknown";
      setFp(fingerprintOf(signals, tz, proxyHit));
      setGeo(geoRes);
      if (!geoRes) setError("geo-failed");
      for (let i = 1; i <= signals.length; i++) {
        if (id !== gen.current) return;
        setRevealed(i);
        await sleep(90);
      }
      setPhase("done");
    } catch (err) {
      if (id !== gen.current) return;
      setError(err instanceof Error ? err.message : "scan-failed");
      setPhase("done");
    }
  }, []);

  return { phase, revealed, fp, geo, error, run };
}
