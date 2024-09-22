import type { BrowsingRecord, WebsiteVisits } from "../types";
import * as IndexedDB from "./indexedDB";

export const StorageKeys = {
  HIDDEN_SITES: "hiddenSites",
  SHOW_HIDDEN_SITES: "showHiddenSites"
} as const;

export class WebsiteVisitsManager {
  async getWebsiteVisits(
    startDate?: Date,
    endDate?: Date
  ): Promise<WebsiteVisits> {
    return IndexedDB.getWebsiteVisits(startDate, endDate);
  }

  async getBrowsingRecords(
    startDate?: Date,
    endDate?: Date
  ): Promise<BrowsingRecord[]> {
    return IndexedDB.getBrowsingRecords(startDate, endDate);
  }

  async clearBrowsingRecords(): Promise<void> {
    return IndexedDB.clearBrowsingRecords();
  }

  async addOrUpdateBrowsingRecord(
    record: Omit<BrowsingRecord, "visitCount" | "date">
  ): Promise<void> {
    return IndexedDB.addOrUpdateBrowsingRecord(record);
  }
}

// 创建一个单例实例
export const websiteVisitsManager = new WebsiteVisitsManager();

export async function getWebsiteVisits(
  startDate?: Date,
  endDate?: Date
): Promise<WebsiteVisits> {
  return websiteVisitsManager.getWebsiteVisits(startDate, endDate);
}

export async function clearAllStats() {
  await websiteVisitsManager.clearBrowsingRecords();
}

// 保留 chrome.storage 用于存储设置
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
