// 检查是否应该更新访问次数
export function shouldUpdateVisitCount(
  lastUpdateTimestamp: { [tabId: number]: number },
  tabId: number
): boolean {
  const currentTime = Date.now()
  const lastUpdate = lastUpdateTimestamp[tabId] || 0

  if (currentTime - lastUpdate > 10000) {
    return true
  }

  return false
}

// 检查URL是否应该被跟踪
export function shouldTrackUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://")
}

// 获取主域名
export function getMainDomain(hostname: string): string {
  const parts = hostname.split(".")
  if (parts.length > 2) {
    // 处理类似 .co.uk 的特殊顶级域名
    if (parts[parts.length - 2] === "co" || parts[parts.length - 2] === "com") {
      return parts.slice(-3).join(".")
    }
    return parts.slice(-2).join(".")
  }
  return hostname
}

// 修改 getHostname 函数
export function getHostname(url: string): string {
  try {
    const hostname = new URL(url).hostname
    return getMainDomain(hostname)
  } catch {
    return url
  }
}

// 格式化时间
export function formatTime(timeInMs: number): string {
  return `${Math.floor(timeInMs / 3600000)
    .toString()
    .padStart(2, "0")}:${Math.floor((timeInMs % 3600000) / 60000)
    .toString()
    .padStart(2, "0")}:${Math.floor((timeInMs % 60000) / 1000)
    .toString()
    .padStart(2, "0")}`
}

export function getNextMidnight(): number {
  const now = new Date()
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  )
  return nextMidnight.getTime()
}
