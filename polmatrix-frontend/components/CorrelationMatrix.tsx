"use client"

import { useState } from "react"

type MatrixData = {
  [key: string]: {
    [key: string]: number
  }
}

export default function CorrelationMatrix() {
  // Define the categories
  const categories = ["Economy", "Education", "Environment", "Health"]

  // Define the data (hardcoded for now)
  const [data] = useState<MatrixData>({
    Economy: {
      Economy: 1.0,
      Education: 0.75,
      Environment: 0.42,
      Health: 0.65
    },
    Education: {
      Economy: 0.75,
      Education: 1.0,
      Environment: 0.58,
      Health: 0.82
    },
    Environment: {
      Economy: 0.42,
      Education: 0.58,
      Environment: 1.0,
      Health: 0.35
    },
    Health: {
      Economy: 0.65,
      Education: 0.82,
      Environment: 0.35,
      Health: 1.0
    }
  })

  // Function to get background color based on correlation value
  const getBackgroundColor = (value: number, isDiagonal: boolean): string => {
    if (isDiagonal) return "bg-gray-500/30"
    if (value > 0.7) return "bg-green-500/30"
    if (value >= 0.4) return "bg-yellow-500/30"
    return "bg-red-500/30"
  }

  // Function to get text color based on correlation value
  const getTextColor = (value: number, isDiagonal: boolean): string => {
    if (isDiagonal) return "text-gray-200"
    if (value > 0.7) return "text-green-500"
    if (value >= 0.4) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <div className="w-full overflow-auto p-6 rounded-xl shadow bg-[var(--card-bg)] relative">
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Correlation Matrix</h3>
      
      <div className="min-w-[300px]">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left text-[var(--text-secondary)]"></th>
              {categories.map((category) => (
                <th 
                  key={category} 
                  className="p-2 text-center text-[var(--text-secondary)]"
                >
                  {category}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((row) => (
              <tr key={row}>
                <td className="p-2 text-left font-medium text-[var(--text-secondary)]">
                  {row}
                </td>
                {categories.map((col) => {
                  const value = data[row][col]
                  const isDiagonal = row === col
                  return (
                    <td
                      key={`${row}-${col}`}
                      className={`p-2 text-center transition-all hover:scale-105 ${getBackgroundColor(value, isDiagonal)} border border-[var(--border-color)]/10 rounded-sm`}
                    >
                      <span className={`font-medium ${getTextColor(value, isDiagonal)}`}>
                        {value.toFixed(2)}
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between mt-4 text-sm text-[var(--text-secondary)]">
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 bg-green-500/30 rounded-sm mr-1"></span>
          <span>Strong (&gt;0.7)</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 bg-yellow-500/30 rounded-sm mr-1"></span>
          <span>Medium (0.4-0.7)</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 bg-red-500/30 rounded-sm mr-1"></span>
          <span>Weak (&lt;0.4)</span>
        </div>
      </div>
    </div>
  )
}