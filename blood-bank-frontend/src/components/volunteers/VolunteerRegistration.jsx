// components/volunteers/VolunteerRegistration.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaUserPlus, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaCity, 
  FaGlobe, 
  FaMapPin,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';

const VolunteerRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.name) return "Name is required";
    if (!formData.email) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email)) return "Email is invalid";
    if (!formData.phone) return "Phone number is required";
    if (!/^\d{10}$/.test(formData.phone)) return "Phone must be 10 digits";
    if (!formData.address) return "Address is required";
    if (!formData.city) return "City is required";
    if (!formData.state) return "State is required";
    if (!formData.pincode) return "Pincode is required";
    if (!/^\d{6}$/.test(formData.pincode)) return "Pincode must be 6 digits";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/volunteers/register',
        formData
      );

      if (response.data.success) {
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          pincode: ''
        });
        
        setTimeout(() => {
          setSuccess(false);
          navigate('/volunteers/list');
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-green-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-teal-600 px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-full">
                <FaUserPlus className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Volunteer Registration</h1>
                <p className="text-green-100 mt-1">
                  Join our team and help save lives
                </p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mx-8 mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <FaCheckCircle className="text-green-500 text-xl" />
              <p className="text-green-700">Registered successfully! You'll receive camp notifications via email.</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <FaExclamationTriangle className="text-red-500 text-xl" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
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
                    className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="John Doe"
                  />
                  <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="john@example.com"
                  />
                  <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="9876543210"
                  />
                  <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="123 Main Street"
                  />
                  <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Mumbai"
                  />
                  <FaCity className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Maharashtra"
                  />
                  <FaGlobe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="400001"
                  />
                  <FaMapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> After registration, you'll receive email notifications 
                about upcoming blood donation camps automatically. No need to sign up for each camp!
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-teal-700 transition-all disabled:opacity-70 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <FaUserPlus />
                  Register as Volunteer
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VolunteerRegistration;