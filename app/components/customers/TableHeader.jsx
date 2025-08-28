"use client";

import { FaUserTie, FaPlus } from "react-icons/fa";

export default function TableHeader({ onAddCustomer, onLogout }) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-4 border-b border-gray-700">
      <h1 className="text-3xl lg:text-4xl font-extrabold flex items-center text-blue-400 mb-4 sm:mb-0">
        <FaUserTie className="mr-4 text-3xl" /> Manage Customers
      </h1>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onAddCustomer}
          className="bg-green-600 hover:bg-green-700 cursor-pointer  text-white font-semibold py-2 px-5 rounded-lg flex items-center transition duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
        >
          <FaPlus className="mr-2" /> Add New Customer
        </button>
      </div>
    </div>
  );
}
