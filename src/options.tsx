import React, { useEffect, useState } from "react"

import { getHiddenSites, setHiddenSites } from "./utils/storage"

import "./index.css"

function IndexOptions() {
  const [hiddenSites, setHiddenSitesState] = useState<string[]>([])
  const [newSite, setNewSite] = useState("")

  useEffect(() => {
    getHiddenSites().then(setHiddenSitesState)
  }, [])

  const handleAddSite = () => {
    if (newSite && !hiddenSites.includes(newSite)) {
      const updatedSites = [...hiddenSites, newSite]
      setHiddenSitesState(updatedSites)
      setHiddenSites(updatedSites)
      setNewSite("")
    }
  }

  const handleRemoveSite = (site: string) => {
    const updatedSites = hiddenSites.filter((s) => s !== site)
    setHiddenSitesState(updatedSites)
    setHiddenSites(updatedSites)
  }

  return (
    <div className="flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-4">设置</h1>
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">不显示跟踪的网站</h2>
        <div className="flex mb-2">
          <input
            type="text"
            className="flex-grow border border-gray-300 rounded-l p-2"
            placeholder="输入要隐藏的网站域名"
            value={newSite}
            onChange={(e) => setNewSite(e.target.value)}
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r"
            onClick={handleAddSite}>
            添加
          </button>
        </div>
        <ul className="list-disc pl-5">
          {hiddenSites.map((site) => (
            <li key={site} className="flex items-center justify-between mb-1">
              <span>{site}</span>
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => handleRemoveSite(site)}>
                删除
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default IndexOptions
