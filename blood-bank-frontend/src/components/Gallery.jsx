import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeartbeat, FaImages, FaMapMarkerAlt } from 'react-icons/fa';

// Import images from assets folder
import camp1 from '../assets/Bdcamp_9.png';
import camp2 from '../assets/Bdcamp_5.png';
import camp3 from '../assets/Bdcamp_7.png';
import camp4 from '../assets/Bdcamp_6.png';

const GalleryHighlights = () => {
  const navigate = useNavigate();

  const gallery = [
    {
      id: 1,
      title: "Annual Blood Donation Camp - Kolar",
      image: camp1,
      location: "Kolar",
      date: "March 15, 2026"
    },
    {
      id: 2,
      title: "Volunteers at Blood Donation Drive",
      image: camp2,
      location: "Bangarapet",
      date: "February 10, 2026"
    },
    {
      id: 3,
      title: "Blood Donation Awareness Program",
      image: camp3,
      location: "Malur",
      date: "January 25, 2026"
    },
    {
      id: 4,
      title: "College Students Donating Blood",
      image: camp4,
      location: "Mulbagal",
      date: "December 5, 2025"
    }
  ];

  const handleViewFullGallery = () => {
    navigate('/gallery');
  };

  return (
    <div className="bg-linear-to-b from-white to-red-50 py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <FaImages />
            <span>Blood Donation Camps</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Highlights from Our Blood Donation Camps
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Capturing moments of generosity and life-saving donations from our recent camps
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {gallery.map((item) => (
            <div 
              key={item.id} 
              className="group relative rounded-xl overflow-hidden shadow-lg cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-4">
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">{item.title}</h3>
                  <div className="flex items-center gap-3 text-white/90 text-sm">
                    <div className="flex items-center gap-1">
                      <FaMapMarkerAlt className="text-red-300" />
                      <span>{item.location}</span>
                    </div>
                    <span className="text-white/50">|</span>
                    <span className="text-white/80">{item.date}</span>
                  </div>
                </div>
              </div>

              {/* Blood Drop Indicator */}
              <div className="absolute top-3 right-3 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <FaHeartbeat className="text-white text-sm" />
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center">
          <button 
            onClick={handleViewFullGallery}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <FaHeartbeat />
            View Full Gallery
            <span className="text-sm bg-white/20 px-2 py-1 rounded-full ml-2">
              {gallery.length}+
            </span>
          </button>
        </div>

        {/* Stats Section */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-red-600">50+</div>
            <div className="text-sm text-gray-600">Blood Donation Camps</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-red-600">10,000+</div>
            <div className="text-sm text-gray-600">Units Collected</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-red-600">5,000+</div>
            <div className="text-sm text-gray-600">Lives Saved</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-red-600">500+</div>
            <div className="text-sm text-gray-600">Active Volunteers</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryHighlights;