"use client"

import { useEffect, useState } from "react"
import api from "@lib/api"
import GlobalFilter from "@components/GlobalFilter"

const AdminEconomyPage = () => {
  const [economy, setEconomy] = useState<any[]>([])
  const [filters, setFilters] = useState({ geography_id: "1", time_id: "4" })

  const fetchData = async () => {
    const res = await api.get(`/economy?geography_id=${filters.geography_id}&time_id=${filters.time_id}`)
    setEconomy(res.data.data)
  }

  useEffect(() => {
    fetchData()
  }, [filters])

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure to delete this economy record?")) {
      await api.delete(`/economy/${id}`)
      fetchData()
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Economy Admin Panel</h2>

      {/* Filters */}
      <GlobalFilter onFilterChange={setFilters} />

      {/* Add Economy */}
      <button
        className="px-4 py-2 border rounded-md bg-primary text-primary-foreground"
        onClick={() => alert("Add Economy Modal coming next")}
      >
        Add New Economy
      </button>

      {/* Economy Table */}
      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-2 border">Time ID</th>
              <th className="p-2 border">GDP</th>
              <th className="p-2 border">Unemployment %</th>
              <th className="p-2 border">Inflation %</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {economy.map((row) => (
              <tr key={row.economy_id}>
                <td className="p-2 border text-center">{row.time_id}</td>
                <td className="p-2 border text-right">${(row.gdp / 1_000_000_000).toFixed(1)}B</td>
                <td className="p-2 border text-center">{row.unemployment_rate}%</td>
                <td className="p-2 border text-center">{row.inflation_rate}%</td>
                <td className="p-2 border text-center">
                  <button
                    onClick={() => alert("Edit Form coming next")}
                    className="px-2 py-1 border rounded-md mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(row.economy_id)}
                    className="px-2 py-1 border rounded-md text-red-500"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}

export default AdminEconomyPage
