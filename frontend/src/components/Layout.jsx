import React, { useRef, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSidebar } from '../hooks/useAnimatedSidebar';
import Navbar from "./Navbar";
import useAuthStore from '../stores/authStore';
import Sidebar from './sidebar';

const Layout = () => {
  // 1. ALL HOOKS MUST BE AT THE TOP
  const { user } = useAuthStore();
  
  // Custom hooks and React hooks call order must be preserved
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

  // 2. CONDITIONAL RETURN AFTER ALL HOOKS
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="night-sky min-h-screen bg-[#050505] text-white">
      <Navbar
        toggleSidebar={toggleSidebar}
        dropdownOpen={dropdownOpen}
        toggleDropdown={toggleDropdown}
        dropdownRef={dropdownRef}
      />
      
      <div className="flex pt-16">
        <Sidebar isOpen={sidebarOpen} />
        
        <main className={`flex-1 transition-all duration-500 ${sidebarOpen ? 'ml-64' : 'ml-20'} flex flex-col min-h-[calc(100vh-4rem)]`}>
          {/* Main Content Area */}
          <div className="flex-grow p-6">
            <Outlet context={{ sidebarOpen }} />
          </div>
          
          {/* Mystic Footer */}
          <footer className="mt-12 border-t border-white/5 py-8 px-8 backdrop-blur-md bg-black/20">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <p className="text-purple-200/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
                  The Archive of Torooto
                </p>
                <p className="text-gray-600 text-[11px] font-serif italic">
                  © 2026 — Mystic Insights for the Modern Seer
                </p>
              </div>
              
              <div className="flex gap-8 items-center">
                <FooterLink href="/help" label="Seek Help" />
                <FooterLink href="/terms" label="The Covenant" />
                <FooterLink href="/privacy" label="Privacy Cloak" />
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

// Simple helper for themed links
const FooterLink = ({ href, label }) => (
  <a 
    href={href} 
    className="text-gray-500 hover:text-purple-400 text-[10px] font-bold uppercase tracking-widest transition-colors duration-300"
  >
    {label}
  </a>
);

export default Layout;