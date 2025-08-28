// app/ClientSignOutButton.jsx
"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaSignOutAlt } from "react-icons/fa"; // Import logout icon

export default function ClientSignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
    router.push("/login"); // Redirect explicitly just in case
  };

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center cursor-pointer justify-center w-full text-left bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 ease-in-out group"
    >
      <FaSignOutAlt className="mr-2 group-hover:rotate-6 transition-transform" />
      Sign Out
    </button>
  );
}
