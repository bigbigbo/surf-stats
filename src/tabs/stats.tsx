import React, { useEffect, useState } from "react"
import { CSSTransition, TransitionGroup } from "react-transition-group"

import type { WebsiteVisit } from "../types"
import { formatTime, getMainDomain } from "../utils/helpers"
import {
  getHiddenSites,
  getShowHiddenSites,
  getWebsiteVisits,
  setShowHiddenSites
} from "../utils/storage"

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
  const [showHiddenSites, setShowHiddenSitesState] = useState(false)

  const fetchWebsiteStats = async () => {
    const [visits, hidden, showHidden] = await Promise.all([
      getWebsiteVisits(),
      getHiddenSites(),
      getShowHiddenSites()
    ])
    setWebsiteStats(
      Object.values(visits).sort((a, b) => b.timeSpent - a.timeSpent)
    )
    setHiddenSites(hidden)
    setShowHiddenSitesState(showHidden)
  }

  useEffect(() => {
    fetchWebsiteStats()
    window.addEventListener("focus", fetchWebsiteStats)
    return () => {
      window.removeEventListener("focus", fetchWebsiteStats)
    }
  }, [])

  const handleShowHiddenSitesChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = e.target.checked
    await setShowHiddenSites(newValue)
    fetchWebsiteStats() // 重新获取数据
  }

  const filteredWebsiteStats = showHiddenSites
    ? websiteStats
    : websiteStats.filter((visit) => {
        const mainDomain = getMainDomain(visit.url)
        return !hiddenSites.includes(mainDomain)
      })

  const handleOpenOptions = () => {
    chrome.runtime.openOptionsPage()
  }

  return (
    <div className="flex flex-col p-4 w-full overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">今日浏览统计</h1>
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
      <TransitionGroup className="flex flex-wrap justify-start -mx-2">
        {filteredWebsiteStats.map((site) => (
          <CSSTransition key={site.url} timeout={300} classNames="item">
            <WebsiteCard {...site} />
          </CSSTransition>
        ))}
      </TransitionGroup>
    </div>
  )
}

export default StatsPage
