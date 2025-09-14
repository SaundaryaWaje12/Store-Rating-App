import React from 'react';
import { Bell, User, LogOut } from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <header className="bg-white shadow-sm h-16 px-4 flex items-center justify-between">
      <div className="flex-1">
        <h1 className="text-2xl font-semibold text-gray-900">
          {user?.role === 'admin' ? 'Admin Dashboard' : 
           user?.role === 'store_owner' ? 'Store Dashboard' : 'Customer reviews'}
        </h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="rounded-full p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none">
          <Bell size={20} />
        </button>
        
        <div className="relative">
          <button
            className="flex items-center space-x-2 focus:outline-none"
            onClick={toggleDropdown}
          >
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
              {user?.name?.charAt(0) || '?'}
            </div>
            <span className="hidden md:block font-medium text-gray-700">{user?.name || 'User'}</span>
          </button>
          
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
              <a
                href="/profile"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <User size={16} className="mr-2" />
                Profile
              </a>
              <button
                onClick={onLogout}
                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;