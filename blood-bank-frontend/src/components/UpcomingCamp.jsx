import React, { useState, useEffect } from 'react';
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaClock, 
  FaUsers,
  FaPhoneAlt,
  FaHeartbeat,
  FaShareAlt,
  FaTint,
  FaSpinner,
  FaExclamationTriangle,
} from 'react-icons/fa';
import axios from 'axios';

const UpcomingCamps = () => {
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch upcoming camps from database
  useEffect(() => {
    fetchUpcomingCamps();
  }, []);

  const fetchUpcomingCamps = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:5000/api/camps/upcoming', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      console.log('Fetched camps:', response.data);
      
      if (response.data.success) {
        // Transform database data to match component format
        const transformedCamps = response.data.camps.map(camp => ({
          id: camp._id,
          title: camp.name,
          date: new Date(camp.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          day: new Date(camp.date).toLocaleDateString('en-US', { weekday: 'long' }),
          time: `${camp.start_time} - ${camp.end_time}`,
          location: camp.location,
          volunteers: camp.volunteers || [],
          reminders_sent: camp.reminders_sent || false,
        }));
        
        setCamps(transformedCamps);
      }
    } catch (err) {
      console.error('Error fetching camps:', err);
      setError('Failed to load upcoming camps. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading upcoming camps...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white">
        <div className="text-center">
          <FaExclamationTriangle className="text-5xl text-red-600 mx-auto mb-4" />
          <p className="text-gray-800 font-semibold mb-2">Oops! Something went wrong</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchUpcomingCamps}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-red-50 to-white py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <FaCalendarAlt />
            <span>Upcoming Camps</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Join Our Next Blood Donation Camp
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Find upcoming blood donation camps in your area. Save lives by donating blood.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="text-2xl font-bold text-red-600">{camps.length}</div>
              <div className="text-sm text-gray-600">Active Camps</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="text-2xl font-bold text-red-600">
                {camps.reduce((sum, camp) => sum + camp.volunteers.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Volunteers</div>
            </div>
          </div>
        </div>

        {/* No Camps Message */}
        {camps.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl p-12 max-w-2xl mx-auto shadow-xl">
              <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Upcoming Camps</h2>
              <p className="text-gray-600 mb-6">There are no blood donation camps scheduled at the moment. Please check back later.</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        )}

        {/* Camps Grid - Simplified */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {camps.map((camp) => (
            <div 
              key={camp.id} 
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Camp Details */}
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2">{camp.title}</h2>

                {/* Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <FaCalendarAlt className="text-red-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Date</div>
                      <div className="font-semibold text-sm">{camp.date}</div>
                      <div className="text-xs text-gray-600">{camp.day}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <FaClock className="text-red-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Time</div>
                      <div className="font-semibold text-sm">{camp.time}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <FaMapMarkerAlt className="text-red-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Location</div>
                      <div className="font-semibold text-sm">{camp.location}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <FaUsers className="text-red-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Volunteers</div>
                      <div className="font-semibold text-sm">{camp.volunteers.length} assigned</div>
                    </div>
                  </div>
                </div>

                {/* View Details Button - Only button remaining */}
                <button
                  onClick={() => setSelectedCamp(camp)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <FaHeartbeat />
                  View Details
                </button>

                
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Camp Details Modal - Simplified */}
      {selectedCamp && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedCamp.title}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-gray-600">
                    <span className="flex items-center gap-2">
                      <FaCalendarAlt /> {selectedCamp.date}
                    </span>
                    <span className="flex items-center gap-2">
                      <FaClock /> {selectedCamp.time}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCamp(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Location Details */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-red-600" />
                    Location
                  </h3>
                  <p className="text-gray-700">{selectedCamp.location}</p>
                </div>

                {/* Volunteers Info */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <FaUsers className="text-red-600" />
                    Volunteers
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <span className="font-semibold">{selectedCamp.volunteers.length} volunteers</span>
                      <span>assigned to this camp</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Volunteers will be notified 2 days before the camp
                    </p>
                  </div>
                </div>

                {/* Reminder Status */}
                {selectedCamp.reminders_sent && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-700 text-sm">
                      ✓ Reminders have been sent to all volunteers
                    </p>
                  </div>
                )}

                {/* Contact Info */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <FaPhoneAlt className="text-red-600" />
                    Contact
                  </h3>
                  <p className="text-gray-700">For more information, please contact our helpline: +91 98765 43210</p>
                </div>
              </div>

              {/* Close Button */}
              <div className="mt-8 pt-6 border-t">
                <button
                  onClick={() => setSelectedCamp(null)}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingCamps;