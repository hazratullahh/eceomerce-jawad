// app/(dashboard)/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FaSpinner, FaExclamationTriangle } from "react-icons/fa";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import KpiCardsGrid from "../components/dashboard/KpiCardsGrid";
import MonthlyReferralsChart from "../components/dashboard/MonthlyReferralsChart";
import RecentActivityList from "../components/dashboard/RecentActivityList";
import AdminNavigation from "../components/dashboard/AdminNavigation";

export default function DashboardHomePage() {
  const { data: session, status } = useSession();
  const isLoadingSession = status === "loading";

  const [dashboardData, setDashboardData] = useState({
    kpis: {
      totalMembers: {
        value: 0,
        target: 0,
        unit: "Members",
        iconColor: "text-blue-400",
      },
      totalRevenue: {
        value: 0,
        target: 0,
        unit: "$",
        iconColor: "text-green-400",
      },
      totalAmountWillBePaid: {
        value: 0,
        target: 0,
        unit: "$",
        iconColor: "text-red-400",
      },
      activeReferrals: {
        value: 0,
        target: 0,
        unit: "Active",
        iconColor: "text-purple-400",
      },
    },
    monthlyReferrals: [],
    recentActivities: [],
  });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errorData, setErrorData] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoadingData(true);
    setErrorData(null);
    try {
      const res = await fetch("/api/dashboard-data");
      if (!res.ok) {
        let errorMessage = `HTTP error! Status: ${res.status}`;
        try {
          const errorJson = await res.json();
          errorMessage = errorJson.message || errorMessage;
        } catch (jsonParseError) {
          console.warn(
            "Could not parse error response as JSON:",
            jsonParseError
          );
        }
        throw new Error(errorMessage);
      }
      const data = await res.json();
      setDashboardData(data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setErrorData(
        error.message ||
          "Failed to load dashboard data. Please try again later."
      );
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status, fetchDashboardData]);

  if (isLoadingSession) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 p-4">
        <FaSpinner className="animate-spin text-blue-500 text-4xl mb-4" />
        <p className="text-white text-xl">Loading user session...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 p-4 text-white">
        <FaExclamationTriangle className="text-yellow-500 text-6xl mb-4" />
        <p className="text-xl mb-4 text-center">
          You are not logged in or your session has expired.
        </p>
        <Link
          href="/login"
          className="text-blue-400 hover:underline text-lg font-medium"
        >
          Go to Login Page
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-4 space-y-4 min-h-full bg-gray-900 text-white">
      <DashboardHeader session={session} />

      {isLoadingData ? (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)]">
          <FaSpinner className="animate-spin text-blue-500 text-5xl mb-4" />
          <p className="text-white text-xl">Fetching dashboard data...</p>
        </div>
      ) : errorData ? (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] text-green-400">
          <FaExclamationTriangle className="text-6xl mb-4" />
          <p className="text-xl font-semibold mb-2">Error Loading Dashboard</p>
          <p className="text-lg text-center max-w-md">{errorData}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <KpiCardsGrid kpis={dashboardData.kpis} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <MonthlyReferralsChart
              monthlyReferrals={dashboardData.monthlyReferrals}
            />
            <RecentActivityList
              recentActivities={dashboardData.recentActivities}
            />
          </div>

          {/* <AdminNavigation userRole={session?.user?.role} /> */}
        </>
      )}
    </div>
  );
}
