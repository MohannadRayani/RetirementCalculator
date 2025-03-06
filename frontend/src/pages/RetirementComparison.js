import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import NestEggChart from '../components/NestEggChart';

function RetirementComparison() {
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    API.get('/scenarios')
      .then((res) => {
        setSavedScenarios(res.data);
        // Optionally select all scenarios by default:
        setSelectedIds(res.data.map(s => s.ID));
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to fetch scenarios:', err);
        setError('Failed to fetch scenarios');
      });
  }, []);

  const handleCheckboxChange = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Filter selected scenarios
  const selectedScenarios = savedScenarios.filter(s => selectedIds.includes(s.ID));

  // Prepare chart data for multiple scenarios
  const chartData = selectedScenarios.map(s => {
    const parsed = JSON.parse(s.projection_data);
    return Array.isArray(parsed)
      ? parsed.map(d => ({ year: d.year, balance: d.ending_balance }))
      : [];
  });

  // Calculate final balance and max savings per scenario
  const finalBalanceData = selectedScenarios.map(s => {
    const parsed = JSON.parse(s.projection_data);
    const finalBal = Array.isArray(parsed) && parsed.length > 0
      ? parsed[parsed.length - 1].ending_balance
      : 0;
    return { name: s.scenarioName, finalBalance: finalBal };
  });

  const maxSavingsData = selectedScenarios.map(s => {
    const parsed = JSON.parse(s.projection_data);
    const maxSave = Array.isArray(parsed) && parsed.length > 0
      ? Math.max(...parsed.map(d => d.ending_balance))
      : 0;
    return { name: s.scenarioName, maxSavings: maxSave };
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Retirement Comparison</h1>
      
      {/* Scenario Selector */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-2">Select Scenarios</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {savedScenarios.map(s => (
            <label key={s.ID} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedIds.includes(s.ID)}
                onChange={() => handleCheckboxChange(s.ID)}
              />
              <span>{s.scenarioName}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Comparison Chart */}
      {chartData.length > 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-bold mb-4">Comparison Chart</h2>
          <NestEggChart dataPoints={chartData} multipleScenarios={true} />
        </div>
      ) : (
        <p className="text-gray-600 mb-6">Please select at least one scenario for comparison.</p>
      )}

      {/* Summary Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Final Balance Table */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Final Balance Comparison</h2>
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Scenario</th>
                <th className="px-4 py-2 border">Final Balance</th>
              </tr>
            </thead>
            <tbody>
              {finalBalanceData.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 border">{item.name}</td>
                  <td className="px-4 py-2 border">${item.finalBalance.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Max Savings Table */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Max Savings Comparison</h2>
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Scenario</th>
                <th className="px-4 py-2 border">Max Savings</th>
              </tr>
            </thead>
            <tbody>
              {maxSavingsData.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 border">{item.name}</td>
                  <td className="px-4 py-2 border">${item.maxSavings.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Scenario Tables */}
      {selectedScenarios.map((s, scenarioIndex) => {
        const parsedData = JSON.parse(s.projection_data);
        return (
          <div key={s.ID || scenarioIndex} className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-bold mb-4">{s.scenarioName} - Detailed Projections</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border">Year</th>
                    <th className="px-4 py-2 border">Age</th>
                    <th className="px-4 py-2 border">Starting Balance</th>
                    <th className="px-4 py-2 border">Interest</th>
                    <th className="px-4 py-2 border">Salary</th>
                    <th className="px-4 py-2 border">Contribution</th>
                    <th className="px-4 py-2 border">Active Retire$</th>
                    <th className="px-4 py-2 border">Slow Retire$</th>
                    <th className="px-4 py-2 border">Ending Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(parsedData) &&
                    parsedData.map((d, index) => (
                      <tr key={`${scenarioIndex}-${index}`}>
                        <td className="px-4 py-2 border">{d.year}</td>
                        <td className="px-4 py-2 border">{d.age}</td>
                        <td className="px-4 py-2 border">${d.starting_balance.toLocaleString()}</td>
                        <td className="px-4 py-2 border">${d.interest.toLocaleString()}</td>
                        <td className="px-4 py-2 border">${d.salary.toLocaleString()}</td>
                        <td className="px-4 py-2 border">${d.contribution.toLocaleString()}</td>
                        <td className="px-4 py-2 border">${d.active_retirement.toLocaleString()}</td>
                        <td className="px-4 py-2 border">${d.slow_retirement.toLocaleString()}</td>
                        <td className="px-4 py-2 border">${d.ending_balance.toLocaleString()}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}

export default RetirementComparison;