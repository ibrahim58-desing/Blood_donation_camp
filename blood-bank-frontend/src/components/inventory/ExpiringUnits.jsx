// components/inventory/ExpiringUnits.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaExclamationTriangle,
  FaBoxes, 
  FaTint, 
  FaMapMarkerAlt, 
  FaSpinner, 
  FaArrowLeft,
  FaShieldAlt,
  FaCheckCircle,
  FaClock,
  FaHourglassHalf,
  FaBan,
  FaSync,
  FaBell,
  FaEnvelope,
  FaPrint,
  FaEye,
  FaEdit,
  FaTimes,
  FaSave,
  FaExclamationCircle,
  FaHistory,
  FaCheck,
  FaUndo
} from 'react-icons/fa';

const ExpiringUnits = () => {
  const navigate = useNavigate();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userRole, setUserRole] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    warning: 0,
    today: 0
  });

  // Status Update Modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updateReason, setUpdateReason] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');

  // Status History Modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [statusHistory, setStatusHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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
      
      if (userData.role !== 'admin' && userData.role !== 'technician') {
        navigate('/');
        return;
      }

      setUserRole(userData.role);
      fetchExpiringUnits();
    } catch (err) {
      console.error('Error parsing user data:', err);
      navigate('/login');
    }
  }, [navigate]);

 // In your ExpiringUnits.jsx - Update the fetch function
const fetchExpiringUnits = async () => {
    setLoading(true);
    setError('');
    
    try {
        const token = localStorage.getItem('token');
        console.log('Fetching expiring units...');
        
        const response = await axios.get('http://localhost:5000/api/inventory/expiring', {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('API Response:', response.data);
        
        if (Array.isArray(response.data)) {
            setUnits(response.data);
            calculateStats(response.data);
            
            if (response.data.length === 0) {
                console.log('No expiring units found');
            } else {
                console.log(`Found ${response.data.length} expiring units`);
            }
        } else {
            console.error('Response is not an array:', response.data);
            setError('Invalid data format received from server');
        }
        
    } catch (err) {
        console.error('Error fetching expiring units:', err);
        handleFetchError(err);
    } finally {
        setLoading(false);
    }
};

// Update the calculateStats function to handle dates correctly
const calculateStats = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
        setStats({ total: 0, critical: 0, warning: 0, today: 0 });
        return;
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    const newStats = {
        total: data.length,
        critical: 0,
        warning: 0,
        today: 0
    };

    data.forEach(unit => {
        if (!unit.expiry_date) return;
        
        const expiryDate = new Date(unit.expiry_date);
        expiryDate.setUTCHours(0, 0, 0, 0);
        
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        console.log(`Unit ${unit.unit_number}: ${daysUntilExpiry} days until expiry`);
        
        if (daysUntilExpiry === 0) {
            newStats.today++;
            newStats.critical++;
        } else if (daysUntilExpiry <= 3) {
            newStats.critical++;
        } else if (daysUntilExpiry <= 7) {
            newStats.warning++;
        }
    });

    console.log('Calculated stats:', newStats);
    setStats(newStats);
};

// Update the getDaysUntilExpiry function
const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return 0;
    
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    const expiry = new Date(expiryDate);
    expiry.setUTCHours(0, 0, 0, 0);
    
    const days = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return days;
};

  const getExpiryBadge = (days) => {
    if (days < 0) {
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: FaBan,
        label: 'Expired'
      };
    }
    if (days === 0) {
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: FaExclamationCircle,
        label: 'Expires Today'
      };
    }
    if (days <= 3) {
      return {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        icon: FaExclamationTriangle,
        label: `${days} day${days > 1 ? 's' : ''}`
      };
    }
    if (days <= 7) {
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: FaClock,
        label: `${days} days`
      };
    }
    return {
      bg: 'bg-green-100',
      text: 'text-green-800',
      icon: FaCheckCircle,
      label: `${days} days`
    };
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { bg: 'bg-green-100', text: 'text-green-800', label: 'Available', icon: FaCheckCircle },
      reserved: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Reserved', icon: FaClock },
      used: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Used', icon: FaCheckCircle },
      expired: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Expired', icon: FaBan },
      discard: { bg: 'bg-red-100', text: 'text-red-800', label: 'Discard', icon: FaExclamationTriangle }
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

  // Status Update Handler (PUT /inventory/:id/status)
  const handleStatusUpdate = (unit) => {
    setSelectedUnit(unit);
    setNewStatus(unit.status);
    setUpdateReason('');
    setUpdateError('');
    setShowStatusModal(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    
    if (!newStatus) {
      setUpdateError('Please select a status');
      return;
    }

    if (newStatus === selectedUnit.status) {
      setUpdateError('New status must be different from current status');
      return;
    }

    setUpdateLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/inventory/${selectedUnit._id}/status`,
        { 
          status: newStatus,
          reason: updateReason 
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Status update response:', response.data);

      // Add to local status history
      const historyEntry = {
        from: selectedUnit.status,
        to: newStatus,
        reason: updateReason,
        date: new Date().toISOString(),
        updatedBy: userRole
      };

      setStatusHistory(prev => [historyEntry, ...prev]);

      // Refresh the list
      await fetchExpiringUnits();
      
      setSuccess(`Status updated from "${selectedUnit.status}" to "${newStatus}" successfully!`);
      setTimeout(() => setSuccess(''), 3000);
      
      setShowStatusModal(false);
      setSelectedUnit(null);
      setNewStatus('');
      setUpdateReason('');
      
    } catch (err) {
      console.error('Error updating status:', err);
      setUpdateError(err.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Quick Status Actions
  const handleQuickStatusUpdate = async (unit, newStatus) => {
    if (!window.confirm(`Change status of unit ${unit.unit_number} from "${unit.status}" to "${newStatus}"?`)) {
      return;
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/inventory/${unit._id}/status`,
        { status: newStatus },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      await fetchExpiringUnits();
      setSuccess(`Status updated to ${newStatus} successfully!`);
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err.response?.data?.error || 'Failed to update status');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkAsExpired = (unit) => {
    handleQuickStatusUpdate(unit, 'expired');
  };

  const handleMarkAsUsed = (unit) => {
    handleQuickStatusUpdate(unit, 'used');
  };

  const handleMarkAsDiscard = (unit) => {
    handleQuickStatusUpdate(unit, 'discard');
  };

  const handleMarkAsReserved = (unit) => {
    handleQuickStatusUpdate(unit, 'reserved');
  };

  const handleMarkAsAvailable = (unit) => {
    handleQuickStatusUpdate(unit, 'available');
  };

  const handleNotify = (unit) => {
    alert(`Notification sent for unit ${unit.unit_number}`);
  };

  const handleViewHistory = (unit) => {
    setSelectedUnit(unit);
    setShowHistoryModal(true);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleSendReport = () => {
    alert('Email report sent successfully!');
  };

  const statusOptions = ['available', 'reserved', 'used', 'expired', 'discard'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/inventory')}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <FaArrowLeft />
            <span>Back to Inventory</span>
          </button>
          
          <div className="flex items-center gap-4">
            <button
              onClick={fetchExpiringUnits}
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-shadow"
              disabled={loading}
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
          <div className="bg-gradient-to-r from-orange-600 to-red-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <FaExclamationTriangle className="text-white text-3xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Expiring Units</h1>
                  <p className="text-orange-100 mt-1">
                    Blood units expiring within the next 7 days
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrintReport}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
                >
                  <FaPrint />
                  Print
                </button>
                <button
                  onClick={handleSendReport}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
                >
                  <FaEnvelope />
                  Email Report
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
                onClick={fetchExpiringUnits}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-8">
            <StatCard 
              label="Total Expiring" 
              value={stats.total} 
              color="orange" 
              icon={FaHourglassHalf}
              subtext="Units expiring in 7 days"
            />
            <StatCard 
              label="Critical (0-3 days)" 
              value={stats.critical} 
              color="red" 
              icon={FaExclamationTriangle}
              subtext="Urgent attention needed"
            />
            <StatCard 
              label="Warning (4-7 days)" 
              value={stats.warning} 
              color="yellow" 
              icon={FaClock}
              subtext="Plan for usage"
            />
            <StatCard 
              label="Expiring Today" 
              value={stats.today} 
              color="purple" 
              icon={FaBell}
              subtext="Immediate action required"
            />
          </div>

          {/* Expiring Units List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <FaSpinner className="animate-spin text-4xl text-red-600" />
            </div>
          ) : (
            <div className="p-8 pt-0">
              {units.length > 0 ? (
                <div className="space-y-4">
                  {units.map((unit) => {
                    const daysUntilExpiry = getDaysUntilExpiry(unit.expiry_date);
                    const expiryBadge = getExpiryBadge(daysUntilExpiry);
                    const ExpiryIcon = expiryBadge.icon;
                    
                    return (
                      <div
                        key={unit._id}
                        className={`border rounded-xl p-6 transition-all hover:shadow-lg ${
                          daysUntilExpiry <= 3 
                            ? 'border-red-200 bg-red-50/30' 
                            : 'border-yellow-200 bg-yellow-50/30'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          {/* Unit Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="font-mono font-bold text-gray-900 text-lg">
                                {unit.unit_number || 'N/A'}
                              </span>
                              {getStatusBadge(unit.status)}
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <InfoItem label="Donor" value={unit.donor_id?.donor_code || 'N/A'} />
                              <InfoItem 
                                label="Blood Type" 
                                value={unit.blood_type || 'N/A'} 
                                icon={<FaTint className="text-red-500" />}
                              />
                              <InfoItem 
                                label="Component" 
                                value={unit.components ? unit.components.replace('_', ' ').toUpperCase() : 'N/A'} 
                              />
                              <InfoItem label="Volume" value={`${unit.volume_ml || 0} ml`} />
                              <InfoItem 
                                label="Collection" 
                                value={unit.collection_date ? new Date(unit.collection_date).toLocaleDateString() : 'N/A'} 
                              />
                              <InfoItem 
                                label="Storage" 
                                value={unit.storage_location || 'N/A'} 
                                icon={<FaMapMarkerAlt className="text-gray-400" />}
                              />
                              <div className="col-span-2">
                                <p className="text-xs text-gray-500 mb-1">Expiry Status</p>
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${expiryBadge.bg} ${expiryBadge.text}`}>
                                    <ExpiryIcon />
                                    {expiryBadge.label}
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    {unit.expiry_date ? new Date(unit.expiry_date).toLocaleDateString() : 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2 min-w-[140px]">
                            <button
                              onClick={() => navigate(`/inventory/${unit._id}`)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                              <FaEye />
                              View Details
                            </button>
                            
                            <button
                              onClick={() => handleStatusUpdate(unit)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                              <FaEdit />
                              Update Status
                            </button>

                            {/* Quick Status Actions Dropdown */}
                            <div className="relative group">
                              <button
                                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-sm"
                              >
                                <FaClock />
                                Quick Actions
                              </button>
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 hidden group-hover:block z-10">
                                {unit.status !== 'used' && (
                                  <button
                                    onClick={() => handleMarkAsUsed(unit)}
                                    className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center gap-2 text-sm"
                                  >
                                    <FaCheck className="text-blue-600" />
                                    Mark as Used
                                  </button>
                                )}
                                {unit.status !== 'reserved' && (
                                  <button
                                    onClick={() => handleMarkAsReserved(unit)}
                                    className="w-full px-4 py-2 text-left hover:bg-yellow-50 flex items-center gap-2 text-sm"
                                  >
                                    <FaClock className="text-yellow-600" />
                                    Mark as Reserved
                                  </button>
                                )}
                                {unit.status !== 'expired' && daysUntilExpiry <= 0 && (
                                  <button
                                    onClick={() => handleMarkAsExpired(unit)}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                                  >
                                    <FaBan className="text-gray-600" />
                                    Mark as Expired
                                  </button>
                                )}
                                {unit.status !== 'discard' && (
                                  <button
                                    onClick={() => handleMarkAsDiscard(unit)}
                                    className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-sm"
                                  >
                                    <FaExclamationTriangle className="text-red-600" />
                                    Mark as Discard
                                  </button>
                                )}
                                {unit.status !== 'available' && (
                                  <button
                                    onClick={() => handleMarkAsAvailable(unit)}
                                    className="w-full px-4 py-2 text-left hover:bg-green-50 flex items-center gap-2 text-sm"
                                  >
                                    <FaUndo className="text-green-600" />
                                    Mark as Available
                                  </button>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => handleNotify(unit)}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                              <FaBell />
                              Notify
                            </button>

                            <button
                              onClick={() => handleViewHistory(unit)}
                              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                              <FaHistory />
                              History
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState onRefresh={fetchExpiringUnits} />
              )}
            </div>
          )}
        </div>

        {/* Info Section */}
        <InfoSection />
      </div>

      {/* Status Update Modal */}
      <StatusUpdateModal
        show={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        unit={selectedUnit}
        newStatus={newStatus}
        onStatusChange={setNewStatus}
        reason={updateReason}
        onReasonChange={setUpdateReason}
        onSubmit={handleStatusSubmit}
        loading={updateLoading}
        error={updateError}
        statusOptions={statusOptions}
        getStatusBadge={getStatusBadge}
      />

      {/* Status History Modal */}
      <StatusHistoryModal
        show={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        unit={selectedUnit}
        history={statusHistory}
        loading={historyLoading}
      />
    </div>
  );
};

