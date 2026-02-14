import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaSearch,
  FaEye,
  FaTint,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaSpinner,
  FaExclamationTriangle,
  FaHeartbeat,
  FaCheckCircle,
  FaSyringe,
  FaDownload,
  FaPrint
} from 'react-icons/fa';

const EligibleDonors = () => {
  const navigate = useNavigate();
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBloodType, setSelectedBloodType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [donorsPerPage] = useState(10);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchEligibleDonors();
  }, []);

  useEffect(() => {
    filterDonors();
  }, [searchTerm, selectedBloodType, donors]);

  const fetchEligibleDonors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/donors/eligible', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDonors(response.data);
      setFilteredDonors(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching eligible donors:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => {
          localStorage.clear();
          navigate('/login');
        }, 2000);
      } else {
        setError('Failed to load eligible donors. Please refresh the page.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterDonors = () => {
    let filtered = [...donors];

    if (searchTerm) {
      filtered = filtered.filter(donor =>
        donor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.donor_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.phone_no?.toString().includes(searchTerm) ||
        donor.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedBloodType) {
      filtered = filtered.filter(donor => donor.blood_type === selectedBloodType);
    }

    setFilteredDonors(filtered);
    setCurrentPage(1);
  };

  const handleRecordDonation = (donorCode) => {
    navigate('/dashboard/donors/record-donation', { state: { donorCode } });
  };

  const handleViewDonor = (donorCode) => {
    navigate(`/dashboard/donors/${donorCode}`);
  };

  const exportToCSV = () => {
    const headers = ['Donor Code', 'Name', 'Email', 'Phone', 'Blood Type', 'Gender', 'Last Donation', 'Total Donations'];
    const csvData = filteredDonors.map(donor => [
      donor.donor_code,
      donor.name,
      donor.email,
      donor.phone_no,
      donor.blood_type,
      donor.gender,
      donor.last_donation ? new Date(donor.last_donation).toLocaleDateString() : 'Never',
      donor.total_donations || 0
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eligible_donors_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Pagination
  const indexOfLastDonor = currentPage * donorsPerPage;
  const indexOfFirstDonor = indexOfLastDonor - donorsPerPage;
  const currentDonors = filteredDonors.slice(indexOfFirstDonor, indexOfLastDonor);
  const totalPages = Math.ceil(filteredDonors.length / donorsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading eligible donors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <FaHeartbeat className="text-green-600 text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Eligible Donors</h2>
              <p className="text-sm text-gray-600">
                Ready to donate • <span className="font-semibold text-green-600">{donors.length}</span> donors available
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaDownload />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={fetchEligibleDonors}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaCheckCircle />
            <span>Refresh</span>
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

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search eligible donors by name, code, phone..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
        
        <select
          value={selectedBloodType}
          onChange={(e) => setSelectedBloodType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Blood Types</option>
          {bloodTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        
        <button
          onClick={() => {
            setSearchTerm('');
            setSelectedBloodType('');
          }}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-600">
          Showing {currentDonors.length} of {filteredDonors.length} eligible donors
        </p>
        <div className="bg-green-50 px-3 py-1 rounded-full">
          <span className="text-xs font-medium text-green-700">
            ✓ All donors are eligible to donate
          </span>
        </div>
      </div>

      {/* Donors Grid/Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-green-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Donor Code</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Blood Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contact</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Last Donation</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total Donations</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentDonors.length > 0 ? (
              currentDonors.map((donor) => (
                <tr key={donor._id} className="hover:bg-green-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {donor.donor_code}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{donor.name}</p>
                      <p className="text-xs text-gray-500">{donor.gender}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                      <FaTint className="text-xs" />
                      {donor.blood_type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <FaPhone className="text-gray-400 text-xs" />
                        <span>{donor.phone_no}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FaEnvelope className="text-gray-400 text-xs" />
                        <span className="text-xs truncate max-w-[150px]">{donor.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {donor.last_donation ? (
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-400" />
                        <span className="text-sm">
                          {new Date(donor.last_donation).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-green-600 font-medium">First time donor</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-gray-900">
                      {donor.total_donations || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDonor(donor.donor_code)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleRecordDonation(donor.donor_code)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors flex items-center gap-1"
                        title="Record Donation"
                      >
                        <FaSyringe />
                        <span className="text-xs">Donate</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  No eligible donors found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredDonors.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-600">
            Showing {indexOfFirstDonor + 1} to {Math.min(indexOfLastDonor, filteredDonors.length)} of {filteredDonors.length} eligible donors
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
            <span className="px-4 py-2 bg-green-600 text-white rounded-lg">
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

export default EligibleDonors;