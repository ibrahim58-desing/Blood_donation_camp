// components/requests/BloodRequestList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaClipboardList,
  FaSpinner,
  FaSearch,
  FaFilter,
  FaEye,
  FaTimes,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaUser,
  FaTint,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaSyringe,
  FaHeartbeat,
  FaNotesMedical,
  FaArrowLeft,
  FaShieldAlt,
  FaSync,
  FaDownload,
  FaPrint,
  FaChevronLeft,
  FaChevronRight,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaCheck,
  FaBan,
  FaHourglassHalf,
  FaThumbsUp,
  FaThumbsDown,
  FaCheckDouble,
  FaUndo,
  FaEdit
} from 'react-icons/fa';

const BloodRequestList = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userRole, setUserRole] = useState('');
  const [user, setUser] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [requestsPerPage] = useState(10);
  
  // Filters
  const [filters, setFilters] = useState({
    blood_type: '',
    status: '',
    urgency: '',
    search: '',
    dateFrom: '',
    dateTo: ''
  });
  
  // Sorting
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });

  // Details Modal
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [editFormData, setEditFormData] = useState({
    patient_name: '',
    patient_age: '',
    patient_gender: '',
    blood_type: '',
    units_required: '',
    urgency: 'routine',
    hospital: '',
    ward_number: '',
    doctor_name: '',
    hospital_contact: '',
    requested_by: '',
    requester_contact: '',
    requester_email: '',
    requester_role: '',
    diagnosis: '',
    notes: ''
  });
  const [editErrors, setEditErrors] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  // Confirmation Modal for status changes
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmRequest, setConfirmRequest] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    fulfilled: 0,
    rejected: 0,
    cancelled: 0,
    urgent: 0
  });

  // Check if user is admin or technician
  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
      navigate('/login');
      return;
    }

    try {
      const userData = JSON.parse(user);
      setUser(userData);
      
      // Only allow admin or technician
      if (userData.role !== 'admin' && userData.role !== 'technician') {
        navigate('/');
        return;
      }

      setUserRole(userData.role);
      fetchRequests();
    } catch (err) {
      console.error('Error parsing user data:', err);
      navigate('/login');
    }
  }, [navigate]);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching requests...');
      
      const response = await axios.get('http://localhost:5000/api/requests', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API Response:', response.data);
      
      if (Array.isArray(response.data)) {
        setRequests(response.data);
        calculateStats(response.data);
        applyFilters(response.data, filters, sortConfig);
      } else {
        console.error('Response is not an array:', response.data);
        setError('Invalid data format received from server');
      }
      
    } catch (err) {
      console.error('Error fetching requests:', err);
      handleFetchError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchError = (err) => {
    if (err.response) {
      if (err.response.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => {
          localStorage.clear();
          navigate('/login');
        }, 2000);
      } else if (err.response.status === 403) {
        setError('Access denied. Admin or technician privileges required.');
      } else {
        setError(err.response.data?.error || 'Failed to load requests');
      }
    } else if (err.request) {
      setError('Cannot connect to server. Please check your connection.');
    } else {
      setError('Failed to make request. Please try again.');
    }
  };

  const fetchRequestDetails = async (id) => {
    setDetailsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/requests/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setSelectedRequest(response.data);
      setShowDetailsModal(true);
      
    } catch (err) {
      console.error('Error fetching request details:', err);
      setError('Failed to load request details');
      setTimeout(() => setError(''), 3000);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Status Update Handlers
  const handleStatusUpdate = (request, action) => {
    setConfirmRequest(request);
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  const executeStatusUpdate = async () => {
    if (!confirmRequest || !confirmAction) return;

    setConfirmLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      let response;
      
      switch(confirmAction) {
        case 'approve':
          response = await axios.put(
            `http://localhost:5000/api/requests/${confirmRequest._id}/approve`,
            {},
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          setSuccess(`Request #${confirmRequest._id.slice(-6)} approved successfully!`);
          break;
          
        case 'reject':
          response = await axios.put(
            `http://localhost:5000/api/requests/${confirmRequest._id}/reject`,
            {},
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          setSuccess(`Request #${confirmRequest._id.slice(-6)} rejected.`);
          break;
          
        case 'fulfill':
          response = await axios.put(
            `http://localhost:5000/api/requests/${confirmRequest._id}/fulfill`,
            {},
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          setSuccess(`Request #${confirmRequest._id.slice(-6)} marked as fulfilled!`);
          break;
          
        case 'cancel':
          response = await axios.put(
            `http://localhost:5000/api/requests/${confirmRequest._id}/cancel`,
            {},
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          setSuccess(`Request #${confirmRequest._id.slice(-6)} cancelled.`);
          break;
          
        default:
          return;
      }
      
      console.log('Status update response:', response.data);
      
      // Refresh the list
      await fetchRequests();
      
      // Close modal
      setShowConfirmModal(false);
      setConfirmRequest(null);
      setConfirmAction(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('Error updating request status:', err);
      setError(err.response?.data?.error || `Failed to ${confirmAction} request`);
      setTimeout(() => setError(''), 3000);
    } finally {
      setConfirmLoading(false);
    }
  };

  // Edit Handlers
  const handleEditClick = (request) => {
    setEditingRequest(request);
    setEditFormData({
      patient_name: request.patient_name || '',
      patient_age: request.patient_age || '',
      patient_gender: request.patient_gender || '',
      blood_type: request.blood_type || '',
      units_required: request.units_required || '',
      urgency: request.urgency || 'routine',
      hospital: request.hospital || '',
      ward_number: request.ward_number || '',
      doctor_name: request.doctor_name || '',
      hospital_contact: request.hospital_contact || '',
      requested_by: request.requested_by || '',
      requester_contact: request.requester_contact || '',
      requester_email: request.requester_email || '',
      requester_role: request.requester_role || '',
      diagnosis: request.diagnosis || '',
      notes: request.notes || ''
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
    
    if (!editFormData.patient_name) errors.patient_name = 'Patient name is required';
    if (!editFormData.patient_age) errors.patient_age = 'Patient age is required';
    else if (editFormData.patient_age < 0 || editFormData.patient_age > 120) 
      errors.patient_age = 'Invalid age';
    
    if (!editFormData.patient_gender) errors.patient_gender = 'Gender is required';
    if (!editFormData.blood_type) errors.blood_type = 'Blood type is required';
    if (!editFormData.units_required) errors.units_required = 'Units required is required';
    else if (editFormData.units_required < 1) errors.units_required = 'Units must be at least 1';
    
    if (!editFormData.hospital) errors.hospital = 'Hospital is required';
    if (!editFormData.requested_by) errors.requested_by = 'Requester name is required';
    
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
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/requests/${editingRequest._id}`,
        editFormData,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Edit response:', response.data);

      setSuccess('Request updated successfully!');
      
      // Refresh the list
      await fetchRequests();
      
      setShowEditModal(false);
      setEditingRequest(null);
      
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('Error updating request:', err);
      if (err.response?.data?.errors) {
        const backendErrors = {};
        err.response.data.errors.forEach(err => {
          backendErrors[err.path] = err.msg;
        });
        setEditErrors(backendErrors);
      } else {
        setError(err.response?.data?.error || 'Failed to update request');
      }
    } finally {
      setEditLoading(false);
    }
  };

  const calculateStats = (data) => {
    const newStats = {
      total: data.length,
      pending: data.filter(r => r.status === 'pending').length,
      approved: data.filter(r => r.status === 'approved').length,
      fulfilled: data.filter(r => r.status === 'fulfilled').length,
      rejected: data.filter(r => r.status === 'rejected').length,
      cancelled: data.filter(r => r.status === 'cancelled').length,
      urgent: data.filter(r => r.urgency === 'urgent' || r.urgency === 'emergency').length
    };
    setStats(newStats);
  };

  const applyFilters = (data, currentFilters, currentSort) => {
    let filtered = [...data];

    // Apply search filter
    if (currentFilters.search) {
      const searchLower = currentFilters.search.toLowerCase();
      filtered = filtered.filter(request => 
        request.patient_name?.toLowerCase().includes(searchLower) ||
        request.hospital?.toLowerCase().includes(searchLower) ||
        request.requested_by?.toLowerCase().includes(searchLower) ||
        request.blood_type?.toLowerCase().includes(searchLower)
      );
    }

    // Apply blood type filter
    if (currentFilters.blood_type) {
      filtered = filtered.filter(r => r.blood_type === currentFilters.blood_type);
    }

    // Apply status filter
    if (currentFilters.status) {
      filtered = filtered.filter(r => r.status === currentFilters.status);
    }

    // Apply urgency filter
    if (currentFilters.urgency) {
      filtered = filtered.filter(r => r.urgency === currentFilters.urgency);
    }

    // Apply date range filter
    if (currentFilters.dateFrom) {
      const fromDate = new Date(currentFilters.dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(r => new Date(r.createdAt) >= fromDate);
    }
    if (currentFilters.dateTo) {
      const toDate = new Date(currentFilters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(r => new Date(r.createdAt) <= toDate);
    }

    // Apply sorting
    if (currentSort.key) {
      filtered.sort((a, b) => {
        let aVal = a[currentSort.key];
        let bVal = b[currentSort.key];

        if (currentSort.key === 'createdAt' || currentSort.key === 'updatedAt') {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        }

        if (aVal < bVal) return currentSort.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return currentSort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredRequests(filtered);
  };

  useEffect(() => {
    applyFilters(requests, filters, sortConfig);
  }, [filters, sortConfig, requests]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="text-gray-400" />;
    return sortConfig.direction === 'asc' ? 
      <FaSortUp className="text-red-600" /> : 
      <FaSortDown className="text-red-600" />;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: FaClock, label: 'Pending' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', icon: FaCheckCircle, label: 'Approved' },
      fulfilled: { bg: 'bg-blue-100', text: 'text-blue-800', icon: FaCheckCircle, label: 'Fulfilled' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: FaBan, label: 'Rejected' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', icon: FaTimes, label: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="text-xs" />
        {config.label}
      </span>
    );
  };

  const getUrgencyBadge = (urgency) => {
    const urgencyConfig = {
      routine: { bg: 'bg-green-100', text: 'text-green-800', label: 'Routine' },
      urgent: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Urgent' },
      emergency: { bg: 'bg-red-100', text: 'text-red-800', label: 'Emergency' }
    };

    const config = urgencyConfig[urgency] || urgencyConfig.routine;

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getAvailableActions = (status) => {
    const actions = {
      pending: ['approve', 'reject', 'edit'],
      approved: ['fulfill', 'cancel', 'edit'],
      fulfilled: [],
      rejected: [],
      cancelled: []
    };
    return actions[status] || [];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Pagination
  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);
  const totalPages = Math.ceil(filteredRequests.length / requestsPerPage);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const statusTypes = ['pending', 'approved', 'fulfilled', 'rejected', 'cancelled'];
  const urgencyTypes = ['routine', 'urgent', 'emergency'];
  const genderTypes = ['male', 'female', 'other'];

  // If not authorized, don't render
  if (!userRole) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <FaArrowLeft />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="flex items-center gap-4">
            <button
              onClick={fetchRequests}
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-shadow"
              disabled={loading}
            >
              <FaSync className={`text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">Refresh</span>
            </button>
            
            <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full">
              <FaShieldAlt className="text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                {userRole === 'admin' ? 'Administrator' : 'Technician'} Access
              </span>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <FaClipboardList className="text-white text-3xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Blood Requests</h1>
                  <p className="text-blue-100 mt-1">
                    Manage and track blood requests from hospitals and patients
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
                >
                  <FaPrint />
                  Print
                </button>
                <button
                  onClick={() => {
                    const dataStr = JSON.stringify(filteredRequests, null, 2);
                    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                    const exportFileDefaultName = 'blood_requests.json';
                    const linkElement = document.createElement('a');
                    linkElement.setAttribute('href', dataUri);
                    linkElement.setAttribute('download', exportFileDefaultName);
                    linkElement.click();
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
                >
                  <FaDownload />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mx-8 mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <FaCheckCircle className="text-green-500 text-xl shrink-0" />
              <p className="text-green-700">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-3">
                <FaExclamationTriangle className="text-red-500 text-xl shrink-0" />
                <p className="text-red-700">{error}</p>
              </div>
              <button
                onClick={fetchRequests}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4 p-8">
            <StatCard label="Total" value={stats.total} color="blue" icon={FaClipboardList} />
            <StatCard label="Pending" value={stats.pending} color="yellow" icon={FaClock} />
            <StatCard label="Approved" value={stats.approved} color="green" icon={FaCheckCircle} />
            <StatCard label="Fulfilled" value={stats.fulfilled} color="purple" icon={FaCheckCircle} />
            <StatCard label="Rejected" value={stats.rejected} color="red" icon={FaBan} />
            <StatCard label="Cancelled" value={stats.cancelled} color="gray" icon={FaTimes} />
            <StatCard label="Urgent" value={stats.urgent} color="orange" icon={FaExclamationTriangle} />
          </div>

          {/* Filters */}
          <div className="px-8 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {/* Search */}
              <div className="relative md:col-span-2">
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search patient/hospital..."
                  className="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {/* Blood Type Filter */}
              <div className="relative">
                <select
                  name="blood_type"
                  value={filters.blood_type}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="">All Blood Types</option>
                  {bloodTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <FaTint className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="">All Status</option>
                  {statusTypes.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {/* Urgency Filter */}
              <div className="relative">
                <select
                  name="urgency"
                  value={filters.urgency}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="">All Urgency</option>
                  {urgencyTypes.map(urgency => (
                    <option key={urgency} value={urgency}>
                      {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
                    </option>
                  ))}
                </select>
                <FaExclamationTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {/* Date From */}
              <div className="relative">
                <input
                  type="date"
                  name="dateFrom"
                  value={filters.dateFrom}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="From Date"
                />
                <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {/* Date To */}
              <div className="relative">
                <input
                  type="date"
                  name="dateTo"
                  value={filters.dateTo}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="To Date"
                />
                <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <FaSpinner className="animate-spin text-4xl text-blue-600" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                        <button
                          onClick={() => handleSort('createdAt')}
                          className="flex items-center gap-2 hover:text-blue-600"
                        >
                          Date
                          {getSortIcon('createdAt')}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                        <button
                          onClick={() => handleSort('patient_name')}
                          className="flex items-center gap-2 hover:text-blue-600"
                        >
                          Patient
                          {getSortIcon('patient_name')}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                        <button
                          onClick={() => handleSort('blood_type')}
                          className="flex items-center gap-2 hover:text-blue-600"
                        >
                          Blood Type
                          {getSortIcon('blood_type')}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                        <button
                          onClick={() => handleSort('units_required')}
                          className="flex items-center gap-2 hover:text-blue-600"
                        >
                          Units
                          {getSortIcon('units_required')}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                        <button
                          onClick={() => handleSort('hospital')}
                          className="flex items-center gap-2 hover:text-blue-600"
                        >
                          Hospital
                          {getSortIcon('hospital')}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                        Urgency
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                        <button
                          onClick={() => handleSort('status')}
                          className="flex items-center gap-2 hover:text-blue-600"
                        >
                          Status
                          {getSortIcon('status')}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentRequests.length > 0 ? (
                      currentRequests.map((request) => {
                        const availableActions = getAvailableActions(request.status);
                        
                        return (
                          <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {formatDate(request.createdAt)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900">{request.patient_name}</div>
                              <div className="text-xs text-gray-500">{request.patient_age} yrs / {request.patient_gender}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                <FaTint className="mr-1" />
                                {request.blood_type}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {request.units_required} units
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{request.hospital}</div>
                              <div className="text-xs text-gray-500">{request.ward_number || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4">
                              {getUrgencyBadge(request.urgency)}
                            </td>
                            <td className="px-6 py-4">
                              {getStatusBadge(request.status)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => fetchRequestDetails(request._id)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <FaEye />
                                </button>
                                
                                {availableActions.includes('edit') && (
                                  <button
                                    onClick={() => handleEditClick(request)}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Edit Request"
                                  >
                                    <FaEdit />
                                  </button>
                                )}
                                
                                {availableActions.includes('approve') && (
                                  <button
                                    onClick={() => handleStatusUpdate(request, 'approve')}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Approve Request"
                                  >
                                    <FaThumbsUp />
                                  </button>
                                )}
                                
                                {availableActions.includes('reject') && (
                                  <button
                                    onClick={() => handleStatusUpdate(request, 'reject')}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Reject Request"
                                  >
                                    <FaThumbsDown />
                                  </button>
                                )}
                                
                                {availableActions.includes('fulfill') && (
                                  <button
                                    onClick={() => handleStatusUpdate(request, 'fulfill')}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Mark as Fulfilled"
                                  >
                                    <FaCheckDouble />
                                  </button>
                                )}
                                
                                {availableActions.includes('cancel') && (
                                  <button
                                    onClick={() => handleStatusUpdate(request, 'cancel')}
                                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                    title="Cancel Request"
                                  >
                                    <FaBan />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" className="px-6 py-20 text-center text-gray-500">
                          <FaClipboardList className="mx-auto text-4xl mb-4 text-gray-400" />
                          <p className="text-lg font-medium">No requests found</p>
                          <p className="text-sm mt-1">Try adjusting your filters</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredRequests.length > 0 && (
                <div className="px-8 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {indexOfFirstRequest + 1} to {Math.min(indexOfLastRequest, filteredRequests.length)} of {filteredRequests.length} requests
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaChevronLeft />
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          currentPage === i + 1
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Request Details Modal */}
      {showDetailsModal && selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          onClose={() => setShowDetailsModal(false)}
          loading={detailsLoading}
          getStatusBadge={getStatusBadge}
          getUrgencyBadge={getUrgencyBadge}
          formatDate={formatDate}
        />
      )}

      {/* Edit Request Modal */}
      {showEditModal && editingRequest && (
        <EditRequestModal
          formData={editFormData}
          errors={editErrors}
          loading={editLoading}
          onClose={() => setShowEditModal(false)}
          onChange={handleEditChange}
          onSubmit={handleEditSubmit}
          bloodTypes={bloodTypes}
          urgencyTypes={urgencyTypes}
          genderTypes={genderTypes}
        />
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && confirmRequest && confirmAction && (
        <ConfirmationModal
          request={confirmRequest}
          action={confirmAction}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={executeStatusUpdate}
          loading={confirmLoading}
        />
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ label, value, color, icon: Icon }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    gray: 'bg-gray-50 text-gray-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

// Request Details Modal Component
const RequestDetailsModal = ({ request, onClose, loading, getStatusBadge, getUrgencyBadge, formatDate }) => {
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <FaSpinner className="animate-spin text-4xl text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-2xl flex items-center justify-between sticky top-0">
          <h2 className="text-xl font-bold text-white">Request Details</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Badges */}
          <div className="flex items-center gap-3">
            {getStatusBadge(request.status)}
            {getUrgencyBadge(request.urgency)}
          </div>

          {/* Patient Information */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FaUser className="text-blue-600" />
              Patient Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Patient Name" value={request.patient_name} />
              <DetailItem label="Age/Gender" value={`${request.patient_age} yrs / ${request.patient_gender}`} />
              <DetailItem label="Blood Type" value={request.blood_type} icon={<FaTint className="text-red-500" />} />
              <DetailItem label="Units Required" value={`${request.units_required} units`} />
              <DetailItem label="Diagnosis" value={request.diagnosis || 'N/A'} className="col-span-2" />
            </div>
          </div>

          {/* Hospital Information */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FaMapMarkerAlt className="text-blue-600" />
              Hospital Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Hospital" value={request.hospital} />
              <DetailItem label="Ward/Department" value={request.ward_number || 'N/A'} />
              <DetailItem label="Doctor Name" value={request.doctor_name || 'N/A'} />
              <DetailItem label="Contact" value={request.hospital_contact || 'N/A'} />
            </div>
          </div>

          {/* Requester Information */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FaUser className="text-blue-600" />
              Requester Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Requested By" value={request.requested_by} />
              <DetailItem label="Contact" value={request.requester_contact || 'N/A'} />
              <DetailItem label="Email" value={request.requester_email || 'N/A'} />
              <DetailItem label="Role" value={request.requester_role || 'N/A'} />
            </div>
          </div>

          {/* Additional Information */}
          {request.notes && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FaNotesMedical className="text-blue-600" />
                Additional Notes
              </h3>
              <p className="text-gray-700">{request.notes}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FaClock className="text-blue-600" />
              Timeline
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Requested On" value={formatDate(request.createdAt)} />
              <DetailItem label="Last Updated" value={formatDate(request.updatedAt)} />
              {request.fulfilled_date && (
                <DetailItem label="Fulfilled On" value={formatDate(request.fulfilled_date)} />
              )}
              {request.approved_by && (
                <DetailItem label="Approved By" value={request.approved_by} />
              )}
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Request Modal
const EditRequestModal = ({ formData, errors, loading, onClose, onChange, onSubmit, bloodTypes, urgencyTypes, genderTypes }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-2xl flex items-center justify-between sticky top-0">
          <h2 className="text-xl font-bold text-white">Edit Request</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {/* Patient Information */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaUser className="text-blue-600" />
              Patient Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Name *
                </label>
                <input
                  type="text"
                  name="patient_name"
                  value={formData.patient_name}
                  onChange={onChange}
                  className={`w-full px-4 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.patient_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.patient_name && (
                  <p className="mt-1 text-xs text-red-600">{errors.patient_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age *
                </label>
                <input
                  type="number"
                  name="patient_age"
                  value={formData.patient_age}
                  onChange={onChange}
                  min="0"
                  max="120"
                  className={`w-full px-4 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.patient_age ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.patient_age && (
                  <p className="mt-1 text-xs text-red-600">{errors.patient_age}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <select
                  name="patient_gender"
                  value={formData.patient_gender}
                  onChange={onChange}
                  className={`w-full px-4 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.patient_gender ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Gender</option>
                  {genderTypes.map(gender => (
                    <option key={gender} value={gender}>
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.patient_gender && (
                  <p className="mt-1 text-xs text-red-600">{errors.patient_gender}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Type *
                </label>
                <select
                  name="blood_type"
                  value={formData.blood_type}
                  onChange={onChange}
                  className={`w-full px-4 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.blood_type ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Blood Type</option>
                  {bloodTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.blood_type && (
                  <p className="mt-1 text-xs text-red-600">{errors.blood_type}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Units Required *
                </label>
                <input
                  type="number"
                  name="units_required"
                  value={formData.units_required}
                  onChange={onChange}
                  min="1"
                  className={`w-full px-4 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.units_required ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.units_required && (
                  <p className="mt-1 text-xs text-red-600">{errors.units_required}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Urgency *
                </label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={onChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {urgencyTypes.map(urgency => (
                    <option key={urgency} value={urgency}>
                      {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnosis
                </label>
                <input
                  type="text"
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={onChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Medical diagnosis (optional)"
                />
              </div>
            </div>
          </div>

          {/* Hospital Information */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaMapMarkerAlt className="text-blue-600" />
              Hospital Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hospital *
                </label>
                <input
                  type="text"
                  name="hospital"
                  value={formData.hospital}
                  onChange={onChange}
                  className={`w-full px-4 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.hospital ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.hospital && (
                  <p className="mt-1 text-xs text-red-600">{errors.hospital}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ward/Department
                </label>
                <input
                  type="text"
                  name="ward_number"
                  value={formData.ward_number}
                  onChange={onChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor Name
                </label>
                <input
                  type="text"
                  name="doctor_name"
                  value={formData.doctor_name}
                  onChange={onChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hospital Contact
                </label>
                <input
                  type="text"
                  name="hospital_contact"
                  value={formData.hospital_contact}
                  onChange={onChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Phone number"
                />
              </div>
            </div>
          </div>

          {/* Requester Information */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaUser className="text-blue-600" />
              Requester Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requested By *
                </label>
                <input
                  type="text"
                  name="requested_by"
                  value={formData.requested_by}
                  onChange={onChange}
                  className={`w-full px-4 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.requested_by ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.requested_by && (
                  <p className="mt-1 text-xs text-red-600">{errors.requested_by}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requester Contact
                </label>
                <input
                  type="text"
                  name="requester_contact"
                  value={formData.requester_contact}
                  onChange={onChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requester Email
                </label>
                <input
                  type="email"
                  name="requester_email"
                  value={formData.requester_email}
                  onChange={onChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requester Role
                </label>
                <input
                  type="text"
                  name="requester_role"
                  value={formData.requester_role}
                  onChange={onChange}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Doctor, Nurse"
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="bg-gray-50 rounded-xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={onChange}
              rows="3"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any additional information..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FaCheck />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Confirmation Modal
// Confirmation Modal
const ConfirmationModal = ({ request, action, onClose, onConfirm, loading }) => {
  const actionConfig = {
    approve: {
      title: 'Approve Request',
      message: `Are you sure you want to approve the request for ${request.patient_name}?`,
      color: 'green',
      icon: FaThumbsUp,
      confirmText: 'Approve',
      bgFrom: 'from-green-600',
      bgTo: 'to-green-500',
      hoverFrom: 'hover:from-green-700',
      hoverTo: 'hover:to-green-600'
    },
    reject: {
      title: 'Reject Request',
      message: `Are you sure you want to reject the request for ${request.patient_name}?`,
      color: 'red',
      icon: FaBan,
      confirmText: 'Reject',
      bgFrom: 'from-red-600',
      bgTo: 'to-red-500',
      hoverFrom: 'hover:from-red-700',
      hoverTo: 'hover:to-red-600'
    },
    fulfill: {
      title: 'Mark as Fulfilled',
      message: `Are you sure you want to mark this request as fulfilled?`,
      color: 'blue',
      icon: FaCheckDouble,
      confirmText: 'Fulfill',
      bgFrom: 'from-blue-600',
      bgTo: 'to-blue-500',
      hoverFrom: 'hover:from-blue-700',
      hoverTo: 'hover:to-blue-600'
    },
    cancel: {
      title: 'Cancel Request',
      message: `Are you sure you want to cancel the request for ${request.patient_name}?`,
      color: 'gray',
      icon: FaTimes,
      confirmText: 'Cancel',
      bgFrom: 'from-gray-600',
      bgTo: 'to-gray-500',
      hoverFrom: 'hover:from-gray-700',
      hoverTo: 'hover:to-gray-600'
    }
  };

  const config = actionConfig[action] || actionConfig.approve;
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
          <div className={`bg-gradient-to-r ${config.bgFrom} ${config.bgTo} px-6 py-4 rounded-t-2xl`}>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Icon />
            {config.title}
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-gray-700">{config.message}</p>
          
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-sm">
              <span className="font-medium">Request ID:</span> {request._id.slice(-8)}
            </p>
            <p className="text-sm">
              <span className="font-medium">Patient:</span> {request.patient_name}
            </p>
            <p className="text-sm">
              <span className="font-medium">Blood Type:</span> {request.blood_type}
            </p>
            <p className="text-sm">
              <span className="font-medium">Units:</span> {request.units_required}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-3 bg-gradient-to-r ${config.bgFrom} ${config.bgTo} text-white font-medium rounded-xl ${config.hoverFrom} ${config.hoverTo} transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Icon />
                  {config.confirmText}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Detail Item Component
const DetailItem = ({ label, value, icon, className = '' }) => (
  <div className={className}>
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="text-sm font-medium flex items-center gap-1">
      {icon}
      {value}
    </p>
  </div>
);

export default BloodRequestList;