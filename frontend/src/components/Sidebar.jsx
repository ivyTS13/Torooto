// components/Sidebar.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaHome, FaChartLine, FaEnvelope, FaCog, FaQuestion 
} from 'react-icons/fa';

const Sidebar = ({ isOpen }) => {
  const navLinks = [
    { name: 'Dashboard', icon: FaHome, path: '/' },
    { name: 'Decks', icon: FaChartLine, path: '/decks' },
    { name: 'Messages', icon: FaEnvelope, path: '/messages' },
    { name: 'Settings', icon: FaCog, path: '/settings' },
    { name: 'Help Center', icon: FaQuestion, path: '/help' },
  ];

  return (
    <motion.aside
      initial={isOpen ? "open" : "closed"}
      animate={isOpen ? "open" : "closed"}
      variants={{
        open: { width: 256 },
        closed: { width: 80 }
      }}
      transition={{
        type: 'tween',
        ease: 'easeInOut',
        duration: 0.3,
      }}
      // Added deeper darks, subtle purple border, and heavier shadow for a mysterious vibe
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-750/50 to-black/95 backdrop-blur-2xl border-r border-indigo-500/10 shadow-[4px_0_30px_rgba(0,0,0,0.8)] z-40 overflow-hidden"
    >
      <div className="flex flex-col h-full py-6">
        
        {/* Navigation Links */}
        <nav className="flex-1 mt-4">
          <ul className="space-y-3 px-3">
            {navLinks.map((link, idx) => (
              <motion.li
                key={link.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                {/* Replaced <a> with <Link> to prevent full page reloads */}
                <Link
                  to={link.path}
                  className="flex items-center space-x-3 px-3 py-3 rounded-xl text-gray-500 hover:text-indigo-300 hover:bg-indigo-500/10 hover:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all duration-300 group relative"
                >
                  <link.icon className={`text-xl transition-all duration-300 ${isOpen ? 'mr-0' : 'mx-auto'}`} />
                  
                  <AnimatePresence mode="wait">
                    {isOpen && (
                      <motion.span
                        initial={{ opacity: 0, filter: "blur(4px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, filter: "blur(4px)" }}
                        transition={{ duration: 0.2 }}
                        className="text-sm font-medium tracking-wide whitespace-nowrap overflow-hidden"
                      >
                        {link.name}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Tooltip for closed state */}
                  {!isOpen && (
                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-gray-900 border border-indigo-500/20 text-indigo-200 text-xs tracking-wider rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50 pointer-events-none">
                      {link.name}
                    </div>
                  )}
                </Link>
              </motion.li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className={`mt-auto pt-6 border-t border-indigo-500/10 ${isOpen ? 'px-4' : 'px-2'}`}>
          <div className={`flex items-center ${isOpen ? 'justify-start space-x-3' : 'justify-center'}`}>
            {/* Changed from green to a mysterious purple pulse */}
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            
            <AnimatePresence>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs tracking-widest text-indigo-500/50 uppercase font-semibold"
                >
                  System Online
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;