export type CountryRecord = {
  iso: string;
  zh: string;
  en: string;
};

/** Official Anthropic Claude.ai / commercial API supported regions (ISO 3166-1). */
export const SUPPORTED_ISO = new Set<string>([
  "AD", "AE", "AG", "AL", "AM", "AO", "AR", "AT", "AU", "AZ",
  "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BN",
  "BO", "BR", "BS", "BT", "BW", "BZ",
  "CA", "CF", "CG", "CH", "CI", "CL", "CM", "CO", "CR", "CV",
  "CY", "CZ",
  "DE", "DJ", "DK", "DM", "DO", "DZ",
  "EC", "EE", "EG", "ER", "ES", "ET",
  "FI", "FJ", "FM", "FR",
  "GA", "GB", "GD", "GE", "GH", "GM", "GN", "GQ", "GR", "GT",
  "GW", "GY",
  "HN", "HR", "HT", "HU",
  "ID", "IE", "IL", "IN", "IQ", "IS", "IT",
  "JM", "JO", "JP",
  "KE", "KG", "KH", "KI", "KM", "KN", "KR", "KW", "KZ",
  "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY",
  "MA", "MC", "MD", "ME", "MG", "MH", "MK", "ML", "MN", "MR",
  "MT", "MU", "MV", "MW", "MX", "MY", "MZ",
  "NA", "NE", "NG", "NI", "NL", "NO", "NP", "NR", "NZ",
  "OM",
  "PA", "PE", "PG", "PH", "PK", "PL", "PS", "PT", "PW", "PY",
  "QA",
  "RO", "RS", "RW",
  "SA", "SB", "SC", "SD", "SE", "SG", "SI", "SK", "SL", "SM",
  "SN", "SO", "SR", "SS", "ST", "SV", "SZ",
  "TD", "TG", "TH", "TJ", "TL", "TM", "TN", "TO", "TR", "TT",
  "TV", "TW", "TZ",
  "UA", "UG", "US", "UY", "UZ",
  "VA", "VC", "VN", "VU",
  "WS",
  "ZA", "ZM", "ZW",
]);

/** Mainland China + HK + Macau — the focus of Claude's China-user enforcement. */
export const CHINA_REGION_ISO = new Set(["CN", "HK", "MO"]);

export const HIGHLIGHT_UNSUPPORTED: Array<CountryRecord & { whyZh: string; whyEn: string }> = [
  {
    iso: "CN",
    zh: "中国大陆",
    en: "China (Mainland)",
    whyZh: "未列入官方支持名单。Claude.ai 对出口 IP 返回地区不可用；Claude Code 另有本机时区与中转域名画像。",
    whyEn: "Not on Anthropic's supported list. Claude.ai rejects the exit IP; Claude Code also fingerprints local timezone and proxy hostnames.",
  },
  {
    iso: "HK",
    zh: "香港",
    en: "Hong Kong",
    whyZh: "未列入官方支持名单。经香港 ASN / 云厂商出口常被判定为不支持地区。",
    whyEn: "Not on the supported list. Hong Kong cloud / ASN exits are commonly classified as unavailable.",
  },
  {
    iso: "MO",
    zh: "澳门",
    en: "Macau",
    whyZh: "未列入官方支持名单。",
    whyEn: "Not on the supported list.",
  },
  {
    iso: "RU",
    zh: "俄罗斯",
    en: "Russia",
    whyZh: "未列入官方支持名单，受出口管制与制裁相关限制。",
    whyEn: "Not on the supported list (export-control / sanctions posture).",
  },
  {
    iso: "IR",
    zh: "伊朗",
    en: "Iran",
    whyZh: "未列入官方支持名单（制裁相关）。",
    whyEn: "Not on the supported list (sanctions).",
  },
  {
    iso: "KP",
    zh: "朝鲜",
    en: "North Korea",
    whyZh: "未列入官方支持名单（制裁相关）。",
    whyEn: "Not on the supported list (sanctions).",
  },
  {
    iso: "CU",
    zh: "古巴",
    en: "Cuba",
    whyZh: "未列入官方支持名单（制裁相关）。",
    whyEn: "Not on the supported list (sanctions).",
  },
  {
    iso: "SY",
    zh: "叙利亚",
    en: "Syria",
    whyZh: "未列入官方支持名单（制裁相关）。",
    whyEn: "Not on the supported list (sanctions).",
  },
  {
    iso: "BY",
    zh: "白俄罗斯",
    en: "Belarus",
    whyZh: "未列入官方支持名单。",
    whyEn: "Not on the supported list.",
  },
  {
    iso: "VE",
    zh: "委内瑞拉",
    en: "Venezuela",
    whyZh: "未列入官方支持名单。",
    whyEn: "Not on the supported list.",
  },
  {
    iso: "MM",
    zh: "缅甸",
    en: "Myanmar",
    whyZh: "未列入官方支持名单。",
    whyEn: "Not on the supported list.",
  },
  {
    iso: "AF",
    zh: "阿富汗",
    en: "Afghanistan",
    whyZh: "未列入官方支持名单。",
    whyEn: "Not on the supported list.",
  },
  {
    iso: "YE",
    zh: "也门",
    en: "Yemen",
    whyZh: "未列入官方支持名单。",
    whyEn: "Not on the supported list.",
  },
];

