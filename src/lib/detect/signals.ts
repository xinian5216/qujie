import { isChinaTimezone } from "./stego";
import { isPrivateIp, isReservedIp } from "./ip";
import type { SignalHit, WebRtcProbe } from "./types";

const CJK_FONTS = [
  "PingFang SC",
  "PingFang TC",
  "Hiragino Sans GB",
  "Microsoft YaHei",
  "Microsoft YaHei UI",
  "SimSun",
  "SimHei",
  "FangSong",
  "KaiTi",
  "STHeiti",
  "STSong",
  "DengXian",
  "WenQuanYi Micro Hei",
];

const VENDOR_FONTS = [
  "MiSans",
  "MI Lan Pro",
  "HarmonyOS Sans",
  "HarmonyOS Sans SC",
  "OPPO Sans",
  "HONOR Sans",
  "vivo Sans",
  "Alibaba PuHuiTi",
  "Alibaba Sans",
  "Douyin Sans",
];

const CN_BROWSERS: Array<{ re: RegExp; name: string }> = [
  { re: /MicroMessenger/i, name: "WeChat" },
  { re: /QQ\//i, name: "QQ" },
  { re: /MQQBrowser/i, name: "QQ Browser" },
  { re: /Quark/i, name: "Quark" },
  { re: /UCBrowser|UBrowser/i, name: "UC" },
  { re: /Baidu|BIDUBrowser/i, name: "Baidu" },
  { re: /HuaweiBrowser/i, name: "Huawei Browser" },
  { re: /MiuiBrowser/i, name: "Mi Browser" },
  { re: /VivoBrowser/i, name: "vivo Browser" },
  { re: /HeyTapBrowser|OppoBrowser/i, name: "OPPO Browser" },
  { re: /Sogou/i, name: "Sogou" },
  { re: /360SE|Qihoo|QHBrowser/i, name: "360" },
  { re: /LieBao/i, name: "Liebao" },
  { re: /Maxthon/i, name: "Maxthon" },
];

const CN_DEVICES = [
  "HUAWEI",
  "HONOR",
  "Xiaomi",
  "Redmi",
  "POCO",
  "OPPO",
  "vivo",
  "OnePlus",
  "realme",
  "Meizu",
  "HarmonyOS",
  "OpenHarmony",
  "Harmony",
];

function fontAvailable(font: string): boolean {
  if (typeof document === "undefined") return false;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;
  const sample = "汉字检测MmWw@#";
  const baselines = ["monospace", "serif", "sans-serif"];
  const widths = baselines.map((base) => {
    ctx.font = `16px ${base}`;
    const a = ctx.measureText(sample).width;
    ctx.font = `16px "${font}", ${base}`;
    const b = ctx.measureText(sample).width;
    return a !== b;
  });
  return widths.filter(Boolean).length >= 2;
}

function probeFonts(list: string[]): string[] {
  return list.filter((f) => fontAvailable(f));
}

function languageStrength(langs: readonly string[]): { strength: number; detail: string } {
  const list = langs.map((l) => l.toLowerCase());
  const first = list[0] ?? "";
  if (first === "zh-cn" || first === "zh-hans" || first === "zh" || first.startsWith("zh-hans")) {
    return { strength: 1, detail: first };
  }
  if (first === "zh-hk" || first.startsWith("zh-hk") || first === "zh-mo") {
    return { strength: 0.7, detail: first };
  }
  if (first === "zh-tw" || first.startsWith("zh-hant")) {
    return { strength: 0.4, detail: first };
  }
  const anyZh = list.find((l) => l === "zh" || l.startsWith("zh-"));
  if (anyZh) return { strength: 0.45, detail: `secondary ${anyZh}` };
  return { strength: 0, detail: list.slice(0, 3).join(", ") || "n/a" };
}

function localeStrength(locale: string): { strength: number; detail: string } {
  const l = locale.toLowerCase();
  if (l === "zh-cn" || l === "zh-hans-cn" || l === "zh-hans") return { strength: 1, detail: locale };
  if (l === "zh-hk" || l === "zh-mo") return { strength: 0.75, detail: locale };
  if (l.startsWith("zh")) return { strength: 0.35, detail: locale };
  return { strength: 0, detail: locale || "n/a" };
}

function timezoneStrength(tz: string): { strength: number; note: string } {
  if (isChinaTimezone(tz)) return { strength: 1, note: "mainland IANA zone" };
  if (tz === "Asia/Hong_Kong") return { strength: 0.85, note: "Hong Kong (unsupported region)" };
  if (tz === "Asia/Macau" || tz === "Asia/Macao") return { strength: 0.85, note: "Macau (unsupported region)" };
  if (tz === "Asia/Taipei") return { strength: 0.15, note: "Taiwan — supported, weak CJK signal" };
  if (tz === "Asia/Singapore") return { strength: 0.1, note: "Singapore UTC+8, supported" };
  return { strength: 0, note: "outside China-related zones" };
}

function offsetStrength(offsetMin: number): { strength: number; label: string } {
  const hours = -offsetMin / 60;
  const label = `UTC${hours >= 0 ? "+" : ""}${hours}`;
  if (offsetMin === -480) return { strength: 0.7, label };
  if (offsetMin === -360) return { strength: 0.45, label };
  return { strength: 0, label };
}

function detectBrowser(ua: string, brands: string[]): { strength: number; name: string } {
  for (const b of CN_BROWSERS) {
    if (b.re.test(ua)) return { strength: 1, name: b.name };
  }
  const joined = brands.join(" ");
  if (/MicroMessenger|HUAWEI|Xiaomi|HeyTap|Quark|UCBrowser/i.test(joined)) {
    return { strength: 0.8, name: joined };
  }
  return { strength: 0, name: brands[0] || ua.slice(0, 48) || "unknown" };
}

function detectDevice(ua: string, model: string | undefined): { strength: number; name: string } {
  const hay = `${ua} ${model ?? ""}`;
  const hit = CN_DEVICES.find((d) => hay.toLowerCase().includes(d.toLowerCase()));
  if (hit) return { strength: 1, name: model || hit };
  return { strength: 0, name: model || "generic" };
}

function emojiVendor(ua: string): { strength: number; name: string } {
  if (/HarmonyOS|HUAWEI|HONOR|Xiaomi|Redmi|OPPO|vivo|Miui/i.test(ua)) {
    return { strength: 0.8, name: "OEM / Harmony-like" };
  }
  if (/Android/i.test(ua) && !/Pixel|SM-|Samsung/i.test(ua)) {
    return { strength: 0.25, name: "generic Android" };
  }
  return { strength: 0, name: /Mac OS|iPhone|iPad/i.test(ua) ? "Apple" : "other" };
}

export async function probeWebRtc(timeoutMs = 2800): Promise<WebRtcProbe> {
  const localIps: string[] = [];
  const publicIps: string[] = [];
  if (typeof RTCPeerConnection === "undefined") {
    return { localIps, publicIps, leakedPublic: false, error: "no RTCPeerConnection" };
  }

  return new Promise((resolve) => {
    let settled = false;
    let pc: RTCPeerConnection | null = null;
    const finish = () => {
      if (settled) return;
      settled = true;
      try {
        pc?.close();
      } catch {
        /* ignore */
      }
      resolve({
        localIps: [...new Set(localIps)],
        publicIps: [...new Set(publicIps)],
        leakedPublic: publicIps.length > 0,
      });
    };
    const timer = window.setTimeout(finish, timeoutMs);
    try {
      pc = new RTCPeerConnection({
        iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
      });
      pc.createDataChannel("q");
      pc.onicecandidate = (ev) => {
        if (!ev.candidate) {
          window.clearTimeout(timer);
          finish();
          return;
        }
        const c = ev.candidate.candidate;
        const m = /([0-9]{1,3}(?:\.[0-9]{1,3}){3})/.exec(c);
        if (!m) return;
        const ip = m[1];
        if (isPrivateIp(ip)) localIps.push(ip);
        else if (!isReservedIp(ip)) publicIps.push(ip);
      };
      void pc.createOffer().then((offer) => pc && pc.setLocalDescription(offer));
    } catch (err) {
      window.clearTimeout(timer);
      resolve({
        localIps,
        publicIps,
        leakedPublic: false,
        error: err instanceof Error ? err.message : "webrtc failed",
      });
    }
  });
}

type UaData = {
  brands: string[];
  model?: string;
};

async function readUaData(): Promise<UaData> {
  const nav = navigator as Navigator & {
    userAgentData?: {
      brands?: Array<{ brand: string }>;
      mobile?: boolean;
      getHighEntropyValues?: (h: string[]) => Promise<{ model?: string; platform?: string }>;
    };
  };
  const brands = (nav.userAgentData?.brands ?? []).map((b) => b.brand).filter((b) => !/Not.?A.?Brand/i.test(b));
  let model: string | undefined;
  try {
    const high = await nav.userAgentData?.getHighEntropyValues?.(["model", "platform"]);
    model = high?.model || undefined;
  } catch {
    /* permission or unsupported */
  }
  return { brands, model };
}

export async function collectFingerprint(webrtc: WebRtcProbe): Promise<SignalHit[]> {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown";
  const langs = navigator.languages?.length ? [...navigator.languages] : [navigator.language];
  const locale = Intl.DateTimeFormat().resolvedOptions().locale || navigator.language || "";
  const offset = new Date().getTimezoneOffset();
  const ua = navigator.userAgent;
  const uaData = await readUaData();

  const tzS = timezoneStrength(tz);
  const langS = languageStrength(langs);
  const locS = localeStrength(locale);
  const offS = offsetStrength(offset);
  const cjk = probeFonts(CJK_FONTS);
  const vendor = probeFonts(VENDOR_FONTS);
  const br = detectBrowser(ua, uaData.brands);
  const dev = detectDevice(ua, uaData.model);
  const emo = emojiVendor(ua);

  let rtcStrength = 0;
  let rtcDetail = "no candidates";
  if (webrtc.error) {
    rtcDetail = webrtc.error;
  } else if (webrtc.publicIps.length) {
    rtcStrength = 0.85;
    rtcDetail = `public ${webrtc.publicIps.join(", ")}`;
  } else if (webrtc.localIps.length) {
    rtcStrength = 0.4;
    rtcDetail = `local ${webrtc.localIps.join(", ")}`;
  }

  const cjkStrength = Math.min(1, cjk.length / 3);
  const vendorStrength = vendor.length ? 1 : 0;

  const hits: SignalHit[] = [
    {
      id: "timezone",
      weight: 24,
      strength: tzS.strength,
      labelZh: "系统时区",
      labelEn: "System timezone",
      claudeNative: true,
      value: tz,
      detailZh: `${tz} · ${tzS.note === "mainland IANA zone" ? "命中 Claude Code 中国时区名单" : tzS.note}`,
      detailEn: `${tz} · ${tzS.note}`,
    },
    {
      id: "language",
      weight: 18,
      strength: langS.strength,
      labelZh: "浏览器语言",
      labelEn: "Browser languages",
      claudeNative: false,
      value: langs.slice(0, 4).join(", ") || "n/a",
      detailZh: langS.strength >= 1 ? "首选为简体中文" : `首选 ${langS.detail}`,
      detailEn: langS.strength >= 1 ? "zh-CN / Simplified Chinese is first" : `primary ${langS.detail}`,
    },
    {
      id: "cjkFonts",
      weight: 14,
      strength: cjkStrength,
      labelZh: "中文字体",
      labelEn: "CJK fonts",
      claudeNative: false,
      value: cjk.length ? cjk.slice(0, 4).join(", ") : "none",
      detailZh: cjk.length ? `探测到 ${cjk.length} 个系统中文字体` : "未探测到常见简体中文字体",
      detailEn: cjk.length ? `${cjk.length} CJK fonts detected` : "no common Simplified-Chinese fonts",
    },
    {
      id: "vendorFonts",
      weight: 10,
      strength: vendorStrength,
      labelZh: "国产厂商字体",
      labelEn: "OEM Chinese fonts",
      claudeNative: false,
      value: vendor.length ? vendor.join(", ") : "none",
      detailZh: vendor.length ? `命中 ${vendor.join("、")}` : "未命中 MiSans / HarmonyOS / OPPO Sans 等",
      detailEn: vendor.length ? vendor.join(", ") : "no MiSans / HarmonyOS / OPPO Sans",
    },
    {
      id: "webrtc",
      weight: 10,
      strength: rtcStrength,
      labelZh: "WebRTC IP 泄露",
      labelEn: "WebRTC IP leak",
      claudeNative: false,
      value: rtcDetail,
      detailZh: webrtc.publicIps.length
        ? "STUN 打到了公网候选，VPN 可能未覆盖 WebRTC"
        : webrtc.localIps.length
          ? "仅内网候选"
          : "未收集到 ICE 候选",
      detailEn: webrtc.publicIps.length
        ? "STUN gathered a public candidate — VPN may not cover WebRTC"
        : webrtc.localIps.length
          ? "local candidates only"
          : "no ICE candidates",
    },
    {
      id: "browser",
      weight: 8,
      strength: br.strength,
      labelZh: "国产浏览器 / WebView",
      labelEn: "Chinese browser / WebView",
      claudeNative: false,
      value: br.name,
      detailZh: br.strength ? `UA 命中 ${br.name}` : "非微信 / QQ / 夸克 / UC 等",
      detailEn: br.strength ? `UA matched ${br.name}` : "not WeChat / QQ / Quark / UC",
    },
    {
      id: "device",
      weight: 6,
      strength: dev.strength,
      labelZh: "国产品牌设备",
      labelEn: "Chinese OEM device",
      claudeNative: false,
      value: dev.name,
      detailZh: dev.strength ? `设备线索 ${dev.name}` : "未发现华为 / 小米 / OPPO / vivo 等",
      detailEn: dev.strength ? `device clue ${dev.name}` : "no Huawei / Xiaomi / OPPO / vivo",
    },
    {
      id: "locale",
      weight: 4,
      strength: locS.strength,
      labelZh: "Intl 区域",
      labelEn: "Intl locale",
      claudeNative: false,
      value: locS.detail,
      detailZh: `Intl.DateTimeFormat locale = ${locS.detail}`,
      detailEn: `Intl.DateTimeFormat locale = ${locS.detail}`,
    },
    {
      id: "offset",
      weight: 3,
      strength: offS.strength,
      labelZh: "时区偏移",
      labelEn: "UTC offset",
      claudeNative: false,
      value: offS.label,
      detailZh: offset === -480 ? "UTC+8，与中国标准时间重合" : offS.label,
      detailEn: offset === -480 ? "UTC+8, same as China Standard Time" : offS.label,
    },
    {
      id: "emoji",
      weight: 3,
      strength: emo.strength,
      labelZh: "系统厂商风格",
      labelEn: "OS vendor style",
      claudeNative: false,
      value: emo.name,
      detailZh: `由 UA 推断：${emo.name}`,
      detailEn: `inferred from UA: ${emo.name}`,
    },
  ];

  return hits;
}
