import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
  Sparkles,
  Library,
  MessageSquare,
  Flame,
  BookOpen,
} from "lucide-react";
import useAuthStore from "../stores/authStore";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuthStore();

  const publicLinks = [{ name: "The Archives", icon: Library, path: "/tarot" }];
  const userLinks = [
    { name: "Sanctum", icon: Sparkles, path: "/admin" },
    { name: "Pile History", icon: BookOpen, path: "admin/piles" },
  ];
  const adminLinks = [
    { name: "Deck management", icon: MessageSquare, path: "/admin/decks" },
  ];
  const navLinks = user
    ? [...userLinks, ...(user.is_superuser ? adminLinks : [])]
    : publicLinks;

  const handleLinkClick = () => {
    // Close the sidebar on mobile after navigating
    if (window.innerWidth < 1024) {
      onClose?.();
    }
  };

  // Determine visibility classes (static, not dynamically concatenated)
  const mobileClasses = isOpen
    ? "max-lg:translate-x-0"      // visible on mobile
    : "max-lg:-translate-x-full"; // hidden off-screen on mobile

  return (
    <>
      {/* Backdrop for mobile – only appears when sidebar is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? 260 : 85,
        }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-black/40 backdrop-blur-3xl border-r border-white/5 shadow-[20px_0_40px_rgba(0,0,0,0.4)] z-40 overflow-hidden
          max-lg:transition-transform max-lg:duration-300 ${mobileClasses}
          lg:translate-x-0`}
      >
        <div className="flex flex-col h-full py-8">
          <nav className="flex-1">
            <ul className="space-y-4 px-4">
              {navLinks.map((link) => {
                const isActive =
                  location.pathname === link.path ||
                  location.pathname.startsWith(link.path + "/");
                return (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      onClick={handleLinkClick}
                      className={`flex items-center rounded-2xl transition-all duration-500 group relative ${
                        isOpen ? "px-4 py-3.5 space-x-4" : "justify-center py-3.5"
                      } ${
                        isActive
                          ? "bg-purple-500/10 text-purple-300 shadow-[inset_0_0_20px_rgba(168,85,247,0.1)]"
                          : "text-gray-500 hover:text-gray-200 hover:bg-white/5"
                      }`}
                    >
                      <link.icon
                        className={`flex-shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${
                          isActive ? "text-purple-400" : ""
                        }`}
                        size={22}
                      />
                      <AnimatePresence mode="wait">
                        {isOpen && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="text-xs font-bold uppercase tracking-[0.2em] whitespace-nowrap"
                          >
                            {link.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {!isOpen && (
                        <div className="absolute left-full ml-6 px-4 py-2 bg-gray-900 border border-white/10 text-purple-200 text-[10px] font-bold tracking-[0.2em] uppercase rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-50 pointer-events-none">
                          {link.name}
                        </div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* System Pulse */}
          <div
            className={`mt-auto pt-6 border-t border-white/5 ${isOpen ? "px-8" : "px-2"}`}
          >
            <div
              className={`flex items-center ${isOpen ? "justify-start space-x-3" : "justify-center"}`}
            >
              <div className="relative flex items-center justify-center">
                <Flame size={14} className="text-purple-500 animate-pulse" />
                <div className="absolute w-4 h-4 bg-purple-500/20 rounded-full animate-ping" />
              </div>
              {isOpen && (
                <span className="text-[9px] tracking-[0.4em] text-gray-600 uppercase font-bold">
                  Eternal Flame Lit
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;