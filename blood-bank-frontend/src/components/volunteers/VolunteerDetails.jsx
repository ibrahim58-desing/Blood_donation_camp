// components/volunteers/VolunteerDetails.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL } from "../api.js";
import axios from 'axios';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaCity, 
  FaGlobe, 
  FaMapPin,
  FaSpinner,
  FaArrowLeft,
  FaCalendarAlt,
  FaClock
} from 'react-icons/fa';

const VolunteerDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVolunteerDetails();
  }, [id]);

  const fetchVolunteerDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/volunteers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setVolunteer(response.data.volunteer);
    } catch (err) {
      setError('Failed to load volunteer details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <FaSpinner className="animate-spin text-4xl text-green-600" />
      </div>
    );
  }

  if (error || !volunteer) {
    return (
      <div className="min-h-screen p-8">
        <div className="bg-red-50 p-4 rounded-xl text-red-700">{error || 'Volunteer not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/volunteers/list')}
          className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6"
        >
          <FaArrowLeft />
          Back to Volunteers
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-teal-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Volunteer Details</h1>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailCard 
                icon={<FaUser className="text-green-600" />}
                label="Full Name"
                value={volunteer.name}
              />
              <DetailCard 
                icon={<FaEnvelope className="text-green-600" />}
                label="Email"
                value={volunteer.email}
              />
              <DetailCard 
                icon={<FaPhone className="text-green-600" />}
                label="Phone"
                value={volunteer.phone}
              />
              <DetailCard 
                icon={<FaMapMarkerAlt className="text-green-600" />}
                label="Address"
                value={volunteer.address}
              />
              <DetailCard 
                icon={<FaCity className="text-green-600" />}
                label="City"
                value={volunteer.city}
              />
              <DetailCard 
                icon={<FaGlobe className="text-green-600" />}
                label="State"
                value={volunteer.state}
              />
              <DetailCard 
                icon={<FaMapPin className="text-green-600" />}
                label="Pincode"
                value={volunteer.pincode}
              />
              <DetailCard 
                icon={<FaCalendarAlt className="text-green-600" />}
                label="Registered On"
                value={formatDate(volunteer.createdAt)}
              />
            </div>

            {/* Assigned Camps Section */}
            {volunteer.assigned_camps && volunteer.assigned_camps.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Camps</h2>
                <div className="space-y-3">
                  {volunteer.assigned_camps.map((camp) => (
                    <div key={camp._id} className="bg-green-50 p-4 rounded-xl border border-green-200">
                      <h3 className="font-semibold text-green-800">{camp.name}</h3>
                      <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FaCalendarAlt className="text-green-600" />
                          {new Date(camp.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <FaClock className="text-green-600" />
                          {camp.start_time} - {camp.end_time}
                        </div>
                        <div className="col-span-2 flex items-center gap-2 text-gray-600">
                          <FaMapMarkerAlt className="text-green-600" />
                          {camp.location}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailCard = ({ icon, label, value }) => (
  <div className="bg-gray-50 p-4 rounded-xl">
    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
      {icon}
      {label}
    </div>
    <p className="text-gray-900 font-medium">{value}</p>
  </div>
);

export default VolunteerDetails;