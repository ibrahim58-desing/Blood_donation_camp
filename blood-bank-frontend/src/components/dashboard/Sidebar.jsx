import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FaTachometerAlt, FaUsers, FaPlusCircle, FaCheckCircle, 
  FaHistory, FaBoxes, FaPlusSquare, FaExclamationTriangle, 
  FaTrashAlt, FaHandsHelping, FaCalendarAlt, FaClipboardList, 
  FaChevronLeft, FaChevronRight, FaSignOutAlt, FaTint, FaUserCircle 
} from 'react-icons/fa';

const Sidebar = ({ collapsed, setCollapsed, userRole }) => {
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState({ 
    donors: true, 
    inventory: false, 
    volunteers: false, 
    requests: false 
  });

  const toggleMenu = (e, menu) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const menuItems = [
    { key: 'overview', icon: <FaTachometerAlt />, label: 'Dashboard', path: '/dashboard', roles: ['admin', 'technician'] },
    { 
      key: 'donors', icon: <FaUsers />, label: 'Donor Management', roles: ['admin', 'technician'],
      submenu: [
        { icon: <FaUsers />, label: 'All Donors', path: '/dashboard/donors', roles: ['admin', 'technician'] },
        { icon: <FaPlusCircle />, label: 'Register Donor', path: '/dashboard/donors/register', roles: ['admin', 'technician'] },
        { icon: <FaCheckCircle />, label: 'Eligible Donors', path: '/dashboard/donors/eligible', roles: ['admin', 'technician'] },
        { icon: <FaHistory />, label: 'Donation History', path: '/dashboard/donors/donations', roles: ['admin', 'technician'] },
      ]
    },
    { 
      key: 'inventory', icon: <FaBoxes />, label: 'Inventory Management', roles: ['admin', 'technician'],
      submenu: [
        { icon: <FaBoxes />, label: 'Blood Units', path: '/dashboard/inventory', roles: ['admin', 'technician'] },
        { icon: <FaPlusSquare />, label: 'Add Blood Unit', path: '/dashboard/inventory/add', roles: ['admin', 'technician'] },
        { icon: <FaExclamationTriangle />, label: 'Expiring Units', path: '/dashboard/inventory/expiring', roles: ['admin', 'technician'] },
        { icon: <FaTrashAlt />, label: 'Discard Expired', path: '/dashboard/inventory/discard', roles: ['admin'] },
      ]
    },
    { 
      key: 'volunteers', icon: <FaHandsHelping />, label: 'Volunteer Management', roles: ['admin', 'technician'],
      submenu: [
        { icon: <FaUsers />, label: 'All Volunteers', path: '/dashboard/volunteers', roles: ['admin', 'technician'] },
        { icon: <FaCalendarAlt />, label: 'All Camps', path: '/dashboard/camps', roles: ['admin', 'technician'] },
        ...(userRole === 'admin' ? [{ icon: <FaPlusSquare />, label: 'Create Camp', path: '/dashboard/camps/create', roles: ['admin'] }] : [])
      ]
    },
    { 
      key: 'requests', icon: <FaClipboardList />, label: 'Request Management', roles: ['admin', 'technician'],
      submenu: [
        { icon: <FaClipboardList />, label: 'All Requests', path: '/dashboard/requests', roles: ['admin', 'technician'] },
      ]
    },
  ];

  // Helper to get user data safely
  const userData = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-50 flex flex-col ${collapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Header / Logo Section */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100 min-h-[75px]">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="bg-red-600 p-2 rounded-lg">
              <FaTint className="text-white text-xl" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-800 text-xl leading-none">MEGA</span>
              <span className="text-[10px] font-bold text-red-600 tracking-[0.2em] uppercase">Blood Bank</span>
            </div>
          </div>
        ) : (
          <div className="mx-auto bg-red-600 p-2 rounded-lg">
            <FaTint className="text-white text-xl" />
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="p-1.5 bg-gray-50 rounded-lg hover:bg-gray-200 text-gray-500 ml-2"
        >
          {collapsed ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
        </button>
      </div>

      {/* User Profile Section */}
      {!collapsed && (
        <div className="px-6 py-4 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <FaUserCircle size={32} />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-semibold text-gray-800 truncate">{userData.name || 'User'}</span>
              <span className="text-xs text-gray-500 capitalize">{userRole}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation (Scrollable) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 custom-scrollbar">
        {menuItems.map((item) => {
          if (!item.roles.includes(userRole)) return null;
          const hasSub = !!item.submenu;

          return (
            <div key={item.key} className="mb-1">
              {hasSub ? (
                <>
                  <button
                    onClick={(e) => toggleMenu(e, item.key)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${openMenus[item.key] ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-red-50 hover:text-red-700'} ${collapsed ? 'justify-center' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.icon}</span>
                      {!collapsed && <span className="font-medium">{item.label}</span>}
                    </div>
                    {!collapsed && <span className={`text-[10px] transition-transform duration-200 ${openMenus[item.key] ? 'rotate-180' : ''}`}>▼</span>}
                  </button>
                  
                  {!collapsed && openMenus[item.key] && (
                    <div className="mt-1 ml-4 space-y-1 border-l-2 border-red-100">
                      {item.submenu.map((sub, idx) => (
                        sub.roles.includes(userRole) && (
                          <NavLink
                            key={`${item.key}-${idx}`}
                            to={sub.path}
                            end
                            className={({ isActive }) => `flex items-center gap-3 px-4 py-2 text-sm rounded-r-lg transition-colors ${isActive ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-red-50 hover:text-red-700'}`}
                          >
                            <span className="text-lg">{sub.icon}</span>
                            {sub.label}
                          </NavLink>
                        )
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.path}
                  end
                  className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-red-50 hover:text-red-700'} ${collapsed ? 'justify-center' : ''}`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </NavLink>
              )}
            </div>
          );
        })}
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-100">
        <button 
          onClick={handleLogout} 
          className={`flex items-center gap-3 w-full px-3 py-2.5 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <FaSignOutAlt className="text-xl" /> 
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;