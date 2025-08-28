"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaUsers,
  FaUserTie,
  FaCog,
  FaCreditCard,
  FaBox, // Added FaBox for Products
  FaList, // Added FaList for Categories
} from "react-icons/fa";

export default function Sidebar({ session, onClose }) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home", icon: FaHome, roles: ["USER", "ADMIN"] },
    {
      href: "/admin/products",
      label: "Products",
      icon: FaBox,
      roles: ["ADMIN"],
    }, // Product Link
    {
      href: "/admin/categories",
      label: "Categories",
      icon: FaList,
      roles: ["ADMIN"],
    }, // Category Link
    { href: "/admin/users", label: "Users", icon: FaUsers, roles: ["ADMIN"] },
    {
      href: "/admin/customers",
      label: "Customers",
      icon: FaUserTie,
      roles: ["ADMIN"],
    },
    // Add more links as needed
  ];

  return (
    <nav className="flex-1 overflow-y-auto custom-scrollbar pt-2">
      <ul className="space-y-2 px-2">
        {navLinks.map((link) => {
          if (session && link.roles.includes(session.user.role)) {
            // Exact match for Home, startsWith for other routes
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center p-3 rounded-lg transition-all duration-200 ease-in-out
                            ${
                              isActive
                                ? "bg-blue-600 text-white shadow-lg transform translate-x-1"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-md"
                            }
                            group`}
                  onClick={onClose}
                >
                  {Icon && (
                    <Icon className="mr-4 text-xl transition-transform duration-200 group-hover:scale-110" />
                  )}
                  <span className="font-medium text-base">{link.label}</span>
                </Link>
              </li>
            );
          }
          return null;
        })}
      </ul>
    </nav>
  );
}
