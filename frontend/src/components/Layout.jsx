import React, { useRef, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useSidebar } from "../hooks/useAnimatedSidebar";
import Navbar from "./Navbar";
import useAuthStore from "../stores/authStore";
import Sidebar from "./SidebarTorooto";

const Layout = () => {
  const { user } = useAuthStore();
  const {
    isOpen: sidebarOpen,
    toggle: toggleSidebar,
    close: closeSidebar,
  } = useSidebar(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        closeSidebar();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [closeSidebar]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="night-sky min-h-screen bg-[#050505] text-white">
      <Navbar
        toggleSidebar={toggleSidebar}
        dropdownOpen={dropdownOpen}
        toggleDropdown={toggleDropdown}
        dropdownRef={dropdownRef}
      />

      <div className="flex pt-16">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        <main
          className={`flex-1 transition-all duration-500
            ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"}   // only apply margin on desktop
            ml-0                                      // no margin on mobile
            flex flex-col min-h-[calc(100vh-4rem)]`}
        >
          <div className="flex-grow p-6">
            <Outlet context={{ sidebarOpen }} />
          </div>

          <footer className="mt-12 border-t border-white/5 py-6 md:py-8 px-4 md:px-8 backdrop-blur-md bg-black/20">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
              <div className="text-center md:text-left">
                <p className="text-purple-200/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
                  The Archive of Torooto
                </p>
                <p className="text-gray-600 text-[10px] md:text-[11px] font-serif italic">
                  © 2026 — Mystic Insights for the Modern Seer
                </p>
              </div>
              <div className="flex gap-4 md:gap-8 items-center">
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

const FooterLink = ({ href, label }) => (
  <a
    href={href}
    className="text-gray-500 hover:text-purple-400 text-[10px] font-bold uppercase tracking-widest transition-colors duration-300"
  >
    {label}
  </a>
);

export default Layout;
