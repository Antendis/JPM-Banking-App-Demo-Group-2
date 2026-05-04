"use client";

import { useState } from "react";
import Link from "next/link";
import { useDelayedLoading } from "@/lib/useDelayedLoading";

export default function ForgotPasswordPage() {
  const [step, setStep]       = useState<1 | 2>(1);
  const [email, setEmail]     = useState("");
  const [otp, setOtp]         = useState("");
  const [devOtp, setDevOtp]   = useState<string | null>(null);
  const [pw, setPw]           = useState("");
  const [pw2, setPw2]         = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [done, setDone]       = useState(false);
  const spinner = useDelayedLoading(loading);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res  = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setDevOtp(data.dev_otp ?? null);
      setStep(2);
    } catch {
      setError("Could not connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw !== pw2) { setError("Passwords don't match."); return; }
    setLoading(true); setError(null);
    try {
      const res  = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword: pw }),
      });
      const data = await res.json();
      if (res.ok) {
        setDone(true);
      } else {
        setError(data.message || "Reset failed.");
      }
    } catch {
      setError("Could not connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const pwRules = [
    { label: "At least 8 characters", ok: pw.length >= 8 },
    { label: "One uppercase letter",  ok: /[A-Z]/.test(pw) },
    { label: "One number",            ok: /\d/.test(pw) },
  ];

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-[#faf8f3] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="h-1.5 bg-[#1a6e3f]" />
          <div className="p-8">
            <div className="mb-8 text-center">
              <Link href="/" className="inline-flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#1a6e3f] flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 11h16v9a2 2 0 01-2 2H6a2 2 0 01-2-2v-9z"/><path d="M8 11V7a4 4 0 018 0v4"/>
                  </svg>
                </div>
                <span className="font-bold text-gray-900">One<span className="text-[#1a6e3f]">Pot</span></span>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">
                {done ? "Password reset" : step === 1 ? "Forgot your password?" : "Enter your reset code"}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {done ? "You can now sign in with your new password." : step === 1 ? "We'll send you a one-time code." : `Sent to ${email}`}
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            {done ? (
              <Link
                href="/login"
                className="block w-full text-center py-3.5 bg-[#1a6e3f] text-white rounded-xl font-semibold text-sm hover:bg-[#0d3d22] transition-all"
              >
                Back to sign in
              </Link>
            ) : step === 1 ? (
              <form onSubmit={handleRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email address</label>
                  <input
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" autoComplete="email"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1a6e3f]/30 focus:border-[#1a6e3f] transition-all"
                  />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-[#1a6e3f] text-white rounded-xl font-semibold text-sm hover:bg-[#0d3d22] disabled:opacity-60 transition-all flex items-center justify-center gap-2 cursor-pointer">
                  {spinner && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                  {loading ? "Sending…" : "Send reset code"}
                </button>
                <div className="text-center">
                  <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">← Back to sign in</Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                {devOtp && (
                  <div className="rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] px-4 py-3 text-sm text-[#166534]">
                    <p className="font-semibold text-xs uppercase tracking-widest mb-1">Demo mode</p>
                    <p>Your code is: <span className="font-bold text-lg tracking-[0.3em]">{devOtp}</span></p>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Reset code</label>
                  <input
                    type="text" maxLength={6} required placeholder="000000" value={otp}
                    onChange={(e) => setOtp(e.target.value)} autoFocus
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-3xl tracking-[0.5em] font-mono outline-none focus:ring-2 focus:ring-[#1a6e3f]/30 focus:border-[#1a6e3f] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">New password</label>
                  <input
                    type="password" required value={pw} onChange={(e) => setPw(e.target.value)}
                    placeholder="New password" autoComplete="new-password"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1a6e3f]/30 focus:border-[#1a6e3f] transition-all"
                  />
                  {pw && (
                    <ul className="mt-2 space-y-1">
                      {pwRules.map((r) => (
                        <li key={r.label} className={`flex items-center gap-1.5 text-xs font-medium ${r.ok ? "text-emerald-600" : "text-gray-400"}`}>
                          <span>{r.ok ? "✓" : "○"}</span>{r.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Confirm password</label>
                  <input
                    type="password" required value={pw2} onChange={(e) => setPw2(e.target.value)}
                    placeholder="Confirm password" autoComplete="new-password"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1a6e3f]/30 focus:border-[#1a6e3f] transition-all"
                  />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-[#1a6e3f] text-white rounded-xl font-semibold text-sm hover:bg-[#0d3d22] disabled:opacity-60 transition-all flex items-center justify-center gap-2 cursor-pointer">
                  {spinner && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                  {loading ? "Resetting…" : "Reset password"}
                </button>
                <button type="button" onClick={() => { setStep(1); setError(null); }}
                  className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors">
                  ← Try a different email
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
