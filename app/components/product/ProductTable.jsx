"use client";

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import Image from "next/image";
import Pagination from "../Pagination";

const ProductTable = ({
  products,
  handleViewProduct,
  handleEditProduct,
  handleDeleteProduct,
  isLoading,
  isError,
  error,
  deleteMutation,
  lang,
  categories,
}) => {
  const columns = [
    {
      header: "#",
      cell: (info) => <span className="text-white">{info.row.index + 1}</span>,
    },
    {
      header: "Image",
      accessorKey: "images",
      cell: (info) => {
        const images = info.getValue();
        const imageUrl =
          images?.length > 0 ? images[0].url : "/path-to-default-image.png";
        return (
          <div className="relative mx-auto text-center w-12 h-12 rounded-md overflow-hidden">
            <Image
              src={imageUrl}
              alt={info.row.original.name[lang] || "Product"}
              fill={true}
              style={{ objectFit: "cover" }}
            />
          </div>
        );
      },
    },
    {
      header: "Name",
      accessorKey: "name",
      cell: (info) => (
        <span className="text-white">{info.row.original.name[lang]}</span>
      ),
    },
    {
      header: "Category",
      accessorKey: "category",
      cell: (info) => {
        const categoryId = info.getValue();
        const category = categories?.find((cat) => cat._id === categoryId);
        return (
          <span className="text-gray-400">
            {category ? category.name[lang] : "N/A"}
          </span>
        );
      },
    },
    {
      header: "Price",
      accessorKey: "price",
      cell: (info) => (
        <span className="text-white">${info.getValue().toFixed(2)}</span>
      ),
    },
    {
      header: "Original Price",
      accessorKey: "originalPrice",
      cell: (info) => (
        <span className="text-white">
          ${info.getValue()?.toFixed(2) || "N/A"}
        </span>
      ),
    },
    {
      header: "Discount %",
      accessorKey: "discountPercentage",
      cell: (info) => <span className="text-white">{info.getValue()}%</span>,
    },
    {
      header: "Quantity",
      accessorKey: "quantity",
      cell: (info) => <span className="text-white">{info.getValue()}</span>,
    },
    {
      header: "Actions",
      cell: (info) => (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => handleViewProduct(info.row.original)}
            className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors"
            aria-label="View product"
          >
            <FaEye />
          </button>
          <button
            onClick={() => handleEditProduct(info.row.original)}
            className="bg-gray-600 text-white p-2 rounded-md hover:bg-gray-700 transition-colors"
            aria-label="Edit product"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => handleDeleteProduct(info.row.original._id)}
            disabled={deleteMutation.isPending}
            className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-colors disabled:bg-red-800 disabled:cursor-not-allowed"
            aria-label="Delete product"
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: products || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
        Loading products...
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
                  className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider"
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
        <tbody className="bg-gray-800 divide-y text-center divide-gray-700">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-6 py-4 text-sm">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {products?.length === 0 && (
        <div className="text-center py-8 text-gray-400">No products found.</div>
      )}
      <Pagination table={table} />
    </div>
  );
};

export default ProductTable;
