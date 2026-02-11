import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaHeartbeat,
  FaHome,
  FaHandsHelping,
  FaInfoCircle,
  FaUser,
  FaUserPlus,
  FaBars,
  FaTimes,
  FaStethoscope,
  FaAmbulance,
  FaHandHoldingHeart,
  FaUsers,
  FaArrowRight,
  FaStar,
  FaSignOutAlt,
  FaTachometerAlt
} from 'react-icons/fa';

const Navbar = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Home');
  const [isOpen, setIsOpen] = useState(false);
  const [isAboutSection, setIsAboutSection] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const observerRef = useRef(null);

  // Conditionally show Login or Dashboard based on auth status
  const menuItems = [
    { id: 1, name: 'Home', icon: <FaHome />, path: '/' },
    { id: 2, name: 'Request', icon: <FaHandsHelping />, path: '/request' },
    { id: 3, name: 'About Us', icon: <FaInfoCircle />, path: '/#about-section' },
    ...(isLoggedIn 
      ? [{ id: 4, name: 'Dashboard', icon: <FaTachometerAlt />, path: '/dashboard' }]
      : [{ id: 4, name: 'Login', icon: <FaUser />, path: '/login' }]
    ),
  ];

  const aboutIcons = [
    <FaStethoscope key="doctor" />,
    <FaAmbulance key="ambulance" />,
    <FaHandHoldingHeart key="help" />,
    <FaUsers key="team" />
  ];

  const handleTabClick = (itemName) => {
    setActiveTab(itemName);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserRole('');
    setActiveTab('Home');
    navigate('/');
  };

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.pageYOffset > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setIsLoggedIn(true);
      const userData = JSON.parse(user);
      setUserRole(userData.role);
      
      // If on login page, don't set active tab to Login
      if (window.location.pathname === '/login') {
        setActiveTab('Dashboard');
      }
    } else {
      setIsLoggedIn(false);
      setUserRole('');
    }
  }, [window.location.pathname]);

  // Intersection Observer for About section
  useEffect(() => {
    const aboutSection = document.getElementById('about-section');
    if (!aboutSection) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          setIsAboutSection(entry.isIntersecting);
        });
      },
      {
        threshold: 0.3,
        rootMargin: '-100px 0px 0px 0px'
      }
    );

    observerRef.current.observe(aboutSection);
    return () => observerRef.current?.disconnect();
  }, []);

  const navbarBackground = isAboutSection
    ? 'bg-gradient-to-b from-white via-red-50/95 to-white/95'
    : 'bg-white/95 backdrop-blur-md';

  const logoColor = isAboutSection ? 'text-red-700' : 'text-red-600';

  return (
    <nav
      className={`
        ${navbarBackground}
        backdrop-blur-lg
        sticky top-0 z-50 
        border-b 
        ${isAboutSection ? 'border-red-200/50' : 'border-gray-100'}
        transition-all duration-500
        ${scrolled ? 'h-16' : 'h-20'}
        shadow-lg ${isAboutSection ? 'shadow-red-100/50' : 'shadow-gray-100/50'}
      `}
    >
      {/* Animated floating elements in About section */}
      {isAboutSection && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          {aboutIcons.map((icon, index) => (
            <div
              key={index}
              className="absolute text-red-200/40"
              style={{
                top: `${10 + index * 20}%`,
                left: `${index * 25}%`,
                fontSize: '1.8rem',
                animation: `float 10s ease-in-out infinite ${index * 1}s`
              }}
            >
              {icon}
            </div>
          ))}
          <style jsx>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.4; }
              50% { transform: translateY(-30px) rotate(180deg); opacity: 0.2; }
            }
          `}</style>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? 'h-16' : 'h-20'
          }`}>
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className={`
              flex items-center justify-center
              transition-all duration-500
              ${isAboutSection
                ? 'bg-linear-to-br from-red-500 to-pink-500 shadow-lg shadow-red-300/50'
                : 'bg-linear-to-br from-red-600 to-red-500'
              }
              ${scrolled ? 'w-10 h-10' : 'w-12 h-12'}
              rounded-full
              group-hover:scale-110
              group-hover:rotate-12
              shadow-lg
            `}>
              <FaHeartbeat className="text-white text-lg md:text-xl" />
            </div>
            <div>
              <h1 className={`
                font-bold transition-all duration-500
                ${scrolled ? 'text-xl' : 'text-2xl'}
                ${logoColor}
                group-hover:text-red-700
              `}>
                M<span className="text-red-600">EGA</span>
              </h1>
              <p className={`
                text-xs text-gray-600 transition-all duration-300
                ${scrolled ? 'opacity-0 h-0' : 'opacity-100 h-auto'}
                ${isAboutSection ? 'text-red-500/80' : ''}
              `}>
                Medical Emergency Group Association
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Regular Navigation Items */}
            <div className="flex items-center bg-gray-50/50 rounded-xl p-1">
              {menuItems.map((item) => {
                if (item.name === 'Login' || item.name === 'Dashboard') {
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      className={`
                        relative flex items-center px-6 py-3 text-sm font-medium 
                        transition-all duration-300 rounded-lg mx-1 min-w-25 justify-center
                        ${activeTab === item.name
                          ? 'bg-white text-red-700 font-semibold shadow-sm'
                          : 'text-gray-700 hover:text-red-600 hover:bg-white/80'
                        }
                      `}
                      onClick={() => handleTabClick(item.name)}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.name}
                    </Link>
                  );
                }

                // For other menu items (Home, Request, About Us)
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => handleTabClick(item.name)}
                    className={`
                      relative flex items-center px-6 py-3 text-sm font-medium 
                      transition-all duration-300 rounded-lg mx-1 min-w-25 justify-center
                      ${activeTab === item.name
                        ? isAboutSection && item.name === 'About Us'
                          ? 'bg-linear-to-r from-red-100 to-pink-100 text-red-700 font-bold shadow-inner'
                          : 'bg-white text-red-700 font-semibold shadow-sm'
                        : 'text-gray-700 hover:text-red-600 hover:bg-white/80'
                      }
                      ${isAboutSection && item.name === 'About Us' ? 'ring-1 ring-red-200/50' : ''}
                    `}
                  >
                    <span className={`mr-2 ${isAboutSection && item.name === 'About Us' ? 'text-red-600' : ''}`}>
                      {item.icon}
                    </span>
                    {item.name}

                    {/* Special indicator for About Us in About section */}
                    {isAboutSection && item.name === 'About Us' && (
                      <>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
            
            {/* Volunteer Button */}
            <div className="ml-2">
              <button
                onClick={() => handleTabClick('Volunteer')}
                className={`
                  relative flex items-center px-8 py-3 text-sm font-bold
                  transition-all duration-500 rounded-xl
                  overflow-hidden group
                  ${activeTab === 'Volunteer'
                    ? 'bg-linear-to-r from-red-600 via-pink-600 to-red-600 text-white shadow-2xl scale-105'
                    : `bg-linear-to-r from-red-500 via-pink-500 to-red-500 text-white 
                       shadow-xl hover:shadow-2xl hover:scale-105
                       ${isAboutSection ? 'animate-pulse-slow' : ''}`
                  }
                `}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                {/* Button content */}
                <FaUserPlus className="mr-3 transition-transform group-hover:scale-110 group-hover:rotate-12" />
                <span className="relative tracking-wide">VOLUNTEER</span>

                {/* Animated stars in About section */}
                {isAboutSection && (
                  <>
                    <FaStar className="ml-3 text-yellow-300 text-xs animate-spin-slow" />
                    <FaStar className="ml-1 text-yellow-300 text-xs animate-spin-slow" style={{ animationDelay: '0.5s' }} />
                  </>
                )}

                {/* Arrow animation */}
                <FaArrowRight className={`
                  ml-3 transition-all duration-300 transform
                  ${activeTab === 'Volunteer'
                    ? 'translate-x-0 opacity-100'
                    : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                  }
                `} />
              </button>
            </div>

            {/* Logout Button - Only show when logged in */}
            {isLoggedIn && (
              <div className="ml-2">
                <button
                  onClick={handleLogout}
                  className="
                    relative flex items-center px-6 py-3 text-sm font-medium
                    transition-all duration-300 rounded-xl
                    bg-red-100 hover:bg-red-200 text-red-700
                    shadow-md hover:shadow-lg
                  "
                >
                  <FaSignOutAlt className="mr-2" />
                  <span>Logout</span>
                  {userRole && (
                    <span className="ml-2 text-xs bg-red-200 px-2 py-0.5 rounded-full">
                      {userRole === 'admin' ? 'Admin' : 'Tech'}
                    </span>
                  )}
                </button>
              </div>
            )}

            <style jsx>{`
              @keyframes pulse-slow {
                0%, 100% { box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3); }
                50% { box-shadow: 0 10px 35px rgba(239, 68, 68, 0.5); }
              }
              @keyframes spin-slow {
                0% { transform: rotate(0deg) scale(1); }
                50% { transform: rotate(180deg) scale(1.2); }
                100% { transform: rotate(360deg) scale(1); }
              }
              .animate-pulse-slow {
                animation: pulse-slow 2s ease-in-out infinite;
              }
              .animate-spin-slow {
                animation: spin-slow 3s linear infinite;
              }
            `}</style>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`
                p-3 rounded-xl transition-all duration-300
                ${isAboutSection
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {isOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className={`
            md:hidden py-4 rounded-2xl mt-2 backdrop-blur-lg
            ${isAboutSection
              ? 'bg-linear-to-b from-red-50/90 via-white/95 to-white backdrop-blur-lg border border-red-200/50'
              : 'bg-white/95 backdrop-blur-lg border border-gray-200'
            }
            shadow-xl
          `}>
            <div className="space-y-2 px-2">
              {/* Mobile Navigation Items */}
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => {
                    handleTabClick(item.name);
                    setIsOpen(false);
                  }}
                  className={`
                    flex items-center w-full px-5 py-4 text-left rounded-xl
                    transition-all duration-300 relative
                    ${activeTab === item.name
                      ? (isAboutSection && item.name === 'About Us'
                        ? 'bg-linear-to-r from-red-100/80 to-pink-100/80 text-red-700 font-bold border-l-4 border-red-600'
                        : 'bg-red-50 text-red-700 font-semibold border-l-4 border-red-500'
                      )
                      : 'text-gray-700 hover:bg-red-50/50 hover:text-red-600'
                    }
                  `}
                >
                  <span className={`
                    mr-4 text-xl
                    ${item.name === 'About Us' && isAboutSection ? 'text-red-600' : ''}
                  `}>
                    {item.icon}
                  </span>
                  <span className="text-lg font-medium">{item.name}</span>

                  {isAboutSection && item.name === 'About Us' && (
                    <div className="ml-auto flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                      <span className="text-xs font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full">
                        ACTIVE
                      </span>
                    </div>
                  )}
                </Link>
              ))}

              {/* Mobile Volunteer Button */}
              <div className="pt-4 border-t border-red-100">
                <button
                  onClick={() => {
                    handleTabClick('Volunteer');
                    setIsOpen(false);
                  }}
                  className={`
                    w-full px-5 py-4 text-left rounded-xl flex items-center
                    relative overflow-hidden group
                    ${activeTab === 'Volunteer'
                      ? 'bg-linear-to-r from-red-600 via-pink-600 to-red-600 text-white'
                      : 'bg-linear-to-r from-red-500 via-pink-500 to-red-500 text-white'
                    }
                    shadow-lg hover:shadow-xl
                  `}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                  <div className="relative z-10 flex items-center w-full">
                    <FaUserPlus className="text-2xl mr-4" />
                    <div className="flex-1">
                      <div className="text-lg font-bold">BECOME A VOLUNTEER</div>
                      <div className="text-sm opacity-90">Join our emergency response team</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-xs font-bold bg-white/30 px-3 py-1 rounded-full mb-1 animate-pulse">
                        URGENT NEED
                      </div>
                      <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </button>
              </div>

              {/* Mobile Logout Button - Only show when logged in */}
              {isLoggedIn && (
                <div className="pt-4 border-t border-red-100">
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="
                      w-full px-5 py-4 text-left rounded-xl flex items-center
                      bg-red-100 hover:bg-red-200 text-red-700
                      transition-all duration-300
                    "
                  >
                    <FaSignOutAlt className="text-2xl mr-4" />
                    <div className="flex-1">
                      <div className="text-lg font-bold">Logout</div>
                      <div className="text-sm opacity-90">
                        {userRole === 'admin' ? 'Administrator' : 'Technician'}
                      </div>
                    </div>
                    <div className="text-sm font-medium bg-red-200 px-3 py-1 rounded-full">
                      {userRole}
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;