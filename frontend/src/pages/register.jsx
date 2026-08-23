import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Key,
  Calendar,
  Sparkles,
  Loader2,
  AlertCircle,
  Wand2,
} from "lucide-react";
import useAuthStore from "../stores/authStore";
import PageLayout from "../components/User/UserLayout"; // adjust path as needed

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    birthday: "",
  });

  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const success = await register(formData);
    if (success) navigate("/");
  };

  return (
    <PageLayout currentPath="/register">
      {/* Centered wrapper minimal vertical padding */}
      <div className="relative z-20 flex w-full items-center justify-center py-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", damping: 25 }}
          className="w-full max-w-lg px-4"
        >
          {/* Glassmorphic Card Container */}
          <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[0_0_50px_rgba(16,185,129,0.15)] backdrop-blur-2xl overflow-hidden">
            
            {/* Soft background reflection accent (Emerald theme) */}
            <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/20 blur-2xl" />

            {/* Header Section */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-3 group">
                <Wand2
                  className="text-emerald-400 group-hover:rotate-12 transition-transform duration-500"
                  size={22}
                />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight font-serif italic">
                Begin Your Ascension
              </h2>
              <p className="text-gray-400 text-[10px] uppercase tracking-[0.25em] mt-1 font-semibold">
                Initiate the Soul-Binding Ritual
              </p>
            </div>

            {/* Error Handling */}
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-3 py-2 rounded-xl mb-4 flex items-center gap-2 animate-shake">
                <AlertCircle size={16} className="shrink-0" />
                <span className="text-xs font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mortal Name */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold ml-1">
                    <User size={12} />  Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="The Alchemist"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-400 focus:bg-white/10 outline-none transition-all placeholder:text-gray-600"
                    required
                  />
                </div>

                {/* Spirit Tether (Email) */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold ml-1">
                    <Mail size={12} /> Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ethereal@void.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-400 focus:bg-white/10 outline-none transition-all placeholder:text-gray-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Secret Sigil (Password) */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold ml-1">
                    <Key size={12} /> Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-400 focus:bg-white/10 outline-none transition-all placeholder:text-gray-600"
                    required
                  />
                </div>

                {/* Ascension Date (Birthday) */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold ml-1">
                    <Calendar size={12} /> Birthday
                  </label>
                  <input
                    type="date"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-400 focus:bg-white/10 outline-none transition-all [color-scheme:dark]"
                    required
                  />
                </div>
              </div>

              <p className="text-[10px] text-emerald-400/60 font-serif italic text-center mt-2">
                Your celestial alignment (Zodiac) will be revealed upon entry.
              </p>

              {/* Register Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full mt-2 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-950/50 transition-all active:scale-98 flex justify-center items-center gap-2 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                {isLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <span className="relative z-10 uppercase tracking-widest text-xs">
                      Inscribe in the Records
                    </span>
                    <Sparkles
                      size={14}
                      className="relative z-10 text-emerald-200"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Footer Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-[11px] font-medium tracking-wide">
                Already walking the path?{" "}
                <Link
                  to="/login"
                  className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors underline underline-offset-4 decoration-emerald-500/30"
                >
                  Return to the Void
                </Link>
              </p>
            </div>
          </div>

          {/* Outer subtle tagline */}
          <p className="text-center text-gray-600 text-[9px] uppercase tracking-[0.5em] mt-4">
            Torooto
          </p>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default Register;