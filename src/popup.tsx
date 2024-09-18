import { useEffect, useState } from "react"

import type { WebsiteVisit } from "./types"
import { formatTime, getHostname } from "./utils/helpers"
import {
  getHiddenSites,
  getShowHiddenSites,
  getWebsiteVisits,
  setShowHiddenSites
} from "./utils/storage"

import "./index.css"

function WebsiteCard({ favicon, title, url, timeSpent }: WebsiteVisit) {
  return (
    <div className="flex items-center py-2">
      <img
        src={favicon}
        alt={`${title} 图标`}
        className="w-4 h-4 mr-2 flex-shrink-0"
      />
      <div className="flex-grow min-w-0 mr-2">
        <h3 className="text-sm font-medium truncate" title={title}>
          {title}
        </h3>
      </div>
      <p className="text-xs flex-shrink-0">{formatTime(timeSpent)}</p>
    </div>
  )
}

function IndexPopup() {
  const [topWebsites, setTopWebsites] = useState<WebsiteVisit[]>([])
  const [hiddenSites, setHiddenSites] = useState<string[]>([])
  const [showHiddenSites, setShowHiddenSitesState] = useState(false)

  const fetchData = async () => {
    const [visits, hidden, showHidden] = await Promise.all([
      getWebsiteVisits(),
      getHiddenSites(),
      getShowHiddenSites()
    ])
    setHiddenSites(hidden)
    setShowHiddenSitesState(showHidden)
    const statsArray = Object.values(visits)
    const filteredStats = showHidden
      ? statsArray
      : statsArray.filter((visit) => !hidden.includes(getHostname(visit.url)))
    setTopWebsites(
      filteredStats.sort((a, b) => b.timeSpent - a.timeSpent).slice(0, 5)
    )
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleShowHiddenSitesChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = e.target.checked
    await setShowHiddenSites(newValue)
    fetchData() // 重新获取数据
  }

  const openStatsPage = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("tabs/stats.html") })
  }

  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage()
  }

  return (
    <div className="flex flex-col p-4 w-[300px] h-[360px]">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold">今日浏览时长 Top 5</h1>
        <button
          onClick={openOptionsPage}
          className="text-blue-500 hover:text-blue-700 text-sm">
          设置
        </button>
      </div>
      <div className="flex-grow overflow-auto mb-4">
        {topWebsites.map((site, index) => (
          <WebsiteCard key={index} {...site} />
        ))}
      </div>
      <div className="mt-auto">
        <label className="flex items-center justify-between cursor-pointer mb-2">
          <span className="text-sm">显示隐藏的网站</span>
          <input
            type="checkbox"
            checked={showHiddenSites}
            onChange={handleShowHiddenSitesChange}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
        </label>
        <button
          onClick={openStatsPage}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">
          查看更多
        </button>
      </div>
    </div>
  )
}

export default IndexPopup
