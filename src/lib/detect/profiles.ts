import type { CombinedVerdict, GeoResult, SignalHit } from "./types";
import { scoreSignals } from "./score";

export type LabProfile = {
  id: string;
  zh: string;
  en: string;
  blurbZh: string;
  blurbEn: string;
  geo: Pick<GeoResult, "countryCode" | "country" | "org" | "isHosting" | "isChineseCloud" | "supported" | "chinaRegion" | "city">;
  signals: Array<Pick<SignalHit, "id" | "strength" | "value">>;
};

const WEIGHT: Record<SignalHit["id"], number> = {
  timezone: 24,
  language: 18,
  cjkFonts: 14,
  vendorFonts: 10,
  webrtc: 10,
  browser: 8,
  device: 6,
  locale: 4,
  offset: 3,
  emoji: 3,
};

const LABEL: Record<SignalHit["id"], { zh: string; en: string }> = {
  timezone: { zh: "系统时区", en: "System timezone" },
  language: { zh: "浏览器语言", en: "Browser languages" },
  cjkFonts: { zh: "中文字体", en: "CJK fonts" },
  vendorFonts: { zh: "国产厂商字体", en: "OEM Chinese fonts" },
  webrtc: { zh: "WebRTC IP 泄露", en: "WebRTC IP leak" },
  browser: { zh: "国产浏览器 / WebView", en: "Chinese browser / WebView" },
  device: { zh: "国产品牌设备", en: "Chinese OEM device" },
  locale: { zh: "Intl 区域", en: "Intl locale" },
  offset: { zh: "时区偏移", en: "UTC offset" },
  emoji: { zh: "系统厂商风格", en: "OS vendor style" },
};

