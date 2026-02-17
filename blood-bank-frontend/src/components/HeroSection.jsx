import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaHeartbeat,
  FaUserCheck,
  FaArrowRight,
  FaTint,
  FaAward,
  FaUserMd,
  FaSpinner,
  FaExclamationTriangle,
  FaSync,
  FaDatabase,
  FaUserPlus
} from 'react-icons/fa';

const HeroSection = () => {
  const navigate = useNavigate();
  const [inventoryData, setInventoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  // Static top donors data
  const topDonors = [
    { rank: 1, name: 'Rajesh Kumar', donations: 18, bloodType: 'O+' },
    { rank: 2, name: 'Priya Sharma', donations: 15, bloodType: 'A+' },
    { rank: 3, name: 'Arun Patel', donations: 12, bloodType: 'B+' },
    { rank: 4, name: 'Sneha Reddy', donations: 10, bloodType: 'AB+' },
    { rank: 5, name: 'Kiran Gowda', donations: 9, bloodType: 'O-' },
  ];

  // Function to get color based on blood type (for text and border only)
  const getBloodTypeColor = (bloodType) => {
    const colors = {
      'A+': 'text-red-600 border-red-300',
      'A-': 'text-pink-600 border-pink-300',
      'B+': 'text-orange-600 border-orange-300',
      'B-': 'text-amber-600 border-amber-300',
      'AB+': 'text-purple-600 border-purple-300',
      'AB-': 'text-indigo-600 border-indigo-300',
      'O+': 'text-green-600 border-green-300',
      'O-': 'text-blue-600 border-blue-300'
    };
    return colors[bloodType] || 'text-gray-600 border-gray-300';
  };

  // Fetch live inventory data
  useEffect(() => {
    fetchInventoryData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchInventoryData(true);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchInventoryData = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    setError('');
    
    try {
      console.log('Fetching live inventory data...');
      
      const response = await axios.get('http://localhost:5000/api/reports/inventory', {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API Response:', response.data);
      
      if (response.data) {
        if (response.data.blood_group_summary) {
          setInventoryData(response.data);
        } else if (Array.isArray(response.data)) {
          setInventoryData({ blood_group_summary: response.data });
        } else if (response.data.data) {
          setInventoryData(response.data.data);
        } else {
          console.warn('Unexpected data structure:', response.data);
          setError('Received unexpected data format');
        }
        
        setLastUpdated(new Date());
      } else {
        setError('No data received from server');
      }
    } catch (err) {
      console.error('Error fetching inventory data:', err);
      
      if (err.code === 'ECONNABORTED') {
        setError('Request timeout - please try again');
      } else if (err.response) {
        setError(`Server error (${err.response.status}) - please try again`);
      } else if (err.request) {
        setError('Cannot connect to server - please check your connection');
      } else {
        setError('Failed to fetch data - please try again');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  // Calculate total units
  const getTotalUnits = () => {
    if (!inventoryData?.blood_group_summary) return 0;
    return inventoryData.blood_group_summary.reduce(
      (sum, item) => sum + (item.total_units || 0), 0
    );
  };

  const handleEmergencyRequest = () => {
    navigate('/requests/new');
  };

  const handleRegisterDonor = () => {
    navigate('/donors/register');
  };

  // ✅ NEW: Handle Volunteer Registration
  const handleVolunteerRegistration = () => {
    navigate('/volunteer/register');
  };

  const handleRefresh = () => {
    fetchInventoryData();
  };

  const totalUnits = getTotalUnits();

  // Format last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never';
    return lastUpdated.toLocaleTimeString();
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1588614959060-4d144f28b207?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-linear-to-r from-red-900/70 via-red-800/60 to-pink-800/50"></div>
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Main Content - Centered */}
        <div className="max-w-4xl mx-auto text-center space-y-8 mb-12 md:mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold">
            <FaHeartbeat className="text-red-200" />
            <span>Donate Blood, Save Lives</span>
          </div>
          
          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Efficiently Connect with
            <span className="text-red-200 block mt-2">Blood Donors</span>
          </h1>
          
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Saving Lives Made Simpler and Faster
          </p>

          {/* CTA Buttons - Updated with Volunteer Registration */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            {/* Volunteer Button */}
            <button 
              onClick={handleVolunteerRegistration}
              className="bg-white hover:bg-red-50 text-red-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
            >
              <FaUserPlus className="group-hover:scale-110 transition-transform" />
              Register to Become Volunteer
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            {/* Emergency Request Button */}
            <button 
              onClick={handleEmergencyRequest}
              className="bg-transparent hover:bg-white/20 text-white border-2 border-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Emergency Request
            </button>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 max-w-2xl mx-auto">
            <div className="text-center backdrop-blur-sm bg-white/10 p-4 rounded-2xl">
              <div className="text-3xl font-bold text-white">500+</div>
              <div className="text-white/80">Active Donors</div>
            </div>
            <div className="text-center backdrop-blur-sm bg-white/10 p-4 rounded-2xl">
              <div className="text-3xl font-bold text-white">1K+</div>
              <div className="text-white/80">Lives Saved</div>
            </div>
            <div className="text-center backdrop-blur-sm bg-white/10 p-4 rounded-2xl">
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-white/80">Emergency Support</div>
            </div>
          </div>
        </div>

        {/* Available Blood Inventory Section - Live Data */}
        <div className="max-w-6xl mx-auto mb-12 md:mb-16">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 border border-white/30">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8">
              <div className="text-center md:text-left mb-6 md:mb-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <FaTint className="text-red-600" />
                    Blood Inventory
                  </h2>
                  {!loading && inventoryData && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <FaDatabase className="text-xs" />
                      Live
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mt-2">
                  Current blood stock status in our bank
                </p>
                {lastUpdated && (
                  <p className="text-xs text-gray-400 mt-1">
                    Last updated: {formatLastUpdated()}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center gap-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm disabled:opacity-50"
                >
                  <FaSync className={`text-xs ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <div className="text-sm text-gray-600">
                  Total Units: <span className="font-bold text-red-600">{totalUnits}</span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <FaExclamationTriangle className="text-red-500" />
                <p className="text-red-700 text-sm">{error}</p>
                <button 
                  onClick={handleRefresh}
                  className="ml-auto text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <FaSpinner className="animate-spin text-4xl text-red-600" />
                <span className="ml-3 text-gray-600">Loading inventory data...</span>
              </div>
            ) : (
              <>
                {/* Blood Type Grid - With Colored Text and Border Only */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                  {inventoryData?.blood_group_summary?.map((blood) => {
                    const colorClass = getBloodTypeColor(blood.blood_type);
                    return (
                      <div 
                        key={blood.blood_type}
                        className={`p-4 rounded-xl text-center border-2 bg-white ${colorClass}`}
                      >
                        <div className={`text-2xl font-bold ${colorClass.split(' ')[0]}`}>
                          {blood.blood_type}
                        </div>
                        <div className={`text-3xl font-bold mt-2 ${colorClass.split(' ')[0]}`}>
                          {blood.total_units}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">Units</div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary Stats */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="text-center p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-700">{totalUnits}</div>
                    <div className="text-gray-600">Total Units Available</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Frequent Blood Donor Recognition Section */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-linear-to-br from-white to-red-50 rounded-2xl shadow-2xl p-6 md:p-8 border border-red-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-linear-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
                <FaAward className="text-yellow-300" />
                <span>Annual Recognition 2023-2024</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3 justify-center">
                <FaUserCheck className="text-red-600" />
                Top 5 Frequent Blood Donors
              </h2>
              <p className="text-gray-600 mt-2">
                Our most dedicated donors
              </p>
            </div>

            {/* Top Donors List */}
            <div className="space-y-3 mb-8">
              {topDonors.map((donor) => {
                const bloodColorClass = getBloodTypeColor(donor.bloodType).split(' ')[0];
                return (
                  <div 
                    key={donor.rank}
                    className="bg-white rounded-xl p-4 shadow-sm border border-red-100 flex items-center gap-4 hover:shadow-md transition-shadow hover:scale-[1.02] transform duration-300"
                  >
                    <div className="text-xl font-bold text-white w-10 h-10 flex items-center justify-center bg-linear-to-r from-red-500 to-pink-500 rounded-full">
                      {donor.rank}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <h3 className="text-lg font-bold text-gray-900">{donor.name}</h3>
                        <div className={`${bloodColorClass} font-medium`}>
                          {donor.bloodType}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {donor.donations} lifetime donations
                      </div>
                    </div>
                    
                    <div className="text-2xl font-bold text-red-600">
                      {donor.donations}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;