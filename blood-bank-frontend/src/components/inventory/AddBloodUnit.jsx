// components/inventory/AddBloodUnit.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaBoxes, 
  FaTint, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaIdCard, 
  FaSpinner, 
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowLeft,
  FaShieldAlt,
  FaFlask,
  FaThermometerHalf,
  FaTag,
  FaUser
} from 'react-icons/fa';

const AddBloodUnit = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');
  const [donors, setDonors] = useState([]);
  const [formData, setFormData] = useState({
    donor_code: '',
    components: 'whole_blood',
    volume_ml: '',
    collection_date: '',
    storage_location: '',
    status: 'available'
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
    fetchDonors();
  }, [navigate]);

  const fetchDonors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/donors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDonors(response.data);
    } catch (error) {
      console.error('Error fetching donors:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleDonorSelect = (e) => {
    const selectedDonor = donors.find(d => d._id === e.target.value);
    setFormData(prev => ({
      ...prev,
      donor_code: selectedDonor?.donor_code || ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!formData.donor_code) {
      setError('Donor code is required');
      setLoading(false);
      return;
    }

    if (!/^DON-[a-zA-Z0-9]+$/.test(formData.donor_code)) {
      setError('Invalid donor code format (should start with DON-)');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        'http://localhost:5000/api/inventory',
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
          donor_code: '',
          components: 'whole_blood',
          volume_ml: '',
          collection_date: '',
          storage_location: '',
          status: 'available'
        });
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      }
    } catch (err) {
      console.error('Error adding blood unit:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => {
          localStorage.clear();
          navigate('/login');
        }, 2000);
      } else if (err.response?.status === 403) {
        setError('Access denied. Admin or technician privileges required.');
      } else {
        setError(err.response?.data?.error || 
                err.response?.data?.message || 
                'Failed to add blood unit. Please check all fields.');
      }
    } finally {
      setLoading(false);
    }
  };

  const componentTypes = [
    { value: 'whole_blood', label: 'Whole Blood', icon: '🩸', storage: '2-6°C', shelfLife: '35 days' },
    { value: 'rbc', label: 'Red Blood Cells (RBC)', icon: '🔴', storage: '2-6°C', shelfLife: '42 days' },
    { value: 'plasma', label: 'Plasma', icon: '🟡', storage: '-18°C', shelfLife: '1 year' },
    { value: 'platelets', label: 'Platelets', icon: '⚪', storage: '20-24°C', shelfLife: '5 days' }
  ];

  const statusOptions = ['available', 'reserved', 'used', 'expired', 'discard'];

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
                <FaBoxes className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Add Blood Unit</h1>
                <p className="text-red-100 mt-1">
                  Register a new blood unit to inventory
                </p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mx-8 mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <FaCheckCircle className="text-green-500 text-xl shrink-0" />
              <div>
                <p className="text-green-700 font-medium">Blood unit added successfully!</p>
                <p className="text-green-600 text-sm">The unit has been added to inventory.</p>
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
            {/* Donor Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaUser className="text-red-500" />
                Donor Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Donor Code Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Donor Code <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="donor_code"
                      value={formData.donor_code}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="DON-XXXXX"
                    />
                    <FaIdCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Donor Select Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Donor (Optional)
                  </label>
                  <div className="relative">
                    <select
                      onChange={handleDonorSelect}
                      className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all appearance-none"
                    >
                      <option value="">Choose from list</option>
                      {donors.map(donor => (
                        <option key={donor._id} value={donor._id}>
                          {donor.donor_code} - {donor.name} ({donor.blood_type})
                        </option>
                      ))}
                    </select>
                    <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Blood Unit Details */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaFlask className="text-red-500" />
                Blood Unit Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Component Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Component Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="components"
                      value={formData.components}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all appearance-none"
                    >
                      {componentTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                    <FaTint className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  
                  {/* Component Info */}
                  {formData.components && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <FaThermometerHalf className="text-blue-600" />
                          {componentTypes.find(t => t.value === formData.components)?.storage}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt className="text-blue-600" />
                          {componentTypes.find(t => t.value === formData.components)?.shelfLife}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Volume */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Volume (ml) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="volume_ml"
                      value={formData.volume_ml}
                      onChange={handleChange}
                      required
                      min="1"
                      step="1"
                      className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="450"
                    />
                    <FaFlask className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Collection Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Collection Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="collection_date"
                      value={formData.collection_date}
                      onChange={handleChange}
                      required
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    />
                    <FaCalendarAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Storage Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Storage Location <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="storage_location"
                      value={formData.storage_location}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="A1-B2-C3"
                    />
                    <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Status */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all appearance-none"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                    <FaTag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Auto-generation Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <FaCheckCircle className="text-blue-600" />
                Auto-generated Information
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Unit number will be automatically generated (Format: UNIT-XXXXXXXX)</li>
                <li>• Blood type will be fetched from donor record</li>
                <li>• Expiry date will be calculated based on component type</li>
              </ul>
            </div>

            {/* Form Actions */}
            <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-end">
              <button
                type="button"
                onClick={() => navigate('/inventory')}
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
                    Adding...
                  </>
                ) : (
                  <>
                    <FaBoxes />
                    Add Blood Unit
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Note about required fields */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>All fields marked with <span className="text-red-500">*</span> are required</p>
        </div>
      </div>
    </div>
  );
};

export default AddBloodUnit;