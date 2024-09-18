import { useState } from "react"

import "./index.css"

function IndexPopup() {
  const [data, setData] = useState("")

  return (
    <div className="flex flex-col p-4 w-[300px] h-[400px] overflow-auto">
      <h1 className="text-xl font-bold mb-4">
        Welcome to your{" "}
        <a
          href="https://www.plasmo.com"
          className="text-blue-600 hover:underline">
          Plasmo
        </a>{" "}
        Extension!
      </h1>
      <input
        className="border border-gray-300 rounded p-2 mb-4"
        onChange={(e) => setData(e.target.value)}
        value={data}
        placeholder="输入一些文字..."
      />
      <p className="mb-4 text-sm">您输入的内容: {data}</p>
      <footer className="text-xs text-gray-500 mt-auto">
        Crafted by @PlasmoHQ
      </footer>
    </div>
  )
}

export default IndexPopup
