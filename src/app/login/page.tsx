"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#fdfcf9]">
      <div className="flex flex-col items-center gap-8">
        {/* Spinning ring with lock */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#1a6e3f] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a6e3f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-gray-800">Secure login</p>
          <p className="text-xs text-gray-400">Taking you to your account</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [step, setStep]               = useState<1 | 2>(1);
  const [loading, setLoading]         = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [email, setEmail]             = useState("");
  const [demoOtp, setDemoOtp]         = useState<string | null>(null);
  const [forgotShown, setForgotShown] = useState(false);
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
        setRedirecting(true);
        await Promise.all([
          new Promise(r => setTimeout(r, 1000)),
          fetch("/api/user/me").then(r => r.ok ? r.json() : null).then(d => { if (d) sessionStorage.setItem("prefetch_user", JSON.stringify(d)); }),
          fetch("/api/transactions?limit=50").then(r => r.ok ? r.json() : []).then(d => { sessionStorage.setItem("prefetch_txs", JSON.stringify(d)); }),
        ]);
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

  if (redirecting) return <LoadingScreen />;

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
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 15.5L8 21.5H16L17 15.5H7Z" fill="white" opacity="0.9"/>
                    <rect x="5.5" y="13.5" width="13" height="2.5" rx="1.25" fill="white"/>
                    <path d="M12 13.5V9" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                    <path d="M12 11.5C10 10.5 7 7.5 8 4C9 1.5 12 3 12 8.5" fill="white"/>
                    <path d="M12 11.5C14 10.5 17 7.5 16 4C15 1.5 12 3 12 8.5" fill="white" opacity="0.75"/>
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

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setForgotShown((v) => !v)}
                    className="text-sm text-gray-400 hover:text-[#1a6e3f] transition-colors cursor-pointer"
                  >
                    Forgot your password?
                  </button>
                  {forgotShown && (
                    <div className="mt-3 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-700">
                      Password reset is not available in this demo. Please contact your account administrator.
                    </div>
                  )}
                </div>
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
