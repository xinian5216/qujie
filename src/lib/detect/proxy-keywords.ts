import type { ProxyHitKind } from "./types";

/** Hostnames / keywords publicly reported in Claude Code's proxy fingerprint lists. */

export const CHINESE_AI_LAB_KEYWORDS = [
  "deepseek",
  "moonshot",
  "kimi",
  "minimax",
  "zhipu",
  "chatglm",
  "bigmodel",
  "baichuan",
  "stepfun",
  "stepchat",
  "dashscope",
  "qwen",
  "tongyi",
  "volcengine",
  "volces",
  "doubao",
  "bytedance",
  "ark.cn",
  "hunyuan",
  "qianfan",
  "ernie",
  "yi-ai",
  "01.ai",
  "internlm",
  "sensetime",
  "sensecore",
  "iflytek",
  "sparkdesk",
  "skywork",
  "kunlun",
  "baichuan-ai",
  "glm.ai",
] as const;

export const CHINESE_INFRA_KEYWORDS = [
  "aliyun",
  "alicloud",
  "aliyuncs",
  "alibaba",
  "tencentcloud",
  "tencent",
  "qcloud",
  "huaweicloud",
  "hwclouds",
  "modelarts",
  "baidubce",
  "bcebos",
  "ucloud",
  "jdcloud",
  "kingsoft",
  "ksyun",
  "oss-cn-",
  "cn-hangzhou",
  "cn-beijing",
  "cn-shanghai",
  "cn-shenzhen",
  "cn-guangzhou",
  "cn-chengdu",
  "ap-shanghai",
  "ap-beijing",
] as const;

export const RESELLER_KEYWORDS = [
  "claude-cn",
  "claudecn",
  "claudeapi",
  "claude-api",
  "claudecode",
  "anthropic-proxy",
  "api-proxy",
  "openai-sb",
  "closeai",
  "openrouter-cn",
] as const;

export function inspectProxyHostname(input: string): {
  host: string;
  kind: ProxyHitKind;
  matches: string[];
} {
  const raw = input.trim().toLowerCase();
  const host = raw
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "");

  if (!host) return { host: "", kind: "none", matches: [] };

  const labHits = CHINESE_AI_LAB_KEYWORDS.filter((k) => host.includes(k));
  const domainHits: string[] = [
    ...CHINESE_INFRA_KEYWORDS.filter((k) => host.includes(k)),
    ...RESELLER_KEYWORDS.filter((k) => host.includes(k)),
  ];
  if (host.endsWith(".cn") || host.includes(".com.cn")) domainHits.push(".cn");

  const matches = [...new Set([...labHits, ...domainHits])];
  const lab = labHits.length > 0;
  const domain = domainHits.length > 0;
  const kind: ProxyHitKind = lab && domain ? "both" : lab ? "lab" : domain ? "domain" : "none";
  return { host, kind, matches };
}

export const CHINESE_CLOUD_ORG = [
  "alibaba",
  "aliyun",
  "alibabacloud",
  "tencent",
  "huawei",
  "baidu",
  "ucloud",
  "kingsoft",
  "jd.com",
  "jingdong",
  "bytedance",
  "volcengine",
  "chinanet",
  "china telecom",
  "china unicom",
  "china mobile",
  "cernet",
  "cstnet",
];

export const HOSTING_ORG = [
  "amazon",
  "aws",
  "google cloud",
  "google llc",
  "digitalocean",
  "linode",
  "akamai",
  "hetzner",
  "ovh",
  "vultr",
  "oracle",
  "microsoft",
  "azure",
  "cloudflare",
  "bandwagon",
  "colocrossing",
  "choopa",
  "m247",
  "datacamp",
  "leaseweb",
  "contabo",
  "hostinger",
  "gcore",
];
