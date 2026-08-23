import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Moon, Sparkles, Key, Mail, Loader2, AlertCircle } from "lucide-react";
import useAuthStore from "../stores/authStore";
import PageLayout from "../components/User/UserLayout"; 
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const success = await login(email, password);
     if (success) {
      // ✅ Read the user directly from the store (already set by fetchUser)
      const user = useAuthStore.getState().user;
      if (user?.is_superuser) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true }); // or wherever regular users land
      }
    } else {
      setError(useAuthStore.getState().error || "Login failed");
    }
  };

  return (
    <PageLayout currentPath="/login">
      {/* Container wrapper focused on centering with minimal padding */}
      <div className="relative z-20 flex w-full items-center justify-center py-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", damping: 25 }}
          className="w-full max-w-sm px-4"
        >
          {/* Glassmorphic Card Container */}
          <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[0_0_50px_rgba(168,85,247,0.15)] backdrop-blur-2xl overflow-hidden">
            
            {/* Soft background reflection accent */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-500/20 blur-2xl" />

            {/* Header Section */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-2xl mb-3 group">
                <Moon
                  className="text-purple-400 group-hover:rotate-12 transition-transform duration-500"
                  size={22}
                />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight font-serif italic">
                Welcome Back
              </h2>
              <p className="text-gray-400 text-[10px] uppercase tracking-[0.25em] mt-1 font-semibold">
                Sign in to your account
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-3 py-2 rounded-xl mb-4 flex items-center gap-2 animate-shake">
                <AlertCircle size={16} className="shrink-0" />
                <span className="text-xs font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold ml-1">
                  <Mail size={12} /> Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-purple-400 focus:bg-white/10 outline-none transition-all placeholder:text-gray-600"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold ml-1">
                  <Key size={12} /> Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-purple-400 focus:bg-white/10 outline-none transition-all placeholder:text-gray-600"
                  placeholder="••••••••"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full mt-2 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-purple-950/50 transition-all active:scale-98 flex justify-center items-center gap-2 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                {isLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <span className="relative z-10 uppercase tracking-widest text-xs">
                      Sign In
                    </span>
                    <Sparkles
                      size={14}
                      className="relative z-10 text-purple-200"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Footer Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-[11px] font-medium tracking-wide">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-purple-400 hover:text-purple-300 font-bold transition-colors underline underline-offset-4 decoration-purple-500/30"
                >
                  Sign up
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

export default Login;