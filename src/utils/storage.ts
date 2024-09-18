import type { WebsiteVisit, WebsiteVisits } from "../types";

export const StorageKeys = {
  WEBSITE_VISITS: "websiteVisits",
  HIDDEN_SITES: "hiddenSites",
  SHOW_HIDDEN_SITES: "showHiddenSites"
} as const;

export class WebsiteVisitsManager {
  async getWebsiteVisits(): Promise<WebsiteVisits> {
    return new Promise((resolve) => {
      chrome.storage.local.get([StorageKeys.WEBSITE_VISITS], (result) => {
        resolve((result[StorageKeys.WEBSITE_VISITS] as WebsiteVisits) || {});
      });
    });
  }

  async updateWebsiteVisit(
    hostname: string,
    update: Partial<WebsiteVisit>
  ): Promise<void> {
    const websiteVisits = await this.getWebsiteVisits();
    if (!websiteVisits[hostname]) {
      websiteVisits[hostname] = {
        url: hostname,
        title: "",
        favicon: "",
        visitCount: 0,
        timeSpent: 0,
        ...update
      };
    } else {
      websiteVisits[hostname] = {
        ...websiteVisits[hostname],
        ...update
      };
    }
    await this.saveToStorage(websiteVisits);
  }

  async saveToStorage(websiteVisits: WebsiteVisits): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set(
        { [StorageKeys.WEBSITE_VISITS]: websiteVisits },
        resolve
      );
    });
  }

  async clearWebsiteVisits(): Promise<void> {
    await this.saveToStorage({});
  }
}

// 创建一个单例实例
export const websiteVisitsManager = new WebsiteVisitsManager();

export async function getWebsiteVisits(): Promise<WebsiteVisits> {
  return websiteVisitsManager.getWebsiteVisits();
}

export async function clearAllStats() {
  await websiteVisitsManager.clearWebsiteVisits();
}

export async function getHiddenSites(): Promise<string[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get([StorageKeys.HIDDEN_SITES], (result) => {
      resolve((result[StorageKeys.HIDDEN_SITES] as string[]) || []);
    });
  });
}

export async function setHiddenSites(hiddenSites: string[]): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set(
      { [StorageKeys.HIDDEN_SITES]: hiddenSites },
      resolve
    );
  });
}

export async function getShowHiddenSites(): Promise<boolean> {
  return new Promise((resolve) => {
    chrome.storage.local.get([StorageKeys.SHOW_HIDDEN_SITES], (result) => {
      resolve(result[StorageKeys.SHOW_HIDDEN_SITES] ?? false);
    });
  });
}

export async function setShowHiddenSites(show: boolean): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set(
      { [StorageKeys.SHOW_HIDDEN_SITES]: show },
      resolve
    );
  });
}
