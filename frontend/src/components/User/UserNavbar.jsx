import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, LogIn } from "lucide-react";
import useAuthStore from "../../stores/authStore";

export default function Navbar({ currentPath = "/" }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/login");
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const avatarUrl = user
    ? user.image_url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user.name || "User"
      )}&background=6366f1&color=fff`
    : null;

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-4 md:px-12 md:py-6 bg-transparent">
      {/* Logo Section */}
      <Link to="/" className="flex items-center gap-2 md:gap-3 transition-opacity hover:opacity-80">
        {/* Scaled down logo height for mobile, original for desktop */}
        <div className="h-[40px] md:h-[60px]">
          <img 
            src="name.svg" 
            alt="Logo text" 
            className="w-full h-full object-cover" 
          />
        </div>
      </Link>

      {/* Navigation Pill Container */}
      <div className="flex items-center p-1 md:p-1.5 rounded-[30px] bg-black/10 backdrop-blur-xl border border-white/5 shadow-xl">
        <Link
          to="/"
          className={`px-3 py-1.5 md:px-5 md:py-2 rounded-[20px] text-xs md:text-sm font-medium transition-all duration-300 ${
            currentPath === "/"
              ? "bg-black/20 text-white backdrop-blur-[7px]"
              : "text-white/75 hover:text-white hover:bg-white/5"
          }`}
        >
          Tarot
        </Link>
        <Link
          to="/tarot"
          className={`px-3 py-1.5 md:px-5 md:py-2 rounded-[20px] text-xs md:text-sm font-medium transition-all duration-300 ${
            currentPath === "/tarot" // Fixed path check here
              ? "bg-black/20 text-white backdrop-blur-[7px]"
              : "text-white/75 hover:text-white hover:bg-white/5"
          }`}
        >
          Decks
        </Link>

        {/* User Avatar Section */}
        <div className="relative ml-0.5 md:ml-1" ref={dropdownRef}>
          {user ? (
            <>
              <button
                onClick={toggleDropdown}
                className="flex items-center p-0.5 rounded-[18px] hover:bg-white/10 transition-all cursor-pointer"
              >
                <div className="relative">
                  {/* Scaled avatar for mobile */}
                  <img
                    src={avatarUrl}
                    alt="User Avatar"
                    className="w-7 h-7 md:w-8 md:h-8 rounded-[14px] md:rounded-[16px] object-cover border border-white/20"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 md:w-2.5 h-2 md:h-2.5 bg-emerald-500 rounded-full border-2 border-[#030014]" />
                </div>
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    // Added max-w-[90vw] so the dropdown doesn't overflow off-screen on very small phones
                    className="absolute right-0 mt-3 w-56 md:w-60 max-w-[90vw] bg-[#0a0a16]/90 backdrop-blur-2xl rounded-[1.5rem] md:rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/10 overflow-hidden z-50"
                  >
                    <div className="p-4 md:p-5 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                      <p className="text-white font-serif italic text-sm md:text-base truncate">
                        {user.name || "Wayward Soul"}
                      </p>
                      <p className="text-gray-400 text-[9px] md:text-[10px] uppercase tracking-widest mt-1 font-bold truncate">
                        {user.email || "Hi witchhh"}
                      </p>
                    </div>

                    <div className="p-2">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2.5 md:px-4 md:py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl md:rounded-2xl transition-all"
                      >
                        <User size={16} className="md:w-[18px] md:h-[18px]" />
                        <span className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold">
                          Profile
                        </span>
                      </Link>
                      <div className="my-1 border-t border-white/5" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 md:px-4 md:py-3 text-rose-400 hover:bg-rose-500/10 rounded-xl md:rounded-2xl transition-all group"
                      >
                        <LogOut
                          size={16}
                          className="md:w-[18px] md:h-[18px] group-hover:-translate-x-1 transition-transform"
                        />
                        <span className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold">
                          Log out
                        </span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <Link
              to="/login"
              className="px-3 py-1.5 md:px-4 md:py-2 rounded-[20px] text-xs md:text-sm font-medium text-white/75 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1 md:gap-1.5"
            >
              <LogIn size={14} className="md:w-[15px] md:h-[15px]" />
              <span>Log In</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}