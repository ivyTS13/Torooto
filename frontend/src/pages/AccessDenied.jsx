import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';

const AccessDenied = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background ambient warning glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center max-w-lg"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          <FaLock className="text-8xl text-amber-500/40 mb-8 drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]" />
        </motion.div>

        <h1 className="text-7xl font-bold text-white mb-4 tracking-tighter">
          4<span className="text-amber-500">0</span>3
        </h1>
        
        <h2 className="text-2xl font-semibold text-gray-300 mb-6 tracking-wide uppercase">
          Restricted Sector
        </h2>
        
        <p className="text-gray-500 mb-10 leading-relaxed">
          Your authorization clearance is insufficient for this coordinate. This data is protected by the High Council encryption.
        </p>

        <Link
          to="/"
          className="px-8 py-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl hover:bg-amber-500/20 hover:text-white hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all duration-300 backdrop-blur-md"
        >
          Request Clearance
        </Link>
      </motion.div>
    </div>
  );
};

export default AccessDenied;