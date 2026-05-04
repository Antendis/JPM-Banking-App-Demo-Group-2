"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus]   = useState<{ type: "error" | "success" | ""; message: string }>({ type: "", message: "" });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    const form = new FormData(e.currentTarget);
    const body = {
      name:     form.get("name") as string,
      email:    form.get("email") as string,
      password: form.get("password") as string,
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.status === 201) {
        setStatus({ type: "success", message: "Account created! Redirecting…" });
        setTimeout(() => router.push(`/verify-otp?email=${encodeURIComponent(body.email)}`), 1200);
      } else if (res.status === 409) {
        setStatus({ type: "error", message: "An account with this email already exists." });
        setTimeout(() => router.push("/login"), 2000);
      } else {
        const data = await res.json();
        setStatus({ type: "error", message: data.message || "Registration failed." });
      }
    } catch {
      setStatus({ type: "error", message: "Network error. Please try again." });
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
              <h1 className="text-xl font-bold text-gray-900">Open your account</h1>
              <p className="text-sm text-gray-500 mt-1">Takes under two minutes</p>
            </div>

            {status.message && (
              <div className={`mb-5 rounded-xl px-4 py-3 text-sm border ${
                status.type === "success"
                  ? "bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]"
                  : "bg-red-50 border-red-100 text-red-700"
              }`}>
                {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { name: "name",     label: "Full name",      type: "text",     placeholder: "Jane Smith",         autoComplete: "name" },
                { name: "email",    label: "Email address",  type: "email",    placeholder: "you@example.com",    autoComplete: "email" },
                { name: "password", label: "Password",       type: "password", placeholder: "Min. 8 characters",  autoComplete: "new-password" },
              ].map(({ name, label, type, placeholder, autoComplete }) => (
                <div key={name}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    {label}
                  </label>
                  <input
                    name={name}
                    type={type}
                    required
                    minLength={name === "password" ? 8 : undefined}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1a6e3f]/30 focus:border-[#1a6e3f] transition-all"
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#1a6e3f] text-white rounded-xl font-semibold text-sm hover:bg-[#0d3d22] disabled:opacity-60 transition-all shadow-lg shadow-green-900/20 hover:shadow-none cursor-pointer mt-2"
              >
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-[#1a6e3f] font-semibold hover:underline">
                Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
