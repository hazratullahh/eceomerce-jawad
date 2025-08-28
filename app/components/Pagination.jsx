"use client";

import { useState } from "react";
import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaAngleLeft,
  FaAngleRight,
} from "react-icons/fa";

const Pagination = ({
  table,
  pageSizeOptions = [5, 10, 20, 50],
  className = "",
  buttonClassName = "px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-500 disabled:cursor-not-allowed",
  selectClassName = "bg-gray-700 text-white border border-gray-600 rounded-md p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50",
  inputClassName = "bg-gray-700 text-white border border-gray-600 rounded-md p-2 w-16 text-center focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50",
}) => {
  const [pageInput, setPageInput] = useState(
    table.getState().pagination.pageIndex + 1
  );

  const handlePageSizeChange = (e) => {
    table.setPageSize(Number(e.target.value));
  };

  const handlePageInputChange = (e) => {
    const value = e.target.value;
    setPageInput(value);
  };

  const handlePageInputSubmit = (e) => {
    if (e.key === "Enter") {
      const page = Number(pageInput);
      if (page >= 1 && page <= table.getPageCount()) {
        table.setPageIndex(page - 1);
      } else {
        setPageInput(table.getState().pagination.pageIndex + 1);
      }
    }
  };

  return (
    <div
      className={`flex flex-col p-2 px-4 border-t border-slate-700 sm:flex-row justify-between items-center mt-4 space-y-4 sm:space-y-0 sm:space-x-4 ${className}`}
    >
      <div className="flex items-center space-x-2">
        <button
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          className={buttonClassName}
          aria-label="Go to first page"
        >
          <FaAngleDoubleLeft />
        </button>
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className={buttonClassName}
          aria-label="Go to previous page"
        >
          <FaAngleLeft />
        </button>
        <span className="text-gray-400">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className={buttonClassName}
          aria-label="Go to next page"
        >
          <FaAngleRight />
        </button>
        <button
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
          className={buttonClassName}
          aria-label="Go to last page"
        >
          <FaAngleDoubleRight />
        </button>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-gray-400">Rows per page:</span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={handlePageSizeChange}
          className={selectClassName}
          aria-label="Select rows per page"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="text-gray-400">Go to page:</span>
        <input
          type="number"
          value={pageInput}
          onChange={handlePageInputChange}
          onKeyDown={handlePageInputSubmit}
          min="1"
          max={table.getPageCount()}
          className={inputClassName}
          aria-label="Go to page number"
        />
      </div>
    </div>
  );
};

export default Pagination;
