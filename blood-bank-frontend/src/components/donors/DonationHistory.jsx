import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  FaHistory,
  FaTint,
  FaUser,
  FaCalendarAlt,
  FaSyringe,
  FaSearch,
  FaSpinner,
  FaExclamationTriangle,
  FaArrowLeft,
  FaDownload,
  FaPrint,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaUserCircle,
  FaIdCard,
  FaHeartbeat,
  FaChartLine
} from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  Title,
  Tooltip,
  Legend,
  Filler
);

const DonationHistory = () => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [donorCode, setDonorCode] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  // Filter states
  const [dateRange, setDateRange] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Check if donorCode was passed from DonorList
  useEffect(() => {
    if (location.state?.donorCode) {
      console.log("Received donorCode from state:", location.state.donorCode);
      setDonorCode(location.state.donorCode);
      searchDonor(location.state.donorCode);
    } else if (params.donorCode) {
      console.log("Received donorCode from params:", params.donorCode);
      setDonorCode(params.donorCode);
      searchDonor(params.donorCode);
    } else {
      setLoading(false);
    }
  }, [location.state, params]);

  useEffect(() => {
    filterDonations();
  }, [donations, dateRange, startDate, endDate]);

  const searchDonor = async (code = donorCode) => {
    if (!code) {
      setError('Please enter a donor code');
      return;
    }

    setSearchLoading(true);
    setError('');
    setDonor(null);
    setDonations([]);

    try {
      const token = localStorage.getItem('token');
      console.log("Searching for donor with code:", code);
      
      // Get donor details
      const donorResponse = await axios.get(`http://localhost:5000/api/donors/${code}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Donor response:", donorResponse.data);
      setDonor(donorResponse.data);

      // Get donation history for this donor
      console.log("Fetching donations for donor code:", code);
      const donationsResponse = await axios.get(`http://localhost:5000/api/donors/${code}/donations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Donations response:", donationsResponse.data);
      
      // Handle different response formats
      let donationsData = [];
      if (Array.isArray(donationsResponse.data)) {
        donationsData = donationsResponse.data;
      } else if (donationsResponse.data.donations && Array.isArray(donationsResponse.data.donations)) {
        donationsData = donationsResponse.data.donations;
      } else if (donationsResponse.data.data && Array.isArray(donationsResponse.data.data)) {
        donationsData = donationsResponse.data.data;
      }
      
      console.log("Processed donations data:", donationsData);
      
      // Map the donations to include donor info
      const mappedDonations = donationsData.map(donation => {
        console.log("Mapping donation:", donation);
        return {
          _id: donation._id || donation.id,
          donation_date: donation.donation_date || donation.date,
          quantity_ml: donation.quantity_ml || donation.quantity || donation.amount || 450,
          donor_code: donorResponse.data.donor_code,
          donor_name: donorResponse.data.name,
          blood_type: donorResponse.data.blood_type
        };
      });
      
      console.log("Mapped donations:", mappedDonations);
      setDonations(mappedDonations);
      setFilteredDonations(mappedDonations);
      setSearchPerformed(true);
      setError('');
    } catch (err) {
      console.error('Error fetching donor history:', err);
      if (err.response?.status === 404) {
        setError('Donor not found. Please check the donor code.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => {
          localStorage.clear();
          navigate('/login');
        }, 2000);
      } else {
        setError('Failed to load donation history. Please try again.');
      }
      setSearchPerformed(true);
    } finally {
      setSearchLoading(false);
      setLoading(false);
    }
  };

  const filterDonations = () => {
    let filtered = [...donations];

    // Filter by date range
    if (dateRange === 'today') {
      const today = new Date().toDateString();
      filtered = filtered.filter(d => {
        const donationDate = d.donation_date ? new Date(d.donation_date).toDateString() : null;
        return donationDate === today;
      });
    } else if (dateRange === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(d => {
        const donationDate = d.donation_date ? new Date(d.donation_date) : null;
        return donationDate && donationDate >= weekAgo;
      });
    } else if (dateRange === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(d => {
        const donationDate = d.donation_date ? new Date(d.donation_date) : null;
        return donationDate && donationDate >= monthAgo;
      });
    } else if (dateRange === 'year') {
      const yearAgo = new Date();
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      filtered = filtered.filter(d => {
        const donationDate = d.donation_date ? new Date(d.donation_date) : null;
        return donationDate && donationDate >= yearAgo;
      });
    } else if (dateRange === 'custom' && startDate && endDate) {
      filtered = filtered.filter(d => {
        const donationDate = d.donation_date ? new Date(d.donation_date) : null;
        return donationDate && donationDate >= new Date(startDate) && donationDate <= new Date(endDate);
      });
    }

    setFilteredDonations(filtered);
    setCurrentPage(1);
  };

  const handleDonorCodeChange = (e) => {
    setDonorCode(e.target.value);
    setSearchPerformed(false);
    setDonor(null);
    setDonations([]);
  };

  const clearFilters = () => {
    setDateRange('all');
    setStartDate('');
    setEndDate('');
    setShowFilters(false);
  };

  

  
  const viewDonorDetails = (donorCode) => {
    navigate(`/dashboard/donors/${donorCode}`);
  };

  // Prepare chart data for donation trends
  const prepareChartData = () => {
    if (filteredDonations.length === 0) return null;

    // Sort donations by date
    const sortedDonations = [...filteredDonations].sort((a, b) => {
      const dateA = a.donation_date ? new Date(a.donation_date) : new Date(0);
      const dateB = b.donation_date ? new Date(b.donation_date) : new Date(0);
      return dateA - dateB;
    });

    // Group by month
    const monthlyData = {};
    sortedDonations.forEach(donation => {
      if (donation.donation_date) {
        const date = new Date(donation.donation_date);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = {
            count: 0,
            totalVolume: 0
          };
        }
        monthlyData[monthYear].count += 1;
        monthlyData[monthYear].totalVolume += donation.quantity_ml || 450;
      }
    });

    return {
      labels: Object.keys(monthlyData),
      datasets: [
        {
          label: 'Number of Donations',
          data: Object.values(monthlyData).map(d => d.count),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          pointBackgroundColor: '#ef4444',
          tension: 0.4,
          fill: true
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

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDonations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDonations.length / itemsPerPage);

  // Calculate statistics
  const totalDonations = filteredDonations.length;
  const totalVolume = filteredDonations.reduce((sum, d) => sum + (d.quantity_ml || 450), 0);
  const averageVolume = totalDonations > 0 ? Math.round(totalVolume / totalDonations) : 0;
  
  // Get last donation date safely
  const getLastDonationDate = () => {
    if (filteredDonations.length === 0) return 'N/A';
    
    const validDates = filteredDonations
      .map(d => d.donation_date ? new Date(d.donation_date).getTime() : null)
      .filter(date => date !== null);
    
    if (validDates.length === 0) return 'N/A';
    
    return new Date(Math.max(...validDates)).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 p-3 rounded-full">
            <FaHistory className="text-red-600 text-2xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Donation History</h2>
            <p className="text-sm text-gray-600">
              {donor ? `History for ${donor.name}` : 'Enter a donor code to view history'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
         
          
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaArrowLeft />
            <span className="hidden sm:inline">Back</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <FaExclamationTriangle className="text-red-500 text-xl shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Donor Search Section */}
      {!donor && (
        <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaSearch className="text-red-500" />
            Search Donor History
          </h3>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Donor Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={donorCode}
                  onChange={handleDonorCodeChange}
                  placeholder="Enter donor code to view their history"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <button
                  onClick={() => searchDonor()}
                  disabled={!donorCode || searchLoading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {searchLoading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
                  <span>Search</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Donor Info Card (if donor selected) */}
      {donor && (
        <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-start gap-4">
              <div className="bg-red-600 p-3 rounded-full">
                <FaUserCircle className="text-white text-3xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{donor.name}</h3>
                <div className="flex flex-wrap gap-3 mt-2">
                  <span className="text-sm bg-white px-3 py-1 rounded-full flex items-center gap-1">
                    <FaIdCard className="text-red-500" />
                    {donor.donor_code}
                  </span>
                  <span className="text-sm bg-white px-3 py-1 rounded-full flex items-center gap-1">
                    <FaTint className="text-red-500" />
                    {donor.blood_type}
                  </span>
                  <span className="text-sm bg-white px-3 py-1 rounded-full flex items-center gap-1">
                    <FaHeartbeat className="text-red-500" />
                    {donor.is_eligible ? 'Eligible' : 'Ineligible'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => viewDonorDetails(donor.donor_code)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <FaEye />
              <span>View Donor Details</span>
            </button>
          </div>
        </div>
      )}

      {/* Statistics Cards - Only show if donor selected and has donations */}
      {donor && filteredDonations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-xl">
            <p className="text-sm text-blue-600 mb-1">Total Donations</p>
            <p className="text-2xl font-bold text-blue-700">{totalDonations}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl">
            <p className="text-sm text-green-600 mb-1">Total Volume</p>
            <p className="text-2xl font-bold text-green-700">{totalVolume} ml</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-xl">
            <p className="text-sm text-purple-600 mb-1">Average Volume</p>
            <p className="text-2xl font-bold text-purple-700">{averageVolume} ml</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-xl">
            <p className="text-sm text-orange-600 mb-1">Last Donation</p>
            <p className="text-2xl font-bold text-orange-700">{getLastDonationDate()}</p>
          </div>
        </div>
      )}

      
      

      {/* Results Count - Only show if donor selected */}
      {donor && filteredDonations.length > 0 && (
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">
            Showing {currentItems.length} of {filteredDonations.length} donations
          </p>
          <span className="text-sm font-medium text-red-600">
            Total Volume: {totalVolume} ml
          </span>
        </div>
      )}

      {/* Donations Table */}
      {searchLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-red-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading donation history...</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {donor ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Quantity</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentItems.length > 0 ? (
                  currentItems.map((donation, index) => (
                    <tr key={donation._id || index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-gray-400" />
                          <span>
                            {donation.donation_date 
                              ? new Date(donation.donation_date).toLocaleDateString() 
                              : 'Date not available'}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FaTint className="text-red-500" />
                          <span className="font-medium">{donation.quantity_ml || 450} ml</span>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <button
                          onClick={() => viewDonorDetails(donor.donor_code)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="View Donor"
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                      <FaSyringe className="text-4xl text-gray-300 mx-auto mb-3" />
                      <p>No donation records found for this donor.</p>
                      {donor.is_eligible && (
                        <button
                          onClick={() => navigate('/dashboard/donors/record-donation', { 
                            state: { donorCode: donor.donor_code } 
                          })}
                          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          Record First Donation
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <FaHistory className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Enter a donor code to view donation history</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination - Only show if donor selected and has donations */}
      {donor && filteredDonations.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-600">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredDonations.length)} of {filteredDonations.length} donations
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaChevronLeft />
            </button>
            <span className="px-4 py-2 bg-red-600 text-white rounded-lg">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationHistory;