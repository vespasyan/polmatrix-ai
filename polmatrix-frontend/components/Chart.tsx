"use client"

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";

interface ChartProps {
  data: any;
  type: 'line' | 'bar' | 'pie';
  options?: {
    showLabels?: boolean;
    showTooltips?: boolean;
  };
}

// Generate colors for chart elements
const COLORS = ['#4299e1', '#48bb78', '#f6ad55', '#ed64a6', '#9f7aea', '#f56565', '#4fd1c5', '#ed8936'];

const Chart: React.FC<ChartProps> = ({ data, type, options = {} }) => {
  const { showLabels = true, showTooltips = true } = options;
  
  // Ensure data is in the correct format
  const chartData = Array.isArray(data) ? data : [data];
  
  // Find data keys excluding 'label' or 'name' which are typically used for x-axis
  const dataKeys = chartData.length > 0 
    ? Object.keys(chartData[0]).filter(key => key !== 'label' && key !== 'name') 
    : [];
  
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={chartData}>
            <CartesianGrid 
              stroke="var(--color-border)" 
              strokeDasharray="5 5" 
              strokeOpacity={0.8} 
              strokeWidth={2} 
              vertical 
              horizontal 
            />
            <XAxis dataKey="label" />
            <YAxis />
            {showTooltips && <Tooltip />}
            {showLabels && <Legend />}
            {dataKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                isAnimationActive={true}
                animationDuration={800}
              />
            ))}
          </LineChart>
        );
        
      case 'bar':
        return (
          <BarChart data={chartData}>
            <CartesianGrid 
              stroke="var(--color-border)" 
              strokeDasharray="5 5" 
              strokeOpacity={0.8} 
              strokeWidth={2} 
              vertical 
              horizontal 
            />
            <XAxis dataKey="label" />
            <YAxis />
            {showTooltips && <Tooltip />}
            {showLabels && <Legend />}
            {dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={COLORS[index % COLORS.length]}
                barSize={30}
                isAnimationActive={true}
              />
            ))}
          </BarChart>
        );
        
      case 'pie':
        // For pie charts, data structure is usually different
        return (
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={showLabels}
              outerRadius={80}
              fill="#8884d8"
              dataKey={dataKeys[0] || "value"}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            {showTooltips && <Tooltip />}
            {showLabels && <Legend />}
          </PieChart>
        );
        
      default:
        return <div>Chart type not supported</div>;
    }
  };
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      {renderChart()}
    </ResponsiveContainer>
  );
};

export default Chart;