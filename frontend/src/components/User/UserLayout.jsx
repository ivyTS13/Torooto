import React from "react";
import UserNavbar from "./UserNavbar";
import FilmGrainOverlay from "../common/FilmGrainOverlay";
import CelestialCanvas from "../common/CelestialCanvas";

export default function PageLayout({ children, currentPath }) {
  return (
    <div className="tarot-canvas text-[#E8E2D5] overflow-x-hidden">
      <CelestialCanvas />
      <FilmGrainOverlay />
      <UserNavbar currentPath={currentPath} />
      <main className="relative z-20 mx-auto flex min-h-[100dvh] w-full max-w-7xl flex-col items-center justify-center px-4 pt-20 pb-12 sm:px-6 md:px-8">
        {children}
      </main>
    </div>
  );
}
