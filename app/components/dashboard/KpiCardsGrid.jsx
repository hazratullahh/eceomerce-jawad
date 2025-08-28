"use client";
// app/components/dashboard/KpiCardsGrid.jsx
import React from "react";
import KpiCard from "../KpiCard"; // Adjust path if KpiCard is elsewhere
import {
  FaUsers,
  FaDollarSign,
  FaMoneyBillWave,
  FaTasks,
} from "react-icons/fa";

export default function KpiCardsGrid({ kpis }) {
  if (!kpis) return null; // Defensive check

  // Function to calculate percentage of value relative to target
  const calculatePercentage = (value, target) => {
    if (!target || target === 0) return 0; // Avoid division by zero
    const percentage = (value / target) * 100;
    return Math.min(Math.round(percentage), 100); // Round and cap at 100%
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-3 bg-gray-900">
      <KpiCard
        title="Total Members"
        value={kpis.totalMembers?.value || 0}
        target={kpis.totalMembers?.target || 0}
        percentage={calculatePercentage(
          kpis.totalMembers?.value || 0,
          kpis.totalMembers?.target || 0
        )}
        icon={FaUsers}
        iconColor={kpis.totalMembers?.iconColor || "text-blue-400"}
        chartType="radialBar"
        chartData={[
          {
            name: "Members",
            value: kpis.totalMembers?.value || 0,
            fill: "#8884d8",
          },
        ]}
        unit={kpis.totalMembers?.unit || "Members"}
      />
      <KpiCard
        title="Amount Paid"
        value={kpis.totalRevenue?.value || 0}
        target={kpis.totalRevenue?.target || 0}
        percentage={calculatePercentage(
          kpis.totalRevenue?.value || 0,
          kpis.totalRevenue?.target || 0
        )}
        icon={FaDollarSign}
        iconColor={kpis.totalRevenue?.iconColor || "text-green-400"}
        chartType="radialBar"
        chartData={[
          {
            name: "Amount Paid",
            value: kpis.totalRevenue?.value || 0,
            fill: "#82ca9d",
          },
        ]}
        unit={kpis.totalRevenue?.unit || "$"}
      />
      <KpiCard
        title="Amount Due"
        value={kpis.totalAmountWillBePaid?.value || 0}
        target={kpis.totalAmountWillBePaid?.target || 0}
        percentage={calculatePercentage(
          kpis.totalAmountWillBePaid?.value || 0,
          kpis.totalAmountWillBePaid?.target || 0
        )}
        icon={FaMoneyBillWave}
        iconColor={kpis.totalAmountWillBePaid?.iconColor || "text-white"}
        chartType="radialBar"
        chartData={[
          {
            name: "Amount Due",
            value: kpis.totalAmountWillBePaid?.value || 0,
            fill: "#82ca9d",
          },
        ]}
        unit={kpis.totalAmountWillBePaid?.unit || "$"}
      />
      <KpiCard
        title="Active Referrals"
        value={kpis.activeReferrals?.value || 0}
        target={kpis.activeReferrals?.target || 0}
        percentage={calculatePercentage(
          kpis.activeReferrals?.value || 0,
          kpis.activeReferrals?.target || 0
        )}
        icon={FaTasks}
        iconColor={kpis.activeReferrals?.iconColor || "text-purple-400"}
        chartType="radialBar"
        chartData={[
          {
            name: "Active",
            value: kpis.activeReferrals?.value || 0,
            fill: "#9333ea",
          },
        ]}
        unit={kpis.activeReferrals?.unit || "Active"}
      />
    </div>
  );
}
