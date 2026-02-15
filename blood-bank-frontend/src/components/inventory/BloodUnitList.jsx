// components/inventory/BloodUnitList.jsx
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
  FaExclamationTriangle,
  FaArrowLeft,
  FaShieldAlt,
  FaSearch,
  FaFilter,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
  FaSync,
  FaThermometerHalf,
  FaExclamationCircle,
  FaCheckCircle,
  FaHourglassHalf,
  FaBan,
  FaClock,
  FaTimes,
  FaSave
} from 'react-icons/fa';

const BloodUnitList = () => {
  const navigate = useNavigate();
  const [units, setUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userRole, setUserRole] = useState('');
  const [user, setUser] = useState(null);
  
  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    components: '',
    volume_ml: '',
    storage_location: '',
    status: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editErrors, setEditErrors] = useState({});

  // Delete Confirmation Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUnit, setDeletingUnit] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [unitsPerPage] = useState(10);
  
  // Filters
  const [filters, setFilters] = useState({
    blood_type: '',
    components: '',
    status: '',
    search: ''
  });
  
  // Sorting
  const [sortConfig, setSortConfig] = useState({
    key: 'collection_date',
    direction: 'desc'
  });

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    reserved: 0,
    used: 0,
    expired: 0,
    discard: 0
  });

  // Check if user is admin or technician
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userStr || !token) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(userStr);
    setUser(userData);
    
    // Only allow admin or technician
    if (userData.role !== 'admin' && userData.role !== 'technician') {
      navigate('/');
      return;
    }

    setUserRole(userData.role);
    fetchBloodUnits();
  }, [navigate]);

  const fetchBloodUnits = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/inventory', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUnits(response.data);
      calculateStats(response.data);
      applyFilters(response.data, filters, sortConfig);
      setError('');
      
    } catch (err) {
      console.error('Error fetching blood units:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => {
          localStorage.clear();
          navigate('/login');
        }, 2000);
      } else {
        setError('Failed to load blood units. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const newStats = {
      total: data.length,
      available: data.filter(u => u.status === 'available').length,
      reserved: data.filter(u => u.status === 'reserved').length,
      used: data.filter(u => u.status === 'used').length,
      expired: data.filter(u => u.status === 'expired').length,
      discard: data.filter(u => u.status === 'discard').length
    };
    setStats(newStats);
  };

  const applyFilters = (data, currentFilters, currentSort) => {
    let filtered = [...data];

    // Apply search filter
    if (currentFilters.search) {
      const searchLower = currentFilters.search.toLowerCase();
      filtered = filtered.filter(unit => 
        unit.unit_number?.toLowerCase().includes(searchLower) ||
        unit.donor_id?.donor_code?.toLowerCase().includes(searchLower) ||
        unit.storage_location?.toLowerCase().includes(searchLower)
      );
    }

    // Apply blood type filter
    if (currentFilters.blood_type) {
      filtered = filtered.filter(unit => unit.blood_type === currentFilters.blood_type);
    }

    // Apply component filter
    if (currentFilters.components) {
      filtered = filtered.filter(unit => unit.components === currentFilters.components);
    }

    // Apply status filter
    if (currentFilters.status) {
      filtered = filtered.filter(unit => unit.status === currentFilters.status);
    }

    // Apply sorting
    if (currentSort.key) {
      filtered.sort((a, b) => {
        let aVal = a[currentSort.key];
        let bVal = b[currentSort.key];

        // Handle nested objects
        if (currentSort.key === 'donor_code') {
          aVal = a.donor_id?.donor_code || '';
          bVal = b.donor_id?.donor_code || '';
        }

        if (aVal < bVal) return currentSort.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return currentSort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredUnits(filtered);
  };

  useEffect(() => {
    applyFilters(units, filters, sortConfig);
  }, [filters, sortConfig, units]);

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

  // Edit Handlers
  const handleEditClick = (unit) => {
    setEditingUnit(unit);
    setEditFormData({
      components: unit.components,
      volume_ml: unit.volume_ml,
      storage_location: unit.storage_location,
      status: unit.status
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
    
    if (!editFormData.components) {
      errors.components = 'Component type is required';
    }
    
    if (!editFormData.volume_ml) {
      errors.volume_ml = 'Volume is required';
    } else if (editFormData.volume_ml <= 0) {
      errors.volume_ml = 'Volume must be positive';
    }
    
    if (!editFormData.storage_location) {
      errors.storage_location = 'Storage location is required';
    }
    
    if (!editFormData.status) {
      errors.status = 'Status is required';
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
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/inventory/${editingUnit._id}`,
        editFormData,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Refresh the list
      await fetchBloodUnits();
      
      setSuccess('Blood unit updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
      setShowEditModal(false);
      setEditingUnit(null);
      
    } catch (err) {
      console.error('Error updating unit:', err);
      setEditErrors({ 
        form: err.response?.data?.error || 'Failed to update blood unit' 
      });
    } finally {
      setEditLoading(false);
    }
  };

  // Delete Handlers
  const handleDeleteClick = (unit) => {
    setDeletingUnit(unit);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/inventory/${deletingUnit._id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      // Refresh the list
      await fetchBloodUnits();
      
      setSuccess('Blood unit removed successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
      setShowDeleteModal(false);
      setDeletingUnit(null);
      
    } catch (err) {
      console.error('Error deleting unit:', err);
      setError(err.response?.data?.error || 'Failed to delete blood unit');
      setTimeout(() => setError(''), 3000);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { bg: 'bg-green-100', text: 'text-green-800', icon: FaCheckCircle, label: 'Available' },
      reserved: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: FaClock, label: 'Reserved' },
      used: { bg: 'bg-blue-100', text: 'text-blue-800', icon: FaCheckCircle, label: 'Used' },
      expired: { bg: 'bg-gray-100', text: 'text-gray-800', icon: FaHourglassHalf, label: 'Expired' },
      discard: { bg: 'bg-red-100', text: 'text-red-800', icon: FaBan, label: 'Discard' }
    };

    const config = statusConfig[status] || statusConfig.available;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="text-xs" />
        {config.label}
      </span>
    );
  };

  const getComponentBadge = (component) => {
    const componentConfig = {
      whole_blood: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Whole Blood' },
      rbc: { bg: 'bg-red-100', text: 'text-red-800', label: 'RBC' },
      plasma: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Plasma' },
      platelets: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Platelets' }
    };

    const config = componentConfig[component] || componentConfig.whole_blood;

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const checkExpiryStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return { color: 'text-red-600', bg: 'bg-red-50', label: 'Expired' };
    if (daysUntilExpiry <= 7) return { color: 'text-orange-600', bg: 'bg-orange-50', label: `${daysUntilExpiry} days` };
    if (daysUntilExpiry <= 30) return { color: 'text-yellow-600', bg: 'bg-yellow-50', label: `${daysUntilExpiry} days` };
    return { color: 'text-green-600', bg: 'bg-green-50', label: `${daysUntilExpiry} days` };
  };

  // Pagination
  const indexOfLastUnit = currentPage * unitsPerPage;
  const indexOfFirstUnit = indexOfLastUnit - unitsPerPage;
  const currentUnits = filteredUnits.slice(indexOfFirstUnit, indexOfLastUnit);
  const totalPages = Math.ceil(filteredUnits.length / unitsPerPage);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const componentTypes = ['whole_blood', 'rbc', 'plasma', 'platelets'];
  const statusTypes = ['available', 'reserved', 'used', 'expired', 'discard'];

  // If not authorized, don't render
  if (!userRole) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 via-white to-red-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>
          
          <div className="flex items-center gap-4">
            <button
              onClick={fetchBloodUnits}
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-shadow"
            >
              <FaSync className={`text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">Refresh</span>
            </button>
            
            <div className="flex items-center gap-2 bg-red-100 px-4 py-2 rounded-full">
              <FaShieldAlt className="text-red-600" />
              <span className="text-sm font-medium text-red-700">
                {userRole === 'admin' ? 'Administrator' : 'Technician'} Access
              </span>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-red-100 overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-red-600 to-pink-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <FaBoxes className="text-white text-3xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Blood Inventory</h1>
                  <p className="text-red-100 mt-1">
                    Manage and track blood units in inventory
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => navigate('/inventory/add')}
                className="bg-white text-red-600 px-4 py-2 rounded-xl font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <FaPlus />
                Add Blood Unit
              </button>
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
            <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <FaExclamationTriangle className="text-red-500 text-xl shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 p-8">
            <StatCard 
              label="Total" 
              value={stats.total} 
              color="blue" 
              icon={FaBoxes}
            />
            <StatCard 
              label="Available" 
              value={stats.available} 
              color="green" 
              icon={FaCheckCircle}
            />
            <StatCard 
              label="Reserved" 
              value={stats.reserved} 
              color="yellow" 
              icon={FaClock}
            />
            <StatCard 
              label="Used" 
              value={stats.used} 
              color="purple" 
              icon={FaCheckCircle}
            />
            <StatCard 
              label="Expired" 
              value={stats.expired} 
              color="gray" 
              icon={FaHourglassHalf}
            />
            <StatCard 
              label="Discard" 
              value={stats.discard} 
              color="red" 
              icon={FaBan}
            />
          </div>

          {/* Filters */}
          <div className="px-8 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search units..."
                  className="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {/* Blood Type Filter */}
              <div className="relative">
                <select
                  name="blood_type"
                  value={filters.blood_type}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none"
                >
                  <option value="">All Blood Types</option>
                  {bloodTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <FaTint className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {/* Component Filter */}
              <div className="relative">
                <select
                  name="components"
                  value={filters.components}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none"
                >
                  <option value="">All Components</option>
                  {componentTypes.map(comp => (
                    <option key={comp} value={comp}>
                      {comp.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none"
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

              {/* Export Button */}
              <button
                onClick={() => {/* Handle export */}}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <FaDownload />
                Export
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <FaSpinner className="animate-spin text-4xl text-red-600" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                        <button
                          onClick={() => handleSort('unit_number')}
                          className="flex items-center gap-2 hover:text-red-600"
                        >
                          Unit Number
                          {getSortIcon('unit_number')}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                        <button
                          onClick={() => handleSort('donor_code')}
                          className="flex items-center gap-2 hover:text-red-600"
                        >
                          Donor
                          {getSortIcon('donor_code')}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                        <button
                          onClick={() => handleSort('blood_type')}
                          className="flex items-center gap-2 hover:text-red-600"
                        >
                          Blood Type
                          {getSortIcon('blood_type')}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                        <button
                          onClick={() => handleSort('components')}
                          className="flex items-center gap-2 hover:text-red-600"
                        >
                          Component
                          {getSortIcon('components')}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                        <button
                          onClick={() => handleSort('volume_ml')}
                          className="flex items-center gap-2 hover:text-red-600"
                        >
                          Volume
                          {getSortIcon('volume_ml')}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                        <button
                          onClick={() => handleSort('collection_date')}
                          className="flex items-center gap-2 hover:text-red-600"
                        >
                          Collection
                          {getSortIcon('collection_date')}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                        <button
                          onClick={() => handleSort('expiry_date')}
                          className="flex items-center gap-2 hover:text-red-600"
                        >
                          Expiry
                          {getSortIcon('expiry_date')}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                        Storage
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                        <button
                          onClick={() => handleSort('status')}
                          className="flex items-center gap-2 hover:text-red-600"
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
                    {currentUnits.length > 0 ? (
                      currentUnits.map((unit) => {
                        const expiryStatus = checkExpiryStatus(unit.expiry_date);
                        return (
                          <tr key={unit._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-mono text-sm font-medium text-gray-900">
                                {unit.unit_number}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {unit.donor_id?.donor_code || 'N/A'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {unit.donor_id?.name || 'Unknown'}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                <FaTint className="mr-1" />
                                {unit.blood_type}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {getComponentBadge(unit.components)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {unit.volume_ml} ml
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {new Date(unit.collection_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className={`text-sm ${expiryStatus.color}`}>
                                <div>{new Date(unit.expiry_date).toLocaleDateString()}</div>
                                <div className={`text-xs ${expiryStatus.bg} px-2 py-1 rounded-full inline-block mt-1`}>
                                  {expiryStatus.label}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <FaMapMarkerAlt className="text-gray-400" />
                                {unit.storage_location}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {getStatusBadge(unit.status)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => navigate(`/inventory/${unit._id}`)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <FaEye />
                                </button>
                                
                                {/* Edit button - visible to both admin and technician */}
                                <button
                                  onClick={() => handleEditClick(unit)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <FaEdit />
                                </button>
                                
                                {/* Delete button - visible only to admin */}
                                {userRole === 'admin' && (
                                  <button
                                    onClick={() => handleDeleteClick(unit)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                  >
                                    <FaTrash />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="10" className="px-6 py-20 text-center text-gray-500">
                          <FaBoxes className="mx-auto text-4xl mb-4 text-gray-400" />
                          <p className="text-lg font-medium">No blood units found</p>
                          <p className="text-sm mt-1">Try adjusting your filters or add a new blood unit</p>
                          <button
                            onClick={() => navigate('/inventory/add')}
                            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors inline-flex items-center gap-2"
                          >
                            <FaPlus />
                            Add Blood Unit
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredUnits.length > 0 && (
                <div className="px-8 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {indexOfFirstUnit + 1} to {Math.min(indexOfLastUnit, filteredUnits.length)} of {filteredUnits.length} units
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
                            ? 'bg-red-600 text-white'
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

      {/* Edit Modal */}
      {showEditModal && editingUnit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-linear-to-r from-red-600 to-pink-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Edit Blood Unit</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {/* Unit Info */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600">Unit Number</p>
                <p className="font-mono font-medium">{editingUnit.unit_number}</p>
                <p className="text-sm text-gray-600 mt-2">Blood Type</p>
                <p className="font-medium">{editingUnit.blood_type}</p>
              </div>

              {/* Component Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Component Type *
                </label>
                <select
                  name="components"
                  value={editFormData.components}
                  onChange={handleEditChange}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    editErrors.components ? 'border-red-500' : 'border-gray-200'
                  }`}
                >
                  <option value="whole_blood">Whole Blood</option>
                  <option value="rbc">Red Blood Cells (RBC)</option>
                  <option value="plasma">Plasma</option>
                  <option value="platelets">Platelets</option>
                </select>
                {editErrors.components && (
                  <p className="mt-1 text-sm text-red-600">{editErrors.components}</p>
                )}
              </div>

              {/* Volume */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volume (ml) *
                </label>
                <input
                  type="number"
                  name="volume_ml"
                  value={editFormData.volume_ml}
                  onChange={handleEditChange}
                  min="1"
                  step="1"
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    editErrors.volume_ml ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {editErrors.volume_ml && (
                  <p className="mt-1 text-sm text-red-600">{editErrors.volume_ml}</p>
                )}
              </div>

              {/* Storage Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Storage Location *
                </label>
                <input
                  type="text"
                  name="storage_location"
                  value={editFormData.storage_location}
                  onChange={handleEditChange}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    editErrors.storage_location ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="A1-B2-C3"
                />
                {editErrors.storage_location && (
                  <p className="mt-1 text-sm text-red-600">{editErrors.storage_location}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={editFormData.status}
                  onChange={handleEditChange}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    editErrors.status ? 'border-red-500' : 'border-gray-200'
                  }`}
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="used">Used</option>
                  <option value="expired">Expired</option>
                  <option value="discard">Discard</option>
                </select>
                {editErrors.status && (
                  <p className="mt-1 text-sm text-red-600">{editErrors.status}</p>
                )}
              </div>

              {/* Form Error */}
              {editErrors.form && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                  <FaExclamationTriangle className="text-red-500" />
                  <p className="text-sm text-red-700">{editErrors.form}</p>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 px-4 py-3 bg-linear-to-r from-red-600 to-pink-600 text-white font-medium rounded-xl hover:from-red-700 hover:to-pink-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
      {showDeleteModal && deletingUnit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="bg-red-600 px-6 py-4 rounded-t-2xl">
              <h2 className="text-xl font-bold text-white">Confirm Delete</h2>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-red-100 p-3 rounded-full">
                  <FaExclamationTriangle className="text-red-600 text-2xl" />
                </div>
                <div>
                  <p className="text-gray-900 font-medium">Are you sure you want to delete this blood unit?</p>
                  <p className="text-sm text-gray-500 mt-1">This action cannot be undone.</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl space-y-2 mb-6">
                <p className="text-sm"><span className="font-medium">Unit Number:</span> {deletingUnit.unit_number}</p>
                <p className="text-sm"><span className="font-medium">Blood Type:</span> {deletingUnit.blood_type}</p>
                <p className="text-sm"><span className="font-medium">Component:</span> {deletingUnit.components}</p>
                <p className="text-sm"><span className="font-medium">Status:</span> {deletingUnit.status}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleteLoading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash />
                      Delete Unit
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

// Stat Card Component
const StatCard = ({ label, value, color, icon: Icon }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    gray: 'bg-gray-50 text-gray-600',
    red: 'bg-red-50 text-red-600'
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

export default BloodUnitList;