import React from 'react';
import { 
  FaHeartbeat, 
  FaMapMarkerAlt, 
  FaUsers, 
  FaCalendarAlt,
  FaHandsHelping,
  FaTint,
  FaHospital
} from 'react-icons/fa';

// Import local images
import campPhoto1 from '../assets/';
import campPhoto2 from '../assets/images/image-22.jpg';
import campPhoto3 from '../assets/images/images-3.jpg';
import volunteerPhoto from '../assets/images/volunteer-1.jpg';
import communityPhoto from '../assets/images/community-1.jpg';

const AboutUs = () => {
  // Use local images or fallback placeholders
  const images = {
    camp1: campPhoto1 || 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    camp2: campPhoto2 || 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    camp3: campPhoto3 || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    volunteers: volunteerPhoto || 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    community: communityPhoto || 'https://images.unsplash.com/photo-1584467735871-8db9ac8c71ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  };

  return (
    <div className="bg-gradient-to-b from-white to-red-50 py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <FaHeartbeat />
            <span>About MEGA</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Medical Emergency Group Association
          </h1>
          
          <p className="text-xl text-gray-600">
            Serving Kolar District and surrounding areas since 2015
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Who We Are</h2>
              <p className="text-gray-600 mb-4">
                MEGA (Medical Emergency Group Association) is a community-based non-profit organization 
                dedicated to providing emergency blood support to residents of Kolar district and neighboring areas.
              </p>
              <p className="text-gray-600">
                Founded by local healthcare professionals and community leaders, we bridge the gap between 
                blood donors and patients in need, ensuring timely access to safe blood.
              </p>
            </div>

            <div className="bg-red-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <FaMapMarkerAlt className="text-red-600 text-xl" />
                <h3 className="text-xl font-bold text-gray-900">Our Coverage Area</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Kolar', 'Bangarapet', 'Malur', 'Mulbagal', 'Srinivaspur', 'Chintamani', 'Bagepalli', 'Gudibanda'].map((area, index) => (
                  <span key={index} className="bg-white text-red-700 px-3 py-1 rounded-full text-sm shadow-sm">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <img 
              src={images.camp1} 
              alt="MEGA blood donation camp" 
              className="rounded-2xl shadow-xl w-full h-[400px] object-cover"
            />
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <FaUsers className="text-3xl text-red-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-gray-900 mb-2">2,500+</div>
            <div className="text-gray-600">Registered Donors</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <FaCalendarAlt className="text-3xl text-red-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-gray-900 mb-2">200+</div>
            <div className="text-gray-600">Camps Organized</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <FaTint className="text-3xl text-red-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-gray-900 mb-2">5,000+</div>
            <div className="text-gray-600">Units Collected</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <FaHospital className="text-3xl text-red-600 mx-auto mb-4" />
            <div className="text-3xl font-bold text-gray-900 mb-2">1,200+</div>
            <div className="text-gray-600">Lives Saved</div>
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Work in Pictures</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative rounded-2xl overflow-hidden shadow-xl group">
              <img 
                src={images.camp2} 
                alt="Blood donation camp" 
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <div className="text-white">
                  <h3 className="text-xl font-bold mb-2">Regular Camps</h3>
                  <p className="text-sm opacity-90">Monthly blood donation drives</p>
                </div>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-xl group">
              <img 
                src={images.volunteers} 
                alt="MEGA volunteers" 
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <div className="text-white">
                  <h3 className="text-xl font-bold mb-2">Our Volunteers</h3>
                  <p className="text-sm opacity-90">Trained community members</p>
                </div>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-xl group">
              <img 
                src={images.community} 
                alt="Community outreach" 
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <div className="text-white">
                  <h3 className="text-xl font-bold mb-2">Awareness Programs</h3>
                  <p className="text-sm opacity-90">Educating the community</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How We Work */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How We Work</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaHandsHelping className="text-2xl text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Donor Registration</h3>
              <p className="text-gray-600">
                Local residents register as blood donors through our camps or website
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaHeartbeat className="text-2xl text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Emergency Response</h3>
              <p className="text-gray-600">
                We connect donors with patients in need within our service area
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCalendarAlt className="text-2xl text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Regular Camps</h3>
              <p className="text-gray-600">
                Monthly blood donation camps across different locations
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl shadow-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-6">Join Our Mission</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Help us save more lives in our community. Your donation can make a difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-red-600 hover:bg-red-50 px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
                Become a Donor
              </button>
              <button className="bg-transparent border-2 border-white hover:bg-white/20 px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;