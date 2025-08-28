// app/components/dashboard/MonthlyReferralsChart.jsx
import React from "react";
import DashboardCharts from "../DashboardCharts"; // Adjust path if DashboardCharts is elsewhere
import { FaChartLine } from "react-icons/fa";

export default function MonthlyReferralsChart({ monthlyReferrals }) {
  return (
    <div className="lg:col-span-2 xl:col-span-2 bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700 h-80 flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
        <FaChartLine className="mr-2 text-blue-400" /> Monthly Referrals Trend
      </h3>
      <div className="flex-1">
        {monthlyReferrals && monthlyReferrals.length > 0 ? (
          <DashboardCharts
            type="bar"
            data={monthlyReferrals}
            dataKey="referrals"
            xAxisDataKey="name"
            barName="Referrals"
            color="#8884d8"
            unit=""
          />
        ) : (
          <p className="text-gray-400 text-center py-4">
            No referral data available for chart.
          </p>
        )}
      </div>
    </div>
  );
}
