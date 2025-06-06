import React from 'react';
import Chart from './Chart';

interface ChartGridProps {
  data: any;  // Simulation data
  layout: 'timeInterval' | 'countries' | 'categories';  // Layout type
  timeIntervals?: string[];
  countries?: string[];
  chartType: 'line' | 'bar' | 'pie';  // Chart type
  additionalOptions?: {
    showLabels?: boolean;
    showTooltips?: boolean;
  };
}

const ChartGrid: React.FC<ChartGridProps> = ({
  data,
  layout,
  timeIntervals,
  countries,
  chartType,
  additionalOptions
}) => {
  
  const renderGrid = () => {
    switch (layout) {
      case 'timeInterval':
        return renderTimeIntervalGrid();
      case 'countries':
        return renderCountriesGrid();
      case 'categories':
        return renderCategoriesGrid();
      default:
        return <div>No layout selected</div>;
    }
  };

  const renderTimeIntervalGrid = () => {
    if (!timeIntervals) return null;
    return (
      <div className="grid">
        {timeIntervals.map((interval) => (
          <div key={interval} className="grid-item">
            <Chart data={data[interval]} type={chartType} options={additionalOptions} />
          </div>
        ))}
      </div>
    );
  };

  const renderCountriesGrid = () => {
    if (!countries) return null;
    return (
      <div className="grid">
        {countries.map((country) => (
          <div key={country} className="grid-item">
            <Chart data={data[country]} type={chartType} options={additionalOptions} />
          </div>
        ))}
      </div>
    );
  };

  const renderCategoriesGrid = () => {
    return (
      <div className="grid">
        {Object.keys(data).map((category) => (
          <div key={category} className="grid-item">
            <Chart data={data[category]} type={chartType} options={additionalOptions} />
          </div>
        ))}
      </div>
    );
  };

  return <div className="chart-grid-container">{renderGrid()}</div>;
};

export default ChartGrid;
