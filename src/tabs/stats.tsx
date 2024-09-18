import React, { useEffect, useState } from "react"

import type { WebsiteVisit } from "../types"
import { formatTime } from "../utils/helpers"
import { getWebsiteVisits } from "../utils/storage"

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

  const fetchWebsiteStats = () => {
    getWebsiteVisits().then((visits) => {
      const statsArray = Object.values(visits)
      setWebsiteStats(statsArray.sort((a, b) => b.visitCount - a.visitCount))
    })
  }

  useEffect(() => {
    fetchWebsiteStats() // 初始加载

    // 添加焦点事件监听器
    window.addEventListener("focus", fetchWebsiteStats)

    // 清理函数
    return () => {
      window.removeEventListener("focus", fetchWebsiteStats)
    }
  }, [])

  return (
    <div className="flex flex-col p-4 w-full overflow-auto">
      <h1 className="text-xl font-bold mb-4">今日浏览统计</h1>
      <div className="flex flex-wrap justify-start -mx-2">
        {websiteStats.map((site, index) => (
          <WebsiteCard key={index} {...site} />
        ))}
      </div>
    </div>
  )
}

export default StatsPage
