import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { Key, Mail, Loader2, AlertCircle } from "lucide-react";
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
      const user = useAuthStore.getState().user;
      if (user?.is_superuser) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  };

  return (
    <PageLayout currentPath="/login">
      <div className="relative z-20 flex w-full items-center justify-center py-6">
        <Motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="folio-plate folio-inset rounded-sm p-7 sm:p-10">
            <div className="text-center mb-7">
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center border border-[#C5A059]/40 bg-[#1C1917] rounded-sm">
                <span className="font-display text-xs tracking-[0.2em] text-[#C5A059]">
                  I
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl tracking-[0.14em] uppercase text-[#E8E2D5]">
                Sign In
              </h1>
              <p className="mt-2 font-serif italic text-base text-[#9E9689]">
                Return to your reading table and saved archive
              </p>
              <div className="brass-divider mt-5" />
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 flex items-center gap-2.5 rounded-sm border border-[#8B3A32] bg-[#5E1914]/35 px-3.5 py-2.5 text-[#E8E2D5]"
              >
                <AlertCircle size={16} className="shrink-0 text-[#C9A49A]" />
                <span className="text-xs leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="login-email"
                  className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#9E9689]"
                >
                  <Mail size={13} className="text-[#8A6D3B]" />
                  <span>Email</span>
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  spellCheck={false}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-sm border border-[#C5A059]/25 bg-[#1C1917] px-3.5 py-2.5 text-sm text-[#E8E2D5] placeholder:text-[#9E9689]/50 transition-colors duration-300 focus-visible:outline-none focus-visible:border-[#C5A059] focus-visible:ring-1 focus-visible:ring-[#C5A059]/60"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="login-password"
                  className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#9E9689]"
                >
                  <Key size={13} className="text-[#8A6D3B]" />
                  <span>Password</span>
                </label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-sm border border-[#C5A059]/25 bg-[#1C1917] px-3.5 py-2.5 text-sm text-[#E8E2D5] placeholder:text-[#9E9689]/50 transition-colors duration-300 focus-visible:outline-none focus-visible:border-[#C5A059] focus-visible:ring-1 focus-visible:ring-[#C5A059]/60"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-sm bg-[#C5A059] hover:bg-[#D2B06B] text-[#0B0A0E] font-display text-xs font-semibold uppercase tracking-[0.2em] transition-colors duration-300 ease-ritual active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8E2D5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141218]"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            <div className="mt-7 pt-5 border-t border-[#C5A059]/20 text-center">
              <p className="text-xs text-[#9E9689]">
                New to Torooto?{" "}
                <Link
                  to="/register"
                  className="text-[#C5A059] hover:text-[#E8E2D5] underline underline-offset-4 decoration-[#C5A059]/40 transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </Motion.div>
      </div>
    </PageLayout>
  );
};

export default Login;
