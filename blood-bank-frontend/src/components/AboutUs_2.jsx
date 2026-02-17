// components/AboutUs_2.jsx
import React from 'react';
import { 
  FaHeartbeat, 
  FaCalendarAlt, 
  FaUsers, 
  FaMale, 
  FaFemale,
  FaTint,
  FaAward,
  FaChartLine,
  FaHandHoldingHeart,
  FaGlobe,
  FaMapMarkerAlt,
  FaClock,
  FaArrowRight
} from 'react-icons/fa';

// Import your logo from assets
import megaLogo from '../assets/MEGA_logo.jpeg'; // Adjust path as needed

const AboutUs_2 = () => {
  // Company information
  const companyInfo = {
    fullName: "MASS EMPOWERMENT AND GUIDANCE ASSOCIATION",
    shortName: "MEGA",
    location: "Kayalpattinam, Thoothukudi District, South India",
    registration: "Registered Society",
    founded: "April 5, 2017",
    firstCamp: "April 5, 2017 @ KMT Hospital, Kayalpattinam",
    recentCamp: "December 7, 2025 @ Razack Hospital, Kayalpattinam",
    totalCamps: 45,
    totalDonors: 2153,
    maleDonors: 1876,
    femaleDonors: 277
  };

  // Yearly donation data
  const yearlyData = [
    { year: "2017-2018", camps: 3, male: 209, female: 35, total: 244 },
    { year: "2018-2019", camps: 4, male: 260, female: 82, total: 342 },
    { year: "2019-2020", camps: 4, male: 217, female: 42, total: 259 },
    { year: "2020-2021", camps: 3, male: 158, female: 12, total: 170 },
    { year: "2021-2022", camps: 3, male: 179, female: 13, total: 192 },
    { year: "2022-2023", camps: 6, male: 241, female: 33, total: 274 },
    { year: "2023-2024", camps: 8, male: 262, female: 24, total: 286 },
    { year: "2024-2025", camps: 10, male: 262, female: 32, total: 294 },
    { year: "2025-2026", camps: 4, male: 88, female: 4, total: 92 }
  ];

  return (
    <div className="bg-gradient-to-b from-red-50 to-white py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Logo */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          {/* Logo Space */}
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 bg-white rounded-2xl shadow-xl flex items-center justify-center border-4 border-red-200 hover:border-red-400 transition-colors">
              {megaLogo ? (
                <img src={megaLogo} alt="MEGA Logo" className="w-24 h-24 object-contain" />
              ) : (
                <div className="text-center">
                  <FaHeartbeat className="text-5xl text-red-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Logo Placeholder</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <FaHeartbeat />
            <span>Since April 5, 2017</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {companyInfo.fullName}
          </h1>
          
          <p className="text-xl text-red-600 font-semibold mb-4">
            {companyInfo.shortName}
          </p>
          
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <FaMapMarkerAlt className="text-red-600" />
            <span>{companyInfo.location}</span>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="max-w-3xl mx-auto text-center mb-16 bg-white p-8 rounded-2xl shadow-lg border border-red-100">
          <FaHandHoldingHeart className="text-5xl text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            MEGA focuses on activities where its presence will help in bringing significant improvements to 
            the Society and the results are tangible and can be measured. Since the beginning, these Blood 
            Camps have been organised with the objective of reaching annual blood donations from at least 
            1% of the total population of the City – the recommendation of the WORLD HEALTH ORGANISATION (WHO). 
            In most years, MEGA has reached 50% (and above) of this target.
          </p>
          <div className="mt-6 bg-red-50 p-4 rounded-xl">
            <p className="text-xl font-bold text-red-700">DONATE BLOOD. SAVE LIVES.</p>
            <p className="text-gray-700 mt-2">– Team MEGA</p>
          </div>
        </div>

        {/* Key Milestones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-gradient-to-br from-red-600 to-red-700 text-white rounded-2xl p-8 shadow-xl">
            <FaCalendarAlt className="text-4xl mb-4 text-yellow-300" />
            <h3 className="text-xl font-bold mb-2">First Blood Camp</h3>
            <p className="text-2xl font-bold mb-2">{companyInfo.firstCamp}</p>
            <p className="text-red-100">The journey began here</p>
          </div>
          
          <div className="bg-gradient-to-br from-red-600 to-red-700 text-white rounded-2xl p-8 shadow-xl">
            <FaCalendarAlt className="text-4xl mb-4 text-yellow-300" />
            <h3 className="text-xl font-bold mb-2">Most Recent Camp</h3>
            <p className="text-2xl font-bold mb-2">{companyInfo.recentCamp}</p>
            <p className="text-red-100">Continuing the mission</p>
          </div>
        </div>

        {/* Overall Statistics */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16 border border-red-100">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Overall Impact <span className="text-red-600">(2017-2026)</span>
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-red-600 mb-2">{companyInfo.totalCamps}</div>
              <div className="text-sm text-gray-600">Total Camps</div>
            </div>
            
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-red-600 mb-2">{companyInfo.totalDonors}</div>
              <div className="text-sm text-gray-600">Total Donors</div>
            </div>
            
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-blue-600 mb-2">{companyInfo.maleDonors}</div>
              <div className="text-sm text-gray-600">
                <FaMale className="inline mr-1" />
                Male
              </div>
            </div>
            
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-pink-600 mb-2">{companyInfo.femaleDonors}</div>
              <div className="text-sm text-gray-600">
                <FaFemale className="inline mr-1" />
                Female
              </div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <div className="text-2xl font-bold text-red-600 mb-2">
                {Math.round((companyInfo.femaleDonors / companyInfo.totalDonors) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Female Donors</div>
            </div>
          </div>
        </div>

        {/* Yearly Data Table */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Year-wise Donation <span className="text-red-600">Statistics</span>
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-red-600 text-white">
                  <th className="px-4 py-3 rounded-tl-lg">Year</th>
                  <th className="px-4 py-3">Total Camps</th>
                  <th className="px-4 py-3">Male Donors</th>
                  <th className="px-4 py-3">Female Donors</th>
                  <th className="px-4 py-3 rounded-tr-lg">Total Donors</th>
                </tr>
              </thead>
              <tbody>
                {yearlyData.map((item, index) => (
                  <tr 
                    key={item.year}
                    className={`border-b hover:bg-red-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3 font-semibold">{item.year}</td>
                    <td className="px-4 py-3 text-center">{item.camps}</td>
                    <td className="px-4 py-3 text-center text-blue-600 font-semibold">{item.male}</td>
                    <td className="px-4 py-3 text-center text-pink-600 font-semibold">{item.female}</td>
                    <td className="px-4 py-3 text-center text-red-600 font-bold">{item.total}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-red-100 font-bold">
                  <td className="px-4 py-3 rounded-bl-lg">TOTAL</td>
                  <td className="px-4 py-3 text-center">
                    {yearlyData.reduce((sum, item) => sum + item.camps, 0)}
                  </td>
                  <td className="px-4 py-3 text-center text-blue-700">
                    {yearlyData.reduce((sum, item) => sum + item.male, 0)}
                  </td>
                  <td className="px-4 py-3 text-center text-pink-700">
                    {yearlyData.reduce((sum, item) => sum + item.female, 0)}
                  </td>
                  <td className="px-4 py-3 text-center text-red-700 rounded-br-lg">
                    {yearlyData.reduce((sum, item) => sum + item.total, 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-xl p-6 text-center">
            <FaGlobe className="text-3xl text-blue-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">WHO Recommendation</h3>
            <p className="text-sm text-gray-600">
              Aiming for 1% of population as blood donors annually
            </p>
          </div>
          
          <div className="bg-green-50 rounded-xl p-6 text-center">
            <FaChartLine className="text-3xl text-green-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">Our Achievement</h3>
            <p className="text-sm text-gray-600">
              Consistently reaching 50%+ of WHO target
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-xl p-6 text-center">
            <FaClock className="text-3xl text-purple-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">Regular Camps</h3>
            <p className="text-sm text-gray-600">
              {companyInfo.totalCamps} camps organized since 2017
            </p>
          </div>
        </div>

       
      </div>
    </div>
  );
};

export default AboutUs_2;