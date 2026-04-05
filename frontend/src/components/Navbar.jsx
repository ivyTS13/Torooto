import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, 
  Sparkles, 
  User, 
  LogOut, 
  Settings 
} from "lucide-react";
import useAuthStore from "../stores/authStore";

const Navbar = ({
  toggleSidebar,
  dropdownOpen,
  toggleDropdown,
  dropdownRef,
}) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const avatarUrl = user?.image_url || `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center justify-between px-8 py-4">
        
        {/* Left: Brand */}
        <div className="flex items-center space-x-6">
          <button
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5"
          >
            <Menu size={20} />
          </button>

          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Sparkles className="text-purple-400 text-2xl animate-pulse group-hover:scale-110 transition-transform" size={24} />
              <div className="absolute -inset-1 bg-purple-500/20 blur-lg rounded-full" />
            </div>
            <span className="text-white font-serif italic text-2xl tracking-tight bg-gradient-to-r from-white via-purple-200 to-indigo-300 bg-clip-text text-transparent">
              Torooto
            </span>
          </Link>
        </div>

        {/* Right: User Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="flex items-center space-x-3 p-1 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
          >
            <div className="relative">
              <img 
                src={avatarUrl} 
                alt="Seeker" 
                className="w-9 h-9 rounded-xl border border-white/20 object-cover grayscale-[0.3] hover:grayscale-0 transition-all" 
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#050505]" />
            </div>
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-4 w-64 bg-[#0a0a0a]/90 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden"
              >
                <div className="p-6 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                  <p className="text-white font-serif italic text-lg truncate">
                    {user?.name || "Wayward Soul"}
                  </p>
                  <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-1 font-bold">
                   {user?.email || "Hi witchhh"}
                  </p>
                </div>

                <div className="p-2">
                  <DropdownItem to="/profile" icon={User} label="Profile" onClick={toggleDropdown} />
                
                  <div className="my-2 border-t border-white/5" />
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-4 px-5 py-4 text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all group"
                  >
                    <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[11px] uppercase tracking-[0.2em] font-bold">Log out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

// Helper component for dropdown items
const DropdownItem = ({ to, icon: Icon, label, onClick }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className="flex items-center space-x-4 px-5 py-4 text-gray-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
  >
    <Icon size={18} />
    <span className="text-[11px] uppercase tracking-[0.2em] font-bold">{label}</span>
  </Link>
);

export default Navbar;