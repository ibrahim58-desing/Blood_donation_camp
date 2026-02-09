import React, { useState } from 'react';
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaClock, 
  FaUsers,
  FaPhoneAlt,
  FaHeartbeat,
  FaArrowRight,
  FaShareAlt,
  FaRegCalendarPlus,
  FaTint,
  FaHospital,
  FaUserMd
} from 'react-icons/fa';

const UpcomingCamps = () => {
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [registeredCamps, setRegisteredCamps] = useState([]);

  // Upcoming blood donation camps data
  const upcomingCamps = [
    {
      id: 1,
      title: "MEGA Monthly Blood Donation Camp",
      date: "December 15, 2023",
      day: "Friday",
      time: "9:00 AM - 4:00 PM",
      location: "Kolar City Hospital Campus",
      address: "Hospital Road, Kolar - 563101",
      organizer: "MEGA in association with District Health Department",
      targetUnits: 200,
      registeredDonors: 145,
      slotsAvailable: 55,
      requirements: "Age 18-65, Weight >45kg, No illness in last 2 weeks",
      benefits: ["Certificate", "Refreshments", "Health Checkup", "Gift Hamper"],
      contact: "+91 98765 43210",
      mapLink: "#",
      image: (() => {
        try {
          return require('../assets/images/camps/kolar-hospital-camp.jpg');
        } catch {
          return 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
        }
      })()
    },
    {
      id: 2,
      title: "Youth Blood Donation Drive",
      date: "December 18, 2023",
      day: "Monday",
      time: "10:00 AM - 5:00 PM",
      location: "Government College Kolar",
      address: "College Road, Kolar - 563101",
      organizer: "MEGA & NSS Unit, Government College",
      targetUnits: 150,
      registeredDonors: 120,
      slotsAvailable: 30,
      requirements: "College ID required, Age 18+",
      benefits: ["Certificate", "Refreshments", "Blood Donor Card", "College Credits"],
      contact: "+91 98765 43211",
      mapLink: "#",
      image: (() => {
        try {
          return require('../assets/images/camps/college-drive.jpg');
        } catch {
          return 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
        }
      })()
    },
   
    
    
  ];

  // Register for a camp
  const handleRegister = (campId) => {
    if (!registeredCamps.includes(campId)) {
      setRegisteredCamps([...registeredCamps, campId]);
      alert('Successfully registered for the camp! You will receive confirmation via SMS.');
    }
  };

  // Check if user is registered for a camp
  const isRegistered = (campId) => registeredCamps.includes(campId);

  return (
    <div className="bg-linear-to-b from-red-50 to-white py-16 md:py-24">
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
            Find upcoming blood donation camps in Kolar district. Book your slot and save lives.
          </p>

          
          
        </div>
        {/* Camps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {upcomingCamps.map((camp) => (
            <div 
              key={camp.id} 
              className={`bg-white rounded-2xl shadow-xl overflow-hidden border-2 ${isRegistered(camp.id) ? 'border-green-500' : 'border-transparent'}`}
            >
              {/* Camp Image */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={camp.image} 
                  alt={camp.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {camp.day}
                </div>
                {isRegistered(camp.id) && (
                  <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Registered
                  </div>
                )}
              </div>

              {/* Camp Details */}
              <div className="p-6">
               

                {/* Details Row */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <FaCalendarAlt className="text-red-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Date</div>
                      <div className="font-semibold">{camp.date}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <FaClock className="text-red-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Time</div>
                      <div className="font-semibold">{camp.time}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <FaMapMarkerAlt className="text-red-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Location</div>
                      <div className="font-semibold">{camp.location}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <FaUsers className="text-red-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Target</div>
                      <div className="font-semibold">{camp.targetUnits} units</div>
                    </div>
                  </div>
                </div>

               

                
              </div>
            </div>
          ))}
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Donate Blood?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTint className="text-2xl text-red-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">One Donation, Three Lives</h3>
              <p className="text-gray-600 text-sm">
                A single blood donation can save up to three lives through different blood components
              </p>
            </div>

            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaHospital className="text-2xl text-red-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Local Impact</h3>
              <p className="text-gray-600 text-sm">
                Your donation stays in Kolar district, helping neighbors and community members
              </p>
            </div>

            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUserMd className="text-2xl text-red-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Health Benefits</h3>
              <p className="text-gray-600 text-sm">
                Regular blood donation reduces risk of heart disease and burns calories
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
       
      </div>

      {/* Camp Details Modal */}
      {selectedCamp && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedCamp.title}</h2>
                  <div className="flex items-center gap-4 text-gray-600">
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div>
                  <img 
                    src={selectedCamp.image} 
                    alt={selectedCamp.title}
                    className="w-full h-64 object-cover rounded-xl mb-6"
                  />

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Location Details</h3>
                      <div className="flex items-start gap-3">
                        <FaMapMarkerAlt className="text-red-600 mt-1" />
                        <div>
                          <p className="font-semibold">{selectedCamp.location}</p>
                          <p className="text-gray-600">{selectedCamp.address}</p>
                          <a href={selectedCamp.mapLink} className="text-red-600 hover:text-red-700 text-sm">
                            View on Google Maps →
                          </a>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Organized By</h3>
                      <p className="text-gray-600">{selectedCamp.organizer}</p>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Contact Information</h3>
                      <div className="flex items-center gap-3">
                        <FaPhoneAlt className="text-red-600" />
                        <a href={`tel:${selectedCamp.contact}`} className="text-gray-600 hover:text-red-600">
                          {selectedCamp.contact}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <div className="bg-red-50 rounded-xl p-6 mb-6">
                    <h3 className="font-bold text-gray-900 mb-4">Camp Statistics</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Target Units</span>
                          <span>{selectedCamp.targetUnits}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-red-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Registered Donors</span>
                          <span>{selectedCamp.registeredDonors}/{selectedCamp.targetUnits}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(selectedCamp.registeredDonors / selectedCamp.targetUnits) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Slots Available</span>
                          <span>{selectedCamp.slotsAvailable}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(selectedCamp.slotsAvailable / selectedCamp.targetUnits) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Eligibility Requirements</h3>
                      <p className="text-gray-600">{selectedCamp.requirements}</p>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Donor Benefits</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedCamp.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                            <span className="text-gray-600 text-sm">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8 pt-6 border-t">
                <button
                  onClick={() => {
                    handleRegister(selectedCamp.id);
                    setSelectedCamp(null);
                  }}
                  disabled={isRegistered(selectedCamp.id)}
                  className={`flex-1 py-3 rounded-xl font-semibold ${
                    isRegistered(selectedCamp.id)
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {isRegistered(selectedCamp.id) ? 'Already Registered' : 'Register for this Camp'}
                </button>
                <button className="px-6 py-3 border-2 border-red-600 text-red-600 hover:bg-red-50 rounded-xl font-semibold flex items-center gap-2">
                  <FaShareAlt />
                  Share Camp Details
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