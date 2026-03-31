"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Inbox, CheckSquare, Calendar, LogOut, Cpu } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <nav className="h-20 bg-white flex items-center px-8 gap-8 sticky top-0 z-50">
      {/* Logo */}
      <Link href="/dashboard" className="group flex items-center gap-3 font-extrabold text-[#141413] text-xl tracking-tight transition-transform active:scale-95">
        <div className="w-10 h-10 rounded-lg bg-[#D97757]/10 flex items-center justify-center group-hover:bg-[#141413] group-hover:shadow-lg group-hover:shadow-[#141413]/10 transition-all duration-500">
          <Sparkles className="w-6 h-6 text-[#D97757] group-hover:text-white group-hover:scale-110 transition-all duration-500" />
        </div>
        EmailAssist
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-2 ml-4">
        {[
          { href: "/dashboard", label: "Inbox", icon: Inbox },
          { href: "/autopilot", label: "Autopilot", icon: Cpu },
          { href: "/tasks", label: "Tasks", icon: CheckSquare },
          { href: "/calendar", label: "Calendar", icon: Calendar },
        ].map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-[#D97757]/10 text-[#D97757]"
                  : "text-gray-500 hover:text-[#141413] hover:bg-gray-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User info + sign out */}
      {session && (
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium text-gray-400 hidden md:block">{session.user.email}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="group flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-[#141413] bg-gray-50 hover:bg-gray-100 px-5 py-2.5 rounded-lg transition-all duration-200 border border-gray-200"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
}
