import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Menu, User, LogOut, LogIn } from "lucide-react";
import useAuthStore from "../stores/authStore";
import EngravedAvatar from "./common/EngravedAvatar";

const Navbar = ({
  toggleSidebar,
  sidebarOpen,
  dropdownOpen,
  toggleDropdown,
  dropdownRef,
}) => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-[#0B0A0E]/95 border-b border-[#C5A059]/20">
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar navigation"
            aria-expanded={sidebarOpen}
            className="p-2 rounded-sm border border-transparent text-[#9E9689] hover:text-[#E8E2D5] hover:border-[#C5A059]/30 hover:bg-[#141218] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
          >
            <Menu size={20} />
          </button>

          <Link
            to="/admin"
            className="flex items-center gap-3 rounded-sm px-1 py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
          >
            <span className="font-display text-lg md:text-xl tracking-[0.2em] uppercase text-[#E8E2D5]">
              Torooto
            </span>
            <span className="hidden sm:inline-block border-l border-[#C5A059]/30 pl-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[#C5A059]">
              Curator Desk
            </span>
          </Link>
        </div>

        <div className="relative" ref={dropdownRef}>
          {user ? (
            <>
              <button
                type="button"
                onClick={toggleDropdown}
                aria-label="Open account menu"
                aria-expanded={dropdownOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2.5 p-1 rounded-sm hover:bg-[#141218] transition-colors duration-300 border border-transparent hover:border-[#C5A059]/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
              >
                <EngravedAvatar user={user} size={34} className="rounded-sm" />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <Motion.div
                    role="menu"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{
                      duration: 0.25,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="folio-plate folio-inset absolute right-0 mt-3 w-64 rounded-sm overflow-hidden z-50"
                  >
                    <div className="px-5 py-4 border-b border-[#C5A059]/20 bg-[#1C1917]/50">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C5A059]">
                        Curator Account
                      </p>
                      <p className="mt-1 font-serif text-lg font-medium text-[#E8E2D5] truncate">
                        {user.name || "Archivist"}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-[#9E9689] truncate">
                        {user.email}
                      </p>
                    </div>

                    <div className="p-2 space-y-1">
                      <DropdownItem
                        to="/admin/profile"
                        icon={User}
                        label="Profile"
                        onClick={toggleDropdown}
                      />
                      <div className="brass-divider my-1" />
                      <button
                        role="menuitem"
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-display tracking-[0.15em] uppercase text-[#C9A49A] hover:bg-[#5E1914]/35 hover:text-[#E8E2D5] rounded-sm transition-colors duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                      >
                        <LogOut size={16} />
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
              className="inline-flex items-center gap-2 px-3.5 py-2 border border-[#C5A059]/35 bg-[#141218] text-xs font-display uppercase tracking-[0.14em] text-[#E8E2D5] rounded-sm transition-colors duration-300 hover:border-[#C5A059]/65 hover:text-[#C5A059] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
            >
              <LogIn size={15} className="text-[#C5A059]" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

const DropdownItem = ({ to, icon, label, onClick }) => {
  const IconComponent = icon;
  return (
    <Link
      role="menuitem"
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-xs font-display tracking-[0.15em] uppercase text-[#E8E2D5] hover:bg-[#1C1917] hover:text-[#C5A059] rounded-sm transition-colors duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
    >
      <IconComponent size={16} className="text-[#8A6D3B]" />
      <span>{label}</span>
    </Link>
  );
};

export default Navbar;
