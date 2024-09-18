export interface WebsiteVisit {
  url: string;
  title: string;
  favicon: string;
  visitCount: number;
  timeSpent: number;
}

export type WebsiteVisits = { [url: string]: WebsiteVisit };
