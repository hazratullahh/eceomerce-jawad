// app/components/DashboardCharts.jsx
"use client";

import React from "react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Text,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

// Custom Label for RadialBarChart to show percentage
const CustomRadialLabel = ({
  cx,
  cy,
  outerRadius,
  value,
  target,
  unit = "",
}) => {
  const percentage = target > 0 ? ((value / target) * 100).toFixed(0) : 0;
  return (
    <Text
      x={cx}
      y={cy}
      textAnchor="middle"
      dominantBaseline="middle"
      className="text-white font-bold"
      style={{ fontSize: "1rem" }}
    >
      {`${percentage}%`}
    </Text>
  );
};

export default function DashboardCharts({
  type,
  data, // This will be the full data array for Recharts
  target, // Used for RadialBarChart percentage calc
  current, // Used for RadialBarChart percentage calc
  color, // Main color for the chart element
  dataKey, // Key for the bar/line (e.g., 'value', 'amount')
  xAxisDataKey, // Key for X-axis (e.g., 'name', 'month')
  barName, // Name for the Bar (for tooltip/legend)
  unit, // Unit for labels/tooltips
}) {
  if (type === "radialBar") {
    const chartData = [
      {
        name: data[0]?.name || "Progress",
        value: current,
        fill: color,
        max: target,
      },
    ];

    return (
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="70%"
          outerRadius="90%"
          data={chartData}
          startAngle={90}
          endAngle={-270}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <RadialBar
            minAngle={15}
            background={{ fill: "#333", stroke: "none" }}
            clockWise
            dataKey="value"
            cornerRadius={10}
          />
          <CustomRadialLabel
            cx="50%" // Center dynamically
            cy="50%" // Center dynamically
            outerRadius={90}
            value={current}
            target={target}
            unit={unit}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    );
  } else if (type === "bar") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
        >
          <XAxis dataKey={xAxisDataKey} stroke="#9ca3af" /> {/* Gray text */}
          <YAxis
            stroke="#9ca3af"
            tickFormatter={(tick) => `${unit}${tick.toLocaleString()}`}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.1)" }}
            contentStyle={{
              backgroundColor: "#374151",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
            }}
            labelStyle={{ color: "#9ca3af" }}
            formatter={(value) => `${unit}${value.toLocaleString()}`}
          />
          <Legend wrapperStyle={{ color: "#9ca3af", paddingTop: "10px" }} />
          <Bar
            dataKey={dataKey}
            fill={color}
            name={barName}
            radius={[4, 4, 0, 0]}
          />{" "}
          {/* Rounded top corners */}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <div className="text-gray-400 text-center">Chart type not supported.</div>
  );
}
