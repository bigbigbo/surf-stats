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

// 获取主机名
export function getHostname(url: string): string {
  try {
    return new URL(url).hostname
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
