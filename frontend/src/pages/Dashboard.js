import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import NestEggChart from '../components/NestEggChart';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip, Legend);

function Dashboard() {
  const [userData, setUserData] = useState({
    name: "",
    scenarioName: "My Scenario",
    currentYear: new Date().getFullYear(),
    currentAge: 30,
    retirementAge: 70,
    currentSalary: 60000,
    annualContribution: 10,
    salaryGrowthRate: 2,
    currentNestEgg: 0,
    rateOfReturnBeforeRetirement: 4.5,
    spendingAtRetirement: 44000,
    slowdownAge: 80,
    spendingAtSlowdown: 44000,
    rateOfReturnInRetirement: 4,
    inflationInRetirement: 1.5,
  });
  
  const [projectionData, setProjectionData] = useState(null);
  const [monteCarloResult, setMonteCarloResult] = useState(null);
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [error, setError] = useState(null);
  const [histogramData, setHistogramData] = useState(null);

  useEffect(() => {
    Promise.all([
      API.get('/user/me'),
      API.get('/scenarios')
    ]).then(([userRes, scenariosRes]) => {
      setUserData(prev => ({ ...prev, name: userRes.data.name }));
      setSavedScenarios(scenariosRes.data);
      setError(null); // Reset error state on successful data load
    }).catch(err => {
      console.error('Failed to load data:', err);
      setError("Failed to load data");
    });
  }, []);

  // Update the calculateProjections function
  const calculateProjections = async () => {
    try {
      // Get regular projections
      const projectionResponse = await API.post('/calculate', userData);
      setProjectionData(projectionResponse.data);

      // Get Monte Carlo simulation
      const monteCarloResponse = await API.post('/montecarlo', userData);
      if (!monteCarloResponse.data || !monteCarloResponse.data.results) {
        throw new Error('Invalid Monte Carlo response data');
      }
      setMonteCarloResult(monteCarloResponse.data);
      
      setError(null);
    } catch (err) {
      console.error('Failed to calculate projections:', err);
      setError("Failed to calculate projections");
    }
  };

  const deleteScenario = async (scenarioId) => {
    try {
      await API.delete(`/scenarios/${scenarioId}`);
      const response = await API.get('/scenarios');
      setSavedScenarios(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to delete scenario", err);
      setError("Failed to delete scenario");
    }
  };

  const saveScenario = async () => {
    try {
      const scenarioData = {
        ...userData,
        projection_data: JSON.stringify(projectionData)
      };
      
      await API.post('/scenarios', scenarioData);
      const response = await API.get('/scenarios');
      setSavedScenarios(response.data);
      setError(null); // Reset error state on successful save
    } catch (err) {
      console.error('Failed to save scenario:', err);
      setError("Failed to save scenario");
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: name === "scenarioName" ? value : (type === "number" ? parseFloat(value) || 0 : value)
    }));
  };

  // Update the generateHistogram function
  const generateHistogram = (data) => {
    // Filter out zero values and handle empty array
    const nonZeroData = data.filter(value => value > 0);
    
    // Return early if no valid data
    if (nonZeroData.length === 0) {
        return {
            labels: [],
            counts: [],
            binRanges: [],
            stats: {
                min: 0,
                max: 0,
                mean: 0,
                count: 0
            }
        };
    }
    
    // Calculate statistics
    const min = Math.min(...nonZeroData);
    const max = Math.max(...nonZeroData);
    const range = max - min;
    const mean = nonZeroData.reduce((a, b) => a + b, 0) / nonZeroData.length; // Add initial value 0
    
    // Use fewer bins for clearer visualization
    const bins = 20;
    const binSize = range / bins || 1; // Prevent division by zero
    
    // Initialize bins
    const counts = new Array(bins).fill(0);
    const binRanges = new Array(bins).fill(0);
    
    // Populate bins
    nonZeroData.forEach(value => {
        const binIndex = Math.min(Math.floor((value - min) / binSize), bins - 1);
        counts[binIndex]++;
    });

    // Create labels with formatted currency values
    const labels = counts.map((_, i) => {
        const start = min + (i * binSize);
        const end = min + ((i + 1) * binSize);
        binRanges[i] = {
            start,
            end,
            count: counts[i]
        };
        return `$${start.toLocaleString(undefined, { maximumFractionDigits: 0 })} - $${end.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    });

    return {
        labels,
        counts,
        binRanges,
        stats: {
            min,
            max,
            mean,
            count: nonZeroData.length
        }
    };
};

  const histogramChartData = {
    labels: histogramData?.labels || [],
    datasets: [
      {
        label: 'Frequency',
        data: histogramData?.counts || [],
        backgroundColor: 'rgba(75,192,192,0.6)',
      },
    ],
  };

  // Update the histogramOptions configuration
  const histogramOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Distribution of Final Nest Egg Values',
        font: { size: 16 }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            if (!histogramData || !histogramData.binRanges) {
              return '';
            }
            const binRange = histogramData.binRanges[context.dataIndex];
            if (!binRange) {
              return '';
            }
            return [
              `Count: ${binRange.count}`,
              `Range: $${binRange.start.toLocaleString()} - $${binRange.end.toLocaleString()}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Final Balance Range'
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Simulations'
        },
        ticks: {
          precision: 0
        }
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calculator Form */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Retirement Calculator</h2>
        
        {/* Separate input for scenarioName as text */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Scenario Name</label>
          <input
            type="text"
            name="scenarioName"
            value={userData.scenarioName}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(userData)
            .filter(([key]) => key !== 'name' && key !== "scenarioName")
            .map(([key, value]) => (
            <div key={key} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </label>
              <input
                type="number"
                name={key}
                value={value}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                step={key.includes('Rate') || key.includes('contribution') ? '0.1' : '1'}
              />
            </div>
          ))}
        </div>

        {/* Remove the Monte Carlo button and its section from the buttons div */}
        <div className="mt-6 space-y-4">
          <button
            onClick={calculateProjections}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200"
          >
            Calculate Projections
          </button>
          {projectionData && (
            <button
              onClick={saveScenario}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition duration-200"
            >
              Save Scenario
            </button>
          )}

        </div>
      </div>

      {/* Results and Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Retirement Projections</h2>
        {projectionData && projectionData.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600">Final Balance</p>
                <p className="text-2xl font-bold text-blue-900">
                  ${projectionData.slice(-1)[0]?.ending_balance?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600">Max Savings</p>
                <p className="text-2xl font-bold text-green-900">
                  ${Math.max(...projectionData.map(d => d.ending_balance)).toLocaleString() || '0'}
                </p>
              </div>
            </div>
            <NestEggChart dataPoints={projectionData.map(d => ({ year: d.year, balance: d.ending_balance }))} />
            <div className="overflow-y-auto max-h-96 mt-6">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border">Year</th>
                    <th className="px-4 py-2 border">Age</th>
                    <th className="px-4 py-2 border">Starting Bal</th>
                    <th className="px-4 py-2 border">Interest</th>
                    <th className="px-4 py-2 border">Salary</th>
                    <th className="px-4 py-2 border">Contrib</th>
                    <th className="px-4 py-2 border">ActiveRet$</th>
                    <th className="px-4 py-2 border">SlowRet$</th>
                    <th className="px-4 py-2 border">Ending Bal</th>
                  </tr>
                </thead>
                <tbody>
                  {projectionData.map((d, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 border">{d.year}</td>
                      <td className="px-4 py-2 border">{d.age}</td>
                      <td className="px-4 py-2 border">${d.starting_balance.toLocaleString()}</td>
                      <td className="px-4 py-2 border">${d.interest.toLocaleString()}</td>
                      <td className="px-4 py-2 border">${d.salary.toLocaleString()}</td>
                      <td className="px-4 py-2 border">${d.contribution.toLocaleString()}</td>
                      <td class="px-4 py-2 border">${d.active_retirement.toLocaleString()}</td>
                      <td className="px-4 py-2 border">${d.slow_retirement.toLocaleString()}</td>
                      <td className="px-4 py-2 border">${d.ending_balance.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p>No projection data available</p>
        )}

        {/* Update the Monte Carlo results display section */}
        {monteCarloResult && monteCarloResult.results && (
          <div className="mt-4 p-4 bg-purple-50 rounded">
            <h3 className="text-xl font-bold mb-4">Monte Carlo Simulation Results</h3>
            
            <div className="bg-white p-4 rounded-lg shadow mb-4">
              <Line
                data={{
                  labels: monteCarloResult.results.map(r => r.year),
                  datasets: [
                    {
                      label: 'Worst Case',
                      data: monteCarloResult.results.map(r => r.worst_case),
                      borderColor: 'rgba(255, 99, 132, 1)',
                      fill: false,
                    },
                    {
                      label: '25th Percentile',
                      data: monteCarloResult.results.map(r => r.p25),
                      borderColor: 'rgba(255, 159, 64, 1)',
                      fill: false,
                    },
                    {
                      label: 'Median',
                      data: monteCarloResult.results.map(r => r.median),
                      borderColor: 'rgba(75, 192, 192, 1)',
                      fill: false,
                      borderWidth: 2,
                    },
                    {
                      label: '75th Percentile',
                      data: monteCarloResult.results.map(r => r.p75),
                      borderColor: 'rgba(54, 162, 235, 1)',
                      fill: false,
                    },
                    {
                      label: 'Best Case',
                      data: monteCarloResult.results.map(r => r.best_case),
                      borderColor: 'rgba(153, 102, 255, 1)',
                      fill: false,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      title: {
                        display: true,
                        text: 'Balance ($)'
                      },
                      ticks: {
                        callback: (value) => `$${value.toLocaleString()}`
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: 'Year'
                      }
                    }
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-white rounded-lg shadow">
                <p className="font-bold text-red-600">Worst Case</p>
                <p className="text-xl">
                  ${monteCarloResult.results[monteCarloResult.results.length-1].worst_case.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow">
                <p className="font-bold text-blue-600">Median</p>
                <p className="text-xl">
                  ${monteCarloResult.results[monteCarloResult.results.length-1].median.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow">
                <p className="font-bold text-green-600">Best Case</p>
                <p className="text-xl">
                  ${monteCarloResult.results[monteCarloResult.results.length-1].best_case.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-semibold mb-2">Simulation Details:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>{monteCarloResult.iterations} iterations run</li>
                <li>Random inflation rates between 4-7%</li>
                <li>Shows range of possible outcomes based on inflation variability</li>
              </ul>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Saved Scenarios */}
      {savedScenarios && savedScenarios.length > 0 && (
        <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Saved Scenarios Comparison</h2>
          {savedScenarios.map((s, scenarioIndex) => {
            const parsedData = JSON.parse(s.projection_data);
            const maxSavings = Math.max(...parsedData.map(d => d.ending_balance));
            const finalBalance = parsedData.slice(-1)[0]?.ending_balance || 0;
            return (
              <div key={s.ID || scenarioIndex} className="mb-6 border-b pb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold">{s.scenarioName}</h3>
                  <button
                    onClick={() => deleteScenario(s.ID)}
                    className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition duration-200"
                  >
                    Delete
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600">Final Balance</p>
                    <p className="text-2xl font-bold text-blue-900">
                      ${finalBalance.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600">Max Savings</p>
                    <p className="text-2xl font-bold text-green-900">
                      ${maxSavings.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="overflow-y-auto max-h-96 mb-4">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 border">Year</th>
                        <th className="px-4 py-2 border">Age</th>
                        <th className="px-4 py-2 border">Starting Bal</th>
                        <th className="px-4 py-2 border">Interest</th>
                        <th className="px-4 py-2 border">Salary</th>
                        <th className="px-4 py-2 border">Contrib</th>
                        <th className="px-4 py-2 border">ActiveRet$</th>
                        <th className="px-4 py-2 border">SlowRet$</th>
                        <th className="px-4 py-2 border">Ending Bal</th>
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
                        ))}
                    </tbody>
                  </table>
                </div>
                <NestEggChart
                  dataPoints={
                    Array.isArray(parsedData)
                      ? parsedData.map(d => ({ year: d.year, balance: d.ending_balance }))
                      : []
                  }
                  multipleScenarios={false}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Dashboard;