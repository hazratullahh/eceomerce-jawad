"use client";

import { FaSearch, FaSpinner } from "react-icons/fa";

export default function SearchBar({
  searchTerm,
  onSearchChange,
  isFetching,
  debouncedSearchTerm,
}) {
  return (
    <div className="mb-6">
      <div className="relative">
        <input
          type="text"
          placeholder="Search customers by name"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full p-3 pl-10 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200"
        />
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        {isFetching && debouncedSearchTerm && (
          <FaSpinner className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 animate-spin" />
        )}
      </div>
    </div>
  );
}
