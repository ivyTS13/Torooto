import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Moon, Sparkles, Key, Mail, Loader2, AlertCircle } from "lucide-react";
import useAuthStore from "../stores/authStore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const success = await login(email, password);
    if (success) navigate("/");
  };

  return (
    <div className="night-sky min-h-screen flex items-center justify-center p-6 bg-[#050505]">
      {/* Decorative Background Elements */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* The Main Portal (Card) */}
        <div className="bg-black/40 backdrop-blur-2xl p-10 rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden">
          {/* Header Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/10 border border-purple-500/20 rounded-3xl mb-6 group">
              <Moon
                className="text-purple-400 group-hover:rotate-12 transition-transform duration-500"
                size={28}
              />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight font-serif italic">
              Return to the Void
            </h2>
            <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] mt-3 font-bold">
              Inscribe your credentials
            </p>
          </div>

          {/* Error Message - Using the "Banishment" red theme */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-4 py-3 rounded-2xl mb-8 flex items-center gap-3 animate-shake">
              <AlertCircle size={18} />
              <span className="text-xs font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold ml-1">
                <Mail size={12} /> Spirit Tether (Email)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-purple-500/50 outline-none transition-all placeholder:text-gray-700"
                placeholder="oracle@torooto.com"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold ml-1">
                <Key size={12} /> Secret Sigil (Password)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-purple-500/50 outline-none transition-all placeholder:text-gray-700"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-bold shadow-xl shadow-purple-950/40 transition-all flex justify-center items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span className="relative z-10 uppercase tracking-widest text-xs">
                    Unlock the Grimoire
                  </span>
                  <Sparkles
                    size={16}
                    className="relative z-10 text-purple-200"
                  />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-10 text-center">
            <p className="text-gray-500 text-[11px] font-medium tracking-wide">
              New seeker?{" "}
              <Link
                to="/register"
                className="text-purple-400 hover:text-purple-300 font-bold transition-colors underline underline-offset-4 decoration-purple-500/30"
              >
                Begin your journey
              </Link>
            </p>
          </div>
        </div>

        {/* Outer subtle tagline */}
        <p className="text-center text-gray-700 text-[9px] uppercase tracking-[0.5em] mt-8">
          Torooto — Secure Archive System
        </p>
      </div>
    </div>
  );
};

export default Login;
