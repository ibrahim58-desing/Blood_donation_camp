import React from 'react';
import { FaBell, FaEnvelope, FaSearch, FaBars } from 'react-icons/fa';

const Header = ({ user, userRole, sidebarCollapsed, setSidebarCollapsed }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              <FaBars />
            </button>
            
            {/* Search Bar */}
            <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-4 py-2 w-96">
              <FaSearch className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search donors, blood units, requests..."
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <FaBell className="text-gray-600 text-lg" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full"></span>
            </button>
            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <FaEnvelope className="text-gray-600 text-lg" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full"></span>
            </button>
            
            {/* Mobile User Info */}
            <div className="flex items-center gap-3 md:hidden">
              <div className="text-right">
                <p className="font-semibold text-sm text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-600">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;