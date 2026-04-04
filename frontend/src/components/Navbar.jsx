// Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom"; // Added Link and useNavigate
import {
  FaBars,
  FaStar,
  FaUserCircle,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import useAuthStore from "../stores/authStore"; // Import your store

const Navbar = ({
  toggleSidebar,
  dropdownOpen,
  toggleDropdown,
  dropdownRef,
}) => {
  const { user, logout } = useAuthStore(); // Get user data and logout function
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Fallback for avatar
 const avatarUrl = user?.image_url || `https://ui-avatars.com/api/?name=${user?.name}&background=random`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-lg border-b border-white/10 shadow-lg">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left section: Hamburger + Logo */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="text-white/80 hover:text-white transition-all duration-300 p-2 rounded-lg hover:bg-white/10 focus:outline-none"
            aria-label="Toggle Sidebar"
          >
            <FaBars className="text-xl" />
          </button>

          <Link to="/" className="flex items-center space-x-2">
            <div className="relative">
              <FaStar className="text-yellow-300 text-2xl animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Torooto
            </span>
          </Link>
        </div>

        {/* Right section: Avatar with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="focus:outline-none transform transition-all duration-300 hover:scale-105"
          >
            <div className="relative">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="User" 
                  className="w-9 h-9 rounded-full border border-white/20 object-cover" 
                />
              ) : (
                <FaUserCircle className="text-4xl text-white/90 hover:text-white transition-colors" />
              )}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black/30" />
            </div>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-gray-900/90 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 overflow-hidden animate-fadeIn">
              <div className="py-2">
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-white font-semibold truncate">
                    {user?.name || "Guest User"}
                  </p>
                  <p className="text-gray-400 text-sm truncate">
                    {user?.email || "No email provided"}
                  </p>
                </div>

                {/* PROFILE LINK */}
                <Link 
                  to="/profile" 
                  onClick={toggleDropdown} // Close dropdown when clicked
                  className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-white/10 transition-all duration-200"
                >
                  <FaUser className="text-sm" />
                  <span>Profile</span>
                </Link>

                <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-white/10 transition-all duration-200">
                  <IoSettingsOutline className="text-sm" />
                  <span>Settings</span>
                </button>

                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-white/10 transition-all duration-200"
                >
                  <FaSignOutAlt className="text-sm" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;