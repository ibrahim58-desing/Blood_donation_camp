import React, { useState, useEffect } from 'react';
import { API_URL } from "../api.js";
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaClock, 
  FaHeartbeat,
  FaSpinner,
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight,
  FaPhoneAlt,
  FaFileAlt
} from 'react-icons/fa';
import axios from 'axios';

const UpcomingCamps = () => {
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [campsPerPage] = useState(6);

  // Fetch upcoming camps from database
  useEffect(() => {
    fetchUpcomingCamps();
  }, []);

  const fetchUpcomingCamps = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`${API_URL}/api/camps/upcoming`);
      
      console.log('Fetched camps response:', response.data);
      
      if (response.data.success) {
        // Transform database data to match component format
        const transformedCamps = response.data.camps.map(camp => ({
          id: camp._id,
          title: camp.name,
          rawDate: new Date(camp.date),
          date: new Date(camp.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          day: new Date(camp.date).toLocaleDateString('en-US', { weekday: 'long' }),
          start_time: camp.start_time,
          end_time: camp.end_time,
          time: `${formatTimeForDisplay(camp.start_time)} - ${formatTimeForDisplay(camp.end_time)}`,
          location: camp.location,
          address: camp.address || camp.location,
          description: camp.description || '',
          reminders_sent: camp.reminders_sent || false,
          isPast: new Date(camp.date) < new Date()
        }));
        
        // Filter out past camps
        const upcomingCamps = transformedCamps.filter(camp => !camp.isPast);
        
        // Sort by date (closest first)
        upcomingCamps.sort((a, b) => a.rawDate - b.rawDate);
        
        setCamps(upcomingCamps);
      }
    } catch (err) {
      console.error('Error fetching camps:', err);
      setError('Failed to load upcoming camps. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Format time for display (AM/PM)
  const formatTimeForDisplay = (timeValue) => {
    if (!timeValue) return '';
    
    if (timeValue.includes('AM') || timeValue.includes('PM')) {
      return timeValue;
    }
    
    if (timeValue.match(/^\d{2}:\d{2}$/)) {
      const [hour, minute] = timeValue.split(':');
      const h = parseInt(hour);
      const period = h < 12 ? 'AM' : 'PM';
      const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
      return `${displayHour}:${minute} ${period}`;
    }
    
    return timeValue;
  };

  // Get month abbreviation
  const getMonthAbbr = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  };

  // Get day of month
  const getDayOfMonth = (dateStr) => {
    const date = new Date(dateStr);
    return date.getDate();
  };

  // Pagination
  const indexOfLastCamp = currentPage * campsPerPage;
  const indexOfFirstCamp = indexOfLastCamp - campsPerPage;
  const currentCamps = camps.slice(indexOfFirstCamp, indexOfLastCamp);
  const totalPages = Math.ceil(camps.length / campsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    document.getElementById('camps-grid').scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-b from-red-50 to-white py-16">
        <div className="text-center">
          <div className="relative">
            <FaHeartbeat className="text-6xl text-red-600 mx-auto mb-4 animate-pulse" />
            <FaSpinner className="animate-spin text-4xl text-red-600 mx-auto absolute top-0 left-1/2 transform -translate-x-1/2" />
          </div>
          <p className="text-gray-600 text-lg mt-8">Loading upcoming camps...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[500px] flex items-center justify-center bg-gradient-to-b from-red-50 to-white py-16">
        <div className="text-center max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="text-4xl text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchUpcomingCamps}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="camps-grid" className="bg-gradient-to-b from-red-50 to-white py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg mb-6">
            <FaCalendarAlt className="text-white" />
            <span>UPCOMING BLOOD DONATION CAMPS</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Join Our Next <span className="text-red-600">Life-Saving</span> Mission
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Find upcoming blood donation camps in your area. Every drop counts, every life matters.
          </p>

          {/* Stats - Simplified to just show camp count */}
          {camps.length > 0 && (
            <div className="grid grid-cols-1 gap-4 max-w-xs mx-auto">
              <div className="bg-white rounded-xl p-6 shadow-md border border-red-100">
                <div className="text-3xl font-bold text-red-600 mb-1">{camps.length}</div>
                <div className="text-gray-600 font-medium">Upcoming Camps</div>
                <div className="w-12 h-1 bg-red-200 rounded-full mx-auto mt-3"></div>
              </div>
            </div>
          )}
        </div>

        {/* No Camps Message */}
        {camps.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl p-12 max-w-2xl mx-auto shadow-xl border border-red-100">
              <div className="bg-red-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCalendarAlt className="text-5xl text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">No Upcoming Camps</h2>
              <p className="text-gray-600 mb-8 text-lg">There are no blood donation camps scheduled at the moment. Please check back later.</p>
              <button 
                onClick={fetchUpcomingCamps}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
              >
                Refresh
              </button>
            </div>
          </div>
        )}

        {/* Camps Grid */}
        {camps.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {currentCamps.map((camp) => (
                <div 
                  key={camp.id} 
                  className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group border border-red-100"
                  onClick={() => setSelectedCamp(camp)}
                >
                  {/* Date Badge */}
                  <div className="relative">
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg z-10">
                      <div className="text-center">
                        <div className="text-sm font-bold text-red-600">{getMonthAbbr(camp.rawDate)}</div>
                        <div className="text-2xl font-bold text-gray-800">{getDayOfMonth(camp.rawDate)}</div>
                      </div>
                    </div>
                    
                    {/* Header Gradient */}
                    <div className="h-24 bg-gradient-to-r from-red-600 to-red-700 relative overflow-hidden">
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white rounded-full"></div>
                        <div className="absolute -right-8 -top-8 w-32 h-32 border-8 border-white/20 rounded-full"></div>
                      </div>
                      
                      {/* Reminder Badge */}
                      {camp.reminders_sent && (
                        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                          ✓ Notified
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Camp Details */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-red-600 transition-colors">
                      {camp.title}
                    </h3>

                    <div className="space-y-4">
                      {/* Date */}
                      <div className="flex items-start gap-3">
                        <div className="bg-red-50 p-2 rounded-lg mt-0.5">
                          <FaCalendarAlt className="text-red-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">DATE</p>
                          <p className="font-semibold text-gray-800">{camp.date}</p>
                          <p className="text-xs text-gray-500">{camp.day}</p>
                        </div>
                      </div>

                      {/* Time */}
                      <div className="flex items-start gap-3">
                        <div className="bg-red-50 p-2 rounded-lg mt-0.5">
                          <FaClock className="text-red-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">TIME</p>
                          <p className="font-semibold text-gray-800">{camp.time}</p>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-start gap-3">
                        <div className="bg-red-50 p-2 rounded-lg mt-0.5">
                          <FaMapMarkerAlt className="text-red-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">LOCATION</p>
                          <p className="font-semibold text-gray-800 line-clamp-1">{camp.location}</p>
                          {camp.address !== camp.location && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{camp.address}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCamp(camp);
                      }}
                      className="w-full mt-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                      <FaHeartbeat />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 shadow-md hover:shadow-lg'
                  }`}
                >
                  <FaChevronLeft />
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                      currentPage === index + 1
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg scale-110'
                        : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 shadow-md hover:shadow-lg'
                  }`}
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Camp Details Modal - Volunteers section removed */}
      {selectedCamp && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 sticky top-0">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FaHeartbeat className="text-white" />
                  Camp Details
                </h2>
                <button
                  onClick={() => setSelectedCamp(null)}
                  className="text-white/80 hover:text-white transition-colors text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Camp Title */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{selectedCamp.title}</h3>

              {/* Date and Time Row */}
              <div className="bg-red-50 rounded-xl p-4 mb-6">
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg">
                      <FaCalendarAlt className="text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="font-semibold text-gray-900">{selectedCamp.date}</p>
                      <p className="text-xs text-gray-600">{selectedCamp.day}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg">
                      <FaClock className="text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Time</p>
                      <p className="font-semibold text-gray-900">{selectedCamp.time}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-red-600" />
                  Location
                </h4>
                <p className="text-gray-700 font-medium">{selectedCamp.location}</p>
                {selectedCamp.address && selectedCamp.address !== selectedCamp.location && (
                  <p className="text-gray-600 text-sm mt-1">{selectedCamp.address}</p>
                )}
              </div>

              {/* Description */}
              {selectedCamp.description && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <FaFileAlt className="text-red-600" />
                    About
                  </h4>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-xl">{selectedCamp.description}</p>
                </div>
              )}

              {/* Reminder Status */}
              {selectedCamp.reminders_sent && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <p className="text-green-700 text-sm flex items-center gap-2">
                    <span className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">✓</span>
                    Reminders have been sent to all volunteers
                  </p>
                </div>
              )}

              {/* Contact */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FaPhoneAlt className="text-red-600" />
                  Contact
                </h4>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-600 mb-2">For more information, please contact:</p>
                  <p className="text-red-600 font-bold text-lg">+91 98765 43210</p>
                  <p className="text-xs text-gray-500 mt-2">24/7 Helpline</p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedCamp(null)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingCamps;