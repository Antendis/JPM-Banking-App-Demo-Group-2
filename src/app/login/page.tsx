"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [step, setStep]         = useState<1 | 2>(1);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [email, setEmail]       = useState("");
  const [demoOtp, setDemoOtp]   = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const loginEmail = form.get("email") as string;
    const password   = form.get("password") as string;

    const attempt = () =>
      fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password }),
      });

    try {
      let res: Response;
      try {
        res = await attempt();
      } catch {
        // One automatic retry for transient connection failures (e.g. DB cold start)
        await new Promise((r) => setTimeout(r, 1500));
        res = await attempt();
      }
      const data = await res.json();

      if (res.ok) {
        setEmail(loginEmail);
        setDemoOtp(data.dev_otp ?? null);
        setStep(2);
      } else {
        setError(data.message || "Invalid credentials.");
      }
    } catch {
      setError("Could not connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const otp = (new FormData(e.currentTarget).get("otp") as string).trim();

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.message || "Invalid code.");
      }
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-[#faf8f3] px-4 py-12">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

          {/* Top accent bar */}
          <div className="h-1.5 bg-[#1a6e3f]" />

          <div className="p-8">
            <div className="mb-8 text-center">
              <Link href="/" className="inline-flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#1a6e3f] flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 11h16v9a2 2 0 01-2 2H6a2 2 0 01-2-2v-9z"/>
                    <path d="M8 11V7a4 4 0 018 0v4"/>
                  </svg>
                </div>
                <span className="font-bold text-gray-900">One<span className="text-[#1a6e3f]">Pot</span></span>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">
                {step === 1 ? "Welcome back" : "Check your codes"}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {step === 1 ? "Sign in to your account" : "Enter the 6-digit code"}
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Demo OTP hint */}
            {step === 2 && demoOtp && (
              <div className="mb-5 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] px-4 py-3 text-sm text-[#166534]">
                <p className="font-semibold text-xs uppercase tracking-widest mb-1">Demo mode</p>
                <p>Your code is: <span className="font-bold text-lg tracking-[0.3em]">{demoOtp}</span></p>
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Email address
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1a6e3f]/30 focus:border-[#1a6e3f] transition-all"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1a6e3f]/30 focus:border-[#1a6e3f] transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#1a6e3f] text-white rounded-xl font-semibold text-sm hover:bg-[#0d3d22] disabled:opacity-60 transition-all shadow-lg shadow-green-900/20 hover:shadow-none cursor-pointer"
                >
                  {loading ? "Signing in…" : "Sign in"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtp} className="space-y-5">
                <p className="text-sm text-gray-600 text-center">
                  Sent to <span className="font-semibold text-gray-800">{email}</span>
                </p>
                <input
                  name="otp"
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  required
                  autoFocus
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-3xl tracking-[0.5em] font-mono outline-none focus:ring-2 focus:ring-[#1a6e3f]/30 focus:border-[#1a6e3f] transition-all"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#1a6e3f] text-white rounded-xl font-semibold text-sm hover:bg-[#0d3d22] disabled:opacity-60 transition-all shadow-lg shadow-green-900/20 hover:shadow-none cursor-pointer"
                >
                  {loading ? "Verifying…" : "Verify & sign in"}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep(1); setDemoOtp(null); setError(null); }}
                  className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ← Back
                </button>
              </form>
            )}

            <div className="mt-6 pt-5 border-t border-gray-100 text-center text-sm text-gray-500">
              No account?{" "}
              <Link href="/register" className="text-[#1a6e3f] font-semibold hover:underline">
                Create one
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
