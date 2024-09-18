import {
  getHostname,
  getNextMidnight,
  shouldTrackUrl,
  shouldUpdateVisitCount
} from "./utils/helpers"
import { websiteVisitsManager } from "./utils/storage"

// 添加一个变量来存储最后一次更新的时间戳
let lastUpdateTimestamp: { [tabId: number]: number } = {}

// 更新或创建网站访问记录
async function updateWebsiteVisitInfo(
  hostname: string,
  title: string,
  favicon: string
) {
  const currentVisit = websiteVisitsManager.getWebsiteVisits()[hostname]
  await websiteVisitsManager.updateWebsiteVisit(hostname, {
    title,
    favicon: favicon || currentVisit?.favicon,
    visitCount: (currentVisit?.visitCount || 0) + 1
  })
}

// 监听标签页更新事件
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    tab.title &&
    shouldTrackUrl(tab.url)
  ) {
    const hostname = getHostname(tab.url)
    if (shouldUpdateVisitCount(lastUpdateTimestamp, tabId)) {
      lastUpdateTimestamp[tabId] = Date.now()
      updateWebsiteVisitInfo(hostname, tab.title, tab.favIconUrl || "")
    }
  }
})

// 计算访问时长
let currentTabId: number | null = null
let currentTabStartTime: number | null = null
let currentTabUrl: string | null = null

async function updateTimeSpent() {
  if (
    currentTabId !== null &&
    currentTabStartTime !== null &&
    currentTabUrl !== null
  ) {
    const websiteVisits = websiteVisitsManager.getWebsiteVisits()
    if (websiteVisits[currentTabUrl]) {
      const timeSpent = Date.now() - currentTabStartTime
      await websiteVisitsManager.updateWebsiteVisit(currentTabUrl, {
        timeSpent: (websiteVisits[currentTabUrl].timeSpent || 0) + timeSpent
      })
    }
  }
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  updateTimeSpent()

  currentTabId = activeInfo.tabId
  currentTabStartTime = Date.now()

  chrome.tabs.get(currentTabId, (tab) => {
    if (tab.url && shouldTrackUrl(tab.url)) {
      currentTabUrl = getHostname(tab.url)
      const websiteVisits = websiteVisitsManager.getWebsiteVisits()
      if (!websiteVisits[currentTabUrl]) {
        websiteVisitsManager.updateWebsiteVisit(currentTabUrl, {
          title: tab.title || "",
          favicon: tab.favIconUrl || ""
        })
      }
    } else {
      currentTabUrl = null
    }
  })
})

// 当浏览器关闭时，更新最后一个标签的时间
chrome.windows.onRemoved.addListener(() => {
  updateTimeSpent()
  currentTabId = null
  currentTabStartTime = null
  currentTabUrl = null
})

// 每天凌晨重置统计数据
chrome.alarms.create("resetStats", {
  when: getNextMidnight(),
  periodInMinutes: 24 * 60 // 24小时
})

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "resetStats") {
    websiteVisitsManager.clearWebsiteVisits()
  }
})
