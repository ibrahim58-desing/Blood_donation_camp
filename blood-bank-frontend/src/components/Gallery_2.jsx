// components/Gallery.jsx
import React, { useState } from 'react';
import {
  FaHeartbeat,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaExpand,
  FaDownload,
  FaShare,
  FaInfoCircle,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaTint
} from 'react-icons/fa';

// Import images from assets folder
import img1 from '../assets/Bdcamp_10.png';
import img2 from '../assets/Bdcamp_11.png';
import img3 from '../assets/Bdcamp_12.png';
import img4 from '../assets/Bdcamp_13.png';
import img5 from '../assets/Bdcamp_19.png';
import img6 from '../assets/Bdcamp_15.png';
import img7 from '../assets/Bdcamp_16.png';
import img8 from '../assets/Bdcamp_17.png';
import img9 from '../assets/Bdcamp_18.png';

// Gallery data with imported images
const galleryImages = [
  {
    id: 1,
    src: img1,
    title: "Blood Donation Camp - City Hall",
    description: "Annual blood donation drive at City Hall with over 200 donors",
    date: "March 15, 2026",
    location: "City Hall, Mumbai",
    donors: 247,
    category: "camps",
    featured: true
  },
  {
    id: 2,
    src: img2,
    title: "Emergency Blood Drive",
    description: "Emergency blood drive organized after natural disaster",
    date: "February 10, 2026",
    location: "Community Center, Pune",
    donors: 189,
    category: "emergency",
    featured: false
  },
  {
    id: 3,
    src: img3,
    title: "College Youth Donation Camp",
    description: "College students enthusiastically participating in blood donation",
    date: "January 25, 2026",
    location: "Mumbai University",
    donors: 312,
    category: "camps",
    featured: true
  },
  {
    id: 4,
    src: img4,
    title: "Corporate Donation Drive",
    description: "IT company employees donating blood for a noble cause",
    date: "December 5, 2025",
    location: "Infosys Campus, Bangalore",
    donors: 156,
    category: "corporate",
    featured: false
  },
  {
    id: 5,
    src: img5,
    title: "Rural Health Camp",
    description: "Bringing blood donation awareness to rural areas",
    date: "November 18, 2025",
    location: "Village Health Center, Satara",
    donors: 98,
    category: "rural",
    featured: false
  },
  {
    id: 6,
    src: img6,
    title: "Medical College Donation",
    description: "Future doctors leading by example",
    date: "October 22, 2025",
    location: "Grant Medical College, Mumbai",
    donors: 234,
    category: "camps",
    featured: true
  },
  {
    id: 7,
    src: img7,
    title: "Rotary Club Initiative",
    description: "Rotary Club members organizing mega donation camp",
    date: "September 8, 2025",
    location: "Rotary Hall, Delhi",
    donors: 178,
    category: "corporate",
    featured: false
  },
  {
    id: 8,
    src: img8,
    title: "Women's Special Camp",
    description: "Exclusive blood donation camp for women donors",
    date: "August 14, 2025",
    location: "Women's College, Nagpur",
    donors: 145,
    category: "special",
    featured: false
  },
  {
    id: 9,
    src: img9,
    title: "Religious Organization Support",
    description: "Temple trust organizing blood donation on festival day",
    date: "July 30, 2025",
    location: "Gurudwara, Amritsar",
    donors: 267,
    category: "camps",
    featured: true
  }
];

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter images based on category and search
  const filteredImages = galleryImages.filter(img => {
    const matchesFilter = filter === 'all' || img.category === filter;
    const matchesSearch = img.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         img.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Handle image click to open lightbox
  const handleImageClick = (image, index) => {
    setSelectedImage(image);
    setCurrentIndex(index);
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  };

  // Close lightbox
  const handleCloseLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto'; // Re-enable scrolling
  };

  // Navigate to previous image
  const handlePrev = () => {
    const newIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    setCurrentIndex(newIndex);
    setSelectedImage(filteredImages[newIndex]);
  };

  // Navigate to next image
  const handleNext = () => {
    const newIndex = (currentIndex + 1) % filteredImages.length;
    setCurrentIndex(newIndex);
    setSelectedImage(filteredImages[newIndex]);
  };

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImage) return;
      
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') handleCloseLightbox();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, currentIndex]);

  // Get unique categories for filter buttons
  const categories = ['all', ...new Set(galleryImages.map(img => img.category))];

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 via-white to-red-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
            <FaHeartbeat className="text-white" />
            <span>Our Impact in Pictures</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Blood Donation Gallery
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Capturing moments of compassion, hope, and life-saving donations
          </p>
        </div>

        {/* Filter and Search Bar */}
        
       

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image, index) => (
            <div
              key={image.id}
              onClick={() => handleImageClick(image, index)}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
            >
              {/* Image */}
              <img
                src={image.src}
                alt={image.title}
                className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">{image.title}</h3>
                  <p className="text-sm text-gray-200 mb-3 line-clamp-2">{image.description}</p>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-300">
                    <div className="flex items-center gap-1">
                      <FaCalendarAlt />
                      <span>{image.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaMapMarkerAlt />
                      <span>{image.location}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaUsers className="text-red-400" />
                      <span className="font-bold">{image.donors}+ Donors</span>
                    </div>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>

              {/* Featured Badge */}
              {image.featured && (
                <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <FaHeartbeat className="text-red-600" />
                  Featured
                </div>
              )}

              {/* Category Badge */}
              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs">
                {image.category}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredImages.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaHeartbeat className="text-red-600 text-4xl" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No images found</h3>
            <p className="text-gray-500">Try adjusting your search or filter</p>
          </div>
        )}

        
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={handleCloseLightbox}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/50 p-3 rounded-full transition-colors z-10"
          >
            <FaTimes className="text-2xl" />
          </button>

          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white bg-black/50 p-4 rounded-full transition-colors z-10"
          >
            <FaChevronLeft className="text-2xl" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white bg-black/50 p-4 rounded-full transition-colors z-10"
          >
            <FaChevronRight className="text-2xl" />
          </button>

          {/* Image and Details */}
          <div className="max-w-6xl mx-auto px-4 flex flex-col lg:flex-row gap-8 items-center">
            {/* Image */}
            <div className="lg:w-2/3">
              <img
                src={selectedImage.src}
                alt={selectedImage.title}
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>

            {/* Details */}
            <div className="lg:w-1/3 text-white space-y-6">
              <h2 className="text-3xl font-bold">{selectedImage.title}</h2>
              <p className="text-gray-300 text-lg">{selectedImage.description}</p>

              <div className="space-y-4 bg-white/10 p-6 rounded-xl">
                <div className="flex items-center gap-3">
                  <FaCalendarAlt className="text-red-400 text-xl" />
                  <div>
                    <p className="text-sm text-gray-400">Event Date</p>
                    <p className="font-semibold">{selectedImage.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FaMapMarkerAlt className="text-red-400 text-xl" />
                  <div>
                    <p className="text-sm text-gray-400">Location</p>
                    <p className="font-semibold">{selectedImage.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FaUsers className="text-red-400 text-xl" />
                  <div>
                    <p className="text-sm text-gray-400">Total Donors</p>
                    <p className="font-semibold">{selectedImage.donors}+ Donors</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FaTint className="text-red-400 text-xl" />
                  <div>
                    <p className="text-sm text-gray-400">Category</p>
                    <p className="font-semibold capitalize">{selectedImage.category}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                  <FaDownload />
                  Download
                </button>
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                  <FaShare />
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/70 bg-black/50 px-4 py-2 rounded-full text-sm">
            {currentIndex + 1} / {filteredImages.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;