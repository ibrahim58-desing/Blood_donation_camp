// components/volunteers/CreateCamp.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from "../api.js";
import axios from 'axios';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaMapMarkerAlt, 
  FaHeading,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowLeft,
  FaSave,
  FaInfoCircle,
  FaHome,
  FaFileAlt,
  FaSun,
  FaMoon
} from 'react-icons/fa';

const CreateCamp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    
    description: ''
  });

  const [errors, setErrors] = useState({});

  // Generate time options with AM/PM
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const period = hour < 12 ? 'AM' : 'PM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const displayMinute = minute.toString().padStart(2, '0');
        const timeValue = `${hour.toString().padStart(2, '0')}:${displayMinute}`;
        const displayTime = `${displayHour}:${displayMinute} ${period}`;
        times.push({ value: timeValue, display: displayTime });
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  // Check if user is admin
  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(user);
    
    // Only allow admin
    if (userData.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    setUserRole(userData.role);
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Camp Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Camp name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Camp name must be at least 3 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Camp name cannot exceed 100 characters';
    }

    // Date validation
    if (!formData.date) {
      newErrors.date = 'Camp date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = 'Camp date cannot be in the past';
      }
    }

    // Start time validation
    if (!formData.start_time) {
      newErrors.start_time = 'Start time is required';
    }

    // End time validation
    if (!formData.end_time) {
      newErrors.end_time = 'End time is required';
    }

    // Time logic validation
    if (formData.start_time && formData.end_time) {
      if (formData.start_time >= formData.end_time) {
        newErrors.end_time = 'End time must be after start time';
      }
    }

    // Location validation (short location name)
    if (!formData.location.trim()) {
      newErrors.location = 'Location name is required';
    } else if (formData.location.trim().length < 3) {
      newErrors.location = 'Location must be at least 3 characters';
    }

  

    // Description validation (optional but recommended)
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Send data exactly as your API expects
      const response = await axios.post(
        `${API_URL}/api/camps`,
        {
          name: formData.name,
          date: formData.date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          location: formData.location,
         
          description: formData.description || '' // Send empty string if not provided
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSuccess(true);
        setFormData({
          name: '',
          date: '',
          start_time: '',
          end_time: '',
          location: '',
          
          description: ''
        });
        
        // Redirect to camps list after 2 seconds
        setTimeout(() => {
          navigate('/dashboard/camps');
        }, 2000);
      }
    } catch (err) {
      console.error('Error creating camp:', err);
      
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => {
          localStorage.clear();
          navigate('/login');
        }, 2000);
      } else if (err.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else {
        setError(err.response?.data?.error || 'Failed to create camp. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Format time for display
  const formatTimeForDisplay = (timeValue) => {
    if (!timeValue) return '';
    const option = timeOptions.find(opt => opt.value === timeValue);
    return option ? option.display : timeValue;
  };

  // Get tomorrow's date for min date input
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // If not admin, don't render
  if (userRole !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/dashboard/camps')}
            className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
          >
            <FaArrowLeft />
            <span>Back to Camps</span>
          </button>
          
          <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full">
            <FaInfoCircle className="text-green-600" />
            <span className="text-sm font-medium text-green-700">
              Admin Only
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-green-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-teal-600 px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-full">
                <FaCalendarAlt className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Create New Camp</h1>
                <p className="text-green-100 mt-1">
                  Schedule a new blood donation camp
                </p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mx-8 mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <FaCheckCircle className="text-green-500 text-xl shrink-0" />
              <div>
                <p className="text-green-700 font-medium">Camp created successfully!</p>
                <p className="text-green-600 text-sm">All volunteers will be notified 2 days before the camp.</p>
                <p className="text-green-600 text-sm mt-1">Redirecting to camps list...</p>
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
            {/* Camp Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Camp Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pl-12 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                    errors.name ? 'border-red-500 ring-red-100' : 'border-gray-200'
                  }`}
                  placeholder="e.g., Summer Blood Donation Camp 2026"
                />
                <FaHeading className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Camp Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={minDate}
                  className={`w-full px-4 py-3 pl-12 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                    errors.date ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                <FaCalendarAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            {/* Time - Two columns with AM/PM selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pl-12 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none transition-all ${
                      errors.start_time ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select start time</option>
                    {timeOptions.map((time) => (
                      <option key={time.value} value={time.value}>
                        {time.display}
                      </option>
                    ))}
                  </select>
                  <FaClock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    ▼
                  </div>
                </div>
                {errors.start_time && (
                  <p className="mt-1 text-sm text-red-600">{errors.start_time}</p>
                )}
                {formData.start_time && (
                  <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                    <FaSun /> Selected: {formatTimeForDisplay(formData.start_time)}
                  </p>
                )}
              </div>

              {/* End Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pl-12 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none transition-all ${
                      errors.end_time ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select end time</option>
                    {timeOptions.map((time) => (
                      <option key={time.value} value={time.value}>
                        {time.display}
                      </option>
                    ))}
                  </select>
                  <FaClock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    ▼
                  </div>
                </div>
                {errors.end_time && (
                  <p className="mt-1 text-sm text-red-600">{errors.end_time}</p>
                )}
                {formData.end_time && (
                  <p className="mt-1 text-xs text-purple-600 flex items-center gap-1">
                    <FaMoon /> Selected: {formatTimeForDisplay(formData.end_time)}
                  </p>
                )}
              </div>
            </div>

            {/* Location (Short name) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pl-12 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                    errors.location ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="e.g., City Community Hall"
                />
                <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>

            {/* Full Address */}
           
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-gray-400">(Optional)</span>
              </label>
              <div className="relative">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className={`w-full px-4 py-3 pl-12 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                    errors.description ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Enter any additional details about the camp..."
                />
                <FaFileAlt className="absolute left-4 top-4 text-gray-400" />
              </div>
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                Max 500 characters. {formData.description.length}/500
              </p>
            </div>

            {/* Preview Section */}
            {formData.name && formData.date && formData.location && (
              <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-4 border border-green-200">
                <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                  <FaInfoCircle className="text-green-600" />
                  Camp Preview
                </h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium text-gray-700">Name:</span> {formData.name}</p>
                  <p><span className="font-medium text-gray-700">Date:</span> {new Date(formData.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                  <p><span className="font-medium text-gray-700">Time:</span> {formatTimeForDisplay(formData.start_time)} - {formatTimeForDisplay(formData.end_time)}</p>
                  <p><span className="font-medium text-gray-700">Location:</span> {formData.location}</p>
                  
                  {formData.description && (
                    <p><span className="font-medium text-gray-700">Description:</span> {formData.description}</p>
                  )}
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <FaInfoCircle className="text-blue-600" />
                Important Information
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Volunteers will be automatically notified 2 days before the camp</li>
                <li>• You can view and manage camps from the "All Camps" section</li>
                <li>• Only administrators can create new camps</li>
                <li>• Make sure all details are correct before submitting</li>
              </ul>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard/camps')}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-medium rounded-xl hover:from-green-700 hover:to-teal-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Create Camp
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Fields marked with <span className="text-red-500">*</span> are required</p>
          <p className="mt-1">Camp will appear in the upcoming camps list for volunteers</p>
        </div>
      </div>
    </div>
  );
};

export default CreateCamp;