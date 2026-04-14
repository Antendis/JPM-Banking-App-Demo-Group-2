"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [step, setStep] = useState<1 | 2>(1); // 1 = Login, 2 = OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const router = useRouter();

  // Handle Email/Password
  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const loginEmail = formData.get("email") as string;
    const password = formData.get("password");

    try {
      // Calling the future API route
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: loginEmail, password }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        setEmail(loginEmail);
        setStep(2); // Success! Move to OTP
      } else {
        const data = await res.json();
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Failed to connect to authentication server.");
    } finally {
      setLoading(false);
    }
  };

  // Handles 6-digit OTP
  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const otp = formData.get("otp");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        setError("Invalid or expired verification code.");
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg border border-gray-200">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-blue-900">OnePot Banking</h1>
          <p className="text-gray-500 text-sm mt-1">
            {step === 1 ? "Secure Login" : "Two-Step Verification"}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-md border p-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="name@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                className="w-full rounded-md border p-2 mt-1 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
            <button
              disabled={loading}
              className="w-full rounded-md bg-blue-600 py-2.5 text-white font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition-all cursor-pointer"
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-6 text-center">
            <p className="text-sm text-gray-600">
              Enter the 6-digit code sent to <br />
              <span className="font-semibold text-gray-800">{email}</span>
            </p>
            <input
              name="otp"
              type="text"
              maxLength={6}
              placeholder="000000"
              required
              autoFocus
              className="w-full rounded-md border p-3 text-center text-3xl tracking-[0.5em] outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <div className="space-y-3">
              <button
                disabled={loading}
                className="w-full rounded-md bg-blue-600 py-2.5 text-white font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition-all cursor-pointer"
              >
                {loading ? "Verifying..." : "Verify Identity"}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-blue-600 hover:underline block w-full"
              >
                Back to credentials
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm">
          <p className="text-gray-500">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:underline font-medium"
            >
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
