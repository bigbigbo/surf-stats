import { Button } from "@/components/button";
import { Calendar } from "@/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/table";
import { cn } from "@/utils/class";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";

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
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: new Date()
  });

  const fetchWebsiteStats = async (from: Date, to: Date) => {
    const [visits, hidden, showHidden] = await Promise.all([
      getWebsiteVisits(from, to),
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
    fetchWebsiteStats(date.from, date.to);
    window.addEventListener("focus", () =>
      fetchWebsiteStats(date.from, date.to)
    );

    return () => {
      window.removeEventListener("focus", () =>
        fetchWebsiteStats(date.from, date.to)
      );
    };
  }, [date]);

  const handleShowHiddenSitesChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = e.target.checked;
    await setShowHiddenSites(newValue);
    if (date?.from && date?.to) {
      fetchWebsiteStats(date.from, date.to);
    }
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

  const handleRefresh = () => {
    if (date?.from && date?.to) {
      fetchWebsiteStats(date.from, date.to);
    }
  };

  const handleDateSelect = (selectedDate: DateRange | undefined) => {
    setDate(selectedDate);
    if (selectedDate?.from && selectedDate?.to) {
      const endDate = new Date(selectedDate.to);
      endDate.setDate(endDate.getDate() + 1); // 包含结束日期
      fetchWebsiteStats(selectedDate.from, endDate);
    }
  };

  return (
    <div className="flex flex-col p-4 w-full overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">
          浏览时长总计: {formatTime(totalTimeSpent)}
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
          <Button variant="link" onClick={handleOpenOptions}>
            设置
          </Button>
        </div>
      </div>
      <div className="flex items-center mb-2">
        <Button className="mr-2" variant="outline" onClick={handleRefresh}>
          刷新
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-[300px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y", { locale: zhCN })} -{" "}
                    {format(date.to, "LLL dd, y", { locale: zhCN })}
                  </>
                ) : (
                  format(date.from, "LLL dd, y", { locale: zhCN })
                )
              ) : (
                <span>选择日期</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              locale={zhCN}
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleDateSelect}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
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
