import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from "../api.js";
import axios from 'axios';
import {
  FaSearch,
  FaFilter,
  FaEye,
  FaEdit,
  FaTrash,
  FaTint,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaSpinner,
  FaExclamationTriangle,
  FaUserCheck,
  FaUserTimes,
  FaDownload,
  FaPrint,
  FaTimes,
  FaSave,
  FaCheckCircle,
  FaBan,
  FaVenusMars,
  FaMapMarkerAlt,
  FaIdCard
} from 'react-icons/fa';

const DonorList = () => {
  const navigate = useNavigate();
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userRole, setUserRole] = useState('');
  const [user, setUser] = useState(null);
  
  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDonor, setEditingDonor] = useState(null);
  const [editFormData, setEditFormData] = useState({
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
  const [editLoading, setEditLoading] = useState(false);
  const [editErrors, setEditErrors] = useState({});

  // Delete Confirmation Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingDonor, setDeletingDonor] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBloodType, setSelectedBloodType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [donorsPerPage] = useState(10);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genderTypes = ['male', 'female', 'others'];

  // Check user role on mount
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userStr || !token) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(userStr);
    setUser(userData);
    setUserRole(userData.role);
    
    fetchDonors();
  }, [navigate]);

  useEffect(() => {
    filterDonors();
  }, [searchTerm, selectedBloodType, selectedStatus, donors]);

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/donors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDonors(response.data);
      setFilteredDonors(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching donors:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => {
          localStorage.clear();
          navigate('/login');
        }, 2000);
      } else {
        setError('Failed to load donors. Please refresh the page.');
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
        String(donor.phone_no).includes(searchTerm) ||
        donor.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedBloodType) {
      filtered = filtered.filter(donor => donor.blood_type === selectedBloodType);
    }

    if (selectedStatus) {
      filtered = filtered.filter(donor => 
        selectedStatus === 'eligible' ? donor.is_eligible : !donor.is_eligible
      );
    }

    setFilteredDonors(filtered);
    setCurrentPage(1);
  };

  // Edit Handlers
  const handleEditClick = (donor) => {
    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };

    setEditingDonor(donor);
    setEditFormData({
      name: donor.name || '',
      email: donor.email || '',
      phone_no: donor.phone_no || '',         // ✅ keep as number
      blood_type: donor.blood_type || '',
      gender: donor.gender || '',
      date_of_birth: formatDateForInput(donor.date_of_birth),
      address: donor.address || '',
      last_donation: formatDateForInput(donor.last_donation),
      total_donations: donor.total_donations || 0,
      is_eligible: donor.is_eligible !== undefined ? donor.is_eligible : true
    });
    setEditErrors({});
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (editErrors[name]) {
      setEditErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateEditForm = () => {
    const errors = {};
    
    if (!editFormData.name?.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!editFormData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(editFormData.email)) {
      errors.email = 'Invalid email format';
    }
    
    // ✅ Fixed: use String() instead of .trim() directly on number
    if (!editFormData.phone_no) {
      errors.phone_no = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(String(editFormData.phone_no))) {
      errors.phone_no = 'Invalid Indian mobile number (10 digits starting with 6-9)';
    }
    
    if (!editFormData.blood_type) {
      errors.blood_type = 'Blood type is required';
    }
    
    if (!editFormData.gender) {
      errors.gender = 'Gender is required';
    }
    
    if (!editFormData.date_of_birth) {
      errors.date_of_birth = 'Date of birth is required';
    }
    
    if (!editFormData.address?.trim()) {
      errors.address = 'Address is required';
    }
    
    if (editFormData.total_donations < 0) {
      errors.total_donations = 'Total donations must be a positive number';
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
        email: editFormData.email.trim(),
        phone_no: Number(editFormData.phone_no),   // ✅ send as number
        blood_type: editFormData.blood_type,
        gender: editFormData.gender,
        date_of_birth: editFormData.date_of_birth,
        address: editFormData.address.trim(),
        last_donation: editFormData.last_donation || null,
        total_donations: parseInt(editFormData.total_donations) || 0,
        is_eligible: editFormData.is_eligible
      };

      console.log('Updating donor:', editingDonor.donor_code);
      console.log('Update data:', updateData);
      
      const response = await axios.put(
        `${API_URL}/api/donors/${editingDonor.donor_code}`,
        updateData,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Update response:', response.data);

      await fetchDonors();
      
      setSuccess('Donor updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
      setShowEditModal(false);
      setEditingDonor(null);
      
    } catch (err) {
      console.error('Error updating donor:', err);
      
      if (err.response) {
        console.error('Error response data:', err.response.data);
        
        if (err.response.data.error) {
          if (Array.isArray(err.response.data.error)) {
            const backendErrors = {};
            err.response.data.error.forEach(errItem => {
              if (errItem.path) {
                backendErrors[errItem.path] = errItem.msg;
              } else {
                backendErrors.form = errItem.msg || 'Validation failed';
              }
            });
            setEditErrors(backendErrors);
          } else {
            setEditErrors({ form: err.response.data.error });
          }
        } else if (err.response.data.message) {
          setEditErrors({ form: err.response.data.message });
        } else {
          setEditErrors({ form: 'Failed to update donor' });
        }
      } else if (err.request) {
        setEditErrors({ form: 'Cannot connect to server. Please check your connection.' });
      } else {
        setEditErrors({ form: 'Failed to update donor. Please try again.' });
      }
    } finally {
      setEditLoading(false);
    }
  };

  // Delete Handlers
  const handleDeleteClick = (donor) => {
    setDeletingDonor(donor);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDonor) return;

    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_URL}/api/donors/${deletingDonor.donor_code}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      await fetchDonors();
      
      setSuccess('Donor deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
      setShowDeleteModal(false);
      setDeletingDonor(null);
      
    } catch (err) {
      console.error('Error deleting donor:', err);
      setError(err.response?.data?.error || 'Failed to delete donor');
      setTimeout(() => setError(''), 3000);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewDonor = (donorCode) => {
    navigate(`/dashboard/donors/${donorCode}`);
  };

  const handleRecordDonation = (donorCode) => {
    navigate(`/dashboard/donors/record-donation`, { state: { donorCode } });
  };

  const exportToCSV = () => {
    const headers = ['Donor Code', 'Name', 'Email', 'Phone', 'Blood Type', 'Gender', 'DOB', 'Address', 'Last Donation', 'Total Donations', 'Status'];
    const csvData = filteredDonors.map(donor => [
      donor.donor_code,
      donor.name,
      donor.email,
      donor.phone_no,
      donor.blood_type,
      donor.gender,
      donor.date_of_birth ? new Date(donor.date_of_birth).toLocaleDateString() : 'N/A',
      donor.address,
      donor.last_donation ? new Date(donor.last_donation).toLocaleDateString() : 'Never',
      donor.total_donations || 0,
      donor.is_eligible ? 'Eligible' : 'Ineligible'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donors_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
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
          <p className="text-gray-600">Loading donors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Donor Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Total Donors: <span className="font-semibold text-red-600">{donors.length}</span>
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaDownload />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPrint />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button
            onClick={() => navigate('/dashboard/donors/register')}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FaUserCheck />
            <span>Register New</span>
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by name, code, phone, or email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedBloodType}
            onChange={(e) => setSelectedBloodType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">All Blood Types</option>
            {bloodTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">All Status</option>
            <option value="eligible">Eligible Only</option>
            <option value="ineligible">Ineligible Only</option>
          </select>
          
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedBloodType('');
              setSelectedStatus('');
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-600 mb-4">
        Showing {currentDonors.length} of {filteredDonors.length} donors
      </p>

      {/* Donors Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Donor Code</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Blood Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contact</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Last Donation</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentDonors.length > 0 ? (
              currentDonors.map((donor) => (
                <tr key={donor._id} className="hover:bg-gray-50 transition-colors">
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
                      <span className="text-sm text-gray-400">Never</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      donor.is_eligible 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {donor.is_eligible ? 'Eligible' : 'Ineligible'}
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
                        onClick={() => handleEditClick(donor)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Edit Donor"
                      >
                        <FaEdit />
                      </button>
                      
                      <button
                        onClick={() => handleRecordDonation(donor.donor_code)}
                        className="p-1 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                        title="Record Donation"
                      >
                        <FaTint />
                      </button>
                      
                      {userRole === 'admin' && (
                        <button
                          onClick={() => handleDeleteClick(donor)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete Donor"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  No donors found matching your criteria.
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
            Showing {indexOfFirstDonor + 1} to {Math.min(indexOfLastDonor, filteredDonors.length)} of {filteredDonors.length} donors
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
            <span className="px-4 py-2 bg-red-600 text-white rounded-lg">
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

      {/* Edit Donor Modal */}
      {showEditModal && editingDonor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-4 rounded-t-2xl flex items-center justify-between sticky top-0">
              <h2 className="text-xl font-bold text-white">Edit Donor</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {/* Donor Info */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600">Donor Code</p>
                <p className="font-mono font-medium">{editingDonor.donor_code}</p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    editErrors.name ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {editErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{editErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditChange}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    editErrors.email ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {editErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{editErrors.email}</p>
                )}
              </div>

              {/* Phone - type="number" */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="number"       
                  name="phone_no"
                  value={editFormData.phone_no}
                  onChange={handleEditChange}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    editErrors.phone_no ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {editErrors.phone_no && (
                  <p className="mt-1 text-sm text-red-600">{editErrors.phone_no}</p>
                )}
              </div>

              {/* Blood Type and Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Type *
                  </label>
                  <select
                    name="blood_type"
                    value={editFormData.blood_type}
                    onChange={handleEditChange}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      editErrors.blood_type ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select Blood Type</option>
                    {bloodTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {editErrors.blood_type && (
                    <p className="mt-1 text-sm text-red-600">{editErrors.blood_type}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={editFormData.gender}
                    onChange={handleEditChange}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      editErrors.gender ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select Gender</option>
                    {genderTypes.map(gender => (
                      <option key={gender} value={gender}>
                        {gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </option>
                    ))}
                  </select>
                  {editErrors.gender && (
                    <p className="mt-1 text-sm text-red-600">{editErrors.gender}</p>
                  )}
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={editFormData.date_of_birth}
                  onChange={handleEditChange}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    editErrors.date_of_birth ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {editErrors.date_of_birth && (
                  <p className="mt-1 text-sm text-red-600">{editErrors.date_of_birth}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <textarea
                  name="address"
                  value={editFormData.address}
                  onChange={handleEditChange}
                  rows="3"
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    editErrors.address ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {editErrors.address && (
                  <p className="mt-1 text-sm text-red-600">{editErrors.address}</p>
                )}
              </div>

              {/* Last Donation Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Donation Date (Optional)
                </label>
                <input
                  type="date"
                  name="last_donation"
                  value={editFormData.last_donation}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Total Donations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Donations
                </label>
                <input
                  type="number"
                  name="total_donations"
                  value={editFormData.total_donations}
                  onChange={handleEditChange}
                  min="0"
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    editErrors.total_donations ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {editErrors.total_donations && (
                  <p className="mt-1 text-sm text-red-600">{editErrors.total_donations}</p>
                )}
              </div>

              {/* Eligibility */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_eligible"
                  id="is_eligible"
                  checked={editFormData.is_eligible}
                  onChange={handleEditChange}
                  className="w-4 h-4 text-red-600"
                />
                <label htmlFor="is_eligible" className="text-sm font-medium text-gray-700">
                  Donor is eligible to donate
                </label>
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
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 disabled:opacity-70 flex items-center justify-center gap-2"
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
      {showDeleteModal && deletingDonor && (
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
                  Are you sure you want to delete donor <span className="font-bold">{deletingDonor.name}</span>?
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                <p className="text-sm"><span className="font-medium">Donor Code:</span> {deletingDonor.donor_code}</p>
                <p className="text-sm"><span className="font-medium">Blood Type:</span> {deletingDonor.blood_type}</p>
                <p className="text-sm"><span className="font-medium">Phone:</span> {deletingDonor.phone_no}</p>
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
                      Delete Donor
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

export default DonorList;