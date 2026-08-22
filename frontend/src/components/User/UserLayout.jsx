import React, { useMemo } from "react";
import UserNavbar from "./UserNavbar";

export default function PageLayout({ children, currentPath }) {
  // Generate star data once and keep it stable across renders
  const stars = useMemo(() => {
    return Array.from({ length: 80 }).map(() => ({
      size: Math.random() * 3 + 1,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDuration: 2 + Math.random() * 4,
      animationDelay: Math.random() * 5,
    }));
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030014] text-white">
      {/* ========================================================= */}
      {/* Custom Animations for Portal-like Stars */}
      {/* ========================================================= */}
      <style>{`
  @keyframes twinkle {
    0%, 100% { opacity: 0.2; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.2); }
  }
  
  @keyframes shootingStar {
    0% { 
      transform: translate(0, 0) rotate(-45deg) scaleX(1); 
      opacity: 0; 
    }
    5% { 
      opacity: 0; 
    }
    10% { 
      opacity: 1; 
    }
    20% { 
      transform: translate(-500px, 500px) rotate(-45deg) scaleX(2); 
      opacity: 0; 
    }
    100% { 
      transform: translate(-500px, 500px) rotate(-45deg) scaleX(2); 
      opacity: 0; 
    }
  }
`}</style>

      {/* ========================================================= */}
      {/* Cosmic Background Elements */}
      {/* ========================================================= */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#05001a] via-[#030014] to-black" />

      {/* Vibrant Portal Glows */}
      <div
        className="absolute -top-[20rem] left-1/2 -translate-x-1/2 w-[120rem] h-[50rem] rounded-[100%] opacity-50 blur-[160px] pointer-events-none mix-blend-screen"
        style={{
          background: `
            radial-gradient(ellipse at center, 
            rgba(0, 153, 255, 0.6) 0%, 
            rgba(168, 85, 247, 0.4) 40%, 
            rgba(236, 72, 153, 0.2) 70%, 
            transparent 100%)
          `,
        }}
      />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90rem] h-[90rem] rounded-full bg-blue-600/10 blur-[200px]" />
      <div className="absolute bottom-[-30rem] left-1/2 -translate-x-1/2 w-[150rem] h-[60rem] rounded-[100%] bg-indigo-600/20 blur-[150px] pointer-events-none" />

      {/* Flickering Stars (stable positions) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              left: `${star.left}%`,
              top: `${star.top}%`,
              animation: `twinkle ${star.animationDuration}s infinite ease-in-out`,
              animationDelay: `${star.animationDelay}s`,
            }}
          />
        ))}
      </div>

      {/* Shooting Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-10%] right-[-10%] w-[184px] h-[2px] bg-gradient-to-r from-transparent via-white to-transparent"
          style={{ animation: "shootingStar 7s infinite 1s" }}
        />
        <div
          className="absolute top-[-5%] right-[-15%] w-[220px] h-[2px] bg-gradient-to-r from-transparent via-blue-200 to-transparent"
          style={{ animation: "shootingStar 9s infinite 4s" }}
        />
        <div
          className="absolute top-[10%] right-[-20%] w-[150px] h-[2px] bg-gradient-to-r from-transparent via-purple-200 to-transparent"
          style={{ animation: "shootingStar 12s infinite 8s" }}
        />
      </div>
      {/* ========================================================= */}
      {/* Shared Navigation Layer */}
      {/* ========================================================= */}
      <UserNavbar currentPath={currentPath} />
      <main className="relative z-20 flex min-h-screen flex-col items-center justify-center px-4 pt-20 pb-10">
        {children}
      </main>
    </div>
  );
}
