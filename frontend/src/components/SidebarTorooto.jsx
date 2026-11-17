import React from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Compass, Library, Layers, BookOpen } from "lucide-react";
import useAuthStore from "../stores/authStore";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const publicLinks = [{ name: "Deck Catalog", icon: Library, path: "/tarot" }];
  const userLinks = [
    { name: "Reading Desk", icon: Compass, path: "/admin" },
    { name: "Saved Readings", icon: BookOpen, path: "/admin/piles" },
  ];
  const adminLinks = [
    { name: "Deck Registry", icon: Layers, path: "/admin/decks" },
  ];
  const navLinks = user
    ? [...userLinks, ...(user.is_superuser ? adminLinks : [])]
    : publicLinks;

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      onClose?.();
    }
  };

  const mobileClasses = isOpen
    ? "max-lg:translate-x-0 max-lg:visible max-lg:pointer-events-auto"
    : "max-lg:-translate-x-full max-lg:invisible max-lg:pointer-events-none";

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <Motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-[#0B0A0E]/75 overscroll-contain lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        aria-label="Sidebar navigation"
        className={`fixed left-0 top-16 h-[calc(100dvh-4rem)] bg-[#141218] border-r border-[#C5A059]/20 shadow-[20px_0_40px_-15px_rgba(11,10,14,0.9)] z-40 overflow-hidden
          transition-[transform,visibility] duration-300 ease-ritual ${mobileClasses}
          lg:translate-x-0 lg:visible ${isOpen ? "w-64" : "w-64 lg:w-20"}`}
      >
        <div className="flex flex-col h-full py-6">
          <nav className="flex-1">
            <ul className="space-y-2 px-3">
              {navLinks.map((link) => {
                const isActive =
                  location.pathname === link.path ||
                  (link.path !== "/admin" &&
                    location.pathname.startsWith(`${link.path}/`));
                const LinkIcon = link.icon;
                return (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      onClick={handleLinkClick}
                      className={`flex items-center rounded-sm transition-colors duration-300 group relative focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059] ${
                        isOpen ? "px-3.5 py-3 gap-3.5" : "justify-center py-3"
                      } ${
                        isActive
                          ? "bg-[#1C1917] text-[#C5A059] border-l-2 border-[#C5A059]"
                          : "text-[#9E9689] hover:text-[#E8E2D5] hover:bg-[#1C1917]/60 border-l-2 border-transparent"
                      }`}
                    >
                      <LinkIcon
                        className={`flex-shrink-0 transition-transform duration-300 ease-ritual group-hover:scale-105 ${
                          isActive ? "text-[#C5A059]" : "text-[#8A6D3B]"
                        }`}
                        size={19}
                      />
                      {isOpen && (
                        <span className="font-display text-xs uppercase tracking-[0.16em] whitespace-nowrap">
                          {link.name}
                        </span>
                      )}
                      {!isOpen && (
                        <span className="pointer-events-none absolute left-full ml-4 px-3 py-1.5 bg-[#141218] border border-[#C5A059]/30 text-[#E8E2D5] font-mono text-[10px] uppercase tracking-[0.18em] rounded-sm shadow-cast opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                          {link.name}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div
            className={`mt-auto pt-5 border-t border-[#C5A059]/20 ${
              isOpen ? "px-6" : "px-2"
            }`}
          >
            <div
              className={`flex items-center ${
                isOpen ? "justify-between" : "justify-center"
              }`}
            >
              <span
                aria-hidden="true"
                className="h-2 w-2 rotate-45 border border-[#C5A059]/70 bg-[#5E1914]"
              />
              {isOpen && (
                <span className="font-mono text-[10px] tracking-[0.24em] text-[#9E9689] uppercase">
                  Folio Edition
                </span>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
