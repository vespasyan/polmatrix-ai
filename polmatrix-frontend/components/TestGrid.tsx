// src/components/TestGrid.tsx
import React from "react"

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis
} from "recharts"

const sampleData = [
  { label: "2020-Q1", value: 2.5 },
  { label: "2020-Q2", value: -1.2 },
  { label: "2020-Q3", value: 3.0 },
  { label: "2020-Q4", value: 1.8 },
]

export default function TestGrid() {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "500px",
        height: "300px",
        margin: "2rem auto",
        /* Use your “card” background variable: */
        backgroundColor: "var(--color-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "0.5rem",
        padding: "1rem",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "1rem",
          /* Use your “primary foreground” variable for the title: */
          color: "var(--color-primary-foreground)",
        }}
      >
        Test Grid
      </h2>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={sampleData}>
          
          <CartesianGrid
            /* The override in your CSS forces all grid lines to use --deep-purple: */
            strokeDasharray="4 4"
            strokeOpacity={0.8}
            strokeWidth={1}
          />
          <XAxis
            dataKey="label"
            /* Use your “text-secondary” variable for the tick color: */
            stroke="#FFFFFF"
            tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
            axisLine={{ stroke: "var(--color-border)", strokeWidth: 1 }}
            tickLine={{ stroke: "var(--color-border)", strokeWidth: 1 }}
          />
          <YAxis
            /* Also use “text-secondary” for Y-axis ticks: */
            stroke="#FFFFFF"
            tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
            axisLine={{ stroke: "var(--color-border)", strokeWidth: 1 }}
            tickLine={{ stroke: "var(--color-border)", strokeWidth: 1 }}
            width={40}
            domain={["auto", "auto"]} 
          />
          <Line
            type="monotone"
            dataKey="value"
            /* Use your “chart-1” variable for the line color: */
            stroke="var(--color-chart-1)"
            strokeWidth={2}
            dot={{ r: 4, fill: "var(--color-chart-1)" }}
            activeDot={{
              r: 6,
              stroke: "var(--color-card)",        // white outline on dark
              strokeWidth: 2,
            }}
          />
          
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
// Note: Ensure you have the necessary CSS variables defined in your global styles
// for colors like --color-card, --color-border, --color-primary-foreground,