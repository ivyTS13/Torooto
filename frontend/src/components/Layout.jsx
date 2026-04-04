// components/Layout.jsx
import React, { useRef, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSidebar } from '../hooks/useAnimatedSidebar';
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import useAuthStore from '../stores/authStore';

const Layout = () => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  
  const { isOpen: sidebarOpen, toggle: toggleSidebar } = useSidebar(true);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="night-sky">
      <Navbar
        toggleSidebar={toggleSidebar}
        dropdownOpen={dropdownOpen}
        toggleDropdown={toggleDropdown}
        dropdownRef={dropdownRef}
      />
      <div className="flex pt-16">
        <Sidebar isOpen={sidebarOpen} />
        <main className={`flex-1 transition-all ${sidebarOpen ? 'ml-64' : 'ml-20'} flex flex-col min-h-[calc(100vh-4rem)]`}>
          {/* Main content area - grows to push footer down if needed */}
          <div className="flex-grow">
            <Outlet context={{ sidebarOpen }} />
          </div>
          
          {/* Simple Footer */}
          <footer className="mt-8 border-t border-indigo-500/10 py-4 px-6 text-center text-gray-400 text-xs">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
              <p>© {new Date().getFullYear()} Torooto — Mystic Tarot Insights</p>
              <div className="flex gap-4">
                <a href="/privacy" className="hover:text-indigo-300 transition-colors">Privacy</a>
                <a href="/terms" className="hover:text-indigo-300 transition-colors">Terms</a>
                <a href="/help" className="hover:text-indigo-300 transition-colors">Help</a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Layout;