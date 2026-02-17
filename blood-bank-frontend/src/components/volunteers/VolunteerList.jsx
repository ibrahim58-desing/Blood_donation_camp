// components/volunteers/VolunteerList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FaMapMarkerAlt
} from 'react-icons/fa';

const VolunteerList = () => {
  const navigate = useNavigate();
  const [volunteers, setVolunteers] = useState([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
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
    fetchVolunteers();
  }, [navigate]);

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/volunteers', {
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
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.city.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVolunteers(filtered);
  }, [searchTerm, volunteers]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/volunteers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchVolunteers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete volunteer');
    }
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
              className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg"
            >
              <FaSync className={loading ? 'animate-spin' : ''} />
            </button>
            
            {(userRole === 'admin' || userRole === 'technician') && (
              <button
                onClick={() => navigate('/volunteers/register')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <FaUserPlus />
                Add Volunteer
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <input
            type="text"
            placeholder="Search volunteers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-12 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        {/* Volunteers Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <FaSpinner className="animate-spin text-4xl text-green-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-xl text-red-700">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVolunteers.map((volunteer) => (
              <div key={volunteer._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="bg-gradient-to-r from-green-600 to-teal-600 px-4 py-3 flex justify-between items-center">
                  <h3 className="text-white font-semibold truncate">{volunteer.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/volunteers/${volunteer._id}`)}
                      className="text-white hover:text-green-200"
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    {(userRole === 'admin' || userRole === 'technician') && (
                      <>
                        <button
                          onClick={() => navigate(`/volunteers/edit/${volunteer._id}`)}
                          className="text-white hover:text-green-200"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        {userRole === 'admin' && (
                          <button
                            onClick={() => handleDelete(volunteer._id, volunteer.name)}
                            className="text-white hover:text-red-200"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaEnvelope className="text-green-600" />
                    <span className="text-sm truncate">{volunteer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaPhone className="text-green-600" />
                    <span className="text-sm">{volunteer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaMapMarkerAlt className="text-green-600" />
                    <span className="text-sm truncate">{volunteer.city}, {volunteer.state}</span>
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

export default VolunteerList;