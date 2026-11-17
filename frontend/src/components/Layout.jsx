import React, { useRef, useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { useSidebar } from "../hooks/useAnimatedSidebar";
import Navbar from "./Navbar";
import Sidebar from "./SidebarTorooto";
import FilmGrainOverlay from "./common/FilmGrainOverlay";
import CelestialCanvas from "./common/CelestialCanvas";

const Layout = () => {
  const {
    isOpen: sidebarOpen,
    toggle: toggleSidebar,
    close: closeSidebar,
  } = useSidebar(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true,
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

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
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="tarot-canvas text-[#E8E2D5] overflow-x-hidden">
      <CelestialCanvas />
      <FilmGrainOverlay />
      <Navbar
        toggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        dropdownOpen={dropdownOpen}
        toggleDropdown={toggleDropdown}
        dropdownRef={dropdownRef}
      />

      <div className="relative z-20 flex pt-16">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        <main
          className={`flex-1 ${
            sidebarOpen ? "lg:ml-64" : "lg:ml-20"
          } ml-0 flex flex-col min-h-[calc(100dvh-4rem)]`}
        >
          <div className="flex-grow p-4 sm:p-6 md:p-8">
            <Outlet context={{ sidebarOpen }} />
          </div>

          <footer className="mt-12 border-t border-[#C5A059]/20 bg-[#0B0A0E] py-6 px-4 md:px-8">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <p className="font-display text-[11px] uppercase tracking-[0.22em] text-[#C5A059]">
                  Torooto Archive
                </p>
                <p className="font-serif italic text-xs text-[#9E9689] mt-0.5 tabular-nums">
                  © 2026 Torooto — Tarot Archive &amp; Reading Studio
                </p>
              </div>
              <div className="flex gap-6 items-center">
                <FooterLink to="/" label="Reading Room" />
                <FooterLink to="/tarot" label="Deck Catalog" />
                <FooterLink to="/admin/piles" label="Saved Readings" />
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

const FooterLink = ({ to, label }) => (
  <Link
    to={to}
    className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#9E9689] hover:text-[#C5A059] transition-colors duration-300 rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
  >
    {label}
  </Link>
);

export default Layout;
