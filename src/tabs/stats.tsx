import React, { useEffect, useState } from "react"

import type { WebsiteVisit } from "../types"
import { formatTime, getHostname } from "../utils/helpers"
import { getHiddenSites, getWebsiteVisits } from "../utils/storage"

import "../index.css"

function WebsiteCard({
  favicon,
  title,
  url,
  visitCount,
  timeSpent
}: WebsiteVisit) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex flex-col items-center w-[calc(33.33%-1rem)] mx-2">
      <img src={favicon} alt={`${title} logo`} className="w-12 h-12 mb-2" />
      <h2 className="text-base font-semibold text-center line-clamp-2 h-12 overflow-hidden">
        {title}
      </h2>
      <a
        href={url}
        className="text-xs text-blue-500 hover:underline text-center truncate w-full">
        {url}
      </a>
      <p className="text-xs mt-2 text-center">
        访问：{visitCount}次
        <br />
        时长：{formatTime(timeSpent)}
      </p>
    </div>
  )
}

function StatsPage() {
  const [websiteStats, setWebsiteStats] = useState<WebsiteVisit[]>([])
  const [hiddenSites, setHiddenSites] = useState<string[]>([])
  const [showHiddenSites, setShowHiddenSites] = useState(false)
  console.log("showHiddenSites", showHiddenSites)

  const fetchWebsiteStats = async () => {
    const [visits, hidden] = await Promise.all([
      getWebsiteVisits(),
      getHiddenSites()
    ])
    setWebsiteStats(
      Object.values(visits).sort((a, b) => b.visitCount - a.visitCount)
    )
    setHiddenSites(hidden)
  }

  useEffect(() => {
    fetchWebsiteStats()
    window.addEventListener("focus", fetchWebsiteStats)
    return () => {
      window.removeEventListener("focus", fetchWebsiteStats)
    }
  }, [])

  const filteredWebsiteStats = showHiddenSites
    ? websiteStats
    : websiteStats.filter((visit) => {
        const hostname = getHostname(visit.url)
        console.log("hostname", hiddenSites, hostname)
        return !hiddenSites.includes(hostname)
      })

  return (
    <div className="flex flex-col p-4 w-full overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">今日浏览统计</h1>
        <label className="flex items-center cursor-pointer">
          <span className="mr-2 text-sm">显示隐藏的网站</span>
          <input
            type="checkbox"
            checked={showHiddenSites}
            onChange={(e) => setShowHiddenSites(e.target.checked)}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
        </label>
      </div>
      <div className="flex flex-wrap justify-start -mx-2">
        {filteredWebsiteStats.map((site, index) => (
          <WebsiteCard key={index} {...site} />
        ))}
      </div>
    </div>
  )
}

export default StatsPage
