"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const DASHBOARD_ROUTES = ["/dashboard"];

function PotIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11h16v9a2 2 0 01-2 2H6a2 2 0 01-2-2v-9z"/>
      <path d="M8 11V7a4 4 0 018 0v4"/>
      <path d="M15 3h2a1 1 0 011 1v1"/>
    </svg>
  );
}

export default function Navbar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);

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
      {/* ── Desktop / top navbar ── */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 py-3 flex justify-between items-center">

          {/* Logo */}
          <Link
            href={isDashboard ? "/dashboard" : "/"}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#1a6e3f] flex items-center justify-center text-white">
              <PotIcon />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">
              One<span className="text-[#1a6e3f]">Pot</span>
            </span>
          </Link>

          {/* Authenticated nav */}
          {isDashboard ? (
            <div className="hidden sm:flex items-center gap-1 text-sm">
              {[
                { label: "Home",         href: "/dashboard" },
                { label: "Pots",         href: "/dashboard/pots" },
                { label: "Send",         href: "/dashboard/send" },
                { label: "Statements",   href: "/dashboard/statements" },
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
            /* Public nav */
            <div className="flex items-center gap-2 text-sm">
              <Link href="/login" className="px-3 py-2 rounded-lg text-gray-600 hover:text-[#1a6e3f] font-medium transition-colors">
                Log in
              </Link>
              <Link href="/register" className="px-4 py-2 rounded-lg bg-[#1a6e3f] text-white font-semibold hover:bg-[#0d3d22] transition-colors shadow-sm">
                Get started
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* ── Mobile bottom tab bar (dashboard only) ── */}
      {isDashboard && (
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-area-inset-bottom">
          <div className="grid grid-cols-5 h-16">
            {[
              { label: "Home",   href: "/dashboard",            icon: "⌂" },
              { label: "Pots",   href: "/dashboard/pots",       icon: "⬡" },
              { label: "Send",   href: "/dashboard/send",       icon: "↑" },
              { label: "Txns",   href: "/dashboard/viewalltransactions", icon: "≡" },
              { label: "More",   href: null,                    icon: "…" },
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
              )
            )}
          </div>
        </nav>
      )}

      {/* Mobile "More" sheet */}
      {menuOpen && isDashboard && (
        <div
          className="sm:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute bottom-16 left-0 right-0 bg-white rounded-t-2xl p-4 space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Link href="/dashboard/statements" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700">
              Statements
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-sm font-medium text-red-600"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </>
  );
}