export const COUNTRIES: CountryRecord[] = [
  { iso: "CN", zh: "中国大陆", en: "China (Mainland)" },
  { iso: "HK", zh: "香港", en: "Hong Kong" },
  { iso: "MO", zh: "澳门", en: "Macau" },
  { iso: "TW", zh: "台湾", en: "Taiwan" },
  { iso: "US", zh: "美国", en: "United States" },
  { iso: "JP", zh: "日本", en: "Japan" },
  { iso: "KR", zh: "韩国", en: "South Korea" },
  { iso: "SG", zh: "新加坡", en: "Singapore" },
  { iso: "GB", zh: "英国", en: "United Kingdom" },
  { iso: "DE", zh: "德国", en: "Germany" },
  { iso: "FR", zh: "法国", en: "France" },
  { iso: "AU", zh: "澳大利亚", en: "Australia" },
  { iso: "CA", zh: "加拿大", en: "Canada" },
  { iso: "IN", zh: "印度", en: "India" },
  { iso: "ID", zh: "印度尼西亚", en: "Indonesia" },
  { iso: "MY", zh: "马来西亚", en: "Malaysia" },
  { iso: "TH", zh: "泰国", en: "Thailand" },
  { iso: "VN", zh: "越南", en: "Vietnam" },
  { iso: "PH", zh: "菲律宾", en: "Philippines" },
  { iso: "NZ", zh: "新西兰", en: "New Zealand" },
  { iso: "AE", zh: "阿联酋", en: "United Arab Emirates" },
  { iso: "SA", zh: "沙特阿拉伯", en: "Saudi Arabia" },
  { iso: "IL", zh: "以色列", en: "Israel" },
  { iso: "TR", zh: "土耳其", en: "Türkiye" },
  { iso: "BR", zh: "巴西", en: "Brazil" },
  { iso: "MX", zh: "墨西哥", en: "Mexico" },
  { iso: "AR", zh: "阿根廷", en: "Argentina" },
  { iso: "RU", zh: "俄罗斯", en: "Russia" },
  { iso: "IR", zh: "伊朗", en: "Iran" },
  { iso: "KP", zh: "朝鲜", en: "North Korea" },
  { iso: "CU", zh: "古巴", en: "Cuba" },
  { iso: "SY", zh: "叙利亚", en: "Syria" },
  { iso: "BY", zh: "白俄罗斯", en: "Belarus" },
  { iso: "VE", zh: "委内瑞拉", en: "Venezuela" },
  { iso: "MM", zh: "缅甸", en: "Myanmar" },
  { iso: "AF", zh: "阿富汗", en: "Afghanistan" },
  { iso: "YE", zh: "也门", en: "Yemen" },
  { iso: "UA", zh: "乌克兰", en: "Ukraine" },
  { iso: "NL", zh: "荷兰", en: "Netherlands" },
  { iso: "SE", zh: "瑞典", en: "Sweden" },
  { iso: "CH", zh: "瑞士", en: "Switzerland" },
  { iso: "IT", zh: "意大利", en: "Italy" },
  { iso: "ES", zh: "西班牙", en: "Spain" },
  { iso: "PL", zh: "波兰", en: "Poland" },
  { iso: "IE", zh: "爱尔兰", en: "Ireland" },
  { iso: "PT", zh: "葡萄牙", en: "Portugal" },
  { iso: "NO", zh: "挪威", en: "Norway" },
  { iso: "DK", zh: "丹麦", en: "Denmark" },
  { iso: "FI", zh: "芬兰", en: "Finland" },
  { iso: "BE", zh: "比利时", en: "Belgium" },
  { iso: "AT", zh: "奥地利", en: "Austria" },
  { iso: "CZ", zh: "捷克", en: "Czechia" },
  { iso: "HU", zh: "匈牙利", en: "Hungary" },
  { iso: "RO", zh: "罗马尼亚", en: "Romania" },
  { iso: "GR", zh: "希腊", en: "Greece" },
  { iso: "ZA", zh: "南非", en: "South Africa" },
  { iso: "EG", zh: "埃及", en: "Egypt" },
  { iso: "NG", zh: "尼日利亚", en: "Nigeria" },
  { iso: "KE", zh: "肯尼亚", en: "Kenya" },
  { iso: "PK", zh: "巴基斯坦", en: "Pakistan" },
  { iso: "BD", zh: "孟加拉国", en: "Bangladesh" },
  { iso: "LK", zh: "斯里兰卡", en: "Sri Lanka" },
  { iso: "NP", zh: "尼泊尔", en: "Nepal" },
  { iso: "KZ", zh: "哈萨克斯坦", en: "Kazakhstan" },
  { iso: "UZ", zh: "乌兹别克斯坦", en: "Uzbekistan" },
  { iso: "MN", zh: "蒙古", en: "Mongolia" },
  { iso: "KH", zh: "柬埔寨", en: "Cambodia" },
  { iso: "LA", zh: "老挝", en: "Laos" },
  { iso: "BN", zh: "文莱", en: "Brunei" },
  { iso: "QA", zh: "卡塔尔", en: "Qatar" },
  { iso: "KW", zh: "科威特", en: "Kuwait" },
  { iso: "BH", zh: "巴林", en: "Bahrain" },
  { iso: "OM", zh: "阿曼", en: "Oman" },
  { iso: "JO", zh: "约旦", en: "Jordan" },
  { iso: "LB", zh: "黎巴嫩", en: "Lebanon" },
  { iso: "IQ", zh: "伊拉克", en: "Iraq" },
  { iso: "CL", zh: "智利", en: "Chile" },
  { iso: "CO", zh: "哥伦比亚", en: "Colombia" },
  { iso: "PE", zh: "秘鲁", en: "Peru" },
  { iso: "IS", zh: "冰岛", en: "Iceland" },
  { iso: "LU", zh: "卢森堡", en: "Luxembourg" },
  { iso: "EE", zh: "爱沙尼亚", en: "Estonia" },
  { iso: "LV", zh: "拉脱维亚", en: "Latvia" },
  { iso: "LT", zh: "立陶宛", en: "Lithuania" },
  { iso: "SK", zh: "斯洛伐克", en: "Slovakia" },
  { iso: "SI", zh: "斯洛文尼亚", en: "Slovenia" },
  { iso: "HR", zh: "克罗地亚", en: "Croatia" },
  { iso: "RS", zh: "塞尔维亚", en: "Serbia" },
  { iso: "BG", zh: "保加利亚", en: "Bulgaria" },
  { iso: "GE", zh: "格鲁吉亚", en: "Georgia" },
  { iso: "AM", zh: "亚美尼亚", en: "Armenia" },
  { iso: "AZ", zh: "阿塞拜疆", en: "Azerbaijan" },
];