export const LAB_PROFILES: LabProfile[] = [
  {
    id: "cn-win",
    zh: "大陆 Windows",
    en: "CN Windows",
    blurbZh: "Asia/Shanghai + zh-CN + 微软雅黑，出口在中国电信。",
    blurbEn: "Asia/Shanghai, zh-CN, Microsoft YaHei, China Telecom exit.",
    geo: {
      countryCode: "CN",
      country: "China",
      city: "Shanghai",
      org: "Chinanet",
      isHosting: false,
      isChineseCloud: true,
      supported: false,
      chinaRegion: true,
    },
    signals: [
      { id: "timezone", strength: 1, value: "Asia/Shanghai" },
      { id: "language", strength: 1, value: "zh-CN" },
      { id: "cjkFonts", strength: 1, value: "Microsoft YaHei, SimSun" },
      { id: "vendorFonts", strength: 0, value: "none" },
      { id: "webrtc", strength: 0.4, value: "local 192.168.1.8" },
      { id: "browser", strength: 0, value: "Chrome" },
      { id: "device", strength: 0, value: "generic" },
      { id: "locale", strength: 1, value: "zh-CN" },
      { id: "offset", strength: 0.7, value: "UTC+8" },
      { id: "emoji", strength: 0, value: "Windows" },
    ],
  },
  {
    id: "cn-phone",
    zh: "大陆安卓机",
    en: "CN Android",
    blurbZh: "小米 / Harmony + 微信 WebView，厂商字体全开。",
    blurbEn: "Xiaomi / Harmony, WeChat WebView, OEM fonts.",
    geo: {
      countryCode: "CN",
      country: "China",
      city: "Shenzhen",
      org: "China Mobile",
      isHosting: false,
      isChineseCloud: true,
      supported: false,
      chinaRegion: true,
    },
    signals: [
      { id: "timezone", strength: 1, value: "Asia/Shanghai" },
      { id: "language", strength: 1, value: "zh-CN" },
      { id: "cjkFonts", strength: 0.7, value: "Noto Sans SC" },
      { id: "vendorFonts", strength: 1, value: "MiSans, HarmonyOS Sans" },
      { id: "webrtc", strength: 0.4, value: "local 10.0.0.12" },
      { id: "browser", strength: 1, value: "WeChat" },
      { id: "device", strength: 1, value: "Xiaomi" },
      { id: "locale", strength: 1, value: "zh-CN" },
      { id: "offset", strength: 0.7, value: "UTC+8" },
      { id: "emoji", strength: 0.8, value: "OEM / Harmony-like" },
    ],
  },
  {
    id: "hk-cloud",
    zh: "香港云出口",
    en: "HK cloud exit",
    blurbZh: "本机仍是上海时区，出口落在香港云 ASN。",
    blurbEn: "Local Asia/Shanghai, exit on a Hong Kong cloud ASN.",
    geo: {
      countryCode: "HK",
      country: "Hong Kong",
      city: "Hong Kong",
      org: "Cloud (HK) Limited",
      isHosting: true,
      isChineseCloud: false,
      supported: false,
      chinaRegion: true,
    },
    signals: [
      { id: "timezone", strength: 1, value: "Asia/Shanghai" },
      { id: "language", strength: 1, value: "zh-CN, en-US" },
      { id: "cjkFonts", strength: 0.6, value: "PingFang SC" },
      { id: "vendorFonts", strength: 0, value: "none" },
      { id: "webrtc", strength: 0.85, value: "public leak" },
      { id: "browser", strength: 0, value: "Chrome" },
      { id: "device", strength: 0, value: "Mac" },
      { id: "locale", strength: 1, value: "zh-CN" },
      { id: "offset", strength: 0.7, value: "UTC+8" },
      { id: "emoji", strength: 0, value: "Apple" },
    ],
  },
  {
    id: "tw",
    zh: "台湾环境",
    en: "Taiwan",
    blurbZh: "台湾在官方支持名单内。时区 Asia/Taipei 只算弱信号。",
    blurbEn: "Taiwan is supported. Asia/Taipei is only a weak signal.",
    geo: {
      countryCode: "TW",
      country: "Taiwan",
      city: "Taipei",
      org: "Chunghwa Telecom",
      isHosting: false,
      isChineseCloud: false,
      supported: true,
      chinaRegion: false,
    },
    signals: [
      { id: "timezone", strength: 0.15, value: "Asia/Taipei" },
      { id: "language", strength: 0.4, value: "zh-TW" },
      { id: "cjkFonts", strength: 0.6, value: "PingFang TC" },
      { id: "vendorFonts", strength: 0, value: "none" },
      { id: "webrtc", strength: 0.4, value: "local" },
      { id: "browser", strength: 0, value: "Safari" },
      { id: "device", strength: 0, value: "Apple" },
      { id: "locale", strength: 0.35, value: "zh-TW" },
      { id: "offset", strength: 0.7, value: "UTC+8" },
      { id: "emoji", strength: 0, value: "Apple" },
    ],
  },
  {
    id: "us-en",
    zh: "美国英文",
    en: "US English",
    blurbZh: "干净对照样本：支持地区 + 无中国指纹。",
    blurbEn: "Clean control: supported region, no China fingerprints.",
    geo: {
      countryCode: "US",
      country: "United States",
      city: "Ashburn",
      org: "Comcast",
      isHosting: false,
      isChineseCloud: false,
      supported: true,
      chinaRegion: false,
    },
    signals: [
      { id: "timezone", strength: 0, value: "America/New_York" },
      { id: "language", strength: 0, value: "en-US" },
      { id: "cjkFonts", strength: 0, value: "none" },
      { id: "vendorFonts", strength: 0, value: "none" },
      { id: "webrtc", strength: 0.4, value: "local" },
      { id: "browser", strength: 0, value: "Chrome" },
      { id: "device", strength: 0, value: "generic" },
      { id: "locale", strength: 0, value: "en-US" },
      { id: "offset", strength: 0, value: "UTC-4" },
      { id: "emoji", strength: 0, value: "other" },
    ],
  },
  {
    id: "us-zh",
    zh: "美区中文系统",
    en: "US IP, Chinese OS",
    blurbZh: "VPN 到美国，但时区 / 语言仍是中国——Claude Code 仍会画像。",
    blurbEn: "US VPN exit, China timezone/language — Claude Code still fingerprints you.",
    geo: {
      countryCode: "US",
      country: "United States",
      city: "Los Angeles",
      org: "DigitalOcean",
      isHosting: true,
      isChineseCloud: false,
      supported: true,
      chinaRegion: false,
    },
    signals: [
      { id: "timezone", strength: 1, value: "Asia/Shanghai" },
      { id: "language", strength: 1, value: "zh-CN, en-US" },
      { id: "cjkFonts", strength: 0.7, value: "PingFang SC" },
      { id: "vendorFonts", strength: 0, value: "none" },
      { id: "webrtc", strength: 0.85, value: "public leak" },
      { id: "browser", strength: 0, value: "Chrome" },
      { id: "device", strength: 0, value: "Mac" },
      { id: "locale", strength: 1, value: "zh-CN" },
      { id: "offset", strength: 0.7, value: "UTC+8" },
      { id: "emoji", strength: 0, value: "Apple" },
    ],
  },
];

export function materializeProfile(p: LabProfile): { signals: SignalHit[]; score: number; verdict: CombinedVerdict } {
  const signals: SignalHit[] = p.signals.map((s) => ({
    id: s.id,
    weight: WEIGHT[s.id],
    strength: s.strength,
    value: s.value,
    labelZh: LABEL[s.id].zh,
    labelEn: LABEL[s.id].en,
    detailZh: s.value,
    detailEn: s.value,
    claudeNative: s.id === "timezone",
  }));
  const score = scoreSignals(signals);
  let verdict: CombinedVerdict = "low";
  if (p.geo.chinaRegion) verdict = "china-block";
  else if (p.geo.supported === false) verdict = "blocked";
  else if (score >= 61) verdict = "high";
  else if (score >= 31) verdict = "medium";
  return { signals, score, verdict };
}
