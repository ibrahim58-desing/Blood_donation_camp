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
  FaEnvelope
} from 'react-icons/fa';

const CampList = () => {
  const navigate = useNavigate();
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');

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
      
      alert(`Reminders sent to ${response.data.emails_sent} volunteers!`);
      fetchCamps();
    } catch (err) {
      alert('Failed to send reminders');
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
          <FaClock /> {diffDays} days left
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Blood Donation Camps</h1>
          
          <div className="flex items-center gap-4">
            <button
              onClick={fetchCamps}
              className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg"
            >
              <FaSync className={loading ? 'animate-spin' : ''} />
            </button>
            
            {userRole === 'admin' && (
              <button
                onClick={() => navigate('/camps/create')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <FaPlus />
                New Camp
              </button>
            )}
          </div>
        </div>

        {/* Camps Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <FaSpinner className="animate-spin text-4xl text-green-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-xl text-red-700">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {camps.map((camp) => (
              <div key={camp._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-teal-600 px-4 py-3">
                  <h3 className="text-white font-semibold">{camp.name}</h3>
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
                    <span>{camp.start_time} - {camp.end_time}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaMapMarkerAlt className="text-green-600" />
                    <span className="truncate">{camp.location}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CampList;