// Helper Components
const StatCard = ({ label, value, color, icon: Icon, subtext }) => {
  const colors = {
    orange: 'from-orange-50 to-red-50 border-orange-200 text-orange-600 bg-orange-200',
    red: 'from-red-50 to-orange-50 border-red-200 text-red-600 bg-red-200',
    yellow: 'from-yellow-50 to-orange-50 border-yellow-200 text-yellow-600 bg-yellow-200',
    purple: 'from-purple-50 to-pink-50 border-purple-200 text-purple-600 bg-purple-200'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color].split(' ')[0]} ${colors[color].split(' ')[1]} rounded-xl border ${colors[color].split(' ')[2]} p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${colors[color].split(' ')[3]}`}>{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colors[color].split(' ')[4]}`}>
          <Icon className={`text-xl ${colors[color].split(' ')[3]}`} />
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">{subtext}</p>
    </div>
  );
};

const InfoItem = ({ label, value, icon }) => (
  <div>
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="text-sm font-medium flex items-center gap-1">
      {icon}
      {value}
    </p>
  </div>
);

const EmptyState = ({ onRefresh }) => (
  <div className="text-center py-20">
    <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
      <FaCheckCircle className="text-green-600 text-4xl" />
    </div>
    <h3 className="text-xl font-medium text-gray-900 mb-2">No Expiring Units</h3>
    <p className="text-gray-500 mb-4">All blood units are within safe expiry period</p>
    <button
      onClick={onRefresh}
      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
    >
      <FaSync />
      Refresh
    </button>
  </div>
);

