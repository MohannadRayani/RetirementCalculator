import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function NestEggChart({ dataPoints, multipleScenarios = false }) {
  if (!dataPoints || dataPoints.length === 0) {
    return <p className="text-gray-600">No data available for the chart.</p>;
  }

  const colors = [
    'rgba(75,192,192,1)',
    'rgba(255,99,132,1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
  ];

  let chartData = {};

  if (multipleScenarios) {
    // Collect a unique sorted array of years from all scenarios.
    const allYearsSet = new Set();
    dataPoints.forEach(scenario => {
      scenario.forEach(pt => allYearsSet.add(pt.year));
    });
    const allYears = Array.from(allYearsSet).sort((a, b) => a - b);

    // For each scenario, align data with the union of years.
    const datasets = dataPoints.map((scenario, index) => {
      // Create a mapping for fast lookup.
      const balanceMap = {};
      scenario.forEach(pt => {
        balanceMap[pt.year] = pt.balance;
      });
      // For each year in the union, set the corresponding balance or null.
      const data = allYears.map(year => balanceMap[year] ?? null);
      return {
        label: `Scenario ${index + 1}`,
        data,
        fill: false,
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length].replace('1)', '0.2)'),
        tension: 0.1,
      };
    });

    chartData = {
      labels: allYears,
      datasets,
    };
  } else {
    chartData = {
      labels: dataPoints.map(pt => pt.year),
      datasets: [{
        label: 'Nest Egg Value',
        data: dataPoints.map(pt => pt.balance),
        fill: false,
        borderColor: colors[0],
        backgroundColor: colors[0].replace('1)', '0.2)'),
        tension: 0.1,
      }]
    };
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Year'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Balance ($)'
        },
        beginAtZero: true,
        ticks: {
          callback: value => `$${value.toLocaleString()}`
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: context => `$${context.parsed.y.toLocaleString()}`
        }
      }
    }
  };

  return (
    <div className="h-64 md:h-96">
      <Line data={chartData} options={options} />
    </div>
  );
}

export default NestEggChart;