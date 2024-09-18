import { useEffect, useState } from "react"

import { clearAllStats, getHiddenSites, setHiddenSites } from "./utils/storage"

import "./index.css"

function IndexOptions() {
  const [hiddenSites, setHiddenSitesState] = useState<string[]>([])
  const [newSite, setNewSite] = useState("")
  const [editingSite, setEditingSite] = useState<string | null>(null)
  const [editedSite, setEditedSite] = useState("")

  useEffect(() => {
    getHiddenSites().then(setHiddenSitesState)
  }, [])

  const handleAddSite = async () => {
    if (newSite && !hiddenSites.includes(newSite)) {
      const updatedSites = [...hiddenSites, newSite]
      setHiddenSitesState(updatedSites)
      await setHiddenSites(updatedSites) // 确保异步操作完成
      setNewSite("")
    }
  }

  const handleRemoveSite = async (site: string) => {
    const updatedSites = hiddenSites.filter((s) => s !== site)
    setHiddenSitesState(updatedSites)
    await setHiddenSites(updatedSites) // 确保异步操作完成
  }

  const handleEditSite = (site: string) => {
    setEditingSite(site)
    setEditedSite(site)
  }

  const handleSaveEdit = async () => {
    if (editingSite && editedSite && !hiddenSites.includes(editedSite)) {
      const updatedSites = hiddenSites.map((site) =>
        site === editingSite ? editedSite : site
      )
      setHiddenSitesState(updatedSites)
      await setHiddenSites(updatedSites) // 确保异步操作完成
      setEditingSite(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingSite(null)
    setEditedSite("")
  }

  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const handleClearStats = () => {
    setShowConfirmDialog(true)
  }

  const confirmClearStats = async () => {
    await clearAllStats()
    setShowConfirmDialog(false)
    // 可以在这里添加一个提示，告诉用户数据已被清除
    alert("所有统计信息已被删除")
  }

  return (
    <div className="flex justify-center min-h-screen ">
      <div className="max-w-2xl w-full p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          设置
        </h1>
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            不显示跟踪的网站
          </h2>
          <div className="flex mb-4">
            <input
              type="text"
              className="flex-grow border border-gray-300 rounded-l p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="输入要隐藏的网站域名"
              value={newSite}
              onChange={(e) => setNewSite(e.target.value)}
            />
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-r transition duration-200"
              onClick={handleAddSite}>
              添加
            </button>
          </div>
          {hiddenSites.length > 0 ? (
            <ul className="bg-gray-50 rounded-lg p-4 space-y-2">
              {hiddenSites.map((site) => (
                <li
                  key={site}
                  className="flex items-center justify-between p-2 bg-white rounded shadow-sm">
                  {editingSite === site ? (
                    <>
                      <input
                        type="text"
                        className="flex-grow border border-gray-300 rounded p-1 mr-2"
                        value={editedSite}
                        onChange={(e) => setEditedSite(e.target.value)}
                      />
                      <div>
                        <button
                          className="text-green-500 hover:text-green-700 font-medium transition duration-200 mr-2"
                          onClick={handleSaveEdit}>
                          保存
                        </button>
                        <button
                          className="text-gray-500 hover:text-gray-700 font-medium transition duration-200"
                          onClick={handleCancelEdit}>
                          取消
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-gray-700">{site}</span>
                      <div>
                        <button
                          className="text-blue-500 hover:text-blue-700 font-medium transition duration-200 mr-2"
                          onClick={() => handleEditSite(site)}>
                          编辑
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700 font-medium transition duration-200"
                          onClick={() => handleRemoveSite(site)}>
                          删除
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center">暂无隐藏的网站</p>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">数据管理</h2>
          <button
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-200"
            onClick={handleClearStats}>
            删除所有统计信息
          </button>
        </div>

        {showConfirmDialog && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="bg-white p-5 rounded-lg shadow-xl">
              <h3 className="text-lg font-bold mb-4">确认删除</h3>
              <p className="mb-4">
                您确定要删除所有统计信息吗？此操作不可撤销。
              </p>
              <div className="flex justify-end">
                <button
                  className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded mr-2"
                  onClick={() => setShowConfirmDialog(false)}>
                  取消
                </button>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                  onClick={confirmClearStats}>
                  确认删除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default IndexOptions
