"use client"

import { filtersConfig } from "@/lib/filtersConfig"
import { economyMetrics as economyMetricsConfig } from "@/lib/economyMetrics"; // Renamed import

import { useState, useEffect } from "react"
import {
  BarChart3,
  GraduationCap,
  Leaf,
  HeartPulse,
  ChevronDown,
  Globe,
  Clock
} from "lucide-react"

type Domain = 'economy' | 'education' | 'environment' | 'health';

type SidebarItem = {
  title: string;
  icon: React.ReactNode;
  domain: Domain;
}

type GlobalFilterProps = {
  geographies: { geography_id: number; name: string }[]
  times: { time_id: number; year: number; quarter: string | null; month: string | null }[]
  onFilterChange: (filters: { geography_id: string; time_id: string }) => void
  economyMetrics: string[] // Note: This prop is used for selected economy metrics
  educationMetrics: string[]
  environmentMetrics: string[]
  healthMetrics: string[]
  setEconomyMetrics: (metrics: string[]) => void // Note: This prop is used to update economy metrics
  setEducationMetrics: (metrics: string[]) => void
  setEnvironmentMetrics: (metrics: string[]) => void
  setHealthMetrics: (metrics: string[]) => void
}

export default function Sidebar({
  geographies,
  times,
  onFilterChange,
  economyMetrics, // Note: This prop is used for selected economy metrics
  educationMetrics,
  environmentMetrics,
  healthMetrics,
  setEconomyMetrics, // Note: This prop is used to update economy metrics
  setEducationMetrics,
  setEnvironmentMetrics,
  setHealthMetrics
}: GlobalFilterProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [openEconomyCategoryIndex, setOpenEconomyCategoryIndex] = useState<number | null>(null); // Added state for nested accordion
  const [geographyId, setGeographyId] = useState("1");
  const [timeId, setTimeId] = useState("4");

  const sidebarItems: SidebarItem[] = [
    {
      title: "Economy",
      icon: <BarChart3 className="w-5 h-5 text-[var(--accent-color)] stroke-[2.5]" />,
      domain: "economy"
    },
    {
      title: "Education", 
      icon: <GraduationCap className="w-5 h-5 text-[var(--accent-color)] stroke-[2.5]" />,
      domain: "education"
    },
    {
      title: "Environment",
      icon: <Leaf className="w-5 h-5 text-[var(--accent-color)] stroke-[2.5]" />,
      domain: "environment"
    },
    {
      title: "Health",
      icon: <HeartPulse className="w-5 h-5 text-[var(--accent-color)] stroke-[2.5]" />,
      domain: "health"
    }
  ]

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
    // Reset nested accordion when closing the main one or switching
    if (openIndex !== index) {
        setOpenEconomyCategoryIndex(null);
    }
  };

  // Added handler for nested accordion
  const toggleEconomyCategoryAccordion = (index: number) => {
    setOpenEconomyCategoryIndex(openEconomyCategoryIndex === index ? null : index);
  };

  useEffect(() => {
    onFilterChange({ geography_id: geographyId, time_id: timeId });
  }, [geographyId, timeId, onFilterChange]);

  return (
    <aside className="w-full max-w-[280px] h-full p-4 bg-[var(--card-bg)] text-[var(--text-primary)] space-y-4 rounded-xl">
      {/* Domains Section */}
      <h2 className="text-lg font-semibold mb-4">Domains</h2>
      {sidebarItems.map((section, index) => (
        <div key={index} className="rounded-lg bg-[var(--bg-secondary)] shadow-md mb-2"> {/* Added mb-2 */}
          <button
            className="group w-full flex justify-between items-center px-4 py-2 text-sm font-medium transition"
            onClick={() => toggleAccordion(index)}
          >
            <span className="flex items-center gap-2">
              <span className="text-[var(--accent-color)] transition-transform duration-200 group-hover:scale-110">
                {section.icon}
              </span>
              {section.title}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${openIndex === index ? "rotate-180" : ""}`}
            />
          </button>

          {openIndex === index && (
            <div className="px-4 pb-3 space-y-2">
              {/* === Conditional Rendering Logic === */}
              {section.domain === 'economy' ? (
                // Use economyMetricsConfig for mapping structure
                economyMetricsConfig.map((group, groupIndex) => (
                  <div key={groupIndex} className="rounded-lg bg-[var(--bg-tertiary)] shadow-sm mb-1"> {/* Use a slightly different bg, reduced mb */}
                    <button
                      className="group w-full flex justify-between items-center px-3 py-1.5 text-sm font-medium transition" // Adjusted padding/size
                      onClick={() => toggleEconomyCategoryAccordion(groupIndex)}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-[var(--accent-color)] transition-transform duration-200 group-hover:scale-110">
                          •
                        </span>
                        {group.category} {/* Use category from config */}
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${openEconomyCategoryIndex === groupIndex ? "rotate-180" : ""}`} />
                    </button>
                    {openEconomyCategoryIndex === groupIndex && (
                      <div className="px-3 pt-1 pb-2 space-y-1.5"> {/* Adjusted padding */}
                        {group.metrics.map((metric) => ( // Use metrics from config
                          <label key={metric.key} className="flex items-center gap-2 text-xs cursor-pointer pl-3"> {/* Adjusted text size/padding */}
                            <input
                              type="checkbox"
                              value={metric.key}
                              // Use economyMetrics prop (selected keys) to determine checked state
                              checked={economyMetrics.includes(metric.key)}
                              onChange={() => {
                                // Use economyMetrics prop (selected keys) and setEconomyMetrics prop for update
                                const newMetrics = economyMetrics.includes(metric.key)
                                  ? economyMetrics.filter((m) => m !== metric.key)
                                  : [...economyMetrics, metric.key];
                                setEconomyMetrics(newMetrics);
                              }}
                              className="form-checkbox h-3.5 w-3.5" // Adjusted size
                            />
                            {metric.label} {/* Use label from config */}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                // Existing logic for other domains using filtersConfig
                filtersConfig[section.domain as keyof typeof filtersConfig].map((metric, i) => {
                  const formattedMetric = metric.key;
                  // Adjusted to safely access props based on domain
                  let currentMetrics: string[] = [];
                  let setCurrentMetrics: (metrics: string[]) => void = () => {};

                  switch (section.domain) {
                    case 'education':
                      currentMetrics = educationMetrics;
                      setCurrentMetrics = setEducationMetrics;
                      break;
                    case 'environment':
                      currentMetrics = environmentMetrics;
                      setCurrentMetrics = setEnvironmentMetrics;
                      break;
                    case 'health':
                      currentMetrics = healthMetrics;
                      setCurrentMetrics = setHealthMetrics;
                      break;
                    // default: // Should not happen based on sidebarItems
                    //   return null;
                  }

                  return (
                    <label key={i} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        value={formattedMetric}
                        checked={currentMetrics.includes(formattedMetric)}
                        onChange={() => {
                          const newMetrics = currentMetrics.includes(formattedMetric)
                            ? currentMetrics.filter((m) => m !== formattedMetric)
                            : [...currentMetrics, formattedMetric];
                          setCurrentMetrics(newMetrics);
                        }}
                        className="form-checkbox"
                      />
                      {metric.label}
                    </label>
                  );
                })
              )}
              {/* === End Conditional Rendering Logic === */}
            </div>
          )}
        </div>
      ))}

      {/* Filters Section */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="space-y-4">
          {/* Geography Filter */}
          <div className="rounded-lg bg-[var(--bg-secondary)] shadow-md p-4">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-[var(--accent-color)] stroke-[2.5]" />
              <label className="block text-sm font-medium">Geographic Scope</label>
            </div>
            <select
              className="w-full p-2 rounded-md bg-transparent outline-none"
              value={geographyId}
              onChange={(e) => setGeographyId(e.target.value)}
            >
              {geographies.map((geo) => (
                <option key={geo.geography_id} value={geo.geography_id}>
                  {geo.name}
                </option>
              ))}
            </select>
          </div>

          {/* Time Filter */}
          <div className="rounded-lg bg-[var(--bg-secondary)] shadow-md p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-[var(--accent-color)] stroke-[2.5]" />
              <label className="block text-sm font-medium">Time Range</label>
            </div>
            <select
              className="w-full p-2 rounded-md bg-transparent outline-none"
              value={timeId}
              onChange={(e) => setTimeId(e.target.value)}
            >
              {times.map((time) => (
                <option key={time.time_id} value={time.time_id}>
                  {time.year} {time.quarter || ""} {time.month || ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </aside>
  );
}
