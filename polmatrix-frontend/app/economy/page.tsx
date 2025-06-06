"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  ResponsiveContainer, 
  LineChart, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart,
  Bar
} from "recharts"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Activity, 
  Download, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  RefreshCw,
  AlertCircle
} from "lucide-react"
import SkeletonTable from "@/components/SkeletonTable"
import GlobalFilter from "@/components/GlobalFilter"
import EconomyFormModal from "@/components/EconomyFormModal"
import { fetchEconomyData } from "@/lib/api"
import { economyMetrics } from "@/lib/economyMetrics"
import Papa from "papaparse"

interface EconomyData {
  economy_id: number
  geography_id: number
  time_id: number
  gdp_growth_rate: number
  unemployment_rate: number
  inflation_rate: number
  trade_balance: number
  investment_rate: number
  debt_to_gdp_ratio: number
  currency_exchange_rate: number
  average_gdp_growth: number
  total_trade_balance: number
  source: string
  economic_filter: number
  country_name?: string
  year?: number
}

const EconomyPage = () => {
  // Filter and data states
  const [filters, setFilters] = useState({
    geography_id: ["1"], 
    time_id: ["54", "55", "56"],
    economic_filter: undefined as number | undefined
  })
  
  const [economyData, setEconomyData] = useState<EconomyData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // UI states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editData, setEditData] = useState<EconomyData | null>(null)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<keyof EconomyData>("year")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  
  const rowsPerPage = 10

  // Fetch economy data
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await fetchEconomyData({
        countries: filters.geography_id,
        timeIds: filters.time_id,
        economicFilter: filters.economic_filter
      })
      setEconomyData(data)
    } catch (err) {
      console.error("Error fetching economy data:", err)
      setError("Failed to load economy data. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Handle delete
  const handleDelete = async (economyId: number) => {
    if (!confirm("Are you sure you want to delete this economy record?")) return
    
    try {
      // Note: You'll need to implement the delete API endpoint
      console.log("Deleting economy record:", economyId)
      // await api.delete(`/economy/${economyId}`)
      fetchData() // Refresh data after deletion
    } catch (error) {
      console.error("Error deleting economy data:", error)
      setError("Failed to delete record. Please try again.")
    }
  }

  // Filter and sort data
  const filteredData = economyData
    .filter(row => 
      row.country_name?.toLowerCase().includes(search.toLowerCase()) ||
      row.year?.toString().includes(search)
    )
    .sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      const multiplier = sortDirection === "asc" ? 1 : -1
      
      if (typeof aVal === "number" && typeof bVal === "number") {
        return (aVal - bVal) * multiplier
      }
      return String(aVal).localeCompare(String(bVal)) * multiplier
    })

  const totalPages = Math.ceil(filteredData.length / rowsPerPage)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  )

  // CSV Download
  const handleDownloadCSV = () => {
    const csvData = filteredData.map(row => ({
      Country: row.country_name,
      Year: row.year,
      "GDP Growth (%)": row.gdp_growth_rate,
      "Unemployment (%)": row.unemployment_rate,
      "Inflation (%)": row.inflation_rate,
      "Trade Balance": row.trade_balance,
      "Investment Rate (%)": row.investment_rate,
      "Debt to GDP (%)": row.debt_to_gdp_ratio,
      "Exchange Rate": row.currency_exchange_rate,
      Source: row.source
    }))

    const csv = Papa.unparse(csvData)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `economy-data-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Chart data processing
  const chartData = economyData.reduce((acc, item) => {
    const key = `${item.country_name}-${item.year}`
    if (!acc[key]) {
      acc[key] = {
        country: item.country_name,
        year: item.year,
        gdp_growth: item.gdp_growth_rate,
        unemployment: item.unemployment_rate,
        inflation: item.inflation_rate,
        trade_balance: item.trade_balance
      }
    }
    return acc
  }, {} as Record<string, any>)

  const chartDataArray = Object.values(chartData)

  // KPI calculations
  const calculateKPIs = () => {
    if (economyData.length === 0) return null

    const avgGdpGrowth = economyData.reduce((sum, item) => sum + item.gdp_growth_rate, 0) / economyData.length
    const avgUnemployment = economyData.reduce((sum, item) => sum + item.unemployment_rate, 0) / economyData.length
    const avgInflation = economyData.reduce((sum, item) => sum + item.inflation_rate, 0) / economyData.length
    const totalTradeBalance = economyData.reduce((sum, item) => sum + item.trade_balance, 0)

    return {
      avgGdpGrowth,
      avgUnemployment,
      avgInflation,
      totalTradeBalance
    }
  }

  const kpis = calculateKPIs()

  const handleSort = (field: keyof EconomyData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              Economy Analytics
            </h1>
            <p className="text-[var(--text-secondary)] mt-2">
              Comprehensive economic indicators and policy impact analysis
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--input-bg)] text-[var(--text-secondary)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--hover-bg)] transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            
            <button
              onClick={() => {
                setEditData(null)
                setIsModalOpen(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
            >
              <Plus size={16} />
              Add Economy Data
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-medium text-red-800 dark:text-red-200">Error</div>
              <div className="text-sm text-red-600 dark:text-red-300">{error}</div>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              ×
            </button>
          </div>
        )}

        {/* Global Filters */}
        <GlobalFilter 
          onFilterChange={(newFilters) => setFilters({
            geography_id: newFilters.geography_id,
            time_id: newFilters.time_id,
            economic_filter: newFilters.economic_filter
          })}
        />

        {/* KPI Cards */}
        {kpis && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">Avg GDP Growth</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{kpis.avgGdpGrowth.toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">Avg Unemployment</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{kpis.avgUnemployment.toFixed(1)}%</p>
                </div>
                <Users className="h-8 w-8 text-orange-500" />
              </div>
            </div>

            <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">Avg Inflation</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{kpis.avgInflation.toFixed(1)}%</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">Trade Balance</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    ${(kpis.totalTradeBalance / 1_000_000_000).toFixed(1)}B
                  </p>
                </div>
                {kpis.totalTradeBalance >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-green-500" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-500" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Economy Data Table</h2>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setCurrentPage(1)
                    }}
                    placeholder="Search countries or years..."
                    className="pl-10 pr-4 py-2 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <button
                  onClick={handleDownloadCSV}
                  disabled={filteredData.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download size={16} />
                  CSV
                </button>
              </div>
            </div>

            {loading ? (
              <SkeletonTable />
            ) : filteredData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--input-bg)] border-b border-[var(--border-color)]">
                    <tr>
                      <th 
                        className="px-4 py-3 text-left text-sm font-medium text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]"
                        onClick={() => handleSort("country_name")}
                      >
                        Country
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-sm font-medium text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]"
                        onClick={() => handleSort("year")}
                      >
                        Year
                      </th>
                      <th 
                        className="px-4 py-3 text-right text-sm font-medium text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]"
                        onClick={() => handleSort("gdp_growth_rate")}
                      >
                        GDP Growth (%)
                      </th>
                      <th 
                        className="px-4 py-3 text-right text-sm font-medium text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]"
                        onClick={() => handleSort("unemployment_rate")}
                      >
                        Unemployment (%)
                      </th>
                      <th 
                        className="px-4 py-3 text-right text-sm font-medium text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]"
                        onClick={() => handleSort("inflation_rate")}
                      >
                        Inflation (%)
                      </th>
                      <th 
                        className="px-4 py-3 text-right text-sm font-medium text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]"
                        onClick={() => handleSort("trade_balance")}
                      >
                        Trade Balance
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-[var(--text-secondary)]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {paginatedData.map((row) => (
                      <tr key={row.economy_id} className="hover:bg-[var(--hover-bg)] transition-colors">
                        <td className="px-4 py-3 text-[var(--text-primary)] font-medium">
                          {row.country_name}
                        </td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">
                          {row.year}
                        </td>
                        <td className="px-4 py-3 text-right text-[var(--text-primary)]">
                          <span className={`inline-flex items-center ${
                            row.gdp_growth_rate >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {row.gdp_growth_rate >= 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                            {row.gdp_growth_rate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-[var(--text-primary)]">
                          {row.unemployment_rate.toFixed(1)}%
                        </td>
                        <td className="px-4 py-3 text-right text-[var(--text-primary)]">
                          {row.inflation_rate.toFixed(1)}%
                        </td>
                        <td className="px-4 py-3 text-right text-[var(--text-primary)]">
                          <span className={row.trade_balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                            ${(row.trade_balance / 1_000_000_000).toFixed(2)}B
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setEditData(row)
                                setIsModalOpen(true)
                              }}
                              className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(row.economy_id)}
                              className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t border-[var(--border-color)]">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--hover-bg)] transition-colors"
                    >
                      Previous
                    </button>
                    
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const page = i + 1
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 rounded-lg transition-colors ${
                            currentPage === page
                              ? "bg-blue-500 text-white"
                              : "bg-[var(--input-bg)] border border-[var(--border-color)] hover:bg-[var(--hover-bg)]"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--hover-bg)] transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Filter className="h-12 w-12 text-[var(--text-secondary)] mx-auto mb-4 opacity-50" />
                <p className="text-[var(--text-secondary)]">No economy data found.</p>
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                  Try adjusting your filters or add new data.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Charts */}
        {chartDataArray.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* GDP Growth Trend */}
            <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)]">
              <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">GDP Growth Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartDataArray}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis 
                    dataKey="year" 
                    stroke="var(--text-secondary)"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="var(--text-secondary)"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--tooltip-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="gdp_growth" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="GDP Growth (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Unemployment vs Inflation */}
            <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)]">
              <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Unemployment vs Inflation</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartDataArray}>
                  <CartesianGrid strokeDasharray="5 5" stroke="var(--border-color)" />
                  <XAxis 
                    dataKey="year" 
                    stroke="var(--text-secondary)"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="var(--text-secondary)"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--tooltip-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="unemployment"
                    stackId="1"
                    stroke="#F59E0B"
                    fill="#F59E0B"
                    fillOpacity={0.6}
                    name="Unemployment (%)"
                  />
                  <Area
                    type="monotone"
                    dataKey="inflation"
                    stackId="2"
                    stroke="#EF4444"
                    fill="#EF4444"
                    fillOpacity={0.6}
                    name="Inflation (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Trade Balance Comparison */}
            <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)]">
              <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Trade Balance by Country</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartDataArray}>
                  <CartesianGrid strokeDasharray="5 5" stroke="var(--border-color)" />
                  <XAxis 
                    dataKey="country" 
                    stroke="var(--text-secondary)"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    stroke="var(--text-secondary)"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--tooltip-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${(value / 1_000_000_000).toFixed(2)}B`, 'Trade Balance']}
                  />
                  <Legend />
                  <Bar 
                    dataKey="trade_balance" 
                    name="Trade Balance ($B)"
                    radius={[4, 4, 0, 0]}
                  >
                    {chartDataArray.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.trade_balance >= 0 ? "#22C55E" : "#EF4444"} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Economic Indicators Summary */}
            <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)]">
              <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Economic Health Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Strong Growth', value: chartDataArray.filter(d => d.gdp_growth >= 3).length, fill: '#22C55E' },
                      { name: 'Moderate Growth', value: chartDataArray.filter(d => d.gdp_growth >= 1 && d.gdp_growth < 3).length, fill: '#F59E0B' },
                      { name: 'Weak/Negative', value: chartDataArray.filter(d => d.gdp_growth < 1).length, fill: '#EF4444' }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    dataKey="value"
                  />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}        {/* Economy Form Modal */}
        <EconomyFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchData}
          editData={editData ? {
            economy_id: editData.economy_id,
            gdp: editData.gdp_growth_rate.toString(),
            unemployment_rate: editData.unemployment_rate.toString(),
            inflation_rate: editData.inflation_rate.toString()
          } : null}
          filters={{
            geography_id: parseInt(filters.geography_id[0] || "1"),
            time_id: parseInt(filters.time_id[0] || "54")
          }}
        />
      </div>
    </div>
  )
}

export default EconomyPage