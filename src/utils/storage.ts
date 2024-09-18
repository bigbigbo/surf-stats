import type { WebsiteVisit, WebsiteVisits } from "../types"

export const StorageKeys = {
  WEBSITE_VISITS: "websiteVisits",
  HIDDEN_SITES: "hiddenSites"
} as const

export async function getWebsiteVisits(): Promise<WebsiteVisits> {
  return new Promise((resolve) => {
    chrome.storage.local.get([StorageKeys.WEBSITE_VISITS], (result) => {
      resolve((result[StorageKeys.WEBSITE_VISITS] as WebsiteVisits) || {})
    })
  })
}

export async function setWebsiteVisits(
  websiteVisits: WebsiteVisits
): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set(
      { [StorageKeys.WEBSITE_VISITS]: websiteVisits },
      resolve
    )
  })
}

export async function updateWebsiteVisit(
  hostname: string,
  update: Partial<WebsiteVisit>
): Promise<void> {
  const websiteVisits = await getWebsiteVisits()
  if (!websiteVisits[hostname]) {
    websiteVisits[hostname] = {
      url: hostname,
      title: "",
      favicon: "",
      visitCount: 0,
      timeSpent: 0,
      ...update
    }
  } else {
    websiteVisits[hostname] = { ...websiteVisits[hostname], ...update }
  }
  await setWebsiteVisits(websiteVisits)
}

export async function clearWebsiteVisits(): Promise<void> {
  await setWebsiteVisits({})
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
