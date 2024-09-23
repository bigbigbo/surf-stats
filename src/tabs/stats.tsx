import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/table";
import React, { useEffect, useState } from "react";

import {
  getHiddenSites,
  getShowHiddenSites,
  getWebsiteVisits,
  setShowHiddenSites
} from "../store/storage";
import type { WebsiteVisit } from "../types";
import { formatTime } from "../utils/date";
import { getHostname } from "../utils/url";

import "../index.css";

function StatsPage() {
  const [websiteStats, setWebsiteStats] = useState<WebsiteVisit[]>([]);
  const [hiddenSites, setHiddenSites] = useState<string[]>([]);
  const [showHiddenSites, setShowHiddenSitesState] = useState(false);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);

  const fetchWebsiteStats = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [visits, hidden, showHidden] = await Promise.all([
      getWebsiteVisits(today, tomorrow),
      getHiddenSites(),
      getShowHiddenSites()
    ]);
    const sortedVisits = Object.values(visits).sort(
      (a, b) => b.timeSpent - a.timeSpent
    );
    setWebsiteStats(sortedVisits);
    setHiddenSites(hidden);
    setShowHiddenSitesState(showHidden);
    setTotalTimeSpent(
      sortedVisits.reduce((total, visit) => total + visit.timeSpent, 0)
    );
  };

  useEffect(() => {
    fetchWebsiteStats();
    window.addEventListener("focus", fetchWebsiteStats);
    return () => {
      window.removeEventListener("focus", fetchWebsiteStats);
    };
  }, []);

  const handleShowHiddenSitesChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = e.target.checked;
    await setShowHiddenSites(newValue);
    fetchWebsiteStats();
  };

  const filteredWebsiteStats = showHiddenSites
    ? websiteStats
    : websiteStats.filter((visit) => {
        const mainDomain = getHostname(visit.url);
        return !hiddenSites.includes(mainDomain);
      });

  const handleOpenOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <div className="flex flex-col p-4 w-full overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">
          今日浏览时长总计: {formatTime(totalTimeSpent)}
        </h1>
        <div className="flex items-center">
          <label className="flex items-center cursor-pointer mr-4">
            <span className="mr-2 text-sm">显示隐藏的网站</span>
            <input
              type="checkbox"
              checked={showHiddenSites}
              onChange={handleShowHiddenSitesChange}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
          </label>
          <button
            onClick={handleOpenOptions}
            className="text-blue-600 hover:text-blue-800 text-sm">
            设置
          </button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">序号</TableHead>
            <TableHead>网站</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>访问次数</TableHead>
            <TableHead>访问时长</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredWebsiteStats.map((site, index) => (
            <TableRow key={site.url}>
              <TableCell className="text-center">{index + 1}</TableCell>
              <TableCell className="flex items-center">
                <img
                  src={site.favicon}
                  alt={`${site.title} logo`}
                  className="w-6 h-6 mr-2"
                />
                {site.title}
              </TableCell>
              <TableCell>
                <a
                  href={`https://${site.url}`}
                  target="_blank"
                  className="text-blue-500 hover:underline">
                  {site.url}
                </a>
              </TableCell>
              <TableCell>{site.visitCount}次</TableCell>
              <TableCell>{formatTime(site.timeSpent)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default StatsPage;
