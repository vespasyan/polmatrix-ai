"use client"

import { useState, useEffect } from "react"
import api from "@lib/api"

interface EconomyFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editData?: {
    economy_id: number
    gdp: string
    unemployment_rate: string
    inflation_rate: string
  } | null
  filters: {
    geography_id: number
    time_id: number
  }
}

const EconomyFormModal: React.FC<EconomyFormModalProps> = ({ isOpen, onClose, onSuccess, editData, filters }) => {
  const [gdp, setGdp] = useState("")
  const [unemployment, setUnemployment] = useState("")
  const [inflation, setInflation] = useState("")

  useEffect(() => {
    if (editData) {
      setGdp(editData.gdp)
      setUnemployment(editData.unemployment_rate)
      setInflation(editData.inflation_rate)
    } else {
      setGdp("")
      setUnemployment("")
      setInflation("")
    }
  }, [editData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const data = {
      geography_id: filters.geography_id,
      time_id: filters.time_id,
      gdp: parseFloat(gdp),
      unemployment_rate: parseFloat(unemployment),
      inflation_rate: parseFloat(inflation),
    }

    try {
      if (editData) {
        await api.put(`/economy/${editData.economy_id}`, data)
      } else {
        await api.post("/economy", data)
      }
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error saving economy:", error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form
          onSubmit={handleSubmit}
          className="bg-background p-6 rounded-xl w-[300px] space-y-4"
        >
          <h3 className="text-lg font-semibold">
            {editData ? "Edit Economy" : "Add Economy"}
          </h3>

          <input
            type="number"
            placeholder="GDP"
            value={gdp}
            onChange={(e) => setGdp(e.target.value)}
            className="p-2 border rounded-md w-full"
            required
          />

          <input
            type="number"
            placeholder="Unemployment %"
            value={unemployment}
            onChange={(e) => setUnemployment(e.target.value)}
            className="p-2 border rounded-md w-full"
            required
          />

          <input
            type="number"
            placeholder="Inflation %"
            value={inflation}
            onChange={(e) => setInflation(e.target.value)}
            className="p-2 border rounded-md w-full"
            required
          />

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-1 border rounded-md">
              Cancel
            </button>
            <button type="submit" className="px-3 py-1 border rounded-md bg-primary text-primary-foreground">
              {editData ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EconomyFormModal