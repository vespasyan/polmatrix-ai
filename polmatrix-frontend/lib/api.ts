import axios from 'axios'
import React from 'react';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
})

// API endpoints for each domain
export const endpoints = {
  economy: '/api/economy',
  health: '/api/health',
  education: '/api/education',
  environment: '/api/environment',
  socialDemographic: '/api/social-demographic',
  technology: '/api/technology',
  trade: '/api/trade',
  geography: '/api/geography',
  time: '/api/time'
}

//Sample Questions...
export async function fetchSimulationData(prompt: string): Promise<any[]> {
  const res = await fetch("/api/ai/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: prompt }),
  });

  const json = await res.json();
  return json.data || [];
}


// Data fetching functions
export const fetchEconomyData = async (filters?: any) => {
  const response = await api.get(endpoints.economy, { params: filters })
  return response.data
}

export const fetchHealthData = async (filters?: any) => {
  const response = await api.get(endpoints.health, { params: filters })
  return response.data
}

export const fetchEducationData = async (filters?: any) => {
  const response = await api.get(endpoints.education, { params: filters })
  return response.data
}

export const fetchEnvironmentData = async (filters?: any) => {
  const response = await api.get(endpoints.environment, { params: filters })
  return response.data
}

export const fetchSocialDemographicData = async (filters?: any) => {
  const response = await api.get(endpoints.socialDemographic, { params: filters })
  return response.data
}

export const fetchTechnologyData = async (filters?: any) => {
  const response = await api.get(endpoints.technology, { params: filters })
  return response.data
}

export const fetchTradeData = async (filters?: any) => {
  const response = await api.get(endpoints.trade, { params: filters })
  return response.data
}

export const fetchCountries = async () => {
  const response = await api.get(endpoints.geography)
  return response.data
}

export const fetchTimeperiods = async () => {
  const response = await api.get(endpoints.time)
  return response.data
}

// Generic data fetcher with error handling
export const fetchData = async (endpoint: string, filters?: any) => {
  try {
    const response = await api.get(endpoint, { params: filters })
    return response.data
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error)
    throw error
  }
}

export default api