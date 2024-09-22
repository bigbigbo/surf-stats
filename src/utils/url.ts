// 检查URL是否应该被跟踪
export function shouldTrackUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

// 修改 getHostname 函数
export function getHostname(url: string): string {
  try {
    const urlObject = new URL(url);
    const hostname = urlObject.hostname;
    if (!hostname) return "";
    const parts = hostname.split(".");
    if (parts.length > 2) {
      // 处理类似 .co.uk 的特殊顶级域名
      if (
        parts[parts.length - 2] === "co" ||
        parts[parts.length - 2] === "com"
      ) {
        return parts.slice(-3).join(".");
      }
      return parts.slice(-2).join(".");
    }
    return hostname;
  } catch {
    return url;
  }
}
