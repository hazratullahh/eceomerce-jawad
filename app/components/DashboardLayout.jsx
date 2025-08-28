"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar"; // This will now be only for desktop
import Header from "./Header"; // This will handle mobile navigation
import ClientSignOutButton from "../ClientSignOutButton";
import Link from "next/link";

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const isLoading = status === "loading";

  useEffect(() => {
    // Modal.setAppElement is not strictly necessary if no modals are used globally
    // If you plan to use other modals, you might keep this.
    // For this specific change, it's not needed if you remove the Modal component.
    // if (typeof window !== "undefined") {
    //   Modal.setAppElement(document.getElementById("__next") || document.body);
    // }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!session) {
        router.replace("/login");
      } else if (session && pathname === "/login") {
        router.replace("/");
      }
    }
  }, [session, isLoading, pathname, router]);

  if (isLoading || !session) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // Define header height for padding adjustment
  const mobileHeaderHeight = "64px"; // Approx height of the header (p-4 + text size)

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      {/* Header for mobile (now contains mobile nav) */}
      {/* The `toggleSidebar` and `isSidebarOpen` props are no longer used here as the mobile sidebar is gone */}
      <Header />

      {/* Main layout container for desktop (flex row for sidebar and content) */}
      <div className="flex flex-1">
        {/* Desktop Sidebar (fixed, full height, hidden on mobile) */}
        <aside
          className={`hidden md:flex flex-col w-64 bg-gray-800 border-r border-gray-700
                       fixed top-0 left-0 h-screen z-30 shadow-2xl`}
        >
          <div className="flex items-center justify-center py-6 mb-4 border-b border-gray-700">
            <h2 className="text-3xl font-extrabold text-blue-400 select-none">
              Dashboard
            </h2>
          </div>

          <div className="flex-1 flex flex-col justify-between">
            {/* Sidebar component is still here for desktop */}
            <Sidebar session={session} onClose={() => {}} />{" "}
            {/* onClose is no longer functional here */}
            {session && (
              <div className="mt-auto py-4 px-4 border-t border-gray-700 text-center">
                {/* User Name/Email */}

                <p className="font-semibold py-4 text-white text-base leading-tight">
                  <span className="text-sm text-gray-400 leading-tight">
                    Logged in as:
                  </span>{" "}
                  {session.user.name || session.user.email}
                </p>

                <ClientSignOutButton />
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto relative
                      md:ml-64 h-screen // Desktop margin-left and height
                      pt-[${mobileHeaderHeight}] md:pt-0 // Dynamic padding-top for mobile header
                      `}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
