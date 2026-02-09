import React, { useState, useEffect, useRef } from 'react';
import { 
  FaHeartbeat, 
  FaHome, 
  FaHandsHelping,
  FaInfoCircle,
  FaUser,
  FaUserPlus,
  FaBars,
  FaTimes
} from 'react-icons/fa';

const Navbar = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const [isOpen, setIsOpen] = useState(false);
  const [selectorStyle, setSelectorStyle] = useState({});
  const navRef = useRef(null);
  const itemRefs = useRef([]);

  const menuItems = [
    { id: 1, name: 'Home', icon: <FaHome /> },
    { id: 2, name: 'Request', icon: <FaHandsHelping /> },
    { id: 3, name: 'About Us', icon: <FaInfoCircle /> },
    { id: 4, name: 'Login', icon: <FaUser /> },
  ];

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, menuItems.length);
  }, [menuItems]);

  const updateSelector = (index) => {
    const activeElement = itemRefs.current[index];
    if (!activeElement || !navRef.current) return;

    const rect = activeElement.getBoundingClientRect();
    const navRect = navRef.current.getBoundingClientRect();
    
    setSelectorStyle({
      top: `${rect.top - navRect.top}px`,
      left: `${rect.left - navRect.left}px`,
      height: `${rect.height}px`,
      width: `${rect.width}px`,
    });
  };

  const handleTabClick = (itemName, index) => {
    setActiveTab(itemName);
    updateSelector(index);
  };

  useEffect(() => {
    const initialIndex = menuItems.findIndex(item => item.name === 'Home');
    if (initialIndex !== -1) {
      setTimeout(() => updateSelector(initialIndex), 100);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const currentIndex = menuItems.findIndex(item => item.name === activeTab);
      if (currentIndex !== -1) {
        setTimeout(() => updateSelector(currentIndex), 100);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab]);

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-red-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-red-600 w-10 h-10 rounded-full flex items-center justify-center">
              <FaHeartbeat className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-red-700">
                Blood<span className="text-red-600">Connect</span>
              </h1>
              <p className="text-xs text-gray-500 hidden md:block">Saving Lives Together</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <div className="relative" ref={navRef}>
              <div className="flex space-x-1 items-center">
                {/* Animated Selector */}
                <div 
                  className="absolute bg-red-50 rounded-lg transition-all duration-300 ease-out border border-red-100"
                  style={selectorStyle}
                />
                
                {/* Regular Menu Items */}
                {menuItems.map((item, index) => (
                  <div
                    key={item.id}
                    ref={el => itemRefs.current[index] = el}
                    className="relative z-10"
                  >
                    <button
                      onClick={() => handleTabClick(item.name, index)}
                      className={`flex items-center px-6 py-3 text-sm font-medium transition-colors duration-300 rounded-lg mx-1 ${
                        activeTab === item.name 
                          ? 'text-red-700 font-semibold' 
                          : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.name}
                    </button>
                  </div>
                ))}
                
                {/* Volunteer Button - Inside navigation but styled differently */}
                <div className="relative z-10 ml-2">
                  <button 
                    onClick={() => setActiveTab('Volunteer')}
                    className={`flex items-center px-6 py-3 text-sm font-medium transition-all duration-300 rounded-lg mx-1 ${
                      activeTab === 'Volunteer'
                        ? 'bg-red-600 text-white shadow-lg'
                        : 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 shadow-md hover:shadow-lg'
                    }`}
                  >
                    <FaUserPlus className="mr-2" />
                    Volunteer
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-red-600 p-2"
            >
              {isOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.name);
                    setIsOpen(false);
                  }}
                  className={`flex items-center w-full px-4 py-4 text-left rounded-lg transition-colors ${
                    activeTab === item.name
                      ? 'bg-red-50 text-red-700 border-l-4 border-red-600'
                      : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  <span className="text-lg font-medium">{item.name}</span>
                </button>
              ))}
              
              {/* Volunteer Button for mobile */}
              <button 
                onClick={() => {
                  setActiveTab('Volunteer');
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-4 text-left rounded-lg flex items-center transition-colors ${
                  activeTab === 'Volunteer'
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                    : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                }`}
              >
                <FaUserPlus className="mr-3 text-lg" />
                <span className="text-lg font-medium">Volunteer</span>
                <span className="ml-auto bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                  Join Now
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;