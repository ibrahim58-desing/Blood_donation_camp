// components/inventory/DiscardExpired.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    FaTrash,
    FaExclamationTriangle,
    FaBoxes,
    FaTint,
    FaSpinner,
    FaArrowLeft,
    FaShieldAlt,
    FaCheckCircle,
    FaBan,
    FaSync,
    FaExclamationCircle,
    FaCalendarAlt,
    FaIdCard,
    FaUser,
    FaClock,
    FaHourglassHalf,
    FaCheckDouble,
    FaTimes,
    FaTrashAlt
} from 'react-icons/fa';

const DiscardExpired = () => {
    const navigate = useNavigate();
    const [expiredUnits, setExpiredUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [discarding, setDiscarding] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [userRole, setUserRole] = useState('');
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        expired: 0,
        discarded: 0,
        toDiscard: 0
    });

    // Confirmation Modal
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedUnits, setSelectedUnits] = useState([]);
    const [confirmText, setConfirmText] = useState('');

    // Check if user is admin
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

            // Only allow admin
            if (userData.role !== 'admin') {
                navigate('/');
                return;
            }

            setUserRole(userData.role);
            fetchExpiredUnits();
        } catch (err) {
            console.error('Error parsing user data:', err);
            navigate('/login');
        }
    }, [navigate]);

    const fetchExpiredUnits = async () => {
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            console.log('Fetching expired units...');

            // Get all inventory and filter expired
            const response = await axios.get('http://localhost:5000/api/inventory', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('API Response:', response.data);

            if (Array.isArray(response.data)) {
                // Filter units with status 'expired'
                const expired = response.data.filter(unit => unit.status === 'expired');
                setExpiredUnits(expired);
                calculateStats(response.data, expired);

                console.log(`Found ${expired.length} expired units`);
            } else {
                console.error('Response is not an array:', response.data);
                setError('Invalid data format received from server');
            }

        } catch (err) {
            console.error('Error fetching expired units:', err);

            if (err.response) {
                if (err.response.status === 401) {
                    setError('Session expired. Please login again.');
                    setTimeout(() => {
                        localStorage.clear();
                        navigate('/login');
                    }, 2000);
                } else if (err.response.status === 403) {
                    setError('Access denied. Admin privileges required.');
                } else {
                    setError(err.response.data?.error || 'Failed to load expired units');
                }
            } else if (err.request) {
                setError('Cannot connect to server. Please check your connection.');
            } else {
                setError('Failed to make request. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (allUnits, expired) => {
        const discarded = allUnits.filter(unit => unit.status === 'discarded').length;

        setStats({
            total: allUnits.length,
            expired: expired.length,
            discarded: discarded,
            toDiscard: expired.length
        });
    };

    const getDaysSinceExpiry = (expiryDate) => {
        if (!expiryDate) return 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const expiry = new Date(expiryDate);
        expiry.setHours(0, 0, 0, 0);

        return Math.floor((today - expiry) / (1000 * 60 * 60 * 24));
    };

    const getExpiryBadge = (days) => {
        if (days <= 0) {
            return {
                bg: 'bg-red-100',
                text: 'text-red-800',
                icon: FaExclamationCircle,
                label: 'Expired Today'
            };
        }
        if (days <= 7) {
            return {
                bg: 'bg-orange-100',
                text: 'text-orange-800',
                icon: FaExclamationTriangle,
                label: `${days} day${days > 1 ? 's' : ''} ago`
            };
        }
        if (days <= 30) {
            return {
                bg: 'bg-yellow-100',
                text: 'text-yellow-800',
                icon: FaClock,
                label: `${days} days ago`
            };
        }
        return {
            bg: 'bg-gray-100',
            text: 'text-gray-800',
            icon: FaHourglassHalf,
            label: `${days} days ago`
        };
    };

    const handleDiscardAll = () => {
        if (expiredUnits.length === 0) {
            setError('No expired units to discard');
            return;
        }

        setSelectedUnits(expiredUnits);
        setConfirmText('');
        setShowConfirmModal(true);
    };

    const handleDiscardSelected = (unit) => {
        setSelectedUnits([unit]);
        setConfirmText('');
        setShowConfirmModal(true);
    };

    const handleDiscardConfirm = async () => {
        if (selectedUnits.length === 0) return;

        setDiscarding(true);
        setError('');

        try {
            const token = localStorage.getItem('token');

            // Your API expects a POST to /inventory/discard
            // Let's send the unit IDs that need to be discarded
            const response = await axios.post(
                'http://localhost:5000/api/inventory/discard',
                {
                    unitIds: selectedUnits.map(unit => unit._id), // Send the IDs of units to discard
                    status: 'discarded' // Optional: send the new status
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Discard response:', response.data);

            // Show success message with the count from response
            setSuccess(`Successfully discarded ${response.data.modified || response.data.count || selectedUnits.length} expired units!`);

            // Refresh the list
            await fetchExpiredUnits();

            setShowConfirmModal(false);
            setSelectedUnits([]);
            setConfirmText('');

            // Clear success message after 5 seconds
            setTimeout(() => setSuccess(''), 5000);

        } catch (err) {
            console.error('Error discarding units:', err);

            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Error response data:', err.response.data);
                console.error('Error response status:', err.response.status);

                setError(err.response.data?.error || err.response.data?.message || 'Failed to discard expired units');
            } else if (err.request) {
                // The request was made but no response was received
                console.error('No response received:', err.request);
                setError('Cannot connect to server. Please check your connection.');
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error setting up request:', err.message);
                setError('Failed to discard units. Please try again.');
            }
        } finally {
            setDiscarding(false);
        }
    };
    const getStatusBadge = (status) => {
        const statusConfig = {
            expired: { bg: 'bg-red-100', text: 'text-red-800', label: 'Expired' },
            discarded: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Discarded' }
        };

        const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };

        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    // If not admin, don't render
    if (userRole !== 'admin') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header with Back Button */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate('/dashboard/inventory')}
                        className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
                    >
                        <FaArrowLeft />
                        <span>Back to Inventory</span>
                    </button>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={fetchExpiredUnits}
                            className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-shadow"
                            disabled={loading}
                        >
                            <FaSync className={`text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                            <span className="text-sm font-medium">Refresh</span>
                        </button>

                        <div className="flex items-center gap-2 bg-red-100 px-4 py-2 rounded-full">
                            <FaShieldAlt className="text-red-600" />
                            <span className="text-sm font-medium text-red-700">
                                Administrator Access Only
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-2xl border border-red-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-700 to-red-600 px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/20 p-3 rounded-full">
                                    <FaTrash className="text-white text-3xl" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-white">Discard Expired Units</h1>
                                    <p className="text-red-100 mt-1">
                                        Permanently discard expired blood units from inventory
                                    </p>
                                </div>
                            </div>

                            {expiredUnits.length > 0 && (
                                <button
                                    onClick={handleDiscardAll}
                                    disabled={discarding}
                                    className="bg-white text-red-700 px-6 py-3 rounded-xl font-bold hover:bg-red-50 transition-colors flex items-center gap-2 shadow-lg"
                                >
                                    <FaTrashAlt />
                                    Discard All ({expiredUnits.length})
                                </button>
                            )}
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
                                onClick={fetchExpiredUnits}
                                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-8">
                        <StatCard
                            label="Total Inventory"
                            value={stats.total}
                            color="blue"
                            icon={FaBoxes}
                        />
                        <StatCard
                            label="Expired Units"
                            value={stats.expired}
                            color="red"
                            icon={FaExclamationTriangle}
                        />
                        <StatCard
                            label="Already Discarded"
                            value={stats.discarded}
                            color="gray"
                            icon={FaBan}
                        />
                        <StatCard
                            label="To Be Discarded"
                            value={stats.toDiscard}
                            color="orange"
                            icon={FaTrash}
                        />
                    </div>

                    {/* Expired Units List */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <FaSpinner className="animate-spin text-4xl text-red-600" />
                        </div>
                    ) : (
                        <div className="p-8 pt-0">
                            {expiredUnits.length > 0 ? (
                                <>
                                    <div className="mb-4 flex items-center justify-between">
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Expired Units ({expiredUnits.length})
                                        </h2>
                                        <div className="text-sm text-gray-500">
                                            <FaExclamationTriangle className="inline mr-1 text-red-500" />
                                            These units are no longer usable
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {expiredUnits.map((unit) => {
                                            const daysSinceExpiry = getDaysSinceExpiry(unit.expiry_date);
                                            const expiryBadge = getExpiryBadge(daysSinceExpiry);
                                            const ExpiryIcon = expiryBadge.icon;

                                            return (
                                                <div
                                                    key={unit._id}
                                                    className="border border-red-200 rounded-xl p-6 bg-red-50/30 hover:shadow-lg transition-all"
                                                >
                                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                                        {/* Unit Info */}
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <span className="font-mono font-bold text-gray-900 text-lg">
                                                                    {unit.unit_number || 'N/A'}
                                                                </span>
                                                                {getStatusBadge(unit.status)}
                                                            </div>

                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                                <InfoItem
                                                                    label="Donor"
                                                                    value={unit.donor_id?.donor_code || 'N/A'}
                                                                    icon={<FaUser className="text-gray-400" />}
                                                                />
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
                                                                    label="Collection Date"
                                                                    value={unit.collection_date ? new Date(unit.collection_date).toLocaleDateString() : 'N/A'}
                                                                    icon={<FaCalendarAlt className="text-gray-400" />}
                                                                />
                                                                <InfoItem
                                                                    label="Unit Number"
                                                                    value={unit.unit_number || 'N/A'}
                                                                    icon={<FaIdCard className="text-gray-400" />}
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
                                                                onClick={() => handleDiscardSelected(unit)}
                                                                disabled={discarding}
                                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                                                            >
                                                                <FaTrash />
                                                                Discard Unit
                                                            </button>

                                                            <button
                                                                onClick={() => navigate(`/dashboard/inventory/${unit._id}`)}
                                                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm"
                                                            >
                                                                <FaBoxes />
                                                                View Details
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            ) : (
                                <EmptyState onRefresh={fetchExpiredUnits} />
                            )}
                        </div>
                    )}
                </div>

                {/* Warning Section */}
                <WarningSection />
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <ConfirmationModal
                    selectedUnits={selectedUnits}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={handleDiscardConfirm}
                    confirmText={confirmText}
                    setConfirmText={setConfirmText}
                    discarding={discarding}
                />
            )}
        </div>
    );
};

// Helper Components
const StatCard = ({ label, value, color, icon: Icon }) => {
    const colors = {
        blue: 'from-blue-50 to-indigo-50 border-blue-200 text-blue-600 bg-blue-200',
        red: 'from-red-50 to-orange-50 border-red-200 text-red-600 bg-red-200',
        orange: 'from-orange-50 to-red-50 border-orange-200 text-orange-600 bg-orange-200',
        gray: 'from-gray-50 to-slate-50 border-gray-200 text-gray-600 bg-gray-200'
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
        <h3 className="text-xl font-medium text-gray-900 mb-2">No Expired Units</h3>
        <p className="text-gray-500 mb-4">All blood units are within their expiry period</p>
        <button
            onClick={onRefresh}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
        >
            <FaSync />
            Refresh
        </button>
    </div>
);

const WarningSection = () => (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                <FaExclamationCircle className="text-red-600" />
                Important Warning
            </h4>
            <ul className="text-sm text-red-700 space-y-1">
                <li>• Discarding units is permanent</li>
                <li>• Expired units cannot be used for transfusion</li>
                <li>• This action cannot be undone</li>
            </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                <FaClock className="text-yellow-600" />
                Before Discarding
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Verify units are truly expired</li>
                <li>• Document for regulatory compliance</li>
                <li>• Update inventory records</li>
            </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <FaCheckDouble className="text-blue-600" />
                After Discarding
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
                <li>• Units move to "discarded" status</li>
                <li>• Space freed in inventory</li>
                <li>• Report generated for records</li>
            </ul>
        </div>
    </div>
);

const ConfirmationModal = ({
    selectedUnits,
    onClose,
    onConfirm,
    confirmText,
    setConfirmText,
    discarding
}) => {
    const expectedText = 'DISCARD';
    const isValid = confirmText === expectedText;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full">
                <div className="bg-gradient-to-r from-red-700 to-red-600 px-6 py-4 rounded-t-2xl flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <FaExclamationTriangle />
                        Confirm Discard Action
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Warning */}
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="text-red-700 font-medium mb-2">
                            ⚠️ This action cannot be undone!
                        </p>
                        <p className="text-sm text-red-600">
                            You are about to discard {selectedUnits.length} expired unit
                            {selectedUnits.length > 1 ? 's' : ''}.
                            These units will be permanently removed from active inventory.
                        </p>
                    </div>

                    {/* Selected Units List */}
                    {selectedUnits.length > 0 && (
                        <div className="bg-gray-50 rounded-xl p-4 max-h-60 overflow-y-auto">
                            <p className="text-sm font-medium text-gray-700 mb-2">Units to discard:</p>
                            <ul className="space-y-2">
                                {selectedUnits.map((unit, index) => (
                                    <li key={unit._id} className="text-sm flex items-center gap-2">
                                        <FaBoxes className="text-gray-400" />
                                        <span className="font-mono">{unit.unit_number}</span>
                                        <span className="text-gray-500">-</span>
                                        <span className="text-gray-600">{unit.blood_type}</span>
                                        <span className="text-red-500 text-xs">
                                            (Expired: {new Date(unit.expiry_date).toLocaleDateString()})
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Confirmation Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type <span className="font-bold text-red-600">DISCARD</span> to confirm
                        </label>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="DISCARD"
                            autoComplete="off"
                        />
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            disabled={discarding}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={!isValid || discarding}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-red-700 to-red-600 text-white font-medium rounded-xl hover:from-red-800 hover:to-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {discarding ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    Discarding...
                                </>
                            ) : (
                                <>
                                    <FaTrash />
                                    Confirm Discard
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiscardExpired;