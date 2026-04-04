// components/NotFound.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaCompass } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center max-w-lg"
      >
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          <FaCompass className="text-8xl text-indigo-500/50 mb-8 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
        </motion.div>

        <h1 className="text-7xl font-bold text-white mb-4 tracking-tighter">
          4<span className="text-indigo-500">0</span>4
        </h1>
        
        <h2 className="text-2xl font-semibold text-gray-300 mb-6 tracking-wide">
          Lost in the Void
        </h2>
        
        <p className="text-gray-500 mb-10 leading-relaxed">
          The coordinates you entered lead to uncharted space. This sector doesn't exist, or has been consumed by a black hole.
        </p>

        <Link
          to="/"
          className="px-8 py-3 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded-xl hover:bg-indigo-500/20 hover:text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all duration-300 backdrop-blur-md"
        >
          Return to Base
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;