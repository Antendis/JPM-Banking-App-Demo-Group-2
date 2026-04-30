"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [status, setStatus] = useState<{
    type: "error" | "success" | "";
    message: string;
  }>({
    type: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.status === 201) {
        setStatus({
          type: "success",
          message: "Account created! Check your email for the code.",
        });
        // Give the user a moment to read the success message before redirecting
        setTimeout(() => {
          router.push(
            `/verify-otp?email=${encodeURIComponent(formData.email)}`,
          );
        }, 1500);
      } else if (response.status === 409) {
        setStatus({
          type: "error",
          message:
            "An account already exists with this email. Redirecting to login...",
        });
        setTimeout(() => {
          router.push("/login");
        }, 2500);
      } else {
        const data = await response.json();
        setStatus({
          type: "error",
          message: data.message || "Registration failed.",
        });
      }
    } catch {
      setStatus({ type: "error", message: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">OnePot Bank</h1>
          <p className="text-gray-500 font-medium">Secure Personal Banking</p>
        </div>

        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          Create your account
        </h2>

        {status.message && (
          <div
            className={`p-4 rounded-lg mb-6 text-sm font-medium animate-pulse ${
              status.type === "success"
                ? "bg-green-50 text-green-700 border border-green-100"
                : "bg-red-50 text-red-700 border border-red-100"
            }`}
          >
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-black"
              placeholder="e.g. Jovarie Smith"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-black"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-black"
              placeholder="Min. 8 characters"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-4 bg-blue-900 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-800 hover:shadow-none active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Establishing Secure Connection..." : "Create Account"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-blue-600 hover:text-blue-500 transition-colors"
            >
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
