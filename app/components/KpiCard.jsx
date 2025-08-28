"use client";

import React from "react";
// Import Recharts components needed for the circular progress bar
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from "recharts";

// Helper function to calculate percentage, ensuring no division by zero
const calculatePercentage = (value, target) => {
  if (target === 0) return 0;
  return Math.min(100, Math.round((value / target) * 100));
};

export default function KpiCard({
  title,
  value,
  target,
  icon: Icon,
  iconColor = "text-gray-400", // Default icon color
  chartType,
  chartData, // This data is passed to the KpiCard from page.js
  unit,
}) {
  const percentage = calculatePercentage(value, target);

  // Format value and target for display
  const displayValue =
    unit === "$"
      ? `${unit}${value.toLocaleString()}`
      : `${value.toLocaleString()} ${unit}`;
  const displayTarget =
    unit === "$"
      ? `${unit}${target.toLocaleString()}`
      : `${target.toLocaleString()} ${unit}`;

  // Data for the RadialBarChart.
  // We explicitly create this based on the percentage and a single color from chartData.
  const radialChartDisplayData = [
    {
      name: title,
      value: percentage, // The RadialBar's value is usually a percentage (0-100)
      // Use the fill color provided in chartData (e.g., from page.js) or a fallback
      fill: chartData && chartData.length > 0 ? chartData[0].fill : "#8884d8",
    },
  ];

  return (
    <div className="bg-gray-800 p-2 rounded-xl shadow-xl flex flex-col items-center text-center border border-gray-700 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex items-center justify-center">
        {Icon && <Icon className={`text-4xl mr-3 ${iconColor}`} />}
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>

      <div className="w-full h-24 mb-1">
        {/* Conditional rendering for the RadialBarChart */}
        {chartType === "radialBar" ? (
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%" // Center X position
              cy="50%" // Center Y position
              innerRadius="60%" // Slightly smaller inner radius
              outerRadius="85%" // Adjusted outer radius
              barSize={8} // Slightly smaller bar
              data={radialChartDisplayData} // Use our prepared percentage data
              startAngle={90} // Start from the bottom (90 degrees)
              endAngle={90 + (percentage / 100) * 360} // End angle based on percentage
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]} // The domain should be 0-100 for percentage
                angleAxisId={0} // Associate with angleAxisId
                tick={false} // Hide axis ticks
              />
              <RadialBar
                background={{ fill: "#4b5563" }} // Darker gray background for contrast
                dataKey="value" // Key from radialChartDisplayData (our percentage)
                cornerRadius={5} // Rounded corners
                angleAxisId={0} // Associate with angleAxisId
              />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-bold text-white text-lg"
              >
                <tspan fill="white">{percentage}</tspan>
                <tspan fill="white" dy="12" fontSize="12">
                  %
                </tspan>
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-4xl font-extrabold text-white mt-1">
            {displayValue}
          </p>
        )}
      </div>

      <div className="w-full text-xs text-gray-300 space-y-1">
        <p className="flex justify-between">
          <span>Achieved:</span>
          <span className="font-semibold text-white">{displayValue}</span>
        </p>
        <p className="flex justify-between">
          <span>Target:</span>
          <span className="font-semibold text-white">{displayTarget}</span>
        </p>
      </div>
    </div>
  );
}
