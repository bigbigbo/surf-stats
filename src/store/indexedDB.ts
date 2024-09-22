import type { BrowsingRecord, WebsiteVisits } from "../types";
import { getHostname } from "../utils/url";

const DB_NAME = "BrowsingHistoryDB";
const DB_VERSION = 6;
const BROWSING_RECORDS_STORE_NAME = "browsingRecords";

let db: IDBDatabase | null = null;

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (db.objectStoreNames.contains(BROWSING_RECORDS_STORE_NAME)) {
        db.deleteObjectStore(BROWSING_RECORDS_STORE_NAME);
      }
      const store = db.createObjectStore(BROWSING_RECORDS_STORE_NAME, {
        keyPath: ["url", "date"]
      });
      store.createIndex("date", "date", { unique: false });
    };
  });
}

function getDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export async function addOrUpdateBrowsingRecord(
  record: Omit<BrowsingRecord, "visitCount" | "date">
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      BROWSING_RECORDS_STORE_NAME,
      "readwrite"
    );
    const store = transaction.objectStore(BROWSING_RECORDS_STORE_NAME);
    const mainDomain = getHostname(record.url);
    const date = getDateString(new Date(record.lastVisit));

    const getRequest = store.get([mainDomain, date]);
    getRequest.onsuccess = () => {
      const existingRecord = getRequest.result;
      if (existingRecord) {
        existingRecord.visitCount += 1;
        existingRecord.lastVisit = record.lastVisit;

        // 更新 title 和 favicon
        if (record.title) existingRecord.title = record.title;
        if (record.favicon) existingRecord.favicon = record.favicon;

        // 更新 timeSpent
        if (record.timeSpent) {
          existingRecord.timeSpent += record.timeSpent;
        }

        store.put(existingRecord);
      } else {
        store.add({
          ...record,
          date,
          url: mainDomain,
          timeSpent: record.timeSpent || 0,
          visitCount: 1
        });
      }
      resolve();
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

export async function getBrowsingRecords(
  startDate?: Date,
  endDate?: Date
): Promise<BrowsingRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(BROWSING_RECORDS_STORE_NAME, "readonly");
    const store = transaction.objectStore(BROWSING_RECORDS_STORE_NAME);
    const index = store.index("date");

    let request: IDBRequest;
    if (startDate && endDate) {
      const range = IDBKeyRange.bound(
        getDateString(startDate),
        getDateString(endDate)
      );
      request = index.getAll(range);
    } else {
      request = store.getAll();
    }

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function clearBrowsingRecords(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      BROWSING_RECORDS_STORE_NAME,
      "readwrite"
    );
    const store = transaction.objectStore(BROWSING_RECORDS_STORE_NAME);
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getWebsiteVisits(
  startDate?: Date,
  endDate?: Date
): Promise<WebsiteVisits> {
  const records = await getBrowsingRecords(startDate, endDate);
  const visits: WebsiteVisits = {};

  records.forEach((record) => {
    const mainDomain = record.url;
    if (!visits[mainDomain]) {
      visits[mainDomain] = {
        url: mainDomain,
        title: record.title,
        favicon: record.favicon,
        visitCount: record.visitCount || 0,
        timeSpent: record.timeSpent || 0,
        lastVisit: record.lastVisit || record.timestamp
      };
    } else {
      visits[mainDomain].visitCount += record.visitCount || 0;
      visits[mainDomain].timeSpent += record.timeSpent || 0;
      visits[mainDomain].lastVisit = Math.max(
        visits[mainDomain].lastVisit,
        record.lastVisit || record.timestamp
      );
    }
  });

  return visits;
}