const ALIAS: Record<string, string> = {
  中国: "CN",
  大陆: "CN",
  内地: "CN",
  china: "CN",
  prc: "CN",
  香港: "HK",
  hongkong: "HK",
  "hong kong": "HK",
  澳门: "MO",
  macau: "MO",
  macao: "MO",
  台湾: "TW",
  taiwan: "TW",
  日本: "JP",
  japan: "JP",
  韩国: "KR",
  korea: "KR",
  新加坡: "SG",
  singapore: "SG",
  美国: "US",
  usa: "US",
  英国: "GB",
  uk: "GB",
  俄国: "RU",
  俄罗斯: "RU",
  russia: "RU",
};

export function isSupportedIso(iso: string | null | undefined): boolean | null {
  if (!iso) return null;
  return SUPPORTED_ISO.has(iso.toUpperCase());
}

export function isChinaRegion(iso: string | null | undefined): boolean {
  if (!iso) return false;
  return CHINA_REGION_ISO.has(iso.toUpperCase());
}

export function lookupCountry(query: string): CountryRecord[] {
  const q = query.trim().toLowerCase();
  if (!q) return COUNTRIES.slice(0, 12);
  const aliasIso = ALIAS[q] ?? ALIAS[query.trim()];
  if (aliasIso) {
    const hit = COUNTRIES.find((c) => c.iso === aliasIso);
    if (hit) return [hit, ...COUNTRIES.filter((c) => c.iso !== aliasIso && matches(c, q))];
  }
  const isoExact = COUNTRIES.find((c) => c.iso.toLowerCase() === q);
  if (isoExact) return [isoExact, ...COUNTRIES.filter((c) => c !== isoExact && matches(c, q))];
  return COUNTRIES.filter((c) => matches(c, q));
}

function matches(c: CountryRecord, q: string) {
  return (
    c.iso.toLowerCase().includes(q) ||
    c.zh.toLowerCase().includes(q) ||
    c.en.toLowerCase().includes(q)
  );
}

export function countryLabel(iso: string | null, lang: "zh" | "en"): string {
  if (!iso) return lang === "zh" ? "未知" : "Unknown";
  const rec = COUNTRIES.find((c) => c.iso === iso.toUpperCase());
  if (rec) return lang === "zh" ? rec.zh : rec.en;
  return iso.toUpperCase();
}
