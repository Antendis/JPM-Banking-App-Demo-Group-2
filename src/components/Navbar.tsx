"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const DASHBOARD_ROUTES = ["/dashboard"];

function PotIcon() {
  return (
    <div className="w-9 h-9 rounded-lg bg-[#1a6e3f] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6 10H18L16.5 21H7.5L6 10Z"
          fill="white"
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M12 10V7"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12 7C12 7 8 7 8 4C8 2.5 10 2.5 12 5"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 7C12 7 16 7 16 4C16 2.5 14 2.5 12 5"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isDashboard = DASHBOARD_ROUTES.some((r) => pathname.startsWith(r));

  const active = (href: string) =>
    pathname === href
      ? "text-[#1a6e3f] font-bold"
      : "text-gray-600 hover:text-[#1a6e3f]";

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 py-3 flex justify-between items-center">
          {/* Logo Section */}
          <Link
            href={isDashboard ? "/dashboard" : "/"}
            className="flex items-center gap-3 group"
          >
            <PotIcon />
            <span className="text-2xl font-bold tracking-tight text-gray-900">
              One<span className="text-[#1a6e3f]">Pot</span>
            </span>
          </Link>

          {isDashboard ? (
            <div className="hidden sm:flex items-center gap-1 text-sm">
              {[
                { label: "Home", href: "/dashboard" },
                { label: "Pots", href: "/dashboard/pots" },
                { label: "Send", href: "/dashboard/send" },
                { label: "Statements", href: "/dashboard/statements" },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-2 rounded-lg transition-colors ${active(href)}`}
                >
                  {label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="ml-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#f0fdf4] text-[#166534] hover:bg-[#dcfce7] transition-colors cursor-pointer disabled:opacity-50"
              >
                {loggingOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <Link
                href="/login"
                className="px-3 py-2 rounded-lg text-gray-600 hover:text-[#1a6e3f] font-medium transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-lg bg-[#1a6e3f] text-white font-semibold hover:bg-[#0d3d22] transition-colors shadow-sm"
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Nav stays same */}
      {isDashboard && (
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-area-inset-bottom">
          <div className="grid grid-cols-5 h-16">
            {[
              { label: "Home", href: "/dashboard", icon: "⌂" },
              { label: "Pots", href: "/dashboard/pots", icon: "⬡" },
              { label: "Send", href: "/dashboard/send", icon: "↑" },
              {
                label: "Txns",
                href: "/dashboard/viewalltransactions",
                icon: "≡",
              },
              { label: "More", href: null, icon: "…" },
            ].map(({ label, href, icon }) =>
              href ? (
                <Link
                  key={href}
                  href={href}
                  className={`flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${
                    pathname === href ? "text-[#1a6e3f]" : "text-gray-400"
                  }`}
                >
                  <span className="text-lg leading-none">{icon}</span>
                  <span>{label}</span>
                </Link>
              ) : (
                <button
                  key={label}
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex flex-col items-center justify-center gap-0.5 text-xs font-medium text-gray-400"
                >
                  <span className="text-lg leading-none">{icon}</span>
                  <span>{label}</span>
                </button>
              ),
            )}
          </div>
        </nav>
      )}
    </>
  );
}
