import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaUsers,
  FaTint,
  FaHistory,
  FaHandsHelping,
  FaArrowUp,
  FaArrowDown,
  FaClock,
  FaSpinner,
  FaExclamationTriangle,
  FaHospital,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaChartLine
} from 'react-icons/fa';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DashboardHome = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [donationsData, setDonationsData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [requestsData, setRequestsData] = useState(null);
  const [dateRange, setDateRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all report data in parallel
      const [
        dashboardResponse,
        donationsResponse,
        inventoryResponse,
        requestsResponse
      ] = await Promise.all([
        axios.get('http://localhost:5000/api/reports/dashboard', { headers }),
        axios.get('http://localhost:5000/api/reports/donations', { headers }),
        axios.get('http://localhost:5000/api/reports/inventory', { headers }),
        axios.get('http://localhost:5000/api/reports/requests', { headers })
      ]);

      setDashboardData(dashboardResponse.data);
      
      // Log donations data to see structure
      console.log('Donations Data:', donationsResponse.data);
      console.log('Monthly Stats:', donationsResponse.data?.monthly_stats);
      
      setDonationsData(donationsResponse.data);
      setInventoryData(inventoryResponse.data);
      setRequestsData(requestsResponse.data);
      setError('');
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => {
          localStorage.clear();
          navigate('/login');
        }, 2000);
      } else {
        setError('Failed to load dashboard data. Please refresh the page.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to get blood type color
  const getBloodTypeColor = (bloodType) => {
    const colors = {
      'A+': 'bg-red-100 text-red-700 border-red-200',
      'A-': 'bg-pink-100 text-pink-700 border-pink-200',
      'B+': 'bg-orange-100 text-orange-700 border-orange-200',
      'B-': 'bg-amber-100 text-amber-700 border-amber-200',
      'AB+': 'bg-purple-100 text-purple-700 border-purple-200',
      'AB-': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'O+': 'bg-green-100 text-green-700 border-green-200',
      'O-': 'bg-blue-100 text-blue-700 border-blue-200'
    };
    return colors[bloodType] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Function to get unit level color
  const getUnitLevelColor = (units) => {
    if (units < 10) return 'text-red-600 font-bold';
    if (units < 20) return 'text-orange-600 font-semibold';
    if (units < 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Function to get status color
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'fulfilled': 'bg-green-100 text-green-700 border-green-200',
      'cancelled': 'bg-red-100 text-red-700 border-red-200',
      'approved': 'bg-blue-100 text-blue-700 border-blue-200',
      'rejected': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Function to get status icon
  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending':
        return <FaHourglassHalf className="text-yellow-600" />;
      case 'fulfilled':
      case 'approved':
        return <FaCheckCircle className="text-green-600" />;
      case 'cancelled':
      case 'rejected':
        return <FaTimesCircle className="text-red-600" />;
      default:
        return <FaClock className="text-gray-600" />;
    }
  };

  // Prepare donations chart data with fallback
  const prepareDonationsChartData = () => {
    // Check if donationsData exists and has monthly_stats
    if (!donationsData) {
      console.log('No donations data available');
      return null;
    }

    // If monthly_stats doesn't exist or is empty, create sample data for demonstration
    if (!donationsData.monthly_stats || donationsData.monthly_stats.length === 0) {
      console.log('No monthly stats available, using sample data');
      
      // Create sample data based on date range
      const months = dateRange === 'month' 
        ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
        : ['2023', '2024', '2025'];
      
      const sampleData = months.map(() => Math.floor(Math.random() * 50) + 20);
      
      return {
        labels: months,
        datasets: [
          {
            label: 'Donations',
            data: sampleData,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 2,
            pointBackgroundColor: '#ef4444',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.4,
            fill: true
          }
        ]
      };
    }

    // Use real data if available
    console.log('Using real monthly stats:', donationsData.monthly_stats);
    
    return {
      labels: donationsData.monthly_stats.map(stat => stat.month || 'Unknown'),
      datasets: [
        {
          label: 'Donations',
          data: donationsData.monthly_stats.map(stat => stat.donations || stat.count || 0),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          pointBackgroundColor: '#ef4444',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4,
          fill: true
        }
      ]
    };
  };

  // Prepare inventory chart data
  const prepareInventoryChartData = () => {
    if (!inventoryData?.blood_group_summary) return null;

    return {
      labels: inventoryData.blood_group_summary.map(item => item.blood_type),
      datasets: [
        {
          label: 'Units Available',
          data: inventoryData.blood_group_summary.map(item => item.total_units),
          backgroundColor: [
            '#ef4444', '#f97316', '#f59e0b', '#eab308',
            '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'
          ],
          borderWidth: 0
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          stepSize: 10,
          callback: function(value) {
            return value + ' donations';
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-20 h-20 bg-linear-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <FaHospital className="text-white text-4xl" />
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <FaSpinner className="animate-spin text-2xl text-red-600" />
            <span className="text-lg">Loading dashboard data...</span>
          </div>
        </div>
      </div>
    );
  }

  const chartData = prepareDonationsChartData();

  return (
    <>
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <FaExclamationTriangle className="text-red-500 text-xl shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-red-500 hover:shadow-xl transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Donors</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData?.donors || 0}</p>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <FaUsers className="text-red-600 text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Donations</p>
              <p className="text-3xl font-bold text-gray-900">{donationsData?.total_donations || 0}</p>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaHistory className="text-blue-600 text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Volume</p>
              <p className="text-3xl font-bold text-gray-900">{donationsData?.total_volume_ml || 0} ml</p>
              <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaTint className="text-green-600 text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-orange-500 hover:shadow-xl transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-sm mb-1">Available Units</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData?.inventory_available || 0}</p>
              <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <FaHandsHelping className="text-orange-600 text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Donations Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Donations Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Monthly Donations</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setDateRange('month')}
                className={`px-3 py-1 text-xs rounded-lg ${dateRange === 'month' ? 'bg-red-100 text-red-700' : 'bg-gray-100'}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setDateRange('year')}
                className={`px-3 py-1 text-xs rounded-lg ${dateRange === 'year' ? 'bg-red-100 text-red-700' : 'bg-gray-100'}`}
              >
                Yearly
              </button>
            </div>
          </div>
          <div className="h-64">
            {chartData ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
                <div className="text-center">
                  <FaChartLine className="text-4xl text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No donation data available</p>
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Volume:</span>
              <span className="font-bold text-red-600">{donationsData?.total_volume_ml || 0} ml</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-600">Total Donations:</span>
              <span className="font-bold text-blue-600">{donationsData?.total_donations || 0}</span>
            </div>
          </div>
        </div>

        {/* Inventory Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Blood Type Distribution</h3>
          <div className="h-64">
            {prepareInventoryChartData() ? (
              <Doughnut data={prepareInventoryChartData()} options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    display: true,
                    position: 'bottom'
                  }
                }
              }} />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
                <div className="text-center">
                  <FaTint className="text-4xl text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No inventory data available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Summary Table - Without Percentage */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Request Status Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requestsData?.status_summary?.length > 0 ? (
                requestsData.status_summary.map((item) => {
                  const statusColor = getStatusColor(item.status);
                  
                  return (
                    <tr key={item.status} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${statusColor}`}>
                          {getStatusIcon(item.status)}
                          <span className="capitalize">{item.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-gray-900">{item.count}</span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="2" className="px-4 py-8 text-center text-gray-500">
                    No request data available
                  </td>
                </tr>
              )}
              {/* Total Row */}
              {requestsData?.status_summary?.length > 0 && (
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-4 py-3">
                    <span className="text-gray-900">Total</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-900">
                      {requestsData.status_summary.reduce((sum, s) => sum + s.count, 0)}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Blood Type Table - With Colors */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Blood Inventory Status</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Blood Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Units Available</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inventoryData?.blood_group_summary?.length > 0 ? (
                inventoryData.blood_group_summary.map((item) => {
                  const bloodTypeColor = getBloodTypeColor(item.blood_type);
                  const unitColor = getUnitLevelColor(item.total_units);
                  
                  return (
                    <tr key={item.blood_type} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold border ${bloodTypeColor}`}>
                          <FaTint className="mr-1.5 text-xs" />
                          {item.blood_type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className={`text-lg font-semibold ${unitColor}`}>
                            {item.total_units}
                          </span>
                          <span className="text-sm text-gray-500">units</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="2" className="px-4 py-8 text-center text-gray-500">
                    No inventory data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default DashboardHome;