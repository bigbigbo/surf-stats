import type { WebsiteVisit, WebsiteVisits } from "../types"

export const StorageKeys = {
  WEBSITE_VISITS: "websiteVisits",
  HIDDEN_SITES: "hiddenSites",
  SHOW_HIDDEN_SITES: "showHiddenSites"
} as const

export class WebsiteVisitsManager {
  private websiteVisits: WebsiteVisits = {}

  constructor() {
    this.loadFromStorage()
  }

  async loadFromStorage(): Promise<void> {
    this.websiteVisits = await new Promise((resolve) => {
      chrome.storage.local.get([StorageKeys.WEBSITE_VISITS], (result) => {
        resolve((result[StorageKeys.WEBSITE_VISITS] as WebsiteVisits) || {})
      })
    })
  }

  async saveToStorage(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set(
        { [StorageKeys.WEBSITE_VISITS]: this.websiteVisits },
        resolve
      )
    })
  }

  getWebsiteVisits(): WebsiteVisits {
    return this.websiteVisits
  }

  async updateWebsiteVisit(
    hostname: string,
    update: Partial<WebsiteVisit>
  ): Promise<void> {
    if (!this.websiteVisits[hostname]) {
      this.websiteVisits[hostname] = {
        url: hostname,
        title: "",
        favicon: "",
        visitCount: 0,
        timeSpent: 0,
        ...update
      }
    } else {
      this.websiteVisits[hostname] = {
        ...this.websiteVisits[hostname],
        ...update
      }
    }
    await this.saveToStorage()
  }

  async clearWebsiteVisits(): Promise<void> {
    this.websiteVisits = {}
    await this.saveToStorage()
  }
}

// 创建一个单例实例
export const websiteVisitsManager = new WebsiteVisitsManager()

// 为了保持与之前代码的兼容性，我们可以添加这个函数
export async function getWebsiteVisits(): Promise<WebsiteVisits> {
  return websiteVisitsManager.getWebsiteVisits()
}

// 保留其他现有的函数，但修改 clearAllStats 函数
export async function clearAllStats() {
  await websiteVisitsManager.clearWebsiteVisits()
  chrome.runtime.sendMessage({ action: "clearWebsiteVisits" })
}

export async function getHiddenSites(): Promise<string[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get([StorageKeys.HIDDEN_SITES], (result) => {
      resolve((result[StorageKeys.HIDDEN_SITES] as string[]) || [])
    })
  })
}

export async function setHiddenSites(hiddenSites: string[]): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set(
      { [StorageKeys.HIDDEN_SITES]: hiddenSites },
      resolve
    )
  })
}

export async function getShowHiddenSites(): Promise<boolean> {
  return new Promise((resolve) => {
    chrome.storage.local.get([StorageKeys.SHOW_HIDDEN_SITES], (result) => {
      resolve(result[StorageKeys.SHOW_HIDDEN_SITES] ?? false)
    })
  })
}

export async function setShowHiddenSites(show: boolean): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [StorageKeys.SHOW_HIDDEN_SITES]: show }, resolve)
  })
}
