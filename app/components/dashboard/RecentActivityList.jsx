// app/components/dashboard/RecentActivityList.jsx
import React from "react";
import { FaClipboardList } from "react-icons/fa";

export default function RecentActivityList({ recentActivities }) {
  return (
    <div className="lg:col-span-1 xl:col-span-2 bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700 h-80 flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
        <FaClipboardList className="mr-2 text-orange-400" /> Recent Activity
      </h3>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {recentActivities && recentActivities.length > 0 ? (
          <ul className="space-y-2">
            {recentActivities.map((activity) => (
              <li
                key={activity.id}
                className="bg-gray-700 p-2 rounded-lg flex justify-between items-center text-xs"
              >
                <div>
                  <p className="font-semibold text-white">{activity.type}</p>
                  <p className="text-gray-300">{activity.description}</p>
                </div>
                <span className="text-gray-400 text-xxs">
                  {new Date(activity.date).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-center py-2 text-sm">
            No recent activity.
          </p>
        )}
      </div>
    </div>
  );
}
