import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, LogIn, Sparkles } from "lucide-react";
import useAuthStore from "../../stores/authStore";
import logoUrl from "../../assets/name.svg";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const currentPath = location.pathname;

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
        user.name || "User",
      )}&background=6366f1&color=fff`
    : null;

  return (
    // Reduced px-4 to px-2 on mobile for less space on the edges
    <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-2 sm:px-4 py-3 md:px-12 md:py-6 bg-transparent">
      {/* Logo Section */}
      <Link
        to="/"
        className="flex items-center gap-2 md:gap-3 transition-opacity hover:opacity-80 shrink-0"
      >
        <img
          src={logoUrl}
          alt="Logo text"
          className="block h-8 w-auto max-w-[250px] sm:h-10 md:h-14 object-contain flex-shrink-0"
        />
      </Link>
      {/* Navigation Pill Container */}
      <div className="flex items-center p-1 md:p-1.5 rounded-[30px] bg-black/20 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        {/* Added whitespace-nowrap, reduced px/py for mobile, and tweaked text size to text-[11px] */}
        <Link
          to="/"
          className={`whitespace-nowrap px-2.5 py-1.5 sm:px-3 sm:py-1.5 md:px-5 md:py-2 rounded-[20px] text-[11px] sm:text-xs md:text-sm font-medium transition-all duration-300 ${
            currentPath === "/"
              ? "bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-white border border-white/10 backdrop-blur-[10px] shadow-lg shadow-indigo-500/10"
              : "text-white/75 hover:text-white hover:bg-white/5"
          }`}
        >
          Tarot
        </Link>
        <Link
          to="/tarot"
          className={`whitespace-nowrap px-2.5 py-1.5 sm:px-3 sm:py-1.5 md:px-5 md:py-2 rounded-[20px] text-[11px] sm:text-xs md:text-sm font-medium transition-all duration-300 ${
            currentPath === "/tarot"
              ? "bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-white border border-white/10 backdrop-blur-[10px] shadow-lg shadow-indigo-500/10"
              : "text-white/75 hover:text-white hover:bg-white/5"
          }`}
        >
          Decks
        </Link>
        <Link
          to="/piles"
          className={`whitespace-nowrap px-2.5 py-1.5 sm:px-3 sm:py-1.5 md:px-5 md:py-2 rounded-[20px] text-[11px] sm:text-xs md:text-sm font-medium transition-all duration-300 ${
            currentPath === "/piles"
              ? "bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-white border border-white/10 backdrop-blur-[10px] shadow-lg shadow-indigo-500/10"
              : "text-white/75 hover:text-white hover:bg-white/5"
          }`}
        >
          Piles
        </Link>

        {/* User Avatar Section */}
        {/* Added shrink-0 to prevent the avatar from compressing and becoming unclickable */}
        <div
          className="relative ml-0.5 sm:ml-1 md:ml-1 shrink-0"
          ref={dropdownRef}
        >
          {user ? (
            <>
              <button
                onClick={toggleDropdown}
                className="flex items-center p-0.5 rounded-[18px] hover:bg-white/10 transition-all cursor-pointer shrink-0"
              >
                <div className="relative">
                  <img
                    src={avatarUrl}
                    alt="User Avatar"
                    className="w-7 h-7 md:w-8 md:h-8 rounded-[14px] md:rounded-[16px] object-cover border border-indigo-400/30 shadow-sm"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 md:w-2.5 h-2 md:h-2.5 bg-emerald-400 rounded-full border-2 border-[#030014] shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                </div>
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-0 mt-3 w-56 md:w-64 max-w-[90vw] bg-[#070514]/85 backdrop-blur-3xl rounded-[1.75rem] md:rounded-[2rem] shadow-[0_20px_50px_rgba(10,5,30,0.8),0_0_30px_rgba(99,102,241,0.15)] border border-indigo-500/20 overflow-hidden z-50"
                  >
                    {/* Cosmic Background Accent Glow */}
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-600/20 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-600/20 rounded-full blur-2xl pointer-events-none" />

                    {/* User Profile Header */}
                    <div className="relative p-4 md:p-5 border-b border-white/10 bg-gradient-to-b from-indigo-950/30 to-transparent">
                      <div className="flex items-center gap-2 text-indigo-300 mb-1">
                        <Sparkles
                          size={13}
                          className="text-indigo-400 animate-pulse"
                        />
                        <span className="text-[10px] uppercase tracking-widest font-semibold">
                          Connected Aura
                        </span>
                      </div>
                      <p className="text-white font-serif italic text-sm md:text-base truncate">
                        {user.name || "Wayward Soul"}
                      </p>
                      <p className="text-indigo-200/60 text-[9px] md:text-[10px] uppercase tracking-widest mt-0.5 font-medium truncate">
                        {user.email || "Hi witchhh"}
                      </p>
                    </div>

                    {/* Menu Actions */}
                    <div className="relative p-2 space-y-1">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2.5 md:px-4 md:py-3 text-indigo-100/80 hover:text-white hover:bg-white/10 rounded-xl md:rounded-2xl transition-all group border border-transparent hover:border-white/5"
                      >
                        <User
                          size={16}
                          className="text-indigo-400 md:w-[18px] md:h-[18px] group-hover:scale-110 transition-transform"
                        />
                        <span className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold">
                          Profile
                        </span>
                      </Link>

                      <div className="my-1 border-t border-white/5 mx-2" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 md:px-4 md:py-3 text-rose-300 hover:text-rose-200 hover:bg-rose-500/15 rounded-xl md:rounded-2xl transition-all group border border-transparent hover:border-rose-500/20 cursor-pointer"
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
              className="px-3 py-1.5 md:px-4 md:py-2 rounded-[20px] text-xs md:text-sm font-medium text-white/75 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1 md:gap-1.5 shrink-0"
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
