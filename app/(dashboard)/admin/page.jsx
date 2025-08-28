// app/admin/page.jsx
import { getServerSession } from "next-auth"; // <-- CORRECT IMPORT for server components
import { authOptions } from "@/lib/auth"; // Import your authOptions
import Link from "next/link";
import { redirect } from "next/navigation";
import ClientSignOutButton from "../../ClientSignOutButton"; // <-- Import your client signOut button

export default async function AdminDashboardPage() {
  // Correctly get the session in a Server Component
  const session = await getServerSession(authOptions); // <-- CORRECT USAGE

  // Redirection is also handled by middleware, but good to have here too
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/login"); // Redirect non-admins or unauthenticated users
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      <p className="text-lg mb-6">
        Welcome, Admin {session.user.name || session.user.email}!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/users">
          <div className="bg-indigo-700 hover:bg-indigo-800 p-6 rounded-lg shadow-md text-center cursor-pointer">
            <h2 className="text-2xl font-semibold">Manage Users</h2>
            <p className="mt-2 text-gray-300">
              Add, edit, delete user accounts.
            </p>
          </div>
        </Link>
        <Link href="/admin/customers">
          <div className="bg-teal-700 hover:bg-teal-800 p-6 rounded-lg shadow-md text-center cursor-pointer">
            <h2 className="text-2xl font-semibold">Manage Customers</h2>
            <p className="mt-2 text-gray-300">
              Track customer payments and referrals.
            </p>
          </div>
        </Link>
      </div>

      {/* Use the dedicated client component for the Sign Out button */}
      <div className="mt-10">
        <ClientSignOutButton />
      </div>
    </div>
  );
}
