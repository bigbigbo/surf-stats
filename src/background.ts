import { websiteVisitsManager } from "./store/storage";
import { getHostname, shouldTrackUrl } from "./utils/url";

// 添加一个变量来存储最后一次更新的时间戳和当前活跃的标签
let lastUpdateTimestamp: { [tabId: number]: number } = {};
let activeTab: {
  id: number | null;
  url: string | null;
  startTime: number | null;
} = { id: null, url: null, startTime: null };

// 添加防抖相关变量
const debounceTime = 5000; // 5秒
let debounceTimers: { [tabId: number]: NodeJS.Timeout } = {};

// 添加或更新浏览记录
async function addOrUpdateBrowsingRecord(
  url: string,
  title: string,
  favicon: string,
  timeSpent: number
) {
  const now = Date.now();
  await websiteVisitsManager.addOrUpdateBrowsingRecord({
    url,
    title,
    favicon,
    timestamp: now,
    lastVisit: now,
    timeSpent
  });
}

// 更新活跃标签的访问记录
async function updateActiveTabRecord() {
  if (
    activeTab.id !== null &&
    activeTab.url !== null &&
    activeTab.startTime !== null
  ) {
    const now = Date.now();
    const timeSpent = now - activeTab.startTime;
    const mainDomain = getHostname(activeTab.url);

    // 获取当前活跃标签的信息
    chrome.tabs.get(activeTab.id, async (tab) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }

      const title = tab.title || "";
      const favicon = tab.favIconUrl || "";

      await websiteVisitsManager.addOrUpdateBrowsingRecord({
        url: mainDomain,
        title,
        favicon,
        timestamp: activeTab.startTime,
        lastVisit: now,
        timeSpent: timeSpent
      });
    });

    // 重置 activeTab 的开始时间
    activeTab.startTime = now;
  }
}

// 防抖函数
function debounce(tabId: number, func: () => void) {
  if (debounceTimers[tabId]) {
    clearTimeout(debounceTimers[tabId]);
  }
  debounceTimers[tabId] = setTimeout(() => {
    func();
    delete debounceTimers[tabId];
  }, debounceTime);
}

// 监听标签页更新事件
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    tab.title &&
    shouldTrackUrl(tab.url)
  ) {
    const hostname = getHostname(tab.url);
    debounce(tabId, () => {
      lastUpdateTimestamp[tabId] = Date.now();
      addOrUpdateBrowsingRecord(hostname, tab.title, tab.favIconUrl || "", 0);
    });
  }
});

// 监听标签页激活事件
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await updateActiveTabRecord(); // 更新之前的活跃标签记录

  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }

    if (tab.url && shouldTrackUrl(tab.url)) {
      activeTab = {
        id: activeInfo.tabId,
        url: tab.url,
        startTime: Date.now()
      };
    } else {
      activeTab = { id: null, url: null, startTime: null };
    }
  });
});

// 监听窗口焦点变化事件
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    await updateActiveTabRecord(); // 更新活跃标签记录
    activeTab = { id: null, url: null, startTime: null };
  } else {
    chrome.tabs.query({ active: true, windowId: windowId }, (tabs) => {
      if (tabs.length > 0 && tabs[0].url && shouldTrackUrl(tabs[0].url)) {
        activeTab = {
          id: tabs[0].id || null,
          url: tabs[0].url,
          startTime: Date.now()
        };
      }
    });
  }
});

// 监听浏览器关闭事件
chrome.runtime.onSuspend.addListener(async () => {
  await updateActiveTabRecord(); // 更新最后的活跃标签记录
});
