"use client"

import React from "react"

export default function CorrelationChart() {
  return (
    <div className="p-6 rounded-xl shadow bg-[var(--card-bg)] relative transition-transform transform hover:scale-[1.005] hover:shadow-2xl hover:cursor-pointer hover:border hover:border-[var(--success-color)] w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Impact Correlations</h3>
      </div>
      
      <div className="text-center text-[var(--text-secondary)] py-16 animate-fadeIn">
        Correlation matrix will be displayed here.
      </div>
    </div>
  )
}