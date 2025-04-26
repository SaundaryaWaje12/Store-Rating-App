import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Key, Eye, EyeOff, Check, X } from 'lucide-react';

const Profile = () => {
  const { currentUser, updatePassword } = useAuth();
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const passwordRequirements = [
    { 
      id: 'length', 
      text: 'Between 8 and 16 characters',
      validator: (pass) => pass.length >= 8 && pass.length <= 16
    },
    { 
      id: 'uppercase', 
      text: 'At least one uppercase letter',
      validator: (pass) => /[A-Z]/.test(pass)
    },
    { 
      id: 'special', 
      text: 'At least one special character',
      validator: (pass) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)
    }
  ];

  const toggleShowPassword = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setMessage({ type: '', text: '' });
  };

  const validatePassword = () => {
    // Check requirements
    const failedRequirements = passwordRequirements.filter(
      req => !req.validator(passwordData.newPassword)
    );
    
    if (failedRequirements.length > 0) {
      setMessage({
        type: 'error',
        text: 'Password does not meet the requirements'
      });
      return false;
    }
    
    // Check if passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Passwords do not match'
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    if (!validatePassword()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await updatePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      if (result.success) {
        setMessage({
          type: 'success',
          text: result.message || 'Password updated successfully'
        });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setMessage({
          type: 'error',
          text: result.message || 'Failed to update password'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkPasswordRequirement = (requirement) => {
    return requirement.validator(passwordData.newPassword);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:space-x-4 items-start">
          <div className="mb-4 sm:mb-0">
            <div className="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-medium">
              {currentUser?.name?.charAt(0) || '?'}
            </div>
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{currentUser?.name}</h2>
            <div className="mt-2 space-y-2">
              <div className="flex items-center text-gray-600">
                <User className="h-5 w-5 mr-2" />
                <span className="capitalize">{currentUser?.role?.replace('_', ' ') || 'User'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <span className="inline-block w-5 h-5 mr-2">📧</span>
                <span>{currentUser?.email}</span>
              </div>
              <div className="flex items-start text-gray-600">
                <span className="inline-block w-5 h-5 mr-2 mt-1">📍</span>
                <span className="break-words">{currentUser?.address}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <Key className="h-5 w-5 mr-2 text-blue-600" />
          <h2 className="text-xl font-semibold">Change Password</h2>
        </div>
        
        {message.text && (
          <div className={`mb-4 p-3 rounded ${
            message.type === 'error' 
              ? 'bg-red-100 text-red-700 border border-red-400' 
              : 'bg-green-100 text-green-700 border border-green-400'
          }`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                name="currentPassword"
                type={showPassword.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={handleChange}
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => toggleShowPassword('current')}
              >
                {showPassword.current ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                name="newPassword"
                type={showPassword.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={handleChange}
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => toggleShowPassword('new')}
              >
                {showPassword.new ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            
            {/* Password requirements */}
            <div className="mt-2 space-y-2">
              {passwordRequirements.map((req) => (
                <div key={req.id} className="flex items-center">
                  {checkPasswordRequirement(req) ? (
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <X className="h-4 w-4 text-gray-300 mr-2" />
                  )}
                  <span className={`text-xs ${
                    checkPasswordRequirement(req) ? 'text-green-700' : 'text-gray-500'
                  }`}>
                    {req.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={handleChange}
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => toggleShowPassword('confirm')}
              >
                {showPassword.confirm ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
              ) : (
                'Update Password'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;