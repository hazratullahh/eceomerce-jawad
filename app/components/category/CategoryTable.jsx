"use client";

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FaEdit, FaTrash } from "react-icons/fa";
import Image from "next/image";
import Pagination from "../Pagination";

const CategoryTable = ({
  categories,
  handleEditCategory,
  handleDeleteCategory,
  isLoading,
  isError,
  error,
  deleteMutation,
  lang,
}) => {
  const columns = [
    {
      header: "#",
      cell: (info) => <span className="text-white">{info.row.index + 1}</span>,
    },
    {
      header: "Image",
      accessorKey: "image.url",
      cell: (info) => {
        const category = info.row.original;
        const imageUrl = category.image?.url || "/path-to-default-image.png";
        return (
          <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-600">
            <Image
              src={imageUrl}
              alt={category.name[lang] || "Category"}
              fill={true}
              style={{ objectFit: "cover" }}
            />
          </div>
        );
      },
    },
    {
      header: "Category Name",
      accessorKey: "name",
      cell: (info) => (
        <span className="text-gray-100 font-medium">
          {info.getValue()[lang] || "N/A"}
        </span>
      ),
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: (info) => (
        <span className="text-gray-400">
          {info.getValue()?.[lang] || "N/A"}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (info) => {
        const category = info.row.original;
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => handleEditCategory(category)}
              className="bg-gray-600 text-white p-2 rounded-md hover:bg-gray-700 transition-colors"
              aria-label="Edit category"
            >
              <FaEdit size={14} />
            </button>
            <button
              onClick={() => handleDeleteCategory(category._id)}
              disabled={deleteMutation.isPending}
              className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-colors disabled:bg-red-800 disabled:cursor-not-allowed"
              aria-label="Delete category"
            >
              <FaTrash size={14} />
            </button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: categories || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-300 flex items-center justify-center">
        <svg
          className="animate-spin h-5 w-5 mr-2 text-gray-300"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Loading categories...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-400">Error: {error.message}</div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-700">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-700/50 transition-colors">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-6 py-4 text-sm">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {categories?.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No categories found.
        </div>
      )}
      <Pagination table={table} pageSizeOptions={[5, 10, 20]} />
    </div>
  );
};

export default CategoryTable;
