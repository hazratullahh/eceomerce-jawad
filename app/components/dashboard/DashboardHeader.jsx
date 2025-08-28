// app/components/dashboard/DashboardHeader.jsx
import React from "react";
import Image from "next/image";

export default function DashboardHeader({ session }) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2  border-b border-gray-700">
      <div className="flex items-center">
        {/* <div className="relative w-[120px] mr-2 h-[120px]">
          <Image
            src="/logo.png"
            alt="Company Logo"
            fill
            className="rounded shadow-lg object-contain"
          />
        </div> */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Manzoorify Admin Dashboard
        </h1>
      </div>
      {session && (
        <div className="text-right text-sm mt-2 sm:mt-0">
          <p className="text-gray-300">
            Hello,{" "}
            <span className="font-semibold">
              {session.user.name || session.user.email}
            </span>
            !
          </p>
          <p className="text-gray-400">
            Role: <span className="font-semibold">{session.user.role}</span>
          </p>
        </div>
      )}
    </div>
  );
}