const InfoSection = () => (
  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
        <FaClock className="text-blue-600" />
        Quick Actions
      </h4>
      <ul className="text-sm text-blue-700 space-y-1">
        <li>• Click "Update Status" for detailed status change</li>
        <li>• Use "Quick Actions" dropdown for one-click updates</li>
        <li>• "Notify" sends alerts to relevant staff</li>
      </ul>
    </div>

    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
      <h4 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
        <FaExclamationTriangle className="text-orange-600" />
        Expiry Guidelines
      </h4>
      <ul className="text-sm text-orange-700 space-y-1">
        <li>• Red: 0-3 days - Critical - Immediate action needed</li>
        <li>• Yellow: 4-7 days - Warning - Plan for usage</li>
        <li>• Prioritize older units first</li>
      </ul>
    </div>

    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
      <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
        <FaCheckCircle className="text-green-600" />
        Status Management
      </h4>
      <ul className="text-sm text-green-700 space-y-1">
        <li>• Used: Unit has been transfused</li>
        <li>• Expired: Past expiry date</li>
        <li>• Discard: Unsuitable for use</li>
        <li>• Reserved: Allocated for specific patient</li>
      </ul>
    </div>
  </div>
);

const StatusUpdateModal = ({ 
  show, onClose, unit, newStatus, onStatusChange, 
  reason, onReasonChange, onSubmit, loading, error, 
  statusOptions, getStatusBadge 
}) => {
  if (!show || !unit) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Update Unit Status</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {/* Unit Info */}
          <div className="bg-gray-50 p-4 rounded-xl space-y-2">
            <p className="text-sm">
              <span className="font-medium">Unit Number:</span> {unit.unit_number}
            </p>
            <p className="text-sm">
              <span className="font-medium">Blood Type:</span> {unit.blood_type}
            </p>
            <p className="text-sm">
              <span className="font-medium">Current Status:</span>{' '}
              {getStatusBadge(unit.status)}
            </p>
            <p className="text-sm">
              <span className="font-medium">Expiry Date:</span>{' '}
              {unit.expiry_date ? new Date(unit.expiry_date).toLocaleDateString() : 'N/A'}
            </p>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Status *
            </label>
            <select
              value={newStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Select Status</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Reason (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              rows="3"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter reason for status update..."
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
              <FaExclamationTriangle className="text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

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
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-medium rounded-xl hover:from-orange-700 hover:to-red-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <FaSave />
                  Update Status
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StatusHistoryModal = ({ show, onClose, unit, history, loading }) => {
  if (!show || !unit) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Status History</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm">
              <span className="font-medium">Unit:</span> {unit.unit_number}
            </p>
            <p className="text-sm">
              <span className="font-medium">Current Status:</span> {unit.status}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <FaSpinner className="animate-spin text-3xl text-blue-600" />
            </div>
          ) : history.length > 0 ? (
            <div className="space-y-3">
              {history.map((entry, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">From:</span> 
                    <span className="text-red-600">{entry.from}</span>
                    <FaArrowRight className="text-gray-400 text-xs" />
                    <span className="font-medium">To:</span> 
                    <span className="text-green-600">{entry.to}</span>
                  </div>
                  {entry.reason && (
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Reason:</span> {entry.reason}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(entry.date).toLocaleString()} by {entry.updatedBy}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No status history available
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpiringUnits;