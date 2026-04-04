// components/ServerError.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaServer } from 'react-icons/fa';

const ServerError = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background ambient error glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-900/10 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center max-w-lg p-10 bg-black/40 backdrop-blur-xl border border-red-500/10 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)]"
      >
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <FaServer className="text-7xl text-red-500/50 mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]" />
        </motion.div>

        <h1 className="text-5xl font-bold text-white mb-4 tracking-tighter">
          System <span className="text-red-500/80">Failure</span>
        </h1>
        
        <h2 className="text-xl font-medium text-gray-400 mb-6 tracking-widest uppercase">
          Error 500
        </h2>
        
        <p className="text-gray-500 mb-10 leading-relaxed text-sm">
          A critical anomaly has occurred in the server core. Our diagnostic routines have been initiated. Please stand by or attempt to reconnect.
        </p>

        <div className="flex space-x-4">
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/20 hover:text-white transition-all duration-300"
          >
            Reboot System
          </button>
          <Link
            to="/"
            className="px-6 py-2 bg-transparent border border-gray-700 text-gray-400 rounded-lg hover:border-gray-500 hover:text-white transition-all duration-300"
          >
            Evacuate to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ServerError;