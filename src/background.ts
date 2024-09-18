import type { WebsiteVisits } from "./types"
import {
  getHostname,
  shouldTrackUrl,
  shouldUpdateVisitCount
} from "./utils/helpers"
import {
  clearWebsiteVisits,
  getWebsiteVisits,
  updateWebsiteVisit
} from "./utils/storage"

// 存储网站访问信息
let websiteVisits: WebsiteVisits = {}

// 添加一个变量来存储最后一次更新的时间戳
let lastUpdateTimestamp: { [tabId: number]: number } = {}

// 更新或创建网站访问记录
async function updateWebsiteVisitInfo(
  hostname: string,
  title: string,
  favicon: string
) {
  await updateWebsiteVisit(hostname, {
    title,
    favicon: favicon || websiteVisits[hostname]?.favicon,
    visitCount: (websiteVisits[hostname]?.visitCount || 0) + 1
  })
  websiteVisits = await getWebsiteVisits()
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

function updateTimeSpent() {
  if (
    currentTabId !== null &&
    currentTabStartTime !== null &&
    currentTabUrl !== null &&
    websiteVisits[currentTabUrl]
  ) {
    const timeSpent = Date.now() - currentTabStartTime
    updateWebsiteVisit(currentTabUrl, {
      timeSpent: (websiteVisits[currentTabUrl].timeSpent || 0) + timeSpent
    })
  }
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  updateTimeSpent()

  currentTabId = activeInfo.tabId
  currentTabStartTime = Date.now()

  chrome.tabs.get(currentTabId, (tab) => {
    if (tab.url && shouldTrackUrl(tab.url)) {
      currentTabUrl = getHostname(tab.url)
      if (!websiteVisits[currentTabUrl]) {
        updateWebsiteVisit(currentTabUrl, {
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
chrome.alarms.create("resetStats", { periodInMinutes: 1440 })
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "resetStats") {
    clearWebsiteVisits()
    websiteVisits = {}
  }
})

// 初始化：从存储中加载数据
getWebsiteVisits().then((visits) => {
  websiteVisits = visits
})
