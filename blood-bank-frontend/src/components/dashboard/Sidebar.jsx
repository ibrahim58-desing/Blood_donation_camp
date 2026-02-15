import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaCheckCircle,
  FaClock,
  FaUsers,
  FaUserPlus,
  FaSearch,
  FaHistory,
  FaTint,
  FaBoxes,
  FaPlusCircle,
  FaExclamationTriangle,
  FaTrashAlt,
  FaClipboardList,
  FaHandsHelping,
  FaFileAlt,
  FaChartBar,
  FaCog,
  FaShieldAlt,
  FaChevronLeft,
  FaChevronRight,
  FaUser,
  FaCalendarCheck,
  FaSyringe,
  FaHeartbeat,
  FaDownload,
  FaPrint,
  FaUserCog,
  FaSignOutAlt
} from 'react-icons/fa';

const Sidebar = ({ collapsed, setCollapsed, userRole }) => {
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState({
    donors: true,
    inventory: false,
    requests: false,
    reports: false,
    admin: false
  });

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const menuItems = [
    {
      key: 'overview',
      icon: <FaTachometerAlt />,
      label: 'Dashboard',
      path: '/dashboard',
      roles: ['admin', 'technician']
    },
    {
      key: 'donors',
      icon: <FaUsers />,
      label: 'Donor Management',
      roles: ['admin', 'technician'],
      submenu: [
        { icon: <FaUsers />, label: 'All Donors', path: '/dashboard/donors', roles: ['admin', 'technician'] },
        { icon: <FaUserPlus />, label: 'Register Donor', path: '/dashboard/donors/register', roles: ['admin', 'technician'] },
        { icon: <FaHeartbeat />, label: 'Eligible Donors', path: '/dashboard/donors/eligible', roles: ['admin', 'technician'] },
        { icon: <FaHistory />, label: 'Donation History', path: '/dashboard/donors/donations', roles: ['admin', 'technician'] },
        { icon: <FaSyringe />, label: 'Record Donation', path: '/dashboard/donors/record-donation', roles: ['admin', 'technician'] }
      ]
    },
    {
      key: 'inventory',
      icon: <FaBoxes />,
      label: 'Inventory Management',
      roles: ['admin', 'technician'],
      submenu: [
        { icon: <FaTint />, label: 'Blood Units', path: '/dashboard/inventory', roles: ['admin', 'technician'] },
        { icon: <FaPlusCircle />, label: 'Add Blood Unit', path: '/dashboard/inventory/add', roles: ['admin', 'technician'] },
        { icon: <FaExclamationTriangle />, label: 'Expiring Units', path: '/dashboard/inventory/expiring', roles: ['admin', 'technician'] },
        { icon: <FaTrashAlt />, label: 'Discard Expired', path: '/dashboard/inventory/discard', roles: ['admin'] },
      ]
    },
    {
      key: 'requests',
      icon: <FaClipboardList />,
      label: 'Request Management',
      roles: ['admin', 'technician'],
      submenu: [
        { icon: <FaClipboardList />, label: 'All Requests', path: '/dashboard/requests', roles: ['admin', 'technician'] },
       
      ]
    },
    {
      key: 'reports',
      icon: <FaFileAlt />,
      label: 'Reports & Analytics',
      roles: ['admin', 'technician'],
      submenu: [
        { icon: <FaHistory />, label: 'Donation Reports', path: '/dashboard/reports/donations', roles: ['admin', 'technician'] },
        { icon: <FaBoxes />, label: 'Inventory Reports', path: '/dashboard/reports/inventory', roles: ['admin', 'technician'] },
        { icon: <FaClipboardList />, label: 'Request Reports', path: '/dashboard/reports/requests', roles: ['admin', 'technician'] },
        { icon: <FaChartBar />, label: 'Custom Reports', path: '/dashboard/reports/custom', roles: ['admin'] },
        { icon: <FaDownload />, label: 'Export Data', path: '/dashboard/reports/export', roles: ['admin', 'technician'] }
      ]
    },
   
  ];

  const NavItem = ({ item, depth = 0 }) => {
    if (!item.roles.includes(userRole)) return null;

    if (item.submenu) {
      return (
        <div className="mb-2">
          <button
            onClick={() => toggleMenu(item.key)}
            className={`w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{item.icon}</span>
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </div>
            {!collapsed && (
              <span className="text-sm">
                {openMenus[item.key] ? '▼' : '►'}
              </span>
            )}
          </button>
          
          {!collapsed && openMenus[item.key] && (
            <div className="ml-4 mt-1 space-y-1">
              {item.submenu.map((subItem, index) => (
                <NavLink
                  key={index}
                  to={subItem.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-red-600 text-white'
                        : 'text-gray-600 hover:bg-red-50 hover:text-red-700'
                    }`
                  }
                >
                  <span className="text-sm">{subItem.icon}</span>
                  <span className="text-sm">{subItem.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 ${
            isActive
              ? 'bg-red-600 text-white'
              : 'text-gray-700 hover:bg-red-50 hover:text-red-700'
          } ${collapsed ? 'justify-center' : ''}`
        }
      >
        <span className="text-lg">{item.icon}</span>
        {!collapsed && <span className="font-medium">{item.label}</span>}
      </NavLink>
    );
  };

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white shadow-xl transition-all duration-300 z-50 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="bg-red-600 p-2 rounded-lg">
              <FaHeartbeat className="text-white text-xl" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">MEGA</h1>
              <p className="text-xs text-red-600">Blood Bank</p>
            </div>
          </div>
        ) : (
          <div className="bg-red-600 p-2 rounded-lg mx-auto">
            <FaHeartbeat className="text-white text-xl" />
          </div>
        )}
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="p-4 border-b bg-red-50">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-full">
              <FaUser className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {JSON.parse(localStorage.getItem('user') || '{}').name}
              </p>
              <p className="text-xs text-red-600">
                {userRole === 'admin' ? 'Administrator' : 'Technician'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="overflow-y-auto h-[calc(100vh-180px)] p-3">
        {menuItems.map((item) => (
          <NavItem key={item.key} item={item} />
        ))}
      </div>

      {/* Logout Button */}
      <div className="absolute bottom-0 w-full p-3 border-t bg-white">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-0  text-red-600 hover:bg-red-50 rounded-lg transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <FaSignOutAlt className="text-lg" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;