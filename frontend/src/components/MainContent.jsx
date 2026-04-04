// components/MainContent.jsx
import React from 'react';
import { FaStar } from 'react-icons/fa';

const MainContent = ({ sidebarOpen }) => {
  return (
    <main
      className={`transition-all duration-500 ease-in-out p-8 pt-20 ${
        sidebarOpen ? 'ml-64' : 'ml-20'
      }`}
    >
      <div className="max-w-7xl mx-auto">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Card */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 animate-fadeIn">
            Welcome back, Explorer ✨
          </h1>
          <p className="text-gray-300">The night sky holds infinite possibilities. Ready to explore your dashboard?</p>
        </div>

        {/* Sample Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white/5 backdrop-blur-md rounded-xl p-5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <FaStar className="text-white text-sm" />
                </div>
                <h3 className="text-white font-semibold">Stellar Card {i}</h3>
              </div>
              <p className="text-gray-400 text-sm">Explore the cosmic data and insights from the celestial dashboard.</p>
            </div>
          ))}
        </div>
      </div>
      </div>
    </main>
  );
};

export default MainContent;