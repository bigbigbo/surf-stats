export interface BrowsingRecord {
  url: string;
  date: string;
  title: string;
  favicon: string;
  timestamp: number;
  visitCount: number;
  timeSpent: number;
  lastVisit: number;
}

export interface WebsiteVisit {
  url: string;
  title: string;
  favicon: string;
  visitCount: number;
  timeSpent: number;
  lastVisit: number;
}

export type WebsiteVisits = { [url: string]: WebsiteVisit };
