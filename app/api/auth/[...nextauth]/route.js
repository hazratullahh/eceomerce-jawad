export const dynamic = "force-dynamic";
// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // Import your authOptions

const handler = NextAuth(authOptions);

// Export the GET and POST handlers for the App Router
export { handler as GET, handler as POST };
