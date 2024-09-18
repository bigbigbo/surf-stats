import { useEffect, useState } from "react"

import type { WebsiteVisit } from "./types"
import { formatTime } from "./utils/helpers"
import { getWebsiteVisits } from "./utils/storage"

import "./index.css"

function WebsiteCard({ favicon, title, url, timeSpent }: WebsiteVisit) {
  return (
    <div className="bg-white rounded-lg shadow-md p-3 mb-3">
      <div className="flex items-center">
        <img
          src={favicon}
          alt={`${title} 图标`}
          className="w-6 h-6 mr-2 flex-shrink-0"
        />
        <div className="flex-grow min-w-0">
          <h3 className="text-sm font-semibold truncate" title={title}>
            {title}
          </h3>
          <p className="text-xs text-gray-500 truncate" title={url}>
            {url}
          </p>
        </div>
        <p className="text-xs ml-2 flex-shrink-0">{formatTime(timeSpent)}</p>
      </div>
    </div>
  )
}

function IndexPopup() {
  const [topWebsites, setTopWebsites] = useState<WebsiteVisit[]>([])

  useEffect(() => {
    getWebsiteVisits().then((visits) => {
      const statsArray = Object.values(visits)
      setTopWebsites(
        statsArray.sort((a, b) => b.timeSpent - a.timeSpent).slice(0, 5)
      )
    })
  }, [])

  const openStatsPage = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("tabs/stats.html") })
  }

  return (
    <div className="flex flex-col p-4 w-[300px] h-[500px] overflow-auto">
      <h1 className="text-xl font-bold mb-4">今日浏览时长 Top 5</h1>
      {topWebsites.map((site, index) => (
        <WebsiteCard key={index} {...site} />
      ))}
      <button
        onClick={openStatsPage}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">
        查看更多
      </button>
    </div>
  )
}

export default IndexPopup
