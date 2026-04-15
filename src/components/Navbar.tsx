"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  // We don't want to show the login/register links if we are already on those pages
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Login", href: "/login" },
    { name: "Register", href: "/register" },
  ];

  return (
    <nav className="w-full bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center sticky top-0 z-50">
      <div className="text-xl font-bold text-blue-900 tracking-tight">
        <Link href="/">
          OnePot <span className="text-green-700 font-medium">Bank</span>
        </Link>
      </div>

      <div className="flex gap-6">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-medium transition-colors ${
              pathname === link.href
                ? "text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            {link.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
