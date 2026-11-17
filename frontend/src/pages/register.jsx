import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { User, Mail, Key, Calendar, Loader2, AlertCircle } from "lucide-react";
import useAuthStore from "../stores/authStore";
import PageLayout from "../components/User/UserLayout";

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
      <div className="relative z-20 flex w-full items-center justify-center py-6">
        <Motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-lg"
        >
          <div className="folio-plate folio-inset rounded-sm p-7 sm:p-10">
            <div className="text-center mb-7">
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center border border-[#C5A059]/40 bg-[#1C1917] rounded-sm">
                <span className="font-display text-xs tracking-[0.2em] text-[#C5A059]">
                  II
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl tracking-[0.14em] uppercase text-[#E8E2D5]">
                Create Account
              </h1>
              <p className="mt-2 font-serif italic text-base text-[#9E9689]">
                Keep a private ledger of draws, spreads, and reflections
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="register-name"
                    className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#9E9689]"
                  >
                    <User size={13} className="text-[#8A6D3B]" />
                    <span>Name</span>
                  </label>
                  <input
                    id="register-name"
                    type="text"
                    name="name"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Clara Vance"
                    className="w-full rounded-sm border border-[#C5A059]/25 bg-[#1C1917] px-3.5 py-2.5 text-sm text-[#E8E2D5] placeholder:text-[#9E9689]/50 transition-colors duration-300 focus-visible:outline-none focus-visible:border-[#C5A059] focus-visible:ring-1 focus-visible:ring-[#C5A059]/60"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="register-email"
                    className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#9E9689]"
                  >
                    <Mail size={13} className="text-[#8A6D3B]" />
                    <span>Email</span>
                  </label>
                  <input
                    id="register-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    spellCheck={false}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full rounded-sm border border-[#C5A059]/25 bg-[#1C1917] px-3.5 py-2.5 text-sm text-[#E8E2D5] placeholder:text-[#9E9689]/50 transition-colors duration-300 focus-visible:outline-none focus-visible:border-[#C5A059] focus-visible:ring-1 focus-visible:ring-[#C5A059]/60"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="register-password"
                    className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#9E9689]"
                  >
                    <Key size={13} className="text-[#8A6D3B]" />
                    <span>Password</span>
                  </label>
                  <input
                    id="register-password"
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    className="w-full rounded-sm border border-[#C5A059]/25 bg-[#1C1917] px-3.5 py-2.5 text-sm text-[#E8E2D5] placeholder:text-[#9E9689]/50 transition-colors duration-300 focus-visible:outline-none focus-visible:border-[#C5A059] focus-visible:ring-1 focus-visible:ring-[#C5A059]/60"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="register-birthday"
                    className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#9E9689]"
                  >
                    <Calendar size={13} className="text-[#8A6D3B]" />
                    <span>Birth Date</span>
                  </label>
                  <input
                    id="register-birthday"
                    type="date"
                    name="birthday"
                    autoComplete="bday"
                    value={formData.birthday}
                    onChange={handleChange}
                    className="w-full rounded-sm border border-[#C5A059]/25 bg-[#1C1917] px-3.5 py-2.5 text-sm text-[#E8E2D5] font-mono tabular-nums transition-colors duration-300 focus-visible:outline-none focus-visible:border-[#C5A059] focus-visible:ring-1 focus-visible:ring-[#C5A059]/60 [color-scheme:dark]"
                    required
                  />
                </div>
              </div>

              <p className="text-xs font-serif italic text-[#9E9689] text-center pt-1">
                Your zodiac correspondence is derived automatically from your birth date.
              </p>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-sm bg-[#C5A059] hover:bg-[#D2B06B] text-[#0B0A0E] font-display text-xs font-semibold uppercase tracking-[0.2em] transition-colors duration-300 ease-ritual active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8E2D5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141218]"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>

            <div className="mt-7 pt-5 border-t border-[#C5A059]/20 text-center">
              <p className="text-xs text-[#9E9689]">
                Already registered?{" "}
                <Link
                  to="/login"
                  className="text-[#C5A059] hover:text-[#E8E2D5] underline underline-offset-4 decoration-[#C5A059]/40 transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A059]"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </Motion.div>
      </div>
    </PageLayout>
  );
};

export default Register;
