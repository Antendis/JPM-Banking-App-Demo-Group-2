"use client";

import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-blue-900">OnePot Banking</h1>
        <p className="text-gray-600">You are logged in. Dashboard coming soon.</p>
        <Link
          href="/login"
          className="text-sm text-blue-600 hover:underline block"
        >
          Sign out
        </Link>
      </div>
    </div>
  );
}
