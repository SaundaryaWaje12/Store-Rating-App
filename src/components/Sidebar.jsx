import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Store, Users, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose, user }) => {
  const location = useLocation();
  const { logout, isAdmin, isStoreOwner } = useAuth();

  const navItems = [
    // Common items
    { 
      to: '/profile',
      label: 'Profile',
      icon: <User size={20} />,
      show: true
    },
    
    // Admin-only items
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      show: isAdmin
    },
    {
      to: '/stores',
      label: 'Stores',
      icon: <Store size={20} />,
      show: true
    },
    {
      to: '/users',
      label: 'Users',
      icon: <Users size={20} />,
      show: isAdmin
    },
    
    // Store owner items
    {
      to: '/store-dashboard',
      label: 'Store Dashboard',
      icon: <Store size={20} />,
      show: isStoreOwner
    }
  ];

  const filteredNavItems = navItems.filter(item => item.show);

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
  `;

  const handleClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={sidebarClasses}>
        <div className="h-16 flex items-center justify-center border-b">
          <Link to="/" className="flex items-center">
            <Store className="h-8 w-8 text-blue-600 mr-2" />
            <span className="text-xl font-semibold text-gray-900">Store Ratings</span>
          </Link>
        </div>
        
        <div className="px-4 py-6 border-b">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                {user?.name?.charAt(0) || '?'}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role?.replace('_', ' ') || 'Role'}
              </p>
            </div>
          </div>
        </div>
        
        <nav className="mt-5 px-2 space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`
                  group flex items-center px-2 py-2 text-base font-medium rounded-md
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}
                onClick={handleClick}
              >
                <span className={`mr-4 ${isActive ? 'text-blue-700' : 'text-gray-500'}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
          
          <button
            onClick={logout}
            className="w-full text-left group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 mt-5"
          >
            <span className="mr-4 text-gray-500">
              <LogOut size={20} />
            </span>
            Logout
          </button>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;