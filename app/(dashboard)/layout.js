// app/(dashboard)/layout.js
import DashboardLayout from "../components/DashboardLayout";

// This layout will apply to all pages within the (dashboard) route group
export default function DashboardGroupRootLayout({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
