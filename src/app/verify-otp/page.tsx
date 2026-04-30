"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyForm() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

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
        // Success! The API has set your cookie. Now go to dashboard.
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.message || "Invalid code");
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black p-4">
      <div className="w-full max-w-md p-8 border border-gray-200 rounded-2xl shadow-sm">
        <h1 className="text-2xl font-bold text-blue-900 mb-2">
          Verify your account
        </h1>
        <p className="text-gray-500 mb-6">
          Enter the code sent to{" "}
          <span className="font-semibold text-black">{email}</span>
        </p>

        {error && (
          <p className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded">
            {error}
          </p>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            placeholder="000000"
            className="w-full p-4 text-center text-3xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            required
          />
          <button
            disabled={loading || otp.length < 6}
            className="w-full bg-blue-900 text-white p-4 rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify & Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyForm />
    </Suspense>
  );
}
