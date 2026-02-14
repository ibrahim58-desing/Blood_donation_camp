import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  FaSyringe,
  FaTint,
  FaUser,
  FaCalendarAlt,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowLeft,
  FaSave,
  FaSearch,
  FaUserCheck,
  FaUserTimes,
  FaClock,
  FaWeight,
  FaHeartbeat,
  FaFlask,
  FaStethoscope
} from 'react-icons/fa';

const RecordDonation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [donor, setDonor] = useState(null);
  const [donorCode, setDonorCode] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  const [formData, setFormData] = useState({
    donation_date: new Date().toISOString().split('T')[0],
    quantity_ml: 450,
    // Optional medical fields for display (not sent to backend)
    blood_pressure: '',
    hemoglobin: '',
    weight: '',
    temperature: '',
    pulse_rate: '',
    notes: ''
  });

  // Check if donorCode was passed from DonorList
  useEffect(() => {
    if (location.state?.donorCode) {
      setDonorCode(location.state.donorCode);
      searchDonor(location.state.donorCode);
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDonorCodeChange = (e) => {
    setDonorCode(e.target.value);
    setSearchPerformed(false);
    setDonor(null);
  };

  const searchDonor = async (code = donorCode) => {
    if (!code) {
      setError('Please enter a donor code');
      return;
    }

    setSearchLoading(true);
    setError('');
    setDonor(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/donors/${code}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const donorData = response.data;
      
      // Check if donor is eligible
      if (!donorData.is_eligible) {
        setError('This donor is currently ineligible to donate. Please check donor status.');
        setDonor(donorData);
      } else {
        setDonor(donorData);
      }
      setSearchPerformed(true);
    } catch (err) {
      console.error('Error searching donor:', err);
      if (err.response?.status === 404) {
        setError('Donor not found. Please check the donor code.');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => {
          localStorage.clear();
          navigate('/login');
        }, 2000);
      } else {
        setError('Failed to search donor. Please try again.');
      }
      setSearchPerformed(true);
    } finally {
      setSearchLoading(false);
    }
  };

  const validateForm = () => {
    if (!donor) {
      setError('Please search and select a donor first');
      return false;
    }

    if (!donor.is_eligible) {
      setError('This donor is not eligible to donate');
      return false;
    }

    if (!formData.quantity_ml || formData.quantity_ml < 350 || formData.quantity_ml > 500) {
      setError('Quantity must be between 350ml and 500ml');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Create donation data using donor_code instead of donor_id
      const donationData = {
        donor_code: donor.donor_code,  // Using donor_code instead of donor_id
        donation_date: formData.donation_date,
        quantity_ml: parseInt(formData.quantity_ml)
      };

      const response = await axios.post(
        `http://localhost:5000/api/donors/${donor.donor_code}/donate`,
        donationData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201 || response.status === 200) {
        setSuccess(true);
        
        // Reset form
        setFormData({
          donation_date: new Date().toISOString().split('T')[0],
          quantity_ml: 450,
          blood_pressure: '',
          hemoglobin: '',
          weight: '',
          temperature: '',
          pulse_rate: '',
          notes: ''
        });

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000);

        // Refresh donor data to show updated last_donation
        searchDonor(donor.donor_code);
      }
    } catch (err) {
      console.error('Error recording donation:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => {
          localStorage.clear();
          navigate('/login');
        }, 2000);
      } else if (err.response?.status === 400) {
        setError(err.response.data?.msg || err.response.data?.error || 'Invalid donation data. Please check all fields.');
      } else {
        setError('Failed to record donation. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getEligibilityStatus = () => {
    if (!donor) return null;
    
    const lastDonation = donor.last_donation ? new Date(donor.last_donation) : null;
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    if (!donor.is_eligible) {
      return { text: 'Ineligible', color: 'red', icon: FaUserTimes };
    }
    if (lastDonation && lastDonation > threeMonthsAgo) {
      return { text: 'Recently Donated', color: 'orange', icon: FaClock };
    }
    return { text: 'Eligible', color: 'green', icon: FaUserCheck };
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 p-3 rounded-full">
            <FaSyringe className="text-red-600 text-2xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Record Donation</h2>
            <p className="text-sm text-gray-600">Record a new blood donation</p>
          </div>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FaArrowLeft />
          <span className="hidden sm:inline">Back</span>
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <FaCheckCircle className="text-green-500 text-xl shrink-0" />
          <div>
            <p className="text-green-700 font-medium">Donation recorded successfully!</p>
            <p className="text-green-600 text-sm">The donation has been added to the donor's history.</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <FaExclamationTriangle className="text-red-500 text-xl shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Donor Search Section */}
      <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaSearch className="text-red-500" />
          Step 1: Find Donor
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
                placeholder="Enter donor code (e.g., DON-XXXXXXX)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={searchLoading}
              />
              <button
                onClick={() => searchDonor()}
                disabled={searchLoading || !donorCode}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {searchLoading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </div>
        </div>

        {/* Donor Info Display */}
        {searchPerformed && (
          <div className="mt-4">
            {donor ? (
              <div className={`p-4 rounded-lg border ${
                donor.is_eligible 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      donor.is_eligible ? 'bg-green-200' : 'bg-red-200'
                    }`}>
                      <FaUser className={donor.is_eligible ? 'text-green-700' : 'text-red-700'} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{donor.name}</h4>
                      <p className="text-sm text-gray-600">Code: {donor.donor_code}</p>
                      <div className="flex flex-wrap gap-3 mt-2">
                        <span className="text-xs bg-white px-2 py-1 rounded-full">
                          <span className="font-medium">Blood:</span> {donor.blood_type}
                        </span>
                        <span className="text-xs bg-white px-2 py-1 rounded-full">
                          <span className="font-medium">Last:</span> {donor.last_donation 
                            ? new Date(donor.last_donation).toLocaleDateString() 
                            : 'First time'}
                        </span>
                        <span className="text-xs bg-white px-2 py-1 rounded-full">
                          <span className="font-medium">Total:</span> {donor.total_donations || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${
                      donor.is_eligible 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {donor.is_eligible ? <FaUserCheck /> : <FaUserTimes />}
                      {donor.is_eligible ? 'Eligible' : 'Ineligible'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-700">No donor found with that code.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Donation Form */}
      {donor && donor.is_eligible && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaSyringe className="text-red-500" />
              Step 2: Donation Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Donation Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Donation Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="donation_date"
                    value={formData.donation_date}
                    onChange={handleChange}
                    required
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity (ml) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="quantity_ml"
                    value={formData.quantity_ml}
                    onChange={handleChange}
                    required
                    min="350"
                    max="500"
                    step="10"
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <FaTint className="absolute left-3 top-3 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Standard: 350-500 ml</p>
              </div>
            </div>

           
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 min-w-48"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <FaSave />
                  Record Donation
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* If donor found but ineligible */}
      {donor && !donor.is_eligible && (
        <div className="text-center py-8">
          <div className="bg-red-50 p-8 rounded-xl inline-block">
            <FaUserTimes className="text-5xl text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Donor Ineligible</h3>
            <p className="text-gray-600 mb-4">
              This donor is currently not eligible to donate blood.
            </p>
            <button
              onClick={() => {
                setDonor(null);
                setDonorCode('');
                setSearchPerformed(false);
              }}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Search Another Donor
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordDonation;