import React from 'react';
import { FaHeartbeat, FaImages, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';

const GalleryHighlights = () => {
  const gallery = [
    {
      id: 1,
      title: "Blood Camp Success",
      image: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      location: "Kolar"
    },
    {
      id: 2,
      title: "Volunteer Team",
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      location: "Bangarapet"
    },
    {
      id: 3,
      title: "Awareness Program",
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      location: "Malur"
    },
    {
      id: 4,
      title: "College Drive",
      image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      location: "Mulbagal"
    }
  ];

  return (
    <div className="bg-linear-to-b from-white to-red-50 py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <FaImages />
            <span>Gallery</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Highlights from Our Journey
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Capturing moments that define our mission to save lives
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {gallery.map((item) => (
            <div key={item.id} className="group relative rounded-xl overflow-hidden shadow-lg">
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent flex items-end p-4">
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">{item.title}</h3>
                  <div className="flex items-center gap-2 text-white/90 text-sm">
                    <FaMapMarkerAlt className="text-red-300" />
                    <span>{item.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View More */}
        <div className="text-center">
          <button className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            <FaHeartbeat />
            View Full Gallery
          </button>
        </div>
      </div>
    </div>
  );
};

export default GalleryHighlights;