// app/components/Header.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaUsers, FaUserTie } from "react-icons/fa"; // Keep icons for definition, but won't render them
import { useSession } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const mobileNavLinks = [
    { href: "/", label: "Home", icon: FaHome, roles: ["USER", "ADMIN"] },
    { href: "/admin/users", label: "Users", icon: FaUsers, roles: ["ADMIN"] },
    {
      href: "/admin/customers",
      label: "Customers",
      icon: FaUserTie,
      roles: ["ADMIN"],
    },
  ];

  return (
    <header className="md:hidden bg-gray-800 p-4 flex items-center justify-between z-40">
      <h1 className="text-2xl font-bold text-blue-400">Dashboard</h1>

      <nav>
        <ul className="flex space-x-4">
          {" "}
          {/* Increased space-x slightly for better text separation */}
          {mobileNavLinks.map((link) => {
            if (session && link.roles.includes(session.user.role)) {
              const isActive = pathname === link.href;
              // const Icon = link.icon; // No longer needed for rendering icon

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex items-center text-sm px-3 py-2 rounded-lg whitespace-nowrap  transition-colors duration-200
                               ${
                                 isActive
                                   ? "bg-blue-600 text-white shadow-md"
                                   : "text-gray-300 hover:bg-gray-700 hover:text-white"
                               }`}
                  >
                    {/* ONLY RENDER THE TEXT LABEL */}
                    <span className="font-medium">{link.label}</span>
                  </Link>
                </li>
              );
            }
            return null;
          })}
        </ul>
      </nav>
    </header>
  );
}
