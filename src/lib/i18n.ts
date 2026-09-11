import type { CombinedVerdict, Lang } from "./detect/types";

export const copy = {
  zh: {
    brand: "区界",
    brandEn: "Qujie",
    tag: "Claude 不支持地区检测",
    hero: "你会被判定为不支持地区用户吗？",
    sub: "按 Anthropic 官方支持名单核验出口 IP，并按公开的 Claude Code 逻辑扫描本机中国用户指纹。",
    scan: "开始检测",
    rescan: "重新扫描",
    scanning: "扫描中",
    local: "本机指纹 0–100",
    exit: "出口节点",
    supported: "支持地区",
    unsupported: "不支持地区",
    unknown: "未知",
    native: "Claude Code 原生信号",
    related: "相关指纹",
    method: "检测原理",
    countries: "地区查询",
    lab: "对照样本",
    faq: "常见问题",
    proxy: "中转域名自检",
    proxyHint: "粘贴 ANTHROPIC_BASE_URL 或中转 hostname",
    proxyGo: "核对",
    disclaimer:
      "本工具根据 Anthropic 公开的支持地区名单，以及针对 Claude Code 的公开逆向报告，在浏览器本地估算风险。结果不是 Anthropic 的实际判定，也不会上传指纹。",
    idleHint: "检测分两层：官方地区名单看出口 IP；中国用户画像看本机时区、语言、字体与 WebRTC。",
  },
  en: {
    brand: "Qujie",
    brandEn: "区界",
    tag: "Claude unsupported-region check",
    hero: "Would Claude treat you as an unsupported-region user?",
    sub: "Checks your exit IP against Anthropic’s official list, then scans local China-user fingerprints the way public Claude Code reverse-engineering describes.",
    scan: "Run scan",
    rescan: "Scan again",
    scanning: "Scanning",
    local: "Local fingerprint 0–100",
    exit: "Exit node",
    supported: "Supported",
    unsupported: "Unsupported",
    unknown: "Unknown",
    native: "Claude Code native signal",
    related: "Related fingerprint",
    method: "How it works",
    countries: "Region lookup",
    lab: "Reference profiles",
    faq: "FAQ",
    proxy: "Relay hostname check",
    proxyHint: "Paste ANTHROPIC_BASE_URL or a relay hostname",
    proxyGo: "Check",
    disclaimer:
      "Estimates risk from Anthropic’s public supported-regions list and public Claude Code reverse-engineering. Not Anthropic’s real decision. Fingerprints stay in the browser.",
    idleHint:
      "Two layers: official region list vs exit IP; China-user portrait vs timezone, language, fonts and WebRTC.",
  },
} as const;

export const verdictCopy: Record<
  CombinedVerdict,
  { zh: string; en: string; hintZh: string; hintEn: string }
> = {
  idle: {
    zh: "待检测",
    en: "Ready",
    hintZh: "尚未扫描",
    hintEn: "Not scanned yet",
  },
  "china-block": {
    zh: "中国相关地区 · 官方不可用",
    en: "China-related · officially unavailable",
    hintZh: "出口落在中国大陆 / 香港 / 澳门。Claude.ai 会在地区层直接拒绝。",
    hintEn: "Exit is CN / HK / MO. Claude.ai rejects at the region layer.",
  },
  blocked: {
    zh: "不支持地区",
    en: "Unsupported region",
    hintZh: "出口国家不在 Anthropic 官方支持名单内。",
    hintEn: "Exit country is not on Anthropic’s supported list.",
  },
  high: {
    zh: "出口可用 · 中国用户高风险",
    en: "Region ok · high China-user risk",
    hintZh: "IP 在支持地区，但本机时区 / 语言等画像很像中国用户。Claude Code 仍可能标记。",
    hintEn: "IP is in a supported region, but the local portrait looks strongly Chinese. Claude Code may still flag it.",
  },
  medium: {
    zh: "出口可用 · 中等指纹风险",
    en: "Region ok · medium fingerprint risk",
    hintZh: "地区层会放行，但仍有若干中国相关信号。",
    hintEn: "Region layer would allow you, but some China-related signals remain.",
  },
  low: {
    zh: "低风险",
    en: "Low risk",
    hintZh: "出口在支持地区，本机中国用户指纹较弱。",
    hintEn: "Exit is supported and local China-user fingerprints are weak.",
  },
};

export function t(lang: Lang) {
  return copy[lang];
}
