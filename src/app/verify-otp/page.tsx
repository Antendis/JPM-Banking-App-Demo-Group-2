"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyForm() {
  const [otp, setOtp]         = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const router       = useRouter();
  const searchParams = useSearchParams();
  const email        = searchParams.get("email");
  const demoOtp      = searchParams.get("otp");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

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
                    <path d="M4 11h16v9a2 2 0 01-2 2H6a2 2 0 01-2-2v-9z"/>
                    <path d="M8 11V7a4 4 0 018 0v4"/>
                  </svg>
                </div>
                <span className="font-bold text-gray-900">One<span className="text-[#1a6e3f]">Pot</span></span>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Verify your account</h1>
              <p className="text-sm text-gray-500 mt-1">
                Enter the 6-digit code sent to<br />
                <span className="font-semibold text-gray-800">{email}</span>
              </p>
            </div>

            {demoOtp && (
              <div className="mb-5 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] px-4 py-3 text-sm text-[#166534]">
                <span className="font-semibold">Demo mode — your code is: </span>
                <span className="font-mono font-bold tracking-widest text-base">{demoOtp}</span>
              </div>
            )}

            {error && (
              <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-4">
              <input
                type="text"
                placeholder="000000"
                className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-3xl tracking-[0.5em] font-mono outline-none focus:ring-2 focus:ring-[#1a6e3f]/30 focus:border-[#1a6e3f] transition-all"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                required
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-3.5 bg-[#1a6e3f] text-white rounded-xl font-semibold text-sm hover:bg-[#0d3d22] disabled:opacity-60 transition-all shadow-lg shadow-green-900/20 hover:shadow-none cursor-pointer"
              >
                {loading ? "Verifying…" : "Verify & continue"}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 text-center text-sm text-gray-500">
              <Link href="/login" className="text-[#1a6e3f] hover:underline">← Back to login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <VerifyForm />
    </Suspense>
  );
}
