// components/volunteers/VolunteerList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from "../api.js";
import axios from 'axios';
import { 
  FaUsers, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaSpinner,
  FaSearch,
  FaSync,
  FaUserPlus,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaExclamationTriangle,
  FaTimes,
  FaSave,
  FaTimesCircle
} from 'react-icons/fa';

const VolunteerList = () => {
  const navigate = useNavigate();
  const [volunteers, setVolunteers] = useState([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState('');
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [volunteerToEdit, setVolunteerToEdit] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState('');
  
  // Edit form data
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    skills: '',
    availability: '',
    emergencyContact: '',
    emergencyPhone: ''
  });
  
  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [volunteerToDelete, setVolunteerToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(user);
    setUserRole(userData.role);
    fetchVolunteers();
  }, [navigate]);

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/volunteers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setVolunteers(response.data.volunteers);
      setFilteredVolunteers(response.data.volunteers);
    } catch (err) {
      setError('Failed to load volunteers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = volunteers.filter(v => 
      v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVolunteers(filtered);
  }, [searchTerm, volunteers]);

  const handleView = (id) => {
    navigate(`/volunteers/${id}`);
  };

  // Edit functions
  const openEditModal = (volunteer) => {
    setVolunteerToEdit(volunteer);
    setEditFormData({
      name: volunteer.name || '',
      email: volunteer.email || '',
      phone: volunteer.phone || '',
      address: volunteer.address || '',
      city: volunteer.city || '',
      state: volunteer.state || '',
      pincode: volunteer.pincode || '',
      skills: volunteer.skills || '',
      availability: volunteer.availability || '',
      emergencyContact: volunteer.emergencyContact || '',
      emergencyPhone: volunteer.emergencyPhone || ''
    });
    setEditError('');
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setVolunteerToEdit(null);
    setEditError('');
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!volunteerToEdit) return;

    setEditing(true);
    setEditError('');

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/volunteers/${volunteerToEdit._id}`,
        editFormData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      await fetchVolunteers(); // Refresh the list
      closeEditModal();
    } catch (err) {
      setEditError(err.response?.data?.error || 'Failed to update volunteer');
    } finally {
      setEditing(false);
    }
  };

  const openDeleteModal = (volunteer) => {
    setVolunteerToDelete(volunteer);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setVolunteerToDelete(null);
  };

  const handleDelete = async () => {
    if (!volunteerToDelete) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/volunteers/${volunteerToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchVolunteers();
      closeDeleteModal();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete volunteer');
    } finally {
      setDeleting(false);
    }
  };

  // Edit Modal Component
  const EditModal = () => {
    if (!showEditModal || !volunteerToEdit) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={closeEditModal}
        ></div>

        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-900">Edit Volunteer</h3>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {editError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {editError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Information */}
                <div className="col-span-2">
                  <h4 className="font-medium text-gray-700 mb-2">Basic Information</h4>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editFormData.phone}
                    onChange={handleEditInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                  <input
                    type="text"
                    name="skills"
                    value={editFormData.skills}
                    onChange={handleEditInputChange}
                    placeholder="e.g., First Aid, Teaching"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                  <input
                    type="text"
                    name="availability"
                    value={editFormData.availability}
                    onChange={handleEditInputChange}
                    placeholder="e.g., Weekends, Evenings"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Address Information */}
                <div className="col-span-2 mt-2">
                  <h4 className="font-medium text-gray-700 mb-2">Address Information</h4>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={editFormData.address}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={editFormData.city}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={editFormData.state}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={editFormData.pincode}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Emergency Contact */}
                <div className="col-span-2 mt-2">
                  <h4 className="font-medium text-gray-700 mb-2">Emergency Contact</h4>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={editFormData.emergencyContact}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Phone</label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={editFormData.emergencyPhone}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  disabled={editing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editing}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  {editing ? (
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
      </div>
    );
  };

  // Delete Confirmation Modal
  const DeleteModal = () => {
    if (!showDeleteModal) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={closeDeleteModal}
        ></div>

        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:max-w-lg w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2 text-red-600">
                <FaExclamationTriangle className="text-xl" />
                <h3 className="text-lg font-semibold">Delete Volunteer</h3>
              </div>
              <button
                onClick={closeDeleteModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete this volunteer?
              </p>
              {volunteerToDelete && (
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <p className="font-medium text-gray-900">{volunteerToDelete.name}</p>
                  <p className="text-sm text-gray-600">{volunteerToDelete.email}</p>
                </div>
              )}
              <p className="text-sm text-red-600">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {deleting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FaUsers className="text-green-600" />
            Volunteer Management
          </h1>
          
          <div className="flex items-center gap-4">
            <button
              onClick={fetchVolunteers}
              className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              title="Refresh"
            >
              <FaSync className={loading ? 'animate-spin' : ''} />
            </button>
            
            
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <input
            type="text"
            placeholder="Search volunteers by name, email, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-12 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
          />
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        {/* Volunteers Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <FaSpinner className="animate-spin text-4xl text-green-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading volunteers...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-xl text-red-700 border border-red-200">
            {error}
          </div>
        ) : filteredVolunteers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow">
            <FaUsers className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No volunteers found</p>
            {searchTerm && (
              <p className="text-gray-500 mt-2">Try adjusting your search term</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVolunteers.map((volunteer) => (
              <div 
                key={volunteer._id} 
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="bg-gradient-to-r from-green-600 to-teal-600 px-4 py-3 flex justify-between items-center">
                  <h3 className="text-white font-semibold truncate">{volunteer.name}</h3>
                  <div className="flex gap-2">
                    
                    {(userRole === 'admin' || userRole === 'technician') && (
                      <>
                        <button
                          onClick={() => openEditModal(volunteer)}
                          className="text-white hover:text-green-200 transition-colors p-1"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        {userRole === 'admin' && (
                          <button
                            onClick={() => openDeleteModal(volunteer)}
                            className="text-white hover:text-red-200 transition-colors p-1"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaEnvelope className="text-green-600 flex-shrink-0" />
                    <span className="text-sm truncate">{volunteer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaPhone className="text-green-600 flex-shrink-0" />
                    <span className="text-sm">{volunteer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaMapMarkerAlt className="text-green-600 flex-shrink-0" />
                    <span className="text-sm truncate">
                      {volunteer.city}, {volunteer.state} {volunteer.pincode}
                    </span>
                  </div>
                  
                  
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <EditModal />
      <DeleteModal />
    </div>
  );
};

export default VolunteerList;