// app/components/dashboard/AdminNavigation.jsx
import React from "react";
import Link from "next/link";
import { FaUsers, FaUserTie } from "react-icons/fa";

export default function AdminNavigation({ userRole }) {
  if (userRole !== "ADMIN") return null;

  return (
    <div className="xl:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-4">
      <Link
        href="/admin/users"
        className="flex flex-col items-center justify-center p-4 bg-gray-800 rounded-xl shadow-lg hover:bg-gray-700 transition duration-300 ease-in-out transform hover:scale-105 border border-gray-700 h-36"
      >
        <FaUsers className="text-blue-400 text-3xl mb-2" />
        <span className="text-lg font-semibold text-white">Manage Users</span>
        <p className="text-gray-400 text-xs mt-1 text-center">
          Add, edit, and delete user accounts.
        </p>
      </Link>
      <Link
        href="/admin/customers"
        className="flex flex-col items-center justify-center p-4 bg-gray-800 rounded-xl shadow-lg hover:bg-gray-700 transition duration-300 ease-in-out transform hover:scale-105 border border-gray-700 h-36"
      >
        <FaUserTie className="text-green-400 text-3xl mb-2" />
        <span className="text-lg font-semibold text-white">View Customers</span>
        <p className="text-gray-400 text-xs mt-1 text-center">
          Track customer information and referrals.
        </p>
      </Link>
    </div>
  );
}
