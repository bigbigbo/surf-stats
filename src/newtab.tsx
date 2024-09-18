import { useState } from "react"

import "./index.css"

function IndexNewtab() {
  const [data, setData] = useState("")

  return (
    <div className="new-tab flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-4">
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
      />
      <footer className="text-sm text-gray-500">Crafted by @PlasmoHQ</footer>
    </div>
  )
}

export default IndexNewtab
