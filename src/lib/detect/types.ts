export type Lang = "zh" | "en";

export type ProxyHitKind = "none" | "domain" | "lab" | "both";

export type SignalId =
  | "timezone"
  | "language"
  | "cjkFonts"
  | "vendorFonts"
  | "webrtc"
  | "browser"
  | "device"
  | "locale"
  | "offset"
  | "emoji";

export type SignalHit = {
  id: SignalId;
  weight: number;
  strength: number;
  labelZh: string;
  labelEn: string;
  detailZh: string;
  detailEn: string;
  value: string;
  claudeNative: boolean;
};

export type WebRtcProbe = {
  localIps: string[];
  publicIps: string[];
  leakedPublic: boolean;
  error?: string;
};

export type FingerprintResult = {
  signals: SignalHit[];
  score: number;
  stego: StegoPreview;
};

export type StegoPreview = {
  timezone: string;
  chinaTz: boolean;
  dateLine: string;
  dateSep: "-" | "/";
  apostrophe: string;
  apostropheName: string;
  proxyHit: "none" | "domain" | "lab" | "both";
};

export type GeoResult = {
  ip: string;
  countryCode: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  asn: string | null;
  org: string | null;
  isp: string | null;
  isHosting: boolean;
  isChineseCloud: boolean;
  supported: boolean | null;
  chinaRegion: boolean;
  acceptLanguage: string | null;
  headerCountry: string | null;
  source: string;
  extra: ExtraIpGeo[];
};

export type ExtraIpGeo = {
  ip: string;
  countryCode: string | null;
  country: string | null;
  org: string | null;
  chinaRegion: boolean;
  supported: boolean | null;
};

export type CombinedVerdict =
  | "blocked"
  | "china-block"
  | "high"
  | "medium"
  | "low"
  | "idle";

export type ScanPhase = "idle" | "running" | "done";
