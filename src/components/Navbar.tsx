"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const AUTHENTICATED_ROUTES = ["/dashboard", "/statements", "/pots", "/payments"];

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const isLoggedIn = AUTHENTICATED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        <Link href={isLoggedIn ? "/dashboard" : "/"} className="text-2xl font-bold tracking-tighter">
          <span className="text-[#0033a1]">OnePot</span>
          <span className="text-[#004a32]"> Bank</span>
        </Link>

        {isLoggedIn ? (
          <div className="flex items-center gap-1 text-sm font-bold">
            <Link
              href="/dashboard"
              className={`px-3 py-2 rounded-md transition-colors ${
                isActive("/dashboard")
                  ? "text-[#004a32] bg-green-50"
                  : "text-gray-600 hover:text-[#004a32] hover:bg-green-50"
              }`}
            >
              Home
            </Link>

            <Link
              href="/payments"
              className={`px-3 py-2 rounded-md transition-colors ${
                isActive("/payments")
                  ? "text-[#004a32] bg-green-50"
                  : "text-gray-600 hover:text-[#004a32] hover:bg-green-50"
              }`}
            >
              Payments
            </Link>

            <Link
              href="/pots"
              className={`px-3 py-2 rounded-md transition-colors ${
                isActive("/pots")
                  ? "text-[#004a32] bg-green-50"
                  : "text-gray-600 hover:text-[#004a32] hover:bg-green-50"
              }`}
            >
              Pots
            </Link>

            <Link
              href="/dashboard/statements"
              className={`px-3 py-2 rounded-md transition-colors ${
                isActive("/statements")
                  ? "text-[#004a32] bg-green-50"
                  : "text-gray-600 hover:text-[#004a32] hover:bg-green-50"
              }`}
            >
              Statements
            </Link>

            <Link
              href="/"
              className="ml-2 px-4 py-2 rounded-md text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
            >
              Sign out
            </Link>
          </div>

        ) : (

          <div className="flex items-center gap-4 text-sm font-bold">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md transition-colors ${
                isActive("/")
                  ? "text-[#004a32] bg-green-50"
                  : "text-gray-700 hover:text-[#004a32]"
              }`}
            >
              Home
            </Link>

            <Link
              href="/login"
              className={`px-3 py-2 rounded-md transition-colors ${
                isActive("/login")
                  ? "text-[#004a32] bg-green-50"
                  : "text-gray-700 hover:text-[#004a32]"
              }`}
            >
              Log in
            </Link>

            <Link
              href="/register"
              className={`px-4 py-2 rounded-md transition-all shadow-sm ${
                isActive("/register")
                  ? "bg-[#004a32] text-white"
                  : "bg-[#1a6e3f] text-white hover:bg-[#004a32]"
              }`}
            >
              Register
            </Link>
          </div>

        )}
      </div>
    </nav>
  );
}
