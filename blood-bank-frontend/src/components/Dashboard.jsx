import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaTachometerAlt,
  FaUser,
  FaTint,
  FaHistory,
  FaSignOutAlt,
  FaHospital,
  FaUsers,
  FaHandsHelping,
  FaChartBar,
  FaFileAlt,
  FaUserPlus,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaSpinner,
  FaCheckCircle,
  FaClock,
  FaArrowUp,
  FaArrowDown,
  FaDownload,
  FaPrint,
  FaFilter,
  FaShieldAlt,
  FaHeartbeat,
  FaSyringe,
  FaBoxes,
  FaClipboardList
} from 'react-icons/fa';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [donationsData, setDonationsData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [requestsData, setRequestsData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('month');

  useEffect(() => {
    // Check authentication and role
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!storedUser || !token) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(storedUser);
    
    // Allow both admin and technician
    if (userData.role !== 'admin' && userData.role !== 'technician') {
      navigate('/');
      return;
    }

    setUser(userData);
    setUserRole(userData.role);
  }, [navigate]);

  useEffect(() => {
    if (userRole) {
      fetchDashboardData();
    }
  }, [userRole, dateRange]);

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Prepare chart data
  const prepareDonationsChartData = () => {
    if (!donationsData?.monthly_stats) return null;
    
    return {
      labels: donationsData.monthly_stats.map(stat => stat.month),
      datasets: [
        {
          label: 'Donations',
          data: donationsData.monthly_stats.map(stat => stat.donations),
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

  const prepareRequestsChartData = () => {
    if (!requestsData?.status_summary) return null;
    
    const pending = requestsData.status_summary.find(s => s.status === 'pending')?.count || 0;
    const fulfilled = requestsData.status_summary.find(s => s.status === 'fulfilled')?.count || 0;
    const cancelled = requestsData.status_summary.find(s => s.status === 'cancelled')?.count || 0;
    
    return {
      labels: ['Pending', 'Fulfilled', 'Cancelled'],
      datasets: [
        {
          data: [pending, fulfilled, cancelled],
          backgroundColor: ['#f59e0b', '#22c55e', '#6b7280'],
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="bg-linear-to-r from-red-600 to-pink-600 w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                <FaHeartbeat className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  MEGA <span className="text-red-600">Blood Bank</span>
                </h1>
                <div className="flex items-center gap-2">
                  <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    userRole === 'admin' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {userRole === 'admin' ? 'Administrator' : 'Technician'}
                  </div>
                  <span className="text-sm text-gray-600">| Dashboard</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              {/* User Info */}
              <div className="text-right hidden md:block">
                <p className="font-semibold text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-xl transition-colors"
              >
                <FaSignOutAlt />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <FaExclamationTriangle className="text-red-500 text-xl shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-linear-to-r from-red-600 to-pink-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-red-50'
            }`}
          >
            <FaTachometerAlt />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('donations')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeTab === 'donations'
                ? 'bg-linear-to-r from-red-600 to-pink-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-red-50'
            }`}
          >
            <FaHistory />
            Donations
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'bg-linear-to-r from-red-600 to-pink-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-red-50'
            }`}
          >
            <FaBoxes />
            Inventory
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeTab === 'requests'
                ? 'bg-linear-to-r from-red-600 to-pink-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-red-50'
            }`}
          >
            <FaClipboardList />
            Blood Requests
          </button>
        </div>

        {/* Quick Actions Bar */}
        <div className="bg-white rounded-xl p-4 mb-8 shadow-sm flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <FaShieldAlt className="text-red-500" />
            <span className="font-medium text-gray-900">Quick Actions:</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => navigate('/donors/register')}
              className="flex items-center gap-2 bg-linear-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg"
            >
              <FaUserPlus />
              Register Donor
            </button>
            <button className="flex items-center gap-2 bg-linear-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg">
              <FaSyringe />
              Record Donation
            </button>
            <button className="flex items-center gap-2 bg-linear-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg">
              <FaFileAlt />
              Generate Report
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && dashboardData && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-red-500 hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Total Donors</p>
                    <p className="text-3xl font-bold text-gray-900">{dashboardData.donors || 0}</p>
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <FaArrowUp /> +12% this month
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
                    <p className="text-3xl font-bold text-gray-900">{dashboardData.donations || 0}</p>
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <FaArrowUp /> +8% this month
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
                    <p className="text-gray-600 text-sm mb-1">Available Units</p>
                    <p className="text-3xl font-bold text-gray-900">{dashboardData.inventory_available || 0}</p>
                    <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                      <FaArrowDown /> -3% this week
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
                    <p className="text-gray-600 text-sm mb-1">Pending Requests</p>
                    <p className="text-3xl font-bold text-gray-900">{dashboardData.pending_requests || 0}</p>
                    <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                      <FaClock /> Awaiting fulfillment
                    </p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-full">
                    <FaHandsHelping className="text-orange-600 text-2xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
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
                  {prepareDonationsChartData() && (
                    <Line data={prepareDonationsChartData()} options={chartOptions} />
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Volume:</span>
                    <span className="font-bold text-red-600">{donationsData?.total_volume_ml || 0} ml</span>
                  </div>
                </div>
              </div>

              {/* Inventory Distribution */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Blood Type Distribution</h3>
                <div className="h-64">
                  {prepareInventoryChartData() && (
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
                  )}
                </div>
              </div>
            </div>

            {/* Blood Type Table */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Blood Inventory Status</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Blood Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Units Available</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {inventoryData?.blood_group_summary?.map((item) => {
                      const isCritical = item.total_units < 10;
                      return (
                        <tr key={item.blood_type} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <span className="font-bold text-gray-900">{item.blood_type}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`font-semibold ${isCritical ? 'text-red-600' : 'text-green-600'}`}>
                              {item.total_units} units
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isCritical 
                                ? 'bg-red-100 text-red-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {isCritical ? 'Critical' : 'Normal'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Donations Tab */}
        {activeTab === 'donations' && donationsData && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Donations Report</h2>
            {/* Add detailed donations report here */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-linear-to-br from-red-50 to-pink-50 p-6 rounded-xl">
                <p className="text-sm text-gray-600 mb-2">Total Donations</p>
                <p className="text-4xl font-bold text-red-600">{donationsData.total_donations}</p>
              </div>
              <div className="bg-linear-to-br from-blue-50 to-cyan-50 p-6 rounded-xl">
                <p className="text-sm text-gray-600 mb-2">Total Volume</p>
                <p className="text-4xl font-bold text-blue-600">{donationsData.total_volume_ml} ml</p>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && inventoryData && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Inventory Report</h2>
            {/* Add detailed inventory report here */}
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && requestsData && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Blood Requests Report</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-orange-50 p-6 rounded-xl">
                <p className="text-sm text-gray-600 mb-2">Pending Requests</p>
                <p className="text-3xl font-bold text-orange-600">
                  {requestsData.status_summary?.find(s => s.status === 'pending')?.count || 0}
                </p>
              </div>
              <div className="bg-green-50 p-6 rounded-xl">
                <p className="text-sm text-gray-600 mb-2">Fulfilled</p>
                <p className="text-3xl font-bold text-green-600">
                  {requestsData.status_summary?.find(s => s.status === 'fulfilled')?.count || 0}
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl">
                <p className="text-sm text-gray-600 mb-2">Total Units Requested</p>
                <p className="text-3xl font-bold text-gray-600">{requestsData.total_units_requested}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;