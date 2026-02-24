import React, { useState } from 'react';  // Removed useEffect
import { useNavigate } from 'react-router-dom';
import API_URL from "../api.js";
import axios from 'axios';
import {
  FaClipboardList,
  FaUser,
  FaPhone,
  FaHospital,
  FaUserMd,
  FaTint,
  FaWeight,
  FaExclamationTriangle,
  FaSpinner,
  FaCheckCircle,
  FaArrowLeft,
  FaSave,
  FaStethoscope,
  FaClock,
  FaHourglassHalf,
  FaExclamationCircle
} from 'react-icons/fa';

const RequestRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    requester_name: '',
    requester_contact: '',
    hospital_name: '',
    patient_name: '',
    blood_type: '',
    units_needed: 1,
    urgency: 'normal',
    notes: ''
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencyLevels = [
    { value: 'normal', label: 'Normal', icon: FaClock, color: 'blue' },
    { value: 'urgent', label: 'Urgent', icon: FaHourglassHalf, color: 'orange' },
    { value: 'critical', label: 'Critical', icon: FaExclamationCircle, color: 'red' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 1;
    setFormData(prev => ({
      ...prev,
      [name]: Math.max(1, numValue)
    }));
  };

  const validateForm = () => {
    if (!formData.requester_name.trim()) {
      setError('Requester name is required');
      return false;
    }
    if (!formData.requester_contact.trim()) {
      setError('Contact number is required');
      return false;
    }
    if (!formData.hospital_name.trim()) {
      setError('Hospital name is required');
      return false;
    }
    if (!formData.blood_type) {
      setError('Blood type is required');
      return false;
    }
    if (formData.units_needed < 1) {
      setError('Units needed must be at least 1');
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
      // PUBLIC ROUTE - No token needed
      const response = await axios.post(
        `${API_URL}/api/requests`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201) {
        setSuccess(true);
        
        // Reset form
        setFormData({
          requester_name: '',
          requester_contact: '',
          hospital_name: '',
          patient_name: '',
          blood_type: '',
          units_needed: 1,
          urgency: 'normal',
          notes: ''
        });

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      }
    } catch (err) {
      console.error('Error creating request:', err);
      if (err.response?.status === 400) {
        const errors = err.response.data.errors;
        if (errors && errors.length > 0) {
          setError(errors[0].msg || 'Validation failed');
        } else {
          setError(err.response.data.error || 'Invalid request data');
        }
      } else {
        setError('Failed to create request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case 'critical': return 'bg-red-600 hover:bg-red-700';
      case 'urgent': return 'bg-orange-600 hover:bg-orange-700';
      default: return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 p-3 rounded-full">
            <FaClipboardList className="text-red-600 text-2xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Blood Request</h2>
            <p className="text-sm text-gray-600">Create a new blood request</p>
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
            <p className="text-green-700 font-medium">Request created successfully!</p>
            <p className="text-green-600 text-sm">The blood request has been submitted.</p>
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Requester Information */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaUser className="text-red-500" />
            Requester Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Requester Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requester Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="requester_name"
                  value={formData.requester_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter requester name"
                />
                <FaUser className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            {/* Requester Contact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="requester_contact"
                  value={formData.requester_contact}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
                <FaPhone className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Hospital & Patient Information */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaHospital className="text-red-500" />
            Hospital & Patient Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hospital Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hospital Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="hospital_name"
                  value={formData.hospital_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter hospital name"
                />
                <FaHospital className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            {/* Patient Name (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient Name <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="patient_name"
                  value={formData.patient_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter patient name"
                />
                <FaUserMd className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Blood Request Details */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaTint className="text-red-500" />
            Blood Request Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none"
                >
                  <option value="">Select Blood Type</option>
                  {bloodTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <FaTint className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            {/* Units Needed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Units Needed <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="units_needed"
                  value={formData.units_needed}
                  onChange={handleNumberChange}
                  min="1"
                  required
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <FaWeight className="absolute left-3 top-3 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum: 1 unit</p>
            </div>

            {/* Urgency Level */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgency Level
              </label>
              <div className="flex flex-wrap gap-3">
                {urgencyLevels.map((level) => {
                  const Icon = level.icon;
                  const isSelected = formData.urgency === level.value;
                  
                  let buttonClass = 'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ';
                  
                  if (isSelected) {
                    switch(level.value) {
                      case 'critical':
                        buttonClass += 'bg-red-600 border-red-600 text-white';
                        break;
                      case 'urgent':
                        buttonClass += 'bg-orange-600 border-orange-600 text-white';
                        break;
                      default:
                        buttonClass += 'bg-blue-600 border-blue-600 text-white';
                    }
                  } else {
                    switch(level.value) {
                      case 'critical':
                        buttonClass += 'bg-white border-red-200 text-red-700 hover:bg-red-50';
                        break;
                      case 'urgent':
                        buttonClass += 'bg-white border-orange-200 text-orange-700 hover:bg-orange-50';
                        break;
                      default:
                        buttonClass += 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50';
                    }
                  }
                  
                  return (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, urgency: level.value }))}
                      className={buttonClass}
                    >
                      <Icon className="text-lg" />
                      <span className="font-medium">{level.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaStethoscope className="text-red-500" />
            Additional Notes
          </h3>

          <div>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter any additional information or special requirements..."
            />
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
            className={`px-8 py-3 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 min-w-48 ${getUrgencyColor(formData.urgency)}`}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FaSave />
                Create Request
              </>
            )}
          </button>
        </div>
      </form>

      {/* Note about request code */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Request code will be automatically generated upon submission</p>
        <p className="mt-1">All fields marked with <span className="text-red-500">*</span> are required</p>
      </div>
    </div>
  );
};

export default RequestRegistration;