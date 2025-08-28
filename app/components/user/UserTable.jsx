"use client";

import {
  FaEdit,
  FaTrash,
  FaSpinner,
  FaExclamationTriangle,
  FaChevronLeft, // For pagination arrows
  FaChevronRight, // For pagination arrows
} from "react-icons/fa";
import { format } from "date-fns"; // Make sure date-fns is installed: npm install date-fns
import { useState, useMemo } from "react";

export default function UserTable({
  users,
  isLoading,
  isFetching,
  isError,
  error,
  onEdit,
  onDelete,
  deleteUserMutation,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // You can adjust this value for users per page

  const totalPages = useMemo(() => {
    if (!users) return 0;
    return Math.ceil(users.length / itemsPerPage);
  }, [users, itemsPerPage]);

  const currentUsers = useMemo(() => {
    if (!users) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return users.slice(startIndex, endIndex);
  }, [users, currentPage, itemsPerPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Optional: Scroll to top of table when page changes for better UX
    // window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPageButtons = 5; // Max number of page buttons to show at once
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    // Adjust startPage if we don't have enough pages to fill maxPageButtons from the end
    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    if (startPage > 1) {
      pageNumbers.push(
        <button
          key="1"
          onClick={() => handlePageChange(1)}
          className="relative inline-flex items-center px-3 py-1 text-sm font-medium text-gray-300 bg-gray-600 rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 mx-1 transition-colors cursor-pointer"
          aria-label="Go to first page"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pageNumbers.push(
          <span key="dots-start" className="px-3 py-1 text-sm text-gray-400">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`relative inline-flex items-center px-3 py-1 text-sm font-medium rounded-md mx-1 transition-colors cursor-pointer ${
            i === currentPage
              ? "bg-indigo-600 text-white shadow-md" // Added shadow for active page
              : "bg-gray-600 text-gray-300 hover:bg-gray-500"
          } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          aria-current={i === currentPage ? "page" : undefined}
          aria-label={`Go to page ${i}`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(
          <span key="dots-end" className="px-3 py-1 text-sm text-gray-400">
            ...
          </span>
        );
      }
      pageNumbers.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="relative inline-flex items-center px-3 py-1 text-sm font-medium text-gray-300 bg-gray-600 rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 mx-1 transition-colors cursor-pointer"
          aria-label="Go to last page"
        >
          {totalPages}
        </button>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700">
      <div className="overflow-x-auto">
        {isLoading && !isFetching ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FaSpinner className="animate-spin text-5xl mb-4" />
            <p className="text-xl font-semibold">Loading users...</p>
            <p className="text-sm mt-2">Please wait a moment.</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-red-500">
            <FaExclamationTriangle className="text-7xl mb-6" />
            <p className="text-2xl font-bold">Oops! Something went wrong.</p>
            <p className="text-base mt-3">
              Error: {error?.message || "Could not load user data."}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Please try refreshing the page or contact support if the issue
              persists.
            </p>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider sm:px-6"
                  >
                    #
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sm:px-6"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sm:px-6"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sm:px-6"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sm:px-6"
                  >
                    Joined Date
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sm:px-6"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {currentUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6} // Increased colspan for the new index column
                      className="px-6 py-10 text-center text-gray-400 text-lg"
                    >
                      <p className="text-xl font-semibold mb-2">
                        No users found.
                      </p>
                      <p className="text-sm">
                        It looks like there's no data to display yet.
                      </p>
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user, index) => {
                    const isDeletingThisUser =
                      deleteUserMutation.isPending &&
                      deleteUserMutation.variables === user._id;

                    return (
                      <tr
                        key={user._id}
                        className="even:bg-gray-800 odd:bg-gray-750 hover:bg-gray-700 transition-colors duration-150"
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white text-center sm:px-6">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white sm:px-6">
                          {user.name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 sm:px-6">
                          {user.email}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap sm:px-6">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === "ADMIN"
                                ? "bg-purple-700 text-purple-100"
                                : "bg-blue-700 text-blue-100"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 sm:px-6">
                          {user.createdAt
                            ? format(new Date(user.createdAt), "MMM d, yyyy")
                            : "N/A"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium sm:px-6">
                          <button
                            onClick={() => onEdit(user)}
                            className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-indigo-400 hover:text-indigo-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 mr-1 sm:mr-2 transition-all duration-200 cursor-pointer"
                            title="Edit User"
                            aria-label={`Edit ${user.name}`}
                          >
                            <FaEdit className="mr-1" />{" "}
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button
                            onClick={() => onDelete(user)}
                            className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 cursor-pointer"
                            disabled={isDeletingThisUser}
                            title="Delete User"
                            aria-label={
                              isDeletingThisUser
                                ? `Deleting ${user.name}`
                                : `Delete ${user.name}`
                            }
                          >
                            {isDeletingThisUser ? (
                              <FaSpinner className="animate-spin mr-1" />
                            ) : (
                              <FaTrash className="mr-1" />
                            )}{" "}
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 sm:px-6 sm:py-4 bg-gray-700 border-t border-gray-700">
                <span className="text-sm text-gray-300 mb-2 sm:mb-0 text-center sm:text-left">
                  Showing{" "}
                  <span className="font-semibold">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold">
                    {Math.min(currentPage * itemsPerPage, users?.length || 0)}
                  </span>{" "}
                  of <span className="font-semibold">{users?.length || 0}</span>{" "}
                  users
                </span>
                <div className="flex items-center flex-wrap justify-center sm:justify-end">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-300 bg-gray-600 rounded-l-md hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    title="Previous Page"
                    aria-label="Previous Page"
                  >
                    <FaChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="flex -space-x-px">{renderPageNumbers()}</div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-300 bg-gray-600 rounded-r-md hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    title="Next Page"
                    aria-label="Next Page"
                  >
                    <FaChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
