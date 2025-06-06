"use client"

import { useEffect, useState } from "react"
import api from "@lib/api"
import GlobalFilter from "@components/GlobalFilter"
import AIOutput from "@components/AIOutput"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts"

const CorrelationPage = () => {
  const [filters, setFilters] = useState({ geography_id: "1", time_id: "4" })
  const [correlations, setCorrelations] = useState<any[]>([])
  const [summary, setSummary] = useState<string>("")
  const [geographies, setGeographies] = useState([{ geography_id: 1, name: "Global" }])
  const [times, setTimes] = useState([{ time_id: 4, year: 2024, quarter: null, month: null }])

  useEffect(() => {
    const fetchMetadata = async () => {
      const [geoRes, timeRes] = await Promise.all([
        api.get('/geographies'),
        api.get('/times')
      ])
      setGeographies(geoRes.data)
      setTimes(timeRes.data)
    }
    fetchMetadata()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      const res = await api.get(`/correlation?geography_id=${filters.geography_id}&time_id=${filters.time_id}`)
      setCorrelations(res.data.data)
    }

    fetchData()
  }, [filters])

  const handleAISummary = async () => {
    if (!correlations.length) return

    setSummary("Generating AI insights... Please wait...")

    const res = await api.post(`/ai/summary`, {
      geography_id: filters.geography_id,
      time_id: filters.time_id,
      correlations: correlations,
    })

    setSummary(res.data.summary)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Correlation Analysis</h2>

      <GlobalFilter 
        geographies={geographies}
        times={times}
        onFilterChange={setFilters} 
      />

      <div className="overflow-x-auto border rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-2 border">Correlation Type</th>
              <th className="p-2 border">Value</th>
            </tr>
          </thead>
          <tbody>
            {correlations.map((row, idx) => (
              <tr key={idx}>
                <td className="p-2 border">{row.correlation_type}</td>
                <td className="p-2 border text-center">{row.correlation_value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={correlations}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" opacity={0.6} />
          <XAxis dataKey="correlation_type" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="correlation_value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>

      <button
        onClick={handleAISummary}
        className="px-4 py-2 border rounded-md bg-primary text-primary-foreground hover:opacity-80 transition"
      >
        Generate AI Summary
      </button>

      <AIOutput text={summary} />

    </div>
  )
}

export default CorrelationPage
