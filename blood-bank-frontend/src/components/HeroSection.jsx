import React from 'react';
import { FaHeartbeat, FaUserCheck, FaArrowRight, FaTint, FaAward, FaUserMd } from 'react-icons/fa';

const HeroSection = () => {
  // Static blood inventory data
  const bloodInventory = [
    { type: 'A+', units: 45, critical: false },
    { type: 'B+', units: 32, critical: false },
    { type: 'O+', units: 67, critical: false },
    { type: 'AB+', units: 18, critical: true },
    { type: 'A-', units: 12, critical: true },
    { type: 'B-', units: 8, critical: true },
    { type: 'O-', units: 5, critical: true },
    { type: 'AB-', units: 3, critical: true },
  ];

  // Static top donors data
  const topDonors = [
    { rank: 1, name: 'Rajesh Kumar', donations: 18, bloodType: 'O+' },
    { rank: 2, name: 'Priya Sharma', donations: 15, bloodType: 'A+' },
    { rank: 3, name: 'Arun Patel', donations: 12, bloodType: 'B+' },
    { rank: 4, name: 'Sneha Reddy', donations: 10, bloodType: 'AB+' },
    { rank: 5, name: 'Kiran Gowda', donations: 9, bloodType: 'O-' },
  ];

  // Calculate summary stats
  const summaryStats = {
    totalUnits: bloodInventory.reduce((sum, item) => sum + item.units, 0),
    criticalTypes: bloodInventory.filter(item => item.critical).length,
    criticalThreshold: 10
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
                </h2>
                <p className="text-gray-600 mt-2">
                  Current blood stock status in our bank
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

            {/* Blood Type Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {bloodInventory.map((blood) => (
                <div 
                  key={blood.type}
                  className={`p-4 rounded-xl text-center ${
                    blood.critical 
                      ? 'bg-red-50 border-2 border-red-200' 
                      : 'bg-green-50 border-2 border-green-200'
                  }`}
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
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="mt-8 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-700">{summaryStats.totalUnits}</div>
                <div className="text-gray-600">Total Units Available</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <div className="text-2xl font-bold text-red-700">{summaryStats.criticalTypes}</div>
                <div className="text-gray-600">Critical Blood Types</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-700">
                  {bloodInventory.filter(item => !item.critical && item.units > 0).length}
                </div>
                <div className="text-gray-600">Adequate Stock Types</div>
              </div>
            </div>
          </div>
        </div>

        {/* Frequent Blood Donor Recognition Section - COMPACT */}
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

            {/* Compact Top Donors List */}
            <div className="space-y-3 mb-8">
              {topDonors.map((donor) => (
                <div 
                  key={donor.rank}
                  className="bg-white rounded-xl p-4 shadow-sm border border-red-100 flex items-center gap-4 hover:shadow-md transition-shadow"
                >
                  {/* Rank Number - Compact */}
                  <div className="text-xl font-bold text-white w-10 h-10 flex items-center justify-center bg-linear-to-r from-red-500 to-pink-500 rounded-full shrink-0">
                    {donor.rank}
                  </div>
                  
                  {/* Donor Info - Compact */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4">
                      <h3 className="text-lg font-bold text-gray-900 truncate">{donor.name}</h3>
                      <div className={`px-2 py-1 rounded text-sm font-medium shrink-0 ${
                        donor.bloodType.includes('-') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {donor.bloodType}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {donor.donations} donations
                    </div>
                  </div>
                  
                  {/* Donation Count - Compact */}
                  <div className="text-2xl font-bold text-red-600 shrink-0">
                    {donor.donations}
                  </div>
                </div>
              ))}
            </div>

            {/* Simple Call to Action */}
            <div className="text-center">
              <p className="text-gray-700 mb-4">
                Be a hero. Donate blood today.
              </p>
              <button className="inline-flex items-center gap-3 bg-linear-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-bold transition-colors duration-300 shadow-lg">
                <FaUserMd />
                Register as a Donor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;