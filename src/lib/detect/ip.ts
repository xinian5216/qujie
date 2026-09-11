export function isPrivateIp(ip: string): boolean {
  const [a, b] = ip.split(".").map(Number);
  if (a === 10 || a === 127) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 169 && b === 254) return true;
  return false;
}

export function isReservedIp(ip: string): boolean {
  const a = Number(ip.split(".")[0]);
  return a === 0 || a >= 224;
}

export function isPublicIpv4(ip: string): boolean {
  if (!/^\d{1,3}(?:\.\d{1,3}){3}$/.test(ip)) return false;
  const parts = ip.split(".").map(Number);
  if (parts.some((n) => n > 255)) return false;
  return !isPrivateIp(ip) && !isReservedIp(ip);
}
