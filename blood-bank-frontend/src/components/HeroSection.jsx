import React, { useState, useEffect } from 'react';
import { FaHeartbeat, FaUserCheck, FaUsers, FaArrowRight, FaTint, FaHospital, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';

const HeroSection = () => {
  const [bloodInventory, setBloodInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryStats, setSummaryStats] = useState({
    totalUnits: 0,
    criticalTypes: 0,
    criticalThreshold: 10 // You can adjust this threshold
  });

  // Fetch blood inventory data from backend
  useEffect(() => {
    const fetchBloodInventory = async () => {
      try {
        setLoading(true);
        // Call your backend endpoint
        const response = await axios.get('http://localhost:5000/api/inventory/summary');
        
        // Transform the data to match our component structure
        const transformedData = response.data.map(item => ({
          type: item._id,
          units: item.count,
          // Mark as critical if units are below threshold
          critical: item.count < summaryStats.criticalThreshold
        }));
        
        // Sort by blood type for consistent display
        const sortedData = transformedData.sort((a, b) => {
          const order = ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'];
          return order.indexOf(a.type) - order.indexOf(b.type);
        });
        
        setBloodInventory(sortedData);
        
        // Calculate summary stats
        const total = sortedData.reduce((sum, item) => sum + item.units, 0);
        const critical = sortedData.filter(item => item.critical).length;
        
        setSummaryStats(prev => ({
          ...prev,
          totalUnits: total,
          criticalTypes: critical
        }));
      } catch (err) {
        setError('Failed to load blood inventory data');
        console.error('Error fetching blood inventory:', err);
        
        // Fallback mock data in case of error
        const fallbackData = [
          { type: 'A+', units: 45, critical: false },
          { type: 'B+', units: 32, critical: false },
          { type: 'O+', units: 67, critical: false },
          { type: 'AB+', units: 18, critical: true },
          { type: 'A-', units: 12, critical: true },
          { type: 'B-', units: 8, critical: true },
          { type: 'O-', units: 5, critical: true },
          { type: 'AB-', units: 3, critical: true },
        ];
        
        setBloodInventory(fallbackData);
        const total = fallbackData.reduce((sum, item) => sum + item.units, 0);
        const critical = fallbackData.filter(item => item.critical).length;
        setSummaryStats(prev => ({
          ...prev,
          totalUnits: total,
          criticalTypes: critical
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchBloodInventory();
  }, []);

  // Ensure all blood types are displayed, even if some are missing from DB
  const allBloodTypes = ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'];
  const displayInventory = allBloodTypes.map(type => {
    const existing = bloodInventory.find(item => item.type === type);
    return existing || {
      type,
      units: 0,
      critical: true // Mark as critical if no data
    };
  });

  return (
    <div className="min-h-screen relative">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1588614959060-4d144f28b207?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/70 via-red-800/60 to-pink-800/50"></div>
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

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <button className="bg-white hover:bg-red-50 text-red-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group">
              Register to Become Volunteer
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="bg-transparent hover:bg-white/20 text-white border-2 border-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
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

        {/* Available Blood Inventory Section */}
        <div className="max-w-6xl mx-auto mb-12 md:mb-16">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 border border-white/30">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8">
              <div className="text-center md:text-left mb-6 md:mb-0">
                <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <FaTint className="text-red-600" />
                  Live Blood Inventory
                  {loading && (
                    <FaSpinner className="animate-spin text-red-600 text-lg" />
                  )}
                </h2>
                <p className="text-gray-600 mt-2">
                  Real-time blood stock from our database
                  <span className="ml-2 text-sm bg-red-100 text-red-700 px-2 py-1 rounded-full">
                    Updated Live
                  </span>
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Adequate Stock</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Critical (Under {summaryStats.criticalThreshold} units)</span>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <FaSpinner className="animate-spin text-4xl text-red-600" />
                <span className="ml-4 text-gray-600">Loading live blood inventory...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
                <p className="text-red-600 mb-2">{error}</p>
                <p className="text-gray-600 text-sm">Showing fallback data</p>
              </div>
            ) : (
              <>
                {/* Blood Type Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                  {displayInventory.map((blood) => (
                    <div 
                      key={blood.type}
                      className={`p-4 rounded-xl text-center transition-all duration-300 hover:scale-105 cursor-pointer ${
                        blood.critical 
                          ? 'bg-red-50 border-2 border-red-200 hover:border-red-300' 
                          : 'bg-green-50 border-2 border-green-200 hover:border-green-300'
                      }`}
                      title={`${blood.units} units available`}
                    >
                      <div className={`text-2xl font-bold ${
                        blood.critical ? 'text-red-700' : 'text-green-700'
                      }`}>
                        {blood.type}
                      </div>
                      <div className={`text-3xl font-bold mt-2 ${
                        blood.critical ? 'text-red-800' : 'text-green-800'
                      }`}>
                        {blood.units}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Units</div>
                      {blood.critical ? (
                        <div className="mt-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                          {blood.units === 0 ? 'Out of Stock' : 'Urgent Need'}
                        </div>
                      ) : (
                        <div className="mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          In Stock
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Summary Stats */}
                <div className="mt-8 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-700">{summaryStats.totalUnits}</div>
                    <div className="text-gray-600">Total Units Available</div>
                    <div className="text-xs text-blue-500 mt-1">Across all blood types</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-xl">
                    <div className="text-2xl font-bold text-red-700">{summaryStats.criticalTypes}</div>
                    <div className="text-gray-600">Critical Blood Types</div>
                    <div className="text-xs text-red-500 mt-1">Need urgent donations</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-700">
                      {displayInventory.filter(item => !item.critical && item.units > 0).length}
                    </div>
                    <div className="text-gray-600">Adequate Stock Types</div>
                    <div className="text-xs text-green-500 mt-1">Safe levels maintained</div>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500">
                    Data fetched from MongoDB • Updates in real-time • Last updated: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Three Cards Section - Below the main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto mt-12">
          {/* Card 1 - Register Now */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 transform hover:-translate-y-2 transition-all duration-300 border border-white/30">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-red-100 p-4 rounded-2xl">
                <FaUserCheck className="text-3xl text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Quick Registration
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Join our network of life-savers. Register in minutes and start making a difference today.
              </p>
              <button className="mt-4 text-red-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                Get Started
                <FaArrowRight />
              </button>
            </div>
          </div>

          {/* Card 2 - Request Blood */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8 transform hover:-translate-y-2 transition-all duration-300 border border-white/30">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-red-100 p-4 rounded-2xl">
                <FaHeartbeat className="text-3xl text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Request Blood
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Need blood urgently? Submit a request and get connected with donors instantly.
              </p>
              <button className="mt-4 text-red-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                Submit Request
                <FaArrowRight />
              </button>
            </div>
          </div>

          {/* Card 3 - Blood Banks */}
          <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl shadow-2xl p-6 md:p-8 transform hover:-translate-y-2 transition-all duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                <FaHospital className="text-3xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                Find Blood Banks
              </h3>
              <p className="text-white/90 leading-relaxed">
                Locate nearest blood banks with real-time availability and contact information.
              </p>
              <div className="mt-4 flex flex-col items-center gap-4">
                <button className="bg-white text-red-600 px-6 py-2 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                  View Banks
                </button>
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="w-10 h-10 rounded-full bg-white/30 border-2 border-white flex items-center justify-center text-white font-bold">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;