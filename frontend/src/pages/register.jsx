import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    <div className="night-sky min-h-screen flex items-center justify-center p-6 bg-[#050505]">
      {/* Mystical Glow Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-lg">
        <div className="bg-black/40 backdrop-blur-2xl p-10 rounded-[3rem] shadow-2xl border border-white/10 relative overflow-hidden">
          {/* Header Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl mb-6 group">
              <Wand2
                className="text-emerald-400 group-hover:rotate-45 transition-transform duration-500"
                size={28}
              />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight font-serif italic">
              Begin Your Ascension
            </h2>
            <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] mt-3 font-bold">
              Initiate the Soul-Binding Ritual
            </p>
          </div>

          {/* Error Handling */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-4 py-3 rounded-2xl mb-8 flex items-center gap-3 animate-shake">
              <AlertCircle size={18} />
              <span className="text-xs font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mortal Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold ml-1">
                  <User size={12} /> Mortal Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="The Alchemist"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-purple-500/50 outline-none transition-all placeholder:text-gray-700"
                  required
                />
              </div>

              {/* Spirit Tether (Email) */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold ml-1">
                  <Mail size={12} /> Spirit Tether
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ethereal@void.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-purple-500/50 outline-none transition-all placeholder:text-gray-700"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Secret Sigil (Password) */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold ml-1">
                  <Key size={12} /> Secret Sigil
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-purple-500/50 outline-none transition-all placeholder:text-gray-700"
                  required
                />
              </div>

              {/* Ascension Date (Birthday) */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold ml-1">
                  <Calendar size={12} /> Ascension Date
                </label>
                <input
                  type="date"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-purple-500/50 outline-none transition-all color-scheme-dark"
                  required
                />
              </div>
            </div>

            <p className="text-[10px] text-indigo-400/60 font-serif italic text-center">
              Your celestial alignment (Zodiac) will be revealed upon entry.
            </p>

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-bold shadow-xl shadow-emerald-950/20 transition-all flex justify-center items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span className="relative z-10 uppercase tracking-widest text-xs font-bold">
                    Inscribe in the Records
                  </span>
                  <Sparkles
                    size={16}
                    className="relative z-10 text-emerald-200"
                  />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-10 text-center">
            <p className="text-gray-500 text-[11px] font-medium tracking-wide">
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
      </div>
    </div>
  );
};

export default Register;
