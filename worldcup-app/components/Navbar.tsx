// components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

const navItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/simulator", label: "Group Stage", icon: "📊" },
  { href: "/simulator?tab=knockout", label: "Knockout Stage", icon: "🏆" },
];

export function Navbar() {
  const pathname = usePathname();
  const { isDark, toggle } = useTheme();

  return (
    <nav className="bg-gradient-to-r from-indigo-900 to-purple-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <span className="font-bold text-white text-lg hidden sm:inline">
              WC 2026 Simulator
            </span>
          </Link>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href.split("?")[0]) &&
                    (item.href.includes("tab=knockout")
                      ? pathname === "/simulator" && window?.location?.search?.includes("tab=knockout")
                      : !window?.location?.search?.includes("tab=knockout"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-white text-purple-900 shadow-md"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggle}
              className="ml-2 px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
