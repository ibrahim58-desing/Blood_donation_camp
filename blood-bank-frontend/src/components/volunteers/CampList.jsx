// components/volunteers/CampList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaMapMarkerAlt, 
  FaPlus,
  FaSpinner,
  FaSync,
  FaCheckCircle,
  FaHourglassHalf,
  FaEnvelope,
  FaEdit,
  FaTrash,
  FaEye,
  FaTimes,
  FaSave,
  FaExclamationTriangle,
  FaHome,
  FaFileAlt
} from 'react-icons/fa';

const CampList = () => {
  const navigate = useNavigate();
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userRole, setUserRole] = useState('');

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCamp, setEditingCamp] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    date: '',
    start_time: '',
    end_time: '',
    location: '',
   
    description: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editErrors, setEditErrors] = useState({});

  // Delete Confirmation Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCamp, setDeletingCamp] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Time options for edit modal
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

  // Format time for display
  const formatTimeForDisplay = (timeValue) => {
    if (!timeValue) return '';
    const option = timeOptions.find(opt => opt.value === timeValue);
    return option ? option.display : timeValue;
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(user);
    setUserRole(userData.role);
    fetchCamps();
  }, [navigate]);

  const fetchCamps = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/camps', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCamps(response.data.camps);
    } catch (err) {
      setError('Failed to load camps');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerReminders = async (campId) => {
    if (!window.confirm('Send reminder emails to all volunteers for this camp?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/volunteers/trigger-cron`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess(`Reminders sent to ${response.data.emails_sent} volunteers!`);
      setTimeout(() => setSuccess(''), 3000);
      fetchCamps();
    } catch (err) {
      setError('Failed to send reminders');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Edit Handlers
  const handleEditClick = (camp) => {
    // Format date for input field (YYYY-MM-DD)
    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };

    setEditingCamp(camp);
    setEditFormData({
      name: camp.name || '',
      date: formatDateForInput(camp.date),
      start_time: camp.start_time || '',
      end_time: camp.end_time || '',
      location: camp.location || '',
      description: camp.description || ''
    });
    setEditErrors({});
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (editErrors[name]) {
      setEditErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateEditForm = () => {
    const errors = {};

    if (!editFormData.name.trim()) {
      errors.name = 'Camp name is required';
    }

    if (!editFormData.date) {
      errors.date = 'Camp date is required';
    } else {
      const selectedDate = new Date(editFormData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.date = 'Camp date cannot be in the past';
      }
    }

    if (!editFormData.start_time) {
      errors.start_time = 'Start time is required';
    }

    if (!editFormData.end_time) {
      errors.end_time = 'End time is required';
    }

    if (editFormData.start_time && editFormData.end_time) {
      if (editFormData.start_time >= editFormData.end_time) {
        errors.end_time = 'End time must be after start time';
      }
    }

    if (!editFormData.location.trim()) {
      errors.location = 'Location name is required';
    }

    

    return errors;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateEditForm();
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    setEditLoading(true);
    setEditErrors({});

    try {
      const token = localStorage.getItem('token');
      
      const updateData = {
        name: editFormData.name.trim(),
        date: editFormData.date,
        start_time: editFormData.start_time,
        end_time: editFormData.end_time,
        location: editFormData.location.trim(),
       
        description: editFormData.description.trim() || ''
      };

      console.log('Updating camp:', editingCamp._id);
      console.log('Update data:', updateData);

      const response = await axios.put(
        `http://localhost:5000/api/camps/${editingCamp._id}`,
        updateData,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Update response:', response.data);

      await fetchCamps();
      
      setSuccess('Camp updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
      setShowEditModal(false);
      setEditingCamp(null);
      
    } catch (err) {
      console.error('Error updating camp:', err);
      
      if (err.response) {
        setEditErrors({ 
          form: err.response.data?.error || err.response.data?.message || 'Failed to update camp' 
        });
      } else if (err.request) {
        setEditErrors({ form: 'Cannot connect to server. Please check your connection.' });
      } else {
        setEditErrors({ form: 'Failed to update camp. Please try again.' });
      }
    } finally {
      setEditLoading(false);
    }
  };

  // Delete Handlers
  const handleDeleteClick = (camp) => {
    setDeletingCamp(camp);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCamp) return;

    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `http://localhost:5000/api/camps/${deletingCamp._id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      await fetchCamps();
      
      setSuccess('Camp deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
      setShowDeleteModal(false);
      setDeletingCamp(null);
      
    } catch (err) {
      console.error('Error deleting camp:', err);
      
      if (err.response?.status === 400) {
        setError('Cannot delete camp with assigned volunteers. Remove volunteers first.');
      } else {
        setError(err.response?.data?.error || 'Failed to delete camp');
      }
      setTimeout(() => setError(''), 3000);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusBadge = (camp) => {
    const today = new Date();
    const campDate = new Date(camp.date);
    const diffDays = Math.ceil((campDate - today) / (1000 * 60 * 60 * 24));

    if (camp.reminders_sent) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
          <FaCheckCircle /> Notified
        </span>
      );
    } else if (diffDays === 2) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
          <FaHourglassHalf /> Ready to notify
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
          <FaClock /> {diffDays < 0 ? 'Past' : `${diffDays} days left`}
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <FaCheckCircle className="text-green-500 text-xl shrink-0" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <FaExclamationTriangle className="text-red-500 text-xl shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Blood Donation Camps</h1>
          
          <div className="flex items-center gap-4">
            <button
              onClick={fetchCamps}
              className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg"
              title="Refresh"
            >
              <FaSync className={loading ? 'animate-spin' : ''} />
            </button>
            
            {userRole === 'admin' && (
              <button
                onClick={() => navigate('/dashboard/camps/create')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <FaPlus />
                Create Camp
              </button>
            )}
          </div>
        </div>

        {/* Camps Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <FaSpinner className="animate-spin text-4xl text-green-600" />
          </div>
        ) : error && !camps.length ? (
          <div className="bg-red-50 p-4 rounded-xl text-red-700">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {camps.map((camp) => (
              <div key={camp._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-green-600 to-teal-600 px-4 py-3 flex justify-between items-center">
                  <h3 className="text-white font-semibold truncate">{camp.name}</h3>
                  <div className="flex gap-2">
                    {/* Edit button - visible to both admin and technician */}
                    <button
                      onClick={() => handleEditClick(camp)}
                      className="text-white hover:text-green-200 transition-colors"
                      title="Edit Camp"
                    >
                      <FaEdit />
                    </button>
                    
                    {/* Delete button - admin only */}
                    {userRole === 'admin' && (
                      <button
                        onClick={() => handleDeleteClick(camp)}
                        className="text-white hover:text-red-200 transition-colors"
                        title="Delete Camp"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaCalendarAlt className="text-green-600" />
                    <span>{new Date(camp.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaClock className="text-green-600" />
                    <span>{formatTimeForDisplay(camp.start_time)} - {formatTimeForDisplay(camp.end_time)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaMapMarkerAlt className="text-green-600" />
                    <span className="truncate" title={camp.address || camp.location}>
                      {camp.location}
                    </span>
                  </div>

                  {camp.address && camp.address !== camp.location && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <FaHome className="text-green-500 text-xs" />
                      <span className="truncate text-xs" title={camp.address}>
                        {camp.address}
                      </span>
                    </div>
                  )}

                  {camp.description && (
                    <div className="flex items-start gap-2 text-gray-500 text-sm mt-1">
                      <FaFileAlt className="text-green-500 text-xs mt-1" />
                      <p className="text-xs line-clamp-2">{camp.description}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                    {getStatusBadge(camp)}
                    
                    {userRole === 'admin' && !camp.reminders_sent && (
                      <button
                        onClick={() => handleTriggerReminders(camp._id)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                        title="Send reminders now"
                      >
                        <FaEnvelope />
                        Send
                      </button>
                    )}

                    {camp.reminders_sent && (
                      <span className="text-xs text-green-600">
                        Reminders sent
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {camps.length === 0 && (
              <div className="col-span-full text-center py-20 bg-white rounded-xl">
                <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No Camps Found</h3>
                <p className="text-gray-500 mb-6">There are no blood donation camps scheduled yet.</p>
                {userRole === 'admin' && (
                  <button
                    onClick={() => navigate('/dashboard/camps/create')}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2"
                  >
                    <FaPlus />
                    Create Your First Camp
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Camp Modal */}
      {showEditModal && editingCamp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4 rounded-t-2xl flex items-center justify-between sticky top-0">
              <h2 className="text-xl font-bold text-white">Edit Camp</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {/* Camp Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Camp Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    editErrors.name ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {editErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{editErrors.name}</p>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Camp Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={editFormData.date}
                  onChange={handleEditChange}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    editErrors.date ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {editErrors.date && (
                  <p className="mt-1 text-sm text-red-600">{editErrors.date}</p>
                )}
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <select
                    name="start_time"
                    value={editFormData.start_time}
                    onChange={handleEditChange}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      editErrors.start_time ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select time</option>
                    {timeOptions.map(time => (
                      <option key={time.value} value={time.value}>
                        {time.display}
                      </option>
                    ))}
                  </select>
                  {editErrors.start_time && (
                    <p className="mt-1 text-sm text-red-600">{editErrors.start_time}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time *
                  </label>
                  <select
                    name="end_time"
                    value={editFormData.end_time}
                    onChange={handleEditChange}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      editErrors.end_time ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select time</option>
                    {timeOptions.map(time => (
                      <option key={time.value} value={time.value}>
                        {time.display}
                      </option>
                    ))}
                  </select>
                  {editErrors.end_time && (
                    <p className="mt-1 text-sm text-red-600">{editErrors.end_time}</p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location Name *
                </label>
                <input
                  type="text"
                  name="location"
                  value={editFormData.location}
                  onChange={handleEditChange}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    editErrors.location ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {editErrors.location && (
                  <p className="mt-1 text-sm text-red-600">{editErrors.location}</p>
                )}
              </div>

              {/* Address */}
              

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditChange}
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Form Error */}
              {editErrors.form && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{editErrors.form}</p>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {editLoading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingCamp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="bg-red-600 px-6 py-4 rounded-t-2xl">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FaExclamationTriangle />
                Confirm Delete
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-red-50 p-4 rounded-xl">
                <p className="text-red-700 font-medium mb-2">
                  ⚠️ This action cannot be undone!
                </p>
                <p className="text-sm text-red-600">
                  Are you sure you want to delete the camp <span className="font-bold">{deletingCamp.name}</span>?
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                <p className="text-sm"><span className="font-medium">Date:</span> {new Date(deletingCamp.date).toLocaleDateString()}</p>
                <p className="text-sm"><span className="font-medium">Location:</span> {deletingCamp.location}</p>
                {deletingCamp.volunteers?.length > 0 && (
                  <p className="text-sm text-yellow-600">
                    <span className="font-medium">Note:</span> This camp has {deletingCamp.volunteers.length} assigned volunteers.
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {deleteLoading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash />
                      Delete Camp
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampList;