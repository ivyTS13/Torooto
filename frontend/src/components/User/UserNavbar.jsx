import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { User, LogOut, LogIn, Menu, X } from "lucide-react";
import useAuthStore from "../../stores/authStore";
import logoUrl from "../../assets/name.svg";
import EngravedAvatar from "../common/EngravedAvatar";

const NAV_ITEMS = [
  { label: "Tarot", to: "/" },
  { label: "Decks", to: "/tarot" },
  { label: "Piles", to: "/piles" },
];

const RITUAL_EASE = [0.22, 1, 0.36, 1];

export default function UserNavbar({ currentPath: propPath }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navContainerRef = useRef(null);
  const location = useLocation();
  const currentPath = propPath || location.pathname;

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
    setDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (
        navContainerRef.current &&
        !navContainerRef.current.contains(event.target)
      ) {
        setMobileMenuOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const isNavItemActive = (to) =>
    to === "/"
      ? currentPath === "/"
      : currentPath === to || currentPath.startsWith(`${to}/`);

  return (
    <header
      ref={navContainerRef}
      className="fixed top-0 left-0 right-0 z-40 border-b border-[#C5A059]/20 bg-[#0B0A0E]/95"
    >
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:px-6 md:px-8"
      >
        <Link
          to="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex shrink-0 items-center rounded-sm py-1 transition-opacity duration-300 ease-ritual hover:opacity-85 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
        >
          <img
            src={logoUrl}
            alt="Torooto"
            width={140}
            height={32}
            className="block h-6 w-auto sm:h-8 md:h-9 object-contain"
          />
        </Link>

        {/* Desktop & Tablet Navigation (>= md) */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex items-center border-r border-[#C5A059]/20 pr-4 gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive = isNavItemActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative px-3 py-2 text-sm font-display tracking-[0.12em] uppercase transition-colors duration-300 ease-ritual rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059] ${
                    isActive
                      ? "text-[#C5A059]"
                      : "text-[#9E9689] hover:text-[#E8E2D5]"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-2 -bottom-[1px] h-[1px] bg-[#C5A059]"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="relative shrink-0" ref={dropdownRef}>
            {user ? (
              <>
                <button
                  type="button"
                  onClick={toggleDropdown}
                  aria-label="Open account menu"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-2 rounded-sm p-1 transition-colors duration-300 ease-ritual hover:bg-[#141218] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                >
                  <EngravedAvatar user={user} size={32} className="rounded-sm" />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <Motion.div
                      role="menu"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.25, ease: RITUAL_EASE }}
                      className="folio-plate folio-inset absolute right-0 mt-2.5 w-60 max-w-[calc(100vw-1.5rem)] rounded-sm overflow-hidden z-50"
                    >
                      <div className="relative border-b border-[#C5A059]/20 bg-[#1C1917]/50 px-5 py-4">
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C5A059]">
                          Account
                        </p>
                        <p className="mt-1 font-serif text-lg font-medium text-[#E8E2D5] truncate">
                          {user.name || "Member"}
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] text-[#9E9689] truncate">
                          {user.email}
                        </p>
                      </div>

                      <div className="p-2 space-y-1">
                        <Link
                          role="menuitem"
                          to={user.is_superuser ? "/admin/profile" : "/profile"}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-display tracking-[0.15em] uppercase text-[#E8E2D5] hover:bg-[#1C1917] hover:text-[#C5A059] rounded-sm transition-colors duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                        >
                          <User size={15} className="text-[#8A6D3B]" />
                          <span>Profile</span>
                        </Link>

                        <div className="brass-divider my-1" />

                        <button
                          role="menuitem"
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-display tracking-[0.15em] uppercase text-[#C9A49A] hover:bg-[#5E1914]/35 hover:text-[#E8E2D5] rounded-sm transition-colors duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                        >
                          <LogOut size={15} />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </Motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center gap-1.5 border border-[#C5A059]/35 bg-[#141218] px-3 py-1.5 text-[11px] sm:text-xs font-display uppercase tracking-[0.12em] text-[#E8E2D5] rounded-sm transition-colors duration-300 ease-ritual hover:border-[#C5A059]/65 hover:text-[#C5A059] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
              >
                <LogIn size={14} className="text-[#C5A059]" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Trigger (< 768px) */}
          <button
            type="button"
            onClick={toggleMobileMenu}
            aria-label={
              mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-primary-drawer"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-sm border border-[#C5A059]/25 bg-[#141218] text-[#E8E2D5] hover:border-[#C5A059]/60 hover:text-[#C5A059] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Panel (< 768px) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <Motion.div
            id="mobile-primary-drawer"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: RITUAL_EASE }}
            className="md:hidden border-t border-[#C5A059]/20 bg-[#141218] px-4 py-3 shadow-plate"
          >
            <div className="flex flex-col divide-y divide-[#C5A059]/15">
              {NAV_ITEMS.map((item) => {
                const isActive = isNavItemActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between py-3 px-2 font-display text-xs uppercase tracking-[0.18em] rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059] ${
                      isActive
                        ? "text-[#C5A059] bg-[#1C1917]"
                        : "text-[#E8E2D5] hover:text-[#C5A059]"
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 rotate-45 bg-[#C5A059]"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
