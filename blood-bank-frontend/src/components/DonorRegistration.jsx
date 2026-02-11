import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaUserPlus, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaTint, 
  FaVenusMars, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaIdCard, 
  FaSpinner, 
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowLeft,
  FaShieldAlt
} from 'react-icons/fa';

const DonorRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_no: '',
    blood_type: '',
    gender: '',
    date_of_birth: '',
    address: '',
    last_donation: '',
    total_donations: 0,
    is_eligible: true
  });

  // Check if user is admin or technician
  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(user);
    
    // Only allow admin or technician
    if (userData.role !== 'admin' && userData.role !== 'technician') {
      navigate('/');
      return;
    }

    setUserRole(userData.role);
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        'http://localhost:5000/api/donors',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201) {
        setSuccess(true);
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone_no: '',
          blood_type: '',
          gender: '',
          date_of_birth: '',
          address: '',
          last_donation: '',
          total_donations: 0,
          is_eligible: true
        });
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      }
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => {
          localStorage.clear();
          navigate('/login');
        }, 2000);
      } else if (err.response?.status === 403) {
        setError('Access denied. Admin or technician privileges required.');
      } else {
        setError(err.response?.data?.error?.[0]?.msg || 
                err.response?.data?.msg || 
                'Registration failed. Please check all fields.');
      }
    } finally {
      setLoading(false);
    }
  };

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genders = ['male', 'female', 'others'];

  // If not authorized, don't render the form
  if (!userRole) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 via-white to-red-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>
          
          <div className="flex items-center gap-2 bg-red-100 px-4 py-2 rounded-full">
            <FaShieldAlt className="text-red-600" />
            <span className="text-sm font-medium text-red-700">
              {userRole === 'admin' ? 'Administrator' : 'Technician'} Access
            </span>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-red-100 overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-red-600 to-pink-600 px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-full">
                <FaUserPlus className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Donor Registration</h1>
                <p className="text-red-100 mt-1">
                  Register a new blood donor in the system
                </p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mx-8 mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <FaCheckCircle className="text-green-500 text-xl shrink-0" />
              <div>
                <p className="text-green-700 font-medium">Donor registered successfully!</p>
                <p className="text-green-600 text-sm">The new donor has been added to the database.</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <FaExclamationTriangle className="text-red-500 text-xl shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Personal Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaUser className="text-red-500" />
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="Enter donor's full name"
                    />
                    <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="donor@example.com"
                    />
                    <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone_no"
                      value={formData.phone_no}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="9876543210"
                    />
                    <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    />
                    <FaCalendarAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Blood Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="blood_type"
                      value={formData.blood_type}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all appearance-none"
                    >
                      <option value="">Select Blood Type</option>
                      {bloodTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <FaTint className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all appearance-none"
                    >
                      <option value="">Select Gender</option>
                      {genders.map(gender => (
                        <option key={gender} value={gender}>
                          {gender.charAt(0).toUpperCase() + gender.slice(1)}
                        </option>
                      ))}
                    </select>
                    <FaVenusMars className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      rows="3"
                      className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="Enter complete address"
                    />
                    <FaMapMarkerAlt className="absolute left-4 top-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Donation Information */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaIdCard className="text-red-500" />
                Donation Information (Optional)
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Last Donation Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Donation Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="last_donation"
                      value={formData.last_donation}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    />
                    <FaCalendarAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Leave blank if first-time donor</p>
                </div>

                {/* Total Donations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Donations
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="total_donations"
                      value={formData.total_donations}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    />
                    <FaTint className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Eligibility Status */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_eligible"
                      checked={formData.is_eligible}
                      onChange={(e) => setFormData({...formData, is_eligible: e.target.checked})}
                      className="w-5 h-5 text-red-600 bg-gray-50 border-gray-200 rounded focus:ring-red-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Donor is eligible to donate blood
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Uncheck this if donor is currently ineligible (medical reasons, recent donation, etc.)
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-end">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-linear-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 min-w-50"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <FaUserPlus />
                    Register Donor
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Note about donor code */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Donor code will be automatically generated (Format: DON-XXXXXXX)</p>
          <p className="mt-1">All fields marked with <span className="text-red-500">*</span> are required</p>
        </div>
      </div>
    </div>
  );
};

export default DonorRegistration